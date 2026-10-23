'use client';

import React, { useState } from 'react';
import { AdminParticipantDetail } from '@/types';
import { ChevronDownIcon, ChevronUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ParticipantRowProps {
  participant: AdminParticipantDetail;
}

export function ParticipantRow({ participant }: ParticipantRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile, session, rounds } = participant;
  
  const isSuspicious = session?.is_suspicious || false;

  return (
    <>
      <tr 
        className={`hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-800 ${isExpanded ? 'bg-gray-800/30' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {profile.avatar_url ? (
              <img className="h-8 w-8 rounded-full mr-3 border border-gray-700" src={profile.avatar_url} alt="" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-orange-900/50 text-orange-500 flex items-center justify-center mr-3 border border-orange-800/30 font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-white flex items-center">
                {profile.name}
                {isSuspicious && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 ml-1.5" title="Suspicious activity detected" />
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                {profile.email}
                {profile.email_verified && <CheckCircleIcon className="h-3 w-3 text-green-500 ml-1" title="Email verified" />}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          {session ? (
            <span className={`px-2 py-1 rounded-md text-xs ${
              session.status === 'completed' ? 'bg-green-900/30 text-green-400' :
              session.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400' :
              'bg-gray-800 text-gray-400'
            }`}>
              {session.status.replace('_', ' ').charAt(0).toUpperCase() + session.status.replace('_', ' ').slice(1)}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-md text-xs bg-gray-800 text-gray-500">Not started</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
          {session?.total_reaction_time ? `${session.total_reaction_time}ms` : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
          {session?.fastest_reaction_time ? `${session.fastest_reaction_time}ms` : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
          <span className={session?.wrong_taps ? 'text-red-400 font-medium' : 'text-gray-500'}>
            {session?.wrong_taps || 0}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
          <span className={session?.early_taps ? 'text-orange-400 font-medium' : 'text-gray-500'}>
            {session?.early_taps || 0}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button className="text-gray-400 hover:text-white">
            {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </button>
        </td>
      </tr>
      
      {isExpanded && rounds && rounds.length > 0 && (
        <tr className="bg-gray-900/50 border-b border-gray-800">
          <td colSpan={7} className="px-6 py-4">
            <div className="rounded-lg bg-gray-900 border border-gray-800 p-4">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                Round Details
                {isSuspicious && session?.suspicious_reason && (
                  <span className="ml-3 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-900/50">
                    Flag: {session.suspicious_reason}
                  </span>
                )}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {rounds.map((round) => (
                  <div key={round.id} className="bg-gray-800 rounded p-2 text-xs">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Round {round.round_number}</span>
                      {round.was_correct ? (
                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                      ) : (
                        <span className="text-red-500 font-bold">X</span>
                      )}
                    </div>
                    <div className="font-mono text-white">
                      {round.reaction_time_ms ? `${round.reaction_time_ms}ms` : '-'}
                    </div>
                    {(round.early_tap || round.wrong_tap) && (
                      <div className="text-red-400 mt-1">
                        {round.early_tap ? 'Early Tap' : 'Wrong Bowl'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
