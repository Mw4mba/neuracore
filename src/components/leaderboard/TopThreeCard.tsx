import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

interface User {
  id: string;
  rank: number;
  full_name: string;
  username: string;
  avatar_url: string;
  points: number;
}

interface Props {
  user: User;
  getRankIcon: (rank: number) => React.ReactNode;
}

const TopThreeUserCard: React.FC<Props> = ({ user, getRankIcon }) => (
  <Link href={`/profile/${user.id}`} className="w-full">
    <div
      className="flex flex-col justify-between items-center text-center 
      p-4 sm:p-6 rounded-xl border border-[var(--color-border-secondary)] 
      bg-[rgba(255,255,255,0.05)] backdrop-blur-md 
      hover:border-[var(--color-brand-red)] transition-all duration-300
      h-auto sm:h-96"
    >
      {/* Rank Icon */}
      <div className="mb-3 sm:mb-4 flex justify-center">{getRankIcon(user.rank)}</div>

      {/* Avatar */}
      <img
        src={
          user.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
        }
        alt={user.full_name}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[var(--color-brand-red)] my-2 sm:my-3 object-cover"
      />

      {/* User Info */}
      <div className="flex flex-col items-center">
        <h3 className="text-lg sm:text-xl font-semibold">{user.full_name}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-1 sm:mb-2">
          @{user.username}
        </p>

        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-brand-red)]" />
          <span className="text-xl sm:text-2xl font-semibold">{user.points}</span>
          <span className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            pts
          </span>
        </div>
      </div>
    </div>
  </Link>
);

export default TopThreeUserCard;
