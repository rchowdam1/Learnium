import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { deleteUser } from "@/lib/admin";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ success: false, error: "Unauthorized" });
  }

  const userId = user.id;

  // delete the profile associated with the user id
  const { error: deleteError } = await supabase
    .from("profile")
    .delete()
    .eq("id", userId);

  if (deleteError) {
    console.log("Failed to delete profile:", deleteError);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  // perform deletion, sign out first
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.log("Failed to delete user because of signing out.");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const success = await deleteUser(userId);

  if (!success) {
    console.log("Failed to delete user.");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  console.log("Successfully deleted user");
  return NextResponse.json({ success: true });
}
