import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all posts with author info and comments count
    const { data: posts, error } = await supabase
      .from("ideas")
      .select(`
        *,
        author:profiles(id, username, avatar_url),
        comments:comments(count)
      `);

    if (error) throw error;

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
