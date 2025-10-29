import React from 'react';

const ProfileCardLoader = () => {
  return (
    <div className="rounded border border-[var(--color-border-secondary)] bg-[var(--color-bg-dark)] p-6 text-center animate-pulse">
      <div className="h-32 w-32 rounded-full border-4 border-[var(--color-brand-red)]/20 mx-auto mb-4 bg-[var(--color-border-secondary)]" />
      <div className="h-6 w-32 mx-auto mb-2 bg-[var(--color-border-secondary)] rounded" />
      <div className="h-4 w-24 mx-auto mb-4 bg-[var(--color-border-secondary)] rounded" />
      <div className="h-12 w-full mx-auto mb-4 bg-[var(--color-border-secondary)] rounded" />
      <div className="space-y-2 text-sm mb-6">
        <div className="h-4 w-24 mx-auto bg-[var(--color-border-secondary)] rounded" />
        <div className="h-4 w-32 mx-auto bg-[var(--color-border-secondary)] rounded" />
        <div className="h-4 w-28 mx-auto bg-[var(--color-border-secondary)] rounded" />
      </div>
      <div className="h-10 w-full bg-[var(--color-brand-red)] rounded mx-auto" />
    </div>
  );
};

export default ProfileCardLoader;
