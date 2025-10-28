"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

export default function PostsPanel() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
      setPosts(data || []);
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      <div className="grid gap-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-bg p-4 shadow rounded-xl border">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-text-secondary text-sm">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
