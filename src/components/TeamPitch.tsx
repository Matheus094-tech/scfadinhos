import React from 'react';
import { DraftSlot, GameMode } from '../types/game';
import { getPositionColor, getPositionLabel } from '../utils/formations';

interface TeamPitchProps {
  draftSlots: DraftSlot[];
  gameMode: GameMode;
  compact?: boolean;
  highlightSlotIndex?: number;
}

const TeamPitch: React.FC<TeamPitchProps> = ({
  draftSlots,
  gameMode,
  compact = false,
  highlightSlotIndex,
}) => {
  const dotSize = compact ? 'w-6 h-6' : 'w-10 h-10';

  return (
    <div className="w-full pitch-bg rounded-xl relative" style={{ aspectRatio: '2/3' }}>
      {/* Pitch markings */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div
          className="absolute border border-white rounded-full"
          style={{ width: '30%', height: '20%', top: '40%', left: '35%', opacity: 0.15 }}
        />
        <div className="absolute left-0 right-0 h-px bg-white" style={{ top: '50%', opacity: 0.2 }} />
        <div
          className="absolute border border-white"
          style={{ width: '50%', height: '18%', top: '2%', left: '25%', opacity: 0.12 }}
        />
        <div
          className="absolute border border-white"
          style={{ width: '50%', height: '18%', bottom: '2%', left: '25%', opacity: 0.12 }}
        />
      </div>

      {draftSlots.map((draftSlot) => {
        const { slot, player } = draftSlot;
        const isHighlighted = slot.slotIndex === highlightSlotIndex;
        const shortName = player ? player.name.split(' ').pop() || player.name : null;

        return (
          <div
            key={slot.slotIndex}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            {player ? (
              <>
                <div
                  className={`${dotSize} rounded-full border-2 flex items-center justify-center font-black text-white shadow-lg text-xs transition-all duration-300 ${
                    isHighlighted
                      ? 'border-gold-400 ring-2 ring-gold-400 ring-offset-1 ring-offset-transparent'
                      : 'border-white'
                  }`}
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
                >
                  {player.name.charAt(0)}
                </div>
                {!compact && (
                  <div className="mt-0.5 flex flex-col items-center">
                    <span
                      className="text-white font-bold leading-none"
                      style={{
                        fontSize: '9px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                        maxWidth: '52px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {shortName}
                    </span>
                    {gameMode === 'classic' && (
                      <span
                        className="text-gold-400 font-black leading-none"
                        style={{ fontSize: '9px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                      >
                        {player.overall}
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  className={`${dotSize} rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isHighlighted
                      ? 'border-gold-400 bg-gold-900/60 animate-pulse shadow-lg shadow-gold-500/50'
                      : 'border-dashed border-white/30 bg-black/20'
                  }`}
                >
                  <span
                    className={`font-bold rounded px-0.5 text-white ${getPositionColor(slot.position)}`}
                    style={{ fontSize: '7px' }}
                  >
                    {getPositionLabel(slot.position)}
                  </span>
                </div>
                {!compact && (
                  <span
                    className={`mt-0.5 font-bold leading-none transition-all ${
                      isHighlighted ? 'text-gold-400' : 'text-white/50'
                    }`}
                    style={{ fontSize: '9px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {getPositionLabel(slot.position)}
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamPitch;
