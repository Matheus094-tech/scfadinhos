import React from 'react';
import { DraftSlot, GameMode } from '../types/game';
import { getPositionColor } from '../utils/formations';

interface TeamPitchProps {
  draftSlots: DraftSlot[];
  gameMode: GameMode;
  compact?: boolean;
}

const TeamPitch: React.FC<TeamPitchProps> = ({ draftSlots, gameMode, compact = false }) => {
  const size = compact ? 'w-6 h-6 text-xs' : 'w-12 h-12 text-xs';
  const nameFontSize = compact ? 'text-xs' : 'text-xs';

  return (
    <div
      className="w-full pitch-bg rounded-xl relative"
      style={{ aspectRatio: '2/3' }}
    >
      {/* Pitch markings overlay */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        {/* Center circle */}
        <div
          className="absolute border border-white rounded-full"
          style={{
            width: '30%',
            height: '20%',
            top: '40%',
            left: '35%',
            opacity: 0.15,
          }}
        />
        {/* Halfway line */}
        <div
          className="absolute left-0 right-0 h-px bg-white"
          style={{ top: '50%', opacity: 0.2 }}
        />
        {/* Top penalty box */}
        <div
          className="absolute border border-white"
          style={{
            width: '50%',
            height: '18%',
            top: '2%',
            left: '25%',
            opacity: 0.12,
          }}
        />
        {/* Bottom penalty box */}
        <div
          className="absolute border border-white"
          style={{
            width: '50%',
            height: '18%',
            bottom: '2%',
            left: '25%',
            opacity: 0.12,
          }}
        />
      </div>

      {/* Player badges */}
      {draftSlots.map((draftSlot) => {
        const { slot, player } = draftSlot;
        const shortName = player
          ? player.name.split(' ').pop() || player.name
          : slot.position;

        return (
          <div
            key={slot.slotIndex}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            {player ? (
              <>
                <div
                  className={`${size} rounded-full border-2 border-white flex items-center justify-center font-bold text-white shadow-lg`}
                  style={{
                    background: player
                      ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                      : 'rgba(30,40,60,0.8)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}
                  title={player.name}
                >
                  {player.name.charAt(0)}
                </div>
                {!compact && (
                  <div className="mt-0.5 flex flex-col items-center">
                    <span
                      className={`${nameFontSize} font-bold text-white leading-none`}
                      style={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                        maxWidth: '60px',
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
                        style={{ fontSize: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
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
                  className={`${size} rounded-full border-2 border-dashed border-white flex items-center justify-center`}
                  style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)' }}
                >
                  <span
                    className={`${getPositionColor(slot.position)} text-white font-bold rounded px-0.5`}
                    style={{ fontSize: '8px' }}
                  >
                    {slot.position}
                  </span>
                </div>
                {!compact && (
                  <span
                    className="text-xs text-white mt-0.5 opacity-50"
                    style={{ fontSize: '9px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {slot.position}
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
