'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry } from '@/types';
import LeaderboardRow from './LeaderboardRow';

interface Props {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showAnimation?: boolean;
}

export default function LeaderboardList({ entries, currentUserId, showAnimation = true }: Props) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-white mb-2">No entries yet</h3>
        <p className="text-slate-400">Be the first to set a time!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence>
        {entries.map((entry, index) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            rank={index + 1}
            isCurrentUser={entry.user_id === currentUserId}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
