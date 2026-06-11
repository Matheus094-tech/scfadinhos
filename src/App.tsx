import React, { useState, useCallback, useEffect } from 'react';
import { Difficulty, DraftSlot, Formation, GameMode, GameState, Player, Screen, Squad } from './types/game';
import { ALL_SQUADS } from './data/players';
import { getFormationSlots, canPlayerFillSlot, canPickPlayer, getCompatibleFreeSlots } from './utils/formations';
import { calculateTeamStats } from './utils/teamChemistry';
import { simulateCampaign } from './utils/simulation';
import HomeScreen from './components/HomeScreen';
import HowToPlayModal from './components/HowToPlayModal';
import GameSetup from './components/GameSetup';
import DraftScreen from './components/DraftScreen';
import TeamReview from './components/TeamReview';
import SimulationScreen from './components/SimulationScreen';
import FinalResult from './components/FinalResult';

const TOTAL_ROUNDS = 11;
const INITIAL_SWAPS = 3;

function createInitialDraftSlots(formation: Formation): DraftSlot[] {
  return getFormationSlots(formation).map((slot) => ({ slot, player: null }));
}

function getInitialState(): GameState {
  return {
    screen: 'home',
    formation: '4-3-3',
    gameMode: 'classic',
    difficulty: 'normal',
    currentRound: 1,
    currentSquad: null,
    availablePlayers: [],
    draftSlots: [],
    usedSquadIds: [],
    swapsRemaining: INITIAL_SWAPS,
    isAnimating: false,
    animatingSquadName: '',
    teamStats: null,
    campaignStats: null,
  };
}

function pickRandomSquad(allSquads: Squad[], usedIds: string[]): Squad {
  const available = allSquads.filter((s) => !usedIds.includes(s.id));
  if (available.length === 0) return allSquads[Math.floor(Math.random() * allSquads.length)];
  return available[Math.floor(Math.random() * available.length)];
}

// Returns the full squad roster sorted by overall (max 16 shown).
// All players are returned; compatible/incompatible state is computed per-player in DraftScreen.
function squadRoster(squad: Squad): Player[] {
  return [...squad.players].sort((a, b) => b.overall - a.overall).slice(0, 16);
}

