import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const ideaId = searchParams.get("id");

    if (!ideaId) {
      return NextResponse.json(
        { error: "Idea ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", ideaId)
      .eq("author", user.id); // ensures only owner can delete

    if (error) {
      console.error("Delete error:", error);

      if (error.code === "42501") {
        return NextResponse.json(
          { error: "Permission denied - RLS policy violation" },
          { status: 403 }
        );
      }

      throw error;
    }

    return NextResponse.json({ message: "Idea deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting idea:", error);

    return NextResponse.json(
      { error: error.message || "Failed to delete idea" },
      { status: 500 }
    );
  }
}
