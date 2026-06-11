import React, { useState } from 'react';
import { CampaignStats, MatchResult } from '../types/game';

interface SimulationScreenProps {
  campaignStats: CampaignStats;
  onFinish: () => void;
}

type Speed = 1 | 2 | 4;

function resultBadge(home: number, away: number) {
  if (home > away) return { label: 'V', cls: 'bg-green-900 text-green-300' };
  if (home < away) return { label: 'D', cls: 'bg-red-900 text-red-300' };
  return { label: 'E', cls: 'bg-yellow-900 text-yellow-300' };
}

function stageIcon(round: string) {
  if (round.includes('Final') && !round.includes('Quartas') && !round.includes('Semi')) return '🏆';
  if (round.includes('Semi')) return '⚔️';
  if (round.includes('Quartas')) return '⚡';
  if (round.includes('Oitavas')) return '🎯';
  return '⚽';
}

const STAGE_COUNTS = [6, 2, 2, 2, 1];

// Compact collapsible match row (past matches)
const MatchRow: React.FC<{ match: MatchResult }> = ({ match }) => {
  const [open, setOpen] = useState(false);
  const { label, cls } = resultBadge(match.homeScore, match.awayScore);
  const scoreColor =
    match.homeScore > match.awayScore
      ? 'text-green-400'
      : match.homeScore < match.awayScore
      ? 'text-red-400'
      : 'text-yellow-400';

  return (
    <div className="border-b border-night-700 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-night-800/50 transition-colors"
      >
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${cls}`}>{label}</span>
        <span className="text-night-500 text-xs flex-shrink-0">{stageIcon(match.round)}</span>
        <span className={`font-black text-sm flex-shrink-0 ${scoreColor}`}>
          {match.homeScore}–{match.awayScore}
        </span>
        <span className="text-gray-400 text-xs truncate flex-1">vs {match.opponent}</span>
        <span className="text-night-600 text-[10px] flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-2 bg-night-800/30">
          <p className="text-night-500 text-[11px]">{match.round} · {match.opponentSeason}</p>
          {match.scorers.length > 0 && (
            <p className="text-gray-400 text-[11px] mt-0.5">⚽ {match.scorers.join(', ')}</p>
          )}
          <p className="text-night-500 text-[11px] mt-0.5 italic leading-snug">{match.summary}</p>
        </div>
      )}
    </div>
  );
};

const SimulationScreen: React.FC<SimulationScreenProps> = ({ campaignStats, onFinish }) => {
  const [visibleCount, setVisibleCount] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const total = campaignStats.matches.length;
  const showNext = () => setVisibleCount((c) => Math.min(c + 1, total));
  const showAll = () => setVisibleCount(total);

  const allVisible = visibleCount >= total;
  const isEliminated = allVisible && !['champion', 'final'].includes(campaignStats.phase);
  const isFinalLoss = allVisible && campaignStats.phase === 'final';
  const isChampion = allVisible && campaignStats.phase === 'champion';

  React.useEffect(() => {
    if (!autoPlay || allVisible) { setAutoPlay(false); return; }
    const delay = Math.round(1400 / speed);
    const t = setTimeout(showNext, delay);
    return () => clearTimeout(t);
  }, [autoPlay, visibleCount, allVisible, speed]);

  // Stage progress
  let cumulativeIdx = 0;
  const stageLabels = ['Grupos', 'Oitavas', 'Quartas', 'Semis', 'Final'];
  const stageState = stageLabels.map((label, i) => {
    const start = cumulativeIdx;
    cumulativeIdx += STAGE_COUNTS[i];
    const reached = visibleCount > start;
    const passed = visibleCount >= cumulativeIdx;
    return { label, reached, passed };
  });

  const currentMatch: MatchResult | null = campaignStats.matches[visibleCount - 1] ?? null;
  const pastMatches = campaignStats.matches.slice(0, visibleCount - 1).reverse();

  const cycleSpeed = () => {
    setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1));
  };

  return (
    <div className="min-h-screen bg-night-900 flex flex-col">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-10 bg-night-900/95 backdrop-blur-sm border-b border-night-700">

        {/* Stage pills */}
        <div className="flex items-center justify-center gap-1 px-3 py-1.5 border-b border-night-800">
          {stageState.map(({ label, reached, passed }, i) => (
            <React.Fragment key={label}>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                passed ? 'bg-gold-600 text-night-900' : reached ? 'bg-sapphire-700 text-white' : 'bg-night-700 text-night-500'
              }`}>{label}</span>
              {i < 4 && <span className="text-night-700 text-xs">›</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Current match */}
        {currentMatch && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base leading-none">{stageIcon(currentMatch.round)}</span>
              <span className="text-night-500 text-[11px] font-semibold uppercase tracking-widest flex-1 truncate">
                {currentMatch.round}
              </span>
              <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${resultBadge(currentMatch.homeScore, currentMatch.awayScore).cls}`}>
                {resultBadge(currentMatch.homeScore, currentMatch.awayScore).label}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-white font-bold text-sm flex-1 truncate">Seu Time</span>
              <span className={`text-2xl font-black mx-1 flex-shrink-0 ${
                currentMatch.homeScore > currentMatch.awayScore ? 'text-green-400' :
                currentMatch.homeScore < currentMatch.awayScore ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {currentMatch.homeScore} – {currentMatch.awayScore}
              </span>
              <span className="text-gray-300 font-semibold text-sm flex-1 text-right truncate">{currentMatch.opponent}</span>
            </div>

            {currentMatch.scorers.length > 0 && (
              <p className="text-night-500 text-xs mt-0.5">⚽ {currentMatch.scorers.join(', ')}</p>
            )}
          </div>
        )}

        {/* End-state banners */}
        {isEliminated && (
          <div className="mx-3 mb-2 rounded-lg border border-red-800 bg-red-900/20 px-3 py-1.5 text-center">
            <span className="text-red-400 font-black text-sm">😢 Eliminado — {campaignStats.finalPhrase}</span>
          </div>
        )}
        {isFinalLoss && (
          <div className="mx-3 mb-2 rounded-lg border border-gray-600 bg-gray-900/20 px-3 py-1.5 text-center">
            <span className="text-gray-300 font-black text-sm">🥈 Vice-Campeão — {campaignStats.finalPhrase}</span>
          </div>
        )}
        {isChampion && (
          <div className="mx-3 mb-2 rounded-lg border border-gold-500 bg-gold-900/20 px-3 py-1.5 text-center animate-bounce-in">
            <span className="text-gradient font-black text-sm">🏆 CAMPEÃO DA EUROPA! — {campaignStats.finalPhrase}</span>
          </div>
        )}

        {/* Controls: next / auto / speed / skip-all */}
        <div className="flex gap-1.5 px-3 pb-2">
          {!allVisible ? (
            <>
              <button
                onClick={showNext}
                className="btn-gold flex-1 py-2 text-sm"
              >
                ⚽ Próximo
              </button>
              <button
                onClick={() => setAutoPlay((v) => !v)}
                className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                  autoPlay
                    ? 'border-sapphire-500 bg-sapphire-700/30 text-sapphire-300'
                    : 'border-night-600 text-gray-400 hover:bg-night-800'
                }`}
              >
                {autoPlay ? '⏸' : '▶'}
              </button>
              <button
                onClick={cycleSpeed}
                className="px-2.5 py-2 rounded-lg text-xs font-black border border-night-600 text-night-400 hover:bg-night-800 tabular-nums min-w-[36px]"
              >
                {speed}x
              </button>
              <button onClick={showAll} className="px-3 py-2 rounded-lg text-sm border border-night-600 text-gray-500 hover:bg-night-800">
                ⏩
              </button>
            </>
          ) : (
            <button onClick={onFinish} className="btn-gold w-full py-2 text-sm">
              📊 Ver resultado final
            </button>
          )}
        </div>

        {!allVisible && (
          <p className="text-night-600 text-[10px] text-center pb-1.5 tabular-nums">
            {visibleCount}/{total} partidas
          </p>
        )}
      </div>

      {/* ── MATCH HISTORY (scrollable) ── */}
      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
        {/* Summary of current match */}
        {currentMatch && (
          <div className="border-b border-night-700 px-3 py-2 bg-night-800/20">
            <p className="text-night-500 text-[11px] font-semibold mb-0.5">{currentMatch.opponentSeason}</p>
            <p className="text-gray-400 text-[11px] italic leading-snug">{currentMatch.summary}</p>
          </div>
        )}

        {/* Past matches as compact rows */}
        {pastMatches.length > 0 && (
          <div>
            <p className="text-night-600 text-[10px] uppercase tracking-widest px-3 py-1.5 border-b border-night-800">
              Partidas anteriores
            </p>
            <div className="divide-y divide-night-800">
              {pastMatches.map((match, i) => (
                <MatchRow key={visibleCount - 2 - i} match={match} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationScreen;
