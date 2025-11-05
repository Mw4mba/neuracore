import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function POST(req: Request) {
  const supabase = createClient();
  const { title, is_group, created_by, participants } = await req.json();

  const { data: chat, error } = await supabase
    .from("chats")
    .insert([{ title, is_group, created_by }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Add participants
  if (participants && participants.length > 0) {
    await supabase.from("chat_participants").insert(
      participants.map((user_id: string) => ({
        chat_id: chat.id,
        user_id,
        role: user_id === created_by ? "owner" : "member",
      }))
    );
  }

  return NextResponse.json(chat);
}