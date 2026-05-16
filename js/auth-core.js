/**
 * Shared Supabase client + session helpers (ES module).
 * Loads anon credentials from GET /api/bootstrap (see server.js + .env).
 */

let client = null;
let boot = null;

// Injected at build/deploy time via server.js /api/bootstrap.
// These public anon credentials are safe to embed (protected by Supabase RLS).
const FALLBACK_URL = 'https://vbshsbpbtceumwhdeizk.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZic2hzYnBidGNldW13aGRlaXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjE5MTYsImV4cCI6MjA5MTU5NzkxNn0.ncOS6b8TpW2f-iVO6Fz-B0fFgXzrbSMY7HURBca9EBM';

async function createSupabase() {
  let supabaseUrl = FALLBACK_URL;
  let supabaseAnonKey = FALLBACK_KEY;

  // Try the backend bootstrap endpoint; fall back to embedded creds if unavailable.
  try {
    const res = await fetch('/api/bootstrap');
    if (res.ok) {
      const cfg = await res.json();
      if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
        supabaseUrl = cfg.supabaseUrl;
        supabaseAnonKey = cfg.supabaseAnonKey;
      }
    }
  } catch (_) {
    // Backend not running locally — using embedded fallback credentials.
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.1');
  return createClient(supabaseUrl, supabaseAnonKey, {
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

const ADMIN_ALIASES = new Set(['admin', 'administrator', 'superadmin', 'super_admin', 'owner']);
const EXPERT_ALIASES = new Set(['expert', 'reviewer', 'author']);
const GRADER_ALIASES = new Set(['grader', 'student', 'judge']);

/** @param {unknown} raw */
export function canonicalAppRole(raw) {
  const r = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!r) return null;
  if (ADMIN_ALIASES.has(r)) return 'admin';
  if (EXPERT_ALIASES.has(r)) return 'expert';
  if (GRADER_ALIASES.has(r)) return 'grader';
  return null;
}

/**
 * Prefer profiles.role, then Supabase user_metadata / app_metadata role.
 * @param {import('@supabase/supabase-js').User | null} user
 * @param {{ role?: string | null } | null} profile
 */
export function resolveAppRole(user, profile) {
  const tries = [profile?.role, user?.user_metadata?.role, user?.app_metadata?.role];
  for (const t of tries) {
    const c = canonicalAppRole(t);
    if (c) return c;
  }
  return 'grader';
}

export function roleHomePath(role) {
  const c = canonicalAppRole(role) || 'grader';
  if (c === 'admin') return '/admin';
  if (c === 'expert') return '/expert';
  return '/grader';
}

/**
 * @param {import('@supabase/supabase-js').User | null} user
 * @param {{ role?: string | null } | null} profile
 */
export function roleHomePathForUser(user, profile) {
  return roleHomePath(resolveAppRole(user, profile));
}

export function clearSupabaseLocalStorage() {
  const shouldDrop = (k) =>
    k.startsWith('sb-') || k.includes('supabase.auth') || k === 'supabase.auth.token';
  try {
    for (const store of [localStorage, sessionStorage]) {
      for (const k of [...Object.keys(store)]) {
        if (shouldDrop(k)) store.removeItem(k);
      }
    }
  } catch (_) {
    // ignore storage access errors
  }
}

export async function signOut() {
  // Local wipe first so logout cannot get stuck on Supabase internals.
  clearSupabaseLocalStorage();
  try {
    const sb = await getSupabase();
    await Promise.race([
      sb.auth.signOut({ scope: 'local' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('signOut timeout')), 2500)),
    ]);
  } catch (_) {
    // ignore: local storage already wiped
  } finally {
    clearSupabaseLocalStorage();
  }
}

export async function signOutAndRedirect() {
  await signOut();
  window.location.replace('/login');
}
