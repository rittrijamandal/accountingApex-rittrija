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

  const [{ data: profiles, error: profilesErr }, { data: worlds, error: worldsErr }] = await Promise.all([
    sb.from('profiles').select('id,email,role,created_at').order('created_at', { ascending: false }),
    sb
      .from('worlds')
      .select('id,title,creator_id,is_published,payload,created_at')
      .order('created_at', { ascending: false }),
  ]);

  if (profilesErr || worldsErr) throw profilesErr || worldsErr;

  const userById = new Map((profiles || []).map((u) => [u.id, u]));
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
      ...w,
      creator_email: userById.get(w.creator_id)?.email || w.creator_id,
      archetype: w.payload?.meta?.archetype || '—',
    })),
    isMock: false,
  };
}

function renderShell(ctx, data) {
  const app = document.getElementById('admin-app');
  app.innerHTML = `
    <div class="h-full grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside class="border-r border-apexBorder bg-apexCard flex flex-col min-h-0">
        <div class="px-5 py-4 border-b border-apexBorder">
          <div class="flex items-center gap-3">
            <img src="/assets/symbal-logo.png" alt="" class="w-8 h-8 object-contain" />
            <div>
              <div class="text-[10px] uppercase tracking-[0.12em] text-apexMuted">Platform</div>
              <div class="text-sm font-semibold tracking-[0.06em]">Accounting APEX</div>
            </div>
          </div>
        </div>

        <nav class="p-3 space-y-1 text-[11px] uppercase tracking-[0.08em] font-semibold">
          <button type="button" data-nav-target="overview" class="admin-nav block w-full text-left px-3 py-2 bg-apexAccentSoft text-apexAccent border-l-2 border-apexAccent rounded-none">Overview</button>
          <button type="button" data-nav-target="users" class="admin-nav block w-full text-left px-3 py-2 text-apexMuted hover:bg-slate-50 rounded-none">User Directory</button>
          <button type="button" data-nav-target="worlds" class="admin-nav block w-full text-left px-3 py-2 text-apexMuted hover:bg-slate-50 rounded-none">World Directory</button>
          <button type="button" data-nav-target="analytics" class="admin-nav block w-full text-left px-3 py-2 text-apexMuted hover:bg-slate-50 rounded-none">System Analytics</button>
        </nav>

        <div class="mt-auto border-t border-apexBorder p-3 space-y-2">
          <button id="btn-settings" type="button" class="w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] border border-apexBorder text-apexMuted hover:bg-slate-50 rounded-none">⚙ Global Settings</button>
          <button id="btn-logout" type="button" class="w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] border border-apexBorder text-apexMuted hover:bg-slate-50 rounded-none">Log Out</button>
        </div>
      </aside>

      <section class="min-h-0 overflow-auto">
        <header class="h-14 border-b border-apexBorder bg-apexCard px-5 flex items-center gap-3">
          <input id="search" class="rounded-none border border-apexBorder bg-slate-50 px-3 py-2 text-sm w-full max-w-xl focus:outline-none focus:border-apexAccent" placeholder="Search users or worlds..." />
          <button id="btn-fullscreen" type="button" class="rounded-none border border-apexBorder px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-apexMuted hover:bg-slate-50">⛶</button>
          <div class="ml-auto text-xs text-apexMuted whitespace-nowrap">${esc(
            ctx.profile.email || ctx.session.user.email || ctx.profile.id
          )}</div>
        </header>

        <main class="p-5 space-y-5">
          <section id="section-overview" class="admin-section">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${statCard('Total Active Users', data.stats.activeUsers, 'text-apexText')}
            ${statCard('Total Published Worlds', data.stats.publishedWorlds, 'text-apexPos')}
            ${statCard('Claude API Calls Today', data.stats.apiCallsToday, 'text-apexWarn')}
            </div>
          </section>

          <section id="section-users" class="admin-section hidden border border-apexBorder bg-apexCard">
            <div class="px-4 py-3 border-b border-apexBorder text-[11px] uppercase tracking-[0.1em] text-apexMuted font-semibold">User Management Console</div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-[12px]">
                <thead class="bg-slate-50 text-apexMuted uppercase tracking-[0.08em] text-[10px]">
                  <tr>
                    <th class="text-left px-3 py-2">Email</th>
                    <th class="text-left px-3 py-2">Current Role</th>
                    <th class="text-left px-3 py-2">Join Date</th>
                    <th class="text-left px-3 py-2">Status</th>
                    <th class="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody id="user-rows">
                  ${userRows(data.users)}
                </tbody>
              </table>
            </div>
          </section>

          <section id="section-worlds" class="admin-section hidden border border-apexBorder bg-apexCard">
            <div class="px-4 py-3 border-b border-apexBorder text-[11px] uppercase tracking-[0.1em] text-apexMuted font-semibold">Global World Directory</div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-[12px]">
                <thead class="bg-slate-50 text-apexMuted uppercase tracking-[0.08em] text-[10px]">
                  <tr>
                    <th class="text-left px-3 py-2">World Name</th>
                    <th class="text-left px-3 py-2">Creator Email</th>
                    <th class="text-left px-3 py-2">Status</th>
                    <th class="text-left px-3 py-2">Task Archetype</th>
                    <th class="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody id="world-rows">
                  ${worldRows(data.worlds)}
                </tbody>
              </table>
            </div>
          </section>

          <section id="section-analytics" class="admin-section hidden space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              ${statCard('Role Changes (7d)', data.isMock ? 12 : 0, 'text-apexAccent')}
              ${statCard('World Deletes (7d)', data.isMock ? 3 : 0, 'text-apexDanger')}
              ${statCard('Published Today', data.isMock ? 2 : 0, 'text-apexPos')}
              ${statCard('Impersonations (7d)', data.isMock ? 9 : 0, 'text-apexWarn')}
            </div>
            <div class="border border-apexBorder bg-apexCard p-4 text-xs text-apexMuted font-mono">
              ${data.isMock
                ? 'Mock analytics mode: connect live event tables to replace these placeholders.'
                : 'Live mode: wire audit/event tables to populate these analytics counters.'}
            </div>
          </section>
        </main>
      </section>
    </div>
  `;
}

