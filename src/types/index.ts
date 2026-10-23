// ============================================================
// Biryani Tap Challenge - Type Definitions
// ============================================================

// Database enums
export type GiveawayStatus = 'draft' | 'scheduled' | 'live' | 'ended';
export type SessionType = 'practice' | 'official';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

// ============================================================
// Database Models
// ============================================================

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  is_admin: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  prize_name: string;
  status: GiveawayStatus;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  leaderboard_visible: boolean;
  practice_enabled: boolean;
  winner_id: string | null;
  winner_name: string | null;
  winner_total_time: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  giveaway_id: string;
  session_type: SessionType;
  status: SessionStatus;
  current_round: number;
  total_reaction_time: number | null;
  fastest_reaction_time: number | null;
  wrong_taps: number;
  early_taps: number;
  is_suspicious: boolean;
  suspicious_reason: string | null;
  started_at: string;
  completed_at: string | null;
  server_seed: string;
  created_at: string;
}

export interface GameRound {
  id: string;
  session_id: string;
  round_number: number;
  target_bowl: number;
  reaction_time_ms: number | null;
  tapped_bowl: number | null;
  was_correct: boolean | null;
  early_tap: boolean;
  wrong_tap: boolean;
  chicken_appeared_at: string | null;
  tap_received_at: string | null;
  delay_ms: number;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  giveaway_id: string;
  user_id: string;
  session_id: string;
  player_name: string;
  total_reaction_time: number;
  fastest_reaction_time: number;
  completed_at: string;
  rank: number | null;
  is_suspicious: boolean;
  created_at: string;
}

// ============================================================
// API Request/Response Types
// ============================================================

export interface CreateGiveawayRequest {
  title: string;
  description?: string;
  prize_name: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  leaderboard_visible?: boolean;
  practice_enabled?: boolean;
  status?: GiveawayStatus;
}

export interface UpdateGiveawayRequest extends Partial<CreateGiveawayRequest> {
  id: string;
}

export interface StartGameRequest {
  giveaway_id: string;
  session_type: SessionType;
}

export interface StartGameResponse {
  session_id: string;
  round_number: number;
  delay_ms: number;
  target_bowl: number;
  server_time: string;
}

export interface SubmitRoundRequest {
  session_id: string;
  round_number: number;
  reaction_time_ms: number;
  tapped_bowl: number;
}

export interface SubmitRoundResponse {
  accepted: boolean;
  verified_reaction_time_ms: number;
  was_correct: boolean;
  is_early: boolean;
  is_wrong: boolean;
  next_round?: {
    round_number: number;
    delay_ms: number;
    target_bowl: number;
  };
  session_complete?: boolean;
  total_reaction_time?: number;
  fastest_reaction_time?: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  current_user_rank?: number;
  total_participants: number;
  giveaway: Pick<Giveaway, 'id' | 'title' | 'status' | 'winner_id' | 'winner_name' | 'winner_total_time'>;
}

export interface ServerTimeResponse {
  server_time: string;
  giveaway_end_time?: string;
  remaining_seconds?: number;
}

// ============================================================
// Game State Types (Client-side)
// ============================================================

export type GamePhase =
  | 'idle'
  | 'get_ready'
  | 'waiting'
  | 'chicken_visible'
  | 'tapped'
  | 'early_tap'
  | 'wrong_tap'
  | 'round_result'
  | 'game_complete';

export interface GameState {
  phase: GamePhase;
  sessionId: string | null;
  sessionType: SessionType;
  currentRound: number;
  totalRounds: number;
  targetBowl: number | null;
  delayMs: number;
  roundTimes: number[];
  wrongTaps: number;
  earlyTaps: number;
  chickenAppearedAt: number | null;
  isPenalized: boolean;
}

export interface RoundResult {
  roundNumber: number;
  reactionTimeMs: number;
  wasCorrect: boolean;
  wasEarly: boolean;
  wasWrong: boolean;
}

// ============================================================
// Admin Types
// ============================================================

export interface AdminParticipantDetail {
  profile: Profile;
  session: GameSession | null;
  rounds: GameRound[];
  leaderboard_entry: LeaderboardEntry | null;
}

export interface AdminGiveawayStats {
  total_registrations: number;
  verified_participants: number;
  official_attempts_completed: number;
  current_leader: LeaderboardEntry | null;
}

// ============================================================
// Countdown Types
// ============================================================

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  serverTimeDiff: number; // diff between server and client time
}
