import { getSession, fetchMyProfile, roleHomePath } from './auth-core.js';

const statusEl = document.getElementById('status');

(async () => {
  try {
    if (statusEl) statusEl.textContent = 'Checking your session…';
    const session = await getSession();
    if (!session) {
      if (statusEl) statusEl.textContent = 'Redirecting to sign in…';
      window.location.replace('/login.html');
      return;
    }
    if (statusEl) statusEl.textContent = 'Loading your profile…';
    const profile = await fetchMyProfile();
    if (!profile) {
      if (statusEl) statusEl.textContent = 'Redirecting to sign in…';
      window.location.replace('/login.html');
      return;
    }
    if (statusEl) statusEl.textContent = 'Redirecting to your workspace…';
    window.location.replace(roleHomePath(profile.role));
  } catch (e) {
    document.getElementById('msg').textContent = e.message || String(e);
    document.getElementById('fallback').hidden = false;
  }
})();
