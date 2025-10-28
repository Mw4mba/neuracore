import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { name, description, icon_url, points } = body;

  try {
    const { data, error } = await supabase
      .from("achievements")
      .insert([{ name, description, icon_url, points }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error creating achievement:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
