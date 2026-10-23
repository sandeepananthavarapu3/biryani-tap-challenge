import React from 'react';
import { Giveaway } from '@/types';

interface Props {
  giveaway: Giveaway;
  countdown: { hours: number; minutes: number; seconds: number; isExpired: boolean };
}

export default function GiveawayHero({ giveaway, countdown }: Props) {
  return (
    <div className="spice-hero relative w-full border-b border-yellow-500/20 py-12 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-400/10 via-transparent to-transparent z-0"></div>
      
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4">
          {giveaway.status === 'live' ? 'Live Now' : giveaway.status === 'scheduled' ? 'Coming Soon' : giveaway.status === 'ended' ? 'Ended' : 'Draft'}
        </div>
        
        <h1 className="spice-heading text-4xl md:text-6xl font-extrabold tracking-tight">
          {giveaway.title}
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          {giveaway.description}
        </p>

        <div className="mt-8 inline-block p-[2px] rounded-2xl bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-2xl shadow-yellow-500/20">
          <div className="bg-[#3b2116] rounded-2xl px-8 py-6">
            <h3 className="text-yellow-500 font-bold uppercase text-sm tracking-wider mb-2">Grand Prize</h3>
            <div className="text-2xl md:text-4xl font-black text-white">{giveaway.prize_name}</div>
          </div>
        </div>

        {(giveaway.status === 'scheduled' || giveaway.status === 'live') && !countdown.isExpired && (
          <div>
          <p className="mt-8 text-sm font-bold uppercase tracking-wider text-yellow-500">{giveaway.status === 'scheduled' ? 'Starts in' : 'Ends in'}</p>
          <div className="mt-8 flex items-center justify-center space-x-4">
            <TimeBox value={countdown.hours} label="HOURS" />
            <span className="text-2xl text-yellow-500 font-bold">:</span>
            <TimeBox value={countdown.minutes} label="MINS" />
            <span className="text-2xl text-yellow-500 font-bold">:</span>
            <TimeBox value={countdown.seconds} label="SECS" />
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#3b2116] border border-amber-600/50 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl shadow-inner">
        <span className="text-3xl md:text-4xl font-mono font-bold text-white">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-slate-400 mt-2 font-semibold tracking-wider">{label}</span>
    </div>
  );
}
