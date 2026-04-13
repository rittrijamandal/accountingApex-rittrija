import { getSupabase, signOutAndRedirect } from './auth-core.js';
import { requireRoles } from './auth-guard.js';
import { emptyPayload, normalizePayload } from './world-payload.js';

const FLAGS = ['clear', 'recur', 'ambig', 'personal', 'dupe'];
const R_TYPES = ['det', 'llm', 'neg'];
const ACCT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function flagOptions(selected) {
  return FLAGS.map(
    (f) => `<option value="${f}" ${f === selected ? 'selected' : ''}>${f}</option>`
  ).join('');
}

function rubricTypeOptions(selected) {
  return R_TYPES.map(
    (f) => `<option value="${f}" ${f === selected ? 'selected' : ''}>${f}</option>`
  ).join('');
}

function acctTypeOptions(selected) {
  return ACCT_TYPES.map(
    (f) => `<option value="${f}" ${f === selected ? 'selected' : ''}>${f}</option>`
  ).join('');
}

function txRow(t, i) {
  const amt = t.amount != null ? Number(t.amount) : '';
  return `<tr data-kind="tx" data-i="${i}">
    <td><input type="text" value="${esc(t.date)}" data-f="date" placeholder="MM/DD" /></td>
    <td><input type="text" value="${esc(t.desc)}" data-f="desc" placeholder="BANK DESCRIPTION" /></td>
    <td><input type="number" step="0.01" value="${esc(amt)}" data-f="amount" /></td>
    <td><select data-f="flag">${flagOptions(t.flag || 'clear')}</select></td>
    <td><textarea data-f="note" rows="2">${esc(t.note)}</textarea></td>
    <td class="row-actions"><button type="button" class="btn-icon" data-del-tx>✕</button></td>
  </tr>`;
}

function coaRow(t, i, kind) {
  return `<tr data-kind="${kind}" data-i="${i}">
    <td><input type="text" value="${esc(t.code)}" data-f="code" /></td>
    <td><input type="text" value="${esc(t.name)}" data-f="name" /></td>
    <td><select data-f="type">${acctTypeOptions(t.type || 'Expense')}</select></td>
    <td class="row-actions"><button type="button" class="btn-icon" data-del-coa>✕</button></td>
  </tr>`;
}

function kvRow(t, i, kind) {
  return `<tr data-kind="${kind}" data-i="${i}">
    <td><input type="text" value="${esc(t.key)}" data-f="key" /></td>
    <td><input type="text" value="${esc(t.val)}" data-f="val" /></td>
    <td class="row-actions"><button type="button" class="btn-icon" data-del-kv>✕</button></td>
  </tr>`;
}

function invRow(t, i) {
  return `<tr data-kind="inv" data-i="${i}">
    <td><input type="text" value="${esc(t.id)}" data-f="id" placeholder="inv_key" /></td>
    <td><input type="text" value="${esc(t.vendor)}" data-f="vendor" /></td>
    <td><input type="text" value="${esc(t.invNum)}" data-f="invNum" /></td>
    <td><input type="text" value="${esc(t.date)}" data-f="date" /></td>
    <td><input type="text" value="${esc(t.desc)}" data-f="desc" /></td>
    <td><input type="text" value="${esc(t.amount)}" data-f="amount" placeholder="$0.00" /></td>
    <td><input type="text" value="${t.warn == null ? '' : esc(t.warn)}" data-f="warn" placeholder="null / warning" /></td>
    <td class="row-actions"><button type="button" class="btn-icon" data-del-inv>✕</button></td>
  </tr>`;
}

function rubRow(t, i) {
  return `<tr data-kind="rub" data-i="${i}">
    <td><input type="number" min="1" value="${esc(t.n != null ? t.n : i + 1)}" data-f="n" /></td>
    <td><textarea data-f="text" rows="2">${esc(t.text)}</textarea></td>
    <td><select data-f="type">${rubricTypeOptions(t.type || 'det')}</select></td>
    <td><input type="text" value="${esc(t.label)}" data-f="label" /></td>
    <td class="row-actions"><button type="button" class="btn-icon" data-del-rub>✕</button></td>
  </tr>`;
}

function mfRow(t, i) {
  return `<tr data-kind="mf" data-i="${i}">
    <td><input type="text" value="${esc(t.file)}" data-f="file" /></td>
    <td><input type="text" value="${esc(t.why)}" data-f="why" /></td>
    <td class="row-actions"><button type="button" class="btn-icon" data-del-mf>✕</button></td>
  </tr>`;
}

