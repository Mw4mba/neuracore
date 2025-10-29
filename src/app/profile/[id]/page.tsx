"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Trophy,
  Lightbulb,
  Target,
  Award,
  ArrowLeft,
  ArrowUp,
  MessageCircle,
} from "lucide-react";
import ProfileCard from "@/components/profileView/ProfileCard";
import StatsCard from "@/components/profileView/StatsCard";
import SkillsCard from "@/components/profileView/SkillsCard";
import AchievementsCard from "@/components/profileView/AchievementsCard";
import UserTabs from "@/components/profileView/UserTabs";

const ProfileView: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ideas" | "challenges">("ideas");
  const [user, setUser] = useState<any>(null);
  const [userIdeas, setUserIdeas] = useState<any[]>([]);

  // ✅ Fetch profile by ID
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/profile/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [id]);

  // Fetch ideas by this author
  useEffect(() => {
    if (!id) return;

    const fetchUserIdeas = async () => {
      try {
        const res = await fetch(`/api/ideas/author/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user's ideas");
        const data = await res.json();
        setUserIdeas(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserIdeas();
  }, [id]);
  // const user = {
  //   id: id as string,
  //   name: "Sarah Johnson",
  //   username: "@sarahj",
  //   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  //   bio: "Innovation enthusiast | Full-stack developer | AI/ML researcher | Building the future one idea at a time",
  //   location: "Frank Monquer",
  //   website: "franklin-404",
  //   joinDate: "January 2024",
  //   stats: {
  //     ideas: 23,
  //     challenges: 8,
  //     wins: 5,
  //     points: 4250,
  //   },
  //   skills: ["AI/ML", "React", "Node.js", "Python", "UI/UX", "Blockchain"],
  //   achievements: [
  //     { id: 1, name: "Top Innovator", icon: Trophy, color: "text-yellow-400" },
  //     { id: 2, name: "Challenge Master", icon: Target, color: "text-blue-400" },
  //     { id: 3, name: "Community Leader", icon: Award, color: "text-purple-400" },
  //   ],
  // };

  // const userIdeas = [
  //   {
  //     id: 1,
  //     title: "AI-Powered Code Review Assistant",
  //     category: "Technology",
  //     votes: 234,
  //     comments: 45,
  //   },
  //   {
  //     id: 2,
  //     title: "Sustainable Food Delivery Network",
  //     category: "Sustainability",
  //     votes: 189,
  //     comments: 32,
  //   },
  // ];

  const userChallenges = [
    {
      id: 1,
      title: "Healthcare Innovation Sprint",
      status: "Winner",
      prize: "R5,000",
    },
    {
      id: 2,
      title: "EdTech Platform Challenge",
      status: "Finalist",
      prize: "R2,500",
    },
  ];

  return (
    <div className="min-h-screen pb-8 text-text-primary bg-bg px-[4vw] md:px-[10vw]">
      <div className="container mx-auto px-4 py-8 ">
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <ProfileCard user={user} />
            {/* <StatsCard user={user} />
            <SkillsCard user={user} />*/}
            <AchievementsCard userId={user?.id} /> 
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <UserTabs userIdeas={userIdeas} userChallenges={userChallenges} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
