import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function PATCH(req: Request) {
  const supabase = createClient();
  const { request_id, status } = await req.json();

  if (!["accepted", "rejected", "blocked"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  // Get the original request
  const { data: request, error: fetchError } = await supabase
    .from("message_requests")
    .select("id, sender_id, receiver_id, status")
    .eq("id", request_id)
    .single();

  if (fetchError || !request)
    return NextResponse.json(
      { error: fetchError?.message || "Request not found" },
      { status: 404 }
    );

  // Update status
  const { data: updatedRequest, error: updateError } = await supabase
    .from("message_requests")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", request_id)
    .select()
    .single();

  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 });

  // If accepted, create a chat
  if (status === "accepted") {
    // Check if a chat already exists between these two users
    const { data: existingChat, error: existingError } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .in("user_id", [request.sender_id, request.receiver_id]);

    if (!existingError && existingChat?.length >= 2) {
      // Already have a chat (both users share a chat)
      return NextResponse.json(updatedRequest);
    }

    // Create new private chat
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert({
        title: "Private Chat",
        is_group: false,
        created_by: request.receiver_id,
      })
      .select()
      .single();

    if (chatError)
      return NextResponse.json({ error: chatError.message }, { status: 500 });

    // Add both users to chat_participants
    const { error: participantsError } = await supabase
      .from("chat_participants")
      .insert([
        { chat_id: newChat.id, user_id: request.sender_id, role: "member" },
        { chat_id: newChat.id, user_id: request.receiver_id, role: "member" },
      ]);

    if (participantsError)
      return NextResponse.json({ error: participantsError.message }, { status: 500 });
  }

  return NextResponse.json(updatedRequest);
}