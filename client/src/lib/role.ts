import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "expert" | "grader";

const ADMIN_ALIASES = new Set([
  "admin",
  "administrator",
  "superadmin",
  "super_admin",
  "owner",
]);

const EXPERT_ALIASES = new Set(["expert", "reviewer", "author"]);

const GRADER_ALIASES = new Set(["grader", "student", "judge"]);

/** Map DB / metadata strings to a canonical app role, or null if unknown. */
export function canonicalAppRole(raw: unknown): AppRole | null {
  const r = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!r) return null;
  if (ADMIN_ALIASES.has(r)) return "admin";
  if (EXPERT_ALIASES.has(r)) return "expert";
  if (GRADER_ALIASES.has(r)) return "grader";
  return null;
}

/**
 * Prefer `profiles.role`, then Supabase Auth metadata (common when DB row lags triggers).
 */
export function resolveAppRole(user: User | null, prof: { role?: string | null } | null): AppRole {
  const candidates: unknown[] = [
    prof?.role,
    user?.user_metadata?.role,
    user?.app_metadata?.role,
  ];
  for (const c of candidates) {
    const hit = canonicalAppRole(c);
    if (hit) return hit;
  }
  return "grader";
}

export function roleHomeHref(role: AppRole): string {
  if (role === "admin") return "/admin";
  if (role === "expert") return "/expert";
  return "/grader";
}
