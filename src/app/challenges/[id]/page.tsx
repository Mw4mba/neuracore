"use client";
import React, { useEffect, useRef, useState } from "react";
import ChallengeHeader from "@/components/challenge/ChallengeHeader";
import ChallengeCards from "@/components/challenge/ChallengeCards";
import ChallengeTabs from "@/components/challenge/ChallengeTabs";
import ChallengeContent from "@/components/challenge/ChallengeContent";
import ChallengeActions from "@/components/challenge/ChallengeActions";
import { toast } from "sonner";

const ChallengePage = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [profile, setProfile] = useState<{
        full_name?: string;
        username?: string;
        avatar_url?: string;
        role?: string;
      } | null>(null);

  useEffect(() => {
        const fetchProfile = async () => {
          try {
            const res = await fetch("/api/profile/get");
            if (!res.ok) {
              toast.warning("Not logged in or failed to fetch profile");
              return;
            }
            const data = await res.json();
            setProfile(data.user || data); 
          } catch (err) {
            console.error("Error fetching profile:", err);
          }
        };
      
        fetchProfile();
      }, []);
      
        const profileRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full px-[4vw] md:px-[10vw] pb-8 min-h-screen bg-bg">
      <ChallengeHeader
        categories={["AI & Technology", "Health"]}
        title="AI-Powered Healthcare Assistant"
        name="HealthTech Corp"
        link="/challenges"
      />

      <ChallengeCards />
      <ChallengeActions profile_role={profile?.role}/>
      <ChallengeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ChallengeContent activeTab={activeTab} />
    </section>
  );
};

export default ChallengePage;
