import { getSupabase, signOutAndRedirect } from './auth-core.js';
import { requireRoles } from './auth-guard.js';
import { normalizePayload } from './world-payload.js';

const FILE_TYPE_GROUPS = [
  {
    label: 'Core Ledgers & Bank',
    options: [
      { id: 'chart_of_accounts', label: 'Chart of Accounts', csv: true },
      { id: 'general_ledger', label: 'General Ledger', csv: true },
      { id: 'trial_balance', label: 'Trial Balance', csv: true },
      { id: 'bank_statement', label: 'Bank Statement', csv: true },
    ],
  },
  {
    label: 'Source Documents',
    options: [
      { id: 'invoice', label: 'Invoice', csv: false },
      { id: 'receipt', label: 'Receipt', csv: false },
      { id: 'payroll_report', label: 'Payroll Report', csv: false },
      { id: 'tax_document', label: 'Tax Document', csv: false },
    ],
  },
  {
    label: 'Rules & Context',
    options: [
      { id: 'expense_policy', label: 'Expense Policy', csv: false },
      { id: 'management_memo', label: 'Management Memo', csv: false },
    ],
  },
];

const CUSTOM_TYPE_ID = '__custom__';

const CSV_SCHEMAS = {
  chart_of_accounts: ['Code', 'Name', 'Type'],
  general_ledger: ['Date', 'Account', 'Description', 'Debit', 'Credit'],
  trial_balance: ['Account', 'Debit', 'Credit'],
  bank_statement: ['Date', 'Description', 'Amount'],
};

const BUSINESS_TYPES = [
  'Agency',
  'Retail',
  'SaaS',
  'Manufacturing',
  'Healthcare',
  'Construction',
  'Non-profit',
  'Other',
];

const ARCHETYPES = ['Month-end close', 'AP', 'Tax', 'Payroll', 'Revenue recognition', 'Custom'];
const AMBIGUITY_PRESETS = [
  'Missing Document',
  'Date Mismatch',
  'Policy Violation',
  'Unclear Vendor',
  'Commingled Funds',
];

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function uid() {
  return `f_${Math.random().toString(36).slice(2, 9)}`;
}

function typeOptionsHtml(selected) {
  const groups = FILE_TYPE_GROUPS.map((group) => {
    const opts = group.options
      .map((opt) => `<option value="${opt.id}" ${opt.id === selected ? 'selected' : ''}>${opt.label}</option>`)
      .join('');
    return `<optgroup label="${group.label}">${opts}</optgroup>`;
  }).join('');
  return `${groups}<optgroup label="Custom"><option value="${CUSTOM_TYPE_ID}" ${selected === CUSTOM_TYPE_ID ? 'selected' : ''}>+ Add Custom File Type</option></optgroup>`;
}

function getTypeMeta(typeId) {
  for (const group of FILE_TYPE_GROUPS) {
    const hit = group.options.find((opt) => opt.id === typeId);
    if (hit) return hit;
  }
  return { id: typeId, label: 'Custom', csv: false };
}

const CORE_FILE_TYPES = new Set(['chart_of_accounts', 'general_ledger', 'trial_balance', 'bank_statement']);

function isCoreFileType(typeId) {
  return CORE_FILE_TYPES.has(typeId);
}

function fileTagBadgesHtml(f) {
  const parts = [];
  if (isCoreFileType(f.type)) parts.push('<span class="file-tag file-tag-core">CORE</span>');
  if (f.isMisleading) parts.push('<span class="file-tag file-tag-noise">NOISE</span>');
  if (!parts.length) parts.push('<span class="file-tag file-tag-muted">—</span>');
  return parts.join(' ');
}

function isCsvType(typeId, fileName) {
  const meta = getTypeMeta(typeId);
  if (meta.csv) return true;
  return /\.csv$/i.test(String(fileName || ''));
}

function schemaFor(typeId) {
  return CSV_SCHEMAS[typeId] || ['Column 1', 'Column 2', 'Column 3'];
}

function emptyGridRow(typeId) {
  const row = {};
  schemaFor(typeId).forEach((col) => {
    row[col] = '';
  });
  return row;
}

function emptyRubric(i = 1) {
  return {
    n: i,
    type: 'det',
    label: '',
    notes: '',
  };
}

