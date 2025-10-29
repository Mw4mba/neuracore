"use client";

import React from "react";

const IdeaPerformanceSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--color-bg-dark)] p-6 rounded-lg border border-[var(--color-border-secondary)] flex flex-col gap-4 animate-pulse">
      {/* Title and category */}
      <div className="flex justify-between items-center">
        <div className="h-5 w-3/4 bg-[var(--color-border-secondary)] rounded"></div>
        <div className="h-4 w-16 bg-[var(--color-border-secondary)] rounded-full"></div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-sm">
        <div className="flex items-center gap-4">
          <div className="h-4 w-12 bg-[var(--color-border-secondary)] rounded"></div>
          <div className="h-4 w-12 bg-[var(--color-border-secondary)] rounded"></div>
          <div className="h-4 w-12 bg-[var(--color-border-secondary)] rounded"></div>
          <div className="h-4 w-16 bg-[var(--color-border-secondary)] rounded"></div>
        </div>
        <div className="h-4 w-16 bg-[var(--color-border-secondary)] rounded"></div>
      </div>
    </div>
  );
};

export default IdeaPerformanceSkeleton;
