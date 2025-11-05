import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("comment_id");

    if (!commentId) {
      return NextResponse.json({ error: "Missing comment_id" }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .select("id, idea_id, content")
      .eq("id", commentId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment);
  } catch (err: any) {
    console.error("Error fetching comment:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
