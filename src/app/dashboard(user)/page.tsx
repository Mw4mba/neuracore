"use client";

import React, { useEffect, useState } from "react";
import StatCard from "@/components/profile/Stats";
import IdeaPerformance from "@/components/IdeaPerformance";
import QuickStats from "@/components/QuickStats";
import Achievements from "@/components/profile/Achievements";
import ActivityThisWeek from "@/components/ActivityThisWeek";
import JoinedChallenges from "@/components/dashboard/JoinedChallenges";
import { Eye, Heart, MessageSquare, Users } from "lucide-react";
import { withAuth } from "@/components/withAuth";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner";
import IdeaPerformanceSkeleton from "@/components/loaders/IdeaPerformanceSkeleton";
import { myTotalLikes } from "@/lib/myTotalLikes";
import { myTotalViews } from "@/lib/myTotalViews";
import { get } from "http";
import { myTotalComments } from "@/lib/myTotalComments";

function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userIdeas, setUserIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalComments, setTotalComments] = useState(0);



  // 🔹 Fetch the logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("Error fetching user");
        return;
      }

      setUser(user);
    };

    fetchUser();
  }, []);

  // 🔹 Fetch ideas by the logged-in user
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserIdeas = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ideas/author/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch user's ideas");

        const data = await res.json();
        setUserIdeas(data);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching user ideas");
      } finally {
        setLoading(false);
      }
    };

    fetchUserIdeas();
  }, [user]);
  useEffect(() => {
  const getLikes = async () => {
    const likes = await myTotalLikes();
    setTotalLikes(likes);
  };

  getLikes();

  const getViews = async () => {
    const views = await myTotalViews();
    setTotalViews(views);
  };

  getViews();
}, []);

useEffect(() => {
  const fetchTotalComments = async () => {
    try {
      const res = await fetch("/api/comments/total");
      if (!res.ok) throw new Error("Failed to fetch total comments");

      const data = await res.json();
      setTotalComments(data.totalComments);
    } catch (err) {
      console.error(err);
    }
  };

  fetchTotalComments();
}, []);


  return (
    <main className="py-8 px-[4vw] md:px-[10vw] bg-[var(--color-bg)]">
      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={`${totalViews}`}
          change="+12%"
          icon={<Eye size={24} className="text-gray-400" />}
        />
        <StatCard
          title="Total Likes"
          value={`${totalLikes}`}
          change="+8%"
          icon={<Heart size={24} className="text-gray-400" />}
        />
        <StatCard
          title="Comments"
          value={`${totalComments}`}
          change="+15%"
          icon={<MessageSquare size={24} className="text-gray-400" />}
        />
        <StatCard
          title="Followers"
          value="1,250"
          change="+22%"
          icon={<Users size={24} className="text-gray-400" />}
        />
      </div>

      {/* ---------- RECENT IDEAS ---------- */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <JoinedChallenges />
          <div className="bg-[var(--color-bg-dark)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
              Recent Ideas Performance
            </h2>

            {loading ? (
              <IdeaPerformanceSkeleton />
            ) : userIdeas.length === 0 ? (
              <p className="text-gray-400">No ideas yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {userIdeas.slice(0, 3).map((idea) => (
                  <IdeaPerformance key={idea.id} idea={idea} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------- RIGHT SIDEBAR ---------- */}
        <div className="flex flex-col gap-8">
          <QuickStats />
          <Achievements userId={user?.id}/>
          <ActivityThisWeek />
        </div>
      </div>
    </main>
  );
}

export default withAuth(DashboardPage);
