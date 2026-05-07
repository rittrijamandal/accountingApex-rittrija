import type { Profile } from "./types";

export function firstName(profile: Pick<Profile, "display_name" | "email"> | null | undefined) {
  const display = profile?.display_name?.trim();
  if (display && display.includes(" ")) return display.split(/\s+/)[0];
  const emailName = profile?.email?.split("@")[0]?.trim();
  return display || emailName || "there";
}
