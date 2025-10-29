import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

interface User {
  id: string;
  rank: number;
  full_name?: string;
  username: string;
  avatar_url?: string;
  points: number;
  role?: string;
  trend?: "up" | "down" | "same";
}

interface Props {
  user: User;
  getRankColor: (rank: number) => string;
  getRankIcon: (rank: number) => React.ReactNode;
  getTrendIcon: (trend?: string) => React.ReactNode;
}

const UserRow: React.FC<Props> = ({
  user,
  getRankColor,
  getRankIcon,
  getTrendIcon,
}) => (
  <Link
    href={`/profile/${user.id}`}
    className="flex flex-col border-1 md:border-none border-border-secondary md:mb-0 mb-2 md:flex-row md:items-center gap-3 md:gap-4 p-4 rounded-xl hover:bg-bg-dark-gray/60 transition-colors"
  >
    {/* Rank on top for mobile */}
    <div
      className={`text-xl md:text-2xl font-semibold md:w-12 text-center ${getRankColor(
        user.rank
      )}`}
    >
      {user.rank <= 3 ? getRankIcon(user.rank) : user.rank}
    </div>

    {/* User info and points section */}
    <div className="flex flex-col sm:flex-row items-center sm:items-start md:flex-1 gap-3 w-full">
      <img
        src={
          user.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
        }
        alt={user.full_name || user.username}
        className="w-12 h-12 rounded-full border-2 border-[var(--color-brand-red)]"
      />

      {/* Name and Role */}
      <div className="flex-1 text-center sm:text-left">
        <h4 className="font-medium text-base sm:text-lg">
          {user.full_name || user.username}
        </h4>
        <p className="text-[var(--color-text-secondary)] text-sm">{user.role}</p>
      </div>

      {/* Points section */}
      <div className="flex flex-col items-center sm:items-end gap-1">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-[var(--color-brand-red)]" />
          <span className="font-semibold text-sm sm:text-base">
            {user.points}
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">points</p>
        <div className="hidden sm:block">{getTrendIcon(user.trend)}</div>
      </div>
    </div>
  </Link>
);

export default UserRow;
