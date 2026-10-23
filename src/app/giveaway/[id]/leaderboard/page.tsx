'use client';
import { formatTime } from '@/lib/game/scoring';

import React, { useEffect, useState } from 'react';
import { useLoadingRouter as useRouter } from '@/components/providers/NavigationProvider';
import { useAuth } from '@/hooks/useAuth';
import { useCountdown } from '@/hooks/useCountdown';
import LeaderboardList from '@/components/leaderboard/LeaderboardList';
import WinnerReveal from '@/components/winner/WinnerReveal';

export default function LeaderboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const countdown = useCountdown(params.id);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 10 seconds if live
    const interval = setInterval(() => {
      if (data?.giveaway?.status === 'live') {
        fetchLeaderboard();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [params.id, data?.giveaway?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.giveaway) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Giveaway not found</div>;
  }

  const { giveaway, entries } = data;
  const isEnded = giveaway.status === 'ended' || countdown.isExpired;

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black -z-10" />

      {isEnded && giveaway.winner_name && (
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-yellow-600 to-amber-500 rounded-2xl p-1 mb-8 shadow-[0_0_30px_rgba(234,179,8,0.3)] text-center transform hover:scale-[1.02] transition-transform">
          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-yellow-500 font-bold uppercase tracking-widest text-sm mb-2">🏆 Official Winner</h2>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">{giveaway.winner_name}</div>
            <div className="text-slate-400 font-mono">Time: {formatTime(giveaway.winner_total_time ?? 0)}</div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto mb-10 text-center">
        <button onClick={() => router.push(`/giveaway/${params.id}`)} className="text-slate-400 hover:text-white mb-6 font-bold text-sm">
          ← Back to Giveaway
        </button>
        <h1 className="text-3xl md:text-5xl font-black mb-2">{giveaway.title}</h1>
        <h2 className="text-xl text-yellow-500 font-bold tracking-widest uppercase">
          {isEnded ? 'Final Leaderboard' : 'Live Leaderboard'}
        </h2>
        
        {!isEnded && !countdown.isExpired && giveaway.status === 'live' && (
          <div className="mt-4 inline-flex items-center space-x-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-full font-mono text-sm text-slate-300">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>Closes in: {countdown.hours.toString().padStart(2, '0')}:{countdown.minutes.toString().padStart(2, '0')}:{countdown.seconds.toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      <LeaderboardList entries={entries} currentUserId={user?.id} />

    </div>
  );
}
