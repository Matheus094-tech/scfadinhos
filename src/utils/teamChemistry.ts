import { DraftSlot, Formation, Player, TeamStats } from '../types/game';

function weightedAvg(players: Player[], statFn: (p: Player) => number, overallWeight = 0.6, statWeight = 0.4): number {
  if (players.length === 0) return 0;
  const total = players.reduce((sum, p) => sum + p.overall * overallWeight + statFn(p) * statWeight, 0);
  return Math.round(total / players.length);
}

export function calculateTeamStats(draftSlots: DraftSlot[], _formation: Formation): TeamStats {
  const players = draftSlots.map((s) => s.player).filter(Boolean) as Player[];
  if (players.length === 0) {
    throw new Error('No players in draft slots');
  }

  // Overall
  const overall = Math.round(players.reduce((s, p) => s + p.overall, 0) / players.length);

  // Offensive force — attackers
  const attackers = players.filter((p) => ['ST', 'RW', 'LW', 'CAM'].includes(p.position));
  const offensiveForce = attackers.length > 0
    ? weightedAvg(attackers, (p) => p.attack)
    : Math.round(players.reduce((s, p) => s + p.attack, 0) / players.length);

  // Defensive force — GK + defenders
  const defenders = players.filter((p) => ['GK', 'CB', 'RB', 'LB'].includes(p.position));
  const defensiveForce = defenders.length > 0
    ? weightedAvg(defenders, (p) => p.defense)
    : Math.round(players.reduce((s, p) => s + p.defense, 0) / players.length);

  // Midfield control — midfielders
  const midfielders = players.filter((p) => ['CM', 'CDM', 'RM', 'LM'].includes(p.position));
  const midfieldControl = midfielders.length > 0
    ? weightedAvg(midfielders, (p) => p.technique)
    : Math.round(players.reduce((s, p) => s + p.technique, 0) / players.length);

  // European experience
  const europeanExperience = Math.round(
    players.reduce((s, p) => s + p.championsWeight, 0) / players.length * 10
  );

  // Chemistry
  let chemistry = 50;

  // Same club pairs
  const clubCounts: Record<string, number> = {};
  const nationalityCounts: Record<string, number> = {};
  const seasonNumbers: number[] = [];

  for (const p of players) {
    clubCounts[p.club] = (clubCounts[p.club] || 0) + 1;
    nationalityCounts[p.nationality] = (nationalityCounts[p.nationality] || 0) + 1;
    const year = parseInt(p.season.split('/')[0]);
    if (!isNaN(year)) seasonNumbers.push(year);
  }

  // Same club pairs bonus
  for (const count of Object.values(clubCounts)) {
    if (count >= 2) {
      chemistry += (count - 1) * 4;
    }
  }

  // Same nationality pairs bonus
  for (const count of Object.values(nationalityCounts)) {
    if (count >= 2) {
      chemistry += (count - 1) * 3;
    }
  }

  // Era compatibility bonus (within 5 years)
  if (seasonNumbers.length >= 2) {
    const minYear = Math.min(...seasonNumbers);
    const maxYear = Math.max(...seasonNumbers);
    if (maxYear - minYear <= 5) {
      chemistry += 6;
    } else if (maxYear - minYear <= 10) {
      chemistry += 3;
    }
  }

  // Strong GK bonus
  const gk = players.find((p) => p.position === 'GK');
  if (gk && gk.overall >= 88) {
    chemistry += 8;
  }

  // Strong defense bonus
  const cbs = players.filter((p) => p.position === 'CB');
  if (cbs.length >= 2) {
    const avgCb = cbs.reduce((s, p) => s + p.overall, 0) / cbs.length;
    if (avgCb >= 86) {
      chemistry += 8;
    }
  }

  // Balanced squad bonus
  const positions = ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'RW', 'LW', 'ST'] as const;
  const hasPoorPosition = positions.some((pos) => {
    const posPlayers = players.filter((p) => p.position === pos);
    if (posPlayers.length === 0) return false;
    const avg = posPlayers.reduce((s, p) => s + p.overall, 0) / posPlayers.length;
    return avg < 78;
  });
  if (!hasPoorPosition) {
    chemistry += 8;
  }

  chemistry = Math.min(100, Math.max(0, chemistry));

  // Star player: highest (overall * championsWeight / 10)
  const starPlayer = players.reduce((best, p) => {
    const score = p.overall * (p.championsWeight / 10);
    const bestScore = best.overall * (best.championsWeight / 10);
    return score > bestScore ? p : best;
  });

  // Determine strength and weakness
  const areas = {
    'Ataque': offensiveForce,
    'Defesa': defensiveForce,
    'Meio-campo': midfieldControl,
    'Experiência Europeia': europeanExperience,
  };

  const sorted = Object.entries(areas).sort(([, a], [, b]) => b - a);
  const strength = sorted[0][0];
  const weakness = sorted[sorted.length - 1][0];

  return {
    overall,
    offensiveForce,
    defensiveForce,
    midfieldControl,
    europeanExperience,
    chemistry,
    starPlayer,
    strength,
    weakness,
  };
}
