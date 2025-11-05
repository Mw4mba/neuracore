import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";
export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  const supabase = createClient();
  const { chatId } = params;

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:sender_id(username, avatar_url)")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}