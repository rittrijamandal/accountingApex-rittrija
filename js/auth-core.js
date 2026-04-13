/**
 * Shared Supabase client + session helpers (ES module).
 * Loads anon credentials from GET /api/bootstrap (see server.js + .env).
 */

let client = null;
let boot = null;

async function createSupabase() {
  const res = await fetch('/api/bootstrap');
  const cfg = await res.json();
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file and restart the server.'
    );
  }
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.1');
  return createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export async function getSupabase() {
  if (client) return client;
  if (!boot) boot = createSupabase();
  client = await boot;
  return client;
}

export async function getSession() {
  const sb = await getSupabase();
  const {
    data: { session },
  } = await sb.auth.getSession();
  return session;
}

export async function fetchMyProfile() {
  const sb = await getSupabase();
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr || !user) return null;
  const { data, error } = await sb
    .from('profiles')
    .select('id,email,display_name,role')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function roleHomePath(role) {
  if (role === 'admin') return '/admin.html';
  if (role === 'expert') return '/expert.html';
  return '/grader.html';
}

export async function signOut() {
  const sb = await getSupabase();
  await sb.auth.signOut();
}
