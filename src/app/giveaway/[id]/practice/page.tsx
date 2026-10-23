'use client';

import React, { useEffect, useState } from 'react';
import { useLoadingRouter as useRouter } from '@/components/providers/NavigationProvider';
import { PageLoading } from '@/components/ui/PageLoading';
import { GameEngine } from '@/components/game/GameEngine';
import { useAuth } from '@/hooks/useAuth';

export default function PracticePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <PageLoading message="Preparing practice game…" />;
  }

  if (!user) {
    router.replace(`/giveaway/${params.id}`);
    return null;
  }

  return (
    <div className="bg-black flex flex-col items-center overflow-hidden relative">
      <div className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#352015] border-b border-amber-700/50">
        <button onClick={() => router.push(`/giveaway/${params.id}`)} className="min-h-11 px-4 rounded-lg bg-slate-800 text-white font-bold">← Back</button>
        <span className="text-amber-200 font-bold text-sm">Practice Mode</span>
      </div>

      <div className="w-full h-full flex-1">
        <GameEngine 
          giveawayId={params.id} 
          sessionType="practice" 
          onGameComplete={() => {}} 
          onExit={() => router.push(`/giveaway/${params.id}`)}
        />
      </div>
    </div>
  );
}
