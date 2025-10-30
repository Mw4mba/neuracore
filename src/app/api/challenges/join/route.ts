import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { challenge_id } = await request.json();

    if (!challenge_id) {
      return NextResponse.json({ error: "Missing challenge_id" }, { status: 400 });
    }

    //Ensure user is logged in
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    // Get current participant count safely
    const { count, error: countError } = await supabase
      .from("challenge_participants")
      .select("*", { count: "exact", head: true })
      .eq("challenge_id", challenge_id);

    if (countError) throw countError;

    const participantCount = count ?? 0; // default to 0 if null

    // Get challenge info (max participants)
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("max_participants")
      .eq("id", challenge_id)
      .single();

    if (challengeError) throw challengeError;
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (participantCount >= challenge.max_participants) {
      return NextResponse.json({ error: "Challenge is full" }, { status: 403 });
    }

    // Try to insert participant
    const { data, error } = await supabase
      .from("challenge_participants")
      .insert([{ challenge_id, user_id: user.id }])
      .select()
      .single();

    if (error && !error.message.includes("duplicate")) throw error;

    return NextResponse.json({ success: true, participant: data });
  } catch (err: any) {
    console.error("Join challenge error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to join challenge" },
      { status: 500 }
    );
  }
}