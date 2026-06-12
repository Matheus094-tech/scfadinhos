import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Difficulty, DraftSlot, Formation, GameMode, Player, Squad } from '../types/game';
import { ALL_SQUADS } from '../data/players';
import {
  canPickPlayer,
  canPlayerFillSlot,
  getCompatibleFreeSlots,
  getPositionColor,
  getPositionLabel,
} from '../utils/formations';
import TeamPitch from './TeamPitch';

interface DraftScreenProps {
  pickNumber: number;
  totalPicks: number;
  currentSquad: Squad | null;
  availablePlayers: Player[];
  draftSlots: DraftSlot[];
  formation: Formation;
  gameMode: GameMode;
  difficulty: Difficulty;
  swapsRemaining: number;
  isAnimating: boolean;
  animatingSquadName: string;
  onPickPlayer: (player: Player, slotIndex: number) => void;
  onReroll: () => void;
  onAutoSelect: () => void;
}

function timerMax(d: Difficulty): number {
  return d === 'legendary' ? 30 : d === 'hard' ? 45 : 60;
}

// ── compact table row ──────────────────────────────────────────────
interface PlayerRowProps {
  player: Player;
  gameMode: GameMode;
  compatible: boolean;
  selected: boolean;
  onSelect: (p: Player) => void;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, gameMode, compatible, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => { if (compatible) onSelect(player); };
  const handleArrow = (e: React.MouseEvent) => { e.stopPropagation(); setExpanded((v) => !v); };

  const altPos = player.altPositions.map((p) => getPositionLabel(p)).join(' · ');

  return (
    <div
      onClick={handleClick}
      className={`border-b border-night-700 last:border-b-0 transition-colors duration-100 select-none ${
        !compatible
          ? 'opacity-35 cursor-not-allowed'
          : selected
          ? 'bg-gold-900/25 cursor-pointer'
          : 'cursor-pointer hover:bg-night-800 active:bg-night-700'
      }`}
    >
      {/* ── main row: 3-col grid ── */}
      <div
        className="grid items-center gap-2 px-3"
        style={{ gridTemplateColumns: '44px minmax(0,1fr) 28px', minHeight: '48px' }}
      >
        {/* Col 1: overall + position badge */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <span className="text-base font-black leading-none text-white tabular-nums">{player.overall}</span>
          <span className={`text-[10px] font-bold px-1 rounded leading-tight ${getPositionColor(player.position)}`}>
            {getPositionLabel(player.position)}
          </span>
        </div>

        {/* Col 2: name + flag + alt positions + status */}
        <div className="min-w-0 py-2">
          <p className={`text-sm font-semibold leading-tight truncate ${compatible ? 'text-white' : 'text-gray-500'}`}>
            {player.name}
          </p>
          <p className="text-[11px] text-night-500 leading-tight mt-px truncate">
            {player.nationality}{altPos ? `  ${altPos}` : ''}
          </p>
          {selected && (
            <p className="text-[10px] text-gold-400 mt-px font-medium">↓ Toque no campo para escalar</p>
          )}
          {!compatible && (
            <p className="text-[10px] text-night-600 mt-px">Sem posição livre</p>
          )}
        </div>

        {/* Col 3: expand arrow — stopPropagation to prevent row selection */}
        <button
          onClick={handleArrow}
          className="flex items-center justify-center w-7 h-7 text-night-600 hover:text-night-400 text-xs flex-shrink-0"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* ── expanded details ── */}
      {expanded && (
        <div className="px-3 pb-2 border-t border-night-700 bg-night-800/30">
          {gameMode === 'classic' && (
            <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 py-1.5 text-xs">
              <span className="text-red-400">ATK <b className="text-white">{player.attack}</b></span>
              <span className="text-blue-400">DEF <b className="text-white">{player.defense}</b></span>
              <span className="text-green-400">TEC <b className="text-white">{player.technique}</b></span>
              <span className="text-purple-400">MEN <b className="text-white">{player.mentality}</b></span>
              <span className="text-orange-400">FIS <b className="text-white">{player.physical}</b></span>
              <span className="text-gold-400">UCL <b className="text-white">{player.championsWeight}/10</b></span>
            </div>
          )}
          <p className="text-gray-600 text-[11px] italic leading-snug">{player.description}</p>
        </div>
      )}
    </div>
  );
};

