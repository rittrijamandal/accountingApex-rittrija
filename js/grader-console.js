// Grader console: same visual system as current interface (styles.css),
// with API-key modal + Generate World flow.

let activeFile = 'bank';
let activeTab = 'view';

const ARCHETYPES = [
  { id: 'cash_basis_confusion', label: 'Cash-basis confusion' },
  { id: 'month_end_close', label: 'Month-end close' },
  { id: 'ap_backlog', label: 'AP backlog' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'rev_recognition', label: 'Revenue recognition' },
];
let activeArchetype = ARCHETYPES[0].id;

let WORLD = {
  meta: WORLD_META,
  transactions: TRANSACTIONS,
  chartOfAccounts: CHART_OF_ACCOUNTS,
  oldChartOfAccounts: OLD_CHART_OF_ACCOUNTS,
  expensePolicy: EXPENSE_POLICY,
  oldExpensePolicy: OLD_EXPENSE_POLICY,
  invoices: INVOICES,
  rubric: RUBRIC,
  taskPrompt: null,
  ambiguityTypes: null,
  misleadingFiles: null,
};

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getApiKey() {
  return localStorage.getItem('apex_api_key') || '';
}
function setApiKey(v) {
  localStorage.setItem('apex_api_key', v);
}

function hardLogout() {
  try {
    const shouldDrop = (k) =>
      k.startsWith('sb-') || k.includes('supabase.auth') || k === 'supabase.auth.token';
    for (const store of [localStorage, sessionStorage]) {
      for (const k of Object.keys(store)) {
        if (shouldDrop(k)) store.removeItem(k);
      }
    }
  } catch (_) {}
  window.location.replace('/login.html');
}

