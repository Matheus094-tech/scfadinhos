import React, { useState } from 'react';
import { CampaignStats, MatchResult } from '../types/game';

interface SimulationScreenProps {
  campaignStats: CampaignStats;
  onFinish: () => void;
}

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

const STAGE_COUNTS = [6, 2, 2, 2, 1]; // groups, r16, qf, sf, final

// Compact match history row (past matches)
const MatchRow: React.FC<{ match: MatchResult }> = ({ match }) => {
  const [open, setOpen] = useState(false);
  const { label, cls } = resultBadge(match.homeScore, match.awayScore);

  return (
    <div className="border border-night-700 rounded-xl overflow-hidden bg-night-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-night-700 transition-colors"
      >
        <span className={`text-xs font-black px-1.5 py-0.5 rounded flex-shrink-0 ${cls}`}>{label}</span>
        <span className="text-gray-500 text-xs flex-shrink-0">{stageIcon(match.round)}</span>
        <span className="text-gray-400 text-xs flex-shrink-0 hidden sm:inline">{match.round}</span>
        <span className={`font-black text-sm flex-shrink-0 ${match.homeScore > match.awayScore ? 'text-green-400' : match.homeScore < match.awayScore ? 'text-red-400' : 'text-yellow-400'}`}>
          {match.homeScore}–{match.awayScore}
        </span>
        <span className="text-gray-400 text-xs truncate flex-1">vs {match.opponent}</span>
        <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-2.5 border-t border-night-700">
          <p className="text-gray-500 text-xs mt-1.5">{match.opponentSeason}</p>
          {match.scorers.length > 0 && (
            <p className="text-gray-400 text-xs mt-1">⚽ {match.scorers.join(', ')}</p>
          )}
          <p className="text-gray-500 text-xs mt-1.5 italic leading-snug">{match.summary}</p>
        </div>
      )}
    </div>
  );
};

const SimulationScreen: React.FC<SimulationScreenProps> = ({ campaignStats, onFinish }) => {
  const [visibleCount, setVisibleCount] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);

  const showNext = () => setVisibleCount((c) => Math.min(c + 1, campaignStats.matches.length));
  const showAll = () => setVisibleCount(campaignStats.matches.length);

  const allVisible = visibleCount >= campaignStats.matches.length;
  const isEliminated = allVisible && !['champion', 'final'].includes(campaignStats.phase);
  const isFinalLoss = allVisible && campaignStats.phase === 'final';
  const isChampion = allVisible && campaignStats.phase === 'champion';

  React.useEffect(() => {
    if (!autoPlay || allVisible) { setAutoPlay(false); return; }
    const t = setTimeout(showNext, 1400);
    return () => clearTimeout(t);
  }, [autoPlay, visibleCount, allVisible]);

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

  // Current match to highlight at top
  const currentMatch: MatchResult | null = campaignStats.matches[visibleCount - 1] ?? null;
  const pastMatches = campaignStats.matches.slice(0, visibleCount - 1).reverse();

  return (
    <div className="min-h-screen bg-night-900 flex flex-col">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-10 bg-night-900/95 backdrop-blur-sm border-b border-night-700">

        {/* Stage pills */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 border-b border-night-800">
          {stageState.map(({ label, reached, passed }, i) => (
            <React.Fragment key={label}>
              <span className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                passed ? 'bg-gold-600 text-night-900' : reached ? 'bg-sapphire-700 text-white' : 'bg-night-700 text-gray-600'
              }`}>{label}</span>
              {i < 4 && <span className="text-night-600 text-xs">›</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Current match */}
        {currentMatch && (
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg leading-none">{stageIcon(currentMatch.round)}</span>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{currentMatch.round}</span>
              <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded ${resultBadge(currentMatch.homeScore, currentMatch.awayScore).cls}`}>
                {resultBadge(currentMatch.homeScore, currentMatch.awayScore).label}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-white font-bold text-sm">Seu Time</span>
              <span className={`text-3xl font-black mx-2 ${currentMatch.homeScore > currentMatch.awayScore ? 'text-green-400' : currentMatch.homeScore < currentMatch.awayScore ? 'text-red-400' : 'text-yellow-400'}`}>
                {currentMatch.homeScore} – {currentMatch.awayScore}
              </span>
              <span className="text-gray-300 font-semibold text-sm text-right">{currentMatch.opponent}</span>
            </div>

            {currentMatch.scorers.length > 0 && (
              <p className="text-gray-500 text-xs mt-0.5">⚽ {currentMatch.scorers.join(', ')}</p>
            )}
          </div>
        )}

        {/* End-state banners */}
        {isEliminated && (
          <div className="mx-3 mb-2 rounded-xl border border-red-800 bg-red-900/20 px-3 py-2 text-center">
            <span className="text-red-400 font-black text-sm">😢 Eliminado — {campaignStats.finalPhrase}</span>
          </div>
        )}
        {isFinalLoss && (
          <div className="mx-3 mb-2 rounded-xl border border-gray-600 bg-gray-900/20 px-3 py-2 text-center">
            <span className="text-gray-300 font-black text-sm">🥈 Vice-Campeão — {campaignStats.finalPhrase}</span>
          </div>
        )}
        {isChampion && (
          <div className="mx-3 mb-2 rounded-xl border border-gold-500 bg-gold-900/20 px-3 py-2 text-center animate-bounce-in">
            <span className="text-gradient font-black text-sm">🏆 CAMPEÃO DA EUROPA! — {campaignStats.finalPhrase}</span>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-2 px-3 pb-2.5">
          {!allVisible ? (
            <>
              <button onClick={showNext} className="btn-gold flex-1 py-2.5 text-sm">
                ⚽ Próximo jogo
              </button>
              <button
                onClick={() => setAutoPlay(true)}
                disabled={autoPlay}
                className="btn-outline px-3 py-2.5 text-sm"
              >
                {autoPlay ? '⏳' : '▶'}
              </button>
              <button onClick={showAll} className="btn-outline px-3 py-2.5 text-sm">⏩</button>
            </>
          ) : (
            <button onClick={onFinish} className="btn-gold w-full py-2.5 text-sm">
              📊 Ver resultado final
            </button>
          )}
        </div>

        {!allVisible && (
          <p className="text-gray-600 text-xs text-center pb-1.5">
            {visibleCount}/{campaignStats.matches.length} partidas
          </p>
        )}
      </div>

      {/* ── MATCH HISTORY (scrollable) ── */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 max-w-2xl mx-auto w-full">
        {/* Summary line for current match */}
        {currentMatch && (
          <div className="rounded-xl border border-night-600 bg-night-800 px-3 py-2">
            <p className="text-gray-500 text-xs mb-1 font-semibold">Resumo do jogo atual</p>
            <p className="text-gray-400 text-xs italic leading-snug">{currentMatch.summary}</p>
          </div>
        )}

        {pastMatches.length > 0 && (
          <>
            <p className="text-gray-600 text-xs uppercase tracking-widest px-1 pt-1">Partidas anteriores</p>
            {pastMatches.map((match, i) => (
              <MatchRow key={visibleCount - 2 - i} match={match} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SimulationScreen;
