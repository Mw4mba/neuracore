import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 🔹 Get currently signed-in user
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

    // 🔹 Fetch ideas by this user
    const { data: ideas, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("author", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(ideas ?? [], { status: 200 });
  } catch (err: any) {
    console.error("Error fetching user's ideas:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
