import { createClient } from "@/app/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params; // await the promise

  if (!id) {
    return NextResponse.json({ error: "Missing author id" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: ideas, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("author", id)
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
