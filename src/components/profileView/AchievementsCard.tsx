"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Award } from "lucide-react";

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

const AchievementsCard: React.FC<AchievementsProps> = ({ userId }) => {
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

  return (
    <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-dark)] p-6 text-[var(--color-text-primary)]">
      <h3 className="text-lg font-semibold mb-4">Achievements</h3>

      {loading ? (
        <p className="text-[var(--color-text-secondary)] text-sm">Loading achievements...</p>
      ) : achievements.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-sm">No achievements yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="flex flex-col border-1 border-brand-red bg-brand-red/10 items-center text-center p-3 rounded-md"
            >
              <div className="w-8 h-8 flex items-center justify-center mb-1">
                {a.icon_url ? (
                  <img
                    src={a.icon_url}
                    alt={a.name}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <Award size={20} />
                )}
              </div>
              <span className="text-sm font-medium">{a.name}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {a.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsCard;
