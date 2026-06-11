import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Difficulty, DraftSlot, Formation, GameMode, Player, Squad } from '../types/game';
import { ALL_SQUADS } from '../data/players';
import { canPickPlayer, canPlayerFillSlot, getCompatibleFreeSlots, getPositionColor, getPositionLabel } from '../utils/formations';
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

function timerMax(d: Difficulty) {
  return d === 'legendary' ? 30 : d === 'hard' ? 45 : 60;
}

// ---------- compact player row ----------
interface PlayerRowProps {
  player: Player;
  gameMode: GameMode;
  compatible: boolean;
  selected: boolean;
  onSelect: (player: Player) => void;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, gameMode, compatible, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  const handleRowClick = () => {
    if (!compatible) return;
    onSelect(player);
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  const allPositions = [
    getPositionLabel(player.position),
    ...player.altPositions.map((p) => getPositionLabel(p)),
  ].join(' / ');

  return (
    <div
      onClick={handleRowClick}
      className={`rounded-xl border transition-all duration-150 overflow-hidden select-none ${
        !compatible
          ? 'border-night-700 bg-night-850 opacity-40 cursor-default'
          : selected
          ? 'border-gold-500 bg-gold-900/20 ring-1 ring-gold-500/40 cursor-pointer active:scale-[0.99]'
          : 'border-night-500 bg-night-800 cursor-pointer hover:border-night-400 active:scale-[0.99]'
      }`}
    >
      {/* Main row — 3-column grid */}
      <div
        className="grid items-center gap-2 px-2.5 py-2"
        style={{ gridTemplateColumns: '48px minmax(0,1fr) 28px', minHeight: '60px' }}
      >
        {/* Col 1: overall + position badge */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <span className={`text-lg font-black leading-none tabular-nums ${compatible ? 'text-white' : 'text-gray-600'}`}>
            {player.overall}
          </span>
          <span className={`text-xs font-bold px-1 py-0.5 rounded leading-none ${getPositionColor(player.position)}`}>
            {getPositionLabel(player.position)}
          </span>
        </div>

        {/* Col 2: name + flag + positions + status */}
        <div className="min-w-0">
          <p className={`font-bold text-sm leading-tight truncate ${compatible ? 'text-white' : 'text-gray-500'}`}>
            {player.name}
          </p>
          <p className="text-gray-500 text-xs leading-tight mt-0.5 truncate">
            {player.nationality}{'  '}{allPositions}
          </p>
          {selected && (
            <p className="text-gold-400 text-xs mt-0.5 font-semibold leading-tight">
              ✓ Toque no campo para escalar
            </p>
          )}
          {!compatible && (
            <p className="text-red-800 text-xs mt-0.5 leading-tight">Sem posição livre compatível</p>
          )}
        </div>

        {/* Col 3: expand/collapse arrow only */}
        <button
          onClick={handleArrowClick}
          className="text-gray-600 hover:text-gray-400 text-xs flex items-center justify-center w-7 h-7 rounded flex-shrink-0"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-2.5 border-t border-night-700">
          {gameMode === 'classic' ? (
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs">
              <span className="text-red-400">ATK <b className="text-white">{player.attack}</b></span>
              <span className="text-blue-400">DEF <b className="text-white">{player.defense}</b></span>
              <span className="text-green-400">TEC <b className="text-white">{player.technique}</b></span>
              <span className="text-purple-400">MEN <b className="text-white">{player.mentality}</b></span>
              <span className="text-orange-400">FIS <b className="text-white">{player.physical}</b></span>
              <span className="text-gold-400">UCL <b className="text-white">{player.championsWeight}/10</b></span>
            </div>
          ) : (
            <p className="text-gray-600 text-xs mt-2">Modo expert — atributos ocultos.</p>
          )}
          <p className="text-gray-500 text-xs mt-1.5 italic leading-snug">{player.description}</p>
        </div>
      )}
    </div>
  );
};

