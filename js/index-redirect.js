import { getSession, fetchMyProfile, roleHomePath } from './auth-core.js';

const statusEl = document.getElementById('status');

(async () => {
  try {
    if (statusEl) statusEl.textContent = 'Checking session…';
    const session = await getSession();
    if (!session) {
      if (statusEl) statusEl.textContent = 'Redirecting to login…';
      window.location.replace('/login.html');
      return;
    }
    if (statusEl) statusEl.textContent = 'Loading profile…';
    const profile = await fetchMyProfile();
    if (!profile) {
      if (statusEl) statusEl.textContent = 'Redirecting to login…';
      window.location.replace('/login.html');
      return;
    }
    if (statusEl) statusEl.textContent = 'Redirecting…';
    window.location.replace(roleHomePath(profile.role));
  } catch (e) {
    document.getElementById('msg').textContent = e.message || String(e);
    document.getElementById('fallback').hidden = false;
  }
})();
