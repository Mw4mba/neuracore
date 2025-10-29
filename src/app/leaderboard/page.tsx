"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";

import { Trophy, Medal, TrendingUp } from "lucide-react";
import LeaderboardHeader from "@/components/leaderboard/LeaderboardHeader";
import LeaderboardTabs from "@/components/leaderboard/LeaderboardTabs";
import TopThreeUserCard from "@/components/leaderboard/TopThreeCard";
import AllList from "@/components/leaderboard/AllList";
import MyRankCard from "@/components/leaderboard/MyRankCard";
import UserRow from "@/components/leaderboard/UserRow";
import LeaderboardSkeleton from "@/components/loaders/LeaderboardLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface User {
  id: string;
  rank: number;
  full_name: string;
  role: string;
  username: string;
  avatar_url: string;
  points: number;
  trend?: "up" | "down" | "same";
}

const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<"top3" | "all" | "myrank">("top3");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return toast.error("Error fetching user");
      setCurrentUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data: User[] = await res.json();
        const sorted = [...data].sort((a, b) => b.points - a.points);
        sorted.forEach((u, i) => (u.rank = i + 1));
        setUsers(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (currentUserId && users.length > 0) {
      setCurrentUser(users.find((u) => u.id === currentUserId) || null);
    }
  }, [currentUserId, users]);

  const getRankColor = (rank: number) => rank === 1 ? "text-[var(--color-brand-red)]" : "text-[var(--color-text-secondary)]";
  const getRankIcon = (rank: number) => rank === 1 ? <Trophy className="w-6 h-6 text-[var(--color-brand-red)]" /> : (rank === 2 || rank === 3 ? <Medal className="w-6 h-6 text-[var(--color-text-secondary)]" /> : null);
  const getTrendIcon = (trend?: string) => trend === "up" ? <TrendingUp className="w-4 h-4 text-[var(--color-success)]" /> : (trend === "down" ? <TrendingUp className="w-4 h-4 text-[var(--color-error)] rotate-180" /> : null);

  if (loading) return <LoadingSpinner />;

  const topThree = users.slice(0, 3);
  const filteredUsers = users.filter(u => (u.full_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) || (u.username ?? "").toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen px-[4vw] md:px-[10vw] bg-[var(--color-bg)] text-[var(--color-text-primary)] relative">
      <div className="container mx-auto px-4 py-8 pb-32">
        <LeaderboardHeader />
        <LeaderboardTabs activeTab={tab} setActiveTab={setTab} />

        {tab === "top3" && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
          {topThree.map(user => <TopThreeUserCard key={user.id} user={user} getRankIcon={getRankIcon} />)}
        </div>}

        {tab === "all" && <>
          <div className="flex items-center mb-4 gap-2">
            <input
              type="text"
              placeholder="Search by name or username"
              className="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border-secondary)] rounded-lg px-3 py-2 text-[var(--color-text-primary)] focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bg-[var(--color-bg-dark)] scrollbar-none mb-2 border border-[var(--color-border-secondary)] rounded-xl p-6 w-full max-h-[60vh] overflow-y-auto">
            {filteredUsers.map(user => <UserRow key={user.id} user={user} getRankColor={getRankColor} getRankIcon={getRankIcon} getTrendIcon={getTrendIcon} />)}
          </div>
        </>}

        {tab === "myrank" && currentUser && <MyRankCard user={currentUser} />}
      </div>
    </div>
  );
};

export default Leaderboard;
