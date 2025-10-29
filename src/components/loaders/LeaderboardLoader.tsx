"use client";

import React from "react";

const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 mb-2 rounded-xl bg-[var(--color-bg-dark)] animate-pulse">
    <div className="w-12 h-12 bg-[var(--color-border-secondary)] rounded-full" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 w-3/4 bg-[var(--color-border-secondary)] rounded" />
      <div className="h-3 w-1/2 bg-[var(--color-border-secondary)] rounded" />
    </div>
    <div className="w-16 h-4 bg-[var(--color-border-secondary)] rounded" />
  </div>
  );
};

export default LeaderboardSkeleton;
