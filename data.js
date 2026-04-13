// ─────────────────────────────────────────────
//  DATA LAYER — static sample world (Pixel & Pine)
//  Platform worlds will load from Supabase in a later phase.
// ─────────────────────────────────────────────

// ── STATIC FALLBACK DATA (Pixel & Pine) ──────

const WORLD_META = {
  id: 'APEX-ACCT-W01',
  name: 'Pixel & Pine Studio',
  type: 'Freelance Design Studio, Sole Proprietor',
  method: 'Cash Basis',
  period: 'January 2026',
  archetype: 'Cash-basis confusion',
  totalFiles: 47,
  coreFiles: 9,
  noiseFiles: 38,
  tier: 'Tier 1 — Execution',
  tasks: 1,
};

const TRANSACTIONS = [
  { date: '01/02', desc: 'STRIPE PAYOUT CLIENT-WEBB',       amount:  4200.00, type: 'credit', flag: 'clear',    note: 'Client payment — clear revenue' },
  { date: '01/03', desc: 'ADOBE SYSTEMS 800-833-6687',       amount:   -54.99, type: 'debit',  flag: 'recur',    note: 'Recurring monthly subscription' },
  { date: '01/04', desc: 'AMZN MKTP US*3K2R9',               amount:  -127.43, type: 'debit',  flag: 'ambig',    note: 'Amazon — office supply or personal purchase?' },
  { date: '01/05', desc: 'ZOOM.US 888-799-9666',             amount:   -15.99, type: 'debit',  flag: 'recur',    note: 'Recurring — video conferencing tool' },
  { date: '01/07', desc: 'SQ *BLUE BOTTLE SF',               amount:   -34.50, type: 'debit',  flag: 'ambig',    note: 'Coffee shop — client meeting or personal?' },
  { date: '01/08', desc: 'STRIPE PAYOUT CLIENT-MORRIS',      amount:  2800.00, type: 'credit', flag: 'clear',    note: 'Client payment — clear revenue' },
  { date: '01/09', desc: 'ADOBE SYSTEMS 800-833-6687',       amount:   -54.99, type: 'debit',  flag: 'dupe',     note: 'Possible duplicate of 01/03 charge — same vendor, amount, month' },
  { date: '01/10', desc: 'FIGMA INC SUBSCRIPTION',           amount:   -45.00, type: 'debit',  flag: 'recur',    note: 'Recurring — design tool subscription' },
  { date: '01/11', desc: 'WHOLEFDS #10274 SF',               amount:   -89.22, type: 'debit',  flag: 'personal', note: 'Whole Foods — likely personal groceries' },
  { date: '01/13', desc: 'DROPBOX*DROPBOX',                  amount:   -11.99, type: 'debit',  flag: 'recur',    note: 'Recurring — cloud storage' },
  { date: '01/14', desc: 'UBER *TRIP 1A4F2',                 amount:   -22.40, type: 'debit',  flag: 'ambig',    note: 'Uber — client site visit or personal?' },
  { date: '01/15', desc: 'INTEREST INCOME',                  amount:     4.12, type: 'credit', flag: 'clear',    note: 'Bank interest — clear, maps to 1200' },
  { date: '01/16', desc: 'APPLE.COM/BILL',                   amount:    -2.99, type: 'debit',  flag: 'ambig',    note: 'Apple billing — iCloud personal or app subscription?' },
  { date: '01/17', desc: 'COSTCO WHSE #0472',                amount:  -247.80, type: 'debit',  flag: 'personal', note: 'Costco — likely personal household purchase' },
  { date: '01/18', desc: 'CANVA PTY LTD',                    amount:   -12.99, type: 'debit',  flag: 'recur',    note: 'Recurring — design tool subscription' },
  { date: '01/20', desc: 'STRIPE PAYOUT CLIENT-NAKAMURA',    amount:  5500.00, type: 'credit', flag: 'clear',    note: 'Client payment — clear revenue' },
  { date: '01/21', desc: 'SLACK TECHNOLOGIES',               amount:    -7.25, type: 'debit',  flag: 'recur',    note: 'Recurring — team communications tool' },
  { date: '01/22', desc: 'CHEVRON 00204',                    amount:   -68.40, type: 'debit',  flag: 'ambig',    note: 'Gas — business travel or personal commute?' },
  { date: '01/23', desc: 'NOTION LABS INC',                  amount:   -16.00, type: 'debit',  flag: 'recur',    note: 'Recurring — project management tool' },
  { date: '01/24', desc: 'RESTAURANT HARVEST SF',            amount:  -347.00, type: 'debit',  flag: 'ambig',    note: 'Restaurant — client dinner (50% deductible) or personal? Requires judgment.' },
  { date: '01/25', desc: 'BEST BUY 00024731',                amount: -2499.00, type: 'debit',  flag: 'ambig',    note: '$2,499 — just under $2,500 cap threshold. Expense, not capitalize.' },
  { date: '01/27', desc: 'USPS PO 0483920',                  amount:   -18.60, type: 'debit',  flag: 'ambig',    note: 'USPS — business postage or personal mail?' },
  { date: '01/28', desc: 'GOOGLE *GSUITE',                   amount:   -18.00, type: 'debit',  flag: 'recur',    note: 'Recurring — Google Workspace' },
  { date: '01/29', desc: 'ATM WITHDRAWAL',                   amount:  -200.00, type: 'debit',  flag: 'personal', note: "Cash withdrawal — owner's draw, not a business expense" },
  { date: '01/31', desc: 'BANK SERVICE FEE',                 amount:   -15.00, type: 'debit',  flag: 'clear',    note: 'Bank service fee — maps to 5050 Bank Charges' },
];

