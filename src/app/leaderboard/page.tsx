import { Suspense } from "react";
import { GiveawaysList } from "@/components/giveaway/GiveawaysList";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-4">Leaderboards</h1>
      <p className="text-gray-400 mb-8">Choose a giveaway to see its rankings.</p>
      <Suspense fallback={<div className="text-center py-12 text-amber-500 animate-pulse">Loading giveaways...</div>}>
        <GiveawaysList leaderboards />
      </Suspense>
    </section>
  );
}
