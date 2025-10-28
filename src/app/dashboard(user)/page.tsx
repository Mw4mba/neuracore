"use client";

import React from "react";
import StatCard from "@/components/profile/Stats";
import IdeaPerformance from "@/components/IdeaPerformance";
import QuickStats from "@/components/QuickStats";
import Achievements from "@/components/profile/Achievements";
import ActivityThisWeek from "@/components/ActivityThisWeek";
import { Eye, Heart, MessageSquare, Users } from "lucide-react";
import { withAuth } from "@/components/withAuth";
import JoinedChallenges from "@/components/dashboard/JoinedChallenges";

function DashboardPage() {
  return (
    <main className="py-8 px-[4vw] md:px-[10vw] bg-[var(--color-bg)]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value="45,300"
          change="+12%"
          icon={<Eye size={24} className="text-gray-400" />}
        />
        <StatCard
          title="Total Likes"
          value="3,420"
          change="+8%"
          icon={<Heart size={24} className="text-gray-400" />}
        />
        <StatCard
          title="Comments"
          value="892"
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

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <JoinedChallenges />
          <div className="bg-[var(--color-bg-dark)] p-6 rounded-lg border border-[var(--color-border-secondary)]">   
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
              Recent Ideas Performance
            </h2>
            <div className="flex flex-col gap-4">
              <IdeaPerformance
                title="AI-Powered Personal Finance Assistant"
                tag={{ text: "trending", color: "bg-red-500" }}
                stats={{
                  views: "12,500",
                  likes: "892",
                  comments: "156",
                  rating: "4.8/5",
                }}
                time="2 hours ago"
              />
              <IdeaPerformance
                title="Sustainable Urban Farming Network"
                tag={{ text: "popular", color: "bg-gray-600" }}
                stats={{
                  views: "8,300",
                  likes: "654",
                  comments: "89",
                  rating: "4.6/5",
                }}
                time="1 day ago"
              />
              <IdeaPerformance
                title="Virtual Reality Therapy Sessions"
                tag={{ text: "viral", color: "bg-gray-600" }}
                stats={{
                  views: "15,600",
                  likes: "1,200",
                  comments: "234",
                  rating: "4.9/5",
                }}
                time="3 days ago"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <QuickStats />
          <Achievements />
          <ActivityThisWeek />
        </div>
      </div>
    </main>
  );
}

export default withAuth(DashboardPage);
