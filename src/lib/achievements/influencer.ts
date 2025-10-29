import { grantAchievementOnce } from "../grantAchievementOnce";
import { myTotalLikes } from "../myTotalLikes";

export const checkInfluencerAchievement = async (userId: string) => {
  try {
    // Get total likes for the user's ideas
    const totalLikes = await myTotalLikes();

    // Define threshold for Influencer
    const INFLUENCER_THRESHOLD = 20;

    if (totalLikes >= INFLUENCER_THRESHOLD) {
      // Grant the achievement if not already granted
      const granted = await grantAchievementOnce(userId, "Influencer");
      if (granted) {
        console.log("🏆 Achievement Unlocked: Influencer!");
      }
      return granted;
    }

    // Not enough likes yet
    return false;
  } catch (err) {
    console.error("Error checking Influencer achievement:", err);
    return false;
  }
};
