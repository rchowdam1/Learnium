/**
 * Single source of truth for Study Buddy upload allowlist.
 * Keep in sync with storage.buckets.allowed_mime_types and the file input accept=.
 */

export type FileCategory =
  | "document"
  | "image"
  | "audio"
  | "video"
  | "text"
  | "unknown";

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  json: "application/json",
  html: "text/html",
  htm: "text/html",
  rtf: "application/rtf",
  epub: "application/epub+zip",
  xml: "application/xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  heic: "image/heic",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  webm: "audio/webm",
  aac: "audio/aac",
  flac: "audio/flac",
  mp4: "video/mp4",
  mov: "video/quicktime",
  // code / notes
  js: "text/plain",
  ts: "text/plain",
  tsx: "text/plain",
  jsx: "text/plain",
  py: "text/plain",
  java: "text/plain",
  c: "text/plain",
  cpp: "text/plain",
  h: "text/plain",
  go: "text/plain",
  rs: "text/plain",
  rb: "text/plain",
  php: "text/plain",
  sql: "text/plain",
  yaml: "text/plain",
  yml: "text/plain",
  toml: "text/plain",
  ini: "text/plain",
  log: "text/plain",
  css: "text/plain",
};

/** Extensions shown in the file picker accept attribute. */
export const ACCEPTED_EXTENSIONS = Object.keys(EXT_TO_MIME);

/** accept= value for <input type="file"> */
export const ACCEPTED_TYPES_ATTR = ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(
  ",",
);

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function mimeOfFile(file: { name: string; type?: string }): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  return EXT_TO_MIME[extOf(file.name)] || "application/octet-stream";
}

export function isAllowedFile(file: { name: string; type?: string }): boolean {
  const ext = extOf(file.name);
  if (EXT_TO_MIME[ext]) return true;
  const mime = file.type || "";
  if (mime.startsWith("text/")) return true;
  if (mime.startsWith("image/") || mime.startsWith("audio/") || mime.startsWith("video/")) {
    return Object.values(EXT_TO_MIME).includes(mime);
  }
  return Object.values(EXT_TO_MIME).includes(mime);
}

export function categoryOfFile(file: { name: string; type?: string }): FileCategory {
  const mime = mimeOfFile(file);
  const ext = extOf(file.name);
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif", "bmp", "heic"].includes(ext))
    return "image";
  if (mime.startsWith("audio/") || ["mp3", "wav", "m4a", "ogg", "aac", "flac"].includes(ext))
    return "audio";
  if (mime.startsWith("video/") || ["mp4", "mov", "webm"].includes(ext))
    return "video";
  if (
    mime.startsWith("text/") ||
    ["txt", "md", "csv", "json", "html", "xml"].includes(ext) ||
    mime === "application/json"
  )
    return "text";
  if (
    ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "rtf", "epub"].includes(ext) ||
    mime === "application/pdf" ||
    mime.includes("wordprocessingml") ||
    mime.includes("presentationml") ||
    mime.includes("spreadsheetml")
  )
    return "document";
  return "unknown";
}

/** Categories that need server-side DeepSeek multimodal extraction. */
export function needsServerExtract(file: { name: string; type?: string }): boolean {
  const cat = categoryOfFile(file);
  return cat === "image" || cat === "audio" || cat === "video";
}
