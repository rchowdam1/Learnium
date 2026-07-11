import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import JSZip from "jszip";
import OpenAI from "openai";

export type ExtractedDocument = {
  text: string;
  sourceType: string;
  mimeType: string;
  warnings: string[];
};

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "tsv",
  "json",
  "xml",
  "html",
  "htm",
  "css",
  "js",
  "ts",
  "tsx",
  "jsx",
  "py",
  "java",
  "c",
  "cpp",
  "h",
  "go",
  "rs",
  "rb",
  "php",
  "sql",
  "yaml",
  "yml",
  "toml",
  "ini",
  "log",
  "rtf",
]);

const IMAGE_MIME_PREFIX = "image/";
const AUDIO_MIME_PREFIX = "audio/";
const VIDEO_MIME_PREFIX = "video/";

function getOpenRouter(): OpenAI | null {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: key,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "Learnium Ingest",
    },
  });
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function mimeOf(file: File): string {
  if (file.type) return file.type;
  const ext = extOf(file.name);
  const map: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    webm: "audio/webm",
    mp4: "video/mp4",
  };
  return map[ext] || "application/octet-stream";
}

/**
 * Extract searchable text from any supported browser-uploaded file.
 */
export async function extractFromFile(file: File): Promise<ExtractedDocument> {
  const mimeType = mimeOf(file);
  const ext = extOf(file.name);
  const warnings: string[] = [];
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (mimeType === "application/pdf" || ext === "pdf") {
      const text = await extractPdf(buffer);
      return {
        text,
        sourceType: "pdf",
        mimeType,
        warnings: text.trim()
          ? warnings
          : [
              ...warnings,
              "PDF had little/no extractable text (may be scanned). Try an image OCR upload of key pages.",
            ],
      };
    }

    if (
      mimeType.includes("wordprocessingml") ||
      ext === "docx" ||
      ext === "doc"
    ) {
      if (ext === "doc") {
        warnings.push(
          ".doc (legacy) support is limited; prefer .docx for best results.",
        );
      }
      const text = await extractDocx(buffer);
      return { text, sourceType: "docx", mimeType, warnings };
    }

    if (
      mimeType.includes("presentationml") ||
      ext === "pptx" ||
      ext === "ppt"
    ) {
      const text = await extractPptx(buffer);
      return { text, sourceType: "pptx", mimeType, warnings };
    }

    if (
      mimeType.includes("spreadsheetml") ||
      ext === "xlsx" ||
      ext === "xls"
    ) {
      const text = await extractXlsx(buffer);
      return { text, sourceType: "xlsx", mimeType, warnings };
    }

    if (
      mimeType.startsWith(IMAGE_MIME_PREFIX) ||
      ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(ext)
    ) {
      const text = await extractImage(buffer, mimeType, file.name);
      return { text, sourceType: "image", mimeType, warnings };
    }

    if (
      mimeType.startsWith(AUDIO_MIME_PREFIX) ||
      ["mp3", "wav", "m4a", "ogg", "flac", "aac", "webm"].includes(ext)
    ) {
      const text = await extractAudio(buffer, mimeType, file.name);
      return { text, sourceType: "audio", mimeType, warnings };
    }

    if (
      mimeType.startsWith(VIDEO_MIME_PREFIX) ||
      ["mp4", "mov", "mkv"].includes(ext)
    ) {
      const text = await extractAudio(buffer, mimeType, file.name);
      return {
        text,
        sourceType: "video",
        mimeType,
        warnings: [
          ...warnings,
          "Video: attempting audio/transcript extraction only (no frame OCR).",
        ],
      };
    }

    if (
      mimeType.startsWith("text/") ||
      TEXT_EXTENSIONS.has(ext) ||
      mimeType === "application/json" ||
      mimeType === "application/xml"
    ) {
      const text = buffer.toString("utf8");
      return { text, sourceType: "text", mimeType, warnings };
    }

    // Last resort: try UTF-8 decode
    const asText = buffer.toString("utf8");
    const printableRatio =
      asText.replace(/[\x09\x0a\x0d\x20-\x7e]/g, "").length / Math.max(asText.length, 1);
    if (printableRatio < 0.15 && asText.trim().length > 20) {
      return { text: asText, sourceType: "text", mimeType, warnings };
    }

    return {
      text: "",
      sourceType: "unknown",
      mimeType,
      warnings: [
        `Unsupported or binary file type (${mimeType || ext || "unknown"}). Convert to PDF, text, image, or audio.`,
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      text: "",
      sourceType: "error",
      mimeType,
      warnings: [`Failed to extract ${file.name}: ${message}`],
    };
  }
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return (result.text || "").trim();
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || "").trim();
}

