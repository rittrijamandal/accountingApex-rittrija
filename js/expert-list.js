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
  if (error) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted" style="padding:16px">COULD NOT LOAD WORLDS: ${esc(error.message)}. RUN THE LATEST SQL MIGRATION IN SUPABASE IF YOU ADDED <code>payload</code>.</td></tr>`;
    return;
  }

  if (!worlds?.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="muted" style="padding:16px">NO WORLDS YET. CREATE ONE TO OPEN THE EDITOR.</td></tr>';
  } else {
    tbody.innerHTML = worlds
      .map((w) => {
        const pub = w.is_published
          ? '<span class="badge badge-pub">PUBLISHED</span>'
          : '<span class="badge badge-drf">DRAFT</span>';
        const canDelete = ctx.profile.role === 'admin' || w.creator_id === ctx.session.user.id;
        return `<tr>
          <td><a href="expert-world.html?id=${esc(w.id)}" style="color:var(--accent);font-weight:600">${esc(w.title)}</a></td>
          <td>${pub}</td>
          <td class="muted" style="font-family:var(--mono);font-size:12px">${fmtDate(w.updated_at)}</td>
          <td class="muted" style="font-size:12px">${w.creator_id === ctx.session.user.id ? 'YOURS' : ctx.profile.role === 'admin' ? esc(w.creator_id.slice(0, 8)) + '…' : '—'}</td>
          <td style="white-space:nowrap">
            <a class="btn btn-ghost" style="padding:6px 10px;font-size:12px;margin-top:0;text-decoration:none" href="expert-world.html?id=${esc(w.id)}">EDIT</a>
            <button type="button" class="btn btn-ghost" style="padding:6px 10px;font-size:12px;margin-top:0" data-sample="${esc(w.id)}">SAMPLE VIEWER</button>
            ${canDelete ? `<button type="button" class="btn btn-danger" style="padding:6px 10px;font-size:12px;margin-top:0" data-delete="${esc(w.id)}">DELETE</button>` : ''}
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
    };
  };

  document.querySelectorAll('[data-sample]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-sample');
      const row = (worlds || []).find((w) => w.id === id);
      if (!row) return;
      try {
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
