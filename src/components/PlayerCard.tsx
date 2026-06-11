import React from 'react';
import { GameMode, Player } from '../types/game';
import { getPositionColor } from '../utils/formations';

interface PlayerCardProps {
  player: Player;
  gameMode: GameMode;
  onSelect: (player: Player) => void;
  isSelected?: boolean;
  compact?: boolean;
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-xs w-8">{label}</span>
      <div className="flex-1 stat-bar">
        <div
          className={`stat-bar-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-gray-300 text-xs w-6 text-right">{value}</span>
    </div>
  );
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, gameMode, onSelect, isSelected = false, compact = false }) => {
  const stars = Math.round(player.championsWeight / 2);

  return (
    <button
      onClick={() => onSelect(player)}
      className={`card flex flex-col gap-3 p-4 text-left transition-all duration-200 hover:scale-102 cursor-pointer w-full ${
        isSelected
          ? 'border-gold-500 glow-gold scale-105'
          : 'border-night-500 hover:border-sapphire-500 hover:glow-sapphire'
      }`}
      style={{ transform: isSelected ? 'scale(1.02)' : undefined }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getPositionColor(player.position)}`}>
              {player.position}
            </span>
            <span className="text-lg">{player.nationality}</span>
          </div>
          <h3 className="font-black text-white text-base mt-1 leading-tight truncate">{player.name}</h3>
          <p className="text-gray-400 text-xs truncate">
            {player.club} · {player.season}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className={`text-3xl font-black ${isSelected ? 'text-gold-400' : 'text-white'}`}>
            {player.overall}
          </div>
          <div className="text-gold-500 text-xs leading-none">
            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
          </div>
        </div>
      </div>

      {/* Stats */}
      {!compact && (
        <div className="space-y-1">
          {gameMode === 'classic' ? (
            <>
              <StatBar label="ATK" value={player.attack} color="bg-red-500" />
              <StatBar label="DEF" value={player.defense} color="bg-blue-500" />
              <StatBar label="TEC" value={player.technique} color="bg-green-500" />
              <StatBar label="MEN" value={player.mentality} color="bg-purple-500" />
              <StatBar label="FIS" value={player.physical} color="bg-orange-500" />
            </>
          ) : (
            <div className="space-y-1">
              {(['ATK', 'DEF', 'TEC', 'MEN', 'FIS'] as const).map((stat) => (
                <div key={stat} className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-8">{stat}</span>
                  <div className="flex-1 stat-bar">
                    <div className="h-full w-full bg-night-500 rounded-full" style={{ filter: 'blur(3px)' }} />
                  </div>
                  <span className="text-gray-500 text-xs w-6 text-right">?</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {!compact && (
        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{player.description}</p>
      )}

      {/* Champions weight */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-gold-500 text-xs font-semibold">Peso UCL:</span>
          <span className="text-gold-400 text-xs">{player.championsWeight}/10</span>
        </div>
        {isSelected && (
          <span className="text-gold-400 text-xs font-bold">✓ Selecionado</span>
        )}
      </div>
    </button>
  );
};

export default PlayerCard;
