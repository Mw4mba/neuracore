import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { uploadAvatar, deleteImage, extractFilePathFromUrl } from "@/lib/storage/image-upload";

export async function POST(req: NextRequest) {
  try {
    // Create Supabase client with cookie-based session
    const supabase = await createClient();
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const avatarFile = formData.get("avatar") as File | null;

    if (!avatarFile || !(avatarFile instanceof File)) {
      return NextResponse.json(
        { error: "Avatar file is required" },
        { status: 400 }
      );
    }

    // Get current profile to check for existing avatar
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      try {
        const oldFilePath = extractFilePathFromUrl(profile.avatar_url);
        if (oldFilePath) {
          await deleteImage(oldFilePath);
        }
      } catch (deleteError) {
        // Log but don't fail if old image deletion fails
        console.warn("Failed to delete old avatar:", deleteError);
      }
    }

    // Upload new avatar
    let uploadResult;
    try {
      uploadResult = await uploadAvatar(avatarFile, user.id);
    } catch (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError instanceof Error ? uploadError.message : "Failed to upload avatar" },
        { status: 400 }
      );
    }

    // Update profile with new avatar URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: uploadResult.url })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      
      // Try to clean up uploaded file
      try {
        await deleteImage(uploadResult.path);
      } catch (cleanupError) {
        console.warn("Failed to cleanup uploaded file:", cleanupError);
      }

      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Avatar updated successfully",
      data: {
        avatar_url: uploadResult.url,
        profile: updatedProfile,
      },
    });
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Create Supabase client with cookie-based session
    const supabase = await createClient();
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // Delete avatar file if exists
    if (profile?.avatar_url) {
      try {
        const filePath = extractFilePathFromUrl(profile.avatar_url);
        if (filePath) {
          await deleteImage(filePath);
        }
      } catch (deleteError) {
        console.warn("Failed to delete avatar file:", deleteError);
      }
    }

    // Remove avatar URL from profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: "Failed to remove avatar" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Avatar removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing avatar:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
