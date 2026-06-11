import React, { useState } from 'react';
import { CampaignStats, DraftSlot, Formation, Phase, TeamStats } from '../types/game';
import ShareCard from './ShareCard';

interface FinalResultProps {
  campaignStats: CampaignStats;
  teamStats: TeamStats;
  formation: Formation;
  draftSlots: DraftSlot[];
  onRestart: () => void;
}

function PhaseHeader({ phase }: { phase: Phase }) {
  switch (phase) {
    case 'champion':
      return (
        <div className="text-center py-8 animate-bounce-in">
          <div className="text-7xl mb-4 animate-pulse-glow inline-block">🏆</div>
          <h1 className="text-gradient text-4xl font-black mb-2">CAMPEÃO DA EUROPA!</h1>
          <p className="text-gold-400 text-lg">Você conquistou a Champions League!</p>
        </div>
      );
    case 'final':
      return (
        <div className="text-center py-6 animate-slide-up">
          <div className="text-6xl mb-3">🥈</div>
          <h1 className="text-white text-3xl font-black mb-2">Vice-Campeão</h1>
          <p className="text-gray-400">Tão perto da glória — foi uma campanha incrível.</p>
        </div>
      );
    case 'semifinal':
      return (
        <div className="text-center py-6 animate-slide-up">
          <div className="text-5xl mb-3">⚔️</div>
          <h1 className="text-white text-3xl font-black mb-2">Semifinalista</h1>
          <p className="text-gray-400">Chegou longe, mas a final ficou para outra vez.</p>
        </div>
      );
    case 'quarterfinal':
      return (
        <div className="text-center py-6 animate-slide-up">
          <div className="text-5xl mb-3">⚡</div>
          <h1 className="text-white text-2xl font-black mb-2">Quartas de Final</h1>
          <p className="text-gray-400">Uma campanha sólida, mas a jornada terminou nas quartas.</p>
        </div>
      );
    case 'round16':
      return (
        <div className="text-center py-6 animate-slide-up">
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-white text-2xl font-black mb-2">Oitavas de Final</h1>
          <p className="text-gray-400">Passou dos grupos, mas caiu nas oitavas.</p>
        </div>
      );
    case 'groups':
      return (
        <div className="text-center py-6 animate-slide-up">
          <div className="text-5xl mb-3">😢</div>
          <h1 className="text-red-400 text-2xl font-black mb-2">Fase de Grupos</h1>
          <p className="text-gray-400">Eliminado cedo. A Champions espera uma nova tentativa.</p>
        </div>
      );
  }
}

function RatingBar({ rating }: { rating: number }) {
  const color =
    rating >= 85
      ? 'from-gold-500 to-gold-400'
      : rating >= 65
      ? 'from-sapphire-600 to-sapphire-400'
      : rating >= 50
      ? 'from-green-600 to-green-400'
      : 'from-gray-600 to-gray-400';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">Nota da Campanha</span>
        <span className="text-white font-black text-2xl">{rating}<span className="text-gray-500 text-base">/100</span></span>
      </div>
      <div className="stat-bar h-4">
        <div
          className={`stat-bar-fill bg-gradient-to-r ${color}`}
          style={{ width: `${rating}%` }}
        />
      </div>
    </div>
  );
}

