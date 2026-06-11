import {
  CampaignStats,
  Difficulty,
  DraftSlot,
  GroupEntry,
  MatchResult,
  Phase,
  Player,
  Squad,
  TeamStats,
} from '../types/game';

// ─── helpers ────────────────────────────────────────────────────────────────

function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

function ri(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedPick(players: Player[]): Player {
  const total = players.reduce((s, p) => s + p.attack, 0);
  let r = Math.random() * total;
  for (const p of players) { r -= p.attack; if (r <= 0) return p; }
  return players[players.length - 1];
}

function getDiffMod(d: Difficulty): number {
  return d === 'normal' ? 1.0 : d === 'hard' ? 0.88 : 0.76;
}

// ─── opponent selection ──────────────────────────────────────────────────────

function pickOpponent(
  all: Squad[],
  used: string[],
  minR: number,
  maxR: number,
): Squad {
  const pool = all.filter(s => !used.includes(s.id) && s.overallRating >= minR && s.overallRating <= maxR);
  if (pool.length > 0) return pool[ri(0, pool.length - 1)];
  // fallback: any unused
  const fallback = all.filter(s => !used.includes(s.id));
  if (fallback.length > 0) return fallback[ri(0, fallback.length - 1)];
  return all[ri(0, all.length - 1)];
}

function groupOpponentRanges(d: Difficulty): { min: number; max: number }[] {
  if (d === 'normal')    return [{ min: 75, max: 85 }, { min: 82, max: 90 }, { min: 75, max: 83 }];
  if (d === 'hard')      return [{ min: 83, max: 91 }, { min: 86, max: 93 }, { min: 80, max: 88 }];
  /* legendary */        return [{ min: 88, max: 99 }, { min: 88, max: 99 }, { min: 83, max: 93 }];
}

function koRange(stage: string, d: Difficulty): { min: number; max: number } {
  const table: Record<string, Record<Difficulty, { min: number; max: number }>> = {
    round16:     { normal: { min: 78, max: 87 }, hard: { min: 83, max: 91 }, legendary: { min: 87, max: 95 } },
    quarterfinal:{ normal: { min: 83, max: 91 }, hard: { min: 87, max: 94 }, legendary: { min: 90, max: 99 } },
    semifinal:   { normal: { min: 86, max: 93 }, hard: { min: 90, max: 97 }, legendary: { min: 92, max: 99 } },
    final:       { normal: { min: 89, max: 97 }, hard: { min: 92, max: 99 }, legendary: { min: 94, max: 99 } },
  };
  return table[stage]?.[d] ?? { min: 80, max: 90 };
}

// ─── single match computation ─────────────────────────────────────────────────

interface MatchOut {
  result: MatchResult;
  uGoals: number;
  oGoals: number;
}

function computeMatch(
  teamPower: number,
  oppRating: number,
  diffMod: number,
  isAway: boolean,
  players: Player[],
  opp: Squad,
  label: string,
): MatchOut {
  const effectivePower = teamPower * diffMod - (isAway ? 5 : 0);
  const winP = clamp(0.08, 0.88, (effectivePower - oppRating) / 22 + 0.5);
  const r = Math.random();

  let uGoals: number;
  let oGoals: number;

  if (r < winP) {
    uGoals = ri(1, isAway ? 3 : 4);
    oGoals = ri(0, Math.max(0, uGoals - 1));
  } else if (r < winP + 0.18) {
    const g = ri(0, 2); uGoals = g; oGoals = g;
  } else {
    oGoals = ri(1, isAway ? 4 : 3);
    uGoals = ri(0, Math.max(0, oGoals - 1));
  }

  const atk = players.filter(p => ['ST', 'RW', 'LW', 'CAM', 'CM'].includes(p.position));
  const scorers: string[] = [];
  for (let i = 0; i < uGoals; i++) { if (atk.length) scorers.push(weightedPick(atk).name); }
  const highlight = atk.length ? weightedPick(atk).name : players[0].name;

  const diff = uGoals - oGoals;
  const summary =
    diff >= 2  ? 'Domínio absoluto. O time sufocou o adversário do começo ao fim.' :
    diff === 1 ? 'Resultado suado, mas a classe individual fez a diferença.' :
    diff === 0 ? 'Partida equilibrada. O adversário resistiu, o ponto é justo.' :
    diff === -1? 'Derrota sofrida. O adversário foi mais eficiente nas chances.' :
                 'Noite difícil. O adversário dominou e a diferença foi justa.';

  return {
    result: { round: label, opponent: opp.club, opponentSeason: opp.season, homeScore: uGoals, awayScore: oGoals, scorers, highlight, summary, isAway },
    uGoals,
    oGoals,
  };
}

// ─── two-leg tie ──────────────────────────────────────────────────────────────

interface TwoLegOut { leg1: MatchResult; leg2: MatchResult; advanced: boolean }

function twoLeg(
  teamPower: number,
  opp: Squad,
  stage: string,
  diffMod: number,
  players: Player[],
  teamStats: TeamStats,
): TwoLegOut {
  const stageLabel =
    stage === 'round16'      ? 'Oitavas de Final' :
    stage === 'quarterfinal' ? 'Quartas de Final' :
                               'Semifinal';

  const out1 = computeMatch(teamPower, opp.overallRating, diffMod, false, players, opp, `${stageLabel} — 1ª Mão`);
  const out2 = computeMatch(teamPower, opp.overallRating, diffMod, true,  players, opp, `${stageLabel} — 2ª Mão`);

  const uAgg = out1.uGoals + out2.uGoals;
  const oAgg = out1.oGoals + out2.oGoals;

  let advanced: boolean;
  if (uAgg !== oAgg) {
    advanced = uAgg > oAgg;
  } else {
    // away goals / penalties
    const penP = clamp(0.3, 0.7, 0.45 + (teamStats.overall - opp.overallRating) / 100);
    advanced = Math.random() < penP;
    const penNote = advanced
      ? ' Decidido nas penalidades — nervos de aço!'
      : ' Eliminados nas penalidades após empate no agregado.';
    out2.result.summary += penNote;
  }

  return { leg1: out1.result, leg2: out2.result, advanced };
}

// ─── hidden group match (for opponent table rows) ─────────────────────────────

function hiddenMatch(rA: number, rB: number): { gA: number; gB: number } {
  const diff = (rA - rB) / 20;
  const wP = clamp(0.15, 0.85, 0.5 + diff);
  const r = Math.random();
  if (r < wP - 0.1)        return { gA: ri(1, 3), gB: ri(0, 1) };
  else if (r < wP + 0.1)   { const g = ri(0, 2); return { gA: g, gB: g }; }
  else                      return { gA: ri(0, 1), gB: ri(1, 3) };
}

// ─── build final stats ────────────────────────────────────────────────────────

function buildStats(
  phase: Phase,
  matches: MatchResult[],
  wins: number, draws: number, losses: number,
  goalsFor: number, goalsAgainst: number,
  scorerCounts: Record<string, number>,
  teamStats: TeamStats,
  players: Player[],
  groupTable?: GroupEntry[],
): CampaignStats {
  let topScorer = teamStats.starPlayer.name;
  let topGoals = 0;
  for (const [name, g] of Object.entries(scorerCounts)) {
    if (g > topGoals) { topScorer = name; topGoals = g; }
  }

  const best = players.reduce((b, p) => {
    return p.overall * (p.championsWeight / 10) > b.overall * (b.championsWeight / 10) ? p : b;
  });

  const baseRating =
    phase === 'champion'     ? ri(90, 100) :
    phase === 'final'        ? ri(75, 89)  :
    phase === 'semifinal'    ? ri(65, 74)  :
    phase === 'quarterfinal' ? ri(55, 64)  :
    phase === 'round16'      ? ri(45, 54)  :
                               ri(30, 44);

  const cleanSheets = matches.filter(m => m.awayScore === 0).length;
  const gd = goalsFor - goalsAgainst;
  const bonus = (cleanSheets >= 3 ? 3 : 0) + (gd > 5 ? 3 : gd > 0 ? 1 : 0);
  const rating = Math.min(100, baseRating + bonus);

  const phrases: Record<Phase, string[]> = {
    champion: [
      'Uma campanha lendária para os livros de história. Este time entra no Olimpo do futebol europeu.',
      'Campeões da Europa! Uma jornada épica coroada com a maior conquista do futebol continental.',
      'A Champions foi pequena para esse XI. Dominaram a Europa do início ao fim.',
    ],
    final: [
      'Tão perto, mas tão longe. A final foi uma batalha digna de campeões — a sorte não sorriu desta vez.',
      'Um elenco estrelado que chegou até a final. Faltou apenas um gol para a eternidade.',
    ],
    semifinal: [
      'Uma semifinal de respeito. O time mostrou que pode competir com os maiores, mas faltou o último passo.',
      'Brilharam durante toda a campanha, mas as semis provaram ser o limite desta equipe histórica.',
    ],
    quarterfinal: [
      'As quartas de final provaram ser o limite. Uma campanha honrosa, mas o sonho terminou cedo.',
      'Faltou equilíbrio defensivo para superar as quartas. Talento havia — consistência, não.',
    ],
    round16: [
      'Eliminados nas oitavas. A fase de grupos prometia, mas o adversário nas oitavas era de outro nível.',
      'A fase inicial animou, mas o mata-mata expôs as limitações deste XI histórico.',
    ],
    groups: [
      'A fase de grupos foi cruel. Erros custaram caro e a eliminação precoce deixa um gosto amargo.',
      'Mesmo com nomes lendários, a saída na fase de grupos mostra que química importa tanto quanto talento.',
    ],
  };

  const pool = phrases[phase];
  const finalPhrase = pool[ri(0, pool.length - 1)];

  return { phase, matches, wins, draws, losses, goalsFor, goalsAgainst, topScorer, topScorerGoals: topGoals, bestPlayer: best.name, rating, finalPhrase, groupTable };
}

// ─── main export ──────────────────────────────────────────────────────────────

export function simulateCampaign(
  draftSlots: DraftSlot[],
  teamStats: TeamStats,
  difficulty: Difficulty,
  allSquads: Squad[],
): CampaignStats {
  const players = draftSlots.map(s => s.player).filter(Boolean) as Player[];
  const used: string[] = [];
  const matches: MatchResult[] = [];
  let wins = 0, draws = 0, losses = 0, gF = 0, gA = 0;
  const scorerCounts: Record<string, number> = {};

  const teamPower =
    teamStats.overall * 0.3 +
    teamStats.offensiveForce * 0.25 +
    teamStats.defensiveForce * 0.25 +
    teamStats.midfieldControl * 0.2;
  const diffMod = getDiffMod(difficulty);

  function addMatch(r: MatchResult) {
    matches.push(r);
    if (r.homeScore > r.awayScore) wins++;
    else if (r.homeScore === r.awayScore) draws++;
    else losses++;
    gF += r.homeScore;
    gA += r.awayScore;
    r.scorers.forEach(s => scorerCounts[s] = (scorerCounts[s] || 0) + 1);
  }

  function done(phase: Phase) {
    return buildStats(phase, matches, wins, draws, losses, gF, gA, scorerCounts, teamStats, players, groupTable);
  }

  // ── GROUP STAGE ──────────────────────────────────────────────────────────

  const groupOpponents: Squad[] = [];
  for (const { min, max } of groupOpponentRanges(difficulty)) {
    const opp = pickOpponent(allSquads, used, min, max);
    groupOpponents.push(opp);
    used.push(opp.id);
  }

  // User's results vs each group opponent
  const userEntry: GroupEntry = { teamName: 'Seu Time', teamSeason: '', wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, isUser: true };
  const oppData: { uG: number; oG: number; idx: number }[] = [];

  for (let i = 0; i < groupOpponents.length; i++) {
    const opp = groupOpponents[i];
    for (const isAway of [false, true]) {
      const label = `Fase de Grupos — vs ${opp.club} (${isAway ? 'fora' : 'casa'})`;
      const out = computeMatch(teamPower, opp.overallRating, diffMod, isAway, players, opp, label);
      addMatch(out.result);
      oppData.push({ uG: out.uGoals, oG: out.oGoals, idx: i });

      userEntry.goalsFor += out.uGoals;
      userEntry.goalsAgainst += out.oGoals;
      if (out.uGoals > out.oGoals)       { userEntry.wins++;  userEntry.points += 3; }
      else if (out.uGoals === out.oGoals) { userEntry.draws++; userEntry.points += 1; }
      else                                { userEntry.losses++; }
    }
  }

  // Build opponent entries (vs user + vs each other)
  const oppEntries: GroupEntry[] = groupOpponents.map(opp => ({
    teamName: opp.club, teamSeason: opp.season,
    wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, isUser: false,
  }));

  for (const { uG, oG, idx } of oppData) {
    const e = oppEntries[idx];
    e.goalsFor += oG; e.goalsAgainst += uG;
    if (oG > uG)       { e.wins++;  e.points += 3; }
    else if (oG === uG) { e.draws++; e.points += 1; }
    else                { e.losses++; }
  }

  for (let i = 0; i < groupOpponents.length; i++) {
    for (let j = i + 1; j < groupOpponents.length; j++) {
      for (const [h, a] of [[i, j], [j, i]] as [number, number][]) {
        const { gA: gH, gB: gAway } = hiddenMatch(groupOpponents[h].overallRating, groupOpponents[a].overallRating);
        oppEntries[h].goalsFor += gH;  oppEntries[h].goalsAgainst += gAway;
        oppEntries[a].goalsFor += gAway; oppEntries[a].goalsAgainst += gH;
        if (gH > gAway)       { oppEntries[h].wins++;  oppEntries[h].points += 3; oppEntries[a].losses++; }
        else if (gH === gAway) { oppEntries[h].draws++; oppEntries[h].points++;    oppEntries[a].draws++;  oppEntries[a].points++; }
        else                   { oppEntries[a].wins++;  oppEntries[a].points += 3; oppEntries[h].losses++; }
      }
    }
  }

  const groupTable: GroupEntry[] = [userEntry, ...oppEntries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdDiff = (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
    if (gdDiff !== 0) return gdDiff;
    return b.goalsFor - a.goalsFor;
  });

  const userPos = groupTable.findIndex(e => e.isUser);
  if (userPos > 1) return done('groups');

  // ── ROUND OF 16 ──────────────────────────────────────────────────────────

  {
    const opp = pickOpponent(allSquads, used, ...Object.values(koRange('round16', difficulty)) as [number, number]);
    used.push(opp.id);
    const { leg1, leg2, advanced } = twoLeg(teamPower, opp, 'round16', diffMod, players, teamStats);
    addMatch(leg1); addMatch(leg2);
    if (!advanced) return done('round16');
  }

  // ── QUARTERFINALS ────────────────────────────────────────────────────────

  {
    const opp = pickOpponent(allSquads, used, ...Object.values(koRange('quarterfinal', difficulty)) as [number, number]);
    used.push(opp.id);
    const { leg1, leg2, advanced } = twoLeg(teamPower, opp, 'quarterfinal', diffMod, players, teamStats);
    addMatch(leg1); addMatch(leg2);
    if (!advanced) return done('quarterfinal');
  }

  // ── SEMIFINALS ───────────────────────────────────────────────────────────

  {
    const opp = pickOpponent(allSquads, used, ...Object.values(koRange('semifinal', difficulty)) as [number, number]);
    used.push(opp.id);
    const { leg1, leg2, advanced } = twoLeg(teamPower, opp, 'semifinal', diffMod, players, teamStats);
    addMatch(leg1); addMatch(leg2);
    if (!advanced) return done('semifinal');
  }

  // ── FINAL (jogo único) ───────────────────────────────────────────────────

  {
    const opp = pickOpponent(allSquads, used, ...Object.values(koRange('final', difficulty)) as [number, number]);
    used.push(opp.id);
    const out = computeMatch(teamPower, opp.overallRating, diffMod, false, players, opp, 'Final');
    addMatch(out.result);

    if (out.uGoals > out.oGoals) return done('champion');
    if (out.uGoals < out.oGoals) return done('final');

    // Draw in final → penalties
    const penP = clamp(0.3, 0.7, 0.45 + (teamStats.overall - opp.overallRating) / 100);
    const won = Math.random() < penP;
    matches[matches.length - 1].summary += won
      ? ' Campeões nas penalidades! Uma noite para a eternidade!'
      : ' Nas penalidades, a fatalidade bateu à porta. Vice-campeões.';
    return done(won ? 'champion' : 'final');
  }
}
