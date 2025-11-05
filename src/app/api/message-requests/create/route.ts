import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function POST(req: Request) {
  const supabase = createClient();
  const { sender_id, receiver_id } = await req.json();

  if (!sender_id || !receiver_id)
    return NextResponse.json({ error: "Missing sender or receiver" }, { status: 400 });

  const { data, error } = await supabase
    .from("message_requests")
    .insert([{ sender_id, receiver_id }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}