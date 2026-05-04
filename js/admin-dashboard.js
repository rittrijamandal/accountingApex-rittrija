import { requireRoles } from './auth-guard.js';
import { getSupabase, signOutAndRedirect } from './auth-core.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function mockData() {
  const now = new Date().toISOString();
  return {
    stats: { activeUsers: 24, publishedWorlds: 11, apiCallsToday: 137 },
    users: [
      { id: 'u_admin', email: 'admin@accountingapex.dev', role: 'admin', created_at: now, status: 'active' },
      { id: 'u_expert', email: 'expert@accountingapex.dev', role: 'expert', created_at: now, status: 'active' },
      { id: 'u_grader', email: 'grader@accountingapex.dev', role: 'grader', created_at: now, status: 'active' },
    ],
    worlds: [
      { id: 'w_1', title: 'Pixel & Pine Studio', creator_email: 'expert@accountingapex.dev', is_published: true, archetype: 'Cash-basis confusion' },
      { id: 'w_2', title: 'Month-end Close Pack', creator_email: 'expert@accountingapex.dev', is_published: false, archetype: 'Month-end close' },
    ],
    isMock: true,
  };
}

async function fetchData() {
  const sb = await getSupabase();

  const [{ data: profiles, error: profilesErr }, { data: worlds, error: worldsErr }, { data: reviewScores, error: reviewErr }] = await Promise.all([
    sb.from('profiles').select('id,email,role,created_at').order('created_at', { ascending: false }),
    sb
      .from('worlds')
      .select('id,title,creator_id,is_published,payload,created_at')
      .order('created_at', { ascending: false }),
    sb.from('world_review_scores').select('world_id,reviewer_id,score,notes,updated_at'),
  ]);

  if (profilesErr || worldsErr || reviewErr) throw profilesErr || worldsErr || reviewErr;

  const userById = new Map((profiles || []).map((u) => [u.id, u]));
  const expertProfiles = (profiles || []).filter((u) => u.role === 'expert');
  const scoresByWorld = new Map();
  (reviewScores || []).forEach((r) => {
    if (!scoresByWorld.has(r.world_id)) scoresByWorld.set(r.world_id, []);
    scoresByWorld.get(r.world_id).push(r);
  });
  const publishedWorlds = (worlds || []).filter((w) => w.is_published).length;
  const apiCallsToday = Number(localStorage.getItem('apex_admin_api_calls_today') || 0);

  return {
    stats: {
      activeUsers: (profiles || []).length,
      publishedWorlds,
      apiCallsToday,
    },
    users: (profiles || []).map((u) => ({ ...u, status: 'active' })),
    worlds: (worlds || []).map((w) => ({
      ...(w),
      creator_email: userById.get(w.creator_id)?.email || w.creator_id,
      archetype: w.payload?.meta?.archetype || '—',
      review_scores: (scoresByWorld.get(w.id) || []).map((r) => ({
        ...r,
        reviewer_email: userById.get(r.reviewer_id)?.email || r.reviewer_id,
      })),
      pending_reviewers: expertProfiles
        .filter((u) => u.id !== w.creator_id)
        .map((u) => u.email || u.id)
        .filter((email) => {
          const submitted = (scoresByWorld.get(w.id) || []).some((r) => (userById.get(r.reviewer_id)?.email || r.reviewer_id) === email);
          return !submitted;
        })
        .slice(0, 3),
    })),
    isMock: false,
  };
}

function reviewStatusOf(world) {
  return String(world?.payload?.review?.status || 'draft').toLowerCase();
}

function reviewStatusBadge(world) {
  const s = reviewStatusOf(world);
  if (s === 'in_review') return '<span class="badge badge-review-in">In review</span>';
  if (s === 'approved') return '<span class="badge badge-review-approved">Approved</span>';
  if (s === 'needs_rework') return '<span class="badge badge-review-rework">Needs rework</span>';
  return '<span class="badge badge-drf">Draft</span>';
}