const FinalResult: React.FC<FinalResultProps> = ({
  campaignStats,
  teamStats,
  formation,
  draftSlots,
  onRestart,
}) => {
  const [showMatches, setShowMatches] = useState(false);

  return (
    <div className="min-h-screen bg-night-900 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pb-8">
          {/* Phase announcement */}
          <PhaseHeader phase={campaignStats.phase} />

          {/* Final phrase */}
          <div className="card p-4 mb-6 border-night-500 text-center">
            <p className="text-gray-300 italic text-sm leading-relaxed">{campaignStats.finalPhrase}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card p-4 text-center">
              <div className="text-3xl font-black text-green-400">{campaignStats.wins}</div>
              <div className="text-gray-500 text-xs mt-1">Vitórias</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-black text-yellow-400">{campaignStats.draws}</div>
              <div className="text-gray-500 text-xs mt-1">Empates</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-black text-red-400">{campaignStats.losses}</div>
              <div className="text-gray-500 text-xs mt-1">Derrotas</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-black text-sapphire-400">
                {campaignStats.goalsFor}–{campaignStats.goalsAgainst}
              </div>
              <div className="text-gray-500 text-xs mt-1">Gols</div>
            </div>
          </div>

          {/* Group table */}
          {campaignStats.groupTable && campaignStats.groupTable.length > 0 && (
            <div className="card p-4 mb-6">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Tabela do Grupo</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-night-600">
                    <th className="text-left pb-1 font-semibold">Time</th>
                    <th className="pb-1 font-semibold">J</th>
                    <th className="pb-1 font-semibold">V</th>
                    <th className="pb-1 font-semibold">E</th>
                    <th className="pb-1 font-semibold">D</th>
                    <th className="pb-1 font-semibold">GP</th>
                    <th className="pb-1 font-semibold">GC</th>
                    <th className="pb-1 font-semibold text-gold-400">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignStats.groupTable.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-night-700 last:border-0 ${
                        row.isUser ? 'text-gold-300' : 'text-gray-300'
                      } ${i < 2 ? '' : 'opacity-60'}`}
                    >
                      <td className="py-1.5 font-semibold truncate max-w-[100px]">
                        {i < 2 && <span className="text-green-400 mr-1">✓</span>}
                        {row.isUser ? '⭐ Seu Time' : row.teamName}
                      </td>
                      <td className="text-center py-1.5">{row.wins + row.draws + row.losses}</td>
                      <td className="text-center py-1.5">{row.wins}</td>
                      <td className="text-center py-1.5">{row.draws}</td>
                      <td className="text-center py-1.5">{row.losses}</td>
                      <td className="text-center py-1.5">{row.goalsFor}</td>
                      <td className="text-center py-1.5">{row.goalsAgainst}</td>
                      <td className="text-center py-1.5 font-black text-gold-400">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stars */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card p-4">
              <p className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-2">⭐ Craque</p>
              <p className="text-white font-bold">{teamStats.starPlayer.name}</p>
              <p className="text-gray-500 text-xs">{teamStats.starPlayer.club} {teamStats.starPlayer.season}</p>
            </div>
            <div className="card p-4">
              <p className="text-sapphire-400 text-xs font-bold uppercase tracking-widest mb-2">⚽ Artilheiro</p>
              <p className="text-white font-bold">{campaignStats.topScorer}</p>
              <p className="text-gray-500 text-xs">{campaignStats.topScorerGoals} gol{campaignStats.topScorerGoals !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Best player */}
          <div className="card p-4 mb-6">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">🏅 Melhor Jogador</p>
            <p className="text-white font-bold text-lg">{campaignStats.bestPlayer}</p>
          </div>

          {/* Rating */}
          <div className="card p-4 mb-6">
            <RatingBar rating={campaignStats.rating} />
          </div>

          {/* Match history (accordion) */}
          <div className="card mb-6">
            <button
              className="w-full p-4 flex items-center justify-between text-left"
              onClick={() => setShowMatches(!showMatches)}
            >
              <span className="font-bold text-white">Histórico de Partidas</span>
              <span className="text-gray-400">{showMatches ? '▲' : '▼'}</span>
            </button>

            {showMatches && (
              <div className="border-t border-night-500 divide-y divide-night-600">
                {campaignStats.matches.map((match, i) => {
                  const won = match.homeScore > match.awayScore;
                  const drew = match.homeScore === match.awayScore;
                  return (
                    <div key={i} className="p-3 flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          won ? 'bg-green-400' : drew ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-400 text-xs">{match.round}</span>
                          <span className="text-white font-bold text-sm">
                            {match.homeScore}–{match.awayScore}
                          </span>
                          <span className="text-gray-400 text-xs truncate">vs {match.opponent}</span>
                        </div>
                        {match.scorers.length > 0 && (
                          <p className="text-gray-500 text-xs mt-0.5">⚽ {match.scorers.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Share card */}
          <div className="mb-6">
            <h3 className="text-white font-bold mb-3">Compartilhar</h3>
            <ShareCard
              formation={formation}
              campaignStats={campaignStats}
              teamStats={teamStats}
              draftSlots={draftSlots}
            />
          </div>

          {/* Restart */}
          <button onClick={onRestart} className="btn-gold w-full py-4 text-lg">
            🔄 Jogar Novamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalResult;
