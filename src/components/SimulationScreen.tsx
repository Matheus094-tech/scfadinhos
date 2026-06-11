import React, { useState } from 'react';
import { CampaignStats, MatchResult } from '../types/game';

interface SimulationScreenProps {
  campaignStats: CampaignStats;
  onFinish: () => void;
}

function getScoreColor(homeScore: number, awayScore: number): string {
  if (homeScore > awayScore) return 'text-green-400';
  if (homeScore < awayScore) return 'text-red-400';
  return 'text-yellow-400';
}

function getRoundStageIcon(round: string): string {
  if (round.includes('Final') && !round.includes('Quartas') && !round.includes('Semi')) return '🏆';
  if (round.includes('Semi')) return '⚔️';
  if (round.includes('Quartas')) return '⚡';
  if (round.includes('Oitavas')) return '🎯';
  return '⚽';
}

interface MatchCardProps {
  match: MatchResult;
  index: number;
  isVisible: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isVisible }) => {
  const won = match.homeScore > match.awayScore;
  const drew = match.homeScore === match.awayScore;
  const lost = match.homeScore < match.awayScore;

  return (
    <div
      className={`card p-4 transition-all duration-500 ${
        isVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'
      } ${lost ? 'border-red-800' : won ? 'border-green-800' : 'border-yellow-800'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getRoundStageIcon(match.round)}</span>
            <span className="text-gray-400 text-xs uppercase tracking-widest">{match.round}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">Seu Time</span>
            <span className={`text-2xl font-black ${getScoreColor(match.homeScore, match.awayScore)}`}>
              {match.homeScore} – {match.awayScore}
            </span>
            <span className="text-gray-400 text-sm font-semibold">
              {match.opponent}
            </span>
          </div>
          <span className="text-gray-500 text-xs">{match.opponentSeason}</span>
        </div>
        <div
          className={`px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
            won
              ? 'bg-green-900 text-green-300'
              : drew
              ? 'bg-yellow-900 text-yellow-300'
              : 'bg-red-900 text-red-300'
          }`}
        >
          {won ? 'VITÓRIA' : drew ? 'EMPATE' : 'DERROTA'}
        </div>
      </div>

      {match.scorers.length > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          ⚽ {match.scorers.join(', ')}
        </div>
      )}

      <p className="text-gray-500 text-xs mt-2 italic">{match.summary}</p>
    </div>
  );
};

const SimulationScreen: React.FC<SimulationScreenProps> = ({ campaignStats, onFinish }) => {
  const [visibleCount, setVisibleCount] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);

  const showNext = () => {
    setVisibleCount((c) => Math.min(c + 1, campaignStats.matches.length));
  };

  const showAll = () => {
    setVisibleCount(campaignStats.matches.length);
  };

  const allVisible = visibleCount >= campaignStats.matches.length;
  const isEliminated = allVisible && !['champion', 'final'].includes(campaignStats.phase);
  const isFinalLoss = allVisible && campaignStats.phase === 'final';

  // Auto-play effect
  React.useEffect(() => {
    if (!autoPlay) return;
    if (allVisible) {
      setAutoPlay(false);
      return;
    }
    const timer = setTimeout(showNext, 1500);
    return () => clearTimeout(timer);
  }, [autoPlay, visibleCount, allVisible]);

  return (
    <div className="min-h-screen bg-night-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-night-700">
        <h1 className="text-2xl font-black text-gradient text-center">Simulação da Campanha</h1>
        <p className="text-gray-400 text-sm text-center mt-1">Acompanhe sua jornada europeia</p>
      </div>

      {/* Stage progress */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-night-700 flex-wrap">
        {['Grupos', 'Oitavas', 'Quartas', 'Semis', 'Final'].map((stage, i) => {
          const stageMatches = [6, 2, 2, 2, 1];
          const cumulative = stageMatches.slice(0, i + 1).reduce((a, b) => a + b, 0);
          const reached = visibleCount >= cumulative - stageMatches[i] + 1;
          const passed = visibleCount >= cumulative;
          return (
            <div key={stage} className="flex items-center gap-1">
              <div
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  passed
                    ? 'bg-gold-600 text-night-900'
                    : reached
                    ? 'bg-sapphire-700 text-white'
                    : 'bg-night-700 text-gray-500'
                }`}
              >
                {stage}
              </div>
              {i < 4 && <span className="text-gray-600 text-xs">→</span>}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full">
        {/* Matches */}
        {campaignStats.matches.map((match, i) => (
          <MatchCard
            key={i}
            match={match}
            index={i}
            isVisible={i < visibleCount}
          />
        ))}

        {/* Elimination banner */}
        {isEliminated && (
          <div className="card p-6 text-center border-red-700 animate-bounce-in">
            <div className="text-4xl mb-2">😢</div>
            <h3 className="text-red-400 font-black text-xl">Eliminado!</h3>
            <p className="text-gray-400 text-sm mt-2">{campaignStats.finalPhrase}</p>
          </div>
        )}

        {/* Final loss banner */}
        {isFinalLoss && (
          <div className="card p-6 text-center border-gray-600 animate-bounce-in">
            <div className="text-4xl mb-2">🥈</div>
            <h3 className="text-gray-300 font-black text-xl">Vice-Campeão</h3>
            <p className="text-gray-400 text-sm mt-2">{campaignStats.finalPhrase}</p>
          </div>
        )}

        {/* Champion banner */}
        {allVisible && campaignStats.phase === 'champion' && (
          <div className="card p-6 text-center border-gold-500 animate-bounce-in">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="text-gradient font-black text-2xl">CAMPEÃO DA EUROPA!</h3>
            <p className="text-gray-300 text-sm mt-2">{campaignStats.finalPhrase}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="space-y-3 pb-6">
          {!allVisible && (
            <div className="flex gap-3">
              <button onClick={showNext} className="btn-gold flex-1 py-3">
                ⚽ Próxima Partida
              </button>
              <button
                onClick={() => setAutoPlay(true)}
                className="btn-outline px-4 py-3"
                disabled={autoPlay}
              >
                {autoPlay ? '⏳' : '▶ Auto'}
              </button>
              <button onClick={showAll} className="btn-outline px-4 py-3">
                ⏩ Tudo
              </button>
            </div>
          )}

          {allVisible && (
            <button onClick={onFinish} className="btn-gold w-full py-4 text-lg">
              📊 Ver Resultado Final
            </button>
          )}

          {!allVisible && (
            <p className="text-gray-500 text-xs text-center">
              {visibleCount} de {campaignStats.matches.length} partidas
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationScreen;
