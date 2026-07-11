import { franc } from "franc";

/**
 * Map franc ISO 639-3 codes to PostgreSQL text search config names.
 * Only maps the configs actually shipped with PostgreSQL.
 * Falls back to 'english' for unsupported languages.
 */
const FRANC_TO_PG_TS_CONFIG: Record<string, string> = {
  // Germanic
  eng: "english",
  deu: "german",
  nld: "dutch",
  dan: "danish",
  swe: "swedish",
  nor: "norwegian",
  // Romance
  fra: "french",
  spa: "spanish",
  ita: "italian",
  por: "portuguese",
  ron: "romanian",
  // Slavic
  rus: "russian",
  // Finno-Ugric
  fin: "finnish",
  hun: "hungarian",
  // Turkic
  tur: "turkish",
  // Indo-Aryan
  hin: "hindi",
  // East Asian (PG doesn't have good CJK tsvector, fall back)
  // jpn, zho, kor -> no built-in PG config, keep 'english' for tokenization
  // Semitic
  ara: "arabic",
  // Celtic, Greek, etc.
  ell: "greek",
  gle: "irish",
  lit: "lithuanian",
};

export type DetectLanguageResult = {
  /** Franc ISO 639-3 code (e.g., 'eng', 'spa') or 'und' for undetermined */
  francCode: string;
  /** PostgreSQL text search config name (e.g., 'english', 'spanish') */
  pgConfig: string;
};

/**
 * Detect the language of a text using franc and map to a PostgreSQL
 * text search config name.
 *
 * Falls back to 'english' for short/unrecognized text.
 */
export function detectLanguage(text: string): DetectLanguageResult {
  const normalized = text.trim();
  if (normalized.length < 30) {
    // franc is unreliable on very short text; default to english
    return { francCode: "eng", pgConfig: "english" };
  }

  // Sample up to 2000 chars for performance — franc is O(n)
  const sample = normalized.slice(0, 2000);
  const code = franc(sample, { minLength: 3 });

  if (code === "und") {
    return { francCode: "und", pgConfig: "english" };
  }

  const pgConfig = FRANC_TO_PG_TS_CONFIG[code] ?? "english";
  return { francCode: code, pgConfig };
}
