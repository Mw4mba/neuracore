// /app/api/messages/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function POST(req: Request) {
  const supabase = createClient();
  const { chat_id, sender_id, content, reply_to } = await req.json();

  const { data, error } = await supabase
    .from("messages")
    .insert([{ chat_id, sender_id, content, reply_to }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}