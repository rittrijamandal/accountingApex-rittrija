// ─────────────────────────────────────────────
//  APP.JS  —  Invoice Approval World Viewer
// ─────────────────────────────────────────────

let activeFilePath  = null;
let activeArchetype = ARCHETYPES[0];
let apiKey          = localStorage.getItem('apex_api_key') || '';
let isGenerating    = false;

// Folders expanded by default
let expandedFolders = new Set([
  '', 'company_invoices', 'leadership',
  'engineering', 'engineering/team_invoices',
  'marketing', 'marketing/team_invoices',
  'operations', 'operations/team_invoices',
]);

// ── ACTIVE WORLD ─────────────────────────────

let WORLD = STATIC_WORLD;

// Build a path → file map for O(1) lookup
function getFileMap() {
  const map = {};
  for (const f of WORLD.files) map[f.path] = f;
  return map;
}

// ── HELPERS ──────────────────────────────────

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fileIcon(type) {
  const icons = { policy: '§', invoice: '▤', ledger: '▦', profile: '◉' };
  return icons[type] || '▤';
}

// ── TREE BUILDER ─────────────────────────────

function buildTreeData(files) {
  // Returns a nested { name, isDir, children, file } structure
  const root = {};
  for (const f of files) {
    const parts = f.path.split('/');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (!node[seg]) node[seg] = { _isDir: true, _children: {} };
      node = node[seg]._children;
    }
    const fname = parts[parts.length - 1];
    node[fname] = { _isDir: false, _file: f };
  }
  return root;
}

function renderTreeNode(node, depth, prefix) {
  let html = '';
  const indent = depth * 14;

  // Sort: folders first, then files
  const entries = Object.entries(node).sort(([an, av], [bn, bv]) => {
    const aDir = !!av._isDir;
    const bDir = !!bv._isDir;
    if (aDir && !bDir) return -1;
    if (!aDir && bDir) return 1;
    return an.localeCompare(bn);
  });

  for (const [name, val] of entries) {
    const fullPath = prefix ? prefix + '/' + name : name;

    if (val._isDir) {
      const isOpen = expandedFolders.has(fullPath);
      html += `<div class="tree-folder${isOpen ? ' expanded' : ''}"
        style="padding-left:${indent}px"
        onclick="toggleFolder('${fullPath}')">
        <span class="tree-toggle">${isOpen ? '▼' : '▶'}</span>
        <span class="tree-folder-icon">${isOpen ? '◧' : '◫'}</span>
        <span class="tree-folder-name">${escHtml(name)}/</span>
      </div>`;
      if (isOpen) {
        html += renderTreeNode(val._children, depth + 1, fullPath);
      }
    } else {
      const f = val._file;
      const isActive = activeFilePath === f.path;
      html += `<div class="tree-file type-${f.type}${isActive ? ' active' : ''}"
        style="padding-left:${indent + 14}px"
        onclick="selectFilePath('${escHtml(f.path)}')">
        <span class="tree-file-icon">${fileIcon(f.type)}</span>
        <span class="tree-file-name">${escHtml(name)}</span>
      </div>`;
    }
  }
  return html;
}

function buildSidebar() {
  const tree = buildTreeData(WORLD.files);
  return renderTreeNode(tree, 0, '');
}

// ── FILE RENDERERS ────────────────────────────

function renderPolicy(f) {
  return `
    <div>
      <span class="prose-doc-type prose-type-policy">POLICY DOCUMENT</span>
      <div class="section-label">${escHtml(f.path)}</div>
    </div>
    <div class="prose-doc">${escHtml(f.content)}</div>`;
}

function renderProfile(f) {
  return `
    <div>
      <span class="prose-doc-type prose-type-profile">EMPLOYEE PROFILE</span>
      <div class="section-label">${escHtml(f.path)}</div>
    </div>
    <div class="prose-doc">${escHtml(f.content)}</div>`;
}

function renderInvoice(f) {
  return `
    <div>
      <span class="invoice-doc-type">INVOICE — ${escHtml(f.invoiceNum || '')}</span>
      <div class="section-label">${escHtml(f.path)}</div>
    </div>
    <div class="invoice-doc">${escHtml(f.content)}</div>`;
}

