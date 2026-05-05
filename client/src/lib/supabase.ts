import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _boot: Promise<SupabaseClient> | null = null;

async function createSupabaseClient(): Promise<SupabaseClient> {
  const res = await fetch("/api/bootstrap");
  if (!res.ok) throw new Error("Could not reach /api/bootstrap");
  const cfg = await res.json();
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env and restart the server."
    );
  }
  return createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/** Returns a singleton Supabase client, bootstrapped from /api/bootstrap. */
export async function getSupabase(): Promise<SupabaseClient> {
  if (_client) return _client;
  if (!_boot) _boot = createSupabaseClient();
  _client = await _boot;
  return _client;
}
