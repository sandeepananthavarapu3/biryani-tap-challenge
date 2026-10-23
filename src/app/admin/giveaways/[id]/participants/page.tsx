'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { ParticipantRow } from '@/components/admin/ParticipantRow';
import { AdminParticipantDetail } from '@/types';

export default function ParticipantsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [participants, setParticipants] = useState<AdminParticipantDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'time' | 'suspicious'>('time');
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'suspicious'>('all');

  useEffect(() => {
    async function fetchParticipants() {
      try {
        setIsLoading(true);
        // Using the API route as requested
        const res = await fetch(`/api/admin/participants/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch participants');
        }
        
        const data = await res.json();
        setParticipants(data.participants || []);
      } catch (err: any) {
        setError(err.message);
        // Fallback for demonstration if API isn't ready
        setParticipants([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchParticipants();
  }, [id]);

  // Derived state for filtered/sorted participants
  const filteredParticipants = participants
    .filter(p => {
      // Search filter
      const matchesSearch = 
        p.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.profile.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      if (filterType === 'completed') return matchesSearch && p.session?.status === 'completed';
      if (filterType === 'suspicious') return matchesSearch && p.session?.is_suspicious;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.profile.name.localeCompare(b.profile.name);
      }
      if (sortBy === 'time') {
        // Handle nulls by putting them at the end
        if (!a.session?.total_reaction_time) return 1;
        if (!b.session?.total_reaction_time) return -1;
        return a.session.total_reaction_time - b.session.total_reaction_time;
      }
      if (sortBy === 'suspicious') {
        if (a.session?.is_suspicious === b.session?.is_suspicious) return 0;
        return a.session?.is_suspicious ? -1 : 1;
      }
      return 0;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/giveaways/${id}`} className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Participants</h1>
            <p className="text-gray-400 text-sm mt-1">Manage and review participant sessions.</p>
          </div>
        </div>
        
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-800 grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-900/50">
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
              placeholder="Search by name or email..."
            />
          </div>
          
          <div className="md:col-span-7 flex flex-col sm:flex-row gap-4 justify-end">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-gray-800/50 border border-gray-700 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2"
              >
                <option value="all">All Participants</option>
                <option value="completed">Completed Only</option>
                <option value="suspicious">Suspicious Only</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-800/50 border border-gray-700 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2"
              >
                <option value="time">Best Time</option>
                <option value="name">Name (A-Z)</option>
                <option value="suspicious">Suspicious First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/80 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Participant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fastest</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Wrong</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Early</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-400 text-sm">Loading participants...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-400 bg-red-900/10">
                    {error}
                  </td>
                </tr>
              ) : filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <ParticipantRow key={participant.profile.id} participant={participant} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No participants found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400 bg-gray-900/50">
          <div>
            Showing <span className="font-medium text-white">{filteredParticipants.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
