import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // get the set id from the request
  const body: { setId: string } = await request.json();

  if (!body.setId) {
    return NextResponse.json(
      {
        success: false,
        error: "Set ID is required",
      },
      { status: 400 }
    );
  }

  // mark the set as complete

  console.log(body);

  const { data: updateSetData, error: updateSetError } = await supabase
    .from("sets")
    .update({
      completed: true,
      completed_at: new Date().toISOString().split("T")[0] /**Current Date */,
    })
    .eq("id", body.setId)
    .select()
    .single();

  if (updateSetError) {
    console.log("Could not mark the set as complete:", updateSetError);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  // if reached here, then success
  // 7/17 call this endpoint in sets/[setId]/page.tsx and show success to the user, then redirect to the dashboard
  // make sure that dashboard only shows sets that are not completed
  return NextResponse.json(
    {
      success: true,
      message: "Set marked as complete",
    },
    { status: 200 }
  );
}
