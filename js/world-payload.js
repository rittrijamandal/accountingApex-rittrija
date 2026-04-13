/** Default shape for Expert-authored worlds (matches sample viewer / agent expectations). */
export function emptyPayload() {
  return {
    meta: {
      id: 'APEX-DRAFT',
      name: '',
      type: '',
      method: 'Accrual',
      period: '',
      archetype: '',
      totalFiles: 0,
      coreFiles: 0,
      noiseFiles: 0,
      tier: 'Tier 2 — Execution',
      tasks: 1,
    },
    transactions: [],
    chartOfAccounts: [],
    oldChartOfAccounts: [],
    expensePolicy: [],
    oldExpensePolicy: [],
    invoices: [],
    rubric: [],
    taskPrompt: '',
    ambiguityTypes: [],
    misleadingFiles: [],
  };
}

/** @param {unknown} raw */
export function normalizePayload(raw) {
  const base = emptyPayload();
  if (!raw || typeof raw !== 'object') return base;
  const p = /** @type {Record<string, unknown>} */ (raw);
  return {
    meta: { ...base.meta, ...(typeof p.meta === 'object' && p.meta ? p.meta : {}) },
    transactions: Array.isArray(p.transactions) ? p.transactions : [],
    chartOfAccounts: Array.isArray(p.chartOfAccounts) ? p.chartOfAccounts : [],
    oldChartOfAccounts: Array.isArray(p.oldChartOfAccounts) ? p.oldChartOfAccounts : [],
    expensePolicy: Array.isArray(p.expensePolicy) ? p.expensePolicy : [],
    oldExpensePolicy: Array.isArray(p.oldExpensePolicy) ? p.oldExpensePolicy : [],
    invoices: Array.isArray(p.invoices) ? p.invoices : [],
    rubric: Array.isArray(p.rubric) ? p.rubric : [],
    taskPrompt: typeof p.taskPrompt === 'string' ? p.taskPrompt : '',
    ambiguityTypes: Array.isArray(p.ambiguityTypes) ? p.ambiguityTypes : [],
    misleadingFiles: Array.isArray(p.misleadingFiles) ? p.misleadingFiles : [],
  };
}
