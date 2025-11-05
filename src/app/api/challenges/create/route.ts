
import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json();

    const {
      company,
      title,
      // category,
      difficulty,
      description,
      objectives,
      requirements,
      judging_criteria,
      prize,
      deadline,
      max_participants,
      tags,
      created_by,
    } = body;

    const { data, error } = await supabase
      .from("challenges")
      .insert([
        {
          company,
          title,
          // category,
          difficulty,
          description,
          objectives,
          requirements,
          judging_criteria,
          prize,
          deadline,
          max_participants,
          tags,
          created_by,
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