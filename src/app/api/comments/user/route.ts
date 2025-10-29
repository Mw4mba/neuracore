
import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from("comments")
      .select("id, idea_id, created_at")
      .eq("author", userId);

    if (error) throw error;

    return NextResponse.json({ comments: comments ?? [] });
  } catch (err: any) {
    console.error("Error fetching user comments:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
