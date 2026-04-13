// ─────────────────────────────────────────────
//  APP.JS — sample world viewer (no external generation)
// ─────────────────────────────────────────────

let activeFile = 'bank';
let activeTab  = 'view';

// ── ACTIVE WORLD DATA (starts with static fallback) ──
let WORLD = {
  meta:               WORLD_META,
  transactions:       TRANSACTIONS,
  chartOfAccounts:    CHART_OF_ACCOUNTS,
  oldChartOfAccounts: OLD_CHART_OF_ACCOUNTS,
  expensePolicy:      EXPENSE_POLICY,
  oldExpensePolicy:   OLD_EXPENSE_POLICY,
  invoices:           INVOICES,
  rubric:             RUBRIC,
  taskPrompt:         null,
  ambiguityTypes:     null,
  misleadingFiles:    null,
};

// If another view (e.g. Expert list) provides a selected world, use it.
try {
  const stored = sessionStorage.getItem('apex_active_world');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object') {
      WORLD = {
        ...WORLD,
        ...parsed,
      };
    }
  }
} catch (_) {}

// ── HELPERS ──────────────────────────────────

function fmt(n) {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n >= 0 ? `+${abs}` : `-${abs}`;
}

function tagHtml(flag) {
  const map = {
    ambig:    ['tag-ambig',    'ambiguous'],
    personal: ['tag-personal', 'likely personal'],
    recur:    ['tag-recur',    'recurring'],
    clear:    ['tag-clear',    'clear'],
    dupe:     ['tag-dupe',     'possible dupe'],
  };
  const [cls, label] = map[flag] || ['tag-clear', flag];
  return `<span class="tag ${cls}">${label}</span>`;
}

