import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .order("deadline", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}