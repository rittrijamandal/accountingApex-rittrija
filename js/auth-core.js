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

/** Remove Supabase session from localStorage (keys like sb-<ref>-auth-token). */
export function clearSupabaseLocalStorage() {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('sb-')) localStorage.removeItem(k);
    }
  } catch (_) {
    /* ignore */
  }
}

/**
 * End session and drop cached client. Uses scope 'local' so it works even if revoke API fails.
 * Always clears storage so the next page load is logged out.
 */
export async function signOut() {
  try {
    const sb = await getSupabase();
    const { error } = await sb.auth.signOut({ scope: 'local' });
    if (error) console.warn('[apex] signOut:', error.message);
  } catch (e) {
    console.warn('[apex] signOut failed (still clearing local session):', e);
  } finally {
    clearSupabaseLocalStorage();
    client = null;
    boot = null;
  }
}

/** Works for pages served from the app root (e.g. /admin.html → /login.html). */
export function goToLogin() {
  window.location.href = '/login.html';
}

export async function signOutAndRedirect() {
  await signOut();
  goToLogin();
}
