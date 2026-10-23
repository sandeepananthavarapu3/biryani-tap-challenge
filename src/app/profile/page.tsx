"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLoadingRouter as useRouter } from "@/components/providers/NavigationProvider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LeaderboardEntry } from "@/types";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<LeaderboardEntry[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (profile) {
      setName(profile.name);
      fetchHistory();
    }
  }, [user, loading, profile, router]);

  const fetchHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("leaderboard")
      .select(`*, giveaway:giveaway_id(title, status)`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      setHistory(data as any[]);
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ name }).eq("id", user.id);
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  if (loading || !user) {
    return <div className="min-h-screen pt-20 flex justify-center"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-8 text-white">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <div className="space-y-4 px-5 pb-5">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Name</p>
                {editing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="h-8 text-sm"
                    />
                    <Button size="sm" onClick={handleSaveName} loading={saving}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => {setEditing(false); setName(profile?.name || "");}}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium">{profile?.name || "No name set"}</p>
                    <button onClick={() => setEditing(true)} className="text-xs text-amber-500 hover:underline">Edit</button>
                  </div>
                )}
              </div>
              
              {profile?.is_admin && (
                <div className="pt-4 mt-4 border-t border-gray-800">
                  <Badge type="official">Admin Account</Badge>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Giveaway History</CardTitle>
            </CardHeader>
            <div className="px-5 pb-5">
              {history.length === 0 ? (
                <div className="text-center py-8 bg-[#1a1a1a] rounded border border-gray-800">
                  <p className="text-gray-400">You haven't participated in any giveaways yet.</p>
                  <Button className="mt-4" onClick={() => router.push("/giveaways")}>
                    Find Giveaways
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry: any) => (
                    <div key={entry.id} className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="text-amber-500 font-bold">{entry.giveaway.title}</h4>
                        <div className="text-sm text-gray-400 mt-1 flex items-center gap-4">
                          <span>Time: {(entry.total_reaction_time / 1000).toFixed(3)}s</span>
                          {entry.rank && <span>Rank: #{entry.rank}</span>}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge status={entry.giveaway.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
