"use client";

import AchievementsPanel from "@/components/admin/AchievementsPanel";
import ChallengesPanel from "@/components/admin/ChallengesPanel";
import PostsPanel from "@/components/admin/PostsPanel";
import Sidebar from "@/components/admin/Sidebar";
import UsersPanel from "@/components/admin/UsersPanel";
import React, { useState } from "react";


export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("users");

  return (
    <div className="flex h-screen bg-bg-dark">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="flex-1 overflow-y-auto p-8">
        {activeSection === "users" && <UsersPanel />}
        {activeSection === "posts" && <PostsPanel />}
        {activeSection === "achievements" && <AchievementsPanel />}
        {activeSection === "challenges" && <ChallengesPanel />}
      </main>
    </div>
  );
}
