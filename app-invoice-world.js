// ─────────────────────────────────────────────
//  APP-INVOICE-WORLD.JS  —  Invoice Approval World Viewer
//  (static viewer — no generation)
// ─────────────────────────────────────────────

let activeFilePath = null;

// Folders expanded by default
let expandedFolders = new Set([
  '', 'company_invoices', 'leadership',
  'engineering', 'engineering/team_invoices',
  'marketing', 'marketing/team_invoices',
  'operations', 'operations/team_invoices',
]);

let WORLD = STATIC_WORLD;

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
    return '<tr>' + cells.map(c => `<td>${escHtml(c)}</td>`).join('') + '</tr>';
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

  const taskPrompt = `You have been assigned to process outstanding invoices for this company. Review the directory and handle them appropriately.`;

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
    </div>`;
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
        Use the task + rubric tab to review evaluation criteria.
      </p>
    </div>`;
}

// ── INIT ──────────────────────────────────────

function init() {
  document.getElementById('root').innerHTML = `
    <div id="topbar">${buildTopbar()}</div>

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
