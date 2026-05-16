/** Published benchmark worlds exposed in the Grader Lobby (fixed curriculum). */
export const GRADER_LOBBY_TITLE_ORDER = ["Audit", "Invoice Approval", "Deals & Advisory"] as const;
export type GraderLobbyCanonicalTitle = (typeof GRADER_LOBBY_TITLE_ORDER)[number];

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
