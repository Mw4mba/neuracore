// /api/achievements/users-by-achievement.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const achievementId = searchParams.get("achievementId");

    if (!achievementId) {
      return NextResponse.json(
        { error: "Missing achievementId" },
        { status: 400 }
      );
    }

    // Join user_achievements -> profiles (foreign key ensures profiles exist)
    const { data, error } = await supabase
      .from("user_achievements")
      .select(`
        unlocked_at,
        profiles (
          id,
          username,
          full_name
        )
      `)
      .eq("achievement_id", achievementId)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map results to simple array
    const users = (data || []).map((ua: any) => ({
      id: ua.profiles.id,
      username: ua.profiles.username,
      full_name: ua.profiles.full_name,
      unlocked_at: ua.unlocked_at,
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
