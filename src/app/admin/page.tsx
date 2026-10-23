import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/admin/StatsCard';
import { GiveawayStatusBadge } from '@/components/admin/GiveawayStatusBadge';
import { 
  TrophyIcon, 
  UsersIcon, 
  PlayCircleIcon, 
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Giveaway } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = createClient();
  
  // Fetch stats and recent giveaways in parallel
  const [
    { count: totalGiveaways },
    { count: activeGiveaways },
    { count: totalParticipants },
    { count: liveSessions },
    { data: recentGiveaways }
  ] = await Promise.all([
    supabase.from('giveaways').select('*', { count: 'exact', head: true }),
    supabase.from('giveaways').select('*', { count: 'exact', head: true }).in('status', ['scheduled', 'live']),
    supabase.from('leaderboard').select('*', { count: 'exact', head: true }),
    supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('giveaways').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-gray-400 mt-1">Welcome to the Biryani Tap Challenge admin dashboard.</p>
        </div>
        <Link 
          href="/admin/giveaways/create" 
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all active:scale-95"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Giveaway
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Giveaways" 
          value={totalGiveaways || 0} 
          icon={<TrophyIcon className="w-6 h-6" />} 
        />
        <StatsCard 
          label="Active Giveaways" 
          value={activeGiveaways || 0} 
          icon={<PlayCircleIcon className="w-6 h-6" />} 
        />
        <StatsCard 
          label="Total Participants" 
          value={totalParticipants || 0} 
          icon={<UsersIcon className="w-6 h-6" />} 
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard 
          label="Live Sessions" 
          value={liveSessions || 0} 
          icon={<ChartBarIcon className="w-6 h-6" />} 
        />
      </div>

      {/* Recent Giveaways */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Recent Giveaways</h3>
          <Link href="/admin/giveaways" className="text-sm text-orange-500 hover:text-orange-400 flex items-center">
            View all <ArrowRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prize</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentGiveaways && recentGiveaways.length > 0 ? (
                recentGiveaways.map((giveaway: Giveaway) => (
                  <tr key={giveaway.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{giveaway.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <GiveawayStatusBadge status={giveaway.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {giveaway.prize_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(giveaway.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/giveaways/${giveaway.id}`} className="text-orange-500 hover:text-orange-400">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No giveaways found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
