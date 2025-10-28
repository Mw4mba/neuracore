"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Medal, TrendingUp, Star } from "lucide-react";

interface User {
  id: number;
  rank: number;
  name: string;
  username: string;
  avatar: string;
  points: number;
  ideas: number;
  wins: number;
  trend: "up" | "down" | "same";
}

const mockLeaderboard: User[] = [
  { id: 1, rank: 1, name: "Alex Chen", username: "@alexchen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", points: 8540, ideas: 45, wins: 12, trend: "up" },
  { id: 2, rank: 2, name: "Maria Garcia", username: "@mariag", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", points: 7890, ideas: 38, wins: 10, trend: "up" },
  { id: 3, rank: 3, name: "David Kim", username: "@davidk", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David", points: 7420, ideas: 42, wins: 9, trend: "same" },
  { id: 4, rank: 4, name: "Emma Wilson", username: "@emmaw", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", points: 6850, ideas: 35, wins: 8, trend: "up" },
  { id: 5, rank: 5, name: "James Taylor", username: "@jamest", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", points: 6320, ideas: 31, wins: 7, trend: "down" },
];

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"all-time" | "monthly" | "weekly">("all-time");

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-[var(--color-brand-red)]";
    return "text-[var(--color-text-secondary)]";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-[var(--color-brand-red)]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[var(--color-text-secondary)]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-[var(--color-text-secondary)]" />;
    return null;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />;
    if (trend === "down") return <TrendingUp className="w-4 h-4 text-[var(--color-error)] rotate-180" />;
    return null;
  };

  return (
    <div className="min-h-screen px-[4vw] md:px-[10vw] bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-8 h-8 text-[var(--color-brand-red)]" />
            <h1 className="text-4xl font-semibold">Leaderboard</h1>
          </div>
          <p className="text-[var(--color-text-secondary)]">
            Top innovators and challenge winners ranked by contributions
          </p>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex bg-bg-dark border-1 py-2 px-3 justify-between rounded-lg border-border-secondary gap-4 mb-8">
          {["all-time", "monthly", "weekly"].map((tf) => (
            <button
              key={tf}
              className={`px-4 w-full cursor-pointer py-2 rounded-md font-medium duration-300 transition-colors ${
                timeframe === tf
                  ? "bg-bg text-[var(--color-primary)]"
                  : "bg-bg-gray text-[var(--color-text-secondary)] hover:bg-bg-dark"
              }`}
              onClick={() => setTimeframe(tf as "all-time" | "monthly" | "weekly")}
            >
              {tf === "all-time" ? "All Time" : tf === "monthly" ? "This Month" : "This Week"}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
          {mockLeaderboard.slice(0, 3).map((user) => (
            <Link key={user.id} href={`/profile/${user.id}`}>
              <div
                className="w-full h-96 flex flex-col justify-between p-6 rounded-xl border border-[var(--color-border-secondary)] 
                bg-[rgba(255,255,255,0.05)] backdrop-blur-md hover:border-[var(--color-brand-red)] transition-all duration-300"
              >
                {getRankIcon(user.rank)}
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 mx-auto rounded-full border-2 border-[var(--color-brand-red)] my-2"
                />
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-[var(--color-text-secondary)] mb-2">{user.username}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-[var(--color-brand-red)]" />
                    <span className="text-2xl font-semibold">{user.points}</span>
                    <span className="text-[var(--color-text-secondary)]">pts</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-[var(--color-bg-dark-gray)] rounded-lg p-2 text-center">
                    <p className="text-lg font-semibold text-text-primary">{user.ideas}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Ideas</p>
                  </div>
                  <div className="bg-[var(--color-bg-dark-gray)] rounded-lg p-2 text-center">
                    <p className="text-lg font-semibold text-text-primary">{user.wins}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Wins</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Full Leaderboard */}
        <div className="bg-[var(--color-bg-dark)] border border-[var(--color-border-secondary)] rounded-xl p-6 w-full">
          {mockLeaderboard.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-bg-dark-gray/60 transition-colors"
            >
              <div className={`text-2xl font-semibold w-12 text-center ${getRankColor(user.rank)}`}>
                {user.rank <= 3 ? getRankIcon(user.rank) : user.rank}
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-[var(--color-brand-red)]"
              />
              <div className="flex-1">
                <h4 className="font-semibold">{user.name}</h4>
                <p className="text-[var(--color-text-secondary)] text-sm">{user.username}</p>
              </div>
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-[var(--color-brand-red)]">{user.ideas}</p>
                  <p className="text-[var(--color-text-secondary)]">Ideas</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-[var(--color-brand-red)]">{user.wins}</p>
                  <p className="text-[var(--color-text-secondary)]">Wins</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getTrendIcon(user.trend)}
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[var(--color-brand-red)]" />
                    <span className="font-semibold">{user.points}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">points</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="w-full mx-auto mt-6">
  <div className="bg-[var(--color-bg-gradient)] border border-[var(--color-primary)/50] rounded-xl backdrop-blur-md p-6">
    <div className="flex items-center gap-4 p-4">
      {/* Rank number */}
      <div className="text-2xl font-bold w-12 text-center text-[var(--color-text-primary)]">
        42
      </div>

      {/* Avatar */}
      <div className="h-12 w-12 rounded-full border-2 border-[var(--color-text-secondary)/30] overflow-hidden">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
          alt="You"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <h4 className="font-semibold text-[var(--color-text-primary)]">My Rank</h4>
        <p className="text-sm text-[var(--color-text-secondary)]">Keep innovating to climb higher!</p>
      </div>

      {/* Points */}
      <div className="text-right">
        <div className="flex items-center gap-1 text-[var(--color-text-primary)]">
          <Star className="h-4 w-4 text-[var(--color-brand-red)]" />
          <span className="text-lg font-bold">2,340</span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">points</p>
      </div>
    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default Leaderboard;
