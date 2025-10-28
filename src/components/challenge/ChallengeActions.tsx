"use client";
import React, { useState } from "react";
import { Heart, HeartOff, UserCheck, UserPlus, Share2 } from "lucide-react";

interface ChallengeActionsProps {
  profile_role?: string;
}

const ChallengeActions: React.FC<ChallengeActionsProps> = ({
  profile_role
}) => {
  const [liked, setLiked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [shared, setShared] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4">
      {/* Join Button */}
      {profile_role === "user" && (
        <button
          onClick={() => setJoined(!joined)}
          className={`
            flex items-center justify-center gap-2 rounded-lg transition-all
            text-xs sm:text-sm cursor-pointer font-medium px-5 py-3 
            ${
              joined
                ? "bg-text-primary text-bg hover:bg-text-primary/30"
                : "bg-bg text-text-primary hover:bg-neutral-400 border-1 border-text-primary"
            }
          `}
        >
          {joined ? <UserCheck size={16} /> : <UserPlus size={16} />}
          {joined ? "Joined" : "Join Challenge"}
        </button>
        )}
      

      {/* Like Button */}
      <button
        onClick={() => setLiked(!liked)}
        className={`
          flex items-center justify-center gap-2 rounded-lg transition-all
          text-xs sm:text-sm cursor-pointer font-medium px-5 py-3 
          ${
            liked
              ? "bg-btn-primary text-white hover:bg-btn-primary-hover"
              : "bg-bg text-text-primary border border-btn-primary hover:bg-btn-primary-hover/10 hover:text-red-500"
          }
        `}
      >
        {liked ? <Heart fill="white" size={16} /> : <Heart size={16} />}
        {liked ? "Liked" : "Like"}
      </button>

      {/* Share Button */}
      <button
        onClick={() => setShared(!shared)}
        className={`
          flex items-center cursor-pointer justify-center gap-2 rounded-lg transition-all
          text-xs sm:text-sm font-medium px-5 py-3 border border-border-secondary
          ${
            shared
              ? "bg-btn-secondary text-text-primary"
              : "bg-bg text-text-primary hover:bg-btn-secondary-hover"
          }
        `}
      >
        <Share2 size={16} />
        {shared ? "Shared" : "Share Challenge"}
      </button>
    </div>
  );
};

export default ChallengeActions;
