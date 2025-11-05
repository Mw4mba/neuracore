"use client";
import {
  Bookmark,
  CircleAlert,
  Heart,
  HeartIcon,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkCommunityFavorite } from "@/lib/achievements/communityFavorite";
import { checkInfluencerAchievement } from "@/lib/achievements/influencer";
import Image from "next/image";

interface IdeaActionProps {
  ideaId?: string;
  onLike?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
  currentUserId?: string;
  authorId?: string;
  authorEmail?: string;
  isSaved?: boolean;
  likes: number;
  isShared?: boolean;
}

const IdeaAction: React.FC<IdeaActionProps> = ({
  ideaId,
  onLike,
  currentUserId,
  authorId,
  authorEmail,
  onSave,
  likes,
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
  const [showTeamsPopup, setShowTeamsPopup] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

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

      // Community Favorite achievement
      if (likes + 1 > 10) {
        await checkCommunityFavorite(authorId!);
      }

      // Influencer achievement
      await checkInfluencerAchievement(authorId!);
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

  // 📨 Request Collaboration Function
  const handleRequestCollab = async () => {
    if (!authorId || !currentUserId) {
      toast.error("You must be logged in to send a request.");
      return;
    }

    if (authorId === currentUserId) {
      toast.info("You can’t send a request to yourself.");
      return;
    }

    try {
      setSendingRequest(true);
      const res = await fetch("/api/message-requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: authorId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send request");

      toast.success("Collaboration request sent!");
    } catch (err: any) {
      console.error("Error sending message request:", err);
      toast.error(err.message || "Failed to send request.");
    } finally {
      setSendingRequest(false);
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
            className="flex w-full border-border-secondary hover:text-bg cursor-pointer border-1 text-[12px] items-center gap-2 py-2 px-3 rounded hover:bg-btn-secondary-hover transition"
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
              <>
                <button
                  onClick={() => setShowTeamsPopup(true)}
                  className="flex items-center gap-2 bg-[#464EB8] hover:bg-[#3C429E] text-white justify-center py-2  w-full rounded-md text-[12px] font-medium transition-all duration-200"
                >
                  <img
                    src="/icons/teams.png"
                    alt="Microsoft Teams"
                    className="w-4 h-4"
                  />
                  Request Collab
                </button>

                {/* Confirmation Popup */}
                {showTeamsPopup && (
                  <div className="fixed inset-0 backdrop-blur-2xl bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-bg rounded-lg shadow-lg p-6 w-[90%] md:w-[380px] text-center">
                      <div className="h-12 relative mx-auto w-12">
                        <Image
                            src="/icons/teams.png"
                            alt="Microsoft Teams"
                            className="text-black"
                            fill
                          />
                        </div>
                      <h2 className="text-lg font-semibold text-text-primary mb-2">
                        Open Microsoft Teams
                      </h2>
                      <p className="text-sm text-text-secondary mb-4">
                        You’re about to message this user on Microsoft Teams. Continue?
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() =>
                            window.open(
                              `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
                                authorEmail ? authorEmail : ""
                              )}`,
                              
                            )
                          }
                          className="bg-[#464EB8] hover:bg-[#3C429E] text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Open Teams
                        </button>
                        <button
                          onClick={() => setShowTeamsPopup(false)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
            <>
              <button
                onClick={() => setShowTeamsPopup(true)}
                className="flex items-center gap-2 bg-[#464EB8] cursor-pointer hover:bg-[#3C429E] text-white justify-center py-2.5 px-4 rounded-md text-[12px] font-medium transition-all duration-200"
              >
                <img
                  src="/icons/teams.png"
                  alt="Microsoft Teams"
                  className="w-4 h-4"
                />
                Request Collab
              </button>

              {/* Confirmation Popup */}
              {showTeamsPopup && (
                <div className="fixed inset-0 backdrop-blur-2xl bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-bg rounded-lg shadow-lg p-6 w-[90%] md:w-[380px] text-center">
                    <div className="h-12 relative mx-auto w-12">
                    <Image
                        src="/icons/teams.png"
                        alt="Microsoft Teams"
                        className="text-black"
                        fill
                      />
                    </div>
                    <h2 className="text-lg font-semibold mt-4 text-text-primary mb-2">
                      Open Microsoft Teams
                    </h2>
                    <p className="text-sm text-text-secondary mb-4">
                      You’re about to message this user on Microsoft Teams. Continue?
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() =>
                          window.open(
                            `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
                              authorEmail? authorEmail : ""
                            )}`,
                            
                          )
                        }
                        className="bg-[#464EB8] hover:bg-[#3C429E] cursor-pointer flex gap-1 items-center text-white px-4 py-2.5 rounded-md text-sm font-medium"
                      >
                        Open Teams
                        <img
                          src="/icons/teams.png"
                          alt="Microsoft Teams"
                          className="w-4 h-4"
                        />
                      </button>
                      <button
                        onClick={() => setShowTeamsPopup(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 cursor-pointer rounded-md text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
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