// Grader console: same visual system as current interface (styles.css),
// with API-key modal + Generate World flow.

let activeFile = 'bank';
let activeTab = 'view';

/** File view: browse (list/grid) vs full document viewer + drawer */
let graderBrowseLayout = 'list';
let graderBrowsePhase = 'browse';
let graderDrawerOpen = false;

/** Invoice-world file-tree state */
let fileworldExpandedFolders = new Set([
  '', 'company_invoices', 'leadership',
  'engineering', 'engineering/team_invoices',
  'marketing', 'marketing/team_invoices',
  'operations', 'operations/team_invoices',
]);
let fileworldActiveFilePath = null;

function isFilesWorld() { return Array.isArray(WORLD.files); }

const ARCHETYPES = [
  { id: 'cash_basis_confusion', label: 'Cash-basis confusion' },
  { id: 'month_end_close', label: 'Month-end close' },
  { id: 'ap_backlog', label: 'AP backlog' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'rev_recognition', label: 'Revenue recognition' },
];
let activeArchetype = ARCHETYPES[0].id;

/** Registry for static fileworld datasets loaded via <script> tags */
const FILEWORLD_MAP = {
  STATIC_WORLD: typeof STATIC_WORLD !== 'undefined' ? STATIC_WORLD : null,
  STATIC_AUDIT_WORLD: typeof STATIC_AUDIT_WORLD !== 'undefined' ? STATIC_AUDIT_WORLD : null,
  STATIC_ACQUI_WORLD: typeof STATIC_ACQUI_WORLD !== 'undefined' ? STATIC_ACQUI_WORLD : null,
};

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

function cloneWorld(w) {
  return JSON.parse(JSON.stringify(w));
}

/** Snapshot of bundled sample world (data.js) for “reset” / default mock card */
const GRADER_DEFAULT_WORLD = cloneWorld(WORLD);

function loadViewerPreviewWorldFromSession() {
  try {
    const raw = sessionStorage.getItem('apex_active_world');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return mergeWorldPayload(parsed);
  } catch (_) {
    return null;
  }
}

const GRADER_PREVIEW_MODE = (() => {
  try {
    return sessionStorage.getItem('apex_viewer_mode') === 'expert-world-preview';
  } catch (_) {
    return false;
  }
})();

let graderPreviewExitHref = '/expert.html';
if (GRADER_PREVIEW_MODE) {
  try {
    const href = sessionStorage.getItem('apex_viewer_return_href');
    if (href) graderPreviewExitHref = href;
  } catch (_) {}
  const previewWorld = loadViewerPreviewWorldFromSession();
  if (previewWorld) WORLD = previewWorld;
}

/** Mock published worlds for lobby + header switcher (replace with Supabase later) */
const MOCK_PUBLISHED_WORLDS = [
  {
    id: 'mock-pixel-pine',
    title: 'Pixel & Pine Studio',
    archetypeLabel: 'Month-end close',
    tierLabel: 'Tier 2 — Execution',
    description:
      'Design-studio month-end: categorize a noisy January bank feed against an updated chart of accounts while ignoring misleading legacy files.',
    kind: 'default',
  },
  {
    id: 'mock-summit-catering',
    title: 'Summit Catering Co.',
    archetypeLabel: 'AP backlog',
    tierLabel: 'Tier 3 — Judgment',
    description:
      'Catering vendor backlog: match invoices to accruals, resolve duplicate vendor names, and apply cash vs accrual policy edge cases.',
    kind: 'payload',
    payload: {
      meta: {
        id: 'APEX-SUMMIT-01',
        name: 'Summit Catering Co.',
        type: 'Hospitality',
        method: 'Accrual',
        period: 'March 2026',
        archetype: 'AP backlog',
        tier: 'Tier 3 — Judgment',
        totalFiles: 14,
        coreFiles: 5,
        noiseFiles: 2,
        tasks: 1,
      },
      transactions: [
        { date: '03/02', desc: 'SYSCO FOODS CHICAGO', amount: -1240.55, flag: 'clear', note: 'Weekly food cost' },
        { date: '03/05', desc: 'DEPOSIT — EVENT DEPOSIT #8841', amount: 4500.0, flag: 'clear', note: 'Catering prepayment' },
        { date: '03/07', desc: 'UBER *EATS HELP.UBER.COM', amount: -89.12, flag: 'ambig', note: 'Staff meal?' },
      ],
      chartOfAccounts: [
        { code: '1000', name: 'Operating Cash', type: 'Asset' },
        { code: '2100', name: 'Accounts Payable', type: 'Liability' },
        { code: '5000', name: 'Food Cost', type: 'Expense' },
      ],
      oldChartOfAccounts: [{ code: '999', name: 'Misc (legacy)', type: 'Expense' }],
      expensePolicy: [
        { key: 'Meals', val: 'Cap $75 per attendee; receipt required.' },
        { key: 'AP', val: 'Match invoice # to PO when present.' },
      ],
      oldExpensePolicy: [{ key: 'Meals (2024)', val: 'Cap $50' }],
      invoices: [
        {
          id: 'inv_sysco',
          vendor: 'Sysco Chicago',
          invNum: 'SC-99201',
          date: '03/01/26',
          desc: 'Dry goods',
          amount: '$1,240.55',
          warn: null,
        },
        {
          id: 'inv_sysco_dup',
          vendor: 'Sysco Chicago',
          invNum: 'SC-99201-R',
          date: '03/01/26',
          desc: 'Duplicate upload (test)',
          amount: '$1,240.55',
          warn: 'Possible duplicate of SC-99201',
        },
      ],
      rubric: [
        { n: 1, text: 'Food cost mapped to 5000 with correct sign.', type: 'det', label: 'deterministic' },
        { n: 2, text: 'Duplicate Sysco invoice flagged with reasoning.', type: 'llm', label: 'llm judge' },
      ],
      taskPrompt:
        'You are the bookkeeper for Summit Catering Co. for March 2026. Reconcile vendor invoices to the bank feed and chart of accounts; call out duplicates.',
      ambiguityTypes: ['Unclear Vendor', 'Date Mismatch'],
      misleadingFiles: [{ file: 'invoice_sc99201_dup.pdf', why: 'Intentional duplicate vendor bait' }],
    },
  },
  {
    id: 'static-acqui',
    title: 'AcquiCo Inc.',
    archetypeLabel: 'Deals Advisory',
    tierLabel: 'Tier 3 — Judgment',
    description:
      'Private-equity acquisition diligence data room: extract cash balances and adjusted EBITDA, identify one-time items, reject news-context noise, and evaluate personnel synergy.',
    kind: 'fileworld',
    worldRef: 'STATIC_ACQUI_WORLD',
    defaultExpandedFolders: ['', '01_Financials', '02_ProForma', '03_Headcount', '04_DiligenceDocs', '05_NewsContext', '06_Legal'],
  },
];

