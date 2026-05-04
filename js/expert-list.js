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

/** Postgres / PostgREST may surface booleans inconsistently in edge cases */
function isWorldPublished(w) {
  if (!w) return false;
  const v = w.is_published;
  return v === true || v === 'true' || v === 't' || v === 1;
}

function reviewStatusLabel(payload) {
  const s = String(payload?.review?.status || 'draft').toLowerCase();
  if (s === 'in_review') return '<span class="badge badge-review-in">In review</span>';
  if (s === 'approved') return '<span class="badge badge-review-approved">Approved</span>';
  if (s === 'needs_rework') return '<span class="badge badge-review-rework">Needs rework</span>';
  return '<span class="badge badge-drf">Draft</span>';
}

const SEED_BENCHMARK_CREATOR_ID = '00000000-0000-4000-8000-000000000001';

function getSeedBenchmarkRow() {
  const payload =
    typeof window !== 'undefined' && window.PROJECT_HORIZON_SEED_PAYLOAD
      ? window.PROJECT_HORIZON_SEED_PAYLOAD
      : null;
  if (!payload) return null;
  return {
    id: 'seed-project-horizon',
    title: 'Project Horizon (Summit SaaS Solutions)',
    is_published: true,
    updated_at: new Date().toISOString(),
    creator_id: SEED_BENCHMARK_CREATOR_ID,
    payload,
  };
}