// ── main screen ────────────────────────────────────────────────────
const DraftScreen: React.FC<DraftScreenProps> = ({
  pickNumber,
  totalPicks,
  currentSquad,
  availablePlayers,
  draftSlots,
  formation: _formation,
  gameMode,
  difficulty,
  swapsRemaining,
  isAnimating,
  animatingSquadName,
  onPickPlayer,
  onReroll,
  onAutoSelect,
}) => {
  const maxTime = timerMax(difficulty);
  const listRef = useRef<HTMLDivElement>(null);

  // ── draw animation ──
  const [displaySquad, setDisplaySquad] = useState('...');
  const [displaySeason, setDisplaySeason] = useState('');
  const intervalRef = useRef<number | null>(null);
  const [localAnimating, setLocalAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      setLocalAnimating(true);
      let count = 0;
      intervalRef.current = window.setInterval(() => {
        const r = ALL_SQUADS[Math.floor(Math.random() * ALL_SQUADS.length)];
        setDisplaySquad(r.club);
        setDisplaySeason(r.season);
        if (++count >= 18) {
          clearInterval(intervalRef.current!);
          setDisplaySquad(animatingSquadName);
          setDisplaySeason(currentSquad?.season ?? '');
          setLocalAnimating(false);
        }
      }, 60);
    } else {
      clearInterval(intervalRef.current!);
      setDisplaySquad(currentSquad?.club ?? '');
      setDisplaySeason(currentSquad?.season ?? '');
      setLocalAnimating(false);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isAnimating, animatingSquadName, currentSquad]);

  // ── selected player ──
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    setSelectedPlayer(null);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [pickNumber, isAnimating]);

  // ── timer ──
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setTimerRunning(false);
    setTimeLeft(maxTime);
  }, [pickNumber, maxTime]);

  useEffect(() => {
    if (!localAnimating && !isAnimating && availablePlayers.length > 0) {
      setTimeLeft(maxTime);
      setTimerRunning(true);
    }
  }, [localAnimating, isAnimating]); // eslint-disable-line

  useEffect(() => {
    if (!timerRunning) return;
    if (timeLeft <= 0) { setTimerRunning(false); onAutoSelect(); return; }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  });

  // ── sorted players: compatible first, then overall desc ──
  const sortedPlayers = useMemo(
    () =>
      [...availablePlayers].sort((a, b) => {
        const aOk = canPickPlayer(a, draftSlots);
        const bOk = canPickPlayer(b, draftSlots);
        if (aOk !== bOk) return aOk ? -1 : 1;
        return b.overall - a.overall;
      }),
    [availablePlayers, draftSlots]
  );

  // ── handlers ──
  const handlePlayerSelect = (player: Player) => {
    if (!canPickPlayer(player, draftSlots)) return;
    setSelectedPlayer((prev) => (prev?.id === player.id ? null : player));
    setTimerRunning(false);
  };

  const handleSlotClick = (slotIndex: number) => {
    if (!selectedPlayer) return;
    const ds = draftSlots.find((d) => d.slot.slotIndex === slotIndex && d.player === null);
    if (!ds || !canPlayerFillSlot(selectedPlayer.position, selectedPlayer.altPositions, ds.slot.position)) return;
    const p = selectedPlayer;
    setSelectedPlayer(null);
    onPickPlayer(p, slotIndex);
  };

  const handleBestPlayer = () => {
    for (const p of sortedPlayers) {
      if (canPickPlayer(p, draftSlots)) {
        setSelectedPlayer(p);
        setTimerRunning(false);
        return;
      }
    }
  };

  const timerPct = (timeLeft / maxTime) * 100;
  const timerColor = timerPct > 50 ? 'bg-green-500' : timerPct > 25 ? 'bg-yellow-400' : 'bg-red-500';
  const isReady = !localAnimating && !isAnimating;
  const filledCount = draftSlots.filter((s) => s.player !== null).length;
  const compatibleSlotsCount = selectedPlayer
    ? getCompatibleFreeSlots(selectedPlayer, draftSlots).length
    : 0;

  return (
    <div className="h-screen bg-night-900 flex flex-col overflow-hidden">

      {/* ── COMPACT HEADER ── */}
      <div className="flex-shrink-0 border-b border-night-700 px-3 pt-2 pb-1.5 space-y-1">

        {/* Row 1: pick counter · squad name · timer · swap dots */}
        <div className="flex items-center gap-2">
          <span className="text-white font-black text-sm tabular-nums flex-shrink-0 leading-none">
            {pickNumber}<span className="text-night-500 font-normal text-xs">/{totalPicks}</span>
          </span>
          <div className="h-3 w-px bg-night-700 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold leading-tight truncate ${localAnimating ? 'animate-pulse text-white' : 'text-gradient'}`}>
              {displaySquad || '...'}
            </p>
            {displaySeason && (
              <p className="text-[11px] text-night-500 leading-none">
                {displaySeason}{currentSquad?.nickname && !localAnimating ? ` · ${currentSquad.nickname}` : ''}
              </p>
            )}
          </div>
          <span className={`text-xs font-black tabular-nums flex-shrink-0 ${timerPct <= 25 ? 'text-red-400' : 'text-night-500'}`}>
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
          <div className="flex gap-0.5 flex-shrink-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-[9px] ${i < swapsRemaining ? 'text-gold-400' : 'text-night-700'}`}>●</span>
            ))}
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-0.5 bg-night-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ${timerColor}${timerPct <= 25 ? ' animate-pulse' : ''}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Action buttons — only when not animating */}
        {isReady && (
          <div className="flex gap-1.5">
            <button
              onClick={onReroll}
              disabled={swapsRemaining === 0}
              className={`flex-1 py-1 rounded text-xs font-semibold transition-all active:scale-95 ${
                swapsRemaining > 0
                  ? 'border border-night-600 text-gold-400 hover:bg-night-800'
                  : 'border border-night-700 text-night-700 cursor-not-allowed'
              }`}
            >
              🔄 Trocar ({swapsRemaining})
            </button>
            <button
              onClick={handleBestPlayer}
              className="flex-1 py-1 rounded text-xs font-semibold border border-night-600 text-sapphire-400 hover:bg-night-800 transition-all active:scale-95"
            >
              ⚡ Melhor
            </button>
          </div>
        )}

        {/* Progress bar: one segment per slot */}
        <div className="flex gap-0.5">
          {draftSlots.map((ds, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                ds.player !== null ? 'bg-gold-500' : i === filledCount ? 'bg-sapphire-400' : 'bg-night-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT: always side-by-side ── */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden">

        {/* ── LEFT: Field ── */}
        <div className="w-[40%] flex-shrink-0 border-r border-night-700 flex flex-col p-1.5 gap-1 overflow-hidden">
          <div className="flex-1 min-h-0">
            <TeamPitch
              draftSlots={draftSlots}
              gameMode={gameMode}
              selectedPlayer={selectedPlayer}
              onSlotClick={handleSlotClick}
            />
          </div>

          {/* Pitch hint */}
          <div className="flex-shrink-0 text-center py-0.5">
            {selectedPlayer ? (
              <p className="text-gold-400 text-[10px] font-semibold leading-tight">
                {compatibleSlotsCount} vaga{compatibleSlotsCount !== 1 ? 's' : ''} · toque no campo
              </p>
            ) : (
              <p className="text-night-600 text-[10px]">← toque em um jogador</p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Squad info + player list ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

          {/* Squad info strip */}
          <div className="flex-shrink-0 px-3 py-1.5 border-b border-night-700 bg-night-800/40">
            {localAnimating ? (
              <p className="text-white font-black text-sm animate-pulse leading-none">{displaySquad}</p>
            ) : (
              <>
                <p className="text-white font-bold text-sm leading-tight">{currentSquad?.club ?? '—'}</p>
                <p className="text-night-500 text-[11px] leading-tight">
                  {currentSquad?.season ?? ''}
                  {currentSquad?.nickname ? ` · ${currentSquad.nickname}` : ''}
                </p>
              </>
            )}
          </div>

          {/* Scrollable player list */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto overscroll-contain min-h-0"
          >
            {localAnimating && (
              <div className="flex items-center justify-center h-24">
                <p className="text-night-500 text-xs animate-pulse uppercase tracking-widest">Sorteando...</p>
              </div>
            )}

            {isReady && sortedPlayers.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-night-500 text-sm">Nenhum jogador disponível</p>
                {swapsRemaining > 0 && <p className="text-gold-600 text-xs mt-1">Troque o elenco →</p>}
              </div>
            )}

            {isReady && sortedPlayers.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                gameMode={gameMode}
                compatible={canPickPlayer(player, draftSlots)}
                selected={selectedPlayer?.id === player.id}
                onSelect={handlePlayerSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftScreen;
