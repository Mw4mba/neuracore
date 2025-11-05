import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      company,
      title,
      category,
      difficulty,
      description,
      objectives,
      requirements,
      judging_criteria,
      prize,
      deadline,
      max_participants,
      tags,
    } = await req.json();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("challenges")
      .insert([
        {
          company,
          title,
          category,
          difficulty,
          description,
          objectives,
          requirements,
          judging_criteria,
          prize,
          deadline,
          max_participants,
          tags,
          created_by: user.id, // ✅ securely assign user ID
        },
      ])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
