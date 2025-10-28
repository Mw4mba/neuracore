import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing idea ID" }, { status: 400 });
    }

    // Fetch the current view count
    const { data: idea, error: fetchError } = await supabase
      .from("ideas")
      .select("view_count")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching idea:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Increment locally
    const newViewCount = (idea?.view_count || 0) + 1;

    // Update the idea
    const { error: updateError } = await supabase
      .from("ideas")
      .update({ view_count: newViewCount })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating view count:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ view_count: newViewCount }, { status: 200 });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
