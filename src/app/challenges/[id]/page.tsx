"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ChallengeHeader from "@/components/challenge/ChallengeHeader";
import ChallengeCards from "@/components/challenge/ChallengeCards";
import ChallengeTabs from "@/components/challenge/ChallengeTabs";
import ChallengeContent from "@/components/challenge/ChallengeContent";
import ChallengeActions from "@/components/challenge/ChallengeActions";
import { toast } from "sonner";

const ChallengePage = () => {
  const { id } = useParams(); // 🔹 Get challenge ID from URL
  const [activeTab, setActiveTab] = useState("Overview");
  const [challenge, setChallenge] = useState<any>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    username?: string;
    avatar_url?: string;
    role?: string;
  } | null>(null);

  // 🔹 Fetch logged-in user profile
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

  // 🔹 Fetch challenge details
  useEffect(() => {
    if (!id) return;

    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/challenges/${id}`);
        if (!res.ok) throw new Error("Failed to fetch challenge");
        const data = await res.json();
        setChallenge(data.challenge);
      } catch (err) {
        console.error("Error fetching challenge:", err);
        toast.error("Failed to load challenge details");
      }
    };

    fetchChallenge();
  }, [id]);

  const profileRef = useRef<HTMLDivElement>(null);

  if (!challenge) {
    return (
      <section className="w-full flex justify-center items-center min-h-screen bg-bg">
        <p className="text-gray-500">Loading challenge...</p>
      </section>
    );
  }

console.log(challenge);

  return (
    <section className="w-full px-[4vw] md:px-[10vw] pb-8 min-h-screen bg-bg">
      <ChallengeHeader
        tags={challenge.tags || ["AI & Technology"]}
        title={challenge.title}
        name={challenge.company || "Unknown"}
        link="/challenges"
      />


      <ChallengeCards challenge={challenge} />
      <ChallengeActions profile_role={profile?.role} challengeId={challenge.id} />
      <ChallengeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ChallengeContent activeTab={activeTab} challenge={challenge} />
    </section>
  );
};

export default ChallengePage;