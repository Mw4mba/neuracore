import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// ✅ GET /api/profile/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, bio, full_name, avatar_url, role")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error in /api/profile/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
