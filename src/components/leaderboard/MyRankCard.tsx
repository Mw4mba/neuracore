import React from "react";
import { Star } from "lucide-react";

interface User {
  rank: number;
  full_name: string;
  username: string;
  avatar_url?: string;
  points: number;
}

interface Props {
  user: User;
}

const MyRankCard: React.FC<Props> = ({ user }) => (
  <div className="bg-[var(--color-bg-dark)] border border-[var(--color-border-secondary)] rounded-xl p-4 sm:p-6 w-full mb-8 sm:mb-12">
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-center sm:text-left">
      {/* Rank (on top for mobile) */}
      <div className="text-3xl sm:text-2xl font-bold text-[var(--color-text-primary)] sm:w-12 mx-auto sm:mx-0">
        {user.rank}
      </div>

      {/* Avatar + Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-3 sm:gap-4 flex-1">
        <img
          src={
            user.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
          }
          alt={user.full_name}
          className="w-20 h-20 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--color-brand-red)]"
        />
        <div>
          <h4 className="font-semibold text-base sm:text-lg text-[var(--color-text-primary)]">
            {user.full_name}
          </h4>
          <p className="text-sm text-[var(--color-text-secondary)]">
            @{user.username}
          </p>
        </div>
      </div>

      {/* Points */}
      <div className="flex flex-col items-center sm:items-end gap-1 mt-2 sm:mt-0">
        <div className="flex items-center justify-center sm:justify-end gap-1 text-[var(--color-text-primary)]">
          <Star className="h-4 w-4 text-[var(--color-brand-red)]" />
          <span className="text-lg font-bold">{user.points}</span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">points</p>
      </div>
    </div>
  </div>
);

export default MyRankCard;
