import { createClient } from "@/app/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = await createClient();

  try {
    const { data: ideas, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("author", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(ideas ?? [], { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user's ideas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
