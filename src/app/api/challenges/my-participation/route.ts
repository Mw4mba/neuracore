import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    // Fetch challenges where user participates
    const { data, error } = await supabase
      .from("challenge_participants")
      .select(`
        challenge_id,
        challenges (
          id,
          company,
          title,
          category,
          difficulty,
          description,
          objectives,
          judging_criteria,
          requirements,
          prize,
          deadline,
          max_participants,
          tags,
          created_by,
          created_at
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten the result to return only challenge objects
    const challenges = data?.map((item: any) => item.challenges) || [];

    return NextResponse.json(challenges);
  } catch (err: any) {
    console.error("Fetch participations error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch participations" }, { status: 500 });
  }
}
