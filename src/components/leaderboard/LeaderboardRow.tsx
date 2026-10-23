'use client';
import { formatTime } from '@/lib/game/scoring';

import React from 'react';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from '@/types';

interface Props {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}

export default function LeaderboardRow({ entry, rank, isCurrentUser }: Props) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <div className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(250,204,21,0.5)]">1</div>;
      case 2:
        return <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(203,213,225,0.5)]">2</div>;
      case 3:
        return <div className="w-8 h-8 rounded-full bg-amber-600 text-amber-100 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(217,119,6,0.5)]">3</div>;
      default:
        return <div className="w-8 h-8 flex items-center justify-center font-bold text-sm text-slate-400">{rank}</div>;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex items-center justify-between p-4 mb-3 rounded-xl border transition-colors ${
        isCurrentUser 
          ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
          : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center space-x-4">
        {getRankBadge(rank)}
        <div>
          <div className="font-bold text-white flex items-center space-x-2">
            <span>{entry.player_name}</span>
            {isCurrentUser && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">YOU</span>}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            Fastest: {formatTime(entry.fastest_reaction_time)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono font-black text-lg text-yellow-400">
          {formatTime(entry.total_reaction_time)}
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">
          Total Time
        </div>
      </div>
    </motion.div>
  );
}
