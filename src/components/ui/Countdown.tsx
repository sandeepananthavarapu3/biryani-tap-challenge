"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface CountdownProps {
  giveawayId: string;
  endTime: string;
  onExpired?: () => void;
  className?: string;
}

export function Countdown({ giveawayId, endTime, onExpired, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0, minutes: 0, seconds: 0, isExpired: false
  });
  const [serverTimeDiff, setServerTimeDiff] = useState<number>(0);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    // Fetch server time to calculate diff
    const fetchServerTime = async () => {
      try {
        const res = await fetch(`/api/server-time?giveaway_id=${giveawayId}`);
        if (res.ok) {
          const data = await res.json();
          const serverNow = new Date(data.server_time).getTime();
          const clientNow = Date.now();
          setServerTimeDiff(serverNow - clientNow);
        }
      } catch (err) {
        console.error("Failed to fetch server time", err);
      }
    };
    fetchServerTime();
  }, [giveawayId]);

  useEffect(() => {
    const targetTime = new Date(endTime).getTime();

    const updateTimer = () => {
      const now = Date.now() + serverTimeDiff;
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        setIsCritical(false);
        if (onExpired) onExpired();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
      
      // Dramatic styling if less than 10 seconds
      if (hours === 0 && minutes === 0 && seconds <= 10) {
        setIsCritical(true);
      } else {
        setIsCritical(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, serverTimeDiff, onExpired]);

  if (timeLeft.isExpired) {
    return (
      <div className={cn("font-mono font-bold text-red-500", className)}>
        ENDED
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div 
      className={cn(
        "font-mono font-bold text-xl tracking-wider transition-colors duration-300",
        isCritical ? "text-red-500 animate-pulse text-glow" : "text-amber-500",
        className
      )}
    >
      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </div>
  );
}