async function init() {
  const root = document.getElementById('expert-root');
  const ctx = await requireRoles(['expert', 'admin']);
  if (!ctx) return;
  try {
    sessionStorage.removeItem('apex_viewer_mode');
    sessionStorage.removeItem('apex_viewer_return_href');
  } catch (_) {}

  document.getElementById('email').textContent =
    ctx.profile.email || ctx.session.user.email || ctx.profile.id;

  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin && ctx.profile.role === 'admin') navAdmin.style.display = 'inline-block';

  const logoutBtn = document.getElementById('logout');
  logoutBtn?.addEventListener('click', async () => {
    await signOutAndRedirect();
  });

  window.addEventListener('pageshow', (ev) => {
    if (ev.persisted) location.reload();
  });

  const sb = await getSupabase();
  const { data: worlds, error } = await sb
    .from('worlds')
    .select('id,title,is_published,created_at,updated_at,creator_id,payload')
    .order('updated_at', { ascending: false });

  const tbody = document.getElementById('world-rows');
  const myWorldsWrap = document.getElementById('my-worlds-wrap');
  const choiceCreate = document.getElementById('choice-create');
  const newWorldBtn = document.getElementById('new-world');
  if (newWorldBtn) newWorldBtn.style.display = 'none';
  choiceCreate?.addEventListener('click', () => {
    if (myWorldsWrap) myWorldsWrap.style.display = 'block';
    if (newWorldBtn) newWorldBtn.style.display = 'inline-block';
    choiceCreate.disabled = true;
  });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted" style="padding:18px">Could not load worlds: ${esc(error.message)}. Run the latest SQL migration in Supabase if you added <code>payload</code>.</td></tr>`;
    return;
  }

  const uid = ctx.session.user.id;
  const sorted =
    worlds && worlds.length > 0
      ? [...worlds].sort((a, b) => {
          const aMine = a.creator_id === uid ? 0 : 1;
          const bMine = b.creator_id === uid ? 0 : 1;
          if (aMine !== bMine) return aMine - bMine;
          const ta = new Date(a.updated_at || 0).getTime();
          const tb = new Date(b.updated_at || 0).getTime();
          return tb - ta;
        })
      : [];

  const seedRow = getSeedBenchmarkRow();
  const tableRows = seedRow ? [seedRow, ...sorted] : sorted;

  if (!tableRows.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="muted" style="padding:18px">No worlds yet. Create one to open the editor.</td></tr>';
  } else {
    tbody.innerHTML = tableRows
      .map((w) => {
        const pub = isWorldPublished(w) ? '<span class="badge badge-pub">Published</span>' : reviewStatusLabel(w.payload || {});
        const isSeed = w.id === 'seed-project-horizon';
        const canDelete = !isSeed && (ctx.profile.role === 'admin' || w.creator_id === ctx.session.user.id);
        const canEdit = !isSeed && (ctx.profile.role === 'admin' || w.creator_id === ctx.session.user.id);
        const editCell = canEdit
          ? `<a class="btn btn-ghost" href="expert-world.html?id=${esc(w.id)}">Edit</a>`
          : '<span class="muted" style="font-size:12px">Published · read-only</span>';
        const titleCell = isSeed
          ? `<span style="font-weight:600;color:var(--text-primary)">${esc(w.title)} <span class="badge badge-pub" style="margin-left:6px">Benchmark</span></span>`
          : canEdit
            ? `<a href="expert-world.html?id=${esc(w.id)}" style="color:var(--accent);font-weight:500;text-decoration:none">${esc(w.title)}</a>`
            : `<span style="font-weight:500;color:var(--text-primary)">${esc(w.title)}</span>`;
        const creatorHint = isSeed
          ? 'Apex seed'
          : w.creator_id === ctx.session.user.id
            ? 'You'
            : ctx.profile.role === 'admin'
              ? esc(w.creator_id.slice(0, 8)) + '…'
              : '—';
        return `<tr>
          <td>${titleCell}</td>
          <td>${pub}</td>
          <td class="muted" style="font-family:var(--font-mono);font-size:12px">${fmtDate(w.updated_at)}</td>
          <td class="muted" style="font-size:12px">${creatorHint}</td>
          <td style="white-space:nowrap;text-align:right">
            ${editCell}
            <button type="button" class="btn btn-ghost" data-sample="${esc(w.id)}">Sample viewer</button>
            ${canDelete ? `<button type="button" class="btn btn-danger" data-delete="${esc(w.id)}">Delete</button>` : ''}
          </td>
        </tr>`;
      })
      .join('');
  }

  const buildViewerWorld = (row) => {
    const p = row?.payload || {};
    return {
      meta: p.meta || {
        id: row.id,
        name: row.title || 'Expert World',
        method: 'Accrual',
        period: '',
        archetype: '',
        totalFiles: 0,
        coreFiles: 0,
        noiseFiles: 0,
        tier: 'Tier 2 — Execution',
        tasks: 1,
      },
      transactions: Array.isArray(p.transactions) ? p.transactions : [],
      chartOfAccounts: Array.isArray(p.chartOfAccounts) ? p.chartOfAccounts : [],
      oldChartOfAccounts: Array.isArray(p.oldChartOfAccounts) ? p.oldChartOfAccounts : [],
      expensePolicy: Array.isArray(p.expensePolicy) ? p.expensePolicy : [],
      oldExpensePolicy: Array.isArray(p.oldExpensePolicy) ? p.oldExpensePolicy : [],
      invoices: Array.isArray(p.invoices) || (p.invoices && typeof p.invoices === 'object') ? p.invoices : [],
      rubric: Array.isArray(p.rubric) ? p.rubric : [],
      taskPrompt: typeof p.taskPrompt === 'string' ? p.taskPrompt : null,
      ambiguityTypes: Array.isArray(p.ambiguityTypes) ? p.ambiguityTypes : null,
      misleadingFiles: Array.isArray(p.misleadingFiles) ? p.misleadingFiles : null,
      uploadedFiles: Array.isArray(p.uploadedFiles) ? p.uploadedFiles : [],
    };
  };

  document.querySelectorAll('[data-sample]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-sample');
      const row = tableRows.find((w) => w.id === id);
      if (!row) return;
      try {
        sessionStorage.setItem('apex_viewer_mode', 'expert-world-preview');
        sessionStorage.setItem('apex_viewer_return_href', '/expert.html');
        sessionStorage.setItem('apex_active_world', JSON.stringify(buildViewerWorld(row)));
      } catch (_) {}
      window.open('/viewer.html', '_blank');
    });
  });

  document.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete');
      if (!id) return;
      if (!confirm('Delete this world? This cannot be undone.')) return;
      btn.disabled = true;
      const { error: delErr } = await sb.from('worlds').delete().eq('id', id);
      btn.disabled = false;
      if (delErr) {
        alert(delErr.message || 'Delete failed');
        return;
      }
      btn.closest('tr')?.remove();
    });
  });

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
