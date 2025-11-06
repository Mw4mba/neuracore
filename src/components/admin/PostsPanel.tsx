"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  created_at: string;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
  comments: {
    count: number;
  };
}

export default function PostsPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/ideas/all");
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="text-text-secondary">Loading posts...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      <div className="grid gap-4">
        {posts.length === 0 ? (
          <p className="text-text-secondary">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-bg p-4 shadow rounded-xl border border-border-secondary"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                {post.author?.avatar_url ? (
                  <div className="h-10 w-10 rounded-full object-cover border">
                    <Image
                      src={post.author.avatar_url}
                      alt={post.author.username}   
                      fill
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                    {post.author
                      ? post.author.username
                          .split("")
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "UN"}
                  </div>
                )}
                <span className="font-medium text-[var(--color-text-primary)]">
                  {post.author?.username || "Unknown"}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
              <p className="text-text-secondary text-sm mb-2">{post.description}</p>

              {/* Category & Tags */}
              <div className="flex flex-wrap gap-2 mb-2 text-xs text-text-secondary">
                <span className="px-2 py-1 bg-bg-dark rounded-md border border-border-secondary">
                  Category: {post.category || "Uncategorized"}
                </span>
                {post.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-bg-dark rounded-md border border-border-secondary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>
                  Comments: {post.comments?.count || 0}
                </span>
                <span>
                  Created:{" "}
                  {new Date(post.created_at).toLocaleDateString("en-ZA", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
