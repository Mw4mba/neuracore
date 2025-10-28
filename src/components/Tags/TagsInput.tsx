"use client";
import React, { useState } from "react";

interface TagsInputProps {
  value: string[]; // tags from parent
  onChange: (tags: string[]) => void; // callback to update parent
}

const TagsInput: React.FC<TagsInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      const newTag = inputValue.startsWith("#")
        ? inputValue.trim()
        : `#${inputValue.trim()}`;
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="bg-bg-dark py-2  rounded-xl ">
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-red/10 to-brand-red/20 text-text-primary text-sm font-medium px-3 py-1 rounded-full border border-border-secondary shadow-sm"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-text-secondary hover:text-brand-red transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press Enter"
        className="w-full bg-bg-dark border border-border-secondary rounded-lg px-3 py-2 placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-red transition"
      />
      <p className="text-xs text-text-secondary mt-1">
        Press Enter to add a tag.
      </p>
    </div>
  );
};

export default TagsInput;
