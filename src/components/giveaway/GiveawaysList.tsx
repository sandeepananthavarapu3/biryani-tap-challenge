import { createClient } from "@/lib/supabase/server";
import { GiveawayCard } from "@/components/giveaway/GiveawayCard";
import { effectiveGiveawayStatus } from "@/lib/giveaway/status";

export async function GiveawaysList({ leaderboards = false }: { leaderboards?: boolean }) {
  const supabase = createClient();
  const { data: giveaways, error } = await supabase
    .from("giveaways")
    .select("*")
    .in("status", leaderboards ? ["live", "scheduled", "ended"] : ["live", "scheduled"])
    .order("start_time", { ascending: true });

  if (error || !giveaways?.length) {
    return (
      <div className="text-center py-12 bg-[#111] rounded-lg border border-gray-800">
        <p className="text-gray-400">No active or upcoming giveaways right now.</p>
        <p className="text-gray-500 text-sm mt-2">Check back later for your chance to win!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {giveaways
        .map((giveaway) => ({ ...giveaway, status: effectiveGiveawayStatus(giveaway) }))
        .filter((giveaway) => leaderboards || ['live', 'scheduled'].includes(giveaway.status))
        .map((giveaway) => (
          <GiveawayCard key={giveaway.id} giveaway={giveaway} leaderboardOnly={leaderboards} />
        ))}
    </div>
  );
}
