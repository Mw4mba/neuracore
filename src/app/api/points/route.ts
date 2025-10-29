// app/api/achievements/points/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Join user_achievements with achievements to get points
    const { data, error } = await supabase
      .from("user_achievements")
      .select(`
        unlocked_at,
        achievements(name, points, description, icon_url)
      `)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten the achievements array and calculate total points
    const achievements = data?.map((ua: any) => ({
      name: ua.achievements.name,
      description: ua.achievements.description,
      icon_url: ua.achievements.icon_url,
      points: ua.achievements.points,
      unlocked_at: ua.unlocked_at,
    })) || [];

    const totalPoints = achievements.reduce((sum, ach) => sum + (ach.points || 0), 0);

    return NextResponse.json({ totalPoints, achievements });
  } catch (err: any) {
    console.error("Error fetching achievement points:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
