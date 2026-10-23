'use client';
import { useEffect, useRef, useState } from 'react';
import { GamePhase } from '@/types';

export function useGameAudio(phase: GamePhase) {
  const context = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const unlock = () => {
      if (!enabled) return;
      context.current ??= new AudioContext();
      void context.current.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [enabled]);
  useEffect(() => () => { void context.current?.close(); }, []);
  useEffect(() => {
    const ctx = context.current;
    if (!enabled || !ctx || ctx.state !== 'running') return;
    const notes = phase === 'chicken_visible' ? [660, 880]
      : phase === 'tapped' ? [880, 1175, 1320]
      : phase === 'game_complete' ? [523, 659, 784, 1047]
      : phase === 'wrong_tap' || phase === 'early_tap' ? [220, 165] : [];
    notes.forEach((frequency, index) => {
      const start = ctx.currentTime + index * 0.09;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(start); oscillator.stop(start + 0.18);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }, [phase, enabled]);
  return { enabled, toggle: () => setEnabled(value => !value) };
}
