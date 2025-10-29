export const fetchUserIdeaCount = async (userId: string): Promise<number> => {
  try {
    if (!userId) throw new Error("Missing user ID");

    const res = await fetch(`/api/ideas/author/${userId}`);

    if (!res.ok) throw new Error("Failed to fetch user's ideas");

    const data = await res.json();

    return Array.isArray(data) ? data.length : 0;
  } catch (err) {
    console.error("Error fetching user idea count:", err);
    return 0; 
  }
};
