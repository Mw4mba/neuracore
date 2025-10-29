export const fetchMyIdeaCount = async (): Promise<number> => {
  try {
    const res = await fetch("/api/ideas/author/me", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch your ideas");

    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (err) {
    console.error("Error fetching your idea count:", err);
    return 0;
  }
};