function worldIdPlaceholder() {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `APEX-${ym}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function normalizeUploadedFiles(list) {
  if (!Array.isArray(list)) return [];
  return list.map((f) => ({
    id: f.id || uid(),
    type: f.type || 'invoice',
    customType: f.customType || '',
    displayLabel: f.displayLabel || f.label || f.fileName || '',
    notes: f.notes || '',
    extractedText: f.extractedText || f.contentText || '',
    fileName: f.fileName || '',
    mimeType: f.mimeType || '',
    sizeBytes: Number(f.sizeBytes || 0),
    isMisleading: Boolean(f.isMisleading),
    gridRows: Array.isArray(f.gridRows) ? f.gridRows : [],
  }));
}

const FILEWORLD_TYPE_MAP = {
  policy: 'expense_policy', invoice: 'invoice', ledger: 'general_ledger',
  bank: 'bank_statement', payroll: 'payroll_report',
};
const FILEWORLD_CUSTOM_LABEL = {
  workpaper: 'Work Paper', email: 'Email', contract: 'Contract',
  spreadsheet: 'Spreadsheet', report: 'Report',
};
function mimeFromPath(p) {
  const ext = String(p).split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'csv') return 'text/csv';
  if (ext === 'xlsx' || ext === 'xls') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return 'text/plain';
}
function fileworldFilesToUploadedFiles(files) {
  if (!Array.isArray(files)) return [];
  return files.map((f) => {
    const fwType = String(f.type || '');
    const mappedType = FILEWORLD_TYPE_MAP[fwType] || '__custom__';
    return {
      id: uid(),
      type: mappedType,
      customType: mappedType === '__custom__' ? (FILEWORLD_CUSTOM_LABEL[fwType] || fwType || 'Document') : '',
      displayLabel: f.path || f.name || '',
      notes: '',
      extractedText: f.content || '',
      fileName: String(f.path || '').split('/').pop(),
      mimeType: mimeFromPath(f.path || ''),
      sizeBytes: typeof f.content === 'string' ? f.content.length : 0,
      isMisleading: Boolean(f.isMisleading),
      gridRows: [],
    };
  });
}

function render(app, dbRow, state, isAdmin) {
  const adminLink = isAdmin
    ? '<a href="admin.html" class="btn btn-ghost" style="text-decoration:none">Admin</a>'
    : '';
  app.innerHTML = `
    <div class="editor-sticky">
      <div class="inner">
        <a href="expert.html" class="btn btn-ghost">← Worlds</a>
        ${adminLink}
        <div class="step-title">World Builder</div>
        <button type="button" class="btn btn-ghost" id="btn-logout">Sign out</button>
        <span class="save-status" id="save-status"></span>
        <span id="publish-state" class="badge ${dbRow.is_published ? 'badge-pub' : 'badge-drf'}" style="margin-left:10px">${dbRow.is_published ? 'Published' : 'Draft'}</span>
      </div>
    </div>

    <section class="section" id="sec-setup">
      <h2>Step 1: World setup</h2>
      <div class="field-grid">
        <div class="field">
          <label>World Name</label>
          <input type="text" id="world-name" value="${esc(dbRow.title || '')}" placeholder="Q1 Close - Northwind Services" />
        </div>
        <div class="field">
          <label>World ID</label>
          <input type="text" id="world-id" value="${esc(state.meta.id || '')}" placeholder="${esc(worldIdPlaceholder())}" />
        </div>
        <div class="field">
          <label>Business Type</label>
          <select id="business-type">
            ${BUSINESS_TYPES.map((t) => `<option value="${t}" ${state.meta.type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Accounting Method</label>
          <select id="accounting-method">
            <option value="Cash" ${state.meta.method === 'Cash' ? 'selected' : ''}>Cash</option>
            <option value="Accrual" ${state.meta.method === 'Accrual' ? 'selected' : ''}>Accrual</option>
          </select>
        </div>
        <div class="field">
          <label>Archetype</label>
          <select id="archetype">
            ${ARCHETYPES.map((a) => `<option value="${a}" ${state.meta.archetype === a ? 'selected' : ''}>${a}</option>`).join('')}
          </select>
        </div>
      </div>
    </section>

    <section class="section" id="sec-data-room">
      <h2>Step 2: The data room</h2>
      <div id="data-room-root" class="data-room-root"></div>
    </section>

    <section class="section" id="sec-agent-rules">
      <h2>Step 3: Agent rules</h2>
      <div class="field">
        <label>Task Prompt</label>
        <textarea id="task-prompt" rows="5">${esc(state.taskPrompt)}</textarea>
      </div>
      <div class="field-grid" style="margin-top:14px">
        <div class="field">
          <label>Ambiguity Tags</label>
          <div id="ambiguity-controls"></div>
          <div class="inline-actions" style="margin-top:8px">
            <input type="text" id="custom-ambiguity" class="tag-input" value="${esc(state.customAmbiguityInput || '')}" placeholder="Custom ambiguity tag" />
            <button type="button" class="btn btn-ghost" data-action="add-custom-ambiguity">+ Add Custom</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="sec-rubric-builder">
      <h2>Step 4: Grading rubric builder</h2>
      <div class="inspector-placeholder" style="margin-bottom:10px">
        <h3>Example Criterion (reference only)</h3>
        <div class="tiny-note" style="margin-top:0"># (ID): 1</div>
        <div class="tiny-note">Type: det</div>
        <div class="tiny-note">Label: Verify Total Expense Calculation</div>
        <div class="tiny-note">Specific Notes: Check that the agent's final calculated total matches exactly $4,250.00 based on the provided Q3 receipts.</div>
      </div>
      <div id="rubric-list"></div>
      <button type="button" class="btn btn-ghost" data-action="add-rubric">+ Add Criterion</button>
    </section>

    <div class="editor-actions">
      <button type="button" class="btn btn-ghost" data-action="save-draft">Save Draft</button>
      <button type="button" class="btn" data-action="publish">Publish</button>
    </div>
  `;
}

function renderAmbiguityControls(state) {
  const wrap = document.getElementById('ambiguity-controls');
  if (!wrap) return;
  wrap.innerHTML = `<div class="tag-grid">
    ${state.availableAmbiguityTags.map((tag) => {
      const active = state.selectedAmbiguities.includes(tag) ? 'active' : '';
      return `<button type="button" class="tag-btn ${active}" data-action="toggle-ambiguity" data-tag="${esc(tag)}">${esc(tag)}</button>`;
    }).join('')}
  </div>`;
}

function renderBrowseDashboard(state) {
  const listActive = state.browseLayout === 'list' ? 'active' : '';
  const gridActive = state.browseLayout === 'grid' ? 'active' : '';
  const toolbar = `
    <div class="data-room-toolbar">
      <button type="button" class="btn" data-action="start-upload">Upload Document</button>
      <div class="view-toggle-spacer"></div>
      <div class="view-toggle-group" role="group" aria-label="Directory view mode">
        <button type="button" class="view-toggle-btn ${listActive}" data-action="set-browse-layout" data-layout="list">List</button>
        <button type="button" class="view-toggle-btn ${gridActive}" data-action="set-browse-layout" data-layout="grid">Grid</button>
      </div>
    </div>`;

  if (!state.uploadedFiles.length) {
    return `${toolbar}<div class="empty-note">No files yet. Click "Upload Document".</div>`;
  }

  if (state.browseLayout === 'grid') {
    const tiles = state.uploadedFiles
      .map((f) => {
        const typeLabel = f.type === CUSTOM_TYPE_ID ? f.customType || 'Custom' : getTypeMeta(f.type).label;
        return `<button type="button" class="file-tile" data-action="open-file-viewer" data-file-id="${f.id}">
          <div class="file-tile-name">${esc(f.displayLabel || f.fileName || 'Untitled file')}</div>
          <div class="file-tile-type">${esc(typeLabel)}</div>
          <div class="file-tile-tags">${fileTagBadgesHtml(f)}</div>
        </button>`;
      })
      .join('');
    return `${toolbar}<div class="file-tile-grid">${tiles}</div>`;
  }

  const rows = state.uploadedFiles
    .map((f) => {
      const typeLabel = f.type === CUSTOM_TYPE_ID ? f.customType || 'Custom' : getTypeMeta(f.type).label;
      return `<tr class="browse-row" data-action="open-file-viewer" data-file-id="${f.id}">
        <td>${esc(f.displayLabel || f.fileName || 'Untitled file')}</td>
        <td>${esc(typeLabel)}</td>
        <td>${fileTagBadgesHtml(f)}</td>
      </tr>`;
    })
    .join('');
  return `${toolbar}
    <div class="browse-table-wrap">
      <table class="world-table browse-table">
        <thead><tr><th>File Name</th><th>Type</th><th>Tags</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderDrawerBody(file) {
  const typeLabel = file.type === CUSTOM_TYPE_ID ? file.customType || 'Custom' : getTypeMeta(file.type).label;
  const warn = file.isMisleading
    ? '<div class="drawer-warn">Misleading file / red herring — treat with caution in grading.</div>'
    : '<div class="tiny-note">Not flagged as misleading.</div>';
  return `
    <div class="drawer-section">
      <div class="drawer-k">File Type</div>
      <div class="drawer-v">${esc(typeLabel)}</div>
    </div>
    <div class="drawer-section">
      <div class="drawer-k">Expert Notes</div>
      <div class="drawer-v">${esc(file.notes || '—')}</div>
    </div>
    <div class="drawer-section">
      <div class="drawer-k">Misleading</div>
      ${warn}
    </div>
    <div class="drawer-section">
      <div class="drawer-k">Raw extracted text</div>
      <pre class="drawer-pre">${esc(file.extractedText || '')}</pre>
    </div>`;
}

function renderDocumentViewer(state, file) {
  const drawerClass = state.drawerOpen ? 'open' : '';
  const backdropClass = state.drawerOpen ? 'visible' : '';
  const cells = Array.from({ length: 12 }, () => '<div class="doc-preview-cell"></div>').join('');
  return `
    <div class="doc-viewer-shell">
      <div class="doc-viewer-toolbar">
        <button type="button" class="btn btn-ghost" data-action="back-to-directory">← Back to Directory</button>
        <span class="doc-viewer-title">${esc(file.displayLabel || file.fileName || 'Document')}</span>
        <button type="button" class="btn btn-ghost" data-action="toggle-drawer">View Details</button>
      </div>
      <div class="doc-viewer-body">
        <div class="doc-preview">
          <div class="doc-preview-label">Document preview (placeholder)</div>
          <div class="doc-preview-grid">${cells}</div>
          <div class="field" style="margin-top:12px">
            <label>Primary content</label>
            <textarea rows="12" data-bind-viewer="extractedText">${esc(file.extractedText)}</textarea>
          </div>
        </div>
        <details class="doc-meta-details">
          <summary>Classification & structured data</summary>
          ${renderFileView(state, file)}
        </details>
      </div>
      <div class="drawer-backdrop ${backdropClass}" data-action="close-drawer" aria-hidden="true"></div>
      <aside class="drawer-panel ${drawerClass}" aria-hidden="${state.drawerOpen ? 'false' : 'true'}">
        <div class="drawer-header">
          <h3>Details</h3>
          <button type="button" class="btn-icon" data-action="close-drawer">Close</button>
        </div>
        <div class="drawer-body">${renderDrawerBody(file)}</div>
      </aside>
    </div>`;
}

function renderDataRoom(state) {
  const root = document.getElementById('data-room-root');
  if (!root) return;
  if (state.uploadMode) {
    root.innerHTML = `<div class="data-room-upload-shell">${renderUploadMode(state)}</div>`;
    return;
  }
  if (state.dataRoomPhase === 'viewer' && state.activeFileId) {
    const file = state.uploadedFiles.find((f) => f.id === state.activeFileId);
    if (file) {
      root.innerHTML = renderDocumentViewer(state, file);
      return;
    }
  }
  root.innerHTML = renderBrowseDashboard(state);
}

function refreshDrawerIfOpen(state) {
  if (!state.drawerOpen) return;
  const file = state.uploadedFiles.find((f) => f.id === state.activeFileId);
  const body = document.querySelector('#data-room-root .drawer-body');
  if (file && body) body.innerHTML = renderDrawerBody(file);
}

function renderUploadMode(state) {
  const p = state.pendingUpload;
  const fileSummary = p.fileName ? `${p.fileName} (${p.mimeType || 'unknown'} • ${p.sizeBytes || 0} bytes)` : 'No file selected';
  return `
    <div class="inspector-placeholder">
      <h3>Classify New File</h3>
      <div class="field-grid">
        <div class="field">
          <label>Source file</label>
          <input type="file" data-action="pick-upload-file" />
          <div class="tiny-note">${esc(fileSummary)}</div>
        </div>
        <div class="field">
          <label>File Type</label>
          <select data-bind-pending="type">${typeOptionsHtml(p.type || 'invoice')}</select>
        </div>
      </div>
      ${p.type === CUSTOM_TYPE_ID ? `<div class="field"><label>Custom File Type</label><input type="text" data-bind-pending="customType" value="${esc(p.customType)}" placeholder="e.g., Vendor Contract" /></div>` : ''}
      <div class="field-grid" style="margin-top:10px">
        <div class="field">
          <label>Display Label</label>
          <input type="text" data-bind-pending="displayLabel" value="${esc(p.displayLabel)}" />
        </div>
        <div class="field">
          <label>Notes</label>
          <input type="text" data-bind-pending="notes" value="${esc(p.notes)}" />
        </div>
      </div>
      <label class="check-row" style="margin-top:10px">
        <input type="checkbox" data-bind-pending-check="isMisleading" ${p.isMisleading ? 'checked' : ''} />
        <span class="muted">Mark as Misleading / Red Herring</span>
      </label>
      <div class="field" style="margin-top:10px">
        <label>Extracted/Pasted Text</label>
        <textarea rows="7" data-bind-pending="extractedText">${esc(p.extractedText)}</textarea>
      </div>
      <div class="inline-actions">
        <button type="button" class="btn" data-action="save-upload">Add to Directory</button>
        <button type="button" class="btn btn-ghost" data-action="cancel-upload">Cancel</button>
      </div>
    </div>
  `;
}

function renderCsvGrid(file) {
  const cols = schemaFor(file.type);
  const rows = Array.isArray(file.gridRows) && file.gridRows.length ? file.gridRows : [emptyGridRow(file.type)];
  const head = cols.map((c) => `<th>${esc(c)}</th>`).join('');
  const body = rows
    .map((row, i) => {
      const tds = cols
        .map((c) => `<td><input type="text" data-grid-row="${i}" data-grid-col="${esc(c)}" value="${esc(row[c] ?? '')}" /></td>`)
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');
  return `
    <div class="data-table-wrap" style="margin-top:12px">
      <table class="data-table">
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    <button type="button" class="btn btn-ghost" style="margin-top:8px" data-action="add-grid-row">+ Add row</button>
  `;
}

function renderFileView(state, file) {
  const summary = file.fileName ? `${file.fileName} (${file.mimeType || 'unknown'} • ${file.sizeBytes || 0} bytes)` : 'No source file uploaded';
  return `
    <div class="inspector-placeholder">
      <h3>Edit File</h3>
      <div class="field-grid">
        <div class="field">
          <label>File Type</label>
          <select data-bind-active="type">${typeOptionsHtml(file.type || 'invoice')}</select>
        </div>
        ${file.type === CUSTOM_TYPE_ID ? `<div class="field"><label>Custom File Type</label><input type="text" data-bind-active="customType" value="${esc(file.customType)}" /></div>` : '<div></div>'}
      </div>
      <div class="field-grid" style="margin-top:10px">
        <div class="field">
          <label>Display Label</label>
          <input type="text" data-bind-active="displayLabel" value="${esc(file.displayLabel)}" />
        </div>
        <div class="field">
          <label>Notes</label>
          <input type="text" data-bind-active="notes" value="${esc(file.notes)}" />
        </div>
      </div>
      <label class="check-row" style="margin-top:10px">
        <input type="checkbox" data-bind-active-check="isMisleading" ${file.isMisleading ? 'checked' : ''} />
        <span class="muted">Mark as Misleading / Red Herring</span>
      </label>
      <div class="field" style="margin-top:10px">
        <label>Extracted/Pasted Text</label>
        <textarea rows="7" data-bind-active="extractedText">${esc(file.extractedText)}</textarea>
      </div>
      <div class="tiny-note">${esc(summary)}</div>
      ${isCsvType(file.type, file.fileName) ? renderCsvGrid(file) : ''}
      <div class="inline-actions" style="margin-top:10px">
        <button type="button" class="btn btn-ghost" data-action="remove-file">Remove file</button>
      </div>
    </div>
  `;
}

function renderRubric(state) {
  const wrap = document.getElementById('rubric-list');
  if (!wrap) return;
  wrap.innerHTML = state.rubric
    .map(
      (r, i) => `<div class="rubric-row" data-rub-i="${i}">
        <input type="number" min="1" value="${esc(r.n)}" data-bind-rub="n" />
        <select data-bind-rub="type">
          <option value="det" ${r.type === 'det' ? 'selected' : ''}>Deterministic (Exact Match)</option>
          <option value="llm" ${r.type === 'llm' ? 'selected' : ''}>LLM Judge (Fuzzy Match)</option>
          <option value="neg" ${r.type === 'neg' ? 'selected' : ''}>Negative Constraint (Penalty)</option>
        </select>
        <input type="text" value="${esc(r.label)}" data-bind-rub="label" placeholder="Label" />
        <input type="text" value="${esc(r.notes)}" data-bind-rub="notes" placeholder="Specific notes" />
        <button type="button" class="btn-icon" data-action="del-rubric" data-rub-i="${i}">✕</button>
      </div>`
    )
    .join('');
}

function makePendingUpload() {
  return {
    type: 'invoice',
    customType: '',
    displayLabel: '',
    notes: '',
    extractedText: '',
    fileName: '',
    mimeType: '',
    sizeBytes: 0,
    isMisleading: false,
  };
}

function collectPayload(basePayload, state) {
  const worldIdRaw = document.getElementById('world-id').value.trim();
  const worldName = document.getElementById('world-name').value.trim();
  const payload = {
    ...basePayload,
    meta: {
      ...(basePayload.meta || {}),
      id: worldIdRaw || worldIdPlaceholder(),
      name: worldName,
      type: document.getElementById('business-type').value,
      method: document.getElementById('accounting-method').value,
      archetype: document.getElementById('archetype').value,
      totalFiles: state.uploadedFiles.length,
      coreFiles: state.uploadedFiles.filter((f) => ['chart_of_accounts', 'general_ledger', 'trial_balance', 'bank_statement'].includes(f.type)).length,
      noiseFiles: 0,
      tasks: 1,
    },
    taskPrompt: document.getElementById('task-prompt').value,
    ambiguityTypes: [...state.selectedAmbiguities],
    misleadingFiles: state.uploadedFiles
      .filter((f) => f.isMisleading)
      .map((f) => ({ file: f.displayLabel || f.fileName || 'Untitled file', why: f.notes || 'Marked by expert as red herring' })),
    uploadedFiles: state.uploadedFiles.map((f) => ({
      id: f.id,
      type: f.type,
      customType: f.customType,
      displayLabel: f.displayLabel,
      notes: f.notes,
      extractedText: f.extractedText,
      fileName: f.fileName,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
      isMisleading: Boolean(f.isMisleading),
      gridRows: Array.isArray(f.gridRows) ? f.gridRows : [],
    })),
    rubric: state.rubric.map((r, i) => ({
      n: Number(r.n || i + 1),
      type: r.type || 'det',
      label: r.label || '',
      text: r.notes || '',
    })),
  };
  return payload;
}

async function init() {
  const app = document.getElementById('app');
  if (!app) return;
  app.textContent = 'Loading world editor…';
  const ctx = await requireRoles(['expert', 'admin']);
  if (!ctx) return;

  const id = new URLSearchParams(location.search).get('id')?.trim();
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

  row.is_published = row.is_published === true;

  const rawPayload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  const payload = normalizePayload(rawPayload);
  const isFileworldPayload = Array.isArray(rawPayload.files);
  const state = {
    meta: { ...(payload.meta || {}) },
    uploadedFiles: isFileworldPayload
      ? fileworldFilesToUploadedFiles(rawPayload.files)
      : normalizeUploadedFiles(payload.uploadedFiles),
    activeFileId: null,
    uploadMode: false,
    browseLayout: 'list',
    dataRoomPhase: 'browse',
    drawerOpen: false,
    pendingUpload: makePendingUpload(),
    taskPrompt: payload.taskPrompt || (isFileworldPayload && typeof rawPayload.meta?.taskPrompt === 'string' ? rawPayload.meta.taskPrompt : '') || '',
    availableAmbiguityTags: [...AMBIGUITY_PRESETS],
    selectedAmbiguities: Array.isArray(payload.ambiguityTypes) ? [...payload.ambiguityTypes] : [],
    customAmbiguityInput: '',
    rubric: (Array.isArray(payload.rubric) && payload.rubric.length
      ? payload.rubric.map((r, i) => ({ n: r.n ?? i + 1, type: r.type || 'det', label: r.label || '', notes: r.text || '' }))
      : [emptyRubric(1)]),
  };
  state.selectedAmbiguities.forEach((tag) => {
    if (!state.availableAmbiguityTags.includes(tag)) state.availableAmbiguityTags.push(tag);
  });
  if (state.uploadedFiles.length) state.activeFileId = state.uploadedFiles[0].id;

  app.classList.add('wrap');
  render(app, row, state, ctx.profile.role === 'admin');
  renderDataRoom(state);
  renderAmbiguityControls(state);
  renderRubric(state);

  const statusEl = document.getElementById('save-status');
  const publishStateEl = document.getElementById('publish-state');
  const setStatus = (msg, cls = '') => {
    statusEl.textContent = msg;
    statusEl.className = `save-status ${cls}`.trim();
  };

  function syncPublishBadge() {
    if (!publishStateEl) return;
    publishStateEl.textContent = row.is_published ? 'Published' : 'Draft';
    publishStateEl.className = `badge ${row.is_published ? 'badge-pub' : 'badge-drf'}`;
    publishStateEl.style.marginLeft = '10px';
  }

  /**
   * Draft saves must not clear is_published (previously every "Save draft" unpublished the world).
   * @param {'draft' | 'publish'} mode
   */
  async function saveWorld(mode) {
    setStatus('Saving…');
    const title = document.getElementById('world-name').value.trim() || 'Untitled world';
    const worldPayload = collectPayload(isFileworldPayload ? rawPayload : payload, state);
    const updates = { title, payload: worldPayload };
    if (mode === 'publish') updates.is_published = true;
    const { data: updated, error: upErr } = await sb.from('worlds').update(updates).eq('id', id).select('id,is_published').maybeSingle();
    if (upErr) {
      setStatus(upErr.message, 'err');
      return;
    }
    if (!updated) {
      setStatus('Save did not apply (no row updated). Sign in as the world owner or check your Supabase RLS policies.', 'err');
      return;
    }
    row.is_published = updated.is_published === true;
    setStatus(mode === 'publish' ? 'Published' : 'Draft saved', 'ok');
    syncPublishBadge();
    setTimeout(() => setStatus(''), 2200);
  }

  app.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.getAttribute('data-action');

    if (action === 'start-upload') {
      state.uploadMode = true;
      state.activeFileId = null;
      state.dataRoomPhase = 'browse';
      state.drawerOpen = false;
      state.pendingUpload = makePendingUpload();
      renderDataRoom(state);
      return;
    }

    if (action === 'cancel-upload') {
      state.uploadMode = false;
      renderDataRoom(state);
      return;
    }

    if (action === 'save-upload') {
      const p = state.pendingUpload;
      const file = {
        id: uid(),
        type: p.type,
        customType: p.customType || '',
        displayLabel: p.displayLabel || p.fileName || 'Untitled file',
        notes: p.notes || '',
        extractedText: p.extractedText || '',
        fileName: p.fileName || '',
        mimeType: p.mimeType || '',
        sizeBytes: Number(p.sizeBytes || 0),
        isMisleading: Boolean(p.isMisleading),
        gridRows: isCsvType(p.type, p.fileName) ? [emptyGridRow(p.type)] : [],
      };
      state.uploadedFiles.push(file);
      state.uploadMode = false;
      state.activeFileId = file.id;
      state.dataRoomPhase = 'browse';
      state.drawerOpen = false;
      renderDataRoom(state);
      return;
    }

    if (action === 'open-file-viewer') {
      const fileId = el.getAttribute('data-file-id');
      state.activeFileId = fileId;
      state.uploadMode = false;
      state.dataRoomPhase = 'viewer';
      state.drawerOpen = false;
      renderDataRoom(state);
      return;
    }

    if (action === 'set-browse-layout') {
      const layout = el.getAttribute('data-layout');
      if (layout === 'list' || layout === 'grid') state.browseLayout = layout;
      renderDataRoom(state);
      return;
    }

    if (action === 'back-to-directory') {
      state.dataRoomPhase = 'browse';
      state.drawerOpen = false;
      renderDataRoom(state);
      return;
    }

    if (action === 'toggle-drawer') {
      state.drawerOpen = !state.drawerOpen;
      renderDataRoom(state);
      return;
    }

    if (action === 'close-drawer') {
      state.drawerOpen = false;
      renderDataRoom(state);
      return;
    }

    if (action === 'remove-file') {
      if (!state.activeFileId) return;
      state.uploadedFiles = state.uploadedFiles.filter((f) => f.id !== state.activeFileId);
      if (!state.uploadedFiles.length) {
        state.activeFileId = null;
        state.dataRoomPhase = 'browse';
        state.drawerOpen = false;
      } else if (state.dataRoomPhase === 'viewer') {
        state.activeFileId = state.uploadedFiles[0].id;
      } else {
        state.activeFileId = state.uploadedFiles[0]?.id || null;
      }
      renderDataRoom(state);
      return;
    }

    if (action === 'add-grid-row') {
      const active = state.uploadedFiles.find((f) => f.id === state.activeFileId);
      if (!active) return;
      if (!Array.isArray(active.gridRows)) active.gridRows = [];
      active.gridRows.push(emptyGridRow(active.type));
      renderDataRoom(state);
      return;
    }

    if (action === 'add-rubric') {
      state.rubric.push(emptyRubric(state.rubric.length + 1));
      renderRubric(state);
      return;
    }

    if (action === 'toggle-ambiguity') {
      const tag = el.getAttribute('data-tag') || '';
      if (!tag) return;
      if (state.selectedAmbiguities.includes(tag)) {
        state.selectedAmbiguities = state.selectedAmbiguities.filter((t) => t !== tag);
      } else {
        state.selectedAmbiguities.push(tag);
      }
      renderAmbiguityControls(state);
      return;
    }

    if (action === 'add-custom-ambiguity') {
      const input = document.getElementById('custom-ambiguity');
      const val = input?.value.trim() || '';
      if (!val) return;
      if (!state.availableAmbiguityTags.includes(val)) state.availableAmbiguityTags.push(val);
      if (!state.selectedAmbiguities.includes(val)) state.selectedAmbiguities.push(val);
      state.customAmbiguityInput = '';
      if (input) input.value = '';
      renderAmbiguityControls(state);
      return;
    }

    if (action === 'del-rubric') {
      const idx = Number(el.getAttribute('data-rub-i'));
      if (!Number.isFinite(idx)) return;
      state.rubric.splice(idx, 1);
      renderRubric(state);
      return;
    }

    if (action === 'save-draft') {
      await saveWorld('draft');
      return;
    }

    if (action === 'publish') {
      await saveWorld('publish');
    }
  });

  app.addEventListener('input', (e) => {
    if (e.target.id === 'custom-ambiguity') {
      state.customAmbiguityInput = e.target.value;
      return;
    }

    const pendingField = e.target.getAttribute('data-bind-pending');
    if (pendingField) {
      state.pendingUpload[pendingField] = e.target.value;
      return;
    }

    const activeField = e.target.getAttribute('data-bind-active');
    if (activeField) {
      const active = state.uploadedFiles.find((f) => f.id === state.activeFileId);
      if (!active) return;
      active[activeField] = e.target.value;
      refreshDrawerIfOpen(state);
      return;
    }

    const viewerField = e.target.getAttribute('data-bind-viewer');
    if (viewerField) {
      const active = state.uploadedFiles.find((f) => f.id === state.activeFileId);
      if (!active) return;
      active[viewerField] = e.target.value;
      refreshDrawerIfOpen(state);
      return;
    }

    const rubField = e.target.getAttribute('data-bind-rub');
    if (rubField) {
      const row = e.target.closest('[data-rub-i]');
      const i = Number(row?.getAttribute('data-rub-i'));
      if (!Number.isFinite(i) || !state.rubric[i]) return;
      state.rubric[i][rubField] = e.target.value;
      return;
    }

    const rowI = e.target.getAttribute('data-grid-row');
    const col = e.target.getAttribute('data-grid-col');
    if (rowI != null && col) {
      const active = state.uploadedFiles.find((f) => f.id === state.activeFileId);
      if (!active) return;
      const i = Number(rowI);
      if (!Array.isArray(active.gridRows)) active.gridRows = [];
      if (!active.gridRows[i]) active.gridRows[i] = emptyGridRow(active.type);
      active.gridRows[i][col] = e.target.value;
    }
  });

  app.addEventListener('change', async (e) => {
    const rubField = e.target.getAttribute('data-bind-rub');
    if (rubField) {
      const row = e.target.closest('[data-rub-i]');
      const i = Number(row?.getAttribute('data-rub-i'));
      if (!Number.isFinite(i) || !state.rubric[i]) return;
      state.rubric[i][rubField] = e.target.value;
      return;
    }

    const pendingField = e.target.getAttribute('data-bind-pending');
    if (pendingField) {
      state.pendingUpload[pendingField] = e.target.value;
      if (pendingField === 'type') renderDataRoom(state);
      return;
    }

    const pendingCheck = e.target.getAttribute('data-bind-pending-check');
    if (pendingCheck) {
      state.pendingUpload[pendingCheck] = Boolean(e.target.checked);
      return;
    }

    const activeField = e.target.getAttribute('data-bind-active');
    if (activeField) {
      const active = state.uploadedFiles.find((f) => f.id === state.activeFileId);
      if (!active) return;
      active[activeField] = e.target.value;
      if (activeField === 'type' && !isCsvType(active.type, active.fileName)) {
        active.gridRows = [];
      }
      renderDataRoom(state);
      return;
    }

    const activeCheck = e.target.getAttribute('data-bind-active-check');
    if (activeCheck) {
      const active = state.uploadedFiles.find((f) => f.id === state.activeFileId);
      if (!active) return;
      active[activeCheck] = Boolean(e.target.checked);
      renderDataRoom(state);
      return;
    }

    const uploadPick = e.target.closest('[data-action="pick-upload-file"]');
    if (uploadPick?.files?.[0]) {
      const f = uploadPick.files[0];
      state.pendingUpload.fileName = f.name;
      state.pendingUpload.mimeType = f.type || '';
      state.pendingUpload.sizeBytes = f.size || 0;
      if (!state.pendingUpload.displayLabel) {
        state.pendingUpload.displayLabel = f.name.replace(/\.[^.]+$/, '');
      }
      const looksText = /\.csv$|\.txt$|\.json$/i.test(f.name) || f.type.startsWith('text/');
      if (looksText) {
        try {
          state.pendingUpload.extractedText = (await f.text()).slice(0, 30000);
        } catch (_) {
          // Keep metadata even if text read fails.
        }
      }
      renderDataRoom(state);
    }
  });

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await signOutAndRedirect();
  });
}

init().catch((err) => {
  const app = document.getElementById('app');
  if (!app) return;
  app.classList.add('wrap');
  app.innerHTML = `
    <div class="err-banner">Failed to load world editor: ${esc(err?.message || String(err))}</div>
    <p class="muted"><a href="expert.html" style="color:var(--accent)">← Back to worlds</a></p>
  `;
});
