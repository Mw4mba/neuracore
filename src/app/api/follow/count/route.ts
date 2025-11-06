import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id;

    // Get followers (people who follow me)
    const { count: followerCount, error: followerError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    if (followerError) {
      console.error("Error fetching followers:", followerError);
      return NextResponse.json({ error: "Failed to fetch follower count" }, { status: 500 });
    }

    // Get following (people I follow)
    const { count: followingCount, error: followingError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (followingError) {
      console.error("Error fetching following:", followingError);
      return NextResponse.json({ error: "Failed to fetch following count" }, { status: 500 });
    }

    return NextResponse.json({
      follower_count: followerCount || 0,
      following_count: followingCount || 0,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
