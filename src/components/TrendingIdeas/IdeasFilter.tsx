"use client";

import React from "react";

interface Props {
  query: string;
  setQuery: (val: string) => void;
  selected: string;
  setSelected: (val: string) => void;
  categories: string[];
}

const IdeasFilter: React.FC<Props> = ({
  query,
  setQuery,
  selected,
  setSelected,
  categories,
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between px-[4vw] md:px-[10vw]">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search ideas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-bg-dark md:w-1/3 border border-border-secondary px-4 py-2 rounded w-[90%] focus:outline-none focus:ring-2 focus:ring-btn-primary placeholder:text-text-primary/50"
      />

      {/* Category Buttons */}
      <div className="flex flex-wrap mt-1 gap-2 justify-center sm:justify-end">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all ${
              selected === cat
                ? "bg-brand-red text-white"
                : "bg-bg border-1 border-brand-red/50 hover:bg-brand-red hover:text-white text-text-primary/80"
            }`}
          >
            {cat === "All" ? "All" : cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IdeasFilter;
