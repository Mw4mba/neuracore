import React from "react";
import Link from "next/link";
import { Star, TrendingUp } from "lucide-react";

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

const AllList: React.FC<Props> = ({ user, getRankColor, getRankIcon, getTrendIcon }) => (
  <Link
    href={`/profile/${user.id}`}
    className="flex items-center gap-4 p-4 rounded-xl hover:bg-bg-dark-gray/60 transition-colors"
  >
    <div className={`text-2xl font-semibold w-12 text-center ${getRankColor(user.rank)}`}>
      {user.rank <= 3 ? getRankIcon(user.rank) : user.rank}
    </div>
    <img
      src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
      alt={user.full_name || user.username}
      className="w-12 h-12 rounded-full border-2 border-[var(--color-brand-red)]"
    />
    <div className="flex-1">
      <h4 className="font-semibold">{user.full_name || user.username}</h4>
      <p className="text-[var(--color-text-secondary)] text-sm">{user.role}</p>
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
);

export default AllList;
