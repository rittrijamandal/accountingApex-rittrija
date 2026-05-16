import { getSession, fetchMyProfile, roleHomePathForUser, getSupabase } from './auth-core.js';

const statusEl = document.getElementById('status');

(async () => {
  try {
    if (statusEl) statusEl.textContent = 'CHECKING SESSION…';
    const session = await getSession();
    if (!session) {
      if (statusEl) statusEl.textContent = 'REDIRECTING TO LOGIN…';
      window.location.replace('/login');
      return;
    }
    if (statusEl) statusEl.textContent = 'LOADING PROFILE…';
    const profile = await fetchMyProfile();
    if (!profile) {
      if (statusEl) statusEl.textContent = 'REDIRECTING TO LOGIN…';
      window.location.replace('/login');
      return;
    }
    const sb = await getSupabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      if (statusEl) statusEl.textContent = 'REDIRECTING TO LOGIN…';
      window.location.replace('/login');
      return;
    }
    if (statusEl) statusEl.textContent = 'REDIRECTING…';
    window.location.replace(roleHomePathForUser(user, profile));
  } catch (e) {
    document.getElementById('msg').textContent = e.message || String(e);
    document.getElementById('fallback').hidden = false;
  }
})();
