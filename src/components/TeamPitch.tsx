import React from 'react';
import { DraftSlot, GameMode, Player } from '../types/game';
import { canPlayerFillSlot, getPositionColor, getPositionLabel } from '../utils/formations';

interface TeamPitchProps {
  draftSlots: DraftSlot[];
  gameMode: GameMode;
  compact?: boolean;
  /** Player currently selected in the squad list — used to highlight compatible slots. */
  selectedPlayer?: Player | null;
  /** Called when user taps a compatible empty slot while a player is selected. */
  onSlotClick?: (slotIndex: number) => void;
}

const TeamPitch: React.FC<TeamPitchProps> = ({
  draftSlots,
  gameMode,
  compact = false,
  selectedPlayer,
  onSlotClick,
}) => {
  const dotSize = compact ? 'w-5 h-5' : 'w-8 h-8';

  return (
    <div className="w-full pitch-bg rounded-xl relative" style={{ aspectRatio: '2/3' }}>
      {/* Pitch markings */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute border border-white rounded-full"
          style={{ width: '30%', height: '20%', top: '40%', left: '35%', opacity: 0.15 }} />
        <div className="absolute left-0 right-0 h-px bg-white" style={{ top: '50%', opacity: 0.2 }} />
        <div className="absolute border border-white"
          style={{ width: '50%', height: '18%', top: '2%', left: '25%', opacity: 0.12 }} />
        <div className="absolute border border-white"
          style={{ width: '50%', height: '18%', bottom: '2%', left: '25%', opacity: 0.12 }} />
      </div>

      {draftSlots.map((draftSlot) => {
        const { slot, player } = draftSlot;
        const isFilled = player !== null;
        const hasSelection = selectedPlayer != null;

        // Compatible: player selected + slot empty + position compatible
        const isCompatible =
          hasSelection &&
          !isFilled &&
          canPlayerFillSlot(selectedPlayer!.position, selectedPlayer!.altPositions, slot.position);

        // Dimmed: player selected + slot empty + position NOT compatible
        const isDimmed = hasSelection && !isFilled && !isCompatible;

        const shortName = player ? player.name.split(' ').pop() || player.name : null;

        return (
          <div
            key={slot.slotIndex}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none ${
              isCompatible ? 'cursor-pointer z-10' : ''
            }`}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            onClick={() => {
              if (isCompatible && onSlotClick) onSlotClick(slot.slotIndex);
            }}
          >
            {/* ── FILLED SLOT ── */}
            {isFilled && (
              <>
                <div
                  className={`${dotSize} rounded-full border-2 border-white flex items-center justify-center font-black text-white shadow-lg text-xs transition-opacity duration-200`}
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    opacity: isDimmed ? 0.25 : 1,
                  }}
                >
                  {player!.name.charAt(0)}
                </div>
                {!compact && (
                  <div className="mt-0.5 flex flex-col items-center" style={{ opacity: isDimmed ? 0.25 : 1 }}>
                    <span className="text-white font-bold leading-none" style={{
                      fontSize: '8px', textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                      maxWidth: '48px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      {shortName}
                    </span>
                    {gameMode === 'classic' && (
                      <span className="text-gold-400 font-black leading-none" style={{ fontSize: '8px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                        {player!.overall}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── COMPATIBLE EMPTY SLOT — tap here to place ── */}
            {!isFilled && isCompatible && (
              <>
                <div className={`${dotSize} rounded-full border-2 border-gold-400 bg-gold-400/25 animate-pulse flex items-center justify-center shadow-md shadow-gold-400/40`}>
                  <span className="text-gold-300 font-black" style={{ fontSize: '7px' }}>
                    {getPositionLabel(slot.position)}
                  </span>
                </div>
                {!compact && (
                  <span className="text-gold-400 font-bold animate-pulse mt-0.5" style={{ fontSize: '8px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    {getPositionLabel(slot.position)}
                  </span>
                )}
              </>
            )}

            {/* ── DIMMED INCOMPATIBLE SLOT ── */}
            {!isFilled && isDimmed && (
              <div className={`${dotSize} rounded-full border border-dashed border-white/15 bg-transparent opacity-20`} />
            )}

            {/* ── NORMAL EMPTY SLOT (no selection active) ── */}
            {!isFilled && !isCompatible && !isDimmed && (
              <>
                <div className={`${dotSize} rounded-full border-2 border-dashed border-white/30 bg-black/20 flex items-center justify-center`}>
                  <span className={`font-bold rounded px-0.5 text-white ${getPositionColor(slot.position)}`} style={{ fontSize: '7px' }}>
                    {getPositionLabel(slot.position)}
                  </span>
                </div>
                {!compact && (
                  <span className="text-white/40 mt-0.5" style={{ fontSize: '8px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
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
