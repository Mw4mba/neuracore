"use client";

import { ThumbsDownIcon, ThumbsUpIcon, MoreHorizontal, FlagIcon, Edit2, DeleteIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner"; // 🔹 import toast

interface Comment {
  id: string;
  initials: string;
  author: string;
  authorId: string;
  timeAgo: string;
  content: string;
  likes: number;
  isMine?: boolean;
}

interface IdeaCommentsProps {
  comments: Comment[];
  currentUserId?: string;
}

interface CommentWithLike extends Comment {
  likedByMe?: boolean;
}

const IdeaComments: React.FC<IdeaCommentsProps> = ({ comments, currentUserId }) => {
  const [commentList, setCommentList] = useState<CommentWithLike[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (commentId: string) => {
    setOpenMenuId(openMenuId === commentId ? null : commentId);
  };

  const handleLike = async (commentId: string) => {
    try {
      setCommentList((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        )
      );

      const res = await fetch(
        `/api/comments/toggle-like?comment_id=${commentId}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle like");

      if (typeof data.likes === "number") {
        setCommentList((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, likes: data.likes } : c
          )
        );
      }

      toast.success("Like updated!");
    } catch (err: any) {
      console.error("Failed to toggle like:", err);
      setCommentList((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c
        )
      );
      toast.error(err.message || "Failed to update like");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(
        `/api/comments/delete?comment_id=${commentId}&author_id=${currentUserId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete comment");

      setCommentList((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted!");
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      toast.error(err.message || "Failed to delete comment");
    }
  };

  // Sync new comments immediately
  useEffect(() => {
    setCommentList((prev) => {
      const existingIds = new Set(prev.map(c => c.id));
      const newComments = comments.filter(c => !existingIds.has(c.id));
      return [...prev, ...newComments];
    });
  }, [comments]);

  // Fetch liked status for all comments
  useEffect(() => {
    const fetchLiked = async () => {
      try {
        if (comments.length === 0) return;
        const ids = comments.map((c) => c.id).join(",");
        const res = await fetch(`/api/comments/liked?comment_ids=${ids}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch liked status");

        setCommentList((prev) =>
          prev.map((c) => ({
            ...c,
            likedByMe: data.liked[c.id] ?? false,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch liked status:", err);
      }
    };

    fetchLiked();
  }, [comments]);

  if (commentList.length === 0) {
    return (
      <p className="text-text-secondary text-center mt-6">
        No comments yet. Be the first to share your thoughts!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 mt-4">
      {commentList.map((comment) => (
        <div
          key={comment.id}
          className="relative w-full rounded-lg py-3 px-2 flex bg-bg-dark border border-border-secondary"
        >
          {/* More options button */}
          <div className="absolute top-2 right-3">
            <button
              onClick={() => toggleMenu(comment.id)}
              className="p-1 rounded-full cursor-pointer hover:bg-border-secondary transition-colors"
            >
              <MoreHorizontal size={16} className="text-text-secondary" />
            </button>

            {/* Popup menu */}
            {openMenuId === comment.id && (
              <div className="absolute right-0 mt-2 w-36 bg-bg-dark border border-border-secondary rounded-md shadow-md z-10">
                {comment.authorId === currentUserId ? (
                  <>
                    <button
                      className="flex gap-2 items-center w-full cursor-pointer text-left px-3 py-4 text-xs text-text-primary hover:bg-border-secondary"
                      onClick={() => alert("Edit functionality not implemented yet")}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      className="flex gap-2 items-center cursor-pointer w-full text-left px-3 py-4 text-xs text-red-500 hover:bg-border-secondary"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <DeleteIcon size={14} />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    className="flex gap-2 items-center cursor-pointer w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-border-secondary"
                    onClick={() => alert("Reported")}
                  >
                    <FlagIcon size={14} />
                    Report
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="w-14 md:w-18 flex items-start justify-center">
            <div className="bg-btn-primary-hover h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full">
              <p className="text-[9px] md:text-[10px] text-white font-semibold">
                {comment.initials}
              </p>
            </div>
          </div>

          <div className="flex-1 px-2 md:px-4">
            <div className="flex flex-col md:flex-row md:items-center gap-1">
              <h1 className="text-text-primary font-semibold text-sm md:text-base">
                {comment.author}
              </h1>
              <p className="text-text-secondary text-xs md:text-sm md:ml-4">
                {comment.timeAgo}
              </p>
            </div>

            <p className="text-text-secondary text-xs md:text-sm my-2">
              {comment.content}
            </p>

            <div className="flex mb-2 mt-4 gap-4 md:gap-6">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex gap-1 cursor-pointer items-center font-semibold text-[10px] md:text-xs transition-colors"
              >
                {comment.likedByMe ? (
                  <ThumbsUpIcon
                    size={14}
                    fill="true"
                    style={{ color: "white", fill: "white" }}
                  />
                ) : (
                  <ThumbsUpIcon size={14} />
                )}
                <p>{comment.likes}</p>
              </button>

              <div className="flex gap-1 items-center font-semibold text-text-secondary hover:text-text-primary text-[10px] md:text-xs">
                <ThumbsDownIcon size={14} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IdeaComments;
