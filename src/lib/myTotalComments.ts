export const myTotalComments = async (): Promise<number> => {
  try {
    const res = await fetch("/api/ideas/author/me"); 
    if (!res.ok) throw new Error("Failed to fetch ideas");

    const ideas = await res.json();
    return ideas.reduce((total: number, idea: any) => {
      return total + (idea.comment_count || 0);
    }, 0);
  } catch (err) {
    console.error("Error fetching total comments:", err);
    return 0;
  }
};
