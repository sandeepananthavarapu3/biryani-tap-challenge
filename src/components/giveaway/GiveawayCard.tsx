"use client";

import { motion } from "framer-motion";
import { Giveaway } from "@/types";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { Users, Trophy } from "lucide-react";
import { useLoadingRouter as useRouter } from "@/components/providers/NavigationProvider";
import { effectiveGiveawayStatus } from "@/lib/giveaway/status";

interface GiveawayCardProps {
  leaderboardOnly?: boolean;
  giveaway: Giveaway & { participantCount?: number };
}

export function GiveawayCard({ giveaway, leaderboardOnly = false }: GiveawayCardProps) {
  const router = useRouter();
  const status = effectiveGiveawayStatus(giveaway);
  const isLive = status === "live";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={isLive ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : ""}>
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge status={status} />
            {giveaway.end_time && status !== "ended" && status !== "draft" && (
              <Countdown 
                giveawayId={giveaway.id} 
                endTime={giveaway.end_time} 
                className="text-sm"
              />
            )}
          </div>
          <CardTitle className="text-xl text-amber-500 text-glow truncate">
            {giveaway.title}
          </CardTitle>
          <p className="text-gray-400 text-sm line-clamp-2 mt-1 min-h-[40px]">
            {giveaway.description || "Join this giveaway to win awesome prizes!"}
          </p>
        </CardHeader>
        
        <div className="px-5 py-2 grid grid-cols-2 gap-4 text-sm text-gray-300 bg-[#1a1a1a] mx-5 rounded">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="truncate">{giveaway.prize_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <span>{giveaway.participantCount || 0} Joined</span>
          </div>
        </div>

        <CardFooter className="justify-end gap-3">
          {leaderboardOnly && (
            <Button variant="secondary" onClick={() => router.push(`/giveaway/${giveaway.id}/leaderboard`)}>
              View Leaderboard
            </Button>
          )}
          {!leaderboardOnly && status === "scheduled" && (
            <Button variant="secondary" onClick={() => router.push(`/giveaway/${giveaway.id}`)}>
              View Details
            </Button>
          )}
          {!leaderboardOnly && status === "live" && (
            <Button variant="primary" onClick={() => router.push(`/giveaway/${giveaway.id}/play`)}>
              Join Official Game 🍗
            </Button>
          )}
          {!leaderboardOnly && status === "ended" && (
            <Button variant="ghost" onClick={() => router.push(`/giveaway/${giveaway.id}/leaderboard`)}>
              View Results
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
