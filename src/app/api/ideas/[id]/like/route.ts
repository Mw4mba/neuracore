import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params; // await the promise

  if (!id) {
    return NextResponse.json({ error: "Missing ideaId" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Call toggle_like function in Supabase
    const { error: toggleError } = await supabase.rpc("toggle_like", { idea_id: id });
    if (toggleError) throw toggleError;

    // Fetch updated like count
    const { data: ideaData, error: fetchError } = await supabase
      .from("ideas")
      .select("likes")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    return NextResponse.json({ message: "Like toggled successfully", likes: ideaData.likes });
  } catch (err: any) {
    console.error("Error toggling like:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
