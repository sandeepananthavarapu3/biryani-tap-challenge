import { create } from 'zustand';
import { GamePhase, SessionType } from '@/types';

interface GameStore {
  // Current game state
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
  
  // Actions
  startGame: (sessionId: string, type: SessionType, firstRound: { delay_ms: number; target_bowl: number }) => void;
  setPhase: (phase: GamePhase) => void;
  showChicken: () => void;
  recordTap: (reactionTime: number) => void;
  recordEarlyTap: () => void;
  recordWrongTap: () => void;
  nextRound: (data: { delay_ms: number; target_bowl: number }) => void;
  completeGame: () => void;
  reset: () => void;
  setPenalized: (v: boolean) => void;
}

const initialState = {
  phase: 'idle' as GamePhase,
  sessionId: null,
  sessionType: 'practice' as SessionType,
  currentRound: 0,
  totalRounds: 10,
  targetBowl: null,
  delayMs: 0,
  roundTimes: [],
  wrongTaps: 0,
  earlyTaps: 0,
  chickenAppearedAt: null,
  isPenalized: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  
  startGame: (sessionId, type, firstRound) => set({
    ...initialState,
    phase: 'get_ready',
    sessionId,
    sessionType: type,
    currentRound: 1,
    delayMs: firstRound.delay_ms,
    targetBowl: firstRound.target_bowl,
  }),
  
  setPhase: (phase) => set({ phase }),
  
  showChicken: () => set({
    phase: 'chicken_visible',
    chickenAppearedAt: performance.now(),
  }),
  
  recordTap: (reactionTime) => set((state) => ({
    phase: 'tapped',
    roundTimes: [...state.roundTimes, reactionTime],
  })),
  
  recordEarlyTap: () => set((state) => ({
    phase: 'early_tap',
    earlyTaps: state.earlyTaps + 1,
    isPenalized: true,
  })),
  
  recordWrongTap: () => set((state) => ({
    phase: 'wrong_tap',
    wrongTaps: state.wrongTaps + 1,
    isPenalized: true,
  })),
  
  nextRound: (data) => set((state) => ({
    phase: 'waiting',
    currentRound: state.currentRound + 1,
    delayMs: data.delay_ms,
    targetBowl: data.target_bowl,
    chickenAppearedAt: null,
    isPenalized: false,
  })),
  
  completeGame: () => set({
    phase: 'game_complete',
    isPenalized: false,
  }),
  
  reset: () => set(initialState),
  
  setPenalized: (v) => set({ isPenalized: v }),
}));
