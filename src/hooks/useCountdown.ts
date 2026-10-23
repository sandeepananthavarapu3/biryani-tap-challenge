import { useState, useEffect } from 'react';
import { CountdownState } from '@/types';

export function useCountdown(giveawayId: string, target: 'start' | 'end' = 'end'): CountdownState {
  const [endTime, setEndTime] = useState<number | null>(null);
  const [drift, setDrift] = useState(0);
  
  const [state, setState] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
    serverTimeDiff: 0,
  });

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const reqTime = Date.now();
        const res = await fetch(`/api/server-time?giveaway_id=${giveawayId}`);
        if (!res.ok) return;
        const data = await res.json();
        const resTime = Date.now();
        const rtt = resTime - reqTime;
        
        const serverTime = new Date(data.server_time).getTime() + (rtt / 2);
        const currentDrift = serverTime - resTime;
        
        setDrift(currentDrift);
        const targetTime = target === 'start' ? data.giveaway_start_time : data.giveaway_end_time;
        setEndTime(targetTime ? new Date(targetTime).getTime() : null);
      } catch (err) {
        console.error("Error fetching time sync", err);
      }
    };

    fetchTime();
    const syncInterval = setInterval(fetchTime, 30000);
    return () => clearInterval(syncInterval);
  }, [giveawayId, target]);

  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const serverNow = Date.now() + drift;
      const remaining = Math.max(0, endTime - serverNow);
      const totalSeconds = Math.floor(remaining / 1000);
      
      setState({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        totalSeconds,
        isExpired: totalSeconds <= 0,
        serverTimeDiff: drift,
      });
    };

    tick();
    const tickInterval = setInterval(tick, 1000);
    return () => clearInterval(tickInterval);
  }, [endTime, drift]);

  return state;
}
