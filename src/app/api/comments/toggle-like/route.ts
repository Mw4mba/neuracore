import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("comment_id");

    if (!commentId) {
      return NextResponse.json(
        { error: "Missing comment_id parameter" },
        { status: 400 }
      );
    }

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the comment author before toggling like
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("author")
      .eq("id", commentId)
      .single();

    if (commentError) throw commentError;

    // Toggle the like
    const { error } = await supabase.rpc("toggle_comment_like", {
      comment_id: commentId,
    });

    if (error) {
      console.error("Error toggling comment like:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get updated comment data
    const { data: updatedComment, error: fetchError } = await supabase
      .from("comments")
      .select("id, likes")
      .eq("id", commentId)
      .single();

    if (fetchError) throw fetchError;

    // Create notification for comment author if this is a new like
    if (comment.author !== session.user.id) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: comment.author,
            type: "comment_like",
            actor_id: session.user.id,
            content: "liked your comment",
            comment_id: commentId
          }
        ]);

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
    }

    return NextResponse.json({
      message: "Comment like toggled successfully",
      likes: updatedComment.likes,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
