import { createClient } from "@/app/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params; // <-- await the promise

  if (!id) {
    return NextResponse.json({ error: "Missing idea id" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
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
  } catch (err: any) {
    console.error("Error fetching idea:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
