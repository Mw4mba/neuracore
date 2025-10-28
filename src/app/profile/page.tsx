"use client";

import React, { useState, useEffect } from "react";
import UserProfile from "@/components/profile/UserProfile";
import UserAchievements from "@/components/profile/UserAchievements";
import Notifications from "@/components/profile/Notifications";
import AccountSettings from "@/components/profile/AccountSettings";
import { withAuth } from "@/components/withAuth";
import { useSession } from "@/hooks/useSession";
import { useSearchParams } from "next/navigation";

function UserProfilePage({ params }: { params: { id: string } }) {
  const { user, loading, error } = useSession();
  const searchParams = useSearchParams();

  // Read tab from URL query param, fallback to "Profile"
  const defaultTab = (searchParams.get("tab") as
    | "Profile"
    | "Achievements"
    | "Notifications"
    | "Settings") || "Profile";

  const [activeTab, setActiveTab] = useState<
    "Profile" | "Achievements" | "Notifications" | "Settings"
  >(defaultTab);

  // Update tab if query param changes
  useEffect(() => {
    const tab = (searchParams.get("tab") as
      | "Profile"
      | "Achievements"
      | "Notifications"
      | "Settings") || "Profile";
    setActiveTab(tab);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-red-500">Error loading profile: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-white">Please sign in to view your profile</div>
      </div>
    );
  }

  const tabs = ["Profile", "Achievements", "Notifications", "Settings"];

  return (
    <main className="py-8 px-[4vw] md:px-[10vw] bg-bg text-white">
      {/* Tab Navigation */}
      <div className="bg-bg-dark p-2 rounded-lg border border-border-secondary sticky top-4 z-10 w-full">
        <nav className="flex w-full md:justify-around overflow-x-auto md:overflow-x-visible whitespace-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`
                inline-block text-center cursor-pointer py-2.5 px-6 rounded-md text-sm font-medium transition-colors duration-300 flex-shrink-0 w-full md:w-[22%]
                ${activeTab === tab
                  ? "bg-bg font-semibold text-text-primary"
                  : "text-text-secondary hover:bg-bg-gray hover:text-text-primary"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Conditional Content */}
      <div className="mt-8">
        {activeTab === "Profile" && <UserProfile user={user} />}
        {activeTab === "Achievements" && <UserAchievements />}
        {activeTab === "Notifications" && <Notifications />}
        {activeTab === "Settings" && <AccountSettings />}
      </div>
    </main>
  );
}

export default withAuth(UserProfilePage);