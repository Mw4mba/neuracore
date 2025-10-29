"use client";

import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import AchievementCard from "./AchievementCard";
import { useSession } from "@/lib/auth/session-provider";
import { fetchUserIdeaCount } from "@/lib/fetchUserIdeaCount";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  points: number;
  unlocked_at: string;
}

const UserAchievements = () => {
  const { user } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  


  useEffect(() => {
    if (!user?.id) return;

    const fetchAchievements = async () => {
      try {
        const res = await fetch(`/api/achievements/user?userId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setAchievements(data.achievements);
        } else {
          console.error("Error fetching achievements:", data.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  


  if (loading) return <div className="py-8 text-center text-text-secondary">Loading achievements...</div>;
  if (!achievements.length)
    return (
      <div className="bg-bg-dark p-8 rounded-lg border border-border-secondary text-text-secondary">
        <div className="flex items-center gap-3 mb-4">
          <Award className="text-text-secondary" />
          <h3 className="text-lg font-semibold text-text-primary">Your Achievements</h3>
        </div>
        <p>You haven’t unlocked any achievements yet.</p>
      </div>
    );

  return (
    <div className="bg-bg-dark p-8 rounded-lg border border-border-secondary">
      <div className="flex items-center gap-3 mb-6">
        <Award className="text-text-secondary" />
        <h3 className="text-lg font-semibold text-text-primary">Your Achievements</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((ach) => (
          <AchievementCard
            key={ach.id}
            icon={ach.icon_url || "⭐"}
            title={ach.name}
            description={ach.description}
            date={new Date(ach.unlocked_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          />
        ))}
      </div>
    </div>
  );
};

export default UserAchievements;
