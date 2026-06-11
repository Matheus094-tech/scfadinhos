import React from 'react';
import { GameMode, Player } from '../types/game';
import { getPositionColor, getPositionLabel } from '../utils/formations';

interface PlayerCardProps {
  player: Player;
  gameMode: GameMode;
  onSelect: (player: Player) => void;
  compatible?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  gameMode,
  onSelect,
  compatible = true,
}) => {
  const posLabel = getPositionLabel(player.position);
  const stars = Math.min(5, Math.round(player.championsWeight / 2));

  return (
    <button
      onClick={() => compatible && onSelect(player)}
      disabled={!compatible}
      className={`relative rounded-xl border flex flex-col gap-1.5 p-2.5 text-left transition-all duration-150 w-full ${
        compatible
          ? 'border-night-500 hover:border-sapphire-400 hover:bg-night-700 cursor-pointer bg-night-800 active:scale-95'
          : 'border-night-700 bg-night-850 opacity-40 cursor-not-allowed'
      }`}
    >
      {/* Position + nationality + overall */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${getPositionColor(player.position)}`}>
            {posLabel}
          </span>
          <span className="text-base leading-none flex-shrink-0">{player.nationality}</span>
        </div>
        <span className="text-2xl font-black text-white leading-none flex-shrink-0">{player.overall}</span>
      </div>

      {/* Name + club */}
      <div className="min-w-0">
        <p className="font-bold text-white text-sm leading-tight truncate">{player.name}</p>
        <p className="text-gray-500 text-xs truncate leading-tight">
          {player.club} · {player.season}
        </p>
      </div>

      {/* Key stats */}
      {gameMode === 'classic' ? (
        <div className="flex items-center gap-2 text-xs leading-none">
          <span className="text-red-400">
            ATK <span className="font-black text-white">{player.attack}</span>
          </span>
          <span className="text-blue-400">
            DEF <span className="font-black text-white">{player.defense}</span>
          </span>
          <span className="text-green-400">
            TEC <span className="font-black text-white">{player.technique}</span>
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs leading-none text-gray-600">
          <span>ATK <span className="font-black">?</span></span>
          <span>DEF <span className="font-black">?</span></span>
          <span>TEC <span className="font-black">?</span></span>
        </div>
      )}

      {/* Footer: stars + CTA */}
      <div className="flex items-center justify-between">
        <span className="text-gold-500 text-xs leading-none">
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </span>
        {compatible ? (
          <span className="text-xs font-bold text-sapphire-400 leading-none">Escolher →</span>
        ) : (
          <span className="text-xs text-red-500 leading-none">Incompatível</span>
        )}
      </div>
    </button>
  );
};

export default PlayerCard;
