import { NextResponse } from "next/server";
import { franc } from "franc";
import OpenAI from "openai";
import { zodTextFormat, zodResponseFormat } from "openai/helpers/zod";
import { zOutputSchema } from "@/app/schema/OutputSchema";
import { z } from "zod";
import { createClient } from "@/lib/server";
import { createSet } from "@/actions/dbops";
import {
  decrementRequests,
  resetSets,
  updateSetResetDate,
} from "@/actions/ProfileUpdates";
import { profile } from "console";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type OutputSchema = z.infer<typeof zOutputSchema>;

export async function POST(request: Request) {
  const data = await request.json();

  // heuristic regex checks

  const description = data.description.trim();

  // check if description contains any vowels
  if (!/[aeiou]{1,}/i.test(description)) {
    return NextResponse.json(
      {
        error: "Description doesn't contain a vowel",
      },
      {
        status: 200,
      },
    );
  }

  // check if description contains too many consonants
  if (/[^aeiou]{7,}/i.test(description)) {
    return NextResponse.json(
      {
        error: "Description contains 7 or more consective consonants",
      },
      {
        status: 200,
      },
    );
  }

  if (/(.{3,})\1{1,}/i.test(description)) {
    return NextResponse.json(
      {
        error: "Description contains repeating words",
      },
      {
        status: 200,
      },
    );
  }

  // check if user has remaning set requests
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (profileError) {
    console.log("Could not retrieve profile");
    return NextResponse.json(
      { error: "Could not retrieve profile" },
      {
        status: 200,
      },
    );
  }

  // if 'sets_refresh_at' is null (such as when the user makes a set for the first time), set the value the next today
  if (profileData.sets_refresh_at === null) {
    const result = await updateSetResetDate(); // 'sets_remaining' is still 1
    if (result.success === false) {
      console.log("Could not update the set reset date");
    }
  }

  // if 'sets_remaining' == 0 and 'sets_refresh_at' <= today, then call resetSets()
  const today = new Date().toISOString().split("T")[0];

  const setsRefreshAt = profileData.sets_refresh_at
    ? profileData.sets_refresh_at.split("T")[0]
    : null;
  console.log("The set refresh date is", setsRefreshAt);

  if (
    profileData.sets_remaining === 0 &&
    setsRefreshAt &&
    setsRefreshAt <= today
  ) {
    // if it's past the refresh date, reset the set requests
    let result = await updateSetResetDate();
    if (result.success === false) {
      return NextResponse.json(
        { error: "Could not update the reset date" },
        { status: 200 },
      );
    }

    // result.success == true
    result = await resetSets();

    if (result.success === false) {
      return NextResponse.json(
        { error: "Could not reset the remaining set requests" },
        { status: 200 },
      );
    }

    // result.success == true
  }

  // at this point before the LLM API call has been made, we need to update the remaining requests of the user accordingly
  const result = await decrementRequests();
  if (result.success === false) {
    // check if user does not have any requests remaining

    if (result.message === "User does not have any set requests remaining") {
      return NextResponse.json({ error: result.message }, { status: 200 });
    }

    return NextResponse.json(
      {
        error: "An error occurred while trying to decrease 'sets_remaining'",
      },
      {
        status: 200,
      },
    );
  }

  // temporary code, used for debugging
  if (result.success === true) {
    console.log(
      "Should have successfully decremented the user's remaining set requests",
    );
    // ok so this worked for the ocean set but not for the aws set
    // next, try to reset the set requests for rithiknchowdam and if it does not work then debug
  }

  // system prompt
  const systemPrompt: string = `You are a very knowledgeable teacher and specialize in providing microlearning sets
  that usually consist of 3-5 lessons and a quiz for each lesson. Each lesson consists of 3-5 paragraphs and a title related to the paragraphs.
  The title of the lesson is shared with the quiz, and the quiz consists of 3-5 questions with 4 options each.
  Feel free to generate as many lessons as you see fit, as long as it's within the range of 3-5 lessons.
  You will be given a description of the topic from the user, and you will generate a set of lessons based on that. If the
  description given by the user is not plausible, or contains illegal or unethical content, do not generate
  any lessons and set "flagged" as true. If "flagged" is true, then set all of the properties as empty strings. As you're generating the lessons, make sure that
  the lessons are related to the description and are easily digestible by the user`;

  const response = await openai.responses.parse({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `The description given is "${data.description}". Generate the microlearning set`,
      },
    ],
    text: {
      format: zodTextFormat(zOutputSchema, "output_schema"),
    },
  });

  const parsedResponse = response.output_parsed;
  console.log(
    parsedResponse,
    /*`| this response used ${response.usage?.total_tokens}, with ${response.usage?.prompt_tokens} prompt tokens and ${response.usage?.completion_tokens} completion tokens`*/
  );

  if (parsedResponse && parsedResponse.flagged) {
    // add to the flagged table

    const { error } = await supabase.from("flagged").insert({
      profile_id: user?.id,
      profile_email: user?.email,
      query: data.description,
    });

    if (error) {
      console.log("Flagged Response, but couldn't add it to db");
    }

    return NextResponse.json(
      { error: "Could not process your request" },
      { status: 200 },
    );
  }

  let numLessons = 0;
  // create the sets
  if (parsedResponse) {
    const title = data.title;
    const description = data.description;
    const category = data.category;
    const result = await createSet(
      parsedResponse,
      title,
      description,
      category,
    );

    if (result === false) {
      return NextResponse.json(
        {
          success: false,
          message: "Set creation in the database was unsuccessful",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      parsedResponse,
      setId: result.id,
    });
  }

  return NextResponse.json(
    {
      parsedResponse,
    },
    {
      status: 200,
    },
  );
}
