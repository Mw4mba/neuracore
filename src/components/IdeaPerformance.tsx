"use client";

import React, { useEffect, useState } from "react";
import { Eye, Heart, MessageSquare } from "lucide-react";

interface Idea {
  id: string;
  title: string;
  category?: string;
  view_count?: number | string;
  likes?: string[] | number;
  rating?: number | string;
  created_at: string;
}

interface IdeaPerformanceProps {
  idea: Idea;
}

const IdeaPerformance: React.FC<IdeaPerformanceProps> = ({ idea }) => {
  const [commentsCount, setCommentsCount] = useState<number>(0);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments/${idea.id}`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        const count = Array.isArray(data)
          ? data.length
          : data.comments?.length || 0;
        setCommentsCount(count);
      } catch (err) {
        console.error(`Failed to fetch comments for idea ${idea.id}:`, err);
        setCommentsCount(0);
      }
    };

    fetchComments();
  }, [idea.id]);

  const likesCount =
    Array.isArray(idea.likes) ? idea.likes.length : idea.likes || 0;

  return (
    <div className="bg-[var(--color-bg-dark)] p-6 rounded-lg border border-[var(--color-border-secondary)] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[var(--color-text-primary)] font-semibold">{idea.title}</h3>
        <span className="text-white text-xs font-medium px-2.5 py-1 rounded-full bg-gray-600">
          {idea.category || "general"}
        </span>
      </div>
      <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Eye size={16} /> {idea.view_count || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart size={16} /> {likesCount}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare size={16} /> {commentsCount}
          </span>
          <span>Rating: {idea.rating ? `${idea.rating}/5` : "N/A"}</span>
        </div>
        <span>{new Date(idea.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default IdeaPerformance;
