import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { GiveawayStatusBadge } from '@/components/admin/GiveawayStatusBadge';
import { Giveaway } from '@/types';
import { DeleteGiveawayButton } from '@/components/admin/DeleteGiveawayButton';
import { effectiveGiveawayStatus } from '@/lib/giveaway/status';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function GiveawaysPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string }
}) {
  const supabase = createClient();
  const statusFilter = searchParams.status || 'all';
  const searchQuery = searchParams.q || '';
  
  let query = supabase.from('giveaways').select('*').order('created_at', { ascending: false });
  
  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }
  
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  
  const { data: giveaways, error } = await query;
  
  // Tabs config
  const tabs = [
    { id: 'all', label: 'All Giveaways' },
    { id: 'draft', label: 'Draft' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'live', label: 'Live' },
    { id: 'ended', label: 'Ended' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Giveaways</h1>
          <p className="text-gray-400 mt-1">Manage all your biryani challenges in one place.</p>
        </div>
        <Link 
          href="/admin/giveaways/create" 
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
        {/* Filters bar */}
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex space-x-1 overflow-x-auto max-w-full pb-2 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/admin/giveaways?status=${tab.id}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === tab.id 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            </div>
            {/* Form to submit search via URL query parameters */}
            <form action="/admin/giveaways" method="GET">
              <input type="hidden" name="status" value={statusFilter} />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Search giveaways..."
              />
            </form>
          </div>
        </div>

        {/* Giveaways List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Giveaway Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dates</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stats</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {giveaways && giveaways.length > 0 ? (
                giveaways.map((giveaway: Giveaway) => (
                  <tr key={giveaway.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{giveaway.title}</span>
                        <span className="text-xs text-gray-500 mt-1 flex items-center">
                          Prize: {giveaway.prize_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <GiveawayStatusBadge status={effectiveGiveawayStatus(giveaway)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {giveaway.start_time ? (
                        <div className="flex flex-col">
                          <span>Start: {new Date(giveaway.start_time).toLocaleDateString()}</span>
                          {giveaway.end_time && <span>End: {new Date(giveaway.end_time).toLocaleDateString()}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-400">
                        <UserGroupIcon className="w-4 h-4 mr-1.5" />
                        <span>--</span>
                      </div>
                      {giveaway.winner_name && (
                        <div className="text-xs text-amber-500 mt-1">Winner: {giveaway.winner_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link href={`/admin/giveaways/${giveaway.id}`} className="text-gray-400 hover:text-white transition-colors" title="View Details">
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link href={`/admin/giveaways/${giveaway.id}/edit`} className="text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                          <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                        <DeleteGiveawayButton id={giveaway.id} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-base font-medium text-white mb-1">No giveaways found</p>
                      <p className="text-sm">Try adjusting your filters or create a new giveaway.</p>
                    </div>
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
