"use client";

import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AchievementSkeleton from "../loaders/AchievementSkeleton";

interface AchievementItemProps {
  iconUrl?: string;
  title: string;
  description: string;
}

const AchievementItem: React.FC<AchievementItemProps> = ({
  iconUrl,
  title,
  description,
}) => (
  <div className="flex border-1 border-brand-red rounded-lg py-2 px-1 bg-brand-red/10 flex-col items-center text-center gap-1">
    <div className="w-8 h-8 flex items-center justify-center">
      {iconUrl ? (
        <img src={iconUrl} alt={title} className="w-6 h-6 object-contain" />
      ) : (
        <Award size={20} />
      )}
    </div>
    <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">
      {title}
    </h4>
    <p className="text-[0.65rem] text-[var(--color-text-secondary)]">
      {description}
    </p>
  </div>
);

interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  points?: number;
  unlocked_at?: string;
}

interface AchievementsProps {
  userId?: string;
}

const Achievements: React.FC<AchievementsProps> = ({ userId }) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/achievements/user?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch achievements");

        const data = await res.json();
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching achievements");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  const displayAchievements = achievements.slice(0, 4);

  return (
    <div className="bg-[var(--color-bg-dark)] p-6 rounded-lg border border-[var(--color-border-secondary)] text-[var(--color-text-primary)]">
      <div className="flex items-center gap-3 mb-4">
        <Award size={20} className="text-[var(--color-text-secondary)]" />
        <h3 className="text-lg font-semibold">Achievements</h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <AchievementSkeleton key={i} />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <p className="text-[var(--color-text-secondary)]">No achievements yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2  gap-y-4 gap-x-2">
            {displayAchievements.map((ach) => (
              <AchievementItem
                key={ach.id}
                iconUrl={ach.icon_url}
                title={ach.name}
                description={ach.description}
              />
            ))}
          </div>
          {achievements.length > 4 && (
            <div className="mt-2 text-right">
              <Link
                href="/profile?tab=Achievements"
                className="text-sm text-[var(--color-brand-red)] hover:underline"
              >
                View More
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Achievements;
