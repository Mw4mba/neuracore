import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { user_id, achievement_name } = body;

  try {
    // 1️⃣ Find the achievement
    const { data: achievement, error: findError } = await supabase
      .from("achievements")
      .select("id")
      .eq("name", achievement_name)
      .single();

    if (findError || !achievement) throw new Error("Achievement not found");

    // 2️⃣ Check if user already has it
    const { data: existing, error: checkError } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", user_id)
      .eq("achievement_id", achievement.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") throw checkError; // ignore not found
    if (existing) {
      return NextResponse.json({ success: false, message: "Achievement already granted" });
    }

    // 3️⃣ Insert only if they don’t have it
    const { error: insertError } = await supabase
      .from("user_achievements")
      .insert([{ user_id, achievement_id: achievement.id }]);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error granting achievement:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
