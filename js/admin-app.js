import { requireRoles } from './auth-guard.js';
import { getSupabase, signOutAndRedirect } from './auth-core.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

const ROLES = ['admin', 'expert', 'grader'];

function roleSelect(userId, current, selfId) {
  const opts = ROLES.map(
    (r) => `<option value="${r}" ${r === current ? 'selected' : ''}>${r}</option>`
  ).join('');
  return `<select data-role-user="${esc(userId)}" aria-label="Role">${opts}</select>`;
}

async function loadAndRender(sb, selfId, mountUsers, mountWorlds, statusEl) {
  const [{ data: profiles, error: pe }, { data: worlds, error: we }] = await Promise.all([
    sb.from('profiles').select('id,email,display_name,role,created_at').order('email', { ascending: true }),
    sb.from('worlds').select('id,title,is_published,creator_id,created_at,updated_at').order('updated_at', { ascending: false }),
  ]);

  if (pe) {
    mountUsers.innerHTML = `<p class="msg-err">${esc(pe.message)}</p>`;
    return;
  }
  if (we) {
    mountWorlds.innerHTML = `<p class="msg-err">${esc(we.message)}</p>`;
    return;
  }

  const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

  mountUsers.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Email</th><th>Display name</th><th>Role</th><th></th><th>Worlds</th></tr></thead>
      <tbody>
        ${(profiles || [])
          .map((p) => {
            const wc = (worlds || []).filter((w) => w.creator_id === p.id).length;
            return `<tr data-user-row="${esc(p.id)}">
              <td>${esc(p.email || p.id)}</td>
              <td class="muted">${esc(p.display_name || '—')}</td>
              <td>${roleSelect(p.id, p.role, selfId)}</td>
              <td><button type="button" class="btn btn-inline btn-ghost js-save-role" data-user="${esc(p.id)}">Save role</button></td>
              <td>${wc}</td>
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>`;

  mountWorlds.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>World</th><th>Creator</th><th>Status</th><th>Updated</th><th></th></tr></thead>
      <tbody>
        ${(worlds || []).length === 0
          ? '<tr><td colspan="5" class="muted">No worlds yet.</td></tr>'
          : (worlds || [])
              .map((w) => {
                const cr = byId[w.creator_id];
                const em = cr?.email || w.creator_id?.slice(0, 8) + '…';
                const st = w.is_published ? '<span style="color:var(--green)">Published</span>' : 'Draft';
                return `<tr>
                  <td>${esc(w.title)}</td>
                  <td>${esc(em)}</td>
                  <td>${st}</td>
                  <td class="muted" style="font-size:12px">${fmtDate(w.updated_at)}</td>
                  <td><a class="btn btn-inline btn-ghost" style="text-decoration:none" href="expert-world.html?id=${esc(w.id)}">Edit</a></td>
                </tr>`;
              })
              .join('')}
      </tbody>
    </table>`;

  mountUsers.querySelectorAll('.js-save-role').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const uid = btn.getAttribute('data-user');
      const sel = mountUsers.querySelector(`select[data-role-user="${uid}"]`);
      if (!sel) return;
      const role = sel.value;
      if (uid === selfId && role !== 'admin') {
        if (!confirm('Change your own role away from admin? You may lose access to this page until another admin restores you.')) return;
      }
      statusEl.textContent = 'Saving…';
      statusEl.className = 'muted';
      const { error } = await sb.from('profiles').update({ role }).eq('id', uid);
      if (error) {
        statusEl.textContent = error.message;
        statusEl.className = 'msg-err';
        return;
      }
      statusEl.textContent = 'Role updated.';
      statusEl.className = 'msg-ok';
      if (uid === selfId && role !== 'admin') {
        window.location.href = '/login.html';
        return;
      }
      await loadAndRender(sb, selfId, mountUsers, mountWorlds, statusEl);
    });
  });
}

async function init() {
  const ctx = await requireRoles(['admin']);
  if (!ctx) return;

  document.getElementById('email').textContent =
    ctx.profile.email || ctx.session.user.email || ctx.profile.id;

  document.getElementById('logout').addEventListener('click', () => {
    void signOutAndRedirect();
  });

  const sb = await getSupabase();
  const selfId = ctx.session.user.id;
  const mountUsers = document.getElementById('admin-users');
  const mountWorlds = document.getElementById('admin-worlds');
  const statusEl = document.getElementById('admin-status');

  await loadAndRender(sb, selfId, mountUsers, mountWorlds, statusEl);
}

init();
