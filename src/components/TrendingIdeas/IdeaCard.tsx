"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Heart, MessageSquare, Star, TrendingUp } from "lucide-react";
import IdeaCardLoader from "../loaders/IdeaCardLoader";
import Image from "next/image";

interface Author {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

interface Idea {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: { id: string };
  created_at: string;
  likes?: number;
  view_count?: number;
  rating?: string;
  cover_img?: string;
  trending?: boolean;
}

const IdeaCard: React.FC<{ idea: Idea }> = ({ idea }) => {
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idea.author?.id) return;

    const fetchAuthor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/profile/${idea.author.id}`);
        if (!res.ok) throw new Error("Failed to fetch author");
        const data = await res.json();
        setAuthor(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [idea.author?.id]);

  const [totalComments, setTotalComments] = useState<number>(0);

useEffect(() => {
  const fetchCommentsCount = async () => {
    try {
      const res = await fetch(`/api/comments/${idea.id}`);
      const data = await res.json();

      // Supabase API returns { comments: [...] }
      const commentsArray = data.comments || [];
      setTotalComments(commentsArray.length);
    } catch (err) {
      console.error("Failed to fetch comments count:", err);
    }
  };

  fetchCommentsCount();
}, [idea.id]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
    return `${Math.floor(seconds / 31536000)}y ago`;
  };

  if (loading) {
    return (
      <IdeaCardLoader />
    );
  }

  return (
    <Link
      href={`/idea/${idea.id}`}
      className="rounded-lg border hover:border-border-secondary hover:shadow-lg border-bg shadow transform-all duration-300 bg-bg-dark overflow-hidden"
    >
      <div className="bg-bg-dark-gray relative flex justify-center items-center text-text-primary font-semibold text-sm h-40 sm:h-44 w-full">
        {idea.cover_img ? (
          <Image
            src={idea.cover_img}
            fill
            className="w-full h-full object-cover"
            alt="cover-img"
          />
        ) : (
          <Image
            src="./placeholder.svg"
            fill
            className="w-full h-full object-cover"
            alt="cover-img"
          />
        )}

        {idea.trending && (
          <div className="bg-btn-primary left-1 text-white top-2 rounded-full gap-1 font-semibold text-[10px] p-1 absolute flex">
            <TrendingUp size={12} className="m-auto" />
            <p>Trending</p>
          </div>
        )}

        {idea.rating && (
          <div className="right-1 bg-black/40 top-2 rounded gap-1 text-white font-semibold text-[10px] sm:text-xs p-1 absolute flex">
            <Star size={12} className="text-yellow-400 fill-current" />
            <p>{idea.rating}</p>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 mb-4 py-2">
        <div className="bg-text-secondary/40 text-xs md:my-3 my-1 rounded-full w-fit font-semibold text-white px-2 py-1">
          <p>{idea.category}</p>
        </div>

        <h1 className="text-text-primary text-sm sm:text-base md:text-xl font-semibold">
          {idea.title}
        </h1>
        <p className="text-text-secondary text-[10px] sm:text-xs md:text-sm mt-2">
          {idea.summary}
        </p>

        <div className="text-text-secondary text-xs flex justify-between mt-2 mb-2 md:my-2">
          <p className="hover:text-text-primary cursor-pointer flex items-center gap-2">
            {author?.avatar_url && (
              <img
                src={author.avatar_url}
                alt="author-avatar"
                className="w-5 h-5 rounded-full"
              />
            )}
            <span>by {author?.full_name || author?.username}</span>
          </p>
          <p>{getTimeAgo(idea.created_at)}</p>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <div className="flex cursor-pointer items-center gap-1 text-text-primary text-[12px]">
            <Eye size={12} />
            <p>{idea.view_count || 0}</p>
          </div>
          <div className="flex cursor-pointer items-center gap-1 text-text-primary text-[12px]">
            <Heart size={12} />
            <p>{idea?.likes || 0}</p>
          </div>
          <div className="flex cursor-pointer items-center gap-1 text-text-primary text-[12px]">
            <MessageSquare size={12} />
            <p>{totalComments || 0}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IdeaCard;
