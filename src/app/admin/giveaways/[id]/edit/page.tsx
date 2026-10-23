'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { GiveawayStatus, Giveaway } from '@/types';
import { createClient } from '@/lib/supabase/client';

export default function EditGiveawayPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [startTime, setStartTime] = useState('');
  
  const [endMode, setEndMode] = useState<'date' | 'duration'>('duration');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('60');
  
  const [practiceEnabled, setPracticeEnabled] = useState(true);
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);
  const [status, setStatus] = useState<GiveawayStatus>('draft');

  useEffect(() => {
    async function loadGiveaway() {
      try {
        const { data, error } = await supabase
          .from('giveaways')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error || !data) throw new Error('Giveaway not found');
        
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrizeName(data.prize_name || '');
        setStatus(data.status as GiveawayStatus);
        setPracticeEnabled(data.practice_enabled);
        setLeaderboardVisible(data.leaderboard_visible);
        
        if (data.start_time) {
          // Format for datetime-local input (YYYY-MM-DDTHH:MM)
          const d = new Date(data.start_time);
          setStartTime(d.toISOString().slice(0, 16));
        }
        
        if (data.duration_minutes) {
          setEndMode('duration');
          setDuration(data.duration_minutes.toString());
        } else if (data.end_time) {
          setEndMode('date');
          const d = new Date(data.end_time);
          setEndTime(d.toISOString().slice(0, 16));
        }
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadGiveaway();
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (!title || !prizeName) {
        throw new Error('Title and Prize Name are required.');
      }
      
      const payload = {
        title,
        description,
        prize_name: prizeName,
        start_time: startTime ? new Date(startTime).toISOString() : undefined,
        end_time: endMode === 'date' && endTime ? new Date(endTime).toISOString() : null,
        duration_minutes: endMode === 'duration' && duration ? parseInt(duration, 10) : null,
        practice_enabled: practiceEnabled,
        leaderboard_visible: leaderboardVisible,
        status,
      };

      const res = await fetch(`/api/giveaways/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update giveaway');
      }

      router.push(`/admin/giveaways/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this giveaway? This action cannot be undone and will delete all associated game sessions.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/giveaways/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete giveaway');
      }
      
      router.push('/admin/giveaways');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading giveaway...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/giveaways/${id}`} className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Edit Giveaway</h1>
            <p className="text-gray-400 text-sm mt-1">Make changes to the configuration.</p>
          </div>
        </div>
        
        <button 
          type="button" 
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-400 bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 transition-colors"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {error && (
            <div className="bg-red-900/30 border border-red-900 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-2">Basic Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Giveaway Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Prize Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={prizeName}
                  onChange={(e) => setPrizeName(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-2">Schedule & Timing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors [color-scheme:dark]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="block text-sm font-medium text-gray-300">End Configuration</label>
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setEndMode('duration')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${endMode === 'duration' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Duration
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndMode('date')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${endMode === 'date' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Fixed Date
                    </button>
                  </div>
                </div>

                {endMode === 'duration' ? (
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-24 bg-gray-800/50 border border-gray-700 rounded-l-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-center"
                    />
                    <span className="bg-gray-800 border border-l-0 border-gray-700 px-4 py-2.5 rounded-r-lg text-gray-400 text-sm">
                      Minutes
                    </span>
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors [color-scheme:dark]"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-2">Settings & Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white">Practice Mode</div>
                    <div className="text-xs text-gray-500 mt-1">Allow users to practice before official attempt</div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={practiceEnabled} onChange={() => setPracticeEnabled(!practiceEnabled)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${practiceEnabled ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${practiceEnabled ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white">Public Leaderboard</div>
                    <div className="text-xs text-gray-500 mt-1">Show leaderboard to all users during the event</div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={leaderboardVisible} onChange={() => setLeaderboardVisible(!leaderboardVisible)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${leaderboardVisible ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${leaderboardVisible ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as GiveawayStatus)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="scheduled">Scheduled (Will auto-start)</option>
                  <option value="live">Live (Active now)</option>
                  <option value="ended">Ended (Closed)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800 flex justify-end space-x-4">
            <Link 
              href={`/admin/giveaways/${id}`} 
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
