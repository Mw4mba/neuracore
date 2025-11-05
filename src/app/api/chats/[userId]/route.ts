import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const supabase = createClient();
  const { userId } = params;

  const { data, error } = await supabase
    .from("chat_participants")
    .select(`
      chat_id,
      chats (id, title, is_group, created_at)
    `)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map((p) => p.chats));
}