/** Published rows from Supabase (graders see `is_published = true` per RLS); prepended to mock cards */
let graderLobbyRemoteRows = [];

function getLobbyWorlds() {
  return [...graderLobbyRemoteRows, ...MOCK_PUBLISHED_WORLDS];
}

function lobbyCardDescriptionFromPayload(payload) {
  const p = payload && typeof payload === 'object' ? payload : {};
  const meta = p.meta && typeof p.meta === 'object' ? p.meta : {};
  const task = typeof p.taskPrompt === 'string' ? p.taskPrompt.trim()
    : typeof meta.taskPrompt === 'string' ? meta.taskPrompt.trim() : '';
  if (task) return task.length > 220 ? `${task.slice(0, 217)}…` : task;
  const desc = typeof meta.description === 'string' ? meta.description.trim() : '';
  if (desc) return desc.length > 220 ? `${desc.slice(0, 217)}…` : desc;
  const name = meta.company || meta.name || 'this business';
  return `Expert-authored world for ${name}. Open to review task, rubric, and files.`;
}

async function fetchPublishedWorldsForLobby() {
  if (GRADER_PREVIEW_MODE) return;
  try {
    const res = await fetch('/api/bootstrap');
    const cfg = await res.json();
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.1');
    const sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session) return;
    const { data: rows, error } = await sb
      .from('worlds')
      .select('id,title,payload,updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });
    if (error) {
      console.warn('Grader lobby: could not load published worlds:', error.message);
      return;
    }
    if (!rows || !rows.length) return;
    graderLobbyRemoteRows = rows.map((row) => {
      const p = row.payload && typeof row.payload === 'object' ? row.payload : {};
      const meta = p.meta && typeof p.meta === 'object' ? p.meta : {};
      const isFileworld = Array.isArray(p.files);
      const entry = {
        id: row.id,
        title: row.title || meta.company || meta.name || 'Untitled world',
        archetypeLabel: String(meta.archetype || 'Expert world'),
        tierLabel: String(meta.tier || '—'),
        description: lobbyCardDescriptionFromPayload(p),
        kind: isFileworld ? 'fileworld' : 'payload',
      };
      if (isFileworld) {
        entry.worldData = p;
        entry.defaultExpandedFolders = Array.isArray(meta.defaultExpandedFolders)
          ? meta.defaultExpandedFolders
          : [''];
      } else {
        entry.payload = p;
      }
      return entry;
    });
    const lobbyEl = document.getElementById('grader-lobby');
    if (lobbyEl && lobbyEl.style.display !== 'none') mountLobby();
    if (graderAppPhase === 'grading') rebuildUI();
  } catch (e) {
    console.warn('Grader lobby: Supabase unavailable', e);
  }
}

let graderAppPhase = 'lobby';
let activePublishedWorldId = null;
let graderWorldDropdownOpen = false;

function mergeWorldPayload(payload) {
  const base = cloneWorld(GRADER_DEFAULT_WORLD);
  if (!payload || typeof payload !== 'object') return base;
  return {
    ...base,
    ...payload,
    meta: { ...base.meta, ...(payload.meta || {}) },
    transactions: Array.isArray(payload.transactions) ? payload.transactions : base.transactions,
    chartOfAccounts: Array.isArray(payload.chartOfAccounts) ? payload.chartOfAccounts : base.chartOfAccounts,
    oldChartOfAccounts: Array.isArray(payload.oldChartOfAccounts) ? payload.oldChartOfAccounts : base.oldChartOfAccounts,
    expensePolicy: Array.isArray(payload.expensePolicy) ? payload.expensePolicy : base.expensePolicy,
    oldExpensePolicy: Array.isArray(payload.oldExpensePolicy) ? payload.oldExpensePolicy : base.oldExpensePolicy,
    invoices: payload.invoices != null ? payload.invoices : base.invoices,
    rubric: Array.isArray(payload.rubric) ? payload.rubric : base.rubric,
    taskPrompt: payload.taskPrompt != null ? payload.taskPrompt : base.taskPrompt,
    ambiguityTypes: Array.isArray(payload.ambiguityTypes) ? payload.ambiguityTypes : base.ambiguityTypes,
    misleadingFiles: Array.isArray(payload.misleadingFiles) ? payload.misleadingFiles : base.misleadingFiles,
  };
}

