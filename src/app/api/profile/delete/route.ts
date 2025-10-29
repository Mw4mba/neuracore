import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Delete the user profile (cascade deletes handled if foreign keys use ON DELETE CASCADE)
    const { error } = await supabase.from("auth.users").delete().eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting user:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
