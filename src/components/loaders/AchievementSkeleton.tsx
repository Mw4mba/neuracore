// components/profile/AchievementSkeleton.tsx
"use client";

import React from "react";

const AchievementSkeleton: React.FC = () => (
  <div className="flex border-1 border-brand-red rounded-lg py-2 px-1 bg-brand-red/10 flex-col items-center text-center gap-1 animate-pulse">
    <div className="w-8 h-8 bg-[var(--color-border-secondary)] rounded-full" />
    <div className="h-3 w-16 bg-[var(--color-border-secondary)] rounded mt-1" />
    <div className="h-2 w-20 bg-[var(--color-border-secondary)] rounded mt-1" />
  </div>
);

export default AchievementSkeleton;
