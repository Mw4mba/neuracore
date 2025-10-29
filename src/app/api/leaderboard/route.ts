import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
      const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    let supabaseQuery = supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        username,
        role,
        avatar_url,
        user_achievements (
          achievement_id,
          achievements ( points )
        )
      `
      );

    if (query) {
      supabaseQuery = supabaseQuery.or(
        `full_name.ilike.%${query}%,username.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery;

    if (error) throw error;

    const leaderboard = (data ?? []).map((u: any) => {
      const totalPoints =
        u.user_achievements?.reduce(
          (sum: number, ua: any) => sum + (ua.achievements?.points || 0),
          0
        ) ?? 0;

        // Map Supabase roles to frontend display roles
        let displayRole = "Innovator";
        if (u.role === "admin") displayRole = "Admin";
        else if (u.role === "moderator") displayRole = "Recruiter";

      return {
        id: u.id,
        full_name: u.full_name,
        username: u.username,
        role: displayRole,
        avatar_url: u.avatar_url,
        points: totalPoints,
        rank: 0,
      };
    });

    // ✅ Sort and rank
    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((u, i) => (u.rank = i + 1));

    return NextResponse.json(leaderboard);
  } catch (err: any) {
    console.error("Leaderboard fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
