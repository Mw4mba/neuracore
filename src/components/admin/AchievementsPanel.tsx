"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { Trophy, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function AchievementsPanel() {
  const supabase = createClient();

  const [achievements, setAchievements] = useState<any[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon_url: "",
    points: 0,
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usersByAchievement, setUsersByAchievement] = useState<{ [key: string]: any[] }>({});
  const [loadingUsers, setLoadingUsers] = useState<{ [key: string]: boolean }>({});

  // Fetch all achievements
  const fetchAchievements = async () => {
    setLoadingAchievements(true);
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load achievements.");
    } else {
      setAchievements(data || []);
    }
    setLoadingAchievements(false);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  // Create new achievement
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/achievements/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Achievement created successfully!");
        setForm({ name: "", description: "", icon_url: "", points: 0 });
        fetchAchievements();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Error creating achievement.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while creating the achievement.");
    }
  };

  // Toggle expanded view for a specific achievement
  const toggleExpanded = async (achievementId: string) => {
    if (expandedId === achievementId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(achievementId);

    if (!usersByAchievement[achievementId]) {
      setLoadingUsers((prev) => ({ ...prev, [achievementId]: true }));
      try {
        const res = await fetch(`/api/achievements/users-by-achievement?achievementId=${achievementId}`);
        const data = await res.json();
        if (res.ok) {
          setUsersByAchievement((prev) => ({
            ...prev,
            [achievementId]: data.users || [],
          }));
        } else {
          toast.error(data.error || "Failed to fetch users.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching users.");
      } finally {
        setLoadingUsers((prev) => ({ ...prev, [achievementId]: false }));
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Trophy className="text-brand-red" size={22} />
          Achievements
        </h2>
      </div>

      {/* Create Achievement */}
      <div className="bg-bg border border-border-secondary rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b border-border-secondary pb-3">
          <Plus className="text-brand-red" size={18} />
          Create New Achievement
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-500">Name</label>
              <input
                className="border border-border-secondary rounded-md bg-bg/40 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red/60 transition"
                placeholder="Achievement name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-500">Icon URL (optional)</label>
              <input
                className="border border-border-secondary rounded-md bg-bg/40 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red/60 transition"
                placeholder="https://example.com/icon.png"
                value={form.icon_url}
                onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-500">Points</label>
              <input
                type="number"
                className="border border-border-secondary rounded-md bg-bg/40 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red/60 transition"
                placeholder="0"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
              />
            </div>

            <div className="flex flex-col space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Description</label>
              <textarea
                className="border border-border-secondary rounded-md bg-bg/40 p-2.5 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/60 transition"
                placeholder="Describe the achievement..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border-secondary mt-4">
            <button
              type="submit"
              disabled={loadingAchievements}
              className={`flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-md hover:bg-btn-primary-hover transition-all duration-300 ${
                loadingAchievements ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <Plus size={16} />
              {loadingAchievements ? "Creating..." : "Create Achievement"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Achievements */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-2 text-text-primary">Existing Achievements</h3>

        {loadingAchievements ? (
          <p className="text-gray-500 text-sm italic">Loading achievements...</p>
        ) : achievements.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No achievements created yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="bg-bg border border-border-secondary rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className="flex items-start gap-4 cursor-pointer"
                  onClick={() => toggleExpanded(a.id)}
                >
                  {a.icon_url ? (
                    <img src={a.icon_url} alt={a.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-brand-red/10 flex items-center justify-center">
                      <Trophy className="text-brand-red" size={22} />
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary">{a.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{a.description}</p>
                    {a.points > 0 && (
                      <p className="text-xs mt-2 text-gray-500 font-medium">{a.points} points</p>
                    )}
                  </div>

                  {expandedId === a.id ? <ChevronUp /> : <ChevronDown />}
                </div>

                {/* Users per achievement */}
                {expandedId === a.id && (
                  <div className="mt-3 border-t border-border-secondary pt-2 max-h-60 overflow-y-auto">
                    {loadingUsers[a.id] ? (
                      <p className="text-text-secondary text-sm">Loading users...</p>
                    ) : usersByAchievement[a.id]?.length ? (
                      <ul className="divide-y divide-border-secondary">
                        {usersByAchievement[a.id].map((user) => (
                          <li key={user.id} className="py-2 flex justify-between text-sm">
                            <span>{user.full_name || user.username}</span>
                            <span className="text-text-secondary">
                              {new Date(user.unlocked_at).toLocaleDateString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-text-secondary text-sm">No users have unlocked this achievement yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
