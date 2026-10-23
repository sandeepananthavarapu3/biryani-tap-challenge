'use client';
import { formatTime } from '@/lib/game/scoring';
import { motion } from 'framer-motion';
import { SessionType } from '@/types';

interface GameResultsProps {
  roundTimes: number[];
  sessionType: SessionType;
  onRestart: () => void;
  onExit: () => void;
}

export function GameResults({ roundTimes, sessionType, onRestart, onExit }: GameResultsProps) {
  const totalTime = roundTimes.reduce((a, b) => a + b, 0);
  const fastestTime = Math.min(...roundTimes);

  return (
    <div className="absolute inset-0 overflow-y-auto bg-black/90 z-50 flex items-start justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full my-auto bg-gradient-to-br from-slate-900 via-zinc-900 to-amber-950 rounded-3xl p-5 border border-amber-400/30 flex flex-col items-center"
      >
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-wide">GAME COMPLETE!</h1>
        
        <div className="my-8 w-full flex flex-col items-center gap-2 bg-black/40 rounded-2xl p-6">
          <span className="text-zinc-400 font-medium tracking-widest uppercase">Total Time</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">⚡ {formatTime(totalTime)}</span>
          
          <div className="mt-4 flex gap-2 items-center bg-white/5 px-4 py-2 rounded-full">
            <span className="text-zinc-400 text-sm">Fastest tap:</span>
            <span className="text-white font-bold">{formatTime(fastestTime)}</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 mb-8 max-h-48 overflow-y-auto pr-2">
          {roundTimes.map((time, i) => (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg"
            >
              <span className="text-zinc-400">Round {i + 1}</span>
              <span className="text-white font-mono font-bold">{formatTime(time)}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4 w-full">
          {sessionType === 'practice' ? (
            <>
              <button 
                onClick={onExit}
                className="flex-1 py-4 rounded-xl font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={onRestart}
                className="flex-1 py-4 rounded-xl font-bold text-black bg-white hover:bg-zinc-200 transition-colors"
              >
                Try Again
              </button>
            </>
          ) : (
            <button 
              onClick={onExit}
              className="w-full py-4 rounded-xl font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors text-lg"
            >
              View Leaderboard
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
