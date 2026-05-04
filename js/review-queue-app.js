import { getSupabase, signOutAndRedirect } from './auth-core.js';
import { requireRoles } from './auth-guard.js';
import { normalizePayload } from './world-payload.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function statusCounter(payload) {
  const count = Number(payload?.review?.reviewer_count || 0);
  return `${Math.max(0, Math.min(3, count))} of 3 reviewed`;
}

function starsInput(current) {
  return [1, 2, 3, 4, 5]
    .map((n) => `<button type="button" class="star-btn ${n <= current ? 'active' : ''}" data-score="${n}" aria-label="${n} star">${n <= current ? '★' : '☆'}</button>`)
    .join('');
}

function renderWorldSnapshot(world) {
  const payload = normalizePayload(world.payload || {});
  const files = Array.isArray(payload.uploadedFiles) ? payload.uploadedFiles : [];
  const rubric = Array.isArray(payload.rubric) ? payload.rubric : [];
  return `
    <section class="section">
      <h2>Step 1 — World setup</h2>
      <div class="field-grid">
        <div class="field"><label>World name</label><input type="text" disabled value="${esc(world.title)}" /></div>
        <div class="field"><label>World ID</label><input type="text" disabled value="${esc(payload.meta?.id || '—')}" /></div>
        <div class="field"><label>Business type</label><input type="text" disabled value="${esc(payload.meta?.type || '—')}" /></div>
        <div class="field"><label>Accounting method</label><input type="text" disabled value="${esc(payload.meta?.method || '—')}" /></div>
      </div>
    </section>
    <section class="section">
      <h2>Step 2 — The data room</h2>
      <div class="data-table-wrap">
        <table class="world-table">
          <thead><tr><th>File name</th><th>Type</th><th>Notes</th></tr></thead>
          <tbody>
            ${files.length
              ? files
                  .map((f) => `<tr><td>${esc(f.displayLabel || f.fileName || 'Untitled')}</td><td>${esc(f.customType || f.type || '—')}</td><td>${esc(f.notes || '—')}</td></tr>`)
                  .join('')
              : '<tr><td colspan="3" class="muted" style="padding:18px">No files attached.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
    <section class="section">
      <h2>Step 3 — Agent rules</h2>
      <div class="field"><label>Task prompt</label><textarea rows="6" disabled>${esc(payload.taskPrompt || '')}</textarea></div>
    </section>
    <section class="section">
      <h2>Step 4 — Grading rubric</h2>
      <div class="data-table-wrap">
        <table class="world-table">
          <thead><tr><th>#</th><th>Type</th><th>Label</th><th>Notes</th></tr></thead>
          <tbody>
            ${rubric.length
              ? rubric
                  .map((r, i) => `<tr><td>${Number(r.n || i + 1)}</td><td>${esc(r.type || 'det')}</td><td>${esc(r.label || '')}</td><td>${esc(r.text || '')}</td></tr>`)
                  .join('')
              : '<tr><td colspan="4" class="muted" style="padding:18px">No rubric criteria.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

async function init() {
  const root = document.getElementById('review-app');
  if (!root) return;
  try {
    const ctx = await requireRoles(['expert', 'admin']);
    if (!ctx) return;
    const sb = await getSupabase();
    const url = new URL(window.location.href);
    const worldId = url.searchParams.get('id');

    const [{ data: queueWorlds, error: queueError }, { data: meProfile }] = await Promise.all([
      sb.rpc('get_review_queue_worlds'),
      sb.from('profiles').select('id,email,role').eq('id', ctx.session.user.id).maybeSingle(),
    ]);
    if (queueError) {
      root.innerHTML = `<div class="err-banner">${esc(queueError.message)}</div>`;
      return;
    }

    const queue = Array.isArray(queueWorlds) ? queueWorlds : [];
    const debugInfo = {
      me: ctx.session.user.id,
      email: meProfile?.email || 'unknown',
      role: meProfile?.role || 'unknown',
      rpcCount: queue.length,
      titles: queue.map((w) => w.title || w.id).slice(0, 10),
    };

    if (!worldId) {
      root.innerHTML = `
      <header class="expert-top">
        <div>
          <h1>Review queue</h1>
          <p class="muted" style="margin-top:4px">Score worlds from other experts before they ship to graders.</p>
        </div>
        <div class="spacer"></div>
        <a class="btn btn-ghost" href="/expert.html">Back to expert</a>
        <button type="button" class="btn btn-ghost" id="logout">Sign out</button>
      </header>
      <div class="tiny-note" style="margin:0 0 14px;font-family:var(--font-mono)">Debug: ${esc(debugInfo.email)} (${esc(debugInfo.role)}) · rpc_count=${debugInfo.rpcCount} · worlds=${esc(debugInfo.titles.join(' | ') || 'none')}</div>
      <div class="data-table-wrap">
        <table class="world-table">
          <thead><tr><th>World</th><th>Creator</th><th>Status</th><th style="text-align:right">Action</th></tr></thead>
          <tbody>
            ${
              queue.length
                ? queue
                    .map(
                      (w) => `<tr>
                      <td><span style="font-weight:500">${esc(w.title || 'Untitled world')}</span></td>
                      <td class="muted">${esc(w.creator_email || w.creator_id)}</td>
                      <td><span class="badge badge-review-in">${esc(statusCounter(w.payload || {}))}</span></td>
                      <td style="text-align:right"><a class="btn btn-ghost" href="/review-queue?id=${esc(w.id)}">Review</a></td>
                    </tr>`
                    )
                    .join('')
                : '<tr><td colspan="4" class="muted" style="padding:18px">No worlds are waiting for review.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;
      document.getElementById('logout')?.addEventListener('click', async () => signOutAndRedirect());
      return;
    }

    const world = queue.find((w) => w.id === worldId);
    if (!world) {
      root.innerHTML = `<div class="err-banner">World is not available for review.</div><p><a class="btn btn-ghost" href="/review-queue">Back</a></p>`;
      return;
    }

    const { data: mine } = await sb
      .from('world_review_scores')
      .select('score,notes')
      .eq('world_id', world.id)
      .eq('reviewer_id', ctx.session.user.id)
      .maybeSingle();

    const state = {
      score: Number(mine?.score || 0),
      notes: mine?.notes || '',
    };

  root.innerHTML = `
    <header class="expert-top">
      <div>
        <h1>Review world</h1>
        <p class="muted" style="margin-top:4px"><strong style="color:var(--text-primary);font-weight:500">${esc(world.title || '')}</strong> · Created by ${esc(world.creator_email || world.creator_id)}</p>
      </div>
      <div class="spacer"></div>
      <a class="btn btn-ghost" href="/review-queue">Back to queue</a>
      <button type="button" class="btn btn-ghost" id="logout">Sign out</button>
    </header>
    <div class="review-layout">
      <div>${renderWorldSnapshot(world)}</div>
      <aside class="review-sidebar">
        <div class="step-title">Review score</div>
        <p class="muted" style="line-height:1.5;margin-top:8px">Is this world ready for grading?</p>
        <div class="rating-stars" id="rating-stars">${starsInput(state.score)}</div>
        <div class="field">
          <label>Notes</label>
          <textarea id="review-notes" rows="6" placeholder="Optional notes for the creator…">${esc(state.notes)}</textarea>
        </div>
        <button type="button" class="btn btn-block" id="submit-score" style="margin-top:14px">Submit score</button>
        <div class="tiny-note" id="score-counter" style="margin-top:12px">${esc(statusCounter(world.payload || {}))}</div>
        <div class="tiny-note">Other reviewers' scores stay hidden until all 3 reviews are complete.</div>
      </aside>
    </div>
  `;

  function rerenderStars() {
    const starWrap = document.getElementById('rating-stars');
    if (starWrap) starWrap.innerHTML = starsInput(state.score);
  }

    root.addEventListener('click', async (e) => {
      const star = e.target.closest('[data-score]');
      if (star) {
        state.score = Number(star.getAttribute('data-score') || 0);
        rerenderStars();
        return;
      }
      if (e.target.id === 'submit-score') {
        if (!state.score || state.score < 1 || state.score > 5) {
          alert('Select a score from 1 to 5.');
          return;
        }
        const notes = document.getElementById('review-notes')?.value || '';
        const { error: upsertErr } = await sb.from('world_review_scores').upsert(
          {
            world_id: world.id,
            reviewer_id: ctx.session.user.id,
            score: state.score,
            notes,
          },
          { onConflict: 'world_id,reviewer_id' }
        );
        if (upsertErr) {
          alert(upsertErr.message || 'Could not submit score.');
          return;
        }
        window.location.href = '/review-queue';
      }
    });

    document.getElementById('logout')?.addEventListener('click', async () => signOutAndRedirect());
  } catch (err) {
    root.innerHTML = `<div class="err-banner">Review queue failed to load: ${esc(err?.message || String(err))}</div>`;
  }
}

init().catch((err) => {
  const root = document.getElementById('review-app');
  if (!root) return;
  root.innerHTML = `<div class="err-banner">Review queue failed to initialize: ${esc(err?.message || String(err))}</div>`;
});
