import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | Biryani Tap Challenge',
  description: 'Admin interface for Biryani Tap Challenge',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }
  
  // Check admin status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin, name, email, avatar_url')
    .eq('id', user.id)
    .single();
    
  if (profileError || !profile?.is_admin) {
    redirect('/'); // Redirect non-admins to home
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden selection:bg-orange-500/30">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center justify-between px-6 shrink-0 z-10">
          <h2 className="text-white font-semibold hidden md:block">Admin Dashboard</h2>
          <div className="flex-1"></div>
          
          {/* User profile snippet */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{profile.name}</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="h-9 w-9 rounded-full border border-gray-700" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-orange-900 text-orange-500 flex items-center justify-center font-bold border border-orange-800">
                {profile.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4 md:p-8 scroll-smooth text-gray-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
