import { createClient } from "@supabase/supabase-js";

export async function deleteUser(userId: string) {
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.log("Error deleting user", error.message);
    return false;
  }

  return true;
}

export async function createProfile(userId: string, username: string) {
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.from("profile").insert({
    id: userId,
    username: username,
    is_subscribed: false,
  });

  if (error) {
    console.log("Error inserting into profile table", error);
    return;
  }
}