function renderLedger(f) {
  const lines = (f.content || '').trim().split('\n').filter(Boolean);
  if (lines.length <= 1) {
    return `
      <div>
        <span class="ledger-type">LEDGER</span>
        <div class="section-label">${escHtml(f.path)}</div>
      </div>
      <div class="ledger-empty">
        <div class="le-icon">▦</div>
        <p style="font-size:12px;color:var(--text2)">Ledger is empty</p>
        <p style="font-size:10px;color:var(--text3)">The agent must fill this in using write_file.<br>Header: ${escHtml(lines[0] || 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status')}</p>
      </div>`;
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim());
    return '<tr>' + cells.map((c, i) => `<td>${escHtml(c)}</td>`).join('') + '</tr>';
  }).join('');

  return `
    <div>
      <span class="ledger-type">LEDGER</span>
      <div class="section-label">${escHtml(f.path)} — ${lines.length - 1} entries</div>
    </div>
    <div style="overflow-x:auto">
    <table class="data-table">
      <thead><tr>${headers.map(h => `<th>${escHtml(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>`;
}

function renderFile(path) {
  const map = getFileMap();
  const f = map[path];
  if (!f) return `<div class="error-banner">File not found: ${escHtml(path)}</div>`;
  if (f.type === 'policy')  return renderPolicy(f);
  if (f.type === 'profile') return renderProfile(f);
  if (f.type === 'invoice') return renderInvoice(f);
  if (f.type === 'ledger')  return renderLedger(f);
  return `<div class="prose-doc">${escHtml(f.content || '')}</div>`;
}

// ── TASK + RUBRIC ─────────────────────────────

function renderTaskTab() {
  const rubricRows = WORLD.rubric.map(r => `
    <div class="rubric-item">
      <div class="rubric-n">${r.n}</div>
      <div class="rubric-body">
        <div class="rubric-text">${escHtml(r.text)}</div>
        <span class="rtype rtype-${r.type}">${r.label}</span>
      </div>
    </div>`).join('');

  const taskPrompt = WORLD.meta.taskPrompt || 'You have been assigned to process outstanding invoices for this company. Review the directory and handle them appropriately.';

  return `
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">company</div>
        <div class="metric-value" style="font-size:14px">${escHtml(WORLD.meta.company)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">employees</div>
        <div class="metric-value">${WORLD.meta.employees}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">files</div>
        <div class="metric-value">${WORLD.files.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">rubric criteria</div>
        <div class="metric-value">${WORLD.rubric.length}</div>
      </div>
    </div>
    <div class="section-label">agent task prompt</div>
    <div class="task-box">${escHtml(taskPrompt)}</div>
    <div class="section-label" style="margin-top:4px">rubric</div>
    ${rubricRows}`;
}

// ── TOPBAR ────────────────────────────────────

function buildTopbar() {
  return `
    <span class="tb-logo">APEX<span>.</span>INV</span>
    <span class="tb-sep">/</span>
    <span class="tb-world">${escHtml(WORLD.meta.id)}</span>
    <span class="tb-sep">·</span>
    <span class="tb-name">${escHtml(WORLD.meta.company)}</span>
    <span class="tb-sep">·</span>
    <span style="font-size:11px;color:var(--text3)">${escHtml(WORLD.meta.industry)}</span>
    <div class="tb-meta">
      <span><span class="dot"></span>${WORLD.files.length} files</span>
      <span>${escHtml(WORLD.meta.period)}</span>
      <span>
        <button onclick="launchAgent()"
          style="padding:3px 10px;border:1px solid var(--green);border-radius:3px;
                 background:var(--green-bg);color:var(--green);
                 font-family:var(--mono);font-size:10px;cursor:pointer;font-weight:600">
          ▶ Run Agent
        </button>
      </span>
    </div>`;
}

// ── ARCHETYPE BAR ─────────────────────────────

function buildArchetypeBar() {
  const btns = ARCHETYPES.map(a => `
    <button class="arch-btn ${a.id === activeArchetype.id ? 'active' : ''}"
            onclick="selectArchetype('${a.id}')">${escHtml(a.label)}</button>`).join('');
  return `
    <span class="arch-label">archetype</span>
    ${btns}
    <button class="gen-btn" id="gen-btn" onclick="generateWorld()">⟳ Generate World</button>`;
}

// ── INTERACTIONS ──────────────────────────────

function toggleFolder(path) {
  if (expandedFolders.has(path)) {
    expandedFolders.delete(path);
  } else {
    expandedFolders.add(path);
  }
  document.getElementById('sb-files').innerHTML = buildSidebar();
}

function selectFilePath(path) {
  activeFilePath = path;
  document.getElementById('sb-files').innerHTML = buildSidebar();
  document.getElementById('panel').innerHTML = renderFile(path);
  // Switch to view tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-view').classList.add('active');
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'view') {
    document.getElementById('panel').innerHTML = activeFilePath
      ? renderFile(activeFilePath)
      : renderWelcome();
  }
  if (tab === 'task') document.getElementById('panel').innerHTML = renderTaskTab();
}

function renderWelcome() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:260px;gap:12px;color:var(--text3);text-align:center">
      <div style="font-size:28px;margin-bottom:8px">◫</div>
      <p style="font-size:12px;color:var(--text2)">Select a file from the directory tree</p>
      <p style="font-size:10px;line-height:1.8">
        Explore the company hierarchy — policies, invoices, profiles, and ledgers.<br>
        Then run the agent to process invoices.
      </p>
    </div>`;
}

function selectArchetype(id) {
  activeArchetype = ARCHETYPES.find(a => a.id === id) || ARCHETYPES[0];
  document.querySelectorAll('.arch-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');

  if (id === 'invoice-approval') {
    WORLD = STATIC_WORLD;
    expandedFolders = new Set([
      '', 'company_invoices', 'leadership',
      'engineering', 'engineering/team_invoices',
      'marketing', 'marketing/team_invoices',
      'operations', 'operations/team_invoices',
    ]);
  } else if (id === 'real-estate-audit') {
    WORLD = STATIC_AUDIT_WORLD;
    expandedFolders = new Set([
      'Audit_Workpapers', 'Audit_Workpapers/Q1_2025_Workpaper_Template',
      'HR', 'HR/Employees', 'HR/Compliance', 'HR/Policies',
      'Finance', 'Finance/Statements', 'Finance/Statements/Q1_2025', 'Finance/Payroll',
      'Finance/General_Ledger', 'Finance/Budget',
      'Accounts_Receivable', 'Accounts_Receivable/Clients', 'Accounts_Receivable/Aging',
      'Accounts_Payable', 'Accounts_Payable/Aging', 'Accounts_Payable/Vendors',
      'Banking', 'Banking/Statements', 'Banking/Reconciliation',
      'Contracts', 'Internal_Memos',
    ]);
  }

  activeFilePath = null;
  rebuildUI();
}

// ── API KEY MODAL ─────────────────────────────

function showApiKeyModal(onConfirm) {
  const modal = document.getElementById('apikey-modal');
  document.getElementById('apikey-input').value = apiKey;
  modal.classList.add('visible');
  document.getElementById('apikey-cancel').onclick  = () => modal.classList.remove('visible');
  document.getElementById('apikey-confirm').onclick = () => {
    const val = document.getElementById('apikey-input').value.trim();
    if (!val) return;
    apiKey = val;
    localStorage.setItem('apex_api_key', val);
    modal.classList.remove('visible');
    onConfirm();
  };
}

// ── LOADING ───────────────────────────────────

const LOAD_STEPS = [
  'Inventing a fictional company...',
  'Writing policy documents...',
  'Generating employee profiles...',
  'Creating invoices...',
  'Planting policy conflicts...',
  'Writing rubric criteria...',
  'Finalising world...',
];

function showLoading() {
  document.getElementById('loading-title').textContent = 'Generating invoice approval world...';
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('visible');
  const bar     = document.getElementById('loading-bar');
  const stepsEl = document.getElementById('loading-steps');
  stepsEl.innerHTML = LOAD_STEPS.map(s => `<div>${s}</div>`).join('');
  bar.style.width = '0%';
  let step = 0;
  const interval = setInterval(() => {
    step++;
    bar.style.width = Math.min((step / LOAD_STEPS.length) * 80, 80) + '%';
    const divs = stepsEl.querySelectorAll('div');
    if (divs[step - 1]) divs[step - 1].classList.add('done');
    if (step >= LOAD_STEPS.length) clearInterval(interval);
  }, 1100);
  return { interval, bar };
}

function hideLoading(ctx) {
  clearInterval(ctx.interval);
  ctx.bar.style.width = '100%';
  setTimeout(() => document.getElementById('loading-overlay').classList.remove('visible'), 400);
}

// ── GENERATION ────────────────────────────────

async function generateWorld() {
  if (isGenerating) return;
  if (!apiKey) { showApiKeyModal(() => generateWorld()); return; }

  isGenerating = true;
  document.getElementById('gen-btn').disabled = true;
  document.querySelectorAll('.arch-btn').forEach(b => b.disabled = true);

  const loadCtx = showLoading();

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 16000,
        messages:   [{ role: 'user', content: buildGenerationPrompt() }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }

    const data    = await res.json();
    const raw     = data.content.find(b => b.type === 'text')?.text || '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
    const world   = JSON.parse(cleaned);

    WORLD = world;
    activeFilePath = null;

    hideLoading(loadCtx);
    rebuildUI();

  } catch (err) {
    hideLoading(loadCtx);
    const isAuth = err.message.includes('401') || err.message.toLowerCase().includes('auth');
    if (isAuth) { apiKey = ''; localStorage.removeItem('apex_api_key'); }
    document.getElementById('panel').innerHTML = `
      <div class="error-banner">
        ${isAuth ? 'API key invalid. ' : 'Generation failed: ' + escHtml(err.message) + '. '}
        <span style="cursor:pointer;text-decoration:underline" onclick="generateWorld()">Try again →</span>
      </div>`;
  } finally {
    isGenerating = false;
    document.getElementById('gen-btn').disabled = false;
    document.querySelectorAll('.arch-btn').forEach(b => b.disabled = false);
  }
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
  document.getElementById('topbar').innerHTML        = buildTopbar();
  document.getElementById('archetype-bar').innerHTML = buildArchetypeBar();
  document.getElementById('sb-files').innerHTML      = buildSidebar();
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-view').classList.add('active');
  document.getElementById('panel').innerHTML = renderWelcome();
}

// ── INIT ──────────────────────────────────────

function init() {
  document.getElementById('root').innerHTML = `

    <div id="apikey-modal">
      <div class="modal-box">
        <div class="modal-title">Anthropic API key</div>
        <div class="modal-sub">
          Enter your Anthropic API key to generate worlds with Claude.<br>
          Stored locally in your browser — sent only to api.anthropic.com.
        </div>
        <input id="apikey-input" class="modal-input" type="password" placeholder="sk-ant-..." />
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" id="apikey-cancel">Cancel</button>
          <button class="modal-btn modal-btn-confirm" id="apikey-confirm">Save &amp; generate</button>
        </div>
      </div>
    </div>

    <div id="loading-overlay">
      <div class="loading-title" id="loading-title">Generating world...</div>
      <div class="loading-bar-wrap"><div class="loading-bar" id="loading-bar"></div></div>
      <div class="loading-steps" id="loading-steps"></div>
      <div class="loading-sub">This takes about 20–30 seconds</div>
    </div>

    <div id="topbar">${buildTopbar()}</div>
    <div id="archetype-bar">${buildArchetypeBar()}</div>

    <div id="main">
      <div id="sidebar">
        <div class="sb-files" id="sb-files">${buildSidebar()}</div>
        <div class="sb-footer">${WORLD.meta.id} · ${WORLD.meta.period}</div>
      </div>
      <div id="content">
        <div id="tabbar">
          <div class="tab active" id="tab-view" onclick="switchTab('view')">file view</div>
          <div class="tab"        id="tab-task" onclick="switchTab('task')">task + rubric</div>
        </div>
        <div id="panel">${renderWelcome()}</div>
      </div>
    </div>`;
}

init();
