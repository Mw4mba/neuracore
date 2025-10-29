import { grantAchievementOnce } from "../grantAchievementOnce";

// Check if user qualifies for "The Conversationalist" achievement
export async function checkConversationalistAchievement(userId: string) {
  try {
    // Fetch user's comments
    const res = await fetch(`/api/comments/user?userId=${userId}`);
    const commentsData = await res.json();

    // Extract unique idea IDs the user has commented on
    const uniqueIdeaIds = new Set(commentsData.comments?.map((c: any) => c.ideaId));

    // If user has commented on 5 or more different ideas, grant achievement
    if (uniqueIdeaIds.size >= 5) {
      const granted = await grantAchievementOnce(userId, "The Conversationalist");
      if (granted) {
        console.log("Achievement granted: The Conversationalist");
      } else {
        console.log("User already has 'The Conversationalist' achievement");
      }
    }
  } catch (err) {
    console.error("Error checking Conversationalist achievement:", err);
  }
}
