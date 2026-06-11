export type Position = 'GK' | 'RB' | 'CB' | 'LB' | 'CDM' | 'CM' | 'CAM' | 'RM' | 'LM' | 'RW' | 'LW' | 'ST';
export type Formation = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2';
export type GameMode = 'classic' | 'expert';
export type Difficulty = 'normal' | 'hard' | 'legendary';
export type Screen = 'home' | 'setup' | 'draft' | 'team-review' | 'simulation' | 'result';
export type Phase = 'champion' | 'final' | 'semifinal' | 'quarterfinal' | 'round16' | 'groups';

export interface Player {
  id: string;
  name: string;
  club: string;
  season: string;
  nationality: string;
  position: Position;
  altPositions: Position[];
  overall: number;
  attack: number;
  defense: number;
  technique: number;
  mentality: number;
  physical: number;
  championsWeight: number;
  description: string;
}

export interface Squad {
  id: string;
  club: string;
  season: string;
  nickname: string;
  country: string;
  accentColor: string;
  historicalWeight: number;   // 1-10
  attackRating: number;       // 60-99
  midfieldRating: number;     // 60-99
  defenseRating: number;      // 60-99
  goalkeeperRating: number;   // 60-99
  chemistryRating: number;    // 60-99
  mentalityRating: number;    // 60-99
  overallRating: number;      // 60-99 — drives opponent difficulty in simulation
  description: string;
  players: Player[];
}

export interface FormationSlot {
  position: Position;
  slotIndex: number;
  x: number;
  y: number;
}

export interface DraftSlot {
  slot: FormationSlot;
  player: Player | null;
}

export interface TeamStats {
  overall: number;
  offensiveForce: number;
  defensiveForce: number;
  midfieldControl: number;
  europeanExperience: number;
  chemistry: number;
  starPlayer: Player;
  strength: string;
  weakness: string;
}

export interface MatchResult {
  round: string;
  opponent: string;
  opponentSeason: string;
  homeScore: number;   // always = user goals
  awayScore: number;  // always = opponent goals
  scorers: string[];
  highlight: string;
  summary: string;
  isAway?: boolean;
}

export interface GroupEntry {
  teamName: string;
  teamSeason: string;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  isUser: boolean;
}

export interface CampaignStats {
  phase: Phase;
  matches: MatchResult[];
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  topScorer: string;
  topScorerGoals: number;
  bestPlayer: string;
  rating: number;
  finalPhrase: string;
  groupTable?: GroupEntry[];
}

export interface GameState {
  screen: Screen;
  formation: Formation;
  gameMode: GameMode;
  difficulty: Difficulty;
  currentRound: number;
  currentSquad: Squad | null;
  availablePlayers: Player[];
  draftSlots: DraftSlot[];
  usedSquadIds: string[];
  swapsRemaining: number;
  isAnimating: boolean;
  animatingSquadName: string;
  teamStats: TeamStats | null;
  campaignStats: CampaignStats | null;
}
