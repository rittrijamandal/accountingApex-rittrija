/** Published benchmark worlds exposed in the Grader Lobby (fixed curriculum). */
export const GRADER_LOBBY_TITLE_ORDER = ["Audit", "Invoice Approval", "Deals & Advisory"] as const;
export type GraderLobbyCanonicalTitle = (typeof GRADER_LOBBY_TITLE_ORDER)[number];

/** Map DB / legacy titles to a canonical lobby title, or null if not part of the grader curriculum. */
export function canonicalGraderLobbyTitle(title: string): GraderLobbyCanonicalTitle | null {
  const t = (title || "").trim();
  if (t === "AcquiCo Inc.") return "Deals & Advisory";
  if ((GRADER_LOBBY_TITLE_ORDER as readonly string[]).includes(t)) return t as GraderLobbyCanonicalTitle;
  return null;
}