function render(app, dbRow, p, isAdmin) {
  const m = p.meta || {};
  const adminLink = isAdmin
    ? '<a href="admin.html" class="btn btn-ghost" style="text-decoration:none">Admin</a>'
    : '';
  app.innerHTML = `
    <div class="editor-sticky">
      <div class="inner">
        <a href="expert.html" class="btn btn-ghost">← Worlds</a>
        ${adminLink}
        <input type="text" class="editor-title" id="db-title" value="${esc(dbRow.title)}" placeholder="World title" />
        <label class="check-row" style="margin:0">
          <input type="checkbox" id="db-published" ${dbRow.is_published ? 'checked' : ''} />
          <span class="muted">Published (visible to Graders)</span>
        </label>
        <button type="button" class="btn" id="btn-save">Save world</button>
        <button type="button" class="btn btn-ghost" id="btn-logout">Sign out</button>
        <span class="save-status" id="save-status"></span>
      </div>
    </div>

    <nav class="anchor-nav">
      <a href="#sec-meta">Meta</a>
      <a href="#sec-bank">Bank</a>
      <a href="#sec-coa">Charts</a>
      <a href="#sec-policy">Policies</a>
      <a href="#sec-inv">Invoices</a>
      <a href="#sec-rubric">Rubric</a>
      <a href="#sec-task">Task</a>
      <a href="#sec-ambiguity">Ambiguity</a>
    </nav>

    <section class="section" id="sec-meta">
      <h2>World meta (payload.meta)</h2>
      <div class="field-grid">
        <div class="field"><label>World id (display)</label><input type="text" id="m-id" value="${esc(m.id)}" /></div>
        <div class="field"><label>Business name</label><input type="text" id="m-name" value="${esc(m.name)}" /></div>
        <div class="field"><label>Business type</label><input type="text" id="m-type" value="${esc(m.type)}" /></div>
        <div class="field"><label>Accounting method</label>
          <select id="m-method">
            <option value="Accrual" ${m.method === 'Accrual' ? 'selected' : ''}>Accrual</option>
            <option value="Cash" ${m.method === 'Cash' ? 'selected' : ''}>Cash Basis</option>
          </select>
        </div>
        <div class="field"><label>Period</label><input type="text" id="m-period" value="${esc(m.period)}" placeholder="January 2026" /></div>
        <div class="field"><label>Archetype label</label><input type="text" id="m-archetype" value="${esc(m.archetype)}" /></div>
        <div class="field"><label>Tier</label><input type="text" id="m-tier" value="${esc(m.tier)}" placeholder="Tier 2 — Execution" /></div>
        <div class="field"><label>Total files</label><input type="number" id="m-totalFiles" value="${esc(m.totalFiles ?? 0)}" /></div>
        <div class="field"><label>Core files</label><input type="number" id="m-coreFiles" value="${esc(m.coreFiles ?? 0)}" /></div>
        <div class="field"><label>Noise files</label><input type="number" id="m-noiseFiles" value="${esc(m.noiseFiles ?? 0)}" /></div>
      </div>
    </section>

    <section class="section" id="sec-bank">
      <h2>Bank transactions</h2>
      <p class="muted" style="margin-bottom:10px;font-size:12px">Positive = credit, negative = debit (agent / viewer convention).</p>
      <div class="data-table-wrap">
        <table class="data-table" id="tbl-tx">
          <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Flag</th><th>Note</th><th></th></tr></thead>
          <tbody>${(p.transactions.length ? p.transactions : [emptyTx()]).map((t, i) => txRow(t, i)).join('')}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn-ghost" style="margin-top:10px" id="add-tx">+ Add transaction</button>
    </section>

    <section class="section" id="sec-coa">
      <h2>Chart of accounts (current)</h2>
      <div class="data-table-wrap">
        <table class="data-table" id="tbl-coa">
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th></th></tr></thead>
          <tbody>${(p.chartOfAccounts.length ? p.chartOfAccounts : [emptyCoa()]).map((t, i) => coaRow(t, i, 'coa')).join('')}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn-ghost" style="margin-top:10px" id="add-coa">+ Add account</button>

      <h2 style="margin-top:24px">Old / misleading chart</h2>
      <div class="data-table-wrap">
        <table class="data-table" id="tbl-oldcoa">
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th></th></tr></thead>
          <tbody>${(p.oldChartOfAccounts.length ? p.oldChartOfAccounts : [emptyCoa()]).map((t, i) => coaRow(t, i, 'oldcoa')).join('')}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn-ghost" style="margin-top:10px" id="add-oldcoa">+ Add old account</button>
    </section>

    <section class="section" id="sec-policy">
      <h2>Expense policy (current)</h2>
      <div class="data-table-wrap">
        <table class="data-table" id="tbl-pol">
          <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
          <tbody>${(p.expensePolicy.length ? p.expensePolicy : [emptyKv()]).map((t, i) => kvRow(t, i, 'pol')).join('')}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn-ghost" style="margin-top:10px" id="add-pol">+ Add policy line</button>

      <h2 style="margin-top:24px">Old expense policy</h2>
      <div class="data-table-wrap">
        <table class="data-table" id="tbl-oldpol">
          <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
          <tbody>${(p.oldExpensePolicy.length ? p.oldExpensePolicy : [emptyKv()]).map((t, i) => kvRow(t, i, 'oldpol')).join('')}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn-ghost" style="margin-top:10px" id="add-oldpol">+ Add old policy line</button>
    </section>

    <section class="section" id="sec-inv">
      <h2>Invoices</h2>
      <div class="data-table-wrap">
        <table class="data-table" id="tbl-inv">
          <thead><tr><th>Id</th><th>Vendor</th><th>Inv #</th><th>Date</th><th>Desc</th><th>Amount</th><th>Warn</th><th></th></tr></thead>
          <tbody>${(p.invoices.length ? p.invoices : [emptyInv()]).map((t, i) => invRow(t, i)).join('')}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn-ghost" style="margin-top:10px" id="add-inv">+ Add invoice</button>
    </section>

    <section class="section" id="sec-rubric">
      <h2>Grading rubric</h2>
      <div class="data-table-wrap">
        <table class="data-table" id="tbl-rub">
          <thead><tr><th>#</th><th>Criterion</th><th>Type</th><th>Label</th><th></th></tr></thead>
          <tbody>${(p.rubric.length ? p.rubric : [emptyRub()]).map((t, i) => rubRow(t, i)).join('')}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn-ghost" style="margin-top:10px" id="add-rub">+ Add criterion</button>
    </section>

    <section class="section" id="sec-task">
      <h2>Task prompt (agent)</h2>
      <div class="field"><textarea id="task-prompt">${esc(p.taskPrompt)}</textarea></div>
    </section>

    <section class="section" id="sec-ambiguity">
      <h2>Ambiguity types (one per line)</h2>
      <div class="field"><textarea id="amb-lines" placeholder="ambiguous vendor names&#10;recurring pattern recognition">${esc((p.ambiguityTypes || []).join('\n'))}</textarea></div>
      <h2 style="margin-top:20px">Misleading files</h2>
      <p class="muted" style="margin-bottom:8px;font-size:12px">file name + why it misleads</p>
      <div class="data-table-wrap">
        <table class="data-table" id="tbl-mf">
          <thead><tr><th>File</th><th>Why</th><th></th></tr></thead>
          <tbody>${(p.misleadingFiles.length ? p.misleadingFiles : [emptyMf()]).map((t, i) => mfRow(t, i)).join('')}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn-ghost" style="margin-top:10px" id="add-mf">+ Add misleading file</button>
    </section>

    <div style="height:40px"></div>
  `;
}

