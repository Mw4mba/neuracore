import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { challenge_id } = await request.json();

    if (!challenge_id) {
      return NextResponse.json({ error: "Missing challenge_id" }, { status: 400 });
    }

    // ✅ Get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    // ✅ Fetch challenge + participant count
    const [{ data: challenge }, { count }] = await Promise.all([
      supabase.from("challenges").select("max_participants").eq("id", challenge_id).single(),
      supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true })
        .eq("challenge_id", challenge_id),
    ]);

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if ((count ?? 0) >= challenge.max_participants) {
      return NextResponse.json({ error: "Challenge is full" }, { status: 403 });
    }

    // ✅ Try to join
    const { data, error } = await supabase
      .from("challenge_participants")
      .insert([{ challenge_id, user_id: user.id }])
      .select()
      .single();

    if (error?.code === "23505") {
      return NextResponse.json({ message: "Already joined" }, { status: 409 });
    }
    if (error) throw error;

    return NextResponse.json({ success: true, participant: data });
  } catch (err: any) {
    console.error("Join challenge error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to join challenge" },
      { status: 500 }
    );
  }
}
