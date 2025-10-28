"use client";

import React, { useEffect, useRef, useState } from "react";
import IdeaGrid from "@/components/TrendingIdeas/IdeaGrid";
import TrendingHeader from "@/components/TrendingIdeas/TrendingHeader";
import { withAuth } from "@/components/withAuth";
import { useSession } from "@/hooks/useSession";
import IdeasFilter from "@/components/TrendingIdeas/IdeasFilter";
import Link from "next/link";
import { toast } from "sonner";
import { PenLine } from "lucide-react";

function TrendingIdeas() {
  const { user } = useSession(false); // false means auth is not required
  const [ideas, setIdeas] = useState<any[]>([]);
  const [trendingIdeas, setTrendingIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [profile, setProfile] = useState<{
    full_name?: string;
    username?: string;
    avatar_url?: string;
    role?: string;
  } | null>(null);

  const categories = [
    "All",
    "General",
    "Tech",
    "Education",
    "Health",
    "Finance",
  ];

  // 🧠 Fetch filtered ideas (for main grid)
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (query) params.append("search", query);
        if (selected && selected !== "All") params.append("category", selected);

        params.append("limit", "20");
        params.append("page", "1");

        const res = await fetch(`/api/ideas/get?${params.toString()}`);
        const data = await res.json();

        if (res.ok) {
          setIdeas(data.ideas || []);
        } else {
          console.error("Error fetching ideas:", data.error);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [query, selected]);

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

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`/api/ideas/get?limit=100&page=1`);
        const data = await res.json();

        if (res.ok) {
        
          const trending = (data.ideas || []).filter(
            (idea: { likes: number }) => idea.likes > 1
          );
          setTrendingIdeas(trending);
        }
      } catch (error) {
        console.error("Error fetching trending ideas:", error);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="w-full relative py-5 md:py-10 min-h-screen bg-bg">
      <TrendingHeader ideas={trendingIdeas} />

      <IdeasFilter
        query={query}
        setQuery={setQuery}
        selected={selected}
        setSelected={setSelected}
        categories={categories}
      />

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading ideas...</p>
      ) : (
        <IdeaGrid ideas={ideas} />
      )}
      {profile?.role === "user" && (
      <Link 
        href="/submit-idea"
        className="fixed bottom-5 right-5 md:hidden px-5 py-5 bg-text-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        
      >
        <span className="text-3xl font-bold text-bg"><PenLine size={16} /></span>
      </Link>
      )}
      {profile?.role === "moderator" && (
      <Link 
        href="/submit-challenge"
        className="fixed bottom-5 right-5 md:hidden px-5 py-5 bg-text-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        
      >
        <span className="text-3xl font-bold text-bg"><PenLine size={16} /></span>
      </Link>
      )}

    </div>
  );
}

export default withAuth(TrendingIdeas, { requireAuth: false });