function emptyTx() {
  return { date: '', desc: '', amount: 0, flag: 'clear', note: '' };
}
function emptyCoa() {
  return { code: '', name: '', type: 'Expense' };
}
function emptyKv() {
  return { key: '', val: '' };
}
function emptyInv() {
  return { id: 'inv_1', vendor: '', invNum: '', date: '', desc: '', amount: '$0.00', warn: null };
}
function emptyRub() {
  return { n: 1, text: '', type: 'det', label: 'deterministic' };
}
function emptyMf() {
  return { file: '', why: '' };
}

function readTableRows(tbodySelector, kind, mapRow) {
  const tb = document.querySelector(tbodySelector);
  if (!tb) return [];
  return [...tb.querySelectorAll(`tr[data-kind="${kind}"]`)].map(mapRow);
}

function collectPayload() {
  const meta = {
    id: document.getElementById('m-id').value.trim() || 'APEX-DRAFT',
    name: document.getElementById('m-name').value.trim(),
    type: document.getElementById('m-type').value.trim(),
    method: document.getElementById('m-method').value,
    period: document.getElementById('m-period').value.trim(),
    archetype: document.getElementById('m-archetype').value.trim(),
    tier: document.getElementById('m-tier').value.trim(),
    totalFiles: Number(document.getElementById('m-totalFiles').value) || 0,
    coreFiles: Number(document.getElementById('m-coreFiles').value) || 0,
    noiseFiles: Number(document.getElementById('m-noiseFiles').value) || 0,
    tasks: 1,
  };

  const txs = readTableRows('#tbl-tx tbody', 'tx', (tr) => {
    const g = (f) => tr.querySelector(`[data-f="${f}"]`)?.value ?? '';
    return {
      date: g('date'),
      desc: g('desc'),
      amount: parseFloat(g('amount')) || 0,
      flag: g('flag') || 'clear',
      note: g('note'),
    };
  });

  const readCoa = (tableId, kind) =>
    readTableRows(`#${tableId} tbody`, kind, (tr) => {
      const g = (f) => tr.querySelector(`[data-f="${f}"]`)?.value ?? '';
      return { code: g('code'), name: g('name'), type: g('type') || 'Expense' };
    });

  const readKv = (sel, kind) =>
    readTableRows(sel, kind, (tr) => {
      const g = (f) => tr.querySelector(`[data-f="${f}"]`)?.value ?? '';
      return { key: g('key'), val: g('val') };
    });

  const invs = readTableRows('#tbl-inv tbody', 'inv', (tr) => {
    const g = (f) => tr.querySelector(`[data-f="${f}"]`)?.value ?? '';
    const w = g('warn').trim();
    return {
      id: g('id') || 'inv',
      vendor: g('vendor'),
      invNum: g('invNum'),
      date: g('date'),
      desc: g('desc'),
      amount: g('amount'),
      warn: w === '' ? null : w,
    };
  });

  const rubs = readTableRows('#tbl-rub tbody', 'rub', (tr) => {
    const g = (f) => tr.querySelector(`[data-f="${f}"]`)?.value ?? '';
    return {
      n: parseInt(g('n'), 10) || 1,
      text: g('text'),
      type: g('type') || 'det',
      label: g('label'),
    };
  });

  const ambRaw = document.getElementById('amb-lines').value.split('\n').map((s) => s.trim()).filter(Boolean);

  const mfs = readTableRows('#tbl-mf tbody', 'mf', (tr) => {
    const g = (f) => tr.querySelector(`[data-f="${f}"]`)?.value ?? '';
    return { file: g('file'), why: g('why') };
  });

  return {
    meta,
    transactions: txs,
    chartOfAccounts: readCoa('tbl-coa', 'coa'),
    oldChartOfAccounts: readCoa('tbl-oldcoa', 'oldcoa'),
    expensePolicy: readKv('#tbl-pol tbody', 'pol'),
    oldExpensePolicy: readKv('#tbl-oldpol tbody', 'oldpol'),
    invoices: invs,
    rubric: rubs,
    taskPrompt: document.getElementById('task-prompt').value,
    ambiguityTypes: ambRaw,
    misleadingFiles: mfs,
  };
}

