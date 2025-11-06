"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Plus } from "lucide-react";
import { createPortal } from "react-dom";

interface Challenge {
  id: string;
  title: string;
  prize: string;
  deadline: string;
  max_participants: number;
}

const JoinedChallenges: React.FC = () => {
  const [isSubmitIdeaOpen, setIsSubmitIdeaOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [ideaFormData, setIdeaFormData] = useState({
    title: "",
    category: "",
    description: "",
  });
  const [joinedChallenges, setJoinedChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch challenges the user participates in
  useEffect(() => {
    const fetchJoinedChallenges = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/challenges/my-participation");
        if (!res.ok) throw new Error("Failed to fetch joined challenges");
        const data = await res.json();
        // Map API response to Challenge interface
        const challenges: Challenge[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          prize: c.prize,
          deadline: new Date(c.deadline).toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          max_participants: c.max_participants || 0,
        }));
        setJoinedChallenges(challenges);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedChallenges();
  }, []);

  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Idea:", ideaFormData);
    setIsSubmitIdeaOpen(false);
    setIdeaFormData({ title: "", category: "", description: "" });
  };

  if (loading) return <p className="text-text-secondary">Loading joined challenges...</p>;

  return (
    <div className="bg-bg-dark border border-border-secondary mb-8 rounded-xl backdrop-blur-md p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-[var(--color-text-primary)]">
        <Trophy className="w-5 h-5 text-[var(--color-accent-yellow)]" />
        <h2 className="text-2xl font-semibold">Joined Challenges</h2>
      </div>

      {/* Challenge List */}
      <div className="space-y-4">
        {joinedChallenges.length === 0 ? (
          <p className="text-text-secondary">You have not joined any challenges yet.</p>
        ) : (
          joinedChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border-secondary bg-[var(--color-bg-gray)]/60 hover:border-border-primary/50 cursor-pointer transition-all"
            >
              <div className="flex-1">
                <h3 className="font-medium text-[var(--color-text-primary)] mb-1">
                  {challenge.title}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs md:text-sm text-[var(--color-text-secondary)]">
                  <span>Prize: {challenge.prize}</span>
                  <span>Deadline: {challenge.deadline}</span>
                  <span>Max Participants: {challenge.max_participants}</span>
                </div>
              </div>

              {/* Submit Idea Button */}
              <button
                onClick={() => {
                  setSelectedChallenge(challenge.id);
                  setIsSubmitIdeaOpen(true);
                }}
                className="mt-3 sm:mt-0 sm:ml-4 px-4 py-2 flex items-center justify-center gap-1 rounded-md text-sm font-medium bg-btn-primary cursor-pointer hover:bg-btn-primary-hover text-white hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" /> Submit Idea
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal (Dialog) */}
      {isSubmitIdeaOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg/20 backdrop-blur-lg">
            <div
              className="absolute inset-0 w-full h-full bg-bg/20 backdrop-blur-lg"
              onClick={() => setIsSubmitIdeaOpen(false)}
            />
            <div className="relative z-10 bg-[var(--color-bg-dark)] border border-border-secondary rounded-lg p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Submit Idea to Challenge
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Submit your innovative idea for "
                {joinedChallenges.find((c) => c.id === selectedChallenge)?.title}"
              </p>

              <form onSubmit={handleSubmitIdea} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Idea Title *
                  </label>
                  <input
                    type="text"
                    value={ideaFormData.title}
                    onChange={(e) =>
                      setIdeaFormData({ ...ideaFormData, title: e.target.value })
                    }
                    placeholder="Enter your idea title"
                    required
                    className="w-full px-3 py-2 rounded-md bg-[var(--color-bg-gray)] border border-border-secondary text-[var(--color-text-primary)] focus:border-border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Category *
                  </label>
                  <select
                    value={ideaFormData.category}
                    onChange={(e) =>
                      setIdeaFormData({ ...ideaFormData, category: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-md bg-[var(--color-bg-gray)] border border-border-secondary text-[var(--color-text-primary)] focus:border-border-primary outline-none"
                  >
                    <option value="">Select a category</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="fintech">FinTech</option>
                    <option value="sustainability">Sustainability</option>
                    <option value="entertainment">Entertainment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Description *
                  </label>
                  <textarea
                    value={ideaFormData.description}
                    onChange={(e) =>
                      setIdeaFormData({ ...ideaFormData, description: e.target.value })
                    }
                    placeholder="Describe your idea in detail"
                    required
                    rows={5}
                    className="w-full px-3 py-2 rounded-md bg-[var(--color-bg-gray)] border border-border-secondary text-[var(--color-text-primary)] focus:border-border-primary outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSubmitIdeaOpen(false)}
                    className="px-4 py-2 rounded-md border bg-text-primary text-bg hover:text-text-primary duration-300 hover:bg-bg  transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-btn-primary hover:bg-btn-primary-hover cursor-pointer duration-300 text-white font-medium hover:opacity-90 transition-all"
                  >
                    Submit Idea
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default JoinedChallenges;