async function extractPptx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/i.test(p))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)/i)?.[1] || 0);
      const nb = Number(b.match(/slide(\d+)/i)?.[1] || 0);
      return na - nb;
    });

  const parts: string[] = [];
  for (const path of slideFiles) {
    const xml = await zip.files[path].async("string");
    const texts = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map(
      (m) => m[1],
    );
    const slideText = texts.join(" ").replace(/\s+/g, " ").trim();
    if (slideText) {
      const n = path.match(/slide(\d+)/i)?.[1] || "?";
      parts.push(`Slide ${n}: ${slideText}`);
    }
  }

  // Notes
  const noteFiles = Object.keys(zip.files).filter((p) =>
    /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(p),
  );
  for (const path of noteFiles) {
    const xml = await zip.files[path].async("string");
    const texts = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map(
      (m) => m[1],
    );
    const noteText = texts.join(" ").replace(/\s+/g, " ").trim();
    if (noteText) parts.push(`Notes: ${noteText}`);
  }

  return parts.join("\n\n").trim();
}

async function extractXlsx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const shared: string[] = [];
  const sharedXml = zip.files["xl/sharedStrings.xml"];
  if (sharedXml) {
    const xml = await sharedXml.async("string");
    for (const m of xml.matchAll(/<t[^>]*>([^<]*)<\/t>/g)) {
      shared.push(m[1]);
    }
  }

  const sheetPaths = Object.keys(zip.files)
    .filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(p))
    .sort();

  const parts: string[] = [];
  for (const path of sheetPaths) {
    const xml = await zip.files[path].async("string");
    const cells: string[] = [];
    for (const m of xml.matchAll(
      /<c[^>]*t="s"[^>]*>\s*<v>(\d+)<\/v>|<c[^>]*>\s*<v>([^<]*)<\/v>/g,
    )) {
      if (m[1] !== undefined) {
        const idx = Number(m[1]);
        if (shared[idx]) cells.push(shared[idx]);
      } else if (m[2]) {
        cells.push(m[2]);
      }
    }
    const sheetName = path.match(/sheet(\d+)/i)?.[1] || "?";
    const text = cells.join(" | ").trim();
    if (text) parts.push(`Sheet ${sheetName}: ${text}`);
  }

  return parts.join("\n\n").trim();
}

async function extractImage(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const client = getOpenRouter();
  if (!client) {
    return `[Image: ${fileName}] Vision extraction unavailable (missing OPENROUTER_API_KEY).`;
  }

  const model =
    process.env.OPENROUTER_VISION_MODEL ||
    process.env.OPENROUTER_MODEL ||
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

  const b64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${b64}`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are extracting study material from an image for a RAG knowledge base.
Transcribe ALL readable text verbatim. Then briefly describe diagrams, charts, equations, and visual structure.
File name: ${fileName}
Return plain text only.`,
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    return text || `[Image: ${fileName}] (no text extracted)`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `[Image: ${fileName}] Vision extraction failed: ${message}`;
  }
}

async function extractAudio(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const client = getOpenRouter();
  if (!client) {
    return `[Audio: ${fileName}] Transcription unavailable (missing OPENROUTER_API_KEY).`;
  }

  // Prefer OpenAI-compatible audio transcriptions via OpenRouter when available
  const transcriptionModel =
    process.env.OPENROUTER_TRANSCRIPTION_MODEL ||
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

  try {
    const file = new File([buffer], fileName, { type: mimeType });
    const result = await client.audio.transcriptions.create({
      file,
      model: transcriptionModel,
    });
    const text = (result as { text?: string }).text?.trim() || "";
    if (text) return text;
  } catch {
    // Fall through to multimodal chat if transcription endpoint fails
  }

  const chatModel =
    process.env.OPENROUTER_AUDIO_MODEL ||
    process.env.OPENROUTER_MODEL ||
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

  try {
    const b64 = buffer.toString("base64");
    const format = mimeType.includes("wav")
      ? "wav"
      : mimeType.includes("mp4") || mimeType.includes("m4a")
        ? "m4a"
        : "mp3";

    const completion = await client.chat.completions.create({
      model: chatModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Transcribe this audio file completely for a study knowledge base. Include spoken content verbatim. File: ${fileName}`,
            },
            // Multimodal audio part (OpenRouter / Gemini-compatible)
            {
              type: "input_audio",
              input_audio: { data: b64, format },
            } as never,
          ],
        },
      ],
      max_tokens: 4000,
    });
    const text = completion.choices[0]?.message?.content?.trim() || "";
    if (text) return text;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `[Audio: ${fileName}] Transcription failed: ${message}`;
  }

  return `[Audio: ${fileName}] No transcript produced.`;
}
