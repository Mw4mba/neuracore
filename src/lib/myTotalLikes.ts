 export const myTotalLikes = async (): Promise<number> => {
  try {
    const res = await fetch("/api/ideas/author/me");

    if (!res.ok) throw new Error("Failed to fetch user's ideas");

    const ideas = await res.json();

    if (!Array.isArray(ideas)) return 0;

    // Sum up likes for all ideas
    const totalLikes = ideas.reduce((sum, idea) => {
      const likesCount = Array.isArray(idea.likes)
        ? idea.likes.length
        : Number(idea.likes) || 0;
      return sum + likesCount;
    }, 0);

    return totalLikes;
  } catch (err) {
    console.error("Error fetching total likes:", err);
    return 0;
  }
};