function getActiveMockWorld() {
  return getLobbyWorlds().find((w) => w.id === activePublishedWorldId) || null;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getApiKey() {
  const provider = getAiProvider();
  return localStorage.getItem(`apex_api_key_${provider}`) || (provider === 'anthropic' ? localStorage.getItem('apex_api_key') : '') || '';
}
function setApiKey(v) {
  localStorage.setItem(`apex_api_key_${getAiProvider()}`, v);
  localStorage.setItem('apex_api_key', v);
}
function getAiProvider() {
  return localStorage.getItem('apex_ai_provider') || 'anthropic';
}
function getAiModel() {
  const provider = getAiProvider();
  const fallback = provider === 'openai' ? 'gpt-4.1' : 'claude-sonnet-4-20250514';
  return localStorage.getItem(`apex_ai_model_${provider}`) || fallback;
}
function setAiProvider(v) {
  localStorage.setItem('apex_ai_provider', v);
  updateAiModelInput();
  const input = document.getElementById('apikey-input');
  if (input) input.value = getApiKey();
}
function setAiModel(v) {
  const model = String(v || '').trim();
  if (model) localStorage.setItem(`apex_ai_model_${getAiProvider()}`, model);
}
function getAiProviderLabel() {
  return getAiProvider() === 'openai' ? 'OpenAI' : 'Anthropic';
}
function getAiRequestHeaders(key) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': key,
    'x-ai-provider': getAiProvider(),
  };
}
function updateAiModelInput() {
  const input = document.getElementById('ai-model-input');
  if (input) input.value = getAiModel();
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

function exitGraderView() {
  if (!GRADER_PREVIEW_MODE) return hardLogout();
  try {
    sessionStorage.removeItem('apex_viewer_mode');
    sessionStorage.removeItem('apex_viewer_return_href');
  } catch (_) {}
  window.location.href = graderPreviewExitHref;
}

function buildSessionActionButtons() {
  if (GRADER_PREVIEW_MODE) {
    return `<span><button type="button" class="gen-btn" onclick="exitGraderView()">EXIT GRADER VIEW</button></span>`;
  }
  return `<span><button type="button" class="gen-btn" onclick="hardLogout()">SIGN OUT</button></span>`;
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

function getGraderFileCatalog() {
  if (isFilesWorld()) {
    const typeLabels = { policy: 'PDF · Policy', invoice: 'PDF · Invoice', ledger: 'CSV · Ledger', profile: 'TXT · Profile' };
    return WORLD.files.map((f) => ({
      id: f.path,
      name: f.path.split('/').pop(),
      typeLabel: typeLabels[f.type] || 'TXT · File',
      badges: ['core'],
    }));
  }

  const out = [];
  out.push({ id: 'bank', name: 'bank_statement.csv', typeLabel: 'CSV · Banking', badges: ['core'] });
  out.push({ id: 'coa', name: 'chart_of_accounts.xlsx', typeLabel: 'XLSX · Ledger', badges: ['core'] });
  out.push({ id: 'policy', name: 'expense_policy.pdf', typeLabel: 'PDF · Policy', badges: ['core'] });
  getInvoiceList().forEach((inv) => {
    out.push({
      id: inv.id,
      name: `${inv.invNum || inv.id}.pdf`,
      typeLabel: 'PDF · Invoice',
      badges: inv.warn ? ['core', 'warn'] : ['core'],
    });
  });
  out.push({ id: 'task', name: 'task_01.txt', typeLabel: 'TXT · Task', badges: ['core'] });
  out.push({ id: 'noise', name: 'misc_notes.txt', typeLabel: 'TXT · Noise', badges: ['noise'] });
  return out;
}

function getGraderCatalogEntry(fileId) {
  return getGraderFileCatalog().find((e) => e.id === fileId) || null;
}

function catalogTagsHtml(entry) {
  return (entry.badges || []).map((b) => badgeHtml(b)).join('');
}

function rawSnippetForDrawer(fileId) {
  if (isFilesWorld()) {
    const f = (WORLD.files || []).find((x) => x.path === (fileworldActiveFilePath || fileId));
    return f ? String(f.content || '').slice(0, 12000) : '';
  }
  if (fileId === 'bank') {
    const rows = (WORLD.transactions || [])
      .map((t) => `${t.date},${t.desc},${t.amount >= 0 ? '+' : ''}${Number(t.amount).toFixed(2)}`)
      .join('\n');
    return `date,description,amount\n${rows}`.slice(0, 12000);
  }
  if (fileId === 'coa') {
    return (WORLD.chartOfAccounts || []).map((r) => `${r.code}\t${r.name}\t${r.type}`).join('\n').slice(0, 12000);
  }
  if (fileId === 'policy') {
    return (WORLD.expensePolicy || []).map((p) => `${p.key}: ${p.val}`).join('\n').slice(0, 12000);
  }
  if (fileId === 'task') {
    const t = WORLD.taskPrompt || `You are working as a bookkeeper for ${WORLD.meta?.name || 'this business'}.`;
    return String(t).slice(0, 12000);
  }
  if (fileId === 'noise') {
    return '(Noise file — no structured payload in viewer.)';
  }
  const inv = getInvoiceList().find((i) => i.id === fileId);
  if (inv) {
    return [
      `Vendor: ${inv.vendor}`,
      `Invoice #: ${inv.invNum || inv.id}`,
      `Date: ${inv.date}`,
      `Description: ${inv.desc}`,
      `Amount: ${inv.amount}`,
      inv.warn ? `Warning: ${inv.warn}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

function renderGraderDrawerBody(fileId) {
  const entry = getGraderCatalogEntry(fileId);
  const name = entry?.name || fileId;
  const typeLabel = entry?.typeLabel || '—';
  const mis = WORLD.misleadingFiles;
  let misBlock =
    '<div class="grader-drawer-k">Misleading / red herring</div><div class="grader-drawer-v">None listed in world payload.</div>';
  if (Array.isArray(mis) && mis.length) {
    const lines = mis
      .map((m) => {
        const file = typeof m === 'object' && m ? m.file : m;
        const why = typeof m === 'object' && m && m.why ? m.why : '';
        return { file: String(file || ''), why: String(why || '') };
      })
      .filter((x) => x.file);
    const base = name.replace(/\.[^.]+$/, '').toLowerCase();
    const hits = lines.filter((x) => {
      const f = x.file.toLowerCase();
      return f.includes(base) || name.toLowerCase().includes(f.slice(0, 8));
    });
    if (hits.length) {
      misBlock =
        '<div class="grader-drawer-k">Misleading / red herring</div>' +
        hits.map((h) => `<div class="grader-drawer-warn">${escHtml(h.file)}${h.why ? ` — ${escHtml(h.why)}` : ''}</div>`).join('');
    } else {
      misBlock = `<div class="grader-drawer-k">Misleading / red herring</div><div class="grader-drawer-v">${mis.length} entr(y/ies) in world; none auto-matched this file name.</div><div class="grader-drawer-pre" style="max-height:120px;margin-top:6px">${mis.map((m) => escHtml(typeof m === 'object' ? m.file : m)).join('\n')}</div>`;
    }
  }
  const amb = Array.isArray(WORLD.ambiguityTypes) ? WORLD.ambiguityTypes.filter(Boolean) : [];
  const ambHtml = amb.length
    ? `<div class="grader-drawer-sec"><div class="grader-drawer-k">Ambiguity types (world)</div><div class="grader-drawer-v">${amb.map((a) => escHtml(a)).join('<br>')}</div></div>`
    : '';
  return `
    <div class="grader-drawer-sec">
      <div class="grader-drawer-k">File name</div>
      <div class="grader-drawer-v">${escHtml(name)}</div>
    </div>
    <div class="grader-drawer-sec">
      <div class="grader-drawer-k">File type</div>
      <div class="grader-drawer-v">${escHtml(typeLabel)}</div>
    </div>
    <div class="grader-drawer-sec">
      <div class="grader-drawer-k">Expert notes</div>
      <div class="grader-drawer-v">Per-file notes live in the world payload when authored in Expert. Use <strong>task + rubric</strong> for full agent brief.</div>
    </div>
    <div class="grader-drawer-sec">${misBlock}</div>
    ${ambHtml}
    <div class="grader-drawer-sec">
      <div class="grader-drawer-k">Raw extracted / dump</div>
      <pre class="grader-drawer-pre">${escHtml(rawSnippetForDrawer(fileId))}</pre>
    </div>`;
}

function renderGraderBrowse() {
  const cat = getGraderFileCatalog();
  const listOn = graderBrowseLayout === 'list' ? 'active' : '';
  const gridOn = graderBrowseLayout === 'grid' ? 'active' : '';
  const toolbar = `
    <div class="grader-browse-toolbar">
      <span class="section-label" style="margin:0">World files</span>
      <div class="grader-browse-spacer"></div>
      <div class="grader-view-toggle" role="group" aria-label="View mode">
        <button type="button" class="${listOn}" onclick="setGraderBrowseLayout('list')">List</button>
        <button type="button" class="${gridOn}" onclick="setGraderBrowseLayout('grid')">Grid</button>
      </div>
    </div>`;

  if (graderBrowseLayout === 'grid') {
    const tiles = cat
      .map(
        (e) => `<button type="button" class="grader-file-tile" onclick='openGraderFileViewer(${JSON.stringify(e.id)})'>
        <div class="grader-file-tile-name">${escHtml(e.name)}</div>
        <div class="grader-file-tile-type">${escHtml(e.typeLabel)}</div>
        <div class="grader-file-tile-tags grader-browse-tags">${catalogTagsHtml(e)}</div>
      </button>`
      )
      .join('');
    return `${toolbar}<div class="grader-file-tile-grid">${tiles}</div>`;
  }

  const rows = cat
    .map(
      (e) => `<tr class="grader-browse-row" onclick='openGraderFileViewer(${JSON.stringify(e.id)})'>
      <td style="font-weight:600">${escHtml(e.name)}</td>
      <td style="color:var(--text2);font-family:var(--mono);font-size:11px">${escHtml(e.typeLabel)}</td>
      <td><div class="grader-browse-tags">${catalogTagsHtml(e)}</div></td>
    </tr>`
    )
    .join('');
  return `${toolbar}
    <div class="grader-browse-table-wrap">
      <table class="data-table grader-browse-table">
        <thead><tr><th>File name</th><th>Type</th><th>Tags</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderGraderViewer() {
  const fileId = isFilesWorld() ? fileworldActiveFilePath : activeFile;
  const entry = getGraderCatalogEntry(fileId);
  const title = entry?.name || (fileworldActiveFilePath ? fileworldActiveFilePath.split('/').pop() : activeFile);
  const body = renderFileView(fileId);
  const drawerOpen = graderDrawerOpen ? 'open' : '';
  const backdropVis = graderDrawerOpen ? 'visible' : '';
  return `
    <div class="grader-doc-viewer">
      <div class="grader-doc-toolbar">
        ${isFilesWorld() ? '' : '<button type="button" class="gen-btn" onclick="backToGraderDirectory()">← Back to directory</button>'}
        <span class="grader-doc-title">${escHtml(title)}</span>
        <button type="button" class="gen-btn" onclick="toggleGraderDrawer()">View details</button>
      </div>
      <div class="grader-doc-body">${body}</div>
      <div class="grader-drawer-backdrop ${backdropVis}" onclick="closeGraderDrawer()"></div>
      <aside class="grader-drawer-panel ${drawerOpen}" aria-hidden="${graderDrawerOpen ? 'false' : 'true'}">
        <div class="grader-drawer-head">
          <span>File details</span>
          <button type="button" class="gen-btn" onclick="closeGraderDrawer()">Close</button>
        </div>
        <div class="grader-drawer-body">${renderGraderDrawerBody(fileId)}</div>
      </aside>
    </div>`;
}

function updateGraderMainLayoutClasses() {
  const main = document.getElementById('main');
  if (!main) return;
  main.classList.toggle('grader-non-file-tab', activeTab !== 'view');
  if (activeTab === 'view') {
    // fileworld: tree IS the nav — never hide sidebar with browse-mode
    main.classList.toggle('grader-browse-mode', graderBrowsePhase === 'browse' && !isFilesWorld());
  } else {
    main.classList.remove('grader-browse-mode');
  }
}

function refreshGraderFileViewPanel() {
  const panel = document.getElementById('panel');
  if (!panel) return;
  if (activeTab !== 'view') return;
  if (isFilesWorld()) {
    // Fileworld: tree is the nav, panel shows content or empty state
    if (fileworldActiveFilePath) panel.innerHTML = renderGraderViewer();
    else panel.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:10px;color:var(--text3);text-align:center">
      <span style="font-size:32px">◧</span>
      <span style="font-size:13px">Select a file from the directory tree</span>
      <span style="font-size:11px;color:var(--text3)">Explore the company hierarchy — policies, invoices, profiles, and ledgers.</span>
    </div>`;
  } else if (graderBrowsePhase === 'browse') {
    panel.innerHTML = renderGraderBrowse();
  } else {
    panel.innerHTML = renderGraderViewer();
  }
  updateGraderMainLayoutClasses();
}

function openGraderFileViewer(fileId) {
  if (isFilesWorld()) {
    selectFileworldFile(fileId);
    return;
  }
  activeFile = fileId;
  graderBrowsePhase = 'viewer';
  graderDrawerOpen = false;
  rebuildUI();
}

function backToGraderDirectory() {
  if (isFilesWorld()) fileworldActiveFilePath = null;
  graderBrowsePhase = 'browse';
  graderDrawerOpen = false;
  rebuildUI();
}

function setGraderBrowseLayout(layout) {
  if (layout === 'list' || layout === 'grid') graderBrowseLayout = layout;
  if (activeTab === 'view' && graderBrowsePhase === 'browse') refreshGraderFileViewPanel();
}

function toggleGraderDrawer() {
  graderDrawerOpen = !graderDrawerOpen;
  refreshGraderFileViewPanel();
}

function closeGraderDrawer() {
  graderDrawerOpen = false;
  refreshGraderFileViewPanel();
}

function renderFileworldFile(filePath) {
  if (!filePath) {
    return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:10px;color:var(--text3);text-align:center">
      <span style="font-size:32px">◧</span>
      <span style="font-size:13px">Select a file from the directory tree</span>
      <span style="font-size:11px;color:var(--text3)">Explore the company hierarchy — policies, invoices, profiles, and ledgers.</span>
    </div>`;
  }
  const f = (WORLD.files || []).find((x) => x.path === filePath);
  if (!f) return `<div class="section-label">File not found: ${escHtml(filePath)}</div>`;
  const name = filePath.split('/').pop();
  const typeLabels = { policy: 'Policy', invoice: 'Invoice', ledger: 'Ledger', profile: 'Profile' };
  const typeLabel = typeLabels[f.type] || f.type;
  const typeClasses = { policy: 'fw-type-policy', invoice: 'fw-type-invoice', ledger: 'fw-type-ledger', profile: 'fw-type-profile' };
  const typeClass = typeClasses[f.type] || 'fw-type-policy';

  if (f.type === 'ledger') {
    const lines = (f.content || '').trim().split('\n');
    const header = lines[0] ? lines[0].split(',') : [];
    const rows = lines.slice(1).filter(l => l.trim()).map((line) => {
      const cells = line.split(',');
      return '<tr>' + cells.map((c, i) => {
        const raw = c.trim();
        const num = parseFloat(raw.replace(/[^0-9.-]/g, ''));
        const isAmt = i > 0 && !isNaN(num) && raw !== '' && /[$\d]/.test(raw);
        const cls = isAmt ? (num < 0 ? 'amount-neg' : num > 0 ? 'amount-pos' : '') : '';
        return `<td${cls ? ` class="${cls}"` : ''}>${escHtml(raw)}</td>`;
      }).join('') + '</tr>';
    }).join('');
    const headerHtml = header.map((h) => `<th>${escHtml(h.trim())}</th>`).join('');
    return `<div class="section-label" style="margin-bottom:10px">${escHtml(name)}</div>` +
      `<span class="fw-doc-type ${typeClass}">${typeLabel}</span>` +
      `<div class="fw-table-wrap" style="margin-top:10px"><table class="data-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  return `<div class="section-label" style="margin-bottom:10px">${escHtml(name)}</div>` +
    `<div class="fw-doc"><span class="fw-doc-type ${typeClass}">${typeLabel}</span>\n${escHtml(f.content || '')}</div>`;
}

function renderFileView(fileId) {
  if (isFilesWorld()) return renderFileworldFile(fileworldActiveFilePath);
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
  const task = WORLD.meta?.taskPrompt || WORLD.taskPrompt || `You are working as a bookkeeper for ${WORLD.meta?.name || 'this business'}.`;
  const rubricRows = (WORLD.rubric || []).map((r) => `<div class="rubric-item"><div class="rubric-n">${r.n}</div><div class="rubric-body"><div class="rubric-text">${escHtml(r.text)}</div><span class="rtype rtype-${r.type}">${escHtml(r.label || r.type)}</span></div></div>`).join('');
  return `<div class="task-box">${escHtml(task)}</div><div class="section-label">rubric</div>${rubricRows}`;
}

function renderMetaTab() {
  if (isFilesWorld()) {
    const m = WORLD.meta || {};
    return `<div class="meta-grid">
      <div class="meta-card"><div class="mc-label">world id</div><div class="mc-val">${escHtml(m.id || '')}</div></div>
      <div class="meta-card"><div class="mc-label">company</div><div class="mc-val">${escHtml(m.company || '')}</div></div>
      <div class="meta-card"><div class="mc-label">industry</div><div class="mc-val">${escHtml(m.industry || '')}</div></div>
      <div class="meta-card"><div class="mc-label">period</div><div class="mc-val">${escHtml(m.period || '')}</div></div>
      <div class="meta-card"><div class="mc-label">files</div><div class="mc-val">${WORLD.files.length}</div></div>
      <div class="meta-card"><div class="mc-label">archetype</div><div class="mc-val">${escHtml(m.archetype || 'invoice-approval')}</div></div>
    </div>`;
  }
  return `<div class="meta-grid">
    <div class="meta-card"><div class="mc-label">world id</div><div class="mc-val">${escHtml(WORLD.meta?.id || '')}</div></div>
    <div class="meta-card"><div class="mc-label">business</div><div class="mc-val">${escHtml(WORLD.meta?.name || '')}</div></div>
    <div class="meta-card"><div class="mc-label">archetype</div><div class="mc-val">${escHtml(WORLD.meta?.archetype || '')}</div></div>
    <div class="meta-card"><div class="mc-label">period</div><div class="mc-val">${escHtml(WORLD.meta?.period || '')}</div></div>
  </div>`;
}

function buildWorldSwitcher() {
  const cur = getActiveMockWorld();
  const label = cur?.title || WORLD.meta?.name || 'World';
  const items = getLobbyWorlds().map((w) => {
    const curMark = w.id === activePublishedWorldId ? ' · current' : '';
    return `<button type="button" class="grader-dd-item${w.id === activePublishedWorldId ? ' is-active' : ''}" onclick='enterPublishedWorld(${JSON.stringify(w.id)}); closeWorldDropdown();'>${escHtml(w.title)}${escHtml(curMark)}</button>`;
  }).join('');
  return `
    <span class="tb-sep">/</span>
    <div class="grader-dd-wrap">
      <button type="button" class="grader-breadcrumb-dd" aria-expanded="false" onclick="event.stopPropagation(); toggleWorldDropdown(event)">
        <span class="tb-world">GRADER CONSOLE</span>
        <span class="tb-sep">/</span>
        <span class="grader-dd-label">${escHtml(label)} <span class="grader-dd-caret">▼</span></span>
      </button>
      <div id="grader-world-dd" class="grader-world-dd-menu">
        ${items}
        ${
          GRADER_PREVIEW_MODE
            ? ''
            : '<div class="grader-dd-divider"></div><button type="button" class="grader-dd-item grader-dd-return" onclick="closeWorldDropdown(); returnToGraderLobby();">Return to Lobby</button>'
        }
      </div>
    </div>`;
}

function buildTopbar() {
  const switcher = graderAppPhase === 'grading' && !GRADER_PREVIEW_MODE ? buildWorldSwitcher() : '';
  const worldName = isFilesWorld() ? (WORLD.meta?.company || WORLD.meta?.name || '') : (WORLD.meta?.name || '');
  const nameOnly =
    graderAppPhase !== 'grading'
      ? `<span class="tb-sep">·</span><span class="tb-name">${escHtml(worldName)}</span>`
      : '';
  return `
    <span class="tb-logo"><img src="/assets/symbal-logo.png" alt="" class="tb-logo-img" width="22" height="22" />SYMBAL ACCOUNTING <span class="title-serif">apex</span></span>
    <span class="tb-sep">/</span>
    ${
      switcher ||
      (GRADER_PREVIEW_MODE && graderAppPhase === 'grading'
        ? `<span class="tb-world">GRADER VIEW</span><span class="tb-sep">/</span><span class="tb-name">${escHtml(WORLD.meta?.name || '')}</span>`
        : `<span class="tb-world">GRADER CONSOLE</span>${nameOnly}`)
    }
    <div class="tb-meta">
      <span><span class="dot"></span>${isFilesWorld() ? WORLD.files.length : escHtml(WORLD.meta?.totalFiles || 0)} files</span>
      <span><button type="button" class="gen-btn" onclick="openApiKeyModal()">API KEY</button></span>
      ${buildSessionActionButtons()}
    </div>`;
}

function renderGraderLobby() {
  const cards = getLobbyWorlds().map((w) => {
    return `<article class="grader-world-card">
      <div class="grader-world-card-title">${escHtml(w.title)}</div>
      <div class="grader-world-card-badges">
        <span class="grader-pill grader-pill-arch">${escHtml(w.archetypeLabel)}</span>
        <span class="grader-pill grader-pill-tier">${escHtml(w.tierLabel)}</span>
      </div>
      <p class="grader-world-card-desc">${escHtml(w.description)}</p>
      <button type="button" class="gen-btn grader-enter-btn" onclick='enterPublishedWorld(${JSON.stringify(w.id)})'>Enter World</button>
    </article>`;
  }).join('');
  return `
    <div class="grader-lobby-topbar">
      <span class="tb-logo"><img src="/assets/symbal-logo.png" alt="" class="tb-logo-img" width="22" height="22" />SYMBAL ACCOUNTING <span class="title-serif">apex</span></span>
      <span class="grader-lobby-spacer"></span>
      <button type="button" class="gen-btn" onclick="openApiKeyModal()">API KEY</button>
      ${GRADER_PREVIEW_MODE ? '' : '<button type="button" class="gen-btn" onclick="hardLogout()">SIGN OUT</button>'}
    </div>
    <div class="grader-lobby-inner">
      <h1 class="grader-lobby-h1">Grader Lobby</h1>
      <p class="grader-lobby-sub">Select a published world to open the grading workspace.</p>
      <div class="grader-lobby-grid">${cards}</div>
    </div>`;
}

function mountLobby() {
  const el = document.getElementById('grader-lobby');
  if (el) el.innerHTML = renderGraderLobby();
}

function showGradingWorkspace() {
  const lobby = document.getElementById('grader-lobby');
  const ws = document.getElementById('grader-workspace');
  if (lobby) lobby.style.display = 'none';
  if (ws) ws.style.display = 'flex';
}

function showGraderLobbyView() {
  graderAppPhase = 'lobby';
  activePublishedWorldId = null;
  graderWorldDropdownOpen = false;
  closeWorldDropdown();
  const lobby = document.getElementById('grader-lobby');
  const ws = document.getElementById('grader-workspace');
  if (ws) ws.style.display = 'none';
  if (lobby) {
    lobby.style.display = 'flex';
    mountLobby();
  }
}

function enterPublishedWorld(worldId) {
  const entry = getLobbyWorlds().find((w) => w.id === worldId);
  if (!entry) return;
  if (entry.kind === 'fileworld') {
    const worldData = entry.worldData || FILEWORLD_MAP[entry.worldRef] || FILEWORLD_MAP['STATIC_WORLD'];
    WORLD = cloneWorld(worldData);
    fileworldActiveFilePath = null;
    fileworldExpandedFolders = new Set(entry.defaultExpandedFolders || ['']);
  } else if (entry.kind === 'default') {
    WORLD = cloneWorld(GRADER_DEFAULT_WORLD);
  } else {
    WORLD = mergeWorldPayload(entry.payload);
  }
  activePublishedWorldId = worldId;
  graderAppPhase = 'grading';
  activeFile = 'bank';
  activeTab = 'view';
  graderBrowsePhase = 'browse';
  graderDrawerOpen = false;
  closeWorldDropdown();
  showGradingWorkspace();
  rebuildUI();
  switchTab('view');
}

function returnToGraderLobby() {
  if (GRADER_PREVIEW_MODE) {
    exitGraderView();
    return;
  }
  graderWorldDropdownOpen = false;
  WORLD = cloneWorld(GRADER_DEFAULT_WORLD);
  if (GRADER_PREVIEW_MODE) {
    activePublishedWorldId = 'expert-world-preview';
    graderAppPhase = 'grading';
    activeFile = 'bank';
    activeTab = 'view';
    graderBrowsePhase = 'browse';
    graderDrawerOpen = false;
    showGradingWorkspace();
    rebuildUI();
    switchTab('view');
    return;
  }
  showGraderLobbyView();
  fetchPublishedWorldsForLobby();
}

function closeWorldDropdown() {
  const menu = document.getElementById('grader-world-dd');
  if (menu) menu.classList.remove('open');
  graderWorldDropdownOpen = false;
  const btn = document.querySelector('.grader-breadcrumb-dd');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  document.removeEventListener('click', onDocumentCloseWorldDd);
}

function onDocumentCloseWorldDd() {
  closeWorldDropdown();
}

function toggleWorldDropdown(ev) {
  if (ev) ev.stopPropagation();
  document.removeEventListener('click', onDocumentCloseWorldDd);
  const menu = document.getElementById('grader-world-dd');
  if (!menu) return;
  const opening = !menu.classList.contains('open');
  menu.classList.toggle('open', opening);
  graderWorldDropdownOpen = opening;
  const btn = document.querySelector('.grader-breadcrumb-dd');
  if (btn) btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
  if (opening) {
    setTimeout(() => document.addEventListener('click', onDocumentCloseWorldDd), 10);
  }
}

function buildFiletreeForFilesWorld() {
  function buildNode(files) {
    const root = {};
    for (const f of files) {
      const parts = f.path.split('/');
      let node = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i];
        if (!node[seg]) node[seg] = { _isDir: true, _children: {} };
        node = node[seg]._children;
      }
      node[parts[parts.length - 1]] = { _isDir: false, _file: f };
    }
    return root;
  }

  function renderNode(node, depth, prefix) {
    let html = '';
    const indent = depth * 14;
    const fileIcons = { policy: '§', invoice: '▤', ledger: '▦', profile: '◉' };
    const entries = Object.entries(node).sort(([an, av], [bn, bv]) => {
      if (av._isDir && !bv._isDir) return -1;
      if (!av._isDir && bv._isDir) return 1;
      return an.localeCompare(bn);
    });
    for (const [name, val] of entries) {
      const fullPath = prefix ? prefix + '/' + name : name;
      if (val._isDir) {
        const isOpen = fileworldExpandedFolders.has(fullPath);
        const escapedPath = fullPath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        html += `<div class="file-row" style="padding-left:${indent}px;color:var(--text2)" onclick="toggleFileworldFolder('${escapedPath}')">` +
          `<span class="ficon" style="font-size:8px">${isOpen ? '▼' : '▶'}</span>` +
          `<span style="font-size:10px;margin-right:2px">${isOpen ? '◧' : '◫'}</span>` +
          `<span class="fname">${escHtml(name)}/</span></div>`;
        if (isOpen) html += renderNode(val._children, depth + 1, fullPath);
      } else {
        const f = val._file;
        const isActive = fileworldActiveFilePath === f.path;
        const icon = fileIcons[f.type] || '▤';
        const escapedPath = f.path.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        html += `<div class="file-row type-${f.type}${isActive ? ' active' : ''}" style="padding-left:${indent + 14}px" onclick="selectFileworldFile('${escapedPath}')">` +
          `<span class="ficon">${icon}</span>` +
          `<span class="fname">${escHtml(name)}</span></div>`;
      }
    }
    return html;
  }

  const tree = buildNode(WORLD.files);
  return renderNode(tree, 0, '');
}

function buildFiletree() {
  if (isFilesWorld()) return buildFiletreeForFilesWorld();
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
    <div class="task-box" style="margin-bottom:16px">Pick an archetype and generate a new world with your configured AI model.</div>
    <div class="archbar">
      <div class="archbar-left">
        ${ARCHETYPES.map((a) => `<button type="button" class="arch-btn ${a.id === activeArchetype ? 'active' : ''}" onclick="pickArchetype('${a.id}')">${escHtml(a.label)}</button>`).join('')}
      </div>
      <button type="button" class="gen-btn" onclick="generateWorld()">Generate world</button>
    </div>`;
}

function packWorldForAgentPrompt() {
  if (isFilesWorld()) {
    const files = (WORLD.files || [])
      .map((f) => `== ${f.path} ==\n${f.content || ''}`)
      .join('\n\n');
    const rubric = (WORLD.rubric || []).map((r, idx) => `${idx + 1}. [${r.type}] ${r.text}`).join('\n');
    const task =
      WORLD.meta?.taskPrompt ||
      WORLD.taskPrompt ||
      `You are working in the ${WORLD.meta?.company || WORLD.meta?.name || 'company'} data room. Review the files and complete the task.`;
    return `TASK:\n${task}\n\nFILES:\n${files}\n\nRUBRIC (for grading context):\n${rubric}`;
  }

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
      <strong>Test with sample agent</strong> sends one sample completion request through <span style="font-family:var(--mono)">/api/test-grader</span> so you can sanity-check the task + rubric against the current files.
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px">
      <button type="button" class="gen-btn" onclick="launchOwnAgent()">Run your agent</button>
      <button type="button" class="gen-btn" onclick="runSampleClaudeAgent()">Test with sample agent</button>
    </div>
    <div class="section-label">Sample agent output</div>
    <div id="sample-agent-output" class="task-box" style="min-height:120px;font-family:var(--mono);font-size:11px;white-space:pre-wrap;color:var(--text2)">Run “Test with sample agent” to see output here.</div>`;
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
  if (outEl) outEl.textContent = `Calling ${getAiProviderLabel()}…`;

  const system = isFilesWorld()
    ? 'You are an external diligence agent being evaluated. Return ONLY your final answer as plain text. Do not call tools.'
    : 'You are an external bookkeeping agent being evaluated. Return ONLY your final categorization output as plain text. Do not call tools.';
  const outputInstructions = isFilesWorld()
    ? 'OUTPUT: Answer each task directly. Cite source file paths for each factual claim. End with a concise risk and quality-of-evidence summary.'
    : 'OUTPUT: For each transaction give date, description, amount, account code, account name, flags, notes. End with a one-paragraph summary.';
  const user = `${packWorldForAgentPrompt()}\n\n${outputInstructions}`;

  setLoading(true, `Running sample ${getAiProviderLabel()} agent…`);
  try {
    const res = await fetch('/api/test-grader', {
      method: 'POST',
      headers: getAiRequestHeaders(key),
      body: JSON.stringify({
        model: getAiModel(),
        max_tokens: 2500,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || data?.error || `${getAiProviderLabel()} error ${res.status}`);
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
  const footer = document.getElementById('sb-footer');
  if (footer) footer.textContent = `${isFilesWorld() ? (WORLD.meta?.id || 'INV-W01') : (WORLD.meta?.id || 'APEX')} · grader`;
  if (activeTab === 'view') refreshGraderFileViewPanel();
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  document.getElementById(`tab-${tab}`)?.classList.add('active');
  if (tab === 'view') {
    refreshGraderFileViewPanel();
    return;
  }
  updateGraderMainLayoutClasses();
  if (tab === 'task') document.getElementById('panel').innerHTML = renderTaskTab();
  if (tab === 'meta') document.getElementById('panel').innerHTML = renderMetaTab();
  if (tab === 'generate') document.getElementById('panel').innerHTML = buildGenerateTab();
  if (tab === 'evaluate') document.getElementById('panel').innerHTML = buildEvaluateTab();
}

function toggleFileworldFolder(path) {
  if (fileworldExpandedFolders.has(path)) fileworldExpandedFolders.delete(path);
  else fileworldExpandedFolders.add(path);
  document.getElementById('sb-files').innerHTML = buildFiletree();
}

function selectFileworldFile(path) {
  fileworldActiveFilePath = path;
  graderBrowsePhase = 'viewer';
  graderDrawerOpen = false;
  document.getElementById('sb-files').innerHTML = buildFiletree();
  refreshGraderFileViewPanel();
}

function selectFile(id, el) {
  activeFile = id;
  graderBrowsePhase = 'viewer';
  graderDrawerOpen = false;
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
  const providerSelect = document.getElementById('ai-provider-select');
  if (providerSelect) providerSelect.value = getAiProvider();
  updateAiModelInput();
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
      headers: getAiRequestHeaders(key),
      body: JSON.stringify({
        model: getAiModel(),
        max_tokens: 2600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || data?.error || `${getAiProviderLabel()} error ${res.status}`);
    const text = String(data.content?.find((b) => b.type === 'text')?.text || '').trim();
    const m = text.match(/\{[\s\S]*\}$/);
    WORLD = { ...WORLD, ...(JSON.parse(m ? m[0] : text)) };
    try { sessionStorage.setItem('apex_active_world', JSON.stringify(WORLD)); } catch (_) {}
    graderBrowsePhase = 'browse';
    graderDrawerOpen = false;
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
    <div id="grader-lobby" class="grader-lobby"></div>
    <div id="grader-workspace" class="grader-workspace" style="display:none">
      <div id="topbar">${buildTopbar()}</div>
      <div id="main" style="position:relative">
        <aside id="grader-tab-sidebar" class="grader-tab-sidebar" aria-label="Workspace">
          <div class="grader-tabnav-label">Workspace</div>
          <div class="tab active" id="tab-view" onclick="switchTab('view')">file view</div>
          <div class="tab" id="tab-task" onclick="switchTab('task')">task + rubric</div>
          <div class="tab" id="tab-meta" onclick="switchTab('meta')">world meta</div>
          <div class="tab" id="tab-generate" onclick="switchTab('generate')">generate</div>
          <div class="tab" id="tab-evaluate" onclick="switchTab('evaluate')">evaluate</div>
        </aside>
        <div id="sidebar">
          <div class="sb-files" id="sb-files">${buildFiletree()}</div>
          <div class="sb-footer" id="sb-footer">${escHtml(WORLD.meta?.id || 'APEX')} · grader</div>
        </div>
        <div id="content">
          <div id="panel"></div>
        </div>
      </div>
    </div>
    <div id="loading-overlay">
      <div class="loading-title">Generating world…</div>
      <div class="loading-bar-wrap"><div class="loading-bar"></div></div>
      <div class="loading-sub">This may take 10-20 seconds.</div>
    </div>
    <div id="apikey-modal">
      <div class="modal-box">
        <div class="modal-title">Set AI provider</div>
        <div class="modal-sub">Choose a provider and model. Keys are stored locally in this browser.</div>
        <select id="ai-provider-select" class="modal-input" onchange="setAiProvider(this.value)">
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
        </select>
        <input id="ai-model-input" class="modal-input" type="text" placeholder="Model, e.g. claude-sonnet-4-20250514 or gpt-4.1" oninput="setAiModel(this.value)" />
        <input id="apikey-input" class="modal-input" type="password" placeholder="API key" />
        <div class="modal-actions">
          <button type="button" class="modal-btn modal-btn-cancel" onclick="closeApiKeyModal()">Cancel</button>
          <button type="button" class="modal-btn modal-btn-confirm" onclick="setApiKey(document.getElementById('apikey-input').value.trim());closeApiKeyModal()">Save</button>
        </div>
      </div>
    </div>`;
  showGraderLobbyView();
  fetchPublishedWorldsForLobby();
}

window.switchTab = switchTab;
window.selectFile = selectFile;
window.pickArchetype = pickArchetype;
window.generateWorld = generateWorld;
window.openApiKeyModal = openApiKeyModal;
window.closeApiKeyModal = closeApiKeyModal;
window.setAiProvider = setAiProvider;
window.setAiModel = setAiModel;
window.hardLogout = hardLogout;
window.exitGraderView = exitGraderView;
window.setApiKey = setApiKey;
window.launchOwnAgent = launchOwnAgent;
window.runSampleClaudeAgent = runSampleClaudeAgent;
window.openGraderFileViewer = openGraderFileViewer;
window.backToGraderDirectory = backToGraderDirectory;
window.setGraderBrowseLayout = setGraderBrowseLayout;
window.toggleGraderDrawer = toggleGraderDrawer;
window.closeGraderDrawer = closeGraderDrawer;
window.enterPublishedWorld = enterPublishedWorld;
window.returnToGraderLobby = returnToGraderLobby;
window.toggleWorldDropdown = toggleWorldDropdown;
window.closeWorldDropdown = closeWorldDropdown;

try {
  init();
} catch (e) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:20px;font-family:Inter,sans-serif"><h2 style="margin:0 0 8px 0">Grader console failed to load</h2><p style="margin:0 0 10px 0">${escHtml(e.message || String(e))}</p><button onclick="window.location.reload()">Reload</button></div>`;
  }
}
