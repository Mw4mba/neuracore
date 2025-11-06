import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { deleteImage, extractFilePathFromUrl } from "@/lib/storage/image-upload";

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

    // First, get the idea to check for cover image
    const { data: idea, error: fetchError } = await supabase
      .from("ideas")
      .select("cover_img, author")
      .eq("id", ideaId)
      .single();

    if (fetchError || !idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (idea.author !== user.id) {
      return NextResponse.json(
        { error: "Permission denied - you can only delete your own ideas" },
        { status: 403 }
      );
    }

    // Delete cover image from storage if it exists
    if (idea.cover_img) {
      try {
        const filePath = extractFilePathFromUrl(idea.cover_img);
        if (filePath) {
          await deleteImage(filePath);
        }
      } catch (deleteError) {
        // Log but don't fail the deletion if image removal fails
        console.warn("Failed to delete cover image:", deleteError);
      }
    }

    // Delete the idea
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
