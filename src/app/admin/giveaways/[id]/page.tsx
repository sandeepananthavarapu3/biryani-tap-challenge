import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GiveawayStatusBadge } from '@/components/admin/GiveawayStatusBadge';
import { StatsCard } from '@/components/admin/StatsCard';
import { 
  ArrowLeftIcon, 
  PencilSquareIcon,
  PlayIcon,
  StopIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function GiveawayDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: giveaway, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', params.id)
    .single();
    
  if (error || !giveaway) {
    notFound();
  }

  // Fetch some stats
  const [
    { count: totalParticipants },
    { count: completedSessions },
    { data: leaderboard }
  ] = await Promise.all([
    supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('giveaway_id', giveaway.id),
    supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('giveaway_id', giveaway.id).eq('status', 'completed').eq('session_type', 'official'),
    supabase.from('leaderboard').select('*').eq('giveaway_id', giveaway.id).order('total_reaction_time', { ascending: true }).limit(5)
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/admin/giveaways" className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{giveaway.title}</h1>
              <GiveawayStatusBadge status={giveaway.status} />
            </div>
            <p className="text-gray-400 text-sm mt-1">ID: {giveaway.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/admin/giveaways/${giveaway.id}/edit`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4 mr-2" />
            Edit Giveaway
          </Link>
          <Link 
            href={`/admin/giveaways/${giveaway.id}/participants`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <UserGroupIcon className="w-4 h-4 mr-2" />
            Participants
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-xs mb-1">Total Registrations</div>
              <div className="text-2xl font-bold text-white">{totalParticipants || 0}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-xs mb-1">Official Attempts</div>
              <div className="text-2xl font-bold text-white">{completedSessions || 0}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:col-span-2 flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-xs mb-1">Prize</div>
                <div className="text-lg font-bold text-orange-500 truncate max-w-[150px]">{giveaway.prize_name}</div>
              </div>
              <TrophyIcon className="w-8 h-8 text-orange-500/20" />
            </div>
          </div>

          {/* Giveaway Configuration */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <h3 className="text-lg font-medium text-white">Configuration</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-300">{giveaway.description || 'No description provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timing</dt>
                  <dd className="mt-1 text-sm text-gray-300">
                    {giveaway.start_time ? new Date(giveaway.start_time).toLocaleString() : 'Not set'}
                    {' to '}
                    {giveaway.end_time ? new Date(giveaway.end_time).toLocaleString() : giveaway.duration_minutes ? `${giveaway.duration_minutes} minutes` : 'Not set'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Practice Mode</dt>
                  <dd className="mt-1 text-sm text-gray-300">
                    {giveaway.practice_enabled ? (
                      <span className="inline-flex items-center text-green-400"><CheckBadgeIcon className="w-4 h-4 mr-1" /> Enabled</span>
                    ) : (
                      <span className="text-gray-500">Disabled</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Leaderboard Visibility</dt>
                  <dd className="mt-1 text-sm text-gray-300">
                    {giveaway.leaderboard_visible ? (
                      <span className="inline-flex items-center text-green-400"><CheckBadgeIcon className="w-4 h-4 mr-1" /> Public</span>
                    ) : (
                      <span className="text-gray-500">Hidden</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Winner Details (if ended) */}
          {giveaway.status === 'ended' && (
            <div className="bg-gradient-to-br from-orange-900/40 to-amber-900/20 border border-orange-900/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-orange-500/10">
                <TrophyIcon className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center relative z-10">
                <TrophyIcon className="w-5 h-5 mr-2" /> Winner Announced
              </h3>
              
              {giveaway.winner_id ? (
                <div className="relative z-10">
                  <div className="text-2xl font-bold text-white">{giveaway.winner_name}</div>
                  <div className="text-sm text-gray-400 mt-1">Total Time: <span className="font-mono text-orange-400">{giveaway.winner_total_time}ms</span></div>
                </div>
              ) : (
                <div className="relative z-10">
                  <p className="text-gray-300 mb-4">No winner has been calculated yet.</p>
                  <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors">
                    Calculate Winner
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Actions & Leaderboard */}
        <div className="space-y-6">
          
          {/* Action Panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Lifecycle Management</h3>
            
            <div className="space-y-3">
              {giveaway.status === 'draft' && (
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600/30 rounded-lg text-sm font-medium transition-colors">
                  Schedule Giveaway
                </button>
              )}
              
              {(giveaway.status === 'draft' || giveaway.status === 'scheduled') && (
                <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/30 rounded-lg text-sm font-medium transition-colors">
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Go Live Now
                </button>
              )}
              
              {giveaway.status === 'live' && (
                <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600/30 rounded-lg text-sm font-medium transition-colors">
                  <StopIcon className="w-4 h-4 mr-2" />
                  End Giveaway
                </button>
              )}
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <h3 className="text-sm font-medium text-white flex items-center">
                <ChartBarIcon className="w-4 h-4 mr-2 text-orange-500" />
                Current Leaders
              </h3>
            </div>
            
            <div className="divide-y divide-gray-800">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((entry, idx) => (
                  <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-500 text-amber-950' : 
                        idx === 1 ? 'bg-gray-300 text-gray-800' : 
                        idx === 2 ? 'bg-orange-700 text-orange-100' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center">
                          {entry.player_name}
                          {entry.is_suspicious && (
                            <span className="ml-2 w-2 h-2 rounded-full bg-red-500" title="Flagged as suspicious" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-sm text-orange-400">
                      {entry.total_reaction_time}ms
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No official attempts yet.
                </div>
              )}
            </div>
            
            <Link href={`/admin/giveaways/${giveaway.id}/participants`} className="block w-full py-3 text-center text-sm text-gray-400 hover:text-white bg-gray-800/30 hover:bg-gray-800/50 transition-colors border-t border-gray-800">
              View all participants
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Just a quick icon for the leaderboard title
function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
