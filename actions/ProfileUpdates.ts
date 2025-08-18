import { createClient } from "@/lib/server";

export async function decrementRequests() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    // user is not logged in
    console.log("User is not logged in");
    return { success: false, message: "User is not logged in" };
  }

  // get the user's profile using logged in user's id
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (profileError) {
    console.log("Could not retrieve profile");
    return { success: false, message: "Could not retrieve profile" };
  }

  // update sets_remaining
  let remainingSets = profileData.sets_remaining;

  if (remainingSets > 0) {
    remainingSets -= 1;
  } else {
    // user has no more remaining set requests
    console.log("User does not have any set requests remaining");
    return {
      success: false,
      message: "User does not have any set requests remaining",
    };
  }

  const { error: profileUpdateError } = await supabase
    .from("profile")
    .update({ sets_remaining: remainingSets })
    .eq("id", user?.id);

  if (profileUpdateError) {
    console.log("Could not update user's requests");
    return { success: false, message: "Could not update the user's requests" };
  }

  return { success: true }; // this means we have successfully updated the user's sets_remaining
}

export async function resetSets() {
  // resets sets_remaining if necessary
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User is not logged in");
    return { success: false, message: "User is not logged in" };
  }

  // check if user is subscribed or not
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (profileError) {
    console.log("Could not retrieve profile");
    return { success: false, message: "Could not retrieve profile" };
  }

  if (profileData.is_subscribed) {
    // reset 'sets_remaining' to 5
    const { error: setRequestUpdateError } = await supabase
      .from("profile")
      .update({ sets_remaining: 5 })
      .eq("id", user?.id);

    if (setRequestUpdateError) {
      console.log("Failed to reset the user's set request");
      return {
        success: false,
        message: "Failed to reset the user's set request",
      };
    }
  } else {
    // reset 'sets_remaning' to 1
    const { error: setRequestUpdateError } = await supabase
      .from("profile")
      .update({ sets_remaining: 1 })
      .eq("id", user?.id);

    if (setRequestUpdateError) {
      console.log("Failed to reset the user's set request");
      return {
        success: false,
        message: "Failed to reset the user's set request",
      };
    }
  }

  // if this point has been reached, success
  return { success: true };
}

export async function updateSetResetDate() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User is not logged in");
    return { success: false, message: "User is not logged in" };
  }

  // set the 'sets_refresh_at' to the day after the current day
  let date = new Date(new Date().toISOString().split("T")[0]); // current day in YYYY-MM-DD format
  date.setDate(date.getDate() + 1); // next day in YYYY-MM-DD format

  const { error: setRequestUpdateError } = await supabase
    .from("profile")
    .update({ sets_refresh_at: date.toISOString() })
    .eq("id", user?.id);

  if (setRequestUpdateError) {
    console.log("Could not update the set refresh date");
    return { success: false, message: "Could not update the set refresh date" };
  }

  return { success: true };
}
