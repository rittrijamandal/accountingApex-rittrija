import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** First name for welcome lines: strips trailing digits/slug suffix (e.g. rittrija7 → Rittrija). */
export function prettifyWelcomeFirstName(profile: { display_name?: string; email?: string } | null): string {
  const raw = profile?.display_name || profile?.email?.split("@")[0] || "";
  const first = raw.split(/[\s.]+/)[0] || "";
  const cleaned = first.replace(/[0-9_-]+$/g, "");
  if (!cleaned) return "there";
  return cleaned[0].toUpperCase() + cleaned.slice(1).toLowerCase();
}