const CHART_OF_ACCOUNTS = [
  { code: '1010', name: 'Checking Account',          type: 'Asset' },
  { code: '1200', name: 'Interest Income',            type: 'Revenue' },
  { code: '3000', name: "Owner's Draw",               type: 'Equity' },
  { code: '4000', name: 'Revenue — Client Services', type: 'Revenue' },
  { code: '5010', name: 'Software & Subscriptions',   type: 'Expense' },
  { code: '5020', name: 'Meals & Entertainment',      type: 'Expense' },
  { code: '5030', name: 'Office Supplies',            type: 'Expense' },
  { code: '5040', name: 'Travel & Transportation',    type: 'Expense' },
  { code: '5050', name: 'Bank Charges & Fees',        type: 'Expense' },
  { code: '5060', name: 'Equipment & Hardware',       type: 'Expense' },
  { code: '5070', name: 'Postage & Shipping',         type: 'Expense' },
  { code: '5080', name: 'Miscellaneous Expense',      type: 'Expense' },
  { code: '5090', name: 'Other Operating Costs',      type: 'Expense' },
];

const OLD_CHART_OF_ACCOUNTS = [
  { code: '4000', name: 'Service Revenue',   type: 'Revenue' },
  { code: '5010', name: 'Computer Software', type: 'Expense' },
  { code: '5020', name: 'Entertainment',     type: 'Expense' },
  { code: '5030', name: 'Supplies',          type: 'Expense' },
  { code: '5040', name: 'Auto & Travel',     type: 'Expense' },
  { code: '5050', name: 'Bank Fees',         type: 'Expense' },
  { code: '3000', name: 'Draws',             type: 'Equity' },
];

const EXPENSE_POLICY = [
  { key: 'Capitalization threshold',    val: '$2,500.00 — assets at or above this amount must be capitalized (not expensed)' },
  { key: 'Meals & Entertainment',       val: '50% deductible per IRS rules. Client name must be noted in transaction memo.' },
  { key: 'Personal expenses',           val: "Must be coded to Owner's Draw (3000), never to expense accounts." },
  { key: 'Single-purchase approval',    val: 'Any purchase over $1,000 requires owner sign-off before payment.' },
  { key: 'Travel',                      val: 'Business travel only. Personal commute is not a business expense.' },
  { key: 'Effective date',              val: 'January 1, 2026 — supersedes all prior versions.' },
];

const OLD_EXPENSE_POLICY = [
  { key: 'Capitalization threshold', val: '$5,000.00  ←  OUTDATED (current is $2,500)' },
  { key: 'Meals & Entertainment',    val: 'Fully deductible  ←  OUTDATED (pre-IRS update)' },
  { key: 'Effective date',           val: 'January 1, 2024 — superseded by v2 (Jan 2026)' },
];