// ---------- main screen ----------
const DraftScreen: React.FC<DraftScreenProps> = ({
  pickNumber,
  totalPicks,
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
  const maxTime = timerMax(difficulty);

  // ── Draw animation ──
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

  // ── Selected player (drives field highlighting) ──
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Clear selection on new round or reroll
  useEffect(() => {
    setSelectedPlayer(null);
  }, [pickNumber, isAnimating]);

  // ── Timer ──
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
    if (timeLeft <= 0) {
      setTimerRunning(false);
      onAutoSelect();
      return;
    }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  });

  // ── Player list sorted: compatible first, then by overall ──
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

  // ── Interaction handlers ──
  const handlePlayerSelect = (player: Player) => {
    if (!canPickPlayer(player, draftSlots)) return;
    setSelectedPlayer((prev) => (prev?.id === player.id ? null : player));
    setTimerRunning(false);
  };

  // Called when user taps a compatible slot on the pitch
  const handleSlotClick = (slotIndex: number) => {
    if (!selectedPlayer) return;
    const ds = draftSlots.find((d) => d.slot.slotIndex === slotIndex && d.player === null);
    if (!ds) return;
    if (!canPlayerFillSlot(selectedPlayer.position, selectedPlayer.altPositions, ds.slot.position)) return;
    const p = selectedPlayer;
    setSelectedPlayer(null);
    onPickPlayer(p, slotIndex);
  };

  // "Melhor jogador" — selects best compatible player, does NOT place
  const handleBestPlayerSelect = () => {
    for (const p of sortedPlayers) {
      if (canPickPlayer(p, draftSlots)) {
        setSelectedPlayer(p);
        setTimerRunning(false);
        return;
      }
    }
  };

  const timerPct = (timeLeft / maxTime) * 100;
  const timerColor = timerPct > 50 ? 'bg-green-500' : timerPct > 25 ? 'bg-yellow-500' : 'bg-red-500';
  const isReady = !localAnimating && !isAnimating;
  const filledCount = draftSlots.filter((s) => s.player !== null).length;

  // Hint shown below the pitch
  const pitchHint = selectedPlayer
    ? `Toque no campo para escalar ${selectedPlayer.name.split(' ').pop()}`
    : 'Selecione um jogador →';

  const compatibleSlotsCount = selectedPlayer
    ? getCompatibleFreeSlots(selectedPlayer, draftSlots).length
    : 0;

  return (
    <div className="min-h-screen bg-night-900 flex flex-col">

      {/* ── STICKY HUD ── */}
      <div className="sticky top-0 z-10 bg-night-900/95 backdrop-blur-sm border-b border-night-700 px-3 pt-2 pb-2 space-y-1.5">

        {/* Row 1: pick counter + squad + swaps */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white font-black text-sm flex-shrink-0">
              {pickNumber}<span className="text-gray-500 font-normal">/{totalPicks}</span>
            </span>
            <div className="h-4 w-px bg-night-600 flex-shrink-0" />
            <div className="min-w-0">
              <span
                className={`font-bold text-sm leading-none truncate block ${
                  localAnimating ? 'text-white animate-pulse' : 'text-gradient'
                }`}
              >
                {displaySquad || '...'}
              </span>
              {displaySeason && (
                <span className="text-gray-500 text-xs leading-none block">
                  {displaySeason}{currentSquad?.nickname && !localAnimating ? ` · ${currentSquad.nickname}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-xs ${i < swapsRemaining ? 'text-gold-400' : 'text-night-600'}`}>●</span>
            ))}
          </div>
        </div>

        {/* Row 2: timer bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-night-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ${timerColor}${timerPct <= 25 ? ' animate-pulse' : ''}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <span className={`text-xs font-black w-9 text-right tabular-nums flex-shrink-0 ${timerPct <= 25 ? 'text-red-400' : 'text-gray-500'}`}>
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Row 3: action buttons */}
        {isReady && (
          <div className="flex gap-2">
            <button
              onClick={onReroll}
              disabled={swapsRemaining === 0}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                swapsRemaining > 0
                  ? 'border border-gold-700 text-gold-400 hover:bg-gold-700/30 active:scale-95'
                  : 'border border-night-700 text-night-600 cursor-not-allowed'
              }`}
            >
              🔄 Trocar elenco ({swapsRemaining})
            </button>
            <button
              onClick={handleBestPlayerSelect}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-sapphire-700 text-sapphire-400 hover:bg-sapphire-700/30 transition-all active:scale-95"
            >
              ⚡ Melhor jogador
            </button>
          </div>
        )}

        {/* Row 4: progress dots */}
        <div className="flex gap-0.5">
          {draftSlots.map((ds, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                ds.player !== null ? 'bg-gold-500' : i === filledCount ? 'bg-sapphire-400' : 'bg-night-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT: always side-by-side ── */}
      <div className="flex-1 flex flex-row overflow-hidden">

        {/* ── LEFT: Field (40%) ── */}
        <div className="w-[40%] flex-shrink-0 flex flex-col border-r border-night-700 bg-night-850">
          <p className="text-gray-600 text-xs uppercase tracking-widest text-center pt-2 pb-1 font-semibold">
            {formation} · {filledCount}/{totalPicks}
          </p>

          <div className="flex-1 min-h-0 px-2 pb-2">
            <TeamPitch
              draftSlots={draftSlots}
              gameMode={gameMode}
              selectedPlayer={selectedPlayer}
              onSlotClick={handleSlotClick}
            />
          </div>

          {/* Pitch hint */}
          <div className="px-2 pb-3 text-center">
            {selectedPlayer ? (
              <div className="space-y-0.5">
                <p className="text-gold-400 text-xs font-bold leading-snug">{pitchHint}</p>
                <p className="text-gray-600 text-xs">
                  {compatibleSlotsCount} {compatibleSlotsCount === 1 ? 'vaga' : 'vagas'} disponível{compatibleSlotsCount !== 1 ? 'is' : ''}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 text-xs">{pitchHint}</p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Player list (60%, scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {localAnimating && (
            <div className="flex items-center justify-center h-32">
              <div className="text-center animate-pulse">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Sorteando...</p>
                <p className="text-white font-black text-xl">{displaySquad}</p>
              </div>
            </div>
          )}

          {isReady && sortedPlayers.length === 0 && (
            <div className="rounded-xl border border-night-600 p-4 text-center bg-night-800">
              <p className="text-gray-400 text-sm">Nenhum jogador compatível.</p>
              {swapsRemaining > 0 && <p className="text-gold-400 text-xs mt-1">Troque o elenco acima.</p>}
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
  );
};

export default DraftScreen;
