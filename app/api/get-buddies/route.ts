import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

type StudyBuddy = {
  id: number;
  created_at: string;
  profile_id: string;
  bot_name: string; // bot_name
  description: string;
  category: string;
};

type Document = {
  id: number;
  studyBuddyId: number;
  name: string;
  size: number;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User is not logged in");
    return NextResponse.json(
      { error: "User is not logged in" },
      { status: 500 },
    );
  }

  // fetch the study buddies (an array)
  const { data: buddyData, error: buddyError } = await supabase
    .from("study_bots")
    .select("*")
    .eq("profile_id", user?.id);

  if (buddyError) {
    console.log("Could not retrieve study buddies");
    return NextResponse.json(
      {
        error: "Could not retrieve study buddies",
      },
      {
        status: 400,
      },
    );
  }

  // get the study buddies
  /**
   * The data returned will be an array of these attributes
   * - id
   * - created_at
   * - profile_id
   * - bot_name (title)
   * - description
   * - category
   */

  // get the documents' metadata for each study buddy
  // documents will be an array

  const documents: Document[][] = [];

  for (const buddy of buddyData as StudyBuddy[]) {
    // each buddy's documents will be in the same order the buddies
    // each study buddy will have multiple documents
    const { data: documentData, error: documentError } = await supabase
      .from("study_bot_documents")
      .select("*")
      .eq("study_bot_id", buddy.id);

    if (documentError) {
      console.log(`Could not retrieve documents for buddy ${buddy.id}`);
      return NextResponse.json(
        {
          error: `Could not retrieve documents for buddy ${buddy.id}`,
        },
        {
          status: 400,
        },
      );
    }

    const buddyDocuments: Document[] = [];

    for (const document of documentData) {
      buddyDocuments.push({
        id: document.id,
        studyBuddyId: document.study_bot_id,
        name: document.document_name,
        size: document.document_size,
      });
    }

    documents.push(buddyDocuments);
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        buddyData: buddyData as StudyBuddy[],
        documentData: documents as Document[][],
      },
    },
    { status: 200 },
  );
}
