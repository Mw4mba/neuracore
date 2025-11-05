import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get the challenge_id from query params
  const challenge_id = request.nextUrl.searchParams.get("challenge_id");
  if (!challenge_id) {
    return NextResponse.json({ error: "Missing challenge_id" }, { status: 400 });
  }

  try {
    // Fetch all participants for the challenge, including profile info
    const { data, error } = await supabase
      .from("challenge_participants")
      .select(`
        user_id,
        joined_at,
        profiles (
          id,
          username,
          avatar_url,
          full_name
        )
      `)
      .eq("challenge_id", challenge_id);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error fetching participants:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
