// app/api/comments/total/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("author", user.id); 

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ totalComments: count || 0 });
  } catch (err: any) {
    console.error("Error fetching total comments:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
