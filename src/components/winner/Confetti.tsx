'use client';

import React, { useEffect, useState } from 'react';

export default function Confetti() {
  const [pieces, setPieces] = useState<Array<{ id: number; left: string; delay: string; color: string; size: string; type: string }>>([]);

  useEffect(() => {
    const colors = ['#EC8E14', '#F0A633', '#ff0000', '#00ff00', '#ffffff'];
    const types = ['square', 'circle', '🍗', '🍚', '🌶️'];
    const newPieces = Array.from({ length: 75 }).map((_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        color: colors[Math.random() * colors.length | 0],
        size: `${Math.random() * 10 + 10}px`,
        type: Math.random() > 0.8 ? type : 'color', // 20% emoji, 80% colored shape
      };
    });
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-5%] animate-confetti-fall"
          style={{
            left: p.left,
            animationDelay: p.delay,
            fontSize: p.type !== 'color' ? p.size : undefined,
            width: p.type === 'color' ? p.size : undefined,
            height: p.type === 'color' ? p.size : undefined,
            backgroundColor: p.type === 'color' ? p.color : 'transparent',
            borderRadius: p.type === 'color' && Math.random() > 0.5 ? '50%' : '0',
          }}
        >
          {p.type !== 'color' ? p.type : ''}
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall 3s linear forwards;
        }
      `}} />
    </div>
  );
}
