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

async function init() {
  const ctx = await requireRoles(['grader', 'admin']);
  if (!ctx) return;

  document.getElementById('email').textContent =
    ctx.profile.email || ctx.session.user.email || ctx.profile.id;

  document.getElementById('logout').addEventListener('click', () => {
    void signOutAndRedirect();
  });

  const sb = await getSupabase();
  const { data: worlds, error } = await sb
    .from('worlds')
    .select('id,title,creator_id,updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  const mount = document.getElementById('grader-worlds');
  if (error) {
    mount.innerHTML = `<p class="msg-err">${esc(error.message)}</p>`;
    return;
  }
  if (!worlds?.length) {
    mount.innerHTML =
      '<p class="muted">No published worlds yet. Experts must mark a world as <strong>Published</strong> before it appears here.</p>';
    return;
  }

  const { data: profs } = await sb.from('profiles').select('id,email').in(
    'id',
    [...new Set(worlds.map((w) => w.creator_id))]
  );
  const byId = Object.fromEntries((profs || []).map((p) => [p.id, p]));

  mount.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>World</th><th>Expert (creator)</th><th>Updated</th><th></th></tr></thead>
      <tbody>
        ${worlds
          .map((w) => {
            const cr = byId[w.creator_id];
            const em = cr?.email || w.creator_id?.slice(0, 8) + '…';
            return `<tr>
              <td>${esc(w.title)}</td>
              <td class="muted">${esc(em)}</td>
              <td class="muted" style="font-size:12px">${fmtDate(w.updated_at)}</td>
              <td>
                <button type="button" class="btn btn-inline btn-ghost js-load-world" data-id="${esc(w.id)}">Load in sample viewer</button>
              </td>
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>
    <p class="muted" style="margin-top:12px;font-size:12px">Loads the world into the static viewer in this browser (read-only). Agent runs stay on the roadmap.</p>
  `;

  mount.querySelectorAll('.js-load-world').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const { data: row, error: e2 } = await sb.from('worlds').select('payload').eq('id', id).maybeSingle();
      if (e2 || !row) {
        alert(e2?.message || 'Could not load world');
        return;
      }
      const p = row.payload || {};
      const WORLD = {
        meta: p.meta || {},
        transactions: p.transactions || [],
        chartOfAccounts: p.chartOfAccounts || [],
        oldChartOfAccounts: p.oldChartOfAccounts || [],
        expensePolicy: p.expensePolicy || [],
        oldExpensePolicy: p.oldExpensePolicy || [],
        invoices: p.invoices || [],
        rubric: p.rubric || [],
        taskPrompt: p.taskPrompt ?? null,
        ambiguityTypes: p.ambiguityTypes ?? null,
        misleadingFiles: p.misleadingFiles ?? null,
      };
      try {
        sessionStorage.setItem('apex_active_world', JSON.stringify(WORLD));
      } catch (err) {
        alert('Storage failed: ' + err.message);
        return;
      }
      window.location.href = '/viewer.html';
    });
  });
}

init();
