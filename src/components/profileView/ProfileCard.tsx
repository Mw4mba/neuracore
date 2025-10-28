"use client";
import React from "react";
import { MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import ProfileCardLoader from "../loaders/ProfileCardLoader";

interface User {
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  location?: string;
  website?: string;
  created_at: string;
}

interface ProfileCardProps {
  user?: User;
  loading?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const loading = !user;
  if (loading) {
    return (
      <ProfileCardLoader />
    );
  }

  return (
    <div className="rounded border border-border-secondary bg-bg-dark p-6 text-center">
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.full_name}
          className="h-32 w-32 rounded-full border-4 border-text-primary/30 mx-auto mb-4 object-cover"
        />
      ) : (
        <div className="h-32 w-32 rounded-full border-2 border-text-primary/30 mx-auto mb-4 bg-bg flex items-center justify-center text-white text-4xl font-bold">
          {user?.full_name
            ? user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "UN"}
        </div>
      )}
      <h2 className="text-2xl font-bold">{user?.full_name}</h2>
      <p className="text-text-secondary mb-4">{user?.username}</p>
      <p className="text-sm mb-4">{user?.bio || "No bio yet"}</p>

      <div className="space-y-2 text-sm text-text-secondary mb-6">
        {user?.location && (
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{user?.location || "Unknown"}</span>
          </div>
        )}
        {user?.website && (
          <div className="flex items-center justify-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <a
              href={`https://${user.website}` || "no website yet"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              {user?.website || "No website"}
            </a>
          </div>
        )}
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Joined {formatJoinDate(user.created_at)}</span>
        </div>
      </div>

      <button className="w-full cursor-pointer py-2 rounded font-medium bg-btn-primary hover:bg-btn-primary-hover text-white hover:opacity-90 transition">
        Follow
      </button>
    </div>
  );
};

export default ProfileCard;
