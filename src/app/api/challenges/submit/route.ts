import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { challenge_id, file_url, description } = await request.json();

    if (!challenge_id || !file_url)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user)
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    // Check if challenge exists & still open
    const { data: challenge } = await supabase
      .from("challenges")
      .select("deadline")
      .eq("id", challenge_id)
      .single();

    if (!challenge)
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

    if (new Date(challenge.deadline) < new Date())
      return NextResponse.json({ error: "Submission deadline passed" }, { status: 403 });

    // Verify user joined
    const { data: joined } = await supabase
      .from("challenge_participants")
      .select("id")
      .eq("challenge_id", challenge_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!joined)
      return NextResponse.json(
        { error: "You must join the challenge before submitting" },
        { status: 403 }
      );

    const { data, error } = await supabase
      .from("challenge_submissions")
      .insert([{ challenge_id, user_id: user.id, file_url, description }])
      .select()
      .single();

    if (error && !error.message.includes("duplicate"))
      throw error;

    return NextResponse.json({ success: true, submission: data });
  } catch (err: any) {
    console.error("Submit challenge error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit" },
      { status: 500 }
    );
  }
}