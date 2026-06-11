import React, { useState, useCallback, useEffect } from 'react';
import { Difficulty, DraftSlot, Formation, GameMode, GameState, Player, Screen, Squad } from './types/game';
import { ALL_SQUADS } from './data/players';
import { getFormationSlots, canPlayerFillSlot } from './utils/formations';
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
const MAX_PLAYERS_SHOWN = 5;

function createInitialDraftSlots(formation: Formation): DraftSlot[] {
  return getFormationSlots(formation).map((slot) => ({
    slot,
    player: null,
  }));
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
  if (available.length === 0) {
    // If all squads used, reset
    return allSquads[Math.floor(Math.random() * allSquads.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}


function filterCompatiblePlayers(squad: Squad, draftSlots: DraftSlot[]): Player[] {
  const openSlots = draftSlots.filter((ds) => ds.player === null).map((ds) => ds.slot.position);

  const compatible = squad.players.filter((player) =>
    openSlots.some((slotPos) => canPlayerFillSlot(player.position, player.altPositions, slotPos))
  );

  // Sort by overall descending, then shuffle the top picks
  compatible.sort((a, b) => b.overall - a.overall);

  // Take top candidates and shuffle a subset to show
  const topPool = compatible.slice(0, 8);
  // Fisher-Yates shuffle
  for (let i = topPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [topPool[i], topPool[j]] = [topPool[j], topPool[i]];
  }

  return topPool.slice(0, MAX_PLAYERS_SHOWN);
}

function startRound(
  state: GameState,
  overrideSquad?: Squad
): Partial<GameState> {
  const squad = overrideSquad ?? pickRandomSquad(ALL_SQUADS, state.usedSquadIds);
  const players = filterCompatiblePlayers(squad, state.draftSlots);

  return {
    currentSquad: squad,
    availablePlayers: players,
    usedSquadIds: [...state.usedSquadIds, squad.id],
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

  // Clear animation flag after it fires
  useEffect(() => {
    if (gameState.isAnimating) {
      // Animation handled in DraftScreen; clear after 1.5 seconds
      const timer = setTimeout(() => {
        updateState({ isAnimating: false });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isAnimating, updateState]);

  const handleStartGame = useCallback(() => {
    updateState({ screen: 'setup' });
  }, [updateState]);

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

  const handlePlayerPicked = useCallback(
    (player: Player) => {
      const { draftSlots, currentRound, formation } = gameState;

      // Find best open slot for this player
      const openSlots = draftSlots.filter((ds) => ds.player === null);
      const compatibleSlot = openSlots.find((ds) =>
        canPlayerFillSlot(player.position, player.altPositions, ds.slot.position)
      );

      if (!compatibleSlot) return;

      const newDraftSlots = draftSlots.map((ds) =>
        ds.slot.slotIndex === compatibleSlot.slot.slotIndex
          ? { ...ds, player }
          : ds
      );

      const nextRound = currentRound + 1;

      if (nextRound > TOTAL_ROUNDS) {
        // All rounds done — go to review
        try {
          const teamStats = calculateTeamStats(
            newDraftSlots.filter((s) => s.player !== null),
            formation
          );
          updateState({
            draftSlots: newDraftSlots,
            currentRound: nextRound,
            screen: 'team-review',
            teamStats,
          });
        } catch {
          updateState({
            draftSlots: newDraftSlots,
            currentRound: nextRound,
            screen: 'team-review',
          });
        }
      } else {
        // Start next round
        const nextState: GameState = {
          ...gameState,
          draftSlots: newDraftSlots,
          currentRound: nextRound,
        };
        const roundUpdates = startRound(nextState);
        updateState({
          draftSlots: newDraftSlots,
          currentRound: nextRound,
          ...roundUpdates,
        });
      }
    },
    [gameState, updateState]
  );

  const handleReroll = useCallback(() => {
    const { swapsRemaining, usedSquadIds } = gameState;
    if (swapsRemaining <= 0) return;

    const newSquad = pickRandomSquad(
      ALL_SQUADS,
      usedSquadIds
    );
    const players = filterCompatiblePlayers(newSquad, gameState.draftSlots);

    updateState({
      swapsRemaining: swapsRemaining - 1,
      currentSquad: newSquad,
      availablePlayers: players,
      usedSquadIds: [...usedSquadIds, newSquad.id],
      isAnimating: true,
      animatingSquadName: newSquad.club,
    });
  }, [gameState, updateState]);

  const handleSimulate = useCallback(() => {
    const { draftSlots, formation, difficulty, teamStats } = gameState;
    const stats = teamStats ?? calculateTeamStats(draftSlots.filter((s) => s.player !== null), formation);
    const campaignStats = simulateCampaign(draftSlots, stats, difficulty, ALL_SQUADS);
    updateState({
      screen: 'simulation',
      teamStats: stats,
      campaignStats,
    });
  }, [gameState, updateState]);

  const handleFinishSimulation = useCallback(() => {
    updateState({ screen: 'result' });
  }, [updateState]);

  const handleRestart = useCallback(() => {
    setGameState(getInitialState());
  }, []);

  const setFormation = useCallback((f: Formation) => updateState({ formation: f }), [updateState]);
  const setGameMode = useCallback((m: GameMode) => updateState({ gameMode: m }), [updateState]);
  const setDifficulty = useCallback((d: Difficulty) => updateState({ difficulty: d }), [updateState]);

  const goBackToHome = useCallback(() => updateState({ screen: 'home' }), [updateState]);
  const goBackToDraft = useCallback(() => updateState({ screen: 'draft' }), [updateState]);

  const renderScreen = (screen: Screen) => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onStart={handleStartGame}
            onHowToPlay={() => setShowHowToPlay(true)}
          />
        );
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
            round={gameState.currentRound}
            totalRounds={TOTAL_ROUNDS}
            currentSquad={gameState.currentSquad}
            availablePlayers={gameState.availablePlayers}
            draftSlots={gameState.draftSlots}
            formation={gameState.formation}
            gameMode={gameState.gameMode}
            swapsRemaining={gameState.swapsRemaining}
            isAnimating={gameState.isAnimating}
            animatingSquadName={gameState.animatingSquadName}
            onPickPlayer={handlePlayerPicked}
            onReroll={handleReroll}
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
          <SimulationScreen
            campaignStats={gameState.campaignStats}
            onFinish={handleFinishSimulation}
          />
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
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
};

export default App;
