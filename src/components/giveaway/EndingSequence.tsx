'use client';

import React, { useEffect, useState } from 'react';
import WinnerReveal from '../winner/WinnerReveal';

interface Props {
  giveawayId: string;
  totalSeconds: number;
}

export default function EndingSequence({ giveawayId, totalSeconds }: Props) {
  const [showWinner, setShowWinner] = useState(false);
  const [winnerData, setWinnerData] = useState<{name: string; time: number} | null>(null);

  useEffect(() => {
    if (totalSeconds <= 0 && !showWinner) {
      // Trigger ending
      const fetchWinner = async () => {
        try {
          const res = await fetch(`/api/leaderboard/${giveawayId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.giveaway?.winner_name) {
              setWinnerData({
                name: data.giveaway.winner_name,
                time: data.giveaway.winner_total_time || 0
              });
            } else if (data.entries?.length > 0) {
              setWinnerData({
                name: data.entries[0].player_name,
                time: data.entries[0].total_reaction_time
              });
            }
          }
        } catch (e) {
          console.error('Failed to fetch winner', e);
        }
      };
      
      fetchWinner();
      setShowWinner(true);
    }
  }, [totalSeconds, giveawayId, showWinner]);

  if (totalSeconds <= 10 && totalSeconds > 0) {
    return (
      <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
        <div className={`absolute inset-0 bg-red-900/20 ${totalSeconds <= 10 ? 'animate-pulse' : ''}`} />
        {totalSeconds <= 3 && (
          <div className="text-[200px] font-black text-red-500/50 font-mono animate-ping">
            {totalSeconds}
          </div>
        )}
      </div>
    );
  }

  if (showWinner && winnerData) {
    return <WinnerReveal winnerName={winnerData.name} winnerTime={winnerData.time} />;
  }
  
  if (showWinner && !winnerData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-white text-2xl font-bold animate-pulse">
          Calculating winner...
        </div>
      </div>
    );
  }

  return null;
}
