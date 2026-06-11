import React, { useEffect, useRef, useState } from 'react';
import { DraftSlot, Formation, GameMode, Player, Squad } from '../types/game';
import { ALL_SQUADS } from '../data/players';
import PlayerCard from './PlayerCard';
import TeamPitch from './TeamPitch';

interface DraftScreenProps {
  round: number;
  totalRounds: number;
  currentSquad: Squad | null;
  availablePlayers: Player[];
  draftSlots: DraftSlot[];
  formation: Formation;
  gameMode: GameMode;
  swapsRemaining: number;
  isAnimating: boolean;
  animatingSquadName: string;
  onPickPlayer: (player: Player) => void;
  onReroll: () => void;
}

const DraftScreen: React.FC<DraftScreenProps> = ({
  round,
  totalRounds,
  currentSquad,
  availablePlayers,
  draftSlots,
  formation,
  gameMode,
  swapsRemaining,
  isAnimating,
  animatingSquadName,
  onPickPlayer,
  onReroll,
}) => {
  const [displaySquadName, setDisplaySquadName] = useState('...');
  const [displaySeason, setDisplaySeason] = useState('...');
  const intervalRef = useRef<number | null>(null);
  const [localAnimating, setLocalAnimating] = useState(false);

  // When animating, cycle through random squad names
  useEffect(() => {
    if (isAnimating) {
      setLocalAnimating(true);
      let count = 0;
      const maxIterations = 18;
      intervalRef.current = window.setInterval(() => {
        const randomSquad = ALL_SQUADS[Math.floor(Math.random() * ALL_SQUADS.length)];
        setDisplaySquadName(randomSquad.club);
        setDisplaySeason(randomSquad.season);
        count++;
        if (count >= maxIterations) {
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
          setDisplaySquadName(animatingSquadName);
          setDisplaySeason(currentSquad?.season || '');
          setLocalAnimating(false);
        }
      }, 60);
    } else {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      setDisplaySquadName(currentSquad?.club || '');
      setDisplaySeason(currentSquad?.season || '');
      setLocalAnimating(false);
    }

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [isAnimating, animatingSquadName, currentSquad]);

  const progress = ((round - 1) / totalRounds) * 100;
  const filledSlots = draftSlots.filter((s) => s.player !== null).length;

  return (
    <div className="min-h-screen bg-night-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-night-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-black text-white">
            Rodada <span className="text-gold-400">{round}</span> de {totalRounds}
          </h2>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg transition-all ${i < swapsRemaining ? 'text-gold-500' : 'text-gray-600'}`}
              >
                🔄
              </span>
            ))}
            <span className="text-gray-400 text-xs ml-1">re-sorteios</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="stat-bar h-2">
          <div
            className="stat-bar-fill bg-gradient-to-r from-sapphire-600 to-gold-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500 text-xs">{filledSlots} jogadores selecionados</span>
          <span className="text-gray-500 text-xs">{totalRounds - filledSlots} restantes</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Squad + Players */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Drawn Squad */}
          <div
            className={`card p-4 text-center transition-all duration-300 ${
              localAnimating ? 'animate-pulse-glow' : ''
            }`}
          >
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Time Sorteado</p>
            <h3
              className={`text-2xl font-black transition-all duration-100 ${
                localAnimating ? 'text-white' : 'text-gradient'
              }`}
            >
              {displaySquadName || '...'}
            </h3>
            {displaySeason && (
              <p className="text-gray-400 text-sm mt-1">{displaySeason}</p>
            )}
            {currentSquad && !localAnimating && (
              <p className="text-sapphire-400 text-xs mt-2">
                {currentSquad.country} · {currentSquad.players.length} jogadores
              </p>
            )}
          </div>

          {/* Available Players */}
          {!localAnimating && availablePlayers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Escolha um jogador:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    gameMode={gameMode}
                    onSelect={onPickPlayer}
                  />
                ))}
              </div>
            </div>
          )}

          {!localAnimating && availablePlayers.length === 0 && !isAnimating && (
            <div className="card p-6 text-center">
              <p className="text-gray-400">Nenhum jogador compatível com as posições abertas.</p>
              {swapsRemaining > 0 && (
                <p className="text-gold-400 text-sm mt-2">Use um re-sorteio para tentar outro time!</p>
              )}
            </div>
          )}

          {/* Reroll button */}
          {!localAnimating && (
            <button
              onClick={onReroll}
              disabled={swapsRemaining === 0}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                swapsRemaining > 0
                  ? 'border-2 border-gold-600 text-gold-400 hover:bg-gold-600 hover:text-night-900'
                  : 'border-2 border-gray-700 text-gray-600 cursor-not-allowed'
              }`}
            >
              🔄 Re-sortear ({swapsRemaining} restante{swapsRemaining !== 1 ? 's' : ''})
            </button>
          )}
        </div>

        {/* Right: Team pitch preview */}
        <div className="lg:w-64 xl:w-72 p-4 border-t lg:border-t-0 lg:border-l border-night-700 bg-night-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 text-center">
            Meu Time — {formation}
          </h3>
          <TeamPitch draftSlots={draftSlots} gameMode={gameMode} />
          <div className="mt-3 text-center">
            <span className="text-gray-400 text-xs">
              {filledSlots}/{totalRounds} posições preenchidas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftScreen;