function wireDynamic(app) {
  document.getElementById('add-tx').addEventListener('click', () => {
    const p = collectPayload();
    p.transactions.push(emptyTx());
    app.querySelector('#tbl-tx tbody').innerHTML = p.transactions.map((t, i) => txRow(t, i)).join('');
  });
  document.getElementById('add-coa').addEventListener('click', () => {
    const p = collectPayload();
    p.chartOfAccounts.push(emptyCoa());
    app.querySelector('#tbl-coa tbody').innerHTML = p.chartOfAccounts.map((t, i) => coaRow(t, i, 'coa')).join('');
  });
  document.getElementById('add-oldcoa').addEventListener('click', () => {
    const p = collectPayload();
    p.oldChartOfAccounts.push(emptyCoa());
    app.querySelector('#tbl-oldcoa tbody').innerHTML = p.oldChartOfAccounts.map((t, i) => coaRow(t, i, 'oldcoa')).join('');
  });
  document.getElementById('add-pol').addEventListener('click', () => {
    const p = collectPayload();
    p.expensePolicy.push(emptyKv());
    app.querySelector('#tbl-pol tbody').innerHTML = p.expensePolicy.map((t, i) => kvRow(t, i, 'pol')).join('');
  });
  document.getElementById('add-oldpol').addEventListener('click', () => {
    const p = collectPayload();
    p.oldExpensePolicy.push(emptyKv());
    app.querySelector('#tbl-oldpol tbody').innerHTML = p.oldExpensePolicy.map((t, i) => kvRow(t, i, 'oldpol')).join('');
  });
  document.getElementById('add-inv').addEventListener('click', () => {
    const p = collectPayload();
    p.invoices.push(emptyInv());
    app.querySelector('#tbl-inv tbody').innerHTML = p.invoices.map((t, i) => invRow(t, i)).join('');
  });
  document.getElementById('add-rub').addEventListener('click', () => {
    const p = collectPayload();
    p.rubric.push({ ...emptyRub(), n: p.rubric.length + 1 });
    app.querySelector('#tbl-rub tbody').innerHTML = p.rubric.map((t, i) => rubRow(t, i)).join('');
  });
  document.getElementById('add-mf').addEventListener('click', () => {
    const p = collectPayload();
    p.misleadingFiles.push(emptyMf());
    app.querySelector('#tbl-mf tbody').innerHTML = p.misleadingFiles.map((t, i) => mfRow(t, i)).join('');
  });

  app.addEventListener('click', (e) => {
    const del = e.target.closest('[data-del-tx],[data-del-coa],[data-del-kv],[data-del-inv],[data-del-rub],[data-del-mf]');
    if (!del) return;
    const tr = del.closest('tr');
    if (!tr) return;
    const tbody = tr.parentElement;
    const table = tbody.closest('table');
    tr.remove();
    if (!tbody.querySelector('tr')) {
      let html = '';
      if (table.id === 'tbl-tx') html = txRow(emptyTx(), 0);
      if (table.id === 'tbl-coa') html = coaRow(emptyCoa(), 0, 'coa');
      if (table.id === 'tbl-oldcoa') html = coaRow(emptyCoa(), 0, 'oldcoa');
      if (table.id === 'tbl-pol') html = kvRow(emptyKv(), 0, 'pol');
      if (table.id === 'tbl-oldpol') html = kvRow(emptyKv(), 0, 'oldpol');
      if (table.id === 'tbl-inv') html = invRow(emptyInv(), 0);
      if (table.id === 'tbl-rub') html = rubRow(emptyRub(), 0);
      if (table.id === 'tbl-mf') html = mfRow(emptyMf(), 0);
      tbody.innerHTML = html;
    } else {
      [...tbody.querySelectorAll('tr')].forEach((row, i) => {
        row.dataset.i = String(i);
      });
    }
  });
}

