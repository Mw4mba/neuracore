import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

interface Params {
  params: Promise<{ ideaId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { ideaId } = await params; 

  if (!ideaId) {
    return NextResponse.json({ error: "Missing ideaId" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error("Error fetching comments:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
