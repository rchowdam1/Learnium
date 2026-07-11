import { createClient } from "@/lib/server";

/**
 * Atomically decrement the user's sets_remaining by 1.
 * Uses the consume_set_quota RPC which guards against going below zero
 * and is atomic (no read-then-write race).
 *
 * @deprecated Prefer calling consume_set_quota RPC directly in route handlers
 *   so quota can be consumed AFTER successful persistence. This function
 *   exists for backward compatibility with routes that haven't been reordered yet.
 */
export async function decrementRequests() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("User is not logged in");
    return { success: false, message: "User is not logged in" };
  }

  const { data: quotaOk, error: rpcError } = await supabase.rpc(
    "consume_set_quota",
  );

  if (rpcError) {
    console.error("consume_set_quota RPC error:", rpcError.message);
    return { success: false, message: "Could not decrement quota" };
  }

  if (!quotaOk) {
    return {
      success: false,
      message: "User does not have any set requests remaining",
    };
  }

  return { success: true };
}

export async function resetSets() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("User is not logged in");
    return { success: false, message: "User is not logged in" };
  }

  // Fetch subscription status
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("is_subscribed")
    .eq("id", user.id)
    .single();

  if (profileError || !profileData) {
    console.log("Could not retrieve profile");
    return { success: false, message: "Could not retrieve profile" };
  }

  const newQuota = profileData.is_subscribed ? 5 : 1;

  const { error: updateError } = await supabase
    .from("profile")
    .update({ sets_remaining: newQuota })
    .eq("id", user.id);

  if (updateError) {
    console.log("Failed to reset the user's set requests");
    return { success: false, message: "Failed to reset the user's set requests" };
  }

  return { success: true };
}

export async function updateSetResetDate() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("User is not logged in");
    return { success: false, message: "User is not logged in" };
  }

  // Set the sets_refresh_at to the day after the current day
  const date = new Date(new Date().toISOString().split("T")[0]);
  date.setDate(date.getDate() + 1);

  const { error: setRequestUpdateError } = await supabase
    .from("profile")
    .update({ sets_refresh_at: date.toISOString() })
    .eq("id", user.id);

  if (setRequestUpdateError) {
    console.log("Could not update the set refresh date");
    return { success: false, message: "Could not update the set refresh date" };
  }

  return { success: true };
}
