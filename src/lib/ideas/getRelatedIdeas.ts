interface Idea {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  author?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  [key: string]: any;
}

export const getRelatedIdeas = async (
  apiKey: string,
  currentIdea: Idea
): Promise<Idea[]> => {
  try {
    const res = await fetch(`/api/ideas?limit=100`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch ideas");

    const { ideas } = await res.json();

    if (!Array.isArray(ideas)) return [];

    const otherIdeas = ideas.filter((idea) => idea.id !== currentIdea.id);

    const tagMatches = otherIdeas.filter((idea) => {
      if (!idea.tags || !currentIdea.tags) return false;
      return idea.tags.some((tag: string) => currentIdea.tags!.includes(tag));
    });

    if (tagMatches.length > 0) {
      return tagMatches;
    }

    const categoryMatches = otherIdeas.filter(
      (idea) => idea.category === currentIdea.category
    );

    return categoryMatches;
  } catch (error) {
    console.error("Error fetching related ideas:", error);
    return [];
  }
};