const INVOICES = {
  inv_adobe: {
    vendor:   'Adobe Systems Inc.',
    invNum:   'ADO-2026-0103',
    date:     'January 3, 2026',
    desc:     'Creative Cloud All Apps — Monthly Subscription',
    amount:   '$54.99',
    warn:     null,
  },
  inv_figma: {
    vendor:   'Figma, Inc.',
    invNum:   'FIG-2026-0110',
    date:     'January 10, 2026',
    desc:     'Figma Professional — Monthly Seat License',
    amount:   '$45.00',
    warn:     null,
  },
  inv_adobe_dupe: {
    vendor:   'Adobe Systems Inc.',
    invNum:   'ADO-2026-0109',
    date:     'January 9, 2026',
    desc:     'Creative Cloud All Apps — Monthly Subscription',
    amount:   '$54.99',
    warn:     'Possible duplicate — same vendor, same amount, same billing period as ADO-2026-0103. Agent must determine if this is a double-billing error or a second legitimate charge before posting.',
  },
};

const RUBRIC = [
  {
    n: 1,
    text: 'All 8 clearly-business recurring subscriptions (Adobe, Figma, Zoom, Dropbox, Canva, Slack, Notion, G Suite) are assigned to account 5010 — Software & Subscriptions.',
    type: 'det',
    label: 'deterministic',
  },
  {
    n: 2,
    text: 'The $347.00 RESTAURANT HARVEST SF charge is assigned to account 5020 — Meals & Entertainment, not to 5030 Office Supplies or 5080 Miscellaneous.',
    type: 'det',
    label: 'deterministic',
  },
  {
    n: 3,
    text: 'The $2,499.00 BEST BUY charge is assigned to account 5060 — Equipment & Hardware. Amount is below the $2,500 capitalization threshold — correctly expensed, not capitalized.',
    type: 'det',
    label: 'deterministic',
  },
  {
    n: 4,
    text: 'At least one of the two Adobe charges (01/03 and 01/09, both $54.99) is flagged as a potential duplicate with a written explanation of the reasoning.',
    type: 'llm',
    label: 'llm judge',
  },
  {
    n: 5,
    text: "Personal-use transactions (WHOLEFDS, COSTCO WHSE, ATM WITHDRAWAL) are assigned to account 3000 — Owner's Draw, not to any expense account.",
    type: 'det',
    label: 'deterministic',
  },
  {
    n: 6,
    text: 'Agent did not use account codes or names from the outdated 2024 chart of accounts (e.g. "Computer Software", "Entertainment", "Supplies", "Draws").',
    type: 'neg',
    label: 'negative criterion',
  },
];

const FILE_TREE = [
  {
    section: 'core',
    files: [
      { id: 'bank',       name: 'jan_bank_statement.csv',      badge: 'core' },
      { id: 'coa',        name: 'chart_of_accounts.xlsx',      badge: 'core' },
      { id: 'policy',     name: 'expense_policy.pdf',          badge: 'core' },
    ],
  },
  {
    section: 'invoices',
    files: [
      { id: 'inv_adobe',      name: 'invoice_adobe_jan.pdf' },
      { id: 'inv_figma',      name: 'invoice_figma_jan.pdf' },
      { id: 'inv_adobe_dupe', name: 'invoice_adobe_jan_2.pdf', badge: 'warn' },
    ],
  },
  {
    section: 'old / misleading',
    files: [
      { id: 'old_coa',    name: 'chart_of_accounts_2024.xlsx', badge: 'warn', cls: 'mislead' },
      { id: 'old_policy', name: 'expense_policy_v1.pdf',       badge: 'warn', cls: 'mislead' },
    ],
  },
  {
    section: 'noise',
    files: [
      { id: 'noise', name: 'logo_final_v3.png',         badge: 'noise', cls: 'noise' },
      { id: 'noise', name: 'meeting_notes_oct.docx',    badge: 'noise', cls: 'noise' },
      { id: 'noise', name: 'vendor_contract_2023.pdf',  badge: 'noise', cls: 'noise' },
      { id: 'noise', name: 'w9_johnson_electric.pdf',   badge: 'noise', cls: 'noise' },
      { id: 'noise', name: 'studio_photos_march.zip',   badge: 'noise', cls: 'noise' },
      { id: 'noise', name: 'proposal_draft_v2.docx',    badge: 'noise', cls: 'noise' },
      { id: 'noise', name: 'onboarding_checklist.pdf',  badge: 'noise', cls: 'noise' },
    ],
  },
  {
    section: 'task',
    files: [
      { id: 'task', name: 'task_01_categorize.txt', badge: 'core' },
    ],
  },
];
