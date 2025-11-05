import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function POST(req: Request) {
  const supabase = createClient();
  const { message_id, user_id } = await req.json();

  const { data, error } = await supabase
    .from("message_reads")
    .upsert([{ message_id, user_id }], { onConflict: "message_id,user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}