import { getSupabase, signOutAndRedirect } from './auth-core.js';
import { requireRoles } from './auth-guard.js';
import { emptyPayload } from './world-payload.js';

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

async function init() {
  const root = document.getElementById('expert-root');
  const ctx = await requireRoles(['expert', 'admin']);
  if (!ctx) return;

  document.getElementById('email').textContent =
    ctx.profile.email || ctx.session.user.email || ctx.profile.id;

  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin && ctx.profile.role === 'admin') navAdmin.style.display = 'inline-flex';

  document.getElementById('logout').addEventListener('click', () => {
    void signOutAndRedirect();
  });

  const sb = await getSupabase();
  const { data: worlds, error } = await sb
    .from('worlds')
    .select('id,title,is_published,created_at,updated_at,creator_id')
    .order('updated_at', { ascending: false });

  const tbody = document.getElementById('world-rows');
  if (error) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted" style="padding:16px">Could not load worlds: ${esc(error.message)}. If you just added the <code>payload</code> column, run the latest SQL migration in Supabase.</td></tr>`;
    return;
  }

  if (!worlds?.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="muted" style="padding:16px">No worlds yet. Create one to open the full editor.</td></tr>';
  } else {
    tbody.innerHTML = worlds
      .map((w) => {
        const pub = w.is_published
          ? '<span class="badge badge-pub">Published</span>'
          : '<span class="badge badge-drf">Draft</span>';
        return `<tr>
          <td><a href="expert-world.html?id=${esc(w.id)}" style="color:var(--green);font-weight:600">${esc(w.title)}</a></td>
          <td>${pub}</td>
          <td class="muted" style="font-family:var(--mono);font-size:12px">${fmtDate(w.updated_at)}</td>
          <td class="muted" style="font-size:12px">${w.creator_id === ctx.session.user.id ? 'Yours' : ctx.profile.role === 'admin' ? esc(w.creator_id.slice(0, 8)) + '…' : '—'}</td>
          <td><a class="btn btn-ghost" style="padding:6px 12px;font-size:12px" href="expert-world.html?id=${esc(w.id)}">Edit</a></td>
        </tr>`;
      })
      .join('');
  }

  document.getElementById('new-world').addEventListener('click', async () => {
    const btn = document.getElementById('new-world');
    btn.disabled = true;
    const pl = emptyPayload();
    pl.meta.name = 'New business';
    pl.meta.period = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const { data, error: insErr } = await sb
      .from('worlds')
      .insert({
        title: 'Untitled world',
        creator_id: ctx.session.user.id,
        is_published: false,
        payload: pl,
      })
      .select('id')
      .single();
    btn.disabled = false;
    if (insErr) {
      alert(insErr.message);
      return;
    }
    window.location.href = `expert-world.html?id=${data.id}`;
  });
}

init();
