import { ACQUI_STATIC_ID, ACQUI_WORLD_PAYLOAD } from "@/data/acqui-world";

/** Published benchmark worlds exposed in the Grader Lobby (fixed curriculum). */
export const GRADER_LOBBY_TITLE_ORDER = ["Audit", "Invoice Approval", "Deals & Advisory"] as const;
export type GraderLobbyCanonicalTitle = (typeof GRADER_LOBBY_TITLE_ORDER)[number];

export const LOBBY_TITLE_MEDIAN_SCORES: Record<string, number> = {
  Audit: 7.4,
  "Invoice Approval": 6.8,
  "Deals & Advisory": 8.2,
};

export const LOBBY_TITLE_REVIEWER_COUNTS: Record<string, number> = {
  Audit: 3,
  "Invoice Approval": 2,
  "Deals & Advisory": 3,
};

/** Row shape returned from `worlds` for lobby / published curriculum views. */
export type CurriculumDbPublishedRow = {
  id: string;
  title: string | null;
  payload: {
    meta?: { archetype?: string; type?: string; taskPrompt?: string };
    review?: { reviewer_count?: number; median_score?: number | null };
    taskPrompt?: string;
  } | null;
};

export type CurriculumLobbyWorld = {
  id: string;
  title: string;
  archetype: string;
  businessType: string;
  reviewerCount: number;
  medianScore: number | null;
  taskPrompt: string;
};

function rowFromDb(w: CurriculumDbPublishedRow, canonical: string): CurriculumLobbyWorld {
  const title = canonical;
  return {
    id: w.id,
    title,
    archetype: w.payload?.meta?.archetype || "—",
    businessType: w.payload?.meta?.type || "—",
    reviewerCount:
      LOBBY_TITLE_REVIEWER_COUNTS[title] ??
      Math.min(3, Number(w.payload?.review?.reviewer_count || 0)),
    medianScore:
      LOBBY_TITLE_MEDIAN_SCORES[title] ??
      (w.payload?.review?.median_score != null ? Number(w.payload.review.median_score) : null),
    taskPrompt: (() => {
      const tp = typeof w.payload?.taskPrompt === "string" ? w.payload.taskPrompt : w.payload?.meta?.taskPrompt;
      return typeof tp === "string" ? tp.slice(0, 120) : "";
    })(),
  };
}

/**
 * Same three curriculum worlds as the Grader Lobby: Audit, Invoice Approval,
 * Deals & Advisory (with static fallback for Deals when no DB row matches).
 */
export function buildCurriculumLobbyWorldsFromDbRows(rows: CurriculumDbPublishedRow[]): CurriculumLobbyWorld[] {
  const byCanonical = new Map<string, CurriculumDbPublishedRow>();
  for (const w of rows) {
    const c = canonicalGraderLobbyTitle(w.title || "");
    if (!c) continue;
    if (!byCanonical.has(c)) byCanonical.set(c, w);
  }

  const taskPromptStatic =
    typeof ACQUI_WORLD_PAYLOAD.meta?.taskPrompt === "string"
      ? ACQUI_WORLD_PAYLOAD.meta.taskPrompt.slice(0, 120)
      : "";

  const staticDeals: CurriculumLobbyWorld = {
    id: ACQUI_STATIC_ID,
    title: "Deals & Advisory",
    archetype: ACQUI_WORLD_PAYLOAD.meta.archetype,
    businessType: "—",
    reviewerCount: LOBBY_TITLE_REVIEWER_COUNTS["Deals & Advisory"],
    medianScore: LOBBY_TITLE_MEDIAN_SCORES["Deals & Advisory"],
    taskPrompt: taskPromptStatic,
  };

  const ordered: CurriculumLobbyWorld[] = [];
  for (const canonical of GRADER_LOBBY_TITLE_ORDER) {
    if (canonical === "Deals & Advisory") {
      const db = byCanonical.get("Deals & Advisory");
      ordered.push(db ? rowFromDb(db, canonical) : staticDeals);
      continue;
    }
    const db = byCanonical.get(canonical);
    if (db) ordered.push(rowFromDb(db, canonical));
  }
  return ordered;
}

/** Map DB / legacy titles to a canonical lobby title, or null if not part of the grader curriculum. */
export function canonicalGraderLobbyTitle(title: string): GraderLobbyCanonicalTitle | null {
  const t = (title || "")
    .trim()
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");
  if (!t) return null;
  const tl = t.toLowerCase();
  // Legacy / variant DB labels for the Deals & Advisory (AcquiCo) benchmark
  if (
    tl === "acquico inc" ||
    tl === "acquico inc." ||
    tl === "acquico, inc" ||
    tl === "acquico, inc." ||
    /^acquico inc\b/i.test(t)
  ) {
    return "Deals & Advisory";
  }
  if ((GRADER_LOBBY_TITLE_ORDER as readonly string[]).includes(t)) return t as GraderLobbyCanonicalTitle;
  return null;
}

/** Human-facing world name in admin/review UIs (legacy DB title → curriculum label). */
export function curriculumWorldDisplayTitle(dbTitle: string | null | undefined): string {
  const raw = (dbTitle || "").trim();
  if (!raw) return "Untitled world";
  const c = canonicalGraderLobbyTitle(raw);
  return c ?? raw;
}
