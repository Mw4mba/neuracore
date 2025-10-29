// app/api/achievements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check for userId in query params
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");

    // Get signed-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Use either the provided userId or the current user's id
    const targetUserId = userIdParam;

    // Fetch achievements for that user
    const { data: achievements, error } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(achievements ?? []);
  } catch (err: any) {
    console.error("Error fetching achievements:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