async function init() {
  const app = document.getElementById('app');
  const ctx = await requireRoles(['expert', 'admin']);
  if (!ctx) return;

  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    app.innerHTML = '<div class="wrap"><div class="err-banner">Missing world id. <a href="expert.html" style="color:#8cf">Back</a></div></div>';
    return;
  }

  const sb = await getSupabase();
  const { data: row, error } = await sb.from('worlds').select('*').eq('id', id).maybeSingle();
  if (error || !row) {
    app.innerHTML = `<div class="wrap"><div class="err-banner">${esc(error?.message || 'World not found or no access.')}</div><p class="muted" style="margin-top:12px"><a href="expert.html" style="color:var(--green)">← Worlds</a></p></div>`;
    return;
  }

  if (ctx.profile.role !== 'admin' && row.creator_id !== ctx.session.user.id) {
    app.innerHTML = '<div class="wrap"><div class="err-banner">You can only edit worlds you created.</div></div>';
    return;
  }

  const payload = normalizePayload(row.payload);
  app.classList.add('wrap');
  render(app, row, payload, ctx.profile.role === 'admin');
  wireDynamic(app);

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await signOutAndRedirect();
  });

  const statusEl = document.getElementById('save-status');
  document.getElementById('btn-save').addEventListener('click', async () => {
    statusEl.textContent = 'Saving…';
    statusEl.className = 'save-status';
    const pl = collectPayload();
    const title = document.getElementById('db-title').value.trim() || 'Untitled world';
    const is_published = document.getElementById('db-published').checked;
    const { error: upErr } = await sb
      .from('worlds')
      .update({ title, is_published, payload: pl })
      .eq('id', id);
    if (upErr) {
      statusEl.textContent = upErr.message;
      statusEl.className = 'save-status err';
      return;
    }
    statusEl.textContent = 'Saved';
    statusEl.className = 'save-status ok';
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'save-status';
    }, 2500);
  });
}

init();
