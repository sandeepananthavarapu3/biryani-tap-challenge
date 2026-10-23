'use client';

import React, { useState } from 'react';
import { useLoadingRouter as useRouter } from '@/components/providers/NavigationProvider';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { GiveawayStatus } from '@/types';

export default function CreateGiveawayPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [startTime, setStartTime] = useState('');
  
  // End mode toggle: 'date' or 'duration'
  const [endMode, setEndMode] = useState<'date' | 'duration'>('duration');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('60'); // default 60 minutes
  
  const [practiceEnabled, setPracticeEnabled] = useState(true);
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);
  const [status, setStatus] = useState<GiveawayStatus>('draft');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!title || !prizeName) {
        throw new Error('Title and Prize Name are required.');
      }
      
      const payload = {
        title,
        description,
        prize_name: prizeName,
        start_time: startTime ? new Date(startTime).toISOString() : undefined,
        end_time: endMode === 'date' && endTime ? new Date(endTime).toISOString() : undefined,
        duration_minutes: endMode === 'duration' && duration ? parseInt(duration, 10) : undefined,
        practice_enabled: practiceEnabled,
        leaderboard_visible: leaderboardVisible,
        status,
      };

      const res = await fetch('/api/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create giveaway');
      }

      router.push('/admin/giveaways');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Link href="/admin/giveaways" className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Giveaway</h1>
          <p className="text-gray-400 text-sm mt-1">Set up a new Biryani Tap challenge.</p>
        </div>
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
                  placeholder="e.g. Weekend Biryani Challenge"
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
                  placeholder="e.g. 1 Free Biryani Bucket"
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
                placeholder="Details about this giveaway..."
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
                <label className="block text-sm font-medium text-gray-300">Initial Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${status === 'draft' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('scheduled')}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${status === 'scheduled' ? 'bg-blue-900/30 border-blue-500/50 text-blue-400' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                  >
                    Scheduled
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('live')}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${status === 'live' ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                  >
                    Live Now
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Drafts are hidden. Scheduled giveaways start at the selected time. Live Now opens the official game immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800 flex justify-end space-x-4">
            <Link 
              href="/admin/giveaways" 
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Giveaway'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
