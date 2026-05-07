/** Routes sample viewer preview through the React grader lobby / workspace (sessionStorage-backed). */
export const SESSION_PREVIEW_WORLD_ID = "apex-session-preview";

export function isExpertWorldPreviewMode(): boolean {
  try {
    return sessionStorage.getItem("apex_viewer_mode") === "expert-world-preview";
  } catch {
    return false;
  }
}

export function getViewerReturnHref(): string {
  try {
    return sessionStorage.getItem("apex_viewer_return_href") || "/expert";
  } catch {
    return "/expert";
  }
}

/** Parsed lobby row fields from `apex_active_world`, or null */
export function parseSessionPreviewLobbyFields(): {
  id: string;
  title: string;
  archetype: string;
  businessType: string;
  reviewerCount: number;
  medianScore: number | null;
  taskPrompt: string;
} | null {
  try {
    if (!isExpertWorldPreviewMode()) return null;
    const raw = sessionStorage.getItem("apex_active_world");
    if (!raw) return null;
    const p = JSON.parse(raw) as {
      meta?: { name?: string; archetype?: string; type?: string };
      review?: { reviewer_count?: number; median_score?: number | null };
      taskPrompt?: string;
    };
    const title = String(p.meta?.name || "").trim() || "World preview";
    return {
      id: SESSION_PREVIEW_WORLD_ID,
      title,
      archetype: String(p.meta?.archetype || "—"),
      businessType: String(p.meta?.type || "—"),
      reviewerCount: Math.min(3, Number(p.review?.reviewer_count ?? 0)),
      medianScore: p.review?.median_score != null ? Number(p.review.median_score) : null,
      taskPrompt: typeof p.taskPrompt === "string" ? p.taskPrompt.slice(0, 120) : "",
    };
  } catch {
    return null;
  }
}

export function loadSessionPreviewPayload(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem("apex_active_world");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Call when leaving sample viewer from the grader lobby */
export function clearExpertWorldPreviewSession(): void {
  try {
    sessionStorage.removeItem("apex_viewer_mode");
    sessionStorage.removeItem("apex_viewer_return_href");
    sessionStorage.removeItem("apex_active_world");
  } catch {
    /* ignore */
  }
}
