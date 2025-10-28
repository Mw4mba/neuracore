import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Parse request body
    const body = await req.json();
    const { idea_id, author, content } = body;

    if (!idea_id || !author || !content) {
      return NextResponse.json(
        { error: "idea_id, author, and text are required" },
        { status: 400 }
      );
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        idea_id,
        author,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
