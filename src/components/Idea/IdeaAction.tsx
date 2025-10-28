"use client";
import { Bookmark, CircleAlert, Heart, HeartIcon, MessageCircle, MoreHorizontal, Share2, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface IdeaActionProps {
  ideaId?: string;
  onLike?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
  currentUserId?: string;
  authorId?: string;
  isSaved?: boolean;
  isShared?: boolean;
}

const IdeaAction: React.FC<IdeaActionProps> = ({
  ideaId,
  onLike,
  currentUserId,
  authorId,
  onSave,
  onShare,
  isLiked = false,
  isSaved = false,
  isShared = false,
}) => {
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [shared, setShared] = useState(isShared);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!ideaId) return;

    const fetchLiked = async () => {
      try {
        const res = await fetch(`/api/ideas/${ideaId}/liked`);
        const data = await res.json();
        setLiked(data.liked);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLiked();
  }, [ideaId]);

  const toggleLike = async () => {
    if (!ideaId) return;
    try {
      const res = await fetch(`/api/ideas/${ideaId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle like");
      setLiked(!liked);
      toast.success(liked ? "Unliked!" : "Liked!");
      if (onLike) onLike();
    } catch (err: any) {
      console.error(err.message);
      toast.error("Failed to toggle like.");
    }
  };

  const handleDelete = async () => {
    if (!ideaId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ideas/delete?id=${ideaId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete idea");

      setShowDeleteModal(false);
      toast.success("Idea deleted successfully!");
      router.push("/trending-ideas");
    } catch (err: any) {
      console.error(err.message);
      toast.error("Failed to delete idea.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 justify-center py-1.5 px-3 rounded cursor-pointer transition-colors duration-400 text-[12px] ${
              liked
                ? "bg-btn-primary text-white"
                : "border bg-border-primary border-brand-red text-white hover:bg-btn-primary-hover"
            }`}
          >
            {liked ? <Heart fill="white" size={14} className="text-white" /> : <HeartIcon size={14} />}
            {liked ? "Liked" : "Like"}
          </button>

          <button
            onClick={() => {
              setShared(!shared);
              toast.success(shared ? "Unshared!" : "Shared!");
              if (onShare) onShare();
              setShowMore(false);
            }}
            className="flex w-full border-border-secondary cursor-pointer border-1 text-[12px] items-center gap-2 py-2 px-3 rounded hover:bg-btn-secondary-hover transition"
          >
            <Share2 size={14} /> Share
          </button>

          <button
            onClick={() => {
              setSaved(!saved);
              toast.success(saved ? "Removed from saved!" : "Saved!");
              if (onSave) onSave();
            }}
            className={`md:flex hidden items-center gap-1 justify-center py-2 px-4 rounded cursor-pointer transition-colors duration-300 text-[12px] ${
              saved
                ? "bg-btn-secondary text-white"
                : "bg-transparent border border-border-secondary text-text-primary hover:text-white hover:bg-btn-secondary-hover"
            }`}
          >
            <Bookmark size={14} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        <div className="relative md:hidden">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 bg-bg-dark border border-border-secondary text-text-primary justify-center py-1.5 px-3 rounded cursor-pointer text-[12px]"
          >
            <MoreHorizontal size={14} />
          </button>

          {showMore && (
            <div className="absolute right-0 mt-2 bg-bg-dark border border-border-secondary rounded shadow-md text-sm w-42 p-2 z-30">
              <button
                onClick={() => {
                  setSaved(!saved);
                  toast.success(saved ? "Removed from saved!" : "Saved!");
                  if (onSave) onSave();
                  setShowMore(false);
                }}
                className="flex w-full items-center gap-2 py-2 px-3 rounded hover:bg-bg-light transition"
              >
                <Bookmark size={14} /> {saved ? "Saved" : "Save"}
              </button>

              {authorId !== currentUserId && (
                <button className="flex w-full items-center gap-2 py-2 px-3 rounded hover:bg-bg-light transition">
                  <MessageCircle size={14} /> Request Collab
                </button>
              )}

              {authorId === currentUserId && (
                <button
                  onClick={() => {
                    setShowMore(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex w-full items-center gap-2 py-2 px-3 text-red-500 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          )}
        </div>

        <div className="hidden md:flex gap-2">
          {authorId !== currentUserId && (
            <button className="flex items-center gap-1 bg-text-primary text-bg justify-center py-2 px-4 rounded cursor-pointer text-[12px]">
              <MessageCircle size={14} />
              Request Collab
            </button>
          )}
          {authorId === currentUserId && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1 bg-red-700 text-white justify-center py-2 px-4 rounded cursor-pointer text-[12px]"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative md:mx-0 mx-3 bg-bg p-6 rounded-xl shadow-lg z-10 max-w-sm w-full text-center">
            <CircleAlert size={40} className=" mx-auto mb-3 text-red-500" />
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to delete this idea? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2  bg-transparent cursor-pointer hover:text-bg rounded border text-sm border-text-primary text-text-primary hover:bg-text-primary transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-500 text-sm cursor-pointer text-white hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IdeaAction;
