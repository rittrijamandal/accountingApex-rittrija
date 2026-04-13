import { getSession, fetchMyProfile, roleHomePath } from './auth-core.js';

/**
 * @param {string[]} allowedRoles e.g. ['admin']
 */
export async function requireRoles(allowedRoles) {
  const session = await getSession();
  if (!session) {
    window.location.replace('/login.html');
    return null;
  }
  const profile = await fetchMyProfile();
  if (!profile) {
    window.location.replace('/login.html');
    return null;
  }
  if (!allowedRoles.includes(profile.role)) {
    window.location.replace(roleHomePath(profile.role));
    return null;
  }
  return { session, profile };
}