function initials(emailOrId) {
  const txt = String(emailOrId || '');
  if (txt.includes('@')) return txt.slice(0, 2).toUpperCase();
  return txt.slice(0, 2).toUpperCase();
}

function reviewerDots(world) {
  const rows = Array.isArray(world.review_scores) ? [...world.review_scores] : [];
  const reveal = rows.length >= 3;
  const dots = Array.from({ length: 3 }, (_, i) => {
    const r = rows[i];
    if (!r) return '<span class="reviewer-dot" title="Pending"></span>';
    const tip = reveal ? `${r.reviewer_email} | Score: ${r.score} | ${r.notes || 'No notes'}` : `${r.reviewer_email} submitted`;
    return `<span class="reviewer-dot" title="${esc(tip)}">${esc(initials(r.reviewer_email))}</span>`;
  });
  return `<span style="display:inline-flex;gap:4px">${dots.join('')}</span>`;
}

function pendingReviewerText(world) {
  const pending = Array.isArray(world.pending_reviewers) ? world.pending_reviewers : [];
  if (!pending.length) return '—';
  return pending.join(', ');
}

function renderShell(ctx, data) {
  const app = document.getElementById('admin-app');
  app.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-head">
          <div class="brand">
            <img src="/assets/symbal-logo.png" alt="" />
            <div>
              <div class="brand-kicker">Platform</div>
              <div class="brand-name">Accounting Apex</div>
            </div>
          </div>
        </div>

        <nav class="admin-nav-list">
          <button type="button" data-nav-target="overview" class="admin-nav active">Overview</button>
          <button type="button" data-nav-target="users" class="admin-nav">User directory</button>
          <button type="button" data-nav-target="worlds" class="admin-nav">World directory</button>
          <button type="button" data-nav-target="analytics" class="admin-nav">System analytics</button>
        </nav>

        <div class="admin-sidebar-foot">
          <button id="btn-settings" type="button" class="btn btn-ghost">Global settings</button>
          <button id="btn-logout" type="button" class="btn btn-ghost">Sign out</button>
        </div>
      </aside>

      <section class="admin-content">
        <header class="admin-topbar">
          <input id="search" class="search" placeholder="Search users or worlds…" />
          <button id="btn-fullscreen" type="button" class="btn-ghost btn" style="height:36px">Fullscreen</button>
          <div class="who">${esc(ctx.profile.email || ctx.session.user.email || ctx.profile.id)}</div>
        </header>

        <main class="admin-main">
          <section id="section-overview" class="admin-section is-active">
            <div class="stat-grid">
              ${statCard('Active users', data.stats.activeUsers, '')}
              ${statCard('Published worlds', data.stats.publishedWorlds, 'pos')}
              ${statCard('API calls today', data.stats.apiCallsToday, 'warn')}
            </div>
          </section>

          <section id="section-users" class="admin-section admin-card">
            <div class="admin-card-head">User management</div>
            <div style="overflow-x:auto">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th class="right">Actions</th>
                  </tr>
                </thead>
                <tbody id="user-rows">
                  ${userRows(data.users)}
                </tbody>
              </table>
            </div>
          </section>

          <section id="section-worlds" class="admin-section admin-card">
            <div class="admin-card-head">World directory</div>
            <div style="overflow-x:auto">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>World</th>
                    <th>Creator</th>
                    <th>Status</th>
                    <th>Archetype</th>
                    <th>Review</th>
                    <th>Reviewed</th>
                    <th>Reviewers</th>
                    <th>Pending</th>
                    <th>Median</th>
                    <th class="right">Actions</th>
                  </tr>
                </thead>
                <tbody id="world-rows">
                  ${worldRows(data.worlds)}
                </tbody>
              </table>
            </div>
          </section>

          <section id="section-analytics" class="admin-section">
            <div class="stat-grid">
              ${statCard('Role changes (7d)', data.isMock ? 12 : 0, 'accent')}
              ${statCard('World deletes (7d)', data.isMock ? 3 : 0, 'danger')}
              ${statCard('Published today', data.isMock ? 2 : 0, 'pos')}
              ${statCard('Impersonations (7d)', data.isMock ? 9 : 0, 'warn')}
            </div>
            <div class="analytics-note" style="margin-top:16px">
              ${data.isMock
                ? 'Mock analytics mode — connect live event tables to replace these placeholders.'
                : 'Live mode — wire audit and event tables to populate these analytics counters.'}
            </div>
          </section>
        </main>
      </section>
    </div>
  `;
}

function statCard(label, value, modifier) {
  const cls = modifier ? `stat-value ${modifier}` : 'stat-value';
  return `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="${cls}">${value}</div>
    </div>
  `;
}

function userRows(users) {
  if (!users.length) return `<tr><td colspan="5" class="admin-empty">No users found.</td></tr>`;
  return users
    .map(
      (u) => `
      <tr>
        <td>${esc(u.email || u.id)}</td>
        <td>
          <select data-role-user="${esc(u.id)}" class="role-select">
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="expert" ${u.role === 'expert' ? 'selected' : ''}>Expert</option>
            <option value="grader" ${u.role === 'grader' ? 'selected' : ''}>Grader</option>
          </select>
        </td>
        <td class="muted">${fmtDate(u.created_at)}</td>
        <td class="muted">${esc(u.status || 'active')}</td>
        <td class="right">
          <button type="button" data-impersonate-user="${esc(u.id)}" data-impersonate-role="${esc(u.role)}" class="row-action">View as</button>
        </td>
      </tr>
    `
    )
    .join('');
}

function worldRows(worlds) {
  if (!worlds.length) return `<tr><td colspan="10" class="admin-empty">No worlds found.</td></tr>`;
  return worlds
    .map(
      (w) => `
      <tr>
        <td style="font-weight:500">${esc(w.title)}</td>
        <td class="muted">${esc(w.creator_email || w.creator_id)}</td>
        <td>${w.is_published ? '<span class="badge badge-pub">Published</span>' : '<span class="badge badge-drf">Draft</span>'}</td>
        <td class="muted">${esc(w.archetype || '—')}</td>
        <td>${reviewStatusBadge(w)}</td>
        <td class="muted">${Math.max(0, Math.min(3, Number(w.payload?.review?.reviewer_count || w.review_scores?.length || 0)))} / 3</td>
        <td>${reviewerDots(w)}</td>
        <td class="muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(pendingReviewerText(w))}">${esc(pendingReviewerText(w))}</td>
        <td class="muted">${w.payload?.review?.reviewer_count >= 3 && w.payload?.review?.median_score != null ? Number(w.payload.review.median_score).toFixed(1) : '—'}</td>
        <td class="right" style="white-space:nowrap">
          <button type="button" data-force-delete="${esc(w.id)}" class="row-action danger">Delete</button>
          <button type="button" data-toggle-published="${esc(w.id)}" data-current-published="${w.is_published ? '1' : '0'}" class="row-action">${w.is_published ? 'Unpublish' : 'Publish'}</button>
          <button type="button" data-god-edit="${esc(w.id)}" class="row-action accent">Edit</button>
        </td>
      </tr>
    `
    )
    .join('');
}

function wireUi(ctx, data) {
  const sbPromise = getSupabase();

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await signOutAndRedirect();
  });

  document.getElementById('btn-settings')?.addEventListener('click', () => {
    alert('Global settings panel is planned for a later phase.');
  });

  document.getElementById('btn-fullscreen')?.addEventListener('click', async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });

  const search = document.getElementById('search');
  search?.addEventListener('input', () => {
    const q = String(search.value || '').toLowerCase().trim();
    filterRows('user-rows', q);
    filterRows('world-rows', q);
  });

  const navButtons = [...document.querySelectorAll('.admin-nav')];
  const setActiveSection = (key) => {
    const ids = ['overview', 'users', 'worlds', 'analytics'];
    ids.forEach((id) => {
      const section = document.getElementById(`section-${id}`);
      if (section) section.classList.toggle('is-active', id === key);
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-nav-target') === key);
    });
  };

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-nav-target');
      if (key) setActiveSection(key);
    });
  });
  setActiveSection('overview');

  document.querySelectorAll('[data-role-user]').forEach((el) => {
    el.addEventListener('change', async () => {
      if (data.isMock) return;
      const userId = el.getAttribute('data-role-user');
      const role = el.value;
      if (!userId) return;
      const sb = await sbPromise;
      const { error } = await sb.from('profiles').update({ role }).eq('id', userId);
      if (error) alert(error.message || 'Role update failed');
    });
  });

  document.querySelectorAll('[data-force-delete]').forEach((el) => {
    el.addEventListener('click', async () => {
      if (!confirm('Force delete this world? This cannot be undone.')) return;
      if (data.isMock) return;
      const worldId = el.getAttribute('data-force-delete');
      if (!worldId) return;
      const sb = await sbPromise;
      const { error } = await sb.from('worlds').delete().eq('id', worldId);
      if (error) return alert(error.message || 'Delete failed');
      el.closest('tr')?.remove();
    });
  });

  document.querySelectorAll('[data-toggle-published]').forEach((el) => {
    el.addEventListener('click', async () => {
      if (data.isMock) return;
      const worldId = el.getAttribute('data-toggle-published');
      const curr = el.getAttribute('data-current-published') === '1';
      if (!worldId) return;
      const sb = await sbPromise;
      const { error } = await sb.from('worlds').update({ is_published: !curr }).eq('id', worldId);
      if (error) return alert(error.message || 'Update failed');
      window.location.reload();
    });
  });

  document.querySelectorAll('[data-god-edit]').forEach((el) => {
    el.addEventListener('click', () => {
      const worldId = el.getAttribute('data-god-edit');
      if (!worldId) return;
      window.location.href = `/expert-world.html?id=${encodeURIComponent(worldId)}&isAdminOverride=true`;
    });
  });

  document.querySelectorAll('[data-impersonate-user]').forEach((el) => {
    el.addEventListener('click', () => {
      const userId = el.getAttribute('data-impersonate-user');
      const role = el.getAttribute('data-impersonate-role');
      if (!userId || !role) return;
      alert(`View as requested for ${userId} (${role}). Expert / Grader impersonation will be wired in a later phase.`);
    });
  });
}

function filterRows(tbodyId, q) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  [...tbody.querySelectorAll('tr')].forEach((tr) => {
    const txt = tr.textContent.toLowerCase();
    tr.style.display = !q || txt.includes(q) ? '' : 'none';
  });
}

window.addEventListener('pageshow', (ev) => {
  if (ev.persisted) window.location.reload();
});

function renderFatal(msg) {
  const app = document.getElementById('admin-app');
  if (!app) return;
  app.innerHTML = `
    <div style="height:100vh;display:flex;align-items:center;justify-content:center;padding:24px">
      <div class="admin-card" style="max-width:560px;padding:24px">
        <div class="stat-label" style="margin-bottom:8px">Admin console error</div>
        <div style="font-size:14px;color:var(--text-primary);margin-bottom:16px;line-height:1.5">${esc(msg || 'Unknown error')}</div>
        <button id="admin-retry" type="button" class="btn btn-ghost">Reload</button>
      </div>
    </div>
  `;
  document.getElementById('admin-retry')?.addEventListener('click', () => window.location.reload());
}

try {
  const ctx = await requireRoles(['admin']);
  if (!ctx) {
    // requireRoles handles redirects; avoid throwing and blanking the page.
  } else {
    let data;
    try {
      data = await fetchData();
      if (!data.users.length && !data.worlds.length) data = mockData();
    } catch (_e) {
      data = mockData();
    }

    renderShell(ctx, data);
    wireUi(ctx, data);
  }
} catch (e) {
  renderFatal(e?.message || 'Failed to load admin dashboard.');
}
