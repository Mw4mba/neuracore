import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_achievements")
      .select(`
        unlocked_at,
        achievements!inner(
          id,
          name,
          description,
          icon_url,
          points
        )
      `)
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten and filter out null achievements just in case
    const userAchievements = data
      ?.map((ua: any) => ua.achievements)
      .filter(Boolean)
      .map((a: any, i: number) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon_url: a.icon_url,
        points: a.points,
        unlocked_at: data[i]?.unlocked_at,
      })) || [];

    return NextResponse.json({ achievements: userAchievements });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
