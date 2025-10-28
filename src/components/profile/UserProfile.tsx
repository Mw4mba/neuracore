"use client";
import React, { useEffect, useState } from "react";
import { Edit, MapPin, Link as LinkIcon, CalendarDays } from "lucide-react";
import { User } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface StatItemProps {
  value: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
  <div className="text-center flex-1 min-w-[60px]">
    <p className="text-sm md:text-lg font-bold text-text-primary">{value}</p>
    <p className="text-xs text-text-secondary">{label}</p>
  </div>
);

interface Profile {
  name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  created_at?: string;
}

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "UN";

  const [isEditing, setIsEditing] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: user.email || "",
    bio: "Passionate about creating innovative solutions.",
    location: "",
    website: "",
    created_at: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingFetch(true);
        const res = await fetch("/api/profile/get");
        const data = await res.json();

        if (res.ok) {
          setProfile({
            name: data.full_name || "",
            email: data.username || user.email || "",
            bio: data.bio || "No bio yet.",
            location: "",
            website: "",
            created_at: data.created_at || "",
          });
        } else {
          console.error(data.error || "Failed to fetch profile");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchProfile();
  }, [user.email]);

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const handleSave = async () => {
    try {
      setLoadingSave(true);

      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profile.name,
          bio: profile.bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="w-full flex justify-center items-center py-20 text-text-secondary">
        Loading profile...
      </div>
    );
  }

  return (
    <>
      {/* Profile Header */}
      <div className="bg-bg-dark p-6 sm:p-8 rounded-lg border border-border-secondary w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 w-full">
          {/* Avatar */}
          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-800 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
            {initials}
          </div>

          {/* User Info */}
          <div className="flex-grow w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-4 w-full">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {profile.name || "Anonymous User"}
                </h2>
                <p className="text-text-secondary text-sm sm:text-base">
                  {profile.email}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex cursor-pointer bg-bg-gray items-center gap-2 text-sm hover:text-text-secondary border border-border-secondary px-3 sm:px-4 py-2 rounded-lg hover:bg-bg-dark-gray text-text-primary transition-colors"
              >
                <Edit size={16} />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-between my-4 gap-4 w-full">
              <StatItem value="12" label="Ideas" />
              <StatItem value="45.3K" label="Views" />
              <StatItem value="3.4K" label="Likes" />
              <StatItem value="1.3K" label="Followers" />
              <StatItem value="342" label="Following" />
            </div>

            {/* Info */}
            <div className="flex flex-wrap justify-start gap-4 sm:gap-6 mt-4 text-sm text-text-secondary w-full">
              <span className="flex items-center gap-2">
                <MapPin size={16} /> {profile.location || "Unknown"}
              </span>
              <span className="flex items-center gap-2">
                <LinkIcon size={16} /> {profile.website || "No website"}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays size={16} /> Joined{" "}
                {formatJoinDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {!isEditing && (
        <div className="mt-8 bg-bg p-8 rounded-lg border border-border-secondary">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            About
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-bg-dark border mt-8 border-border-secondary rounded-lg p-6 w-full mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Edit Profile
            </h2>
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full p-2 border border-border-secondary rounded-md bg-bg-gray text-text-primary focus:outline-none focus:ring-2 focus:ring-btn-primary"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                rows={4}
                className="w-full p-2 border border-border-secondary rounded-md bg-bg-gray text-text-primary focus:outline-none focus:ring-2 focus:ring-btn-primary"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={handleSave}
                disabled={loadingSave}
                className="px-4 py-2 bg-btn-primary text-white rounded-md hover:bg-btn-primary-hover transition-colors disabled:opacity-60"
              >
                {loadingSave ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-border-secondary rounded-md text-text-primary hover:bg-bg-gray transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
