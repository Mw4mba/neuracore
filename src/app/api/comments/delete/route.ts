// /app/api/comments/delete/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("comment_id");
    const authorId = searchParams.get("author_id"); 

    if (!commentId || !authorId) {
      return NextResponse.json(
        { error: "Missing comment_id or author_id parameter" },
        { status: 400 }
      );
    }

    // Delete comment only if the author matches the passed authorId
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("author", authorId);

    if (error) throw error;

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting comment:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
