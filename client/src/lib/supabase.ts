import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _boot: Promise<SupabaseClient> | null = null;

function makeClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

async function createSupabaseClient(): Promise<SupabaseClient> {
  // Use Vite-injected env vars when available (avoids needing the backend running locally).
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (envUrl && envKey) {
    return makeClient(envUrl, envKey);
  }

  // Fall back to backend bootstrap endpoint (production / no .env.local).
  const res = await fetch("/api/bootstrap");
  if (!res.ok) throw new Error("Could not reach /api/bootstrap");
  const cfg = await res.json();
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env and restart the server."
    );
  }
  return makeClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
}

/** Returns a singleton Supabase client. */
export async function getSupabase(): Promise<SupabaseClient> {
  if (_client) return _client;
  if (!_boot) _boot = createSupabaseClient();
  try {
    _client = await _boot;
  } catch (e) {
    // Reset so callers can retry after a transient failure.
    _boot = null;
    throw e;
  }
  return _client;
}
