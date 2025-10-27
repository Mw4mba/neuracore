import { createClient } from "@/app/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = await createClient();

  try {
    const { data: idea, error } = await supabase
      .from("ideas")
      .select(`
        *,
        author:profiles(id, username, avatar_url),
        comments:comments(count),
        likes
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json(idea, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching idea:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
