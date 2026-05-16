import { getSession, fetchMyProfile, roleHomePath, getSupabase, resolveAppRole } from './auth-core.js';

/**
 * @param {string[]} allowedRoles e.g. ['admin']
 */
export async function requireRoles(allowedRoles) {
  const session = await getSession();
  if (!session) {
    window.location.replace('/login');
    return null;
  }
  const profile = await fetchMyProfile();
  if (!profile) {
    window.location.replace('/login');
    return null;
  }
  const sb = await getSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const effective = resolveAppRole(user, profile);
  if (!allowedRoles.includes(effective)) {
    window.location.replace(roleHomePath(effective));
    return null;
  }
  return { session, profile };
}
