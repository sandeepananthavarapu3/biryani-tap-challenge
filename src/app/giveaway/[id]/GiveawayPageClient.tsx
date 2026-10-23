'use client';
import { formatTime } from '@/lib/game/scoring';

import React, { useEffect, useState, useTransition } from 'react';
import { useLoadingRouter as useRouter } from '@/components/providers/NavigationProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCountdown } from '@/hooks/useCountdown';
import GiveawayHero from '@/components/giveaway/GiveawayHero';
import EndingSequence from '@/components/giveaway/EndingSequence';
import LeaderboardList from '@/components/leaderboard/LeaderboardList';
import { PageLoading } from '@/components/ui/PageLoading';
import { Giveaway } from '@/types';
import { effectiveGiveawayStatus } from '@/lib/giveaway/status';

export default function GiveawayPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [openingPractice, startPracticeTransition] = useTransition();
  const openPractice = (url: string) => startPracticeTransition(() => router.push(url));
  const { user, loading: authLoading } = useAuth();
  const countdown = useCountdown(id);
  const startCountdown = useCountdown(id, 'start');
  
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/giveaways/${id}`);
        if (res.ok) {
          const data = await res.json();
          const fetchedGiveaway = data.giveaway as Giveaway | null;
          setGiveaway(fetchedGiveaway ? {
            ...fetchedGiveaway,
            status: effectiveGiveawayStatus(fetchedGiveaway),
          } : null);
        }
        
        const lbRes = await fetch(`/api/leaderboard/${id}`);
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboard(lbData.entries?.slice(0, 5) || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (user && giveaway && giveaway.status === 'live') {
      const checkSession = async () => {
        try {
          const res = await fetch(`/api/game/session?giveawayId=${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'completed') {
              setHasPlayed(true);
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      checkSession();
    }
  }, [user, giveaway, id]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!giveaway) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Giveaway not found</div>;
  }

  // Recalculate on each countdown tick as a fallback when a hosted deployment
  // has not yet persisted the scheduled -> live transition in the database.
  const currentStatus = effectiveGiveawayStatus(giveaway);
  const displayGiveaway = currentStatus === giveaway.status
    ? giveaway
    : { ...giveaway, status: currentStatus };
  const isLive = currentStatus === 'live' && !countdown.isExpired;
  const isEnded = currentStatus === 'ended' || countdown.isExpired;
  const isScheduled = currentStatus === 'scheduled';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen spice-page text-white overflow-x-hidden"
    >
      {openingPractice && <PageLoading message="Opening practice game…" />}
      <GiveawayHero giveaway={displayGiveaway} countdown={isScheduled ? startCountdown : countdown} />
      
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        {/* Main Action Area */}
        <div className="flex-1 space-y-8">
          <div className="spice-panel border border-amber-700/50 rounded-3xl p-8 shadow-xl">
            {isScheduled && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-300 mb-2">Get Ready!</h2>
                <p className="text-slate-500">This giveaway will start soon. Make sure you are signed in and ready to tap.</p>
                {giveaway.practice_enabled && (
                  <button
                    onClick={() => openPractice(user ? `/giveaway/${id}/practice` : '/login')}
                    className="mt-6 w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/50 font-bold py-4 rounded-xl transition-all"
                  >
                    {user ? 'Try Practice Game' : 'Sign In to Practice'}
                  </button>
                )}
              </div>
            )}
            
            {isLive && (
              <div className="flex flex-col space-y-4">
                {!user ? (
                  <div className="text-center">
                    <p className="text-slate-400 mb-6">Sign in or create an account to participate in this giveaway.</p>
                    <button 
                      onClick={() => router.push('/login')}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all"
                    >
                      Sign Up to Play
                    </button>
                  </div>
                ) : (
                  <>
                    {hasPlayed ? (
                      <button 
                        onClick={() => router.push(`/giveaway/${id}/leaderboard`)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold py-4 rounded-xl transition-all"
                      >
                        View Your Score
                      </button>
                    ) : (
                      <button 
                        onClick={() => router.push(`/giveaway/${id}/play`)}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black text-xl py-5 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all transform hover:scale-[1.02]"
                      >
                        Join Official Game
                      </button>
                    )}
                    
                    {giveaway.practice_enabled && (
                      <button 
                        onClick={() => openPractice(`/giveaway/${id}/practice`)}
                        className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/50 font-bold py-4 rounded-xl transition-all"
                      >
                        Practice Mode
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
            
            {isEnded && (
              <div className="text-center">
                <h2 className="text-3xl font-black text-white mb-4">Giveaway Ended</h2>
                {giveaway.winner_name ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl">
                    <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">Winner</p>
                    <p className="text-3xl font-bold text-yellow-500">{giveaway.winner_name}</p>
                    <p className="text-slate-300 mt-2 font-mono">⚡ {formatTime(giveaway.winner_total_time ?? 0)}</p>
                  </div>
                ) : (
                  <p className="text-slate-400">The winner is being calculated.</p>
                )}
                <button 
                  onClick={() => router.push(`/giveaway/${id}/leaderboard`)}
                  className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  View Final Leaderboard
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Leaderboard Preview */}
        {giveaway.leaderboard_visible && (
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Top 5</h3>
              <button 
                onClick={() => router.push(`/giveaway/${id}/leaderboard`)}
                className="text-yellow-500 hover:text-yellow-400 text-sm font-bold uppercase tracking-wider"
              >
                View All
              </button>
            </div>
            
            <LeaderboardList entries={leaderboard} currentUserId={user?.id} />
          </div>
        )}
      </div>

      {isLive && countdown.totalSeconds <= 10 && countdown.totalSeconds > 0 && (
        <EndingSequence giveawayId={id} totalSeconds={countdown.totalSeconds} />
      )}
      
      {/* If it just ended and there is no winner fetched yet but totalSeconds <= 0 */}
      {isLive && countdown.totalSeconds <= 0 && (
        <EndingSequence giveawayId={id} totalSeconds={countdown.totalSeconds} />
      )}
    </motion.div>
  );
}
