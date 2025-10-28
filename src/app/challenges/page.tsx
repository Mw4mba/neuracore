"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Filters from "@/components/challengesView/Filters";
import ChallengeGrid from "@/components/challengesView/ChallengeGrid";
import { toast } from "sonner";
import { PenLine } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  company: string;
  description: string;
  category: string;
  difficulty: string;
  prize: string;
  deadline: string;
  participants: number;
  tags: string[];
}

const mockChallenges: Challenge[] = [
  {
    id: "a",
    title: "AI-Powered Healthcare Assistant",
    company: "HealthTech Corp",
    description:
      "Design an AI solution to improve patient care and reduce hospital wait times.",
    category: "Healthcare",
    difficulty: "Advanced",
    prize: "R15,000",
    deadline: "2025-11-15",
    participants: 127,
    tags: ["AI", "Healthcare", "Machine Learning"],
  },
  {
    id: "b",
    title: "Sustainable Urban Farming Solution",
    company: "GreenFuture Inc",
    description:
      "Create an innovative solution for urban farming that maximizes yield in limited spaces.",
    category: "Sustainability",
    difficulty: "Intermediate",
    prize: "R10,000",
    deadline: "2025-11-30",
    participants: 89,
    tags: ["Sustainability", "Agriculture", "IoT"],
  },
  {
    id: "c",
    title: "Next-Gen EdTech Platform",
    company: "EduInnovate",
    description:
      "Build a platform that personalizes learning experiences using adaptive algorithms.",
    category: "Education",
    difficulty: "Advanced",
    prize: "R20,000",
    deadline: "2025-12-01",
    participants: 203,
    tags: ["Education", "AI", "UX Design"],
  },
  {
    id: "d",
    title: "Blockchain Supply Chain Tracker",
    company: "LogiChain Solutions",
    description:
      "Develop a blockchain-based solution for transparent supply chain management.",
    category: "Technology",
    difficulty: "Expert",
    prize: "R25,000",
    deadline: "2025-12-15",
    participants: 156,
    tags: ["Blockchain", "Supply Chain", "Web3"],
  },
];

const Challenges: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [profile, setProfile] = useState<{
      full_name?: string;
      username?: string;
      avatar_url?: string;
      role?: string;
    } | null>(null);

  const filteredChallenges = mockChallenges.filter((challenge) => {
    const categoryMatch =
      selectedCategory === "all" ||
      challenge.category.toLowerCase() === selectedCategory;
    const difficultyMatch =
      selectedDifficulty === "all" ||
      challenge.difficulty.toLowerCase() === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });
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

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Beginner: "bg-green-100 text-green-600 border-green-200",
      Intermediate: "bg-blue-100 text-blue-600 border-blue-200",
      Advanced: "bg-orange-100 text-orange-600 border-orange-200",
      Expert: "bg-red-100 text-red-600 border-red-200",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Content */}
      <main className="max-w-7xl px-[4vw] md:px-[10vw] mx-auto pt-16 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-bold mb-2">Active Challenges</h2>
            <p className="text-text-secondary">
              Participate in challenges and win amazing prizes
            </p>
          </div>
          {profile?.role === "moderator" && (
              <Link
                href="/recruiter/submit-challenge"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-btn-primary text-white font-medium hover:bg-btn-primary-hover transition"
              >
                <PenLine size={16} /> Submit Challenge
              </Link>
            )}
        </div>
        <Filters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
        />
        
        <ChallengeGrid
          filteredChallenges={filteredChallenges}
          getDifficultyColor={getDifficultyColor}
        />
      </main>
    </div>
  );
};

export default Challenges;
