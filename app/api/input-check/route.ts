import { NextResponse } from "next/server";
import { franc } from "franc";
import OpenAI from "openai";
import { zodTextFormat, zodResponseFormat } from "openai/helpers/zod";
import { zOutputSchema } from "@/app/schema/OutputSchema";
import { z } from "zod";
import { createClient } from "@/lib/server";
import { createSet } from "@/actions/dbops";

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
      }
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
      }
    );
  }

  if (/(.{3,})\1{1,}/i.test(description)) {
    return NextResponse.json(
      {
        error: "Description contains repeating words",
      },
      {
        status: 200,
      }
    );
  }

  // openai key, env file,

  // system prompt
  const systemPrompt: string = `You are a very knowledgeable teacher and specialize in providing microlearning sets
  that usually consist of 3-5 lessons and a quiz for each lesson. Each lesson consists of 3-5 paragraphs and a title related to the paragraphs.
  The title of the lesson is shared with the quiz, and the quiz consists of 3-5 questions with 4 options each.
  Feel free to generate as many lessons as you see fit, as long as it's within the range of 3-5 lessons.
  You will be given a description of the topic from the user, and you will generate a set of lessons based on that. If the
  description given by the user is not plausible, or contains illegal or unethical content, do not generate
  any lessons and set "flagged" as true. If "flagged" is true, then set all of the properties as empty strings. As you're generating the lessons, make sure that
  the lessons are related to the description and are easily digestible by the user`;

  /*const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `The description given is "${data.description}". Generate the microlearning set`,
      },
    ],
    temperature: 0.7,
    response_format: zodResponseFormat(zOutputSchema, "output_schema"),
  });*/

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

  //const parsedResponse = response.choices[0].message.content as OutputSchema;

  const parsedResponse = response.output_parsed;
  console.log(
    parsedResponse
    /*`| this response used ${response.usage?.total_tokens}, with ${response.usage?.prompt_tokens} prompt tokens and ${response.usage?.completion_tokens} completion tokens`*/
  );

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      { status: 200 }
    );
  }

  // create the sets
  if (parsedResponse) {
    const title = data.title;
    const description = data.description;
    const category = data.category;
    console.log(createSet(parsedResponse, title, description, category));
  }

  return NextResponse.json(
    {
      parsedResponse,
    },
    {
      status: 200,
    }
  );
}
