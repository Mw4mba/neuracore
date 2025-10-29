"use client";

import React, { useEffect, useState } from "react";
import AboutAuthor from "@/components/Idea/AboutAuthor";
import AddComment from "@/components/Idea/AddComment";
import IdeaAction from "@/components/Idea/IdeaAction";
import IdeaComments from "@/components/Idea/IdeaComments";
import IdeaDetails from "@/components/Idea/IdeaDetails";
import IdeaHeader from "@/components/Idea/IdeaHeader";
import IdeaStats from "@/components/Idea/IdeaStats";
import IdeaTags from "@/components/Idea/IdeaTags";
import RelatedIdeas from "@/components/Idea/RelatedIdeas";
import { useSession } from "@/hooks/useSession";
import { withAuth } from "@/components/withAuth";
import { useParams } from "next/navigation";
import AboutAuthorLoader from "@/components/loaders/AboutAuthorLoader";

interface Author {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  role: string;
}

interface IdeaType {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  cover_img?: string;
  created_at: string;
  likes?: number;
  comments?: number;
  view_count?: number;
  author: { id: string };
  trending?: boolean;
  tags?: string[];
}

interface CommentType {
  id: string;
  initials: string;
  author: string;
  authorId: string;
  timeAgo: string;
  content: string;
  likes: number;
}

function Idea() {
  const { user } = useSession(false);
  const params = useParams(); 

  const ideaId = Array.isArray(params.id) ? params.id[0] : params.id;


  const [idea, setIdea] = useState<IdeaType | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [author, setAuthor] = useState<Author | null>(null);
  
  // Fetch idea
  useEffect(() => {
    if (!ideaId) return;

    const fetchIdea = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ideas/${ideaId}`);
        if (!res.ok) throw new Error("Failed to fetch idea");
        const data = await res.json();
        setIdea(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [ideaId]);

  //increment view count
  useEffect(() => {
  if (!ideaId) return;

  const incrementViews = async () => {
    try {
      const res = await fetch(`/api/ideas/${ideaId}/view`, {
        method: "POST",
      });

      if (!res.ok) {
        console.error("Failed to increment view count", res.statusText);
        return;
      }

      const data = await res.json();

      // Update the idea state with the new view_count
      setIdea((prev) => (prev ? { ...prev, view_count: data.view_count } : prev));
    } catch (err) {
      console.error("Error incrementing view count:", err);
    }
  };

  incrementViews();
}, [ideaId]);


  //fetch comments
  useEffect(() => {
    if (!ideaId) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments/${ideaId}`);
        const data = await res.json();
        const commentsArray = Array.isArray(data) ? data : data.comments || [];
        
        // Map to your Comment interface
        const formatted = commentsArray.map((c: any) => ({
          id: c.id,
          authorId: c.author?.id,
          initials: c.author?.username[0].toUpperCase() || "U",
          author: c.author?.full_name || "Unknown",
          timeAgo: new Date(c.created_at).toLocaleString(),
          content: c.content, 
          likes: c.likes || 0,
        }));
        setComments(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [ideaId]);

  //fetch author
  useEffect(() => {
    if (!idea?.author?.id) return;

    const fetchAuthor = async () => {
      try {
        const res = await fetch(`/api/profile/${idea.author.id}`);
        if (!res.ok) throw new Error("Failed to fetch author");
        const data = await res.json();
        setAuthor(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAuthor();
  }, [idea]);

  if (loading) return <p className="text-center py-20">Loading idea...</p>;
  if (!idea) return <p className="text-center py-20">Idea not found.</p>;

  return (
    <div className="w-full px-[4vw] md:px-[10vw] pb-8 min-h-screen bg-bg">
      <IdeaHeader
        coverImageUrl={idea.cover_img || ""}
        categories={[idea.category]}
        title={idea.title}
        description={idea.summary}
        link="/trending-ideas"
      />

      <IdeaStats
        views={idea.view_count || 0}
        likes={idea?.likes || 0}
        comments={comments.length || 0}
        timeAgo={idea.created_at}
      />

      <IdeaAction
        ideaId={ideaId}
        currentUserId={user?.id}
        likes={idea.likes || 0}
        authorId={idea.author.id}
        onLike={() => console.log("Liked!")}
        onSave={() => console.log("Saved!")}
        onShare={() => console.log("Shared!")}
        isLiked={false}
        isSaved={false}
        isShared={false}
      />

      <IdeaDetails description={idea.content} />

      <IdeaTags tags={idea.tags || []} />

      {ideaId && author && (
        <AddComment ideaId={ideaId} author={author} totalComments={comments.length} />
      )}
      <IdeaComments currentUserId={user?.id} comments={comments} />

      {author ? (
        <AboutAuthor
          id={author.id}
          name={author.full_name}
          initials={author.username[0].toUpperCase()}
          role={author.role}
          avatar_url={author.avatar_url}
          accountType="Innovator"
          bio={author.bio || "No bio available."}
        />
      ) : (
        <AboutAuthorLoader />
      )}

      <RelatedIdeas ideas={[]} />
    </div>
  );
}

export default withAuth(Idea, { requireAuth: false });
