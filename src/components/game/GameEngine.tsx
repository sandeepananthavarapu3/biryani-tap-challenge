'use client';
import { useEffect, useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/stores/gameStore';
import { GameOverlay } from './GameOverlay';
import { GameResults } from './GameResults';
import { useGameAudio } from '@/hooks/useGameAudio';
import { PageLoading } from '@/components/ui/PageLoading';
import { SessionType } from '@/types';

const BiryaniScene = dynamic(() => import('./BiryaniScene'), { ssr: false });

interface GameEngineProps {
  giveawayId: string;
  sessionType: SessionType;
  onGameComplete: (results: { totalTime: number; fastestTime: number; rounds: number[] }) => void;
  onExit: () => void;
}

export function GameEngine({ giveawayId, sessionType, onGameComplete, onExit }: GameEngineProps) {
  const store = useGameStore();
  const audio = useGameAudio(store.phase);
  const [sceneReady, setSceneReady] = useState(false);
  const markSceneReady = useCallback(() => setSceneReady(true), []);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const schedule = (callback: () => void, delay: number) => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    roundTimerRef.current = setTimeout(callback, delay);
  };
  const penaltyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback(async () => {
    const run = ++generation.current;
    setError(null);
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    store.reset();
    store.setPhase('get_ready');

    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveaway_id: giveawayId, session_type: sessionType })
      });

      if (!res.ok) {
        const failure = await res.json();
        throw new Error(failure.error || 'Unable to start game');
      }
      const data = await res.json();
      if (run !== generation.current) return;
      store.startGame(data.session_id, sessionType, {
        delay_ms: data.delay_ms,
        target_bowl: data.target_bowl
      });
    } catch (failure) {
      if (run !== generation.current) return;
      store.setPhase('idle');
      setError(failure instanceof Error ? failure.message : 'Unable to start game');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giveawayId, sessionType]);

  // Initialize game on mount
  useEffect(() => {
    initGame();
    return () => {
      generation.current++;
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
      if (penaltyTimerRef.current) clearTimeout(penaltyTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle the delay timer before showing chicken
  useEffect(() => {
    if (sceneReady && store.sessionId && store.targetBowl !== null && (store.phase === 'waiting' || store.phase === 'get_ready')) {
      const timer = setTimeout(() => {
        store.showChicken();
      }, store.delayMs);
      return () => clearTimeout(timer);
    }
  }, [sceneReady, store.phase, store.delayMs, store.currentRound, store.sessionId, store.targetBowl]);

  // Handle penalty timeout — return to waiting state after penalty
  useEffect(() => {
    if (store.phase === 'early_tap' || store.phase === 'wrong_tap') {
      const penaltyDuration = store.phase === 'early_tap' ? 2000 : 1500;
      penaltyTimerRef.current = setTimeout(() => {
        store.setPenalized(false);
        // Stay on the same round with the same target — go back to waiting
        store.setPhase('waiting');
      }, penaltyDuration);
      return () => {
        if (penaltyTimerRef.current) clearTimeout(penaltyTimerRef.current);
      };
    }
  }, [store.phase, store.earlyTaps, store.wrongTaps]);

  const handleBowlTap = async (bowlIndex: number) => {
    const store = useGameStore.getState();
    const run = generation.current;
    // Ignore taps during these states
    if (
      store.phase === 'game_complete' ||
      store.phase === 'tapped' ||
      store.phase === 'round_result' ||
      store.isPenalized
    ) {
      return;
    }

    // Early tap — chicken hasn't appeared yet
    if (store.phase === 'get_ready' || store.phase === 'waiting') {
      store.recordEarlyTap();
      return;
    }

    // Chicken is visible — check which bowl was tapped
    if (store.phase === 'chicken_visible') {
      // Wrong bowl
      if (bowlIndex !== store.targetBowl) {
        store.recordWrongTap();
        return;
      }

      // Correct tap! Measure reaction time
      const tapTime = performance.now();
      const reactionTime = Math.round(tapTime - (store.chickenAppearedAt || tapTime));
      
      store.recordTap(reactionTime);

      // Submit round to API
      try {
        const res = await fetch('/api/game/round', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: store.sessionId,
            round_number: store.currentRound,
            reaction_time_ms: reactionTime,
            tapped_bowl: bowlIndex
          })
        });

        if (run !== generation.current) return;
        if (res.ok) {
          const data = await res.json();

          if (data.session_complete || store.currentRound >= store.totalRounds) {
            // Game complete
            schedule(() => {
              const allTimes = [...useGameStore.getState().roundTimes];
              const total = allTimes.reduce((a, b) => a + b, 0);
              const fastest = Math.min(...allTimes);
              store.completeGame();
              onGameComplete({ totalTime: total, fastestTime: fastest, rounds: allTimes });
            }, 1800);
          } else if (data.next_round) {
            // Move to next round
            schedule(() => store.nextRound(data.next_round), 1500);
          } else {
            // Fallback next round
            schedule(() => store.nextRound({
              delay_ms: 1500 + Math.random() * 2500,
              target_bowl: Math.floor(Math.random() * 6)
            }), 1500);
          }
        } else {
          // API error, use fallback
          throw new Error('Could not save this round. Please exit and try again.');
        }
      } catch (error) {
        console.error('Round submit error:', error);
        if (run !== generation.current) return;
        store.setPhase('idle');
        setError(error instanceof Error ? error.message : 'Could not save round');
      }
    }
  };

  return (
    <div
      className="relative w-full h-[calc(100dvh-8rem)] min-h-[360px] bg-zinc-950 overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      <button onClick={audio.toggle} aria-pressed={audio.enabled} className="absolute bottom-3 right-3 z-20 min-h-11 rounded-full border border-amber-400/30 bg-slate-900/90 px-4 text-sm text-amber-200">
        {audio.enabled ? '🔊 Sound on' : '🔇 Sound off'}
      </button>
      {error && (
        <div role="alert" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/90 p-6 text-center text-white">
          <p>{error}</p>
          <button onClick={onExit} className="rounded bg-amber-500 px-6 py-3 text-black">Back to giveaway</button>
        </div>
      )}
      {!error && (!sceneReady || !store.sessionId) && <PageLoading message="Preparing game…" />}
      <BiryaniScene
        onReady={markSceneReady} 
        targetBowl={store.targetBowl}
        showChicken={store.phase === 'chicken_visible'}
        onBowlTap={handleBowlTap}
        gamePhase={store.phase}
        disabled={store.isPenalized || store.phase === 'tapped' || store.phase === 'game_complete'}
      />
      
      {store.phase !== 'game_complete' && (
        <GameOverlay 
          phase={store.phase}
          sessionType={store.sessionType}
          currentRound={store.currentRound}
          totalRounds={store.totalRounds}
          lastReactionTime={store.roundTimes[store.roundTimes.length - 1] || null}
        />
      )}

      {store.phase === 'game_complete' && (
        <GameResults 
          roundTimes={store.roundTimes}
          sessionType={store.sessionType}
          onRestart={initGame}
          onExit={onExit}
        />
      )}
    </div>
  );
}
