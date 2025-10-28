"use client";

import React, { useState } from "react";
import { toast } from "sonner";

interface AddCommentProps {
  author: Author;       // the user who is posting
  ideaId: string; 
  totalComments: number;
}

interface Author {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

const AddComment: React.FC<AddCommentProps> = ({ author, ideaId, totalComments }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/comments/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: ideaId,
          author: author.id,
          content: text.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      setText(""); // clear textarea
      toast.success("Comment posted!");

      console.log("Comment posted!", data);
      // optionally update parent state to show new comment
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-text-primary font-semibold text-xl md:text-2xl mt-6 mb-3">
        Comments ({totalComments})
      </h1>

      <div className="w-full mb-4 rounded-lg py-3 md:py-4 flex bg-bg-dark border border-border-secondary">
        {/* Avatar */}
        <div className="w-14 md:w-18 flex items-start justify-center">
          <div className="bg-border-secondary h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full">
            <p className="text-[9px] md:text-[10px] text-white font-semibold">
              You
            </p>
          </div>
        </div>

        {/* Input + Button */}
        <div className="flex-1 px-2 md:px-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this idea..."
            className="w-full mb-2 text-white rounded placeholder:text-text-secondary h-16 md:h-20 p-2 md:p-2 placeholder:text-xs md:placeholder:text-sm bg-bg border border-border-secondary resize-none"
          />
          {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
          <button
            onClick={handlePost}
            disabled={loading || !text.trim()}
            className="flex items-center gap-1 justify-center bg-btn-primary text-white py-1.5 md:py-2 px-3 md:px-4 rounded cursor-pointer hover:bg-btn-primary-hover transition-colors duration-400 text-xs md:text-sm disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddComment;
