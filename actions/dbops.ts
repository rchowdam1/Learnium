import { OutputSchema } from "@/app/schema/OutputSchema";
import { createClient } from "@/lib/server";
import { persistSetMeta } from "@/lib/sets/persist-set-meta";

/**
 * Create a set with its full graph (lessons, paragraphs, quizzes, questions, options)
 * in a single atomic transaction via the create_set_graph Postgres RPC.
 *
 * The RPC uses auth.uid() for profile_id — no caller-controlled user_id.
 * On any mid-insert failure, the entire graph rolls back.
 * Depth/sources/pass meta are patched after insert (see persistSetMeta).
 */
export async function createSet(
  parsedResponse: OutputSchema,
  title: string,
  description: string,
  category: string,
): Promise<false | { id: number; lessonCount: number }> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.log("Could not retrieve authenticated user in actions");
    return false;
  }

  const graphData = {
    title,
    description,
    category,
    lessons: parsedResponse.lessons,
    quizzes: parsedResponse.quizzes,
  };

  const { data: setId, error: rpcError } = await supabase.rpc(
    "create_set_graph_with_quota",
    { graph_data: graphData },
  );

  if (rpcError || !setId) {
    console.error("create_set_graph RPC failed:", rpcError?.message);
    return false;
  }

  const id = Number(setId);
  await persistSetMeta(supabase, id, parsedResponse);

  return {
    id,
    lessonCount: parsedResponse.lessons.length,
  };
}

export async function createBuddy(
  title: string,
  description: string,
  category: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.log("Could not retrieve authenticated user in actions");
    return false;
  }

  // create the buddy
  const { data: buddy, error: createBuddyError } = await supabase
    .from("study_bots")
    .insert({
      profile_id: user?.id,
      bot_name: title,
      description: description,
      category: category,
    })
    .select()
    .single();

  if (createBuddyError) {
    console.log("Error creating study buddy");
    return false;
  }

  return { id: buddy.id };
}

export async function storeBuddyDocuments(buddyId: number, files: File[]) {
  const supabase = await createClient();

  for (const file of files) {
    const { data, error: uploadError } = await supabase
      .from("study_bot_documents")
      .insert({
        study_bot_id: buddyId,
        document_name: file.name,
        document_size: file.size,
      });

    if (uploadError) {
      console.log(`Error storing document ${file.name} for buddy ${buddyId}`);
      return false;
    }
  }

  return true;
}
