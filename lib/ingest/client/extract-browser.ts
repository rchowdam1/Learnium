"use client";

import JSZip from "jszip";
import {
  categoryOfFile,
  mimeOfFile,
  needsServerExtract,
  extOf,
} from "../allowed-types";

export type BrowserExtracted = {
  text: string;
  sourceType: string;
  mimeType: string;
  warnings: string[];
  needsServerExtract: boolean;
};

/**
 * Client-side text extraction for office/text/PDF.
 * Images/audio/video return needsServerExtract=true (DeepSeek path).
 */
export async function extractInBrowser(file: File): Promise<BrowserExtracted> {
  const mimeType = mimeOfFile(file);
  const ext = extOf(file.name);
  const warnings: string[] = [];

  if (needsServerExtract(file)) {
    return {
      text: "",
      sourceType: categoryOfFile(file),
      mimeType,
      warnings: ["Multimodal file — server extract required"],
      needsServerExtract: true,
    };
  }

  const buffer = await file.arrayBuffer();

  try {
    if (mimeType === "application/pdf" || ext === "pdf") {
      const text = await extractPdfBrowser(buffer);
      return {
        text,
        sourceType: "pdf",
        mimeType,
        warnings: text.trim()
          ? warnings
          : [
              ...warnings,
              "PDF had little extractable text (may be scanned).",
            ],
        needsServerExtract: false,
      };
    }

    if (
      mimeType.includes("wordprocessingml") ||
      ext === "docx" ||
      ext === "doc"
    ) {
      if (ext === "doc") {
        warnings.push("Legacy .doc is best-effort; prefer .docx.");
      }
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return {
        text: result.value || "",
        sourceType: "docx",
        mimeType,
        warnings: [...warnings, ...(result.messages?.map((m) => m.message) || [])],
        needsServerExtract: false,
      };
    }

    if (
      mimeType.includes("presentationml") ||
      ext === "pptx" ||
      ext === "ppt"
    ) {
      const text = await extractPptxBrowser(buffer);
      return {
        text,
        sourceType: "pptx",
        mimeType,
        warnings,
        needsServerExtract: false,
      };
    }

    if (
      mimeType.includes("spreadsheetml") ||
      ext === "xlsx" ||
      ext === "xls"
    ) {
      const text = await extractXlsxBrowser(buffer);
      return {
        text,
        sourceType: "xlsx",
        mimeType,
        warnings,
        needsServerExtract: false,
      };
    }

    // Text / code / json / html
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    return {
      text,
      sourceType: "text",
      mimeType,
      warnings,
      needsServerExtract: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      text: "",
      sourceType: "error",
      mimeType,
      warnings: [message],
      needsServerExtract: false,
    };
  }
}

async function extractPdfBrowser(buffer: ArrayBuffer): Promise<string> {
  // Dynamic import — pdfjs worker configured for browser
  const pdfjs = await import("pdfjs-dist");
  // Use CDN worker to avoid bundler path pain in Next
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    if (pageText.trim()) parts.push(pageText);
  }
  return parts.join("\n\n");
}

async function extractPptxBrowser(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const texts: string[] = [];
  for (const name of slideFiles) {
    const xml = await zip.files[name].async("string");
    const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    const slideText = matches
      .map((m) => m.replace(/<[^>]+>/g, ""))
      .join(" ")
      .trim();
    if (slideText) texts.push(slideText);
  }
  return texts.join("\n\n");
}

async function extractXlsxBrowser(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const shared: string[] = [];
  const sharedFile = zip.file("xl/sharedStrings.xml");
  if (sharedFile) {
    const xml = await sharedFile.async("string");
    const matches = xml.match(/<t[^>]*>([^<]*)<\/t>/g) || [];
    for (const m of matches) {
      shared.push(m.replace(/<[^>]+>/g, ""));
    }
  }
  // Prefer shared strings as a rough text dump for RAG
  if (shared.length > 0) return shared.join(" ");

  const sheet = zip.file("xl/worksheets/sheet1.xml");
  if (sheet) {
    const xml = await sheet.async("string");
    const matches = xml.match(/<v>([^<]*)<\/v>/g) || [];
    return matches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ");
  }
  return "";
}
