"use client";
import React, { useState, useEffect } from "react";
import { MapPin, Link as LinkIcon, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";
import ProfileCardLoader from "../loaders/ProfileCardLoader";

interface User {
  id: string;
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
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loading = !user;

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) return;

      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) return;
      setCurrentUserId(currentUser.id);

      const res = await fetch(
        `/api/follow/status?following_id=${user.id}`,
        { method: "GET" }
      );

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    };

    checkFollowStatus();
  }, [user]);

  if (loading) return <ProfileCardLoader />;

  const handleFollow = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/follow/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsFollowing(data.following);

      toast.success(
        data.following
          ? `You are now following ${user.full_name}`
          : `You unfollowed ${user.full_name}`
      );
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

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
      <p className="text-text-secondary mb-4">@{user?.username}</p>
      <p className="text-sm mb-4">{user?.bio || "No bio yet"}</p>

      <div className="space-y-2 text-sm text-text-secondary mb-6">
        {user?.location && (
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{user.location}</span>
          </div>
        )}
        {user?.website && (
          <div className="flex items-center justify-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <a
              href={`https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              {user.website}
            </a>
          </div>
        )}
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Joined {new Date(user.created_at).toLocaleString("default", { month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {currentUserId !== user.id && (
        <button
          onClick={handleFollow}
          disabled={isLoading}
          className={`w-full cursor-pointer py-2 rounded font-medium text-white transition ${
            isLoading
              ? "bg-btn-primary/70 cursor-not-allowed"
              : isFollowing
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-btn-primary hover:bg-btn-primary-hover"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Please wait...
            </span>
          ) : isFollowing ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      )}
    </div>
  );
};

export default ProfileCard;
