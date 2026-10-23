import React from 'react';
import { GiveawayStatus } from '@/types';

interface GiveawayStatusBadgeProps {
  status: GiveawayStatus;
}

export function GiveawayStatusBadge({ status }: GiveawayStatusBadgeProps) {
  const styles: Record<GiveawayStatus, { bg: string; text: string; dot: string; dotAnim?: string }> = {
    draft: { bg: 'bg-gray-800', text: 'text-gray-300', dot: 'bg-gray-400' },
    scheduled: { bg: 'bg-blue-900/30', text: 'text-blue-400', dot: 'bg-blue-500' },
    live: { bg: 'bg-green-900/30', text: 'text-green-400', dot: 'bg-green-500', dotAnim: 'animate-ping' },
    ended: { bg: 'bg-orange-900/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  };

  const config = styles[status] || styles.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border border-white/5`}>
      <span className="relative flex h-2 w-2 mr-1.5">
        {config.dotAnim && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
