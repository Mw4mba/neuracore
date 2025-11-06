import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { following_id } = await request.json();

    if (!following_id) {
      return NextResponse.json({ error: "Missing following_id" }, { status: 400 });
    }

    if (following_id === user.id) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    // Check if user already follows
    const { data: existingFollow, error: fetchError } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", following_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // If follow exists → remove (unfollow)
    if (existingFollow) {
      const { error: deleteError } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", following_id);

      if (deleteError) throw deleteError;

      return NextResponse.json({ message: "Unfollowed user", following: false });
    }

    // Otherwise, create new follow
    const { error: insertError } = await supabase.from("follows").insert([
      {
        follower_id: user.id,
        following_id,
      },
    ]);

    if (insertError) throw insertError;

    return NextResponse.json({ message: "Followed user", following: true });
  } catch (error: any) {
    console.error("Error toggling follow:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
