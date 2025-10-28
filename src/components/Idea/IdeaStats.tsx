import { Eye, Heart, MessageCircle } from "lucide-react";
import React from "react";

type IdeaStatsProps = {
  views: number;
  likes: number;
  comments: number;
  timeAgo: string;
};

const IdeaStats: React.FC<IdeaStatsProps> = ({
  views,
  likes,
  comments,
  timeAgo,
}) => {

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`; // minutes
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; // hours
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`; // days
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`; // weeks
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`; // months
    return `${Math.floor(seconds / 31536000)}y ago`; // years
  };
  return (
    <div className="flex mt-2 mb-3 gap-6 md:gap-3">
      {/* Views */}
      <div className="md:flex-row flex justify-center flex-col gap-1 text-[10px] md:text-xs text-text-secondary items-center">
        <Eye size={14} />
        <p>{views} views</p>
      </div>

      {/* Likes */}
      <div className="md:flex-row flex justify-center flex-col gap-1 text-[10px] md:text-xs text-text-secondary items-center">
        <Heart size={14} />
        <p>{likes} likes</p>
      </div>

      {/* Comments */}
      <div className="md:flex-row flex justify-center flex-col gap-1 text-[10px] md:text-xs text-text-secondary items-center">
        <MessageCircle size={14} />
        <p>{comments} comments</p>
      </div>

      {/* Time Ago */}
      <div className="flex gap-1 text-[10px] md:text-xs text-text-secondary items-center">
        <p>{getTimeAgo(timeAgo)}</p>
      </div>
    </div>
  );
};

export default IdeaStats;
