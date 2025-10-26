import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server"; 

// GET /api/profile/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, bio, full_name, avatar_url, role")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Author not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