function statCard(label, value, valueClass) {
  return `
    <div class="border border-apexBorder bg-apexCard p-4 rounded-none">
      <div class="text-[10px] uppercase tracking-[0.08em] text-apexMuted">${label}</div>
      <div class="mt-2 text-2xl font-semibold ${valueClass}">${value}</div>
    </div>
  `;
}

function userRows(users) {
  if (!users.length) return `<tr><td colspan="5" class="px-3 py-4 text-apexMuted">No users found.</td></tr>`;
  return users
    .map(
      (u) => `
      <tr class="border-t border-apexBorder hover:bg-slate-50">
        <td class="px-3 py-2">${esc(u.email || u.id)}</td>
        <td class="px-3 py-2">
          <select data-role-user="${esc(u.id)}" class="rounded-none border border-apexBorder bg-white px-2 py-1 text-[11px] focus:outline-none focus:border-apexAccent">
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="expert" ${u.role === 'expert' ? 'selected' : ''}>Expert</option>
            <option value="grader" ${u.role === 'grader' ? 'selected' : ''}>Grader</option>
          </select>
        </td>
        <td class="px-3 py-2">${fmtDate(u.created_at)}</td>
        <td class="px-3 py-2">${esc(u.status || 'active')}</td>
        <td class="px-3 py-2 text-right">
          <button type="button" data-impersonate-user="${esc(
            u.id
          )}" data-impersonate-role="${esc(u.role)}" class="rounded-none border border-apexBorder px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-apexMuted hover:bg-slate-50">View As</button>
        </td>
      </tr>
    `
    )
    .join('');
}

function worldRows(worlds) {
  if (!worlds.length) return `<tr><td colspan="5" class="px-3 py-4 text-apexMuted">No worlds found.</td></tr>`;
  return worlds
    .map(
      (w) => `
      <tr class="border-t border-apexBorder hover:bg-slate-50">
        <td class="px-3 py-2">${esc(w.title)}</td>
        <td class="px-3 py-2">${esc(w.creator_email || w.creator_id)}</td>
        <td class="px-3 py-2">${w.is_published ? 'Published' : 'Draft'}</td>
        <td class="px-3 py-2">${esc(w.archetype || '—')}</td>
        <td class="px-3 py-2 text-right space-x-1">
          <button type="button" data-force-delete="${esc(
            w.id
          )}" class="rounded-none border border-apexBorder px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-apexDanger hover:bg-red-50">Delete</button>
          <button type="button" data-toggle-published="${esc(
            w.id
          )}" data-current-published="${w.is_published ? '1' : '0'}" class="rounded-none border border-apexBorder px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-apexMuted hover:bg-slate-50">Publish</button>
          <button type="button" data-god-edit="${esc(
            w.id
          )}" class="rounded-none border border-apexBorder px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-apexAccent hover:bg-blue-50">Edit</button>
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
    alert('Global Settings panel is planned for a later phase.');
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
      if (section) section.classList.toggle('hidden', id !== key);
    });
    navButtons.forEach((btn) => {
      const active = btn.getAttribute('data-nav-target') === key;
      btn.classList.toggle('bg-apexAccentSoft', active);
      btn.classList.toggle('text-apexAccent', active);
      btn.classList.toggle('border-l-2', active);
      btn.classList.toggle('border-apexAccent', active);
      btn.classList.toggle('text-apexMuted', !active);
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
      if (!confirm('Force delete this world?')) return;
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
      // Placeholder route contract for later editor override flow.
      window.location.href = `/expert-world.html?id=${encodeURIComponent(worldId)}&isAdminOverride=true`;
    });
  });

  document.querySelectorAll('[data-impersonate-user]').forEach((el) => {
    el.addEventListener('click', () => {
      const userId = el.getAttribute('data-impersonate-user');
      const role = el.getAttribute('data-impersonate-role');
      if (!userId || !role) return;
      alert(`View As requested for ${userId} (${role}). Expert/Grader impersonation UI will be wired in next phase.`);
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

const ctx = await requireRoles(['admin']);
if (!ctx) throw new Error('Unauthorized');

let data;
try {
  data = await fetchData();
  if (!data.users.length && !data.worlds.length) data = mockData();
} catch (_e) {
  data = mockData();
}

renderShell(ctx, data);
wireUi(ctx, data);

