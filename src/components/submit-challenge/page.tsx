"use client";

import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

const SubmitChallengeForm = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    title: "",
    category: "",
    difficulty: "",
    description: "",
    objectives: "",
    judgingCriteria: "",
    requirements: "",
    prize: "",
    deadline: "",
    maxParticipants: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const validateForm = () => {
    const requiredFields = [
      "company",
      "title",
      "category",
      "difficulty",
      "description",
      "objectives",
      "requirements",
      "prize",
      "deadline",
      "maxParticipants",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error("x");
        return false;
      }
    }

    if (isNaN(Number(formData.maxParticipants)) || Number(formData.maxParticipants) <= 0) {
      toast.error("Max participants must be a valid positive number.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/challenges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags,
          maxParticipants: Number(formData.maxParticipants),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create challenge");
      }

      toast.success("🎯 Challenge submitted successfully!");
      setFormData({
        company: "",
        title: "",
        category: "",
        difficulty: "",
        description: "",
        objectives: "",
        judgingCriteria: "",
        requirements: "",
        prize: "",
        deadline: "",
        maxParticipants: "",
      });
      setTags([]);
    } catch (err: any) {
      console.error("Challenge submission error:", err);
      toast.error(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-dark p-8 rounded border border-border-secondary shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-text-primary">
        Create an Innovation Challenge
      </h2>
      <p className="text-text-secondary text-sm mt-2 mb-6">
        Post a challenge for innovators to solve. Provide clear requirements and attractive incentives.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Company Name */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-text-primary">
            Company/Organization Name *
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Enter your company or organization name"
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
          />
        </div>

        {/* Challenge Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-primary">
            Challenge Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a compelling challenge title"
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
          />
        </div>

        {/* Category & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-text-primary">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-border-secondary bg-bg-gray rounded-md"
            >
              <option value="">Select a category</option>
              <option>Technology</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>Education</option>
              <option>Environment</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-text-primary">
              Difficulty Level *
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-border-secondary bg-bg-gray rounded-md"
            >
              <option value="">Select difficulty</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        {/* Description, Objectives, Judging Criteria, Requirements */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary">
            Challenge Description *
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the challenge in detail"
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
          />
        </div>

        <div>
          <label htmlFor="objectives" className="block text-sm font-medium text-text-primary">
            Challenge Objectives *
          </label>
          <textarea
            id="objectives"
            rows={4}
            value={formData.objectives}
            onChange={handleChange}
            placeholder="What are the main goals of this challenge?"
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
          />
        </div>

        <div>
          <label htmlFor="judgingCriteria" className="block text-sm font-medium text-text-primary">
            Judging Criteria *
          </label>
          <textarea
            id="judgingCriteria"
            rows={3}
            value={formData.judgingCriteria}
            onChange={handleChange}
            placeholder="List the criteria used to evaluate submissions"
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-text-primary">
            Requirements & Deliverables *
          </label>
          <textarea
            id="requirements"
            rows={4}
            value={formData.requirements}
            onChange={handleChange}
            placeholder="List the specific requirements and expected deliverables"
            className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
          />
        </div>

        {/* Prize, Deadline, Max Participants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="prize" className="block text-sm font-medium text-text-primary">
              Prize / Reward *
            </label>
            <input
              type="text"
              id="prize"
              value={formData.prize}
              onChange={handleChange}
              placeholder="e.g., $10,000 or Internship Opportunity"
              className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
            />
          </div>

          <div className="relative">
            <label htmlFor="deadline" className="block text-sm font-medium text-text-primary">
              Submission Deadline *
            </label>
            <input
              type="text"
              id="deadline"
              value={formData.deadline}
              onChange={handleChange}
              placeholder="mm/dd/yyyy"
              className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
            />
            <CalendarIcon className="absolute right-3 top-9 h-5 w-5 text-brand-red" />
          </div>

          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-text-primary">
              Max Participants *
            </label>
            <input
              type="number"
              id="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="e.g., 10"
              className="mt-1 block w-full px-3 py-2 border border-border-secondary rounded-md placeholder:text-text-secondary"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-text-primary">
            Tags
          </label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              placeholder="Add relevant tags (press Enter)"
              className="block w-full px-3 py-2 border border-border-secondary rounded-l-md placeholder:text-text-secondary"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-bg text-text-primary px-4 py-2 rounded-r-md border border-l-0 border-border-secondary hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="bg-bg-dark-gray text-text-primary text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="text-text-secondary hover:text-gray-800">
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-border-secondary">
          <button
            type="button"
            className="bg-text-primary hover:bg-transparent text-bg hover:text-text-primary font-semibold py-2 px-4 border border-transparent hover:border-text-primary rounded shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-red cursor-pointer hover:bg-btn-primary-hover text-white font-semibold py-2.5 px-4 rounded shadow-sm"
          >
            {loading ? "Submitting..." : "Submit Challenge"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitChallengeForm;