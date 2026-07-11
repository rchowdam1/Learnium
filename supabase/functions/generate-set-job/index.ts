// Supabase Edge Function: generate-set-job
// Async set generation via OpenRouter. Uses service-role/admin client.
// Invoke only with secret auth (server-to-server).

// deno-lint-ignore-file no-explicit-any

import { createClient } from "npm:@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

// ─── Configuration ─────────────────────────────────────────────────────────

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const PROVIDER_TIMEOUT_MS = 45_000;
const MAX_BATCH_CONCURRENCY = 6;
const DEFAULT_PASS_THRESHOLD = 0.75;

function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function isTrustedWorkerKey(apiKey: string | null): boolean {
  if (!apiKey) return false;
  try {
    const parts = apiKey.split(".");
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    return payload?.role === "service_role";
  } catch {
    return false;
  }
}

function getModel(): string {
  return Deno.env.get("OPENROUTER_MODEL") || "deepseek/deepseek-v4-flash";
}

// ─── OpenRouter fetch (no Node SDK) ────────────────────────────────────────

function orHeaders(): Record<string, string> {
  return {
    "Authorization": `Bearer ${env("OPENROUTER_API_KEY")}`,
    "Content-Type": "application/json",
    "HTTP-Referer": Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://learnium.app",
    "X-Title": "Learnium",
  };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const startObj = unfenced.indexOf("{");
  const startArr = unfenced.indexOf("[");
  let start = startObj === -1 ? startArr : startArr === -1 ? startObj : Math.min(startObj, startArr);
  if (start === -1) return JSON.parse(unfenced);
  const open = unfenced[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < unfenced.length; i++) {
    const ch = unfenced[i];
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') { inStr = true; continue; }
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return JSON.parse(unfenced.slice(start, i + 1));
  }
  return JSON.parse(unfenced.slice(start));
}

async function chatJson<T>(
  system: string,
  user: string,
  opts?: { temperature?: number; max_tokens?: number; web?: boolean },
): Promise<T> {
  let sysContent = system;
  let userContent = user;
  if (!(system + " " + user).toLowerCase().includes("json")) {
    sysContent += "\nRespond in JSON format.";
  }

  const body: Record<string, unknown> = {
    model: getModel(),
    messages: [{ role: "system", content: sysContent }, { role: "user", content: userContent }],
    response_format: { type: "json_object" },
    temperature: opts?.temperature ?? 0.5,
    max_tokens: opts?.max_tokens ?? 8192,
    reasoning: { effort: "high", exclude: true },
  };
  if (opts?.web) body.plugins = [{ id: "web", max_results: 8 }];

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const r = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST", headers: orHeaders(), body: JSON.stringify(body), signal: ctrl.signal,
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`OpenRouter ${r.status}: ${txt.slice(0, 300)}`);
    }
    const j = await r.json() as any;
    const content = String(j?.choices?.[0]?.message?.content ?? "");
    if (!content) throw new Error("Empty model response");
    return extractJson(content) as T;
  } finally {
    clearTimeout(t);
  }
}

// ─── Complexity scale (pure, deterministic) ────────────────────────────────

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 2;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function lessonsForScore(score: number) {
  const s = clampScore(score);
  return Math.min(50, Math.max(4, Math.round(4 + ((s - 1) * 46) / 9)));
}
function tierForScore(score: number): string {
  const s = clampScore(score);
  if (s <= 3) return "intro"; if (s <= 6) return "intermediate"; if (s <= 8) return "advanced"; return "expert";
}
function densityForScore(score: number): string {
  const s = clampScore(score);
  if (s <= 3) return "light"; if (s <= 6) return "standard"; return "dense";
}
function batchSizeForScore(score: number) {
  const s = clampScore(score);
  if (s >= 7) return 1; if (s >= 5) return 2; return 3;
}
function questionsPerQuizForScore(score: number) {
  const s = clampScore(score);
  if (s >= 9) return 5; if (s >= 7) return 4; if (s >= 3) return 3; return 3;
}
function paragraphsRangeForScore(score: number): [number, number] {
  const s = clampScore(score);
  if (s >= 9) return [5, 7]; if (s >= 7) return [5, 6]; if (s >= 5) return [4, 5]; if (s >= 3) return [3, 4]; return [3, 3];
}

const WEB_KW = /\b(aws|azure|gcp|cloud|kubernetes|k8s|latest|202[4-9]|api|sdk|docs?|release|changelog|framework|react|next\.?js|node|terraform|docker|openai|llm)\b/i;

function needsWeb(score: number, desc: string, cat?: string): boolean {
  const s = clampScore(score);
  const text = `${cat ?? ""} ${desc}`;
  if (s >= 8 && WEB_KW.test(text)) return true;
  if (s >= 6 && WEB_KW.test(text)) return true;
  if (/\b(latest|news|current|202[5-9])\b/i.test(text)) return true;
  return false;
}

type Profile = {
  score: number; complexity: string; needsWeb: boolean; breadth: string;
  estimatedLessons: number; density: string; subtopics: string[];
  rationale: string; batchSize: number; questionsPerQuiz: number;
  paragraphsPerLesson: [number, number];
};

function scaleFromScore(score: number, desc: string, cat?: string): Profile {
  const s = clampScore(score);
  return {
    score: s, complexity: tierForScore(s),
    needsWeb: needsWeb(s, desc, cat), breadth: s >= 7 ? "broad" : "narrow",
    estimatedLessons: lessonsForScore(s), density: densityForScore(s),
    subtopics: [], rationale: `Score ${s}/10 → ${lessonsForScore(s)} ${densityForScore(s)} lessons.`,
    batchSize: batchSizeForScore(s), questionsPerQuiz: questionsPerQuizForScore(s),
    paragraphsPerLesson: paragraphsRangeForScore(s),
  };
}

// ─── Phase 1: Judge complexity ─────────────────────────────────────────────

const JUDGE_SYS = `You are a strict curriculum difficulty judge.
Rate how hard it is to master the user's learning request as a complete learning path.
Return ONLY: {"score": <integer 1-10>}
1-2=Trivial 3-4=High-school 5-6=College 7-8=Advanced 9-10=Graduate/research.
score MUST be integer 1-10. No other keys.`;

async function judgeComplexity(desc: string, cat?: string): Promise<number> {
  try {
    const c = cat ? `Category: ${cat}\n` : "";
    const d = await chatJson<{ score?: unknown }>(JUDGE_SYS, `${c}Request:\n${desc}\n\nReturn {"score": N} only.`, { temperature: 0.1, max_tokens: 128 });
    return clampScore(typeof d?.score === "number" ? d.score : Number(d?.score));
  } catch (e) { console.warn("judgeComplexity fallback:", e); return 2; }
}

async function analyzeTopic(desc: string, cat?: string): Promise<Profile> {
  return scaleFromScore(await judgeComplexity(desc, cat), desc, cat);
}

// ─── Phase 2: Web research ─────────────────────────────────────────────────

interface Source { id: number; title: string; url: string; publisher?: string; publishedAt?: string; excerpt?: string; triageScore?: number; }

const RESEARCH_SYS = `You are a research librarian. Return: {"sources":[{"id":1,"title":"...","url":"https://...","publisher":"...","publishedAt":"...","excerpt":"...","triageScore":0.8}]}
Prefer https, official docs > peer-reviewed > blogs. Cap 12. Drop SEO spam, content farms, non-HTTPS.`;

function normUrl(raw: string): string | null {
  const t = raw.trim(); if (!t) return null;
  try {
    const w = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    const u = new URL(w);
    if (u.protocol === "http:") { u.protocol = "https:"; return u.toString(); }
    return u.protocol === "https:" ? u.toString() : null;
  } catch { return null; }
}

async function researchTopic(desc: string, subtopics: string[]): Promise<Source[]> {
  const sl = subtopics.length ? subtopics.join("; ") : "general coverage";
  const data = await chatJson<any>(RESEARCH_SYS,
    `Topic: ${desc}\nSubtopics: ${sl}\n\nFind up to 12 sources.`, { temperature: 0.3, max_tokens: 8192, web: true });
  const list = Array.isArray(data?.sources) ? data.sources : Array.isArray(data) ? data : [];
  const out: Source[] = []; const seen = new Set<string>();
  for (const item of list) {
    if (out.length >= 12 || !item || typeof item !== "object") continue;
    const s = item as any;
    const url = normUrl(String(s.url ?? s.link ?? s.href ?? ""));
    if (!url) continue;
    const k = url.toLowerCase(); if (seen.has(k)) continue; seen.add(k);
    const src: Source = { id: out.length + 1, title: String(s.title ?? s.name ?? "").trim() || url, url };
    if (typeof s.publisher === "string" && s.publisher.trim()) src.publisher = s.publisher.trim();
    if (typeof s.publishedAt === "string" && s.publishedAt.trim()) src.publishedAt = s.publishedAt.trim();
    if (typeof s.excerpt === "string" && s.excerpt.trim()) src.excerpt = s.excerpt.trim();
    const tr = Number(s.triageScore ?? s.triage_score ?? s.score);
    if (Number.isFinite(tr)) src.triageScore = Math.min(1, Math.max(0, tr));
    out.push(src);
  }
  return out;
}

// ─── Phase 3: Curriculum plan ──────────────────────────────────────────────

interface PlannedLesson { title: string; objectives: string[]; difficulty: number; density: string; sourceIds: number[]; }

function cd(n: number) { return Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : 1; }

function nondec(ls: PlannedLesson[]): PlannedLesson[] {
  let f = 1; return ls.map(l => { const d = Math.max(f, cd(l.difficulty)); f = d; return { ...l, difficulty: d }; });
}

function parseLessons(raw: unknown, prof: Profile, sources: Source[]): PlannedLesson[] {
  const obj = (raw && typeof raw === "object" ? raw : {}) as any;
  const vs = new Set(sources.map(s => s.id));
  const list = Array.isArray(obj.lessons) ? obj.lessons : [];
  return list.map((item: any, i: number) => {
    const l = (item && typeof item === "object" ? item : {}) as any;
    const objs = Array.isArray(l.objectives) ? l.objectives.map((o: any) => String(o ?? "").trim()).filter(Boolean).slice(0, 4) : [];
    const sIds = Array.isArray(l.sourceIds ?? l.source_ids) ? (l.sourceIds as any[]).map((id: any) => Number(id)).filter((id: number) => Number.isFinite(id) && vs.has(id)) : [];
    return {
      title: String(l.title ?? l.name ?? `Lesson ${i + 1}`).trim() || `Lesson ${i + 1}`,
      objectives: objs.length ? objs : [`Understand core concepts of lesson ${i + 1}`],
      difficulty: cd(Number(l.difficulty ?? 1)),
      density: (["light","standard","dense"].includes(String(l.density ?? "").toLowerCase()) ? String(l.density).toLowerCase() : prof.density) as PlannedLesson["density"],
      sourceIds: sIds,
    };
  });
}

function scaffoldLessons(prof: Profile, sources: Source[], count: number): PlannedLesson[] {
  const n = Math.min(50, Math.max(4, count));
  return Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(1, n - 1);
    return {
      title: prof.subtopics[i] || `Module ${i + 1}: Deep dive`,
      objectives: [`Master concepts for stage ${i + 1}`],
      difficulty: cd(1 + Math.floor(t * 4)),
      density: prof.density,
      sourceIds: sources.slice(0, 2).map(s => s.id),
    };
  });
}

function finalizeLessons(lsIn: PlannedLesson[], prof: Profile, sources: Source[]): PlannedLesson[] {
  let ls = lsIn; const tgt = Math.min(50, Math.max(4, prof.estimatedLessons));
  if (!ls.length) ls = scaffoldLessons(prof, sources, tgt);
  if (ls.length > tgt) ls = ls.slice(0, tgt);
  ls = nondec(ls).slice(0, 50);
  while (ls.length < Math.min(4, tgt)) {
    const prev = ls[ls.length - 1];
    ls.push({ title: `Synthesis ${ls.length + 1}`, objectives: ["Integrate prior lessons"], difficulty: prev?.difficulty ?? 3, density: prof.density, sourceIds: [] });
  }
  while (ls.length < tgt) {
    const prev = ls[ls.length - 1];
    ls.push({ title: `Extension ${ls.length + 1}`, objectives: ["Deepen prior modules"], difficulty: Math.min(5, (prev?.difficulty ?? 3) + (ls.length % 3 === 0 ? 1 : 0)), density: prof.density, sourceIds: [] });
  }
  return nondec(ls).slice(0, tgt);
}

const PLAN_SYS = `You are an expert instructional designer. Return valid JSON:
{"lessons":[{"title":"...","objectives":["..."],"difficulty":1-5,"density":"light|standard|dense","sourceIds":[1]}],"overallComplexity":"intro|intermediate|advanced|expert","passThreshold":0.75}
Lesson count MUST match request exactly. difficulty nondecreasing 1-5. Start foundations, end synthesis. 1-4 objectives each. Titles specific.`;

async function planChunk(desc: string, cat: string | undefined, prof: Profile, sources: Source[], count: number, label: string, prior: string[]): Promise<PlannedLesson[]> {
  const sb = sources.length ? `Sources:\n${sources.map(s => `- id=${s.id}: ${s.title} (${s.url})${s.excerpt ? ` — ${s.excerpt}` : ""}`).join("\n")}` : "No external sources.";
  const pr = prior.length ? `Already planned (do not repeat):\n${prior.map((t, i) => `${i + 1}. ${t}`).join("\n")}` : "Start of curriculum.";
  const data = await chatJson<any>(PLAN_SYS, [
    cat ? `Category: ${cat}` : null, `Topic: ${desc}`,
    `Profile: score=${prof.score}/10 complexity=${prof.complexity} density=${prof.density}`,
    `Request EXACTLY ${count} lessons for ${label}.`, pr, sb,
    `Return JSON with exactly ${count} lessons.`,
  ].filter(Boolean).join("\n\n"), { temperature: 0.35, max_tokens: 16384 });
  return parseLessons(data, prof, sources);
}

async function planExactChunk(desc: string, cat: string | undefined, prof: Profile, sources: Source[], count: number, label: string, prior: string[]): Promise<PlannedLesson[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const lessons = await planChunk(desc, cat, prof, sources, count, label, prior);
    if (lessons.length === count && lessons.every(l => l.title && l.objectives.length > 0)) {
      return lessons;
    }
  }
  throw Object.assign(new Error(`Curriculum plan did not contain exactly ${count} valid lessons`), { code: "VALIDATION_FAILED" });
}

async function planCurriculum(desc: string, cat: string | undefined, prof: Profile, sources: Source[]): Promise<{ lessons: PlannedLesson[]; overallComplexity: string; passThreshold: number }> {
  const tgt = Math.min(50, Math.max(4, prof.estimatedLessons));
  let ls: PlannedLesson[];
  if (tgt <= 25) {
    ls = await planExactChunk(desc, cat, prof, sources, tgt, "full path", []);
  } else {
    const f = Math.ceil(tgt / 2);
    const p1 = await planExactChunk(desc, cat, prof, sources, f, `part 1 (1–${f})`, []);
    const p2 = await planExactChunk(desc, cat, prof, sources, tgt - f, `part 2 (${f + 1}–${tgt})`, p1.map(l => l.title));
    ls = [...p1, ...p2];
  }
  ls = nondec(ls);
  if (!prof.subtopics.length) prof.subtopics = ls.slice(0, 12).map(l => l.title);
  return { lessons: ls, overallComplexity: prof.complexity, passThreshold: 0.75 };
}

// ─── Phase 4: Generate content ─────────────────────────────────────────────

interface LessonOut { title: string; paragraphs: string[]; difficulty?: number; objectives?: string[]; sourceRefs?: number[]; }
interface QuizQ { question: string; options: string[]; answer: string; difficulty?: number; rationale?: string; }
interface QuizOut { title: string; questions: QuizQ[]; }
interface PartialSet { flagged: boolean; lessons: LessonOut[]; quizzes: QuizOut[]; }

function densityGuide(prof: Profile): string {
  const [pMin, pMax] = prof.paragraphsPerLesson; const q = prof.questionsPerQuiz;
  if (prof.score >= 9) return `ULTRA-DEEP: ${pMin}–${pMax} dense paragraphs (4-8 sentences each). Quiz: ${q} hard questions (application, multi-step, trade-offs).`;
  if (prof.score >= 7) return `DEEP: ${pMin}–${pMax} technical paragraphs. Quiz: ${q} application/analysis questions.`;
  if (prof.score <= 3) return `INTRO: clear friendly paragraphs (${pMin}–${pMax}). Quiz: ${q} recall + simple application.`;
  return `STANDARD: solid paragraphs (${pMin}–${pMax}). Quiz: ${q} questions.`;
}

function contentSys(prof: Profile): string {
  const q = prof.questionsPerQuiz;
  return `You are an elite instructor. Return valid JSON:
{"flagged":false,"lessons":[{"title":"...","paragraphs":["...","..."],"difficulty":1-5,"objectives":["..."],"sourceRefs":[1]}],"quizzes":[{"title":"...","questions":[{"question":"...","options":["A","B","C","D"],"answer":"A","difficulty":1-5,"rationale":"..."}]}],"complexity":"${prof.complexity}","passThreshold":0.75}
Generate EXACTLY requested lessons. One quiz per lesson with ${q} questions, 4 options each. answer MUST match one option exactly. ${densityGuide(prof)} Never truncate. Do NOT invent extra lessons.`;
}

function coerceDiff(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  const r = Math.round(n);
  return (r >= 1 && r <= 5) ? r : undefined;
}

function extractPartial(raw: unknown): PartialSet {
  if (!raw || typeof raw !== "object") return { flagged: false, lessons: [], quizzes: [] };
  const obj = raw as any;
  const lr = Array.isArray(obj.lessons) ? obj.lessons : [];
  const qr = Array.isArray(obj.quizzes) ? obj.quizzes : [];

  const lessons: LessonOut[] = lr.map((l: any) => {
    if (!l || typeof l !== "object") return { title: "", paragraphs: [] };
    const ps = Array.isArray(l.paragraphs) ? l.paragraphs.map((p: any) => String(p ?? "")).filter(Boolean) : [];
    const out: LessonOut = { title: String(l.title ?? ""), paragraphs: ps };
    const d = coerceDiff(l.difficulty); if (d !== undefined) out.difficulty = d;
    const objs = Array.isArray(l.objectives) ? l.objectives.map((o: any) => String(o ?? "").trim()).filter(Boolean) : undefined;
    if (objs?.length) out.objectives = objs;
    const srefs = Array.isArray(l.sourceRefs ?? l.source_refs) ? (l.sourceRefs as any[]).map((v: any) => Number(v)).filter((n: number) => Number.isFinite(n)) : undefined;
    if (srefs?.length) out.sourceRefs = srefs;
    return out;
  });

  const quizzes: QuizOut[] = qr.map((q: any) => {
    if (!q || typeof q !== "object") return { title: "", questions: [] };
    const qs = Array.isArray(q.questions) ? q.questions : [];
    const questions: QuizQ[] = qs.map((qi: any): QuizQ => {
      if (!qi || typeof qi !== "object") return { question: "", options: [], answer: "" };
      const opts = Array.isArray(qi.options) ? qi.options.map((o: any) => String(o ?? "")).filter(Boolean) : [];
      let ans: unknown = qi.answer ?? qi.correct_answer ?? qi.correctAnswer;
      if (typeof ans === "number" && opts[ans] !== undefined) ans = opts[ans];
      const r: QuizQ = { question: String(qi.question ?? ""), options: opts, answer: String(ans ?? opts[0] ?? "") };
      const d = coerceDiff(qi.difficulty); if (d !== undefined) r.difficulty = d;
      if (typeof qi.rationale === "string" && qi.rationale.trim()) r.rationale = qi.rationale.trim();
      return r;
    });
    return { title: String(q.title ?? ""), questions };
  });

  return { flagged: Boolean(obj.flagged), lessons, quizzes };
}

function alignBatch(p: PartialSet, planned: PlannedLesson[], qpq: number, minParagraphs: number): PartialSet {
  if (p.lessons.length !== planned.length || p.quizzes.length !== planned.length ||
      p.lessons.some(l => l.paragraphs.length < minParagraphs) ||
      p.quizzes.some(q => q.questions.length !== qpq || q.questions.some(qi =>
        qi.options.length !== 4 || !qi.answer || !qi.options.includes(qi.answer)
      ))) {
    throw new Error("Incomplete batch content");
  }
  const lessons = planned.map((pl, i) => ({
    title: pl.title, paragraphs: p.lessons[i].paragraphs, difficulty: pl.difficulty,
    objectives: pl.objectives,
    sourceRefs: p.lessons[i].sourceRefs?.length ? p.lessons[i].sourceRefs : pl.sourceIds.length ? pl.sourceIds : undefined,
  }));
  const quizzes = planned.map((pl, i) => ({ title: pl.title, questions: p.quizzes[i].questions }));
  return { flagged: p.flagged, lessons, quizzes };
}

async function generateBatch(
  desc: string, cat: string | undefined, prof: Profile, sources: Source[],
  planned: PlannedLesson[], priorTitles: string[], bi: number, bc: number,
): Promise<PartialSet> {
  const q = prof.questionsPerQuiz;
  const cont = priorTitles.length ? `Other lessons (do NOT duplicate):\n${priorTitles.slice(-12).map((t,i) => `${i+1}. ${t}`).join("\n")}\nWrite ONLY requested batch.` : "First batch; start foundations.";
  const sb = sources.length ? `Sources:\n${sources.map(s => `- id=${s.id}: ${s.title} | ${s.url}${s.excerpt ? ` | ${s.excerpt}` : ""}`).join("\n")}` : "No sources.";
  const pb = planned.map((l,i) => `${i+1}. "${l.title}" (diff ${l.difficulty}, ${l.density})\n   objectives: ${l.objectives.join("; ")}\n   sourceIds: ${l.sourceIds.length ? l.sourceIds.join(", ") : "none"}`).join("\n");
  const data = await chatJson<any>(contentSys(prof), [
    cat ? `Category: ${cat}` : null, `Topic: ${desc}`,
    `Score: ${prof.score}/10 · ${prof.complexity} · ${prof.density}`,
    `Batch ${bi+1}/${bc} — generate ONLY these ${planned.length} lesson(s) + quiz/quizzes (${q} q's each):`,
    pb, cont, sb, "COMPLETE valid JSON. Do not truncate.",
  ].filter(Boolean).join("\n\n"), { temperature: 0.5, max_tokens: 32768 });
  return alignBatch(extractPartial(data), planned, q, prof.paragraphsPerLesson[0]);
}

// ─── Validation ────────────────────────────────────────────────────────────

interface OutputSchema { lessons: LessonOut[]; quizzes: QuizOut[]; flagged: boolean; sources?: Source[]; complexity?: string; passThreshold: number; }

function validateSet(raw: PartialSet & { complexity?: string; passThreshold?: number; sources?: Source[] }): OutputSchema | null {
  const PLACEHOLDER = [/\[.*placeholder.*\]/i, /\[.*TODO.*\]/i, /\[.*insert.*\]/i, /lorem ipsum/i, /^TODO$/i, /^TBD$/i, /^N\/A$/i];
  for (const l of raw.lessons) {
    if (!l.title || !l.paragraphs.length) { console.error("VALIDATE: missing title/paragraphs"); return null; }
    for (const p of l.paragraphs) {
      if (typeof p !== "string" || p.trim().length < 20) { console.error("VALIDATE: short paragraph"); return null; }
      if (PLACEHOLDER.some(pat => pat.test(p))) { console.error("VALIDATE: placeholder in paragraph"); return null; }
    }
    if (l.title && PLACEHOLDER.some(pat => pat.test(l.title))) { console.error("VALIDATE: placeholder title"); return null; }
  }
  for (const q of raw.quizzes) {
    if (!q.questions.length) { console.error("VALIDATE: quiz no questions"); return null; }
    for (const qi of q.questions) {
      if (!qi.question || qi.options.length < 2) { console.error("VALIDATE: bad question/options"); return null; }
      if (!qi.answer || !qi.options.includes(qi.answer)) { console.error("VALIDATE: answer not in options"); return null; }
    }
  }
  return {
    lessons: raw.lessons.map(l => ({ title: l.title, paragraphs: l.paragraphs, ...(l.difficulty !== undefined ? { difficulty: l.difficulty } : {}), ...(l.objectives?.length ? { objectives: l.objectives } : {}), ...(l.sourceRefs?.length ? { sourceRefs: l.sourceRefs } : {}) })),
    quizzes: raw.quizzes.map(q => ({ title: q.title, questions: q.questions.map(qi => ({ question: qi.question, options: qi.options, answer: qi.answer, ...(qi.difficulty !== undefined ? { difficulty: qi.difficulty } : {}), ...(qi.rationale ? { rationale: qi.rationale } : {}) })) })),
    flagged: Boolean(raw.flagged), passThreshold: raw.passThreshold ?? DEFAULT_PASS_THRESHOLD,
    ...(raw.complexity ? { complexity: raw.complexity } : {}),
    ...(raw.sources?.length ? { sources: raw.sources } : {}),
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function jobRpc(sa: any, fn: string, params: Record<string, unknown>) {
  const { error } = await sa.rpc(fn, params);
  if (error) throw new Error(`RPC ${fn}: ${error.message}`);
}

async function assertJobRunning(sa: any, jobId: string) {
  const { data, error } = await sa.from("set_generation_jobs")
    .select("status").eq("id", jobId).single();
  if (error || data?.status !== "running") {
    throw Object.assign(new Error("Generation cancelled"), { code: "GENERATION_CANCELLED" });
  }
}

async function processJob(sa: any, jobId: string, jr: any): Promise<void> {
  const title = String(jr.title ?? "");
  const desc = String(jr.description ?? "");
  const cat = String(jr.category ?? "");

  try {
    await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_phase: "Scoring complexity (1–10)…" });
    const prof = await analyzeTopic(desc, cat);
    await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_phase: `Complexity ${prof.score}/10 → ${prof.estimatedLessons} lessons`, p_total_lessons: prof.estimatedLessons });

    let sources: Source[] = [];
    if (prof.needsWeb) {
      await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_phase: "Researching web sources…" });
      try { sources = await researchTopic(desc, [title, desc].filter(Boolean)); } catch (e) { console.warn("research failed:", e); }
    }

    await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_phase: `Planning ${prof.estimatedLessons} lessons…` });
    const plan = await planCurriculum(desc, cat, prof, sources);
    await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_phase: `Planned ${plan.lessons.length} lessons`, p_total_lessons: plan.lessons.length });

    const allPlanned = plan.lessons;
    const batches: PlannedLesson[][] = [];
    for (let i = 0; i < allPlanned.length; i += prof.batchSize) batches.push(allPlanned.slice(i, i + prof.batchSize));

    const completed: PartialSet[] = new Array(batches.length);
    let flagged = false;
    let completedCount = 0;
    let nextBatch = 0;
    let batchErr: Error | null = null;
    const batchController = new AbortController();

    async function worker() {
      try {
        while (!batchController.signal.aborted) {
          await assertJobRunning(sa, jobId);
          const batchIndex = nextBatch++;
          if (batchIndex >= batches.length) return;
          const planned = batches[batchIndex];
          let partial: PartialSet | undefined;
          for (let attempt = 0; attempt < 2 && !partial; attempt++) {
            try {
              partial = await generateBatch(desc, cat, prof, sources, planned,
                allPlanned.slice(0, batchIndex).map(l => l.title), batchIndex, batches.length);
            } catch (error) {
              if (attempt === 1) throw error;
              await new Promise(resolve => setTimeout(resolve, 2_000));
            }
          }
          if (!partial) throw new Error(`Batch ${batchIndex + 1} failed`);
          await assertJobRunning(sa, jobId);
          completed[batchIndex] = partial;
          flagged ||= partial.flagged;
          completedCount += planned.length;
          await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_phase: "Writing lessons…", p_completed_lessons: completedCount });
        }
      } catch (error) {
        batchErr = error instanceof Error ? error : new Error(String(error));
        batchController.abort();
      }
    }

    await Promise.all(Array.from({ length: Math.min(MAX_BATCH_CONCURRENCY, batches.length) }, worker));
    if (batchErr) throw batchErr;
    if (completed.filter(Boolean).length !== batches.length) {
      throw new Error("Not all lesson batches completed");
    }

    await assertJobRunning(sa, jobId);
    await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_phase: "Validating…" });
    const parsed = validateSet({
      lessons: completed.flatMap(batch => batch.lessons),
      quizzes: completed.flatMap(batch => batch.quizzes),
      flagged,
      complexity: plan.overallComplexity,
      passThreshold: plan.passThreshold,
      sources: sources.length ? sources : undefined,
    });
    if (!parsed) throw Object.assign(new Error("Content validation failed"), { code: "VALIDATION_FAILED" });
    if (parsed.flagged) throw Object.assign(new Error("Content was flagged"), { code: "CONTENT_FLAGGED" });

    await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_phase: "Saving…" });
    const { data: setId, error: persistError } = await sa.rpc("persist_generation_job_graph", {
      p_job_id: jobId,
      p_graph_data: {
        title,
        description: desc,
        category: cat,
        lessons: parsed.lessons,
        quizzes: parsed.quizzes,
        complexity: parsed.complexity,
        complexityScore: prof.score,
        sources: parsed.sources,
        passThreshold: parsed.passThreshold,
      },
    });
    if (persistError || !setId) throw Object.assign(new Error(`Persist failed: ${persistError?.message ?? "unknown"}`), { code: "PERSISTENCE_ERROR" });

    await jobRpc(sa, "update_generation_job", { p_job_id: jobId, p_status: "succeeded", p_phase: "Complete", p_set_id: Number(setId), p_completed_lessons: parsed.lessons.length });
    console.log(`Job ${jobId} → set ${setId} (${parsed.lessons.length} lessons)`);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    const code = String((error as any)?.code ?? "PROVIDER_ERROR");
    if (code !== "GENERATION_CANCELLED") {
      try {
        await jobRpc(sa, "update_generation_job", {
          p_job_id: jobId,
          p_status: "failed",
          p_phase: "Failed",
          p_error_code: code,
          p_error_message: err.message.slice(0, 500),
        });
      } catch (updateError) {
        console.error(`Could not record failure for job ${jobId}:`, updateError);
      }
    }
    console.error(`Job ${jobId} FAILED [${code}]:`, err.message);
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────

export default {
  async fetch(req: Request): Promise<Response> {
    const supabaseUrl = env("SUPABASE_URL");
    const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
    const apiKey = req.headers.get("apikey");
    if (!isTrustedWorkerKey(apiKey)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const sa = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let body: { jobId?: string };
    try { body = await req.json() as { jobId?: string }; } catch {
      return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { data: claimed, error: claimErr } = await sa.rpc("claim_generation_job", {
      p_job_id: body.jobId ?? null,
    });
    if (claimErr) {
      return new Response(JSON.stringify({ error: claimErr.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    const job = (Array.isArray(claimed) ? claimed[0] : claimed) as any;
    if (!job) {
      return new Response(JSON.stringify({ status: "idle", message: "No queued jobs" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const jobId = String(job.id);

    // Fetch job details
    const { data: jr, error: jfe } = await sa.from("set_generation_jobs").select("*").eq("id", jobId).single();
    if (jfe || !jr) {
      return new Response(JSON.stringify({ error: "Job not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    EdgeRuntime.waitUntil(processJob(sa, jobId, jr));
    return new Response(JSON.stringify({ success: true, jobId, status: "started" }), {
      status: 202,
      headers: { "Content-Type": "application/json" },
    });
  },
};
