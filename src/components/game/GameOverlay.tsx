'use client';
import { formatTime } from '@/lib/game/scoring';
import { motion, AnimatePresence } from 'framer-motion';
import { GamePhase, SessionType } from '@/types';

interface GameOverlayProps {
  phase: GamePhase;
  sessionType: SessionType;
  currentRound: number;
  totalRounds: number;
  lastReactionTime: number | null;
}

export function GameOverlay({ phase, sessionType, currentRound, totalRounds, lastReactionTime }: GameOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-4 z-10">
      
      {/* Top Bar */}
      <div className="w-full px-3 gap-2 flex justify-between items-start">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className="text-white text-xs sm:text-base font-bold tracking-wider">
            ROUND {currentRound} / {totalRounds}
          </span>
        </div>
        
        <div className={`px-4 py-2 rounded-full border ${
          sessionType === 'official' 
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
        }`}>
          <span className="font-bold text-xs sm:text-sm tracking-wide uppercase">
            {sessionType} ATTEMPT
          </span>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-2/3 max-w-md rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" animate={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-amber-200">{phase === 'chicken_visible' ? '🍗 Tap the chicken!' : phase === 'waiting' ? '👀 Watch the bowls…' : phase === 'tapped' ? '✨ Nice catch!' : ''}</p>
      {/* Center Messages */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'get_ready' && (
            <motion.h1
              key="ready"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-3xl sm:text-6xl text-center font-black text-white drop-shadow-lg tracking-widest"
            >
              GET READY...
            </motion.h1>
          )}

          {phase === 'tapped' && lastReactionTime && (
            <motion.div
              key="tapped"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4 bg-black/60 px-8 py-4 rounded-3xl backdrop-blur-md"
            >
              <span className="text-4xl">⚡</span>
              <span className="text-xl sm:text-3xl text-center font-black text-white">{formatTime(lastReactionTime)}</span>
            </motion.div>
          )}

          {phase === 'early_tap' && (
            <motion.h2
              key="early"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: [0, -10, 10, -10, 10, 0], opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-2xl sm:text-5xl text-center font-black text-red-500 drop-shadow-lg"
            >
              ❌ TOO EARLY!
            </motion.h2>
          )}

          {phase === 'wrong_tap' && (
            <motion.h2
              key="wrong"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-2xl sm:text-5xl text-center font-black text-red-500 drop-shadow-lg"
            >
              ❌ WRONG BOWL!
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
