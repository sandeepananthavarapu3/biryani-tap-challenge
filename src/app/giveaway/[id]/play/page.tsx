'use client';

import React, { useEffect, useState } from 'react';
import { useLoadingRouter as useRouter } from '@/components/providers/NavigationProvider';
import { GameEngine } from '@/components/game/GameEngine';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [started, setStarted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/giveaway/${params.id}`);
    } else if (user) {
      if (profile && !profile.email_verified) {
        alert("Please verify your email to play.");
        router.replace(`/giveaway/${params.id}`);
        return;
      }
      
      const checkSession = async () => {
        try {
          const res = await fetch(`/api/game/session?giveawayId=${params.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'completed') {
              setAlreadyPlayed(true);
              router.replace(`/giveaway/${params.id}/leaderboard`);
            } else if (data.status === 'in_progress') {
              setStarted(true); // resume
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setChecking(false);
        }
      };
      checkSession();
    }
  }, [user, profile, loading, router, params.id]);

  if (loading || checking) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white animate-pulse">Loading...</div></div>;
  }

  if (alreadyPlayed || !user) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div 
            key="warning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="max-w-md w-full bg-slate-900 border border-yellow-500/50 p-8 rounded-3xl text-center shadow-2xl shadow-yellow-500/20"
          >
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-wider">Official Attempt</h1>
            <p className="text-slate-300 text-lg mb-4">
              You only get <strong className="text-white">one official 10-round attempt</strong> for this giveaway.
            </p>
            <p className="text-slate-400 mb-8">
              Your results will be permanently recorded on the leaderboard.
            </p>
            
            <button
              onClick={() => setStarted(true)}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black text-xl py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105 transition-transform"
            >
              START MY OFFICIAL RUN
            </button>
            <button
              onClick={() => router.push(`/giveaway/${params.id}`)}
              className="mt-4 text-slate-500 hover:text-white font-bold"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div key="game" className="w-full h-full flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GameEngine 
              giveawayId={params.id} 
              sessionType="official" 
              onGameComplete={() => {
                setTimeout(() => {
                  router.push(`/giveaway/${params.id}/leaderboard`);
                }, 4000);
              }}
              onExit={() => router.push(`/giveaway/${params.id}/leaderboard`)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
