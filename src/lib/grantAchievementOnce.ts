
export async function grantAchievementOnce(userId: string, achievementName: string) {
  try {
    // Fetch user's achievements
    const checkRes = await fetch(`/api/achievements/user?userId=${userId}`);
    const achievementsData = await checkRes.json();

    const hasAchievement = achievementsData.achievements?.some(
      (ach: any) => ach.name === achievementName
    );

    if (!hasAchievement) {
      //  Grant the achievement
      const grantRes = await fetch("/api/achievements/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, achievement_name: achievementName }),
      });

      const grantData = await grantRes.json();
      return grantData.success;
    }

    // Already has it
    return false;
  } catch (err) {
    console.error("Error checking/granting achievement:", err);
    return false;
  }
}
