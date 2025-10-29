 export const myTotalViews = async (): Promise<number> => {
  try {
    const res = await fetch("/api/ideas/author/me");

    if (!res.ok) throw new Error("Failed to fetch user's ideas");

    const ideas = await res.json();

    if (!Array.isArray(ideas)) return 0;

    // Sum up views for all ideas
    const totalViews = ideas.reduce((sum, idea) => {
      const viewCount = Array.isArray(idea.view_count)
        ? idea.view_count.length
        : Number(idea.view_count) || 0;
      return sum + viewCount;
    }, 0);

    return totalViews;
  } catch (err) {
    console.error("Error fetching total views:", err);
    return 0;
  }
};
