import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("challenges")
      .select(`
        *
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ challenge: data });
  } catch (err: any) {
    console.error("Fetch challenge error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}