function badgeHtml(type) {
  if (!type) return '';
  const map    = { core: 'badge-core', warn: 'badge-warn', noise: 'badge-noise' };
  const labels = { core: 'CORE', warn: '⚠ OLD', noise: 'NOISE' };
  return `<span class="badge ${map[type]}">${labels[type]}</span>`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── RENDERS ──────────────────────────────────

function renderBank() {
  const rows = WORLD.transactions.map(t => `
    <tr>
      <td style="color:var(--text3);white-space:nowrap">${t.date}</td>
      <td style="font-family:var(--mono)">${escHtml(t.desc)}</td>
      <td style="white-space:nowrap;text-align:right" class="${t.amount >= 0 ? 'amount-pos' : 'amount-neg'}">${fmt(t.amount)}</td>
      <td>${tagHtml(t.flag)}</td>
      <td style="color:var(--text3);font-size:10px;line-height:1.4">${escHtml(t.note)}</td>
    </tr>`).join('');

  return `
    <div class="section-label">bank_statement.csv — ${WORLD.transactions.length} transactions</div>
    <div style="overflow-x:auto">
    <table class="data-table">
      <thead><tr>
        <th>Date</th><th>Description</th><th style="text-align:right">Amount ($)</th>
        <th>Flag</th><th>Notes</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>`;
}

function renderCOA() {
  const rows = WORLD.chartOfAccounts.map(r => `
    <tr>
      <td style="color:var(--text3)">${r.code}</td>
      <td>${escHtml(r.name)}</td>
      <td style="color:var(--text3)">${r.type}</td>
    </tr>`).join('');
  return `
    <div class="section-label">chart_of_accounts.xlsx — current (2026)</div>
    <table class="data-table">
      <thead><tr><th>Code</th><th>Account name</th><th>Type</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderOldCOA() {
  const rows = WORLD.oldChartOfAccounts.map(r => `
    <tr>
      <td style="color:var(--text3)">${r.code}</td>
      <td style="text-decoration:line-through;color:var(--text3)">${escHtml(r.name)}</td>
      <td style="color:var(--text3)">${r.type}</td>
    </tr>`).join('');
  return `
    <div class="warn-banner"><span class="wicon">⚠</span>
      Outdated — account names differ from current version. An agent using this file will miscategorize transactions.
    </div>
    <div class="section-label">chart_of_accounts_prev.xlsx — OUTDATED</div>
    <table class="data-table">
      <thead><tr><th>Code</th><th>Account name (old)</th><th>Type</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderPolicy() {
  const rows = WORLD.expensePolicy.map(r => `
    <div class="kv"><span class="kk">${escHtml(r.key)}</span><span class="vv">${escHtml(r.val)}</span></div>`).join('');
  return `
    <div class="section-label">expense_policy.pdf — current</div>
    <div class="file-preview">${rows}</div>`;
}

function renderOldPolicy() {
  const rows = WORLD.oldExpensePolicy.map(r => `
    <div class="kv">
      <span class="kk">${escHtml(r.key)}</span>
      <span class="vv" style="color:var(--red)">${escHtml(r.val)}</span>
    </div>`).join('');
  return `
    <div class="warn-banner"><span class="wicon">⚠</span>
      Outdated — key policy values differ from current version. Using this file will cause compliance errors.
    </div>
    <div class="section-label">expense_policy_prev.pdf — OUTDATED</div>
    <div class="file-preview">${rows}</div>`;
}

function renderInvoice(inv) {
  if (!inv) return renderNoise();
  return `
    ${inv.warn ? `<div class="warn-banner"><span class="wicon">⚠</span>${escHtml(inv.warn)}</div>` : ''}
    <div class="section-label">${escHtml(inv.invNum || inv.id)}.pdf</div>
    <div class="file-preview">
      <div class="kv"><span class="kk">Vendor</span><span class="vv">${escHtml(inv.vendor)}</span></div>
      <div class="kv"><span class="kk">Invoice #</span><span class="vv">${escHtml(inv.invNum)}</span></div>
      <div class="kv"><span class="kk">Date</span><span class="vv">${escHtml(inv.date)}</span></div>
      <div class="kv"><span class="kk">Description</span><span class="vv">${escHtml(inv.desc)}</span></div>
      <div class="kv"><span class="kk">Amount</span><span class="vv">${escHtml(inv.amount)}</span></div>
    </div>`;
}

function renderNoise() {
  return `
    <div class="noise-view">
      <div class="noise-icon">▤</div>
      <p style="color:var(--text2);font-size:13px">This file is noise.</p>
      <p>It exists to simulate a realistic working directory.<br>
      An agent that opens this file is wasting steps.</p>
    </div>`;
}

function renderTask() {
  const prompt = WORLD.taskPrompt ||
    `You are working as a bookkeeper for ${WORLD.meta.name}. Review the bank statement and categorize each transaction using the current chart of accounts and expense policy. Flag ambiguous transactions, suspected duplicates, and personal expenses.`;
  return `
    <div class="section-label">task_01.txt</div>
    <div class="task-box">${escHtml(prompt)}</div>`;
}

// ── FILE VIEW ─────────────────────────────────

function renderFileView(fileId) {
  if (fileId === 'bank')       return renderBank();
  if (fileId === 'coa')        return renderCOA();
  if (fileId === 'old_coa')    return renderOldCOA();
  if (fileId === 'policy')     return renderPolicy();
  if (fileId === 'old_policy') return renderOldPolicy();
  if (fileId === 'task')       return renderTask();
  if (fileId === 'noise')      return renderNoise();
  const invs = getInvoiceList();
  const inv  = invs.find(i => i.id === fileId);
  if (inv) return renderInvoice(inv);
  return renderNoise();
}

// ── TASK + RUBRIC TAB ─────────────────────────

function renderTaskTab() {
  const rubricRows = WORLD.rubric.map(r => `
    <div class="rubric-item">
      <div class="rubric-n">${r.n}</div>
      <div class="rubric-body">
        <div class="rubric-text">${escHtml(r.text)}</div>
        <span class="rtype rtype-${r.type}">${r.label}</span>
      </div>
    </div>`).join('');

  const detCount = WORLD.rubric.filter(r => r.type === 'det').length;
  const detPct   = Math.round((detCount / WORLD.rubric.length) * 100);

  return `
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">difficulty</div>
        <div class="metric-value amber">${WORLD.meta.tier.split(' — ')[0]}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">transactions</div>
        <div class="metric-value">${WORLD.transactions.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">rubric criteria</div>
        <div class="metric-value">${WORLD.rubric.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">det. grading</div>
        <div class="metric-value green">${detPct}%</div>
      </div>
    </div>
    ${renderTask()}
    <div class="section-label" style="margin-top:4px">rubric</div>
    ${rubricRows}`;
}

// ── WORLD META TAB ────────────────────────────

function renderWorldMeta() {
  const ambiguityTypes = WORLD.ambiguityTypes || [
    'ambiguous vendor names', 'recurring pattern recognition',
    'personal vs. business', 'capitalization threshold boundary',
    'duplicate invoice detection',
  ];
  const tagClasses = ['tag-ambig','tag-recur','tag-personal','tag-ambig','tag-dupe','tag-clear'];

  const misleadingFiles = WORLD.misleadingFiles || [
    { file: 'chart_of_accounts_prev.xlsx', why: 'Account names differ from current version' },
    { file: 'expense_policy_prev.pdf',     why: 'Key thresholds differ from current policy' },
  ];

  return `
    <div class="meta-grid">
      <div class="meta-card"><div class="mc-label">world id</div><div class="mc-val">${WORLD.meta.id}</div></div>
      <div class="meta-card"><div class="mc-label">archetype</div><div class="mc-val">${escHtml(WORLD.meta.archetype)}</div></div>
      <div class="meta-card"><div class="mc-label">business</div><div class="mc-val">${escHtml(WORLD.meta.name)}</div></div>
      <div class="meta-card"><div class="mc-label">business type</div><div class="mc-val">${escHtml(WORLD.meta.type)}</div></div>
      <div class="meta-card"><div class="mc-label">accounting method</div><div class="mc-val">${WORLD.meta.method}</div></div>
      <div class="meta-card"><div class="mc-label">period</div><div class="mc-val">${WORLD.meta.period}</div></div>
      <div class="meta-card"><div class="mc-label">total files</div><div class="mc-val">${WORLD.meta.totalFiles} (${WORLD.meta.coreFiles} core, ${WORLD.meta.noiseFiles} noise)</div></div>
      <div class="meta-card"><div class="mc-label">difficulty tier</div><div class="mc-val">${WORLD.meta.tier}</div></div>
    </div>
    <div class="section-label">embedded ambiguity types</div>
    <div class="meta-tags" style="margin-bottom:20px">
      ${ambiguityTypes.map((label, i) => `<span class="tag ${tagClasses[i % tagClasses.length]}">${escHtml(label)}</span>`).join('')}
    </div>
    <div class="section-label">misleading files</div>
    <div class="file-preview">
      ${misleadingFiles.map(f => `
        <div class="kv" style="margin-bottom:8px">
          <span class="kk" style="color:var(--amber)">${escHtml(f.file)}</span>
          <span class="vv" style="color:var(--text2)">${escHtml(f.why)}</span>
        </div>`).join('')}
    </div>`;
}

// ── INVOICE LIST ──────────────────────────────

function getInvoiceList() {
  if (Array.isArray(WORLD.invoices)) return WORLD.invoices;
  return Object.entries(WORLD.invoices).map(([id, inv]) => ({ id, ...inv }));
}

// ── SIDEBAR ───────────────────────────────────

function buildFiletree() {
  const invs    = getInvoiceList();
  const invRows = invs.map(inv => `
    <div class="file-row ${inv.warn ? 'mislead' : ''} ${activeFile === inv.id ? 'active' : ''}"
         onclick="selectFile('${inv.id}', this)">
      <span class="ficon">▤</span>
      <span class="fname">${escHtml(inv.invNum || inv.id)}.pdf</span>
      ${inv.warn ? badgeHtml('warn') : ''}
    </div>`).join('');

  const noiseFiles = ['logo_final_v3.png','meeting_notes.docx','vendor_contract.pdf','w9_form.pdf','photos.zip'];

  return `
    <div class="sb-section">core</div>
    <div class="file-row ${activeFile==='bank'?'active':''}" onclick="selectFile('bank',this)">
      <span class="ficon">▤</span><span class="fname">bank_statement.csv</span>${badgeHtml('core')}
    </div>
    <div class="file-row ${activeFile==='coa'?'active':''}" onclick="selectFile('coa',this)">
      <span class="ficon">▤</span><span class="fname">chart_of_accounts.xlsx</span>${badgeHtml('core')}
    </div>
    <div class="file-row ${activeFile==='policy'?'active':''}" onclick="selectFile('policy',this)">
      <span class="ficon">▤</span><span class="fname">expense_policy.pdf</span>${badgeHtml('core')}
    </div>
    <div class="sb-section">invoices</div>
    ${invRows}
    <div class="sb-section">old / misleading</div>
    <div class="file-row mislead ${activeFile==='old_coa'?'active':''}" onclick="selectFile('old_coa',this)">
      <span class="ficon">▤</span><span class="fname">chart_of_accounts_prev.xlsx</span>${badgeHtml('warn')}
    </div>
    <div class="file-row mislead ${activeFile==='old_policy'?'active':''}" onclick="selectFile('old_policy',this)">
      <span class="ficon">▤</span><span class="fname">expense_policy_prev.pdf</span>${badgeHtml('warn')}
    </div>
    <div class="sb-section">noise</div>
    ${noiseFiles.map(f => `
      <div class="file-row noise" onclick="selectFile('noise',this)">
        <span class="ficon">▤</span><span class="fname">${f}</span>${badgeHtml('noise')}
      </div>`).join('')}
    <div style="padding:4px 14px;font-size:10px;color:var(--text3);font-style:italic">
      + ${Math.max(0, WORLD.meta.noiseFiles - 5)} more noise files...
    </div>
    <div class="sb-section">task</div>
    <div class="file-row ${activeFile==='task'?'active':''}" onclick="selectFile('task',this)">
      <span class="ficon">▤</span><span class="fname">task_01.txt</span>${badgeHtml('core')}
    </div>`;
}

// ── TOPBAR ────────────────────────────────────

function buildTopbar() {
  return `
    <span class="tb-logo">
      <img src="/assets/symbal-logo.png" alt="" class="tb-logo-img" width="22" height="22" />
      SYMBAL ACCOUNTING <span class="title-serif">apex</span>
    </span>
    <span class="tb-sep">/</span>
    <span class="tb-world">${WORLD.meta.id}</span>
    <span class="tb-sep">·</span>
    <span class="tb-name">${escHtml(WORLD.meta.name)}</span>
    <span class="tb-sep">·</span>
    <span style="font-size:11px;color:var(--text3)">${WORLD.meta.method} · ${WORLD.meta.period}</span>
    <div class="tb-meta">
      <span><span class="dot"></span>${WORLD.meta.totalFiles} files</span>
      <span>1 task</span>
      <span>${WORLD.meta.tier}</span>
      <span>
        <button onclick="launchAgent()" style="padding:4px 12px;border:1px solid var(--accent);border-radius:0;background:var(--accent-soft);color:var(--accent);font-family:var(--sans);font-size:10px;cursor:pointer;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">▶ Run Agent</button>
      </span>
    </div>`;
}

// ── INTERACTIONS ──────────────────────────────

function selectFile(id, el) {
  activeFile = id;
  document.querySelectorAll('.file-row').forEach(r => r.classList.remove('active'));
  if (el) el.classList.add('active');
  if (activeTab === 'view') document.getElementById('panel').innerHTML = renderFileView(id);
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'view') document.getElementById('panel').innerHTML = renderFileView(activeFile);
  if (tab === 'task') document.getElementById('panel').innerHTML = renderTaskTab();
  if (tab === 'meta') document.getElementById('panel').innerHTML = renderWorldMeta();
}

// ── LAUNCH AGENT ─────────────────────────────

function launchAgent() {
  try {
    sessionStorage.setItem('apex_active_world', JSON.stringify(WORLD));
  } catch(e) {}
  window.open('/agent.html', '_blank');
}

// ── REBUILD ───────────────────────────────────

function rebuildUI() {
  document.getElementById('topbar').innerHTML   = buildTopbar();
  document.getElementById('sb-files').innerHTML = buildFiletree();
  activeTab = 'view';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-view').classList.add('active');
  document.getElementById('panel').innerHTML = renderFileView('bank');
}

// ── INIT ──────────────────────────────────────

function init() {
  document.getElementById('root').innerHTML = `

    <div id="topbar">${buildTopbar()}</div>

    <div id="main" style="position:relative">
      <div id="sidebar">
        <div class="sb-files" id="sb-files">${buildFiletree()}</div>
        <div class="sb-footer">${WORLD.meta.id} · v0.2</div>
      </div>
      <div id="content">
        <div id="tabbar">
          <div class="tab active" id="tab-view" onclick="switchTab('view')">file view</div>
          <div class="tab"        id="tab-task" onclick="switchTab('task')">task + rubric</div>
          <div class="tab"        id="tab-meta" onclick="switchTab('meta')">world meta</div>
        </div>
        <div id="panel"></div>
      </div>
    </div>`;

  document.getElementById('panel').innerHTML = renderFileView(activeFile);
}

init();
