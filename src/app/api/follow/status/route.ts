import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const following_id = searchParams.get("following_id");

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!following_id)
    return NextResponse.json({ error: "Missing following_id" }, { status: 400 });

  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", following_id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ isFollowing: !!data });
}
