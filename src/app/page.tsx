import { Suspense } from "react";
import Link from "next/link";
import { GiveawaysList } from "@/components/giveaway/GiveawaysList";
import { Button } from "@/components/ui/Button";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen spice-page">
      {/* Hero Section */}
      <section className="spice-hero relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto text-center space-y-8 z-10">
          <p className="text-amber-200 text-xs font-bold uppercase tracking-[0.3em]">Fresh biryani. Fast fingers.</p>
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-amber-300/15 border-2 border-amber-300/40 shadow-xl rotate-[-8deg]">
            <span className="text-6xl drop-shadow-2xl">🍗</span>
          </div>
          
          <h1 className="spice-heading text-5xl md:text-7xl font-extrabold tracking-tight">
            Biryani Tap Challenge
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Tap the chicken. Win the biryani.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Link href="/giveaways">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                Join Now
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Giveaways Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
            Active Giveaways
          </h2>
        </div>
        
        <Suspense fallback={<div className="text-center py-12 text-amber-500 animate-pulse">Loading giveaways...</div>}>
          <GiveawaysList />
        </Suspense>
      </section>
    </div>
  );
}
