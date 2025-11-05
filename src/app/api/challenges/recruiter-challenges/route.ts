// File: /app/api/challenges/my-created/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    // Fetch challenges created by this user
    const { data: challenges, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(challenges);
  } catch (err: any) {
    console.error("Fetch created challenges error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch created challenges" },
      { status: 500 }
    );
  }
}
