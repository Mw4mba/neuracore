import { createClient } from "@/app/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();

    const { id } = await params; // await the promise
    if (!id) return NextResponse.json({ liked: false }, { status: 400 });

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ liked: false }, { status: 200 });
    }
    const userId = session.user.id;

    // Check if the user liked this idea
    const { data, error } = await supabase
      .from("idea_likes")
      .select("*")
      .eq("idea_id", id)
      .eq("user_id", userId)
      .single();

    // PGRST116 = no rows found, not an actual error in this context
    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ liked: !!data }, { status: 200 });
  } catch (err: any) {
    console.error("Error checking like status:", err);
    return NextResponse.json({ liked: false }, { status: 500 });
  }
}
