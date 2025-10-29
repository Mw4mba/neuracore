// lib/achievements/communityFavorite.ts

import { grantAchievementOnce } from "../grantAchievementOnce";

export async function checkCommunityFavorite(userId: string) {
  try {
    // Fetch all ideas for this user
    const res = await fetch(`/api/ideas/author/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch user's ideas");

    const ideas = await res.json();

    // Check if any idea has 25+ likes
    const hasPopularIdea = ideas.some(
      (idea: any) =>
        Array.isArray(idea.likes) ? idea.likes.length >= 10 : idea.likes >= 10
    );

    if (hasPopularIdea) {
      // Grant achievement if not already granted
      await grantAchievementOnce(userId, "Community Favorite");
    }
  } catch (err) {
    console.error("Error checking Community Favorite achievement:", err);
  }
}
