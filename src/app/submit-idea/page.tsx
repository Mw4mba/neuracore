"use client";

import React, { useState, useEffect } from "react";
import { Star, UploadCloud } from "lucide-react";
import { withAuth } from "@/components/withAuth";
import { useSession } from "@/lib/auth/session-provider";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner";
import TagsInput from "@/components/Tags/TagsInput";
import TiptapEditor from "@/components/submitIdea/TiptapEditor";
import { grantAchievementOnce } from "@/lib/grantAchievementOnce";

const categories = ["General", "Tech", "Health", "Education", "Finance"];

interface User {
  id?: string;
  email: string;
  full_name: string | null;
}

function SubmitIdea() {
  const supabase = createClient();
  const { user } = useSession();

  const [ideaTitle, setIdeaTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState("General");
  const [coverImg, setCoverImg] = useState<File | null>(null);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const getFormState = () => ({
    title: ideaTitle,
    subtitle,
    content,
    tags,
    category,
    collaborators,
  });

  const restoreFormState = (state: any) => {
    setIdeaTitle(state.title);
    setSubtitle(state.subtitle);
    setContent(state.content);
    setTags(state.tags);
    setCategory(state.category);
    setCollaborators(state.collaborators);
    sessionStorage.removeItem("ideaFormState");
  };

  useEffect(() => {
    if (!user) {
      sessionStorage.setItem("ideaFormState", JSON.stringify(getFormState()));
      return;
    }
    const savedState = sessionStorage.getItem("ideaFormState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        restoreFormState(state);
      } catch {
        sessionStorage.removeItem("ideaFormState");
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name");
      if (!error) {
        setUsers(
          data?.map((profile) => ({
            id: profile.id,
            email: profile.username,
            full_name: profile.full_name,
          })) || []
        );
      }
    };
    fetchUsers();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCoverImg(e.target.files[0]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (!ideaTitle || !content) {
    toast.info("Title and Content are required");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("title", ideaTitle);
  formData.append("summary", subtitle);
  formData.append("content", content);
  formData.append("category", category);
  formData.append("tags", tags.join(","));
  formData.append("collaborators", collaborators.join(","));
  if (coverImg) formData.append("coverImg", coverImg);

  try {
    const res = await fetch("/api/ideas/create", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error("Error creating idea: " + data.error);
    } else {
      toast.success("Idea created successfully!");

      // Reset form
      setIdeaTitle("");
      setSubtitle("");
      setContent("");
      setTags([]);
      setCoverImg(null);
      setCategory("General");
      setCollaborators([]);

      // ✅ Grant "First Post" achievement only if not already unlocked
      if (user?.id) {
        const unlocked = await grantAchievementOnce(user.id, "First Post");
        if (unlocked) toast.success("Achievement unlocked: First Post!");
      }
    }
  } catch {
    toast.error("Something went wrong while submitting your idea.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-bg-dark px-4 py-8 rounded border border-border-secondary shadow-md max-w-6xl mx-2 md:mx-auto my-8">
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-brand-red" size={32} />
        <h1 className="text-3xl font-bold text-text-primary">Submit an Idea</h1>
      </div>
      <p className="text-text-secondary text-sm mb-6">
        Share your innovation idea with the community. Fill out the details
        below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Cover Image
          </label>
          <div className="relative">
            <label
              htmlFor="cover-upload"
              className="group relative w-full border-2 border-dashed border-border-secondary rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-red transition-colors"
            >
              <UploadCloud
                size={40}
                className="text-text-secondary mb-2 group-hover:text-brand-red transition-colors"
              />
              <p className="font-semibold text-sm text-text-primary mb-1">
                Click or drag & drop
              </p>
              <p className="text-xs text-text-secondary">
                SVG, PNG, JPG, or GIF (max 800x400)
              </p>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </label>

            {/* Preview */}
            {coverImg && (
              <div className="mt-3">
                <p className="text-xs text-text-secondary mb-1">{coverImg.name}</p>
                <div className="border border-border-secondary rounded-md overflow-hidden w-full h-48">
                  <img
                    src={URL.createObjectURL(coverImg)}
                    alt="Cover Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Title <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            value={ideaTitle}
            onChange={(e) => setIdeaTitle(e.target.value)}
            placeholder="Enter idea title"
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary focus:outline-none focus:ring-brand-red focus:border-brand-red"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Summary <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Enter a summary"
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary focus:outline-none focus:ring-brand-red focus:border-brand-red"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Content <span className="text-brand-red">*</span>
          </label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Tags
          </label>
          <TagsInput value={tags} onChange={setTags} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary focus:outline-none focus:ring-brand-red focus:border-brand-red"
          >
            {categories.map((cat) => (
              <option key={cat} className="text-text-primary cursor-pointer hover:bg-bg-gray bg-bg" value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Collaborators */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Collaborators
          </label>
          <div className="mt-1 border border-border-secondary rounded-md">
            <select
              multiple
              value={collaborators}
              onChange={(e) =>
                setCollaborators(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="w-full px-3 py-2 bg-bg-dark border-none focus:outline-none text-text-primary"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-border-secondary">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-red text-white font-semibold py-2 cursor-pointer px-5 rounded-md shadow hover:bg-btn-primary-hover disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Idea"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(SubmitIdea);
