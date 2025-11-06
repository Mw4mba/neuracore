import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id parameter" },
        { status: 400 }
      );
    }

    // Count followers (users who follow this user)
    const { count: follower_count, error: followerError } = await supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", user_id);

    if (followerError) throw followerError;

    // Count following (users this user follows)
    const { count: following_count, error: followingError } = await supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", user_id);

    if (followingError) throw followingError;

    return NextResponse.json({
      user_id,
      follower_count: follower_count || 0,
      following_count: following_count || 0,
    });
  } catch (error) {
    console.error("Error fetching user follow counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user follow counts" },
      { status: 500 }
    );
  }
}
