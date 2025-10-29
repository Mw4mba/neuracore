"use client";
import React, { useEffect, useState } from "react";
import { Trophy, Users, Star } from "lucide-react";
import { getTotalUsersClient } from "@/lib/getTotalUsers";

const LeaderboardHeader: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    getTotalUsersClient().then(setTotalUsers);
  }, []);

  return (
    <div className="mb-10">
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[var(--color-brand-red)]" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Leaderboard
          </h1>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-[var(--color-brand-red)]" />
            <span>{totalUsers} participants</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[var(--color-brand-red)]" />
            <span>Updated daily</span>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-[var(--color-text-secondary)] mt-3 text-base sm:text-lg">
        Top innovators ranked by{" "}
        <span className="text-[var(--color-brand-red)] font-medium">
          achievement points
        </span>
        . Track your progress and see who’s leading the charge!
      </p>
    </div>
  );
};

export default LeaderboardHeader;
