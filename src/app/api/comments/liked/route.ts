// /app/api/comments/liked-by-me/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Can accept single comment_id or multiple comma-separated
    const commentIdsParam = searchParams.get("comment_ids");
    if (!commentIdsParam) {
      return NextResponse.json({ error: "Missing comment_ids parameter" }, { status: 400 });
    }

    const commentIds = commentIdsParam.split(",");

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Query comment_likes to see which comments the user has liked
    const { data: likedComments, error } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .in("comment_id", commentIds)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    // Return an object mapping comment_id => true/false
    const likedMap: Record<string, boolean> = {};
    commentIds.forEach((id) => {
      likedMap[id] = likedComments?.some((c) => c.comment_id === id) ?? false;
    });

    return NextResponse.json({ liked: likedMap });
  } catch (err: any) {
    console.error("Error fetching liked comments:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
