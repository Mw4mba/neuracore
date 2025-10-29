import React from 'react';

const IdeaCardLoader = () => {
  return (
    <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-dark)] overflow-hidden animate-pulse">
      <div className="bg-[rgba(255,255,255,0.05)] h-40 sm:h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[var(--color-border-secondary)] rounded w-1/3" />
        <div className="h-3 bg-[var(--color-border-secondary)] rounded w-1/2" />
        <div className="h-3 bg-[rgba(255,255,255,0.1)] rounded w-2/3" />
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-[var(--color-border-secondary)] rounded w-1/4" />
          <div className="h-3 bg-[var(--color-border-secondary)] rounded w-1/6" />
        </div>
      </div>
    </div>
  );
};

export default IdeaCardLoader;
