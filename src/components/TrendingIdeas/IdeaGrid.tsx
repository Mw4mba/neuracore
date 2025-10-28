import React from "react";
import IdeaCard from "./IdeaCard";

// Updated interface to match API response
interface Author {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

interface Idea {
  id: string;
  title: string;
  category: string;
  summary: string;       // your API uses `summary` instead of `description`
  content: string;
  author: Author;
  created_at: string;
  updated_at: string;
  likes?: number;
  // comments?: number;
  share_count?: number;
  view_count?: number;
  tags?: string[];
  cover_img?: string;
  trending?: boolean;
}

interface Props {
  ideas: Idea[];
}

const IdeaGrid: React.FC<Props> = ({ ideas }) => {
  return (
    <div className="grid px-[4vw] md:px-[10vw] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 py-6 gap-3 md:gap-4">
      {ideas.length > 0 ? (
        ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
      ) : (
        <p className="col-span-full text-center text-text-secondary">
          No ideas match your search.
        </p>
      )}
    </div>
  );
};

export default IdeaGrid;
