"use client";
import React, { useEffect, useState } from "react";
import { Lightbulb, Trophy, Award, ArrowUp, MessageCircle, ThumbsUp } from "lucide-react";
import Link from "next/link";

interface Idea {
  id: string;
  title: string;
  category: string;
  summary: string;
  likes: number;
  comments_count: number;
}

interface Challenge {
  id: number;
  title: string;
  status: string;
  prize: string;
}

interface UserTabsProps {
  userIdeas: Idea[];
  userChallenges: Challenge[];
}

const UserTabs: React.FC<UserTabsProps> = ({ userIdeas, userChallenges }) => {
  const [activeTab, setActiveTab] = useState<"ideas" | "challenges">("ideas");
  const [totalComments, setTotalComments] = useState<number>(0);
  useEffect(() => {
  const fetchCommentsCounts = async () => {
    try {
      let total = 0;

      await Promise.all(
        userIdeas.map(async (idea) => {
          try {
            const res = await fetch(`/api/comments/${idea.id}`);
            if (!res.ok) throw new Error("Failed to fetch comments");
            const data = await res.json();
            const commentsCount = Array.isArray(data) ? data.length : data.comments?.length || 0;
            total += commentsCount;
          } catch (err) {
            console.error(`Failed to fetch comments for idea ${idea.id}:`, err);
          }
        })
      );

      setTotalComments(total);
    } catch (err) {
      console.error("Failed to calculate total comments:", err);
    }
  };

  if (userIdeas.length > 0) fetchCommentsCounts();
}, [userIdeas]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border rounded bg-bg-dark py-1 px-2 border-border-secondary">
        <button
          onClick={() => setActiveTab("ideas")}
          className={`flex items-center cursor-pointer gap-2 transition ${
            activeTab === "ideas"
              ? " bg-bg py-1 px-2 rounded text-text-primary"
              : " text-text-secondary px-2 py-1 rounded hover:bg-bg-gray hover:text-text-secondary"
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          Ideas
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`flex items-center gap-2 cursor-pointer  transition ${
            activeTab === "challenges"
              ? " bg-bg py-1 px-2 rounded  text-text-primary"
              : " text-text-secondary px-2 py-1 hover:bg-bg-gray px-py-1 rounded hover:text-text-secondary"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Challenges
        </button>
      </div>

      {/* Ideas */}
      {activeTab === "ideas" && (
        <div className="space-y-4 animate-fadeIn">
          {userIdeas.map((idea) => (
            <div
              key={idea.id}
              className="rounded border border-border-secondary bg-bg-dark p-6 hover:border-border-primary duration-300 transition"
            >
              <Link href={`/idea/${idea.id}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{idea.title}</h3>
                <span className="text-xs px-2 py-1 bg-bg-gray rounded-md text-text-primary">
                  {idea.category}
                </span>
              </div>
              <p className="text-sm text-text-secondary">{idea.summary}</p>
              <div className="flex gap-4 text-xs mt-2 text-text-secondary">
                <span className="flex gap-1 items-center">
                  <ThumbsUp size={15} /> {idea.likes || 0} likes
                </span>
                <span className="flex gap-1 items-center">
                  <MessageCircle size={15} /> {totalComments || 0} comments
                </span>
              </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Challenges */}
      {activeTab === "challenges" && (
        <div className="space-y-4 animate-fadeIn">
          {userChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="rounded border border-border-secondary bg-bg-dark p-6 hover:border-border-primary transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl text-text-primary font-semibold">{challenge.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    challenge.status === "Winner"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {challenge.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Award className="h-4 w-4 text-brand-red" />
                <span>Prize: {challenge.prize}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTabs;
