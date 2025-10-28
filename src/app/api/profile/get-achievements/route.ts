// /api/profiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);

    // Accept multiple user IDs as a comma-separated list
    const userIdsParam = searchParams.get("userIds");
    if (!userIdsParam) {
      return NextResponse.json({ error: "Missing userIds" }, { status: 400 });
    }

    const userIds = userIdsParam.split(",");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", userIds);

    if (error) {
      console.error("Supabase profiles error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: data || [] });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
