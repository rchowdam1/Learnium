import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { freeOpenRouterModel } from "@/lib/openrouter";
import OpenAI from "openai";
import { MAX_FILE_BYTES } from "@/lib/ingest/limits";
import { isAllowedFile, mimeOfFile, needsServerExtract } from "@/lib/ingest/allowed-types";

export const maxDuration = 300;

/**
 * Server multimodal extract via OpenRouter (DeepSeek / configured models).
 * Client sends the raw file; returns plain text for client-side chunk+embed.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Expected multipart form data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "file is required" },
      { status: 400 },
    );
  }

  if (!isAllowedFile(file) || !needsServerExtract(file)) {
    return NextResponse.json(
      {
        success: false,
        message: "extract-media is only for images, audio, and video",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { success: false, message: "File too large" },
      { status: 400 },
    );
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { success: false, message: "OPENROUTER_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const mimeType = mimeOfFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const b64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${b64}`;

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: key,
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "Learnium Media Extract",
    },
  });

  try {
    const isImage = mimeType.startsWith("image/");
    // Prefer vision model env; fall back to main model (DeepSeek V4 Flash)
    const model = isImage
      ? freeOpenRouterModel("OPENROUTER_VISION_MODEL")
      : freeOpenRouterModel("OPENROUTER_AUDIO_MODEL");

    const prompt = isImage
      ? "Extract all readable text and describe any diagrams or study-relevant content in detail for a student knowledge base. Return plain text only."
      : "Transcribe and summarize the spoken/educational content for a student knowledge base. Return plain text only.";

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            isImage
              ? {
                  type: "image_url",
                  image_url: { url: dataUrl },
                }
              : {
                  type: "text",
                  text: `Media file: ${file.name} (${mimeType}). Base64 length ${b64.length}. If you cannot decode audio/video binary here, say so clearly.`,
                },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    if (!text) {
      return NextResponse.json(
        { success: false, message: "Empty extract from model" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      text,
      mimeType,
      sourceType: isImage ? "image" : mimeType.startsWith("video/") ? "video" : "audio",
    });
  } catch (err) {
    console.error("extract-media:", err);
    return NextResponse.json(
      {
        success: false,
        message:
          err instanceof Error ? err.message : "Media extraction failed",
      },
      { status: 502 },
    );
  }
}
