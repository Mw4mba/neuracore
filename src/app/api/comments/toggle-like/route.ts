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

    const { error } = await supabase.rpc("toggle_comment_like", {
      comment_id: commentId,
    });

    if (error) {
      console.error("Error toggling comment like:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: updatedComment, error: fetchError } = await supabase
      .from("comments")
      .select("id, likes")
      .eq("id", commentId)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({
      message: "Comment like toggled successfully",
      likes: updatedComment.likes,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
