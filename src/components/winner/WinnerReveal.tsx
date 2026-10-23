'use client';
import { formatTime } from '@/lib/game/scoring';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from './Confetti';

interface Props {
  winnerName: string;
  winnerTime: number;
  onComplete?: () => void;
}

export default function WinnerReveal({ winnerName, winnerTime, onComplete }: Props) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 3000); // Countdown 3..2..1 ends
    const timer2 = setTimeout(() => setStage(2), 5000); // GIVEAWAY CLOSED
    const timer3 = setTimeout(() => setStage(3), 6000); // Pause
    const timer4 = setTimeout(() => setStage(4), 8000); // THE BIRYANI WINNER IS...
    const timer5 = setTimeout(() => {
      setStage(5); // Reveal
      if (onComplete) onComplete();
    }, 11000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-white text-8xl font-black font-mono"
          >
            <CountdownSequence />
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="closed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-6xl md:text-8xl font-black text-center tracking-tighter"
          >
            GIVEAWAY CLOSED
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.5 }}
            className="text-yellow-500 text-4xl md:text-6xl font-bold text-center tracking-widest"
          >
            THE BIRYANI WINNER IS...
          </motion.div>
        )}

        {stage >= 5 && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
            className="relative flex flex-col items-center justify-center w-full max-w-2xl px-4"
          >
            <Confetti />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/30 to-transparent z-0 h-[150%] w-[150%] -translate-x-1/4 -translate-y-1/4" />
            
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4 relative z-10"
            >
              👑
            </motion.div>
            
            <div className="bg-slate-900/80 backdrop-blur-md border border-yellow-500/50 p-8 md:p-12 rounded-3xl shadow-2xl shadow-yellow-500/20 text-center relative z-10 w-full">
              <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 mb-6 drop-shadow-sm">
                {winnerName}
              </h2>
              
              <div className="bg-black/50 rounded-xl p-4 inline-block mb-6 border border-slate-700">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Total Time</p>
                <p className="text-white text-2xl font-mono font-bold">⚡ {formatTime(winnerTime)}</p>
              </div>
              
              <div className="text-2xl md:text-3xl font-bold text-white">
                🍗🍚 YOU WON THE BIRYANI!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CountdownSequence() {
  const [count, setCount] = useState(3);
  
  useEffect(() => {
    if (count > 1) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);
  
  return (
    <motion.div
      key={count}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.5, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {count}
    </motion.div>
  );
}