function fmt(n) {
  const abs = Math.abs(Number(n || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return Number(n || 0) >= 0 ? `+${abs}` : `-${abs}`;
}

function tagHtml(flag) {
  const map = {
    ambig: ['tag-ambig', 'ambiguous'],
    personal: ['tag-personal', 'likely personal'],
    recur: ['tag-recur', 'recurring'],
    clear: ['tag-clear', 'clear'],
    dupe: ['tag-dupe', 'possible dupe'],
  };
  const [cls, label] = map[flag] || ['tag-clear', flag || 'clear'];
  return `<span class="tag ${cls}">${label}</span>`;
}

function badgeHtml(type) {
  if (!type) return '';
  const map = { core: 'badge-core', warn: 'badge-warn', noise: 'badge-noise' };
  const labels = { core: 'CORE', warn: '⚠ OLD', noise: 'NOISE' };
  return `<span class="badge ${map[type]}">${labels[type]}</span>`;
}

function getInvoiceList() {
  if (Array.isArray(WORLD.invoices)) return WORLD.invoices;
  return Object.entries(WORLD.invoices || {}).map(([id, inv]) => ({ id, ...inv }));
}

function renderFileView(fileId) {
  if (fileId === 'bank') {
    const rows = (WORLD.transactions || [])
      .map((t) => `<tr>
        <td style="color:var(--text3);white-space:nowrap">${t.date}</td>
        <td style="font-family:var(--mono)">${escHtml(t.desc)}</td>
        <td style="text-align:right;white-space:nowrap" class="${Number(t.amount) >= 0 ? 'amount-pos' : 'amount-neg'}">${fmt(t.amount)}</td>
        <td>${tagHtml(t.flag)}</td>
        <td style="color:var(--text3);font-size:10px;line-height:1.4">${escHtml(t.note)}</td>
      </tr>`).join('');
    return `<div class="section-label">bank_statement.csv</div><table class="data-table"><thead><tr><th>Date</th><th>Description</th><th style="text-align:right">Amount ($)</th><th>Flag</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  if (fileId === 'coa') {
    const rows = (WORLD.chartOfAccounts || []).map((r) => `<tr><td style="color:var(--text3)">${r.code}</td><td>${escHtml(r.name)}</td><td style="color:var(--text3)">${r.type}</td></tr>`).join('');
    return `<div class="section-label">chart_of_accounts.xlsx</div><table class="data-table"><thead><tr><th>Code</th><th>Account name</th><th>Type</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  if (fileId === 'policy') {
    const rows = (WORLD.expensePolicy || []).map((r) => `<div class="kv"><span class="kk">${escHtml(r.key)}</span><span class="vv">${escHtml(r.val)}</span></div>`).join('');
    return `<div class="section-label">expense_policy.pdf</div><div class="file-preview">${rows}</div>`;
  }
  if (fileId === 'task') {
    const prompt = WORLD.taskPrompt || `You are working as a bookkeeper for ${WORLD.meta?.name || 'this business'}. Review the bank statement and categorize each transaction.`;
    return `<div class="section-label">task_01.txt</div><div class="task-box">${escHtml(prompt)}</div>`;
  }
  if (fileId === 'noise') {
    return `<div class="noise-view"><div class="noise-icon">▤</div><p style="color:var(--text2);font-size:13px">This file is noise.</p></div>`;
  }
  const inv = getInvoiceList().find((i) => i.id === fileId);
  if (!inv) return `<div class="noise-view"><div class="noise-icon">▤</div></div>`;
  return `
    ${inv.warn ? `<div class="warn-banner"><span class="wicon">⚠</span>${escHtml(inv.warn)}</div>` : ''}
    <div class="section-label">${escHtml(inv.invNum || inv.id)}.pdf</div>
    <div class="file-preview">
      <div class="kv"><span class="kk">Vendor</span><span class="vv">${escHtml(inv.vendor)}</span></div>
      <div class="kv"><span class="kk">Invoice #</span><span class="vv">${escHtml(inv.invNum || inv.id)}</span></div>
      <div class="kv"><span class="kk">Date</span><span class="vv">${escHtml(inv.date)}</span></div>
      <div class="kv"><span class="kk">Description</span><span class="vv">${escHtml(inv.desc)}</span></div>
      <div class="kv"><span class="kk">Amount</span><span class="vv">${escHtml(inv.amount)}</span></div>
    </div>`;
}

function renderTaskTab() {
  const task = WORLD.taskPrompt || `You are working as a bookkeeper for ${WORLD.meta?.name || 'this business'}.`;
  const rubricRows = (WORLD.rubric || []).map((r) => `<div class="rubric-item"><div class="rubric-n">${r.n}</div><div class="rubric-body"><div class="rubric-text">${escHtml(r.text)}</div><span class="rtype rtype-${r.type}">${escHtml(r.label || r.type)}</span></div></div>`).join('');
  return `<div class="task-box">${escHtml(task)}</div><div class="section-label">rubric</div>${rubricRows}`;
}

function renderMetaTab() {
  return `<div class="meta-grid">
    <div class="meta-card"><div class="mc-label">world id</div><div class="mc-val">${escHtml(WORLD.meta?.id || '')}</div></div>
    <div class="meta-card"><div class="mc-label">business</div><div class="mc-val">${escHtml(WORLD.meta?.name || '')}</div></div>
    <div class="meta-card"><div class="mc-label">archetype</div><div class="mc-val">${escHtml(WORLD.meta?.archetype || '')}</div></div>
    <div class="meta-card"><div class="mc-label">period</div><div class="mc-val">${escHtml(WORLD.meta?.period || '')}</div></div>
  </div>`;
}

function buildTopbar() {
  return `
    <span class="tb-logo"><img src="/assets/symbal-logo.png" alt="" class="tb-logo-img" width="22" height="22" />SYMBAL ACCOUNTING <span class="title-serif">apex</span></span>
    <span class="tb-sep">/</span>
    <span class="tb-world">GRADER CONSOLE</span>
    <span class="tb-sep">·</span>
    <span class="tb-name">${escHtml(WORLD.meta?.name || '')}</span>
    <div class="tb-meta">
      <span><span class="dot"></span>${escHtml(WORLD.meta?.totalFiles || 0)} files</span>
      <span><button type="button" class="gen-btn" onclick="openApiKeyModal()">API KEY</button></span>
      <span><button type="button" class="gen-btn" onclick="hardLogout()">SIGN OUT</button></span>
    </div>`;
}

function buildFiletree() {
  const invRows = getInvoiceList().map((inv) => `<div class="file-row ${inv.warn ? 'mislead' : ''} ${activeFile === inv.id ? 'active' : ''}" onclick="selectFile('${inv.id}',this)"><span class="ficon">▤</span><span class="fname">${escHtml(inv.invNum || inv.id)}.pdf</span>${inv.warn ? badgeHtml('warn') : ''}</div>`).join('');
  return `
    <div class="sb-section">core</div>
    <div class="file-row ${activeFile === 'bank' ? 'active' : ''}" onclick="selectFile('bank',this)"><span class="ficon">▤</span><span class="fname">bank_statement.csv</span>${badgeHtml('core')}</div>
    <div class="file-row ${activeFile === 'coa' ? 'active' : ''}" onclick="selectFile('coa',this)"><span class="ficon">▤</span><span class="fname">chart_of_accounts.xlsx</span>${badgeHtml('core')}</div>
    <div class="file-row ${activeFile === 'policy' ? 'active' : ''}" onclick="selectFile('policy',this)"><span class="ficon">▤</span><span class="fname">expense_policy.pdf</span>${badgeHtml('core')}</div>
    <div class="sb-section">invoices</div>
    ${invRows}
    <div class="sb-section">task</div>
    <div class="file-row ${activeFile === 'task' ? 'active' : ''}" onclick="selectFile('task',this)"><span class="ficon">▤</span><span class="fname">task_01.txt</span>${badgeHtml('core')}</div>
    <div class="sb-section">noise</div>
    <div class="file-row noise" onclick="selectFile('noise',this)"><span class="ficon">▤</span><span class="fname">misc_notes.txt</span>${badgeHtml('noise')}</div>`;
}

function buildGenerateTab() {
  return `
    <div class="section-label">Generate world</div>
    <div class="task-box" style="margin-bottom:16px">Pick an archetype and generate a new world with Claude.</div>
    <div class="archbar">
      <div class="archbar-left">
        ${ARCHETYPES.map((a) => `<button type="button" class="arch-btn ${a.id === activeArchetype ? 'active' : ''}" onclick="pickArchetype('${a.id}')">${escHtml(a.label)}</button>`).join('')}
      </div>
      <button type="button" class="gen-btn" onclick="generateWorld()">Generate world</button>
    </div>`;
}

function packWorldForAgentPrompt() {
  const rows = (WORLD.transactions || [])
    .map((t) => `${t.date},${t.desc},${t.amount >= 0 ? '+' : ''}${Number(t.amount).toFixed(2)}`)
    .join('\n');
  const bank = `date,description,amount\n${rows}`;
  const coa = (WORLD.chartOfAccounts || []).map((a) => `${a.code} | ${a.name} | ${a.type}`).join('\n');
  const pol = (WORLD.expensePolicy || []).map((p) => `${p.key}: ${p.val}`).join('\n');
  const invs = getInvoiceList();
  const invBlock = invs
    .map((i) => {
      const label = String(i.invNum || i.id || '');
      const note = i.warn ? `\nNOTE: ${i.warn}` : '';
      return `== ${label}.pdf ==\nVendor: ${i.vendor}\nAmount: ${i.amount}${note}\n`;
    })
    .join('\n');
  const rubric = (WORLD.rubric || []).map((r, idx) => `${idx + 1}. [${r.type}] ${r.text}`).join('\n');
  const task =
    WORLD.taskPrompt ||
    `You are working as a bookkeeper for ${WORLD.meta?.name || 'this business'}. Categorize each transaction using the chart of accounts and expense policy.`;
  return `TASK:\n${task}\n\nFILES:\n== bank_statement.csv ==\n${bank}\n\n== chart_of_accounts.xlsx ==\n${coa}\n\n== expense_policy.pdf ==\n${pol}\n\n${invBlock}\nRUBRIC (for grading context):\n${rubric}`;
}

function buildEvaluateTab() {
  return `
    <div class="section-label">Agent testing</div>
    <div class="task-box" style="margin-bottom:16px">
      <strong>Run your own agent</strong> opens the full <span style="font-family:var(--mono)">agent.html</span> runner with this world loaded. You control the run; it uses your saved API key only inside that session (no world generation).
      <div style="margin-top:10px"></div>
      <strong>Test with Claude agent</strong> sends one sample completion request through <span style="font-family:var(--mono)">/api/test-grader</span> so you can sanity-check the task + rubric against the current files.
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px">
      <button type="button" class="gen-btn" onclick="launchOwnAgent()">Run your agent</button>
      <button type="button" class="gen-btn" onclick="runSampleClaudeAgent()">Test with Claude agent</button>
    </div>
    <div class="section-label">Sample Claude output</div>
    <div id="sample-agent-output" class="task-box" style="min-height:120px;font-family:var(--mono);font-size:11px;white-space:pre-wrap;color:var(--text2)">Run “Test with Claude agent” to see output here.</div>`;
}

function launchOwnAgent() {
  try {
    sessionStorage.setItem('apex_active_world', JSON.stringify(WORLD));
  } catch (_) {}
  window.open('/agent.html', '_blank');
}

async function runSampleClaudeAgent() {
  const key = getApiKey();
  if (!key) {
    openApiKeyModal();
    return;
  }
  const outEl = document.getElementById('sample-agent-output');
  if (outEl) outEl.textContent = 'Calling Claude…';

  const system =
    'You are an external bookkeeping agent being evaluated. Return ONLY your final categorization output as plain text. Do not call tools.';
  const user = `${packWorldForAgentPrompt()}\n\nOUTPUT: For each transaction give date, description, amount, account code, account name, flags, notes. End with a one-paragraph summary.`;

  setLoading(true, 'Running sample Claude agent…');
  try {
    const res = await fetch('/api/test-grader', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || `Claude error ${res.status}`);
    const text = String(data.content?.find((b) => b.type === 'text')?.text || '').trim();
    if (outEl) outEl.textContent = text || '(empty response)';
  } catch (e) {
    if (outEl) outEl.textContent = `Error: ${e.message || String(e)}`;
  } finally {
    setLoading(false);
  }
}

function rebuildUI() {
  document.getElementById('topbar').innerHTML = buildTopbar();
  document.getElementById('sb-files').innerHTML = buildFiletree();
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  document.getElementById(`tab-${tab}`)?.classList.add('active');
  if (tab === 'view') document.getElementById('panel').innerHTML = renderFileView(activeFile);
  if (tab === 'task') document.getElementById('panel').innerHTML = renderTaskTab();
  if (tab === 'meta') document.getElementById('panel').innerHTML = renderMetaTab();
  if (tab === 'generate') document.getElementById('panel').innerHTML = buildGenerateTab();
  if (tab === 'evaluate') document.getElementById('panel').innerHTML = buildEvaluateTab();
}

function selectFile(id, el) {
  activeFile = id;
  document.querySelectorAll('.file-row').forEach((r) => r.classList.remove('active'));
  if (el) el.classList.add('active');
  switchTab('view');
}

function pickArchetype(id) {
  activeArchetype = id;
  document.getElementById('panel').innerHTML = buildGenerateTab();
}

function setLoading(show, title) {
  const ov = document.getElementById('loading-overlay');
  ov?.classList.toggle('visible', show);
  const ttl = ov?.querySelector('.loading-title');
  const bar = ov?.querySelector('.loading-bar');
  if (ttl) ttl.textContent = title || 'Generating world…';
  if (bar) bar.style.width = show ? '70%' : '0%';
}

function openApiKeyModal() {
  document.getElementById('apikey-input').value = getApiKey();
  document.getElementById('apikey-modal')?.classList.add('visible');
}
function closeApiKeyModal() {
  document.getElementById('apikey-modal')?.classList.remove('visible');
}

async function generateWorld() {
  const key = getApiKey();
  if (!key) return openApiKeyModal();

  setLoading(true, 'Generating world…');
  const prompt = `Generate an accounting benchmark world JSON only. Archetype: ${activeArchetype}. Include keys: meta, transactions, chartOfAccounts, oldChartOfAccounts, expensePolicy, oldExpensePolicy, invoices, rubric, taskPrompt, ambiguityTypes, misleadingFiles.`;

  try {
    const res = await fetch('/api/test-grader', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || `Claude error ${res.status}`);
    const text = String(data.content?.find((b) => b.type === 'text')?.text || '').trim();
    const m = text.match(/\{[\s\S]*\}$/);
    WORLD = { ...WORLD, ...(JSON.parse(m ? m[0] : text)) };
    try { sessionStorage.setItem('apex_active_world', JSON.stringify(WORLD)); } catch (_) {}
    rebuildUI();
    switchTab('view');
  } catch (e) {
    document.getElementById('panel').innerHTML = `<div class="error-banner">Generation failed: ${escHtml(e.message || String(e))}</div>${buildGenerateTab()}`;
  } finally {
    setLoading(false);
  }
}

function init() {
  document.getElementById('root').innerHTML = `
    <div id="topbar">${buildTopbar()}</div>
    <div id="main" style="position:relative">
      <div id="sidebar">
        <div class="sb-files" id="sb-files">${buildFiletree()}</div>
        <div class="sb-footer">${escHtml(WORLD.meta?.id || 'APEX')} · grader</div>
      </div>
      <div id="content">
        <div id="tabbar">
          <div class="tab active" id="tab-view" onclick="switchTab('view')">file view</div>
          <div class="tab" id="tab-task" onclick="switchTab('task')">task + rubric</div>
          <div class="tab" id="tab-meta" onclick="switchTab('meta')">world meta</div>
          <div class="tab" id="tab-generate" onclick="switchTab('generate')">generate</div>
          <div class="tab" id="tab-evaluate" onclick="switchTab('evaluate')">evaluate</div>
        </div>
        <div id="panel"></div>
      </div>
      <div id="loading-overlay">
        <div class="loading-title">Generating world…</div>
        <div class="loading-bar-wrap"><div class="loading-bar"></div></div>
        <div class="loading-sub">This may take 10-20 seconds.</div>
      </div>
      <div id="apikey-modal">
        <div class="modal-box">
          <div class="modal-title">Set Claude API key</div>
          <div class="modal-sub">Paste your Anthropic key. Stored locally as <span style="font-family:var(--mono)">apex_api_key</span>.</div>
          <input id="apikey-input" class="modal-input" type="password" placeholder="sk-ant-..." />
          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn-cancel" onclick="closeApiKeyModal()">Cancel</button>
            <button type="button" class="modal-btn modal-btn-confirm" onclick="setApiKey(document.getElementById('apikey-input').value.trim());closeApiKeyModal()">Save</button>
          </div>
        </div>
      </div>
    </div>`;
  switchTab('view');
}

window.switchTab = switchTab;
window.selectFile = selectFile;
window.pickArchetype = pickArchetype;
window.generateWorld = generateWorld;
window.openApiKeyModal = openApiKeyModal;
window.closeApiKeyModal = closeApiKeyModal;
window.hardLogout = hardLogout;
window.setApiKey = setApiKey;
window.launchOwnAgent = launchOwnAgent;
window.runSampleClaudeAgent = runSampleClaudeAgent;

try {
  init();
} catch (e) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:20px;font-family:Inter,sans-serif"><h2 style="margin:0 0 8px 0">Grader console failed to load</h2><p style="margin:0 0 10px 0">${escHtml(e.message || String(e))}</p><button onclick="window.location.reload()">Reload</button></div>`;
  }
}

