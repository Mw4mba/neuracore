import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Parse request body (use server session as author)
    const body = await req.json();
    const { idea_id, content } = body;

    if (!idea_id || !content) {
      return NextResponse.json(
        { error: "idea_id and content are required" },
        { status: 400 }
      );
    }

    // Get the idea author before creating comment
    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .select("author")
      .eq("id", idea_id)
      .single();

    if (ideaError) throw ideaError;

    // Insert comment (set author from session)
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        idea_id,
        author: session.user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }


    // Create notification for idea author if commenter is not the idea author
    if (idea.author !== session.user.id) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: idea.author,
            type: "comment",
            actor_id: session.user.id,
            content: "commented on your idea",
            idea_id,
            comment_id: comment.id
          }
        ]);

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
