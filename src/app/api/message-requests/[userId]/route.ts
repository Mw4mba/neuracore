import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const supabase = createClient();
  const { userId } = params;

  const { data, error } = await supabase
    .from("message_requests")
    .select("*, sender:sender_id(username, avatar_url)")
    .eq("receiver_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}