// Start a new round. Retries up to 5 squads if none has any compatible player.
function startRound(state: GameState, overrideSquad?: Squad): Partial<GameState> {
  let squad = overrideSquad ?? pickRandomSquad(ALL_SQUADS, state.usedSquadIds);
  const usedIds = [...state.usedSquadIds, squad.id];

  let attempts = 0;
  while (!squad.players.some((p) => canPickPlayer(p, state.draftSlots)) && attempts < 5) {
    squad = pickRandomSquad(ALL_SQUADS, usedIds);
    usedIds.push(squad.id);
    attempts++;
  }

  return {
    currentSquad: squad,
    availablePlayers: squadRoster(squad),
    usedSquadIds: usedIds,
    isAnimating: true,
    animatingSquadName: squad.club,
  };
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const updateState = useCallback((updates: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    if (gameState.isAnimating) {
      const timer = setTimeout(() => updateState({ isAnimating: false }), 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isAnimating, updateState]);

  const handleStartGame = useCallback(() => updateState({ screen: 'setup' }), [updateState]);

  const handleSetupDone = useCallback(() => {
    const draftSlots = createInitialDraftSlots(gameState.formation);
    const initialState: Partial<GameState> = {
      screen: 'draft',
      currentRound: 1,
      draftSlots,
      usedSquadIds: [],
      swapsRemaining: INITIAL_SWAPS,
      teamStats: null,
      campaignStats: null,
    };
    const roundState = startRound({ ...gameState, ...initialState } as GameState);
    updateState({ ...initialState, ...roundState });
  }, [gameState, updateState]);

  // Place a player into a specific slot (slot index must be free and compatible).
  const handlePlayerPicked = useCallback(
    (player: Player, slotIndex: number) => {
      const { draftSlots, currentRound, formation } = gameState;

      const targetSlot = draftSlots.find((ds) => ds.slot.slotIndex === slotIndex && ds.player === null);
      if (!targetSlot) return;
      if (!canPlayerFillSlot(player.position, player.altPositions, targetSlot.slot.position)) return;

      const newDraftSlots = draftSlots.map((ds) =>
        ds.slot.slotIndex === slotIndex ? { ...ds, player } : ds
      );

      const nextRound = currentRound + 1;

      if (nextRound > TOTAL_ROUNDS) {
        try {
          const teamStats = calculateTeamStats(
            newDraftSlots.filter((s) => s.player !== null),
            formation
          );
          updateState({ draftSlots: newDraftSlots, currentRound: nextRound, screen: 'team-review', teamStats });
        } catch {
          updateState({ draftSlots: newDraftSlots, currentRound: nextRound, screen: 'team-review' });
        }
      } else {
        const nextState: GameState = { ...gameState, draftSlots: newDraftSlots, currentRound: nextRound };
        const roundUpdates = startRound(nextState);
        updateState({ draftSlots: newDraftSlots, currentRound: nextRound, ...roundUpdates });
      }
    },
    [gameState, updateState]
  );

  // Auto-select: pick the highest-overall player that still has a free compatible slot.
  const handleAutoSelect = useCallback(() => {
    const { availablePlayers, draftSlots } = gameState;
    for (const player of availablePlayers) {
      const slots = getCompatibleFreeSlots(player, draftSlots);
      if (slots.length > 0) {
        handlePlayerPicked(player, slots[0].slot.slotIndex);
        return;
      }
    }
  }, [gameState, handlePlayerPicked]);

  const handleReroll = useCallback(() => {
    const { swapsRemaining } = gameState;
    if (swapsRemaining <= 0) return;
    const roundUpdates = startRound(gameState);
    updateState({ swapsRemaining: swapsRemaining - 1, ...roundUpdates });
  }, [gameState, updateState]);

  const handleSimulate = useCallback(() => {
    const { draftSlots, formation, difficulty, teamStats } = gameState;
    const stats = teamStats ?? calculateTeamStats(draftSlots.filter((s) => s.player !== null), formation);
    const campaignStats = simulateCampaign(draftSlots, stats, difficulty, ALL_SQUADS);
    updateState({ screen: 'simulation', teamStats: stats, campaignStats });
  }, [gameState, updateState]);

  const handleFinishSimulation = useCallback(() => updateState({ screen: 'result' }), [updateState]);
  const handleRestart = useCallback(() => setGameState(getInitialState()), []);

  const setFormation = useCallback((f: Formation) => updateState({ formation: f }), [updateState]);
  const setGameMode = useCallback((m: GameMode) => updateState({ gameMode: m }), [updateState]);
  const setDifficulty = useCallback((d: Difficulty) => updateState({ difficulty: d }), [updateState]);
  const goBackToHome = useCallback(() => updateState({ screen: 'home' }), [updateState]);
  const goBackToDraft = useCallback(() => updateState({ screen: 'draft' }), [updateState]);

  const renderScreen = (screen: Screen) => {
    switch (screen) {
      case 'home':
        return <HomeScreen onStart={handleStartGame} onHowToPlay={() => setShowHowToPlay(true)} />;
      case 'setup':
        return (
          <GameSetup
            formation={gameState.formation}
            gameMode={gameState.gameMode}
            difficulty={gameState.difficulty}
            onFormationChange={setFormation}
            onGameModeChange={setGameMode}
            onDifficultyChange={setDifficulty}
            onStart={handleSetupDone}
            onBack={goBackToHome}
          />
        );
      case 'draft':
        return (
          <DraftScreen
            pickNumber={gameState.currentRound}
            totalPicks={TOTAL_ROUNDS}
            currentSquad={gameState.currentSquad}
            availablePlayers={gameState.availablePlayers}
            draftSlots={gameState.draftSlots}
            formation={gameState.formation}
            gameMode={gameState.gameMode}
            difficulty={gameState.difficulty}
            swapsRemaining={gameState.swapsRemaining}
            isAnimating={gameState.isAnimating}
            animatingSquadName={gameState.animatingSquadName}
            onPickPlayer={handlePlayerPicked}
            onReroll={handleReroll}
            onAutoSelect={handleAutoSelect}
          />
        );
      case 'team-review':
        return gameState.teamStats ? (
          <TeamReview
            draftSlots={gameState.draftSlots}
            formation={gameState.formation}
            gameMode={gameState.gameMode}
            teamStats={gameState.teamStats}
            onSimulate={handleSimulate}
            onBack={goBackToDraft}
          />
        ) : null;
      case 'simulation':
        return gameState.campaignStats ? (
          <SimulationScreen campaignStats={gameState.campaignStats} onFinish={handleFinishSimulation} />
        ) : null;
      case 'result':
        return gameState.campaignStats && gameState.teamStats ? (
          <FinalResult
            campaignStats={gameState.campaignStats}
            teamStats={gameState.teamStats}
            formation={gameState.formation}
            draftSlots={gameState.draftSlots}
            onRestart={handleRestart}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-night-900 text-white">
      {renderScreen(gameState.screen)}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
};

export default App;
