"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState } from "react";

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/30 bg-[#29170f]/95 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-black text-amber-100 hover:text-amber-500 transition-colors">
          <span className="text-2xl">🍗</span> Biryani Tap
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-300 hover:text-amber-500 transition-colors">Home</Link>
          <Link href="/giveaways" className="text-gray-300 hover:text-amber-500 transition-colors">Active Giveaways</Link>
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  {profile?.is_admin && (
                    <Link href="/admin" className="text-gray-300 hover:text-amber-500 transition-colors">Admin</Link>
                  )}
                  <Link href="/profile" className="text-gray-300 hover:text-amber-500 transition-colors">
                    {profile?.name || user.email}
                  </Link>
                  <button onClick={signOut} className="text-sm text-gray-400 hover:text-red-400">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-gray-300 hover:text-amber-500 transition-colors">Login</Link>
                  <Link href="/signup" className="px-4 py-2 bg-amber-500 text-black font-semibold rounded hover:bg-amber-600 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button 
          aria-label="Toggle navigation" aria-expanded={menuOpen}
          className="md:hidden text-gray-300 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-gray-800 bg-[#29170f]">
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-gray-300 hover:text-amber-500" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/giveaways" className="text-gray-300 hover:text-amber-500" onClick={() => setMenuOpen(false)}>Active Giveaways</Link>
            
            {!loading && (
              <>
                {user ? (
                  <>
                    {profile?.is_admin && (
                      <Link href="/admin" className="text-gray-300 hover:text-amber-500" onClick={() => setMenuOpen(false)}>Admin</Link>
                    )}
                    <Link href="/profile" className="text-gray-300 hover:text-amber-500" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-left text-gray-400 hover:text-red-400">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-300 hover:text-amber-500" onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link href="/signup" className="text-amber-500 font-semibold" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
