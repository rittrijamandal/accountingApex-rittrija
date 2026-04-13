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
  window.location.replace('/login.html');
}
