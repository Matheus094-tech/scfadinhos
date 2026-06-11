import React, { useEffect, useRef, useState } from 'react';
import { Difficulty, DraftSlot, Formation, GameMode, Player, Squad } from '../types/game';
import { ALL_SQUADS } from '../data/players';
import { getPositionLabel } from '../utils/formations';
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
  difficulty: Difficulty;
  swapsRemaining: number;
  isAnimating: boolean;
  animatingSquadName: string;
  onPickPlayer: (player: Player) => void;
  onReroll: () => void;
  onAutoSelect: () => void;
}

function timerDuration(difficulty: Difficulty): number {
  if (difficulty === 'legendary') return 30;
  if (difficulty === 'hard') return 45;
  return 60;
}

const DraftScreen: React.FC<DraftScreenProps> = ({
  round,
  totalRounds,
  currentSquad,
  availablePlayers,
  draftSlots,
  formation,
  gameMode,
  difficulty,
  swapsRemaining,
  isAnimating,
  animatingSquadName,
  onPickPlayer,
  onReroll,
  onAutoSelect,
}) => {
  const maxTime = timerDuration(difficulty);

  // Squad draw animation
  const [displaySquadName, setDisplaySquadName] = useState('...');
  const [displaySeason, setDisplaySeason] = useState('');
  const intervalRef = useRef<number | null>(null);
  const [localAnimating, setLocalAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      setLocalAnimating(true);
      let count = 0;
      intervalRef.current = window.setInterval(() => {
        const r = ALL_SQUADS[Math.floor(Math.random() * ALL_SQUADS.length)];
        setDisplaySquadName(r.club);
        setDisplaySeason(r.season);
        count++;
        if (count >= 18) {
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
    return () => { if (intervalRef.current !== null) clearInterval(intervalRef.current); };
  }, [isAnimating, animatingSquadName, currentSquad]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerKey = useRef(0);

  // Reset timer when round changes
  useEffect(() => {
    setTimerRunning(false);
    setTimeLeft(maxTime);
  }, [round, maxTime]);

  // Start timer once animation ends
  useEffect(() => {
    if (!localAnimating && !isAnimating && availablePlayers.length > 0) {
      timerKey.current += 1;
      setTimeLeft(maxTime);
      setTimerRunning(true);
    }
  }, [localAnimating, isAnimating]); // eslint-disable-line

  // Countdown
  useEffect(() => {
    if (!timerRunning) return;
    if (timeLeft <= 0) {
      setTimerRunning(false);
      onAutoSelect();
      return;
    }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timeLeft, onAutoSelect]);

  // Current target slot
  const targetSlot = draftSlots.find((s) => s.player === null)?.slot ?? null;
  const currentSlotPos = targetSlot?.position ?? null;
  const currentSlotIndex = targetSlot?.slotIndex ?? -1;

  const filledCount = draftSlots.filter((s) => s.player !== null).length;
  const timerPct = (timeLeft / maxTime) * 100;
  const timerColor =
    timerPct > 50
      ? 'bg-green-500'
      : timerPct > 25
      ? 'bg-yellow-500'
      : 'bg-red-500 animate-pulse';

  const isReady = !localAnimating && !isAnimating;

  return (
    <div className="min-h-screen bg-night-900 flex flex-col">
      {/* ── TOP HUD ── */}
      <div className="sticky top-0 z-10 bg-night-900 border-b border-night-700 px-3 pt-2 pb-1.5">
        {/* Row 1: round · slot · swaps */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-sm">
              Rodada <span className="text-gold-400">{round}</span>/{totalRounds}
            </span>
            {currentSlotPos && (
              <span className="bg-night-700 border border-night-500 text-xs font-bold px-2 py-0.5 rounded-full text-white">
                Escolher: <span className="text-gold-400">{getPositionLabel(currentSlotPos)}</span>
              </span>
            )}
          </div>

          {/* Swaps */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < swapsRemaining ? 'text-gold-400' : 'text-night-600'}`}>
                ●
              </span>
            ))}
            <span className="text-gray-500 text-xs ml-1">{swapsRemaining} troca{swapsRemaining !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Row 2: timer bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-night-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <span
            className={`text-xs font-black w-10 text-right tabular-nums transition-colors ${
              timerPct <= 25 ? 'text-red-400' : timerPct <= 50 ? 'text-yellow-400' : 'text-gray-400'
            }`}
          >
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1 mt-1.5">
          {draftSlots.map((ds) => (
            <div
              key={ds.slot.slotIndex}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                ds.player !== null
                  ? 'bg-gold-500'
                  : ds.slot.slotIndex === currentSlotIndex
                  ? 'bg-sapphire-400 animate-pulse'
                  : 'bg-night-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* ── RIGHT PANEL: Squad + Cards (shown first on mobile) ── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 order-1 md:order-2">

          {/* Squad header */}
          <div
            className={`rounded-xl border px-3 py-2.5 flex items-center justify-between transition-all ${
              localAnimating
                ? 'border-sapphire-600 bg-sapphire-900/30 animate-pulse'
                : 'border-night-600 bg-night-800'
            }`}
          >
            <div className="min-w-0">
              <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-0.5">Elenco sorteado</p>
              <h3 className={`font-black text-base leading-tight truncate ${localAnimating ? 'text-white' : 'text-gradient'}`}>
                {displaySquadName || '...'}
              </h3>
              {displaySeason && (
                <p className="text-gray-400 text-xs leading-tight">{displaySeason}{currentSquad?.nickname ? ` · ${currentSquad.nickname}` : ''}</p>
              )}
            </div>
            {currentSquad && !localAnimating && (
              <div className="flex-shrink-0 text-right ml-2">
                <div className="text-xs text-sapphire-400 font-bold">{currentSquad.country}</div>
                <div className="text-xs text-gray-500">{currentSquad.overallRating} OVR</div>
              </div>
            )}
          </div>

          {/* Player cards grid */}
          {isReady && availablePlayers.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {availablePlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  gameMode={gameMode}
                  onSelect={onPickPlayer}
                  compatible={true}
                />
              ))}
            </div>
          )}

          {/* No players available */}
          {isReady && availablePlayers.length === 0 && (
            <div className="rounded-xl border border-night-600 p-4 text-center bg-night-800">
              <p className="text-gray-400 text-sm">Nenhum jogador compatível com {currentSlotPos ? getPositionLabel(currentSlotPos) : 'esta posição'}.</p>
              {swapsRemaining > 0 && (
                <p className="text-gold-400 text-xs mt-1">Use uma troca para sortear outro elenco!</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          {isReady && (
            <div className="flex gap-2 pb-2">
              <button
                onClick={onReroll}
                disabled={swapsRemaining === 0}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                  swapsRemaining > 0
                    ? 'border border-gold-600 text-gold-400 hover:bg-gold-600 hover:text-night-900 active:scale-95'
                    : 'border border-night-700 text-night-600 cursor-not-allowed'
                }`}
              >
                🔄 Re-sortear ({swapsRemaining})
              </button>
              {availablePlayers.length > 0 && (
                <button
                  onClick={onAutoSelect}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-sapphire-700 text-sapphire-400 hover:bg-sapphire-700 hover:text-white transition-all duration-150 active:scale-95"
                >
                  ⚡ Melhor jogador
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── LEFT PANEL: Pitch ── */}
        <div className="md:w-56 lg:w-64 order-2 md:order-1 p-3 border-t md:border-t-0 md:border-r border-night-700 bg-night-850 flex flex-col">
          <div className="text-xs text-gray-500 uppercase tracking-widest text-center mb-2 font-semibold">
            {formation} · {filledCount}/{totalRounds}
          </div>
          <TeamPitch
            draftSlots={draftSlots}
            gameMode={gameMode}
            highlightSlotIndex={currentSlotIndex >= 0 ? currentSlotIndex : undefined}
          />
        </div>

      </div>
    </div>
  );
};

export default DraftScreen;
