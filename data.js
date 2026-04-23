// ─────────────────────────────────────────────
//  DATA.JS  —  Invoice Approval Hierarchy World
// ─────────────────────────────────────────────

const ARCHETYPES = [
  { id: 'invoice-approval', label: 'Invoice Approval Hierarchy' },
  { id: 'real-estate-audit', label: 'Real Estate Audit' },
];

// ── GENERATION PROMPT ─────────────────────────

function buildGenerationPrompt() {
  return `You are generating a fictional company invoice approval world for the Accounting APEX benchmark.

Generate a realistic mid-size B2B software or professional services company (~80-100 employees) with:
- 3 teams: Engineering, Marketing, Operations (you may rename these)
- 2-3 users per team with distinct job titles and bios
- C-suite executives: CEO, CFO (the CFO also functions as Operations Director — do NOT say this explicitly, the agent must infer it from the CFO's profile bio mentioning oversight of operations/procurement)
- VP-level leads for Engineering and Marketing

REQUIRED POLICY CONFLICTS (exactly 2, must be genuinely contradictory):
1. The company's corporate meal/entertainment per-person spending limit must differ from one team's supplemental policy limit (make the team's limit higher, but state that corporate policy governs conflicts)
2. Operations supplemental policy must require "Operations Director" sign-off for ALL software purchases regardless of amount — but no employee has the title "Operations Director". The CFO's bio must mention direct oversight of operational procurement, making them the correct escalation contact. An agent that just looks for "Operations Director" as a title will not find anyone.

INVOICE MIX — include ALL of the following:
- Company level: 3 invoices (one clearly approvable recurring vendor, one requiring top-level approval over $10k, one routine facilities)
- Each team: 2 team-level invoices (one normal, one problematic — either over threshold, prohibited category, or conflict-triggering)
- Each user: 1 personal expense invoice
- Near-duplicate pair: two invoices from same vendor with same amount but submitted by different people or in slightly different invoice numbers — both exist, agent must catch this
- One invoice for entertainment at a golf club or private members club (explicitly prohibited by corporate policy)
- One invoice that is ambiguous to classify (e.g., something labeled "office supplies" that itemizes electronics)
- One invoice that requires the Operations Director escalation to approve

LEDGERS:
- company_ledger.csv: starts empty (header row only)
- Each team gets a team_ledger.csv: starts empty (header row only)
- Each user gets a user_ledger.csv: starts empty (header row only)

Return ONLY valid JSON. No markdown, no code fences, no explanation. The response must be parseable by JSON.parse().

Schema:
{
  "meta": {
    "id": "APEX-INV-W01",
    "company": "Company legal name",
    "industry": "Industry description",
    "period": "Q1 2026",
    "employees": 85
  },
  "files": [
    {
      "path": "company_policy.pdf",
      "type": "policy",
      "content": "Full realistic corporate policy document. Multiple sections with numbered rules. Must include approval thresholds by dollar amount, meal/entertainment rules with specific per-person dollar limit, software subscription rules, duplicate invoice policy, and a clause stating team policies may be stricter but not looser."
    },
    {
      "path": "company_ledger.csv",
      "type": "ledger",
      "content": "Date,Description,Amount,Category,Invoice Ref,Approved By,Status"
    },
    {
      "path": "company_invoices/INV-XXXX.pdf",
      "type": "invoice",
      "invoiceNum": "INV-XXXX",
      "vendor": "Vendor Name",
      "date": "January 15, 2026",
      "amount": "$X,XXX.XX",
      "content": "Realistic formatted invoice text with vendor address, bill-to, line items table, subtotal, tax, total, payment terms"
    },
    {
      "path": "leadership/ceo_firstname_lastname.txt",
      "type": "profile",
      "content": "HR directory entry with: Name, Title, Employee ID, Start Date, and a 3-4 sentence bio. Bio must naturally convey reporting relationships and approval authority without listing them as bullet points. No explicit 'Manager: X' field."
    },
    {
      "path": "engineering/team_policy.pdf",
      "type": "policy",
      "content": "Engineering supplemental policy. Must define stricter or different rules than corporate for at least meals and cloud/software."
    },
    {
      "path": "engineering/team_ledger.csv",
      "type": "ledger",
      "content": "Date,Description,Amount,Category,Invoice Ref,Approved By,Status"
    },
    {
      "path": "engineering/team_invoices/INV-ENG-XXX.pdf",
      "type": "invoice",
      "invoiceNum": "INV-ENG-XXX",
      "vendor": "...",
      "date": "...",
      "amount": "...",
      "content": "..."
    },
    {
      "path": "engineering/alice_name/profile.txt",
      "type": "profile",
      "content": "..."
    },
    {
      "path": "engineering/alice_name/user_ledger.csv",
      "type": "ledger",
      "content": "Date,Description,Amount,Category,Invoice Ref,Approved By,Status"
    },
    {
      "path": "engineering/alice_name/INV-XXX.pdf",
      "type": "invoice",
      "invoiceNum": "...",
      "vendor": "...",
      "date": "...",
      "amount": "...",
      "content": "..."
    }
  ],
  "rubric": [
    {
      "n": 1,
      "text": "Specific binary verifiable criterion referencing exact invoice numbers and amounts",
      "type": "det",
      "label": "deterministic"
    }
  ]
}

File path naming: use lowercase with underscores for user folders (e.g. engineering/jordan_kim/). Include all three teams fully. Include leadership profiles for CEO and CFO at minimum (these are critical for org inference).

Rubric: exactly 6 criteria
- 2 deterministic: specific invoices correctly approved or flagged
- 2 llm judge: policy conflict identified, correct escalation contact identified by name
- 1 deterministic: all ledgers filled (company + all team + all user ledgers written with at least one entry)
- 1 negative: agent did not approve the invoice requiring Operations Director escalation without explicitly stating that person's name as required approver`;
}

// ── STATIC FALLBACK (Meridian Systems, Inc.) ──

const STATIC_WORLD = {
  meta: {
    id: 'APEX-INV-W01',
    company: 'Meridian Systems, Inc.',
    industry: 'B2B SaaS — Revenue Intelligence Platform',
    period: 'Q1 2026',
    employees: 87,
  },

  files: [

    // ── COMPANY LEVEL ─────────────────────────────

    {
      path: 'company_policy.pdf',
      type: 'policy',
      content: `MERIDIAN SYSTEMS, INC.
CORPORATE EXPENSE & INVOICE APPROVAL POLICY
Document ID: POL-FIN-001 (v4.2)
Effective Date: January 1, 2026
Approved by: Sarah Chen, Chief Executive Officer
Supersedes: POL-FIN-001 v4.1 (dated March 15, 2024)

─────────────────────────────────────────────────────

1. SCOPE AND APPLICABILITY

This policy governs all vendor invoices, purchase orders, and employee expense reimbursements across Meridian Systems, Inc. and all subsidiary entities. Department-level supplemental policies may impose additional restrictions but may not relax or override any provision of this document. Where a conflict exists between a supplemental policy and this policy, the more restrictive rule governs.

─────────────────────────────────────────────────────

2. APPROVAL THRESHOLDS

All invoices and expense reimbursements require approval at the appropriate level before payment is issued:

  a. Up to $500.00        — Team Lead approval
  b. $500.01 – $2,000.00  — Department VP approval
  c. $2,000.01 – $10,000  — CFO approval
  d. Over $10,000.00      — CFO approval + CEO countersignature

Approvals must be documented in the relevant team ledger before Finance processes payment.

─────────────────────────────────────────────────────

3. MEALS & ENTERTAINMENT

3.1 Business meals are reimbursable when a clear business purpose is documented and attendees are listed.

3.2 The per-person spending limit for meals is $75.00. Meals exceeding this limit on a per-person basis require Department VP approval and written justification.

3.3 Entertainment at golf courses, country clubs, private members clubs, or sporting event luxury suites is NOT reimbursable under any circumstances, regardless of dollar amount or claimed business purpose. Invoices of this type must be rejected and returned to the submitter.

3.4 Client dinners exceeding $500 total require advance written approval from the Department VP.

─────────────────────────────────────────────────────

4. SOFTWARE & SAAS SUBSCRIPTIONS

4.1 Recurring software subscriptions under $500/month may be approved at the Team Lead level.

4.2 Subscriptions between $500/month and $2,000/month require Department VP approval.

4.3 New software contracts over $2,000/month or any one-time license over $5,000 require CFO approval.

4.4 All software procurement is subject to any additional restrictions in the relevant departmental supplemental policy.

─────────────────────────────────────────────────────

5. DUPLICATE INVOICES

Any invoice that shares vendor name, invoice amount, and billing period with a previously logged invoice must be flagged and held pending Finance review. Under no circumstances should a potential duplicate be approved without explicit written clearance from the CFO.

─────────────────────────────────────────────────────

6. LEDGER REQUIREMENTS

All approved, held, and rejected invoices must be logged in the appropriate ledger (company, team, and submitting user) before end of the processing period. Ledger entries must include: date, description, amount, category, invoice reference number, approving party, and status.

─────────────────────────────────────────────────────

7. PROHIBITED CATEGORIES

The following are not reimbursable under any circumstances:
  - Golf, country clubs, private members clubs (see 3.3)
  - Personal travel unrelated to business
  - Alcohol as a standalone line item (may be included in a meal up to the per-person limit)
  - Fines, penalties, or legal judgments
  - Political contributions

─────────────────────────────────────────────────────

Questions: finance@meridiansystems.io`,
    },

    {
      path: 'company_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'company_invoices/INV-2026-301.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2026-301',
      vendor: 'Hartford Financial Services Group',
      date: 'January 8, 2026',
      amount: '$8,400.00',
      content: `HARTFORD FINANCIAL SERVICES GROUP
151 Farmington Avenue
Hartford, CT 06156
Tel: (860) 547-5000 | ap@hartford.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-2026-301
Invoice Date:     January 8, 2026
Due Date:         February 7, 2026
PO Number:        PO-2026-FIN-018

Bill To:
  Meridian Systems, Inc.
  Accounts Payable
  548 Market Street, Suite 1200
  San Francisco, CA 94104

Policy Number:    HF-GL-20260101-MRD-0042

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
General Liability Insurance
  Coverage Period: Jan 1, 2026 – Dec 31, 2026
  Annual Premium — Q1 2026 Installment      $8,400.00
───────────────────────────────────────────────────
SUBTOTAL                                     $8,400.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $8,400.00
═══════════════════════════════════════════════════

Payment Terms:  Net 30
Payment Method: ACH Transfer preferred
Remit To: Hartford Financial — ACH Routing 021000021
          Account: 4872029100 | Ref: INV-2026-301`,
    },

    {
      path: 'company_invoices/INV-2026-302.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2026-302',
      vendor: 'Wilson Sonsini Goodrich & Rosati',
      date: 'January 12, 2026',
      amount: '$15,000.00',
      content: `WILSON SONSINI GOODRICH & ROSATI
Professional Corporation
650 Page Mill Road
Palo Alto, CA 94304
Tel: (650) 493-9300 | billing@wsgr.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-2026-302
Invoice Date:     January 12, 2026
Due Date:         February 11, 2026
Matter Number:    MRD-2026-CORP-001

Bill To:
  Meridian Systems, Inc.
  Legal / Finance
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
Legal Services — Corporate Retainer
  Monthly retainer fee (January 2026)
  General corporate counsel, contract review,
  employment matters, IP advisory           $15,000.00
───────────────────────────────────────────────────
SUBTOTAL                                    $15,000.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                   $15,000.00
═══════════════════════════════════════════════════

Payment Terms:  Net 30
Payment Method: Wire transfer
Bank: First Republic Bank | Routing: 321081669
Account: 9934872211 | Ref: MRD-2026-CORP-001`,
    },

    {
      path: 'company_invoices/INV-2026-303.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2026-303',
      vendor: 'CleanBright Commercial Services',
      date: 'January 3, 2026',
      amount: '$1,740.00',
      content: `CLEANBRIGHT COMMERCIAL SERVICES
2200 Harbor Blvd, Suite 104
Costa Mesa, CA 92627
Tel: (949) 555-0182 | invoices@cleanbright.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-2026-303
Invoice Date:     January 3, 2026
Due Date:         February 2, 2026
Service Account:  MRD-SF-001

Bill To:
  Meridian Systems, Inc.
  Attn: Leo Fontaine, Operations
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Office Cleaning Services — Q1 2026
  Standard weekly cleaning (4 visits)     4   $240.00
  Deep clean — January                    1   $380.00
  Window cleaning — quarterly             1   $480.00
  Supply restocking (soaps, paper)        1   $120.00
  Floor wax & polish                      1   $520.00
───────────────────────────────────────────────────
SUBTOTAL                                     $1,740.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $1,740.00
═══════════════════════════════════════════════════

Payment Terms:  Net 30`,
    },

    // ── LEADERSHIP ────────────────────────────────

    {
      path: 'leadership/sarah_chen.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Sarah Chen
Title:         Chief Executive Officer
Department:    Executive
Employee ID:   EMP-0001
Start Date:    January 15, 2014
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Sarah co-founded Meridian Systems in 2014 alongside CTO David Park after a decade in enterprise software product leadership at Salesforce and Oracle. She holds an MBA from Harvard Business School and a B.S. in Computer Science from MIT. Under her leadership, Meridian has grown through three funding rounds to its current Series C stage with 87 employees across three offices.

Sarah is the final approval authority for all company-wide policy decisions, executive hires, and expenditures exceeding the CFO's unilateral approval authority — specifically any invoice or commitment over $10,000 requires her countersignature alongside Marcus Webb's approval. She chairs the quarterly board meetings and leads annual strategic planning.

Outside the office Sarah serves on the board of Girls Who Code and is an avid trail runner, having completed the Western States 100 twice.`,
    },

    {
      path: 'leadership/marcus_webb.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Marcus Webb
Title:         Chief Financial Officer
Department:    Finance & Operations
Employee ID:   EMP-0003
Start Date:    March 1, 2016
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Marcus joined Meridian as Controller in early 2016 and was promoted to CFO in 2019 after leading the company's Series B financial close. He holds a CPA license (California), an MBA from the Wharton School, and a B.S. in Accounting from Penn State. Marcus is responsible for all financial operations including budgeting, audit, procurement, and financial reporting to the board.

In addition to his finance mandate, Marcus has served as the company's head of operational strategy since 2021, directly overseeing the Operations department and its procurement workflows. He is the designated decision-maker for all operational software and vendor contracts — department supplemental policies reference this role as "Operations Director," which reflects his functional responsibility rather than a formal title change. Leo Fontaine's team coordinates all operational purchasing through Marcus before any commitment is made.

For expenditures between $2,001 and $10,000, Marcus is the sole required approver. Above $10,000, he approves jointly with Sarah Chen. Marcus is also the mandatory clearance point for any flagged or duplicate invoice regardless of dollar amount.`,
    },

    {
      path: 'leadership/alex_rivera.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Alex Rivera
Title:         Vice President of Engineering
Department:    Engineering
Employee ID:   EMP-0012
Start Date:    May 20, 2018
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Alex leads Meridian's engineering organization, currently comprising 24 engineers across three squads. Alex joined as a Senior Engineer and was promoted to VP in 2021 after architecting the platform's real-time data pipeline. Alex holds a Ph.D. in Computer Science from Carnegie Mellon and previously held principal engineer roles at Palantir and Stripe.

For expense approvals within Engineering, Alex covers the $501–$2,000 range and is the required approver for all conference travel and any cloud infrastructure commitments over $1,000/month. Alex reports directly to Sarah Chen and participates in monthly executive reviews. Alex is also a mentor in the company's engineering residency program and publishes a widely-read technical blog.`,
    },

    {
      path: 'leadership/diana_okonkwo.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Diana Okonkwo
Title:         Vice President of Marketing
Department:    Marketing
Employee ID:   EMP-0018
Start Date:    September 8, 2019
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Diana leads Meridian's go-to-market strategy including demand generation, brand, partner marketing, and customer communications. She reports directly to Sarah Chen. Diana holds a BA in Communications from Howard University and an MBA from Duke Fuqua, and previously ran marketing for a B2B HR tech company that was acquired by Workday.

Within Marketing, Diana is the approval authority for expenditures between $501 and $2,000, and for all contractor or agency invoices exceeding the Marketing Manager's approval limit of $3,000. She co-owns the annual marketing budget with Marcus Webb and conducts monthly budget reviews with Priya Sharma.`,
    },

    // ── ENGINEERING ───────────────────────────────

    {
      path: 'engineering/team_policy.pdf',
      type: 'policy',
      content: `MERIDIAN SYSTEMS — ENGINEERING DEPARTMENT
SUPPLEMENTAL EXPENSE POLICY
Document ID: POL-ENG-002 (v2.1)
Effective Date: March 15, 2025
Owner: Alex Rivera, VP Engineering
Approved by: Marcus Webb, CFO

─────────────────────────────────────────────────────

NOTICE: This policy supplements POL-FIN-001. Where any provision here conflicts with POL-FIN-001, the more restrictive rule governs.

─────────────────────────────────────────────────────

1. MEALS & TEAM EVENTS

1.1 Engineering working lunches and team meals are approved up to $50 per person (note: corporate baseline is $75/person; Engineering applies the stricter $50/person limit for all team meals).

1.2 Team celebration events (e.g. launch dinners) over $500 total require VP Engineering sign-off regardless of per-person cost.

1.3 Client meals follow corporate policy (§3, POL-FIN-001).

─────────────────────────────────────────────────────

2. SOFTWARE & TOOLING

2.1 Individual dev tooling under $200/month: Engineer may approve.
2.2 $200–$500/month: Team Lead approval required.
2.3 Over $500/month: VP Engineering approval required.
2.4 One-time tool purchases over $1,000: VP Engineering required.

─────────────────────────────────────────────────────

3. CLOUD INFRASTRUCTURE

3.1 AWS, GCP, and Azure charges for production workloads are pre-approved within the quarterly cloud budget.

3.2 Experimental or research workloads over $300/month must be logged with the Team Lead before provisioning. Unlogged experimental charges over $300/month are not automatically reimbursable.

3.3 Cloud charges over $1,000/month in any single account require VP Engineering sign-off.

─────────────────────────────────────────────────────

4. CONFERENCE & TRAVEL

4.1 Conference attendance (registration + travel + hotel) requires VP Engineering approval regardless of amount.

4.2 Pre-approved conferences for 2026 include: AWS re:Invent, KubeCon, and QCon SF.`,
    },

    {
      path: 'engineering/team_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'engineering/team_invoices/INV-GH-2026-01.pdf',
      type: 'invoice',
      invoiceNum: 'INV-GH-2026-01',
      vendor: 'GitHub, Inc.',
      date: 'January 1, 2026',
      amount: '$336.00',
      content: `GITHUB, INC. (a Microsoft company)
88 Colin P Kelly Jr Street
San Francisco, CA 94107
billing@github.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-GH-2026-01
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          meridian-systems

Bill To:
  Meridian Systems, Inc.
  Engineering / Jordan Kim
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
GitHub Team Plan — Monthly
  Billing period: Jan 1 – Jan 31, 2026
  Per seat: $4.00/month                  24   $96.00
GitHub Copilot for Business
  Per seat: $19.00/month                 12  $228.00
GitHub Advanced Security
  Per seat: $1.00/month                  12   $12.00
───────────────────────────────────────────────────
SUBTOTAL                                   $336.00
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE                                  $336.00
═══════════════════════════════════════════════════

Payment Terms:  Net 30 (auto-charge on file)`,
    },

    {
      path: 'engineering/team_invoices/INV-ZM-0341.pdf',
      type: 'invoice',
      invoiceNum: 'INV-ZM-0341',
      vendor: 'Zoom Video Communications, Inc.',
      date: 'January 1, 2026',
      amount: '$149.90',
      content: `ZOOM VIDEO COMMUNICATIONS, INC.
55 Almaden Boulevard, 6th Floor
San Jose, CA 95113
billing@zoom.us

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-ZM-0341
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account ID:       meridian-eng-team

Bill To:
  Meridian Systems Engineering Team
  Attn: Jordan Kim, Team Lead
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Zoom Pro — Annual Plan (monthly billing)
  Billing period: Jan 1 – Jan 31, 2026
  Licensed hosts: 10 seats               10  $149.90
───────────────────────────────────────────────────
SUBTOTAL                                   $149.90
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE                                  $149.90
═══════════════════════════════════════════════════

Payment Terms:  Net 30`,
    },

    // Engineering users — Jordan Kim

    {
      path: 'engineering/jordan_kim/profile.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Jordan Kim
Title:         Senior Software Engineer, Team Lead
Department:    Engineering
Employee ID:   EMP-0042
Start Date:    March 12, 2019
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Jordan joined Meridian as a mid-level backend engineer and was promoted to Team Lead in 2022 after leading the platform's Kafka migration. Jordan is the primary point of contact for engineering tooling decisions, sprint planning, and vendor relationships within the squad. Day-to-day expense approvals for the engineering team up to $500 flow through Jordan before being escalated to Alex Rivera as needed.

Jordan holds a B.S. in Computer Science from UC Davis and is completing an online MBA through UNC Kenan-Flagler. Known for methodical code reviews and unusually thorough documentation. Hobbies include trail running and astrophotography.`,
    },

    {
      path: 'engineering/jordan_kim/user_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'engineering/jordan_kim/INV-ZM-0342.pdf',
      type: 'invoice',
      invoiceNum: 'INV-ZM-0342',
      vendor: 'Zoom Video Communications, Inc.',
      date: 'January 1, 2026',
      amount: '$149.90',
      content: `ZOOM VIDEO COMMUNICATIONS, INC.
55 Almaden Boulevard, 6th Floor
San Jose, CA 95113
billing@zoom.us

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-ZM-0342
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account ID:       jordan.kim@meridiansystems.io

Bill To:
  Jordan Kim
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Zoom Pro — Annual Plan (monthly billing)
  Billing period: Jan 1 – Jan 31, 2026
  Licensed hosts: 10 seats               10  $149.90
───────────────────────────────────────────────────
SUBTOTAL                                   $149.90
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE                                  $149.90
═══════════════════════════════════════════════════

Payment Terms:  Net 30

NOTE: Submitted for reimbursement by Jordan Kim`,
    },

    // Engineering users — Maya Patel

    {
      path: 'engineering/maya_patel/profile.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Maya Patel
Title:         Software Engineer II
Department:    Engineering
Employee ID:   EMP-0078
Start Date:    August 5, 2021
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Maya specializes in backend infrastructure and cloud cost optimization, having driven Meridian's AWS spend down 22% in 2024 through a reserved instance migration. She joined from a Series A fintech startup and is an AWS Certified Solutions Architect. Maya holds a B.S. in Computer Engineering from Purdue University.

Maya reports to Jordan Kim and frequently spins up experimental research environments to prototype new features before they reach the production roadmap. These workloads are typically run in a separate AWS account and tracked informally via Slack. She is an avid rock climber and serves on the board of a local food bank.`,
    },

    {
      path: 'engineering/maya_patel/user_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'engineering/maya_patel/INV-AWS-0289.pdf',
      type: 'invoice',
      invoiceNum: 'INV-AWS-0289',
      vendor: 'Amazon Web Services, Inc.',
      date: 'February 1, 2026',
      amount: '$487.50',
      content: `AMAZON WEB SERVICES, INC.
410 Terry Avenue North
Seattle, WA 98109
aws-billing@amazon.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-AWS-0289
Invoice Date:     February 1, 2026
Due Date:         March 3, 2026
Account ID:       mpatel-research-meridiansys

Bill To:
  Maya Patel
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
AWS Usage — January 2026
  Account: mpatel-research-meridiansys
  [RESEARCH / EXPERIMENTAL WORKLOAD]

  EC2 — m5.xlarge instances (720 hrs)       $138.24
  SageMaker Studio — ml.m5.4xlarge           $221.40
  S3 — 8.2 TB stored + transfer              $47.86
  RDS — db.t3.medium (730 hrs)               $50.96
  Data Transfer — out                        $29.04
───────────────────────────────────────────────────
SUBTOTAL                                   $487.50
CREDITS APPLIED                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                  $487.50
═══════════════════════════════════════════════════

This account is tagged: EXPERIMENTAL / RESEARCH
Production accounts billed separately.`,
    },

    // Engineering users — Chris Lee

    {
      path: 'engineering/chris_lee/profile.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Chris Lee
Title:         Software Engineer I
Department:    Engineering
Employee ID:   EMP-0112
Start Date:    January 17, 2023
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Chris joined Meridian as a new grad from Stanford focusing on frontend development and design systems. He reports to Jordan Kim and is currently rotating through backend services to broaden his technical foundation. Chris has been involved in the customer portal redesign and contributes to the engineering team's documentation standards.

Chris volunteers as a coding instructor at a local high school on weekends and is the organizer of the office's informal coffee tasting club. His expense submissions are typically small and routine.`,
    },

    {
      path: 'engineering/chris_lee/user_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'engineering/chris_lee/INV-LNH-0891.pdf',
      type: 'invoice',
      invoiceNum: 'INV-LNH-0891',
      vendor: 'Tartine Manufactory',
      date: 'January 22, 2026',
      amount: '$312.50',
      content: `TARTINE MANUFACTORY
595 Alabama Street
San Francisco, CA 94110
Tel: (415) 487-2600

═══════════════════════════════════════════════════
                    RECEIPT / INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-LNH-0891
Date:             January 22, 2026
Table:            12 (private dining room)
Server:           Marco V.

Bill To:
  Chris Lee / Meridian Systems Engineering
  548 Market Street, Suite 1200
  San Francisco, CA 94104

Business Purpose: Engineering team working lunch —
  sprint planning for Q1 portal redesign
Attendees: 5 (Jordan Kim, Maya Patel, Chris Lee,
  Rohan Gupta, Stephanie Wu)

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
5x Lunch prix fixe @ $42.00/person           $210.00
Beverages (non-alcoholic)                     $55.00
Private room fee                              $35.00
Gratuity (18%)                                $12.50
───────────────────────────────────────────────────
SUBTOTAL                                     $312.50
TAX                                            $0.00
───────────────────────────────────────────────────
TOTAL                                        $312.50
═══════════════════════════════════════════════════

Per-person cost: $62.50
Submitted for team meal reimbursement by Chris Lee.`,
    },

    // ── MARKETING ─────────────────────────────────

    {
      path: 'marketing/team_policy.pdf',
      type: 'policy',
      content: `MERIDIAN SYSTEMS — MARKETING DEPARTMENT
SUPPLEMENTAL EXPENSE POLICY
Document ID: POL-MKT-003 (v1.4)
Effective Date: February 1, 2026
Owner: Diana Okonkwo, VP Marketing
Approved by: Marcus Webb, CFO

─────────────────────────────────────────────────────

NOTICE: This policy supplements POL-FIN-001. Where any provision conflicts with POL-FIN-001, the more restrictive rule governs.

─────────────────────────────────────────────────────

1. CAMPAIGN & MEDIA SPEND

1.1 Paid media and advertising platform spend (Google Ads, LinkedIn, Meta) is pre-approved up to $5,000/month within the approved quarterly budget. Exceeding monthly budget requires VP Marketing sign-off before payment.

1.2 Agency retainers and campaign management fees follow standard approval thresholds (POL-FIN-001 §2).

─────────────────────────────────────────────────────

2. EVENTS & CLIENT ENTERTAINMENT

2.1 Client business meals are reimbursable up to $100 per person when a clear business purpose and attendee list are documented.

NOTE: The $100/person limit in §2.1 above CONFLICTS with the corporate $75/person limit in POL-FIN-001 §3.2. Per the conflict resolution clause in POL-FIN-001 §1, the corporate policy's $75/person limit governs. The $100/person figure in this supplemental policy is superseded and should not be used as the applicable threshold.

2.2 Client entertainment at golf courses, country clubs, or private clubs is not reimbursable per POL-FIN-001 §3.3. No exceptions.

2.3 Event sponsorships over $2,500 require VP Marketing approval.

─────────────────────────────────────────────────────

3. CONTRACTOR & FREELANCER INVOICES

3.1 Freelance and agency invoices up to $3,000 may be approved by the Marketing Manager (Priya Sharma).

3.2 Invoices over $3,000 require VP Marketing (Diana Okonkwo) approval.

3.3 All new contractors must be onboarded through HR before invoice payment is authorized.

─────────────────────────────────────────────────────

4. BRANDED MATERIALS

4.1 Print, swag, and branded merchandise orders under $1,000: Marketing Manager approval.
4.2 Orders over $1,000: VP Marketing approval required.`,
    },

    {
      path: 'marketing/team_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'marketing/team_invoices/INV-MC-2026-01.pdf',
      type: 'invoice',
      invoiceNum: 'INV-MC-2026-01',
      vendor: 'Mailchimp (Intuit)',
      date: 'January 1, 2026',
      amount: '$299.00',
      content: `MAILCHIMP / INTUIT
405 N Angier Ave NE
Atlanta, GA 30308
billing@mailchimp.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-MC-2026-01
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          meridiansystems-marketing

Bill To:
  Meridian Systems Marketing Team
  Attn: Priya Sharma
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Mailchimp Standard Plan
  Billing period: Jan 1 – Jan 31, 2026
  Up to 100,000 contacts                   1  $299.00
───────────────────────────────────────────────────
SUBTOTAL                                   $299.00
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE                                  $299.00
═══════════════════════════════════════════════════

Payment Terms:  Auto-charge on file (Net 30 override)`,
    },

    {
      path: 'marketing/team_invoices/INV-EVT-502.pdf',
      type: 'invoice',
      invoiceNum: 'INV-EVT-502',
      vendor: 'Bix Restaurant & Bar',
      date: 'January 17, 2026',
      amount: '$2,340.00',
      content: `BIX RESTAURANT & BAR
56 Gold Street
San Francisco, CA 94133
Tel: (415) 433-6300 | events@bixrestaurant.com

═══════════════════════════════════════════════════
                    INVOICE — PRIVATE EVENT
═══════════════════════════════════════════════════
Invoice Number:   INV-EVT-502
Event Date:       January 17, 2026
Invoice Date:     January 17, 2026
Due Date:         February 16, 2026

Bill To:
  Meridian Systems Marketing Team
  Attn: Tom Walsh
  548 Market Street, Suite 1200
  San Francisco, CA 94104

Event Description: "Q1 Marketing Kickoff Dinner"
Party Size: 8 guests

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
8-course prix fixe dinner @ $195/person      $1,560.00
Wine pairing @ $85/person                      $680.00
Private room buyout fee                        $100.00
───────────────────────────────────────────────────
SUBTOTAL                                     $2,340.00
GRATUITY                                         $0.00
  (included in prix fixe)
───────────────────────────────────────────────────
TOTAL DUE                                    $2,340.00
═══════════════════════════════════════════════════

Per-person total: $292.50
Submitted by: Tom Walsh, Marketing Coordinator
Business purpose noted: "team offsite kickoff"`,
    },

    // Marketing users — Priya Sharma

    {
      path: 'marketing/priya_sharma/profile.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Priya Sharma
Title:         Marketing Manager
Department:    Marketing
Employee ID:   EMP-0055
Start Date:    June 1, 2020
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Priya oversees day-to-day marketing operations including campaign execution, vendor management, and team budget tracking. She has 8 years of B2B marketing experience and previously managed demand generation at two SaaS companies. Priya holds an MBA from Northwestern Kellogg and reports directly to Diana Okonkwo.

As Marketing Manager, Priya is the designated approver for contractor and freelancer invoices up to $3,000. Anything above that threshold requires Diana's sign-off before Priya can authorize payment. Priya coordinates the monthly budget reconciliation with Marcus Webb's finance team and is the team's primary liaison for AP questions.`,
    },

    {
      path: 'marketing/priya_sharma/user_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'marketing/priya_sharma/INV-FRL-0234.pdf',
      type: 'invoice',
      invoiceNum: 'INV-FRL-0234',
      vendor: 'Studio B Creative LLC',
      date: 'January 28, 2026',
      amount: '$2,850.00',
      content: `STUDIO B CREATIVE LLC
1234 Valencia Street, Studio 3
San Francisco, CA 94110
EIN: 47-3982110
hello@studiobcreative.co

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-FRL-0234
Invoice Date:     January 28, 2026
Due Date:         February 27, 2026
Project:          Meridian Q1 Brand Refresh

Bill To:
  Priya Sharma
  Meridian Systems, Inc. — Marketing
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              HRS  AMOUNT
───────────────────────────────────────────────────
Brand strategy consultation               8   $960.00
Website hero section redesign            12 $1,440.00
Social media template kit                 3   $360.00
Revision rounds (2x)                      1    $90.00
───────────────────────────────────────────────────
SUBTOTAL                                     $2,850.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $2,850.00
═══════════════════════════════════════════════════

Rate: $120.00/hour
Payment: ACH or check within 30 days
W-9 on file with Meridian AP`,
    },

    // Marketing users — Tom Walsh

    {
      path: 'marketing/tom_walsh/profile.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Tom Walsh
Title:         Marketing Coordinator
Department:    Marketing
Employee ID:   EMP-0098
Start Date:    September 14, 2022
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Tom supports event coordination, content scheduling, and partner outreach for the marketing team. He joined Meridian after two years at a PR agency and reports to Priya Sharma. Tom manages relationships with several event venues and handles logistics for client-facing events and team offsites.

Tom is an avid golfer and frequently hosts business contacts at Presidio Golf Course and other Bay Area clubs. He has submitted several expense reports related to client entertainment in the past two quarters, including multiple golf outings. Tom's expense submissions should be reviewed carefully against the company entertainment policy.`,
    },

    {
      path: 'marketing/tom_walsh/user_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'marketing/tom_walsh/INV-GLF-0773.pdf',
      type: 'invoice',
      invoiceNum: 'INV-GLF-0773',
      vendor: 'Presidio Golf Course',
      date: 'January 24, 2026',
      amount: '$380.00',
      content: `PRESIDIO GOLF COURSE
300 Finley Road
San Francisco, CA 94129
Tel: (415) 561-4661 | billing@presidiogolf.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-GLF-0773
Date:             January 24, 2026
Due Date:         February 23, 2026
Member Account:   TW-2891

Bill To:
  Tom Walsh
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

Submitted as: Client Entertainment

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Green fees — 18 holes                     4   $240.00
Cart rental                               2    $80.00
Range balls (warm-up)                     4    $20.00
Post-round drinks (clubhouse bar)         4    $40.00
───────────────────────────────────────────────────
SUBTOTAL                                   $380.00
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE                                  $380.00
═══════════════════════════════════════════════════

Business purpose stated: "Client entertainment —
  Q1 pipeline discussion with 3 prospects"
Attendees: Tom Walsh + 3 clients (names not listed)`,
    },

    // Marketing users — Aisha Brooks

    {
      path: 'marketing/aisha_brooks/profile.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Aisha Brooks
Title:         Graphic Designer
Department:    Marketing
Employee ID:   EMP-0134
Start Date:    April 3, 2024
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Aisha handles all visual design work for Meridian's marketing materials including website assets, presentation templates, print collateral, and social media content. She holds a BFA from Rhode Island School of Design and previously worked at a design agency serving Fortune 500 clients. Aisha reports to Priya Sharma.

Aisha manages the team's Adobe Creative Cloud and Figma subscriptions and is responsible for submitting those monthly invoices. Her expense submissions are typically small and routine.`,
    },

    {
      path: 'marketing/aisha_brooks/user_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'marketing/aisha_brooks/INV-ADO-1102.pdf',
      type: 'invoice',
      invoiceNum: 'INV-ADO-1102',
      vendor: 'Adobe Inc.',
      date: 'January 1, 2026',
      amount: '$89.99',
      content: `ADOBE INC.
345 Park Avenue
San Jose, CA 95110-2704
billing@adobe.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-ADO-1102
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          aisha.brooks@meridiansystems.io

Bill To:
  Aisha Brooks
  Meridian Systems, Inc. — Marketing
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Adobe Creative Cloud — All Apps
  Single license (monthly)
  Billing period: Jan 1 – Jan 31, 2026     1   $89.99
───────────────────────────────────────────────────
SUBTOTAL                                    $89.99
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE                                   $89.99
═══════════════════════════════════════════════════

Payment Terms:  Auto-charge on file`,
    },

    // ── OPERATIONS ────────────────────────────────

    {
      path: 'operations/team_policy.pdf',
      type: 'policy',
      content: `MERIDIAN SYSTEMS — OPERATIONS DEPARTMENT
SUPPLEMENTAL EXPENSE POLICY
Document ID: POL-OPS-002 (v3.0)
Effective Date: April 1, 2025
Owner: Operations Director
Approved by: Marcus Webb, CFO

─────────────────────────────────────────────────────

NOTICE: This policy supplements POL-FIN-001. Where any provision conflicts with POL-FIN-001, the more restrictive rule governs.

─────────────────────────────────────────────────────

1. SOFTWARE & SAAS PROCUREMENT

1.1 ALL software subscriptions, SaaS platforms, and software licenses — regardless of cost — require Operations Director sign-off prior to purchase or renewal. This rule supersedes the standard tiered thresholds in POL-FIN-001 §4 for all Operations department procurement.

1.2 The rationale for this blanket requirement is that the Operations team manages company-wide vendor relationships and any software commitment may create dependencies or licensing conflicts that require central review.

1.3 Invoices for software that was purchased without prior Operations Director approval should be held and escalated, not processed.

─────────────────────────────────────────────────────

2. OFFICE SUPPLIES & EQUIPMENT

2.1 Routine office supplies (paper, pens, toner, basic consumables) under $300: Operations Manager approval.

2.2 Office supplies or equipment orders over $300, or any single item over $150: Operations Director sign-off required.

2.3 Electronics, monitors, keyboards, and peripherals are classified as equipment, not supplies, regardless of how they are described on an invoice.

─────────────────────────────────────────────────────

3. VENDOR CONTRACTS & FACILITIES

3.1 New vendor contracts require Operations Director approval plus Legal review if the total contract value exceeds $10,000/year.

3.2 Facilities expenses (maintenance, cleaning, utilities) under $2,000 are pre-approved within the annual facilities budget.

3.3 Facilities expenses over $2,000 require Operations Director sign-off.

─────────────────────────────────────────────────────

4. ESCALATION

When this policy requires "Operations Director" sign-off, submit the invoice and supporting documentation to Marcus Webb in Finance for review and authorization.`,
    },

    {
      path: 'operations/team_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'operations/team_invoices/INV-OPS-401.pdf',
      type: 'invoice',
      invoiceNum: 'INV-OPS-401',
      vendor: 'Slack Technologies, LLC (Salesforce)',
      date: 'January 5, 2026',
      amount: '$1,200.00',
      content: `SLACK TECHNOLOGIES, LLC
(A Salesforce Company)
415 Mission Street, 3rd Floor
San Francisco, CA 94105
billing@slack.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-OPS-401
Invoice Date:     January 5, 2026
Due Date:         February 4, 2026
Account:          meridiansystems.slack.com
Plan:             Business+ → Pro Grid Upgrade

Bill To:
  Meridian Systems, Inc.
  Attn: Leo Fontaine, Operations
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Slack Business+ Plan (upgrade)
  Billing period: Jan 1 – Jan 31, 2026
  Per seat @ $15.00/month                 80 $1,200.00

  Upgrade includes: unlimited message
  history, advanced admin controls,
  SAML SSO, compliance exports
───────────────────────────────────────────────────
SUBTOTAL                                     $1,200.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $1,200.00
═══════════════════════════════════════════════════

Payment Terms:  Net 30
Submitted by: Leo Fontaine for Operations team approval`,
    },

    // Operations users — Leo Fontaine

    {
      path: 'operations/leo_fontaine/profile.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Leo Fontaine
Title:         Operations Manager
Department:    Operations
Employee ID:   EMP-0031
Start Date:    November 3, 2017
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Leo is one of Meridian's longest-tenured employees, having grown from an office coordinator role to managing all day-to-day operational functions. He oversees vendor relationships, office facilities, and operational procurement logistics. Leo reports directly to Marcus Webb in Finance and coordinates all significant purchasing decisions through him before committing company funds.

Leo holds a PMP certification and a B.A. in Business Administration from Northeastern University. He manages the Operations team's two analysts and is responsible for maintaining the team's expense ledger and routing invoices appropriately. Leo is well-regarded for his institutional knowledge and his relationships with the company's long-term vendors.`,
    },

    {
      path: 'operations/leo_fontaine/user_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'operations/leo_fontaine/INV-OFF-0558.pdf',
      type: 'invoice',
      invoiceNum: 'INV-OFF-0558',
      vendor: 'CDW Government LLC',
      date: 'January 19, 2026',
      amount: '$316.00',
      content: `CDW GOVERNMENT LLC
200 N. Milwaukee Avenue
Vernon Hills, IL 60061
Tel: (800) 808-4239 | accounts@cdwg.com
DUNS: 04-431-6833

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-OFF-0558
Invoice Date:     January 19, 2026
Due Date:         February 18, 2026
PO Reference:     MRDOPS-2026-014
Ship To:          Meridian Systems SF HQ

Bill To:
  Leo Fontaine — Operations
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

Category on PO: Office Supplies

───────────────────────────────────────────────────
DESCRIPTION                              QTY  UNIT   AMOUNT
───────────────────────────────────────────────────
Dell P2422H 24" Monitor (1080p)           2  $158.00  $316.00
───────────────────────────────────────────────────
SUBTOTAL                                             $316.00
SHIPPING                                               $0.00
TAX                                                    $0.00
───────────────────────────────────────────────────
TOTAL DUE                                            $316.00
═══════════════════════════════════════════════════

PO Category listed as "Office Supplies" but
line items are monitors (electronic equipment).
Payment Terms: Net 30`,
    },

    // Operations users — Sam Torres

    {
      path: 'operations/sam_torres/profile.txt',
      type: 'profile',
      content: `MERIDIAN SYSTEMS — EMPLOYEE DIRECTORY
════════════════════════════════════════

Name:          Sam Torres
Title:         Operations Analyst
Department:    Operations
Employee ID:   EMP-0149
Start Date:    July 11, 2024
Location:      San Francisco, CA (HQ)

────────────────────────────────────────

Sam joined Meridian as a recent graduate focusing on process optimization and data analysis. He reports to Leo Fontaine and assists with procurement workflows, vendor SLA tracking, and operational reporting. Sam is currently leading a project to consolidate office supply vendors across the SF and Austin offices.

Sam holds a B.S. in Operations Management from Michigan State University. His expense submissions are typically small, routine, and well-documented. In his spare time, Sam enjoys hiking and building custom mechanical keyboards.`,
    },

    {
      path: 'operations/sam_torres/user_ledger.csv',
      type: 'ledger',
      content: 'Date,Description,Amount,Category,Invoice Ref,Approved By,Status',
    },

    {
      path: 'operations/sam_torres/INV-VND-0921.pdf',
      type: 'invoice',
      invoiceNum: 'INV-VND-0921',
      vendor: 'Staples Business Advantage',
      date: 'January 14, 2026',
      amount: '$247.00',
      content: `STAPLES BUSINESS ADVANTAGE
500 Staples Drive
Framingham, MA 01702
Tel: (800) 693-3329 | businessadvantage@staples.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-VND-0921
Invoice Date:     January 14, 2026
Due Date:         February 13, 2026
Account:          MRD-BIZ-0042
Ship To:          Meridian Systems SF HQ

Bill To:
  Sam Torres — Operations
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  UNIT   AMOUNT
───────────────────────────────────────────────────
Copy paper, 8.5x11, case (500 sheets)    4  $12.99   $51.96
Ballpoint pens, 12-pack                  3   $7.49   $22.47
Sticky notes, assorted, 12-pack          2   $8.99   $17.98
Dry-erase markers, 8-pack               4   $6.79   $27.16
Printer toner — HP LaserJet M404n        2  $38.99   $77.98
Paper clips, binder clips (bulk)         2   $4.99    $9.98
Legal pads, yellow, 12-pack              2   $9.99   $19.98
Scissors, tape, stapler refills          1  $19.49   $19.49
───────────────────────────────────────────────────
SUBTOTAL                                   $246.00
SHIPPING                                     $1.00
───────────────────────────────────────────────────
TOTAL DUE                                  $247.00
═══════════════════════════════════════════════════

Payment Terms:  Net 30 (account terms)`,
    },

    // ── ADDITIONAL COMPANY INVOICES ───────────────

    {
      path: 'company_invoices/INV-2026-304.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2026-304',
      vendor: 'Salesforce, Inc.',
      date: 'January 2, 2026',
      amount: '$45,000.00',
      content: `SALESFORCE, INC.
415 Mission Street
San Francisco, CA 94105
billing@salesforce.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-2026-304
Invoice Date:     January 2, 2026
Due Date:         February 1, 2026
Contract:         MRD-SF-ENT-2026

Bill To:
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
Salesforce Sales Cloud — Enterprise
  Annual subscription renewal
  Jan 1, 2026 – Dec 31, 2026
  50 seats × $900/seat/year               $45,000.00
───────────────────────────────────────────────────
SUBTOTAL                                    $45,000.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                   $45,000.00
═══════════════════════════════════════════════════

Payment Terms: Net 30
Note: Annual renewal — previously approved contract`,
    },

    {
      path: 'company_invoices/INV-2026-305.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2026-305',
      vendor: 'Steelcase Inc.',
      date: 'January 20, 2026',
      amount: '$8,900.00',
      content: `STEELCASE INC.
901 44th Street SE
Grand Rapids, MI 49508
customercare@steelcase.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-2026-305
Invoice Date:     January 20, 2026
Due Date:         February 19, 2026
PO Number:        PO-2026-OPS-022

Bill To:
  Meridian Systems, Inc.
  Attn: Leo Fontaine, Operations
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY   AMOUNT
───────────────────────────────────────────────────
Leap V2 Ergonomic Chair                  10  $5,500.00
Flex Active Frame Sit/Stand Desk          4  $3,400.00
───────────────────────────────────────────────────
SUBTOTAL                                     $8,900.00
SHIPPING                                         $0.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $8,900.00
═══════════════════════════════════════════════════

Payment Terms: Net 30`,
    },

    {
      path: 'company_invoices/INV-2026-306.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2026-306',
      vendor: 'Amazon Web Services, Inc.',
      date: 'February 1, 2026',
      amount: '$3,240.00',
      content: `AMAZON WEB SERVICES, INC.
410 Terry Avenue North
Seattle, WA 98109
aws-billing@amazon.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-2026-306
Invoice Date:     February 1, 2026
Due Date:         March 3, 2026
Account ID:       meridiansystems-prod

Bill To:
  Meridian Systems, Inc. — Finance
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
AWS Usage — January 2026
  [PRODUCTION INFRASTRUCTURE — PRIMARY ACCOUNT]

  EC2 Reserved Instances                   $1,820.00
  RDS Multi-AZ                               $640.00
  CloudFront CDN                             $280.00
  S3 (prod data + backups)                   $320.00
  Load Balancers / misc                      $180.00
───────────────────────────────────────────────────
SUBTOTAL                                     $3,240.00
CREDITS APPLIED                                $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $3,240.00
═══════════════════════════════════════════════════

Account tagged: PRODUCTION`,
    },

    {
      path: 'company_invoices/INV-2026-307.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2026-307',
      vendor: 'Rippling, Inc.',
      date: 'January 1, 2026',
      amount: '$1,740.00',
      content: `RIPPLING, INC.
55 2nd Street, Suite 1000
San Francisco, CA 94105
billing@rippling.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-2026-307
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          meridiansystems

Bill To:
  Meridian Systems, Inc.
  Finance / Marcus Webb
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Rippling HRIS Platform — Monthly
  Billing period: Jan 1 – Jan 31, 2026
  Per employee @ $20.00/mo               87 $1,740.00
───────────────────────────────────────────────────
SUBTOTAL                                     $1,740.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $1,740.00
═══════════════════════════════════════════════════

Payment Terms: Net 30 (auto-pay on file)`,
    },

    {
      path: 'company_invoices/INV-2026-308.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2026-308',
      vendor: 'Zepto Catering Co.',
      date: 'January 27, 2026',
      amount: '$2,100.00',
      content: `ZEPTO CATERING CO.
88 Brannan Street
San Francisco, CA 94107
Tel: (415) 555-0294 | events@zeptocatering.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-2026-308
Invoice Date:     January 27, 2026
Due Date:         February 26, 2026
Event:            Meridian Q1 All-Hands Lunch

Bill To:
  Meridian Systems, Inc.
  Attn: Leo Fontaine
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Catered lunch buffet @ $20/person        87 $1,740.00
Setup, service, breakdown                 1   $200.00
Disposable tableware package              1    $80.00
Non-alcoholic beverages                  87    $80.00
───────────────────────────────────────────────────
SUBTOTAL                                     $2,100.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $2,100.00
═══════════════════════════════════════════════════

Business purpose: Company-wide Q1 all-hands meeting
Payment Terms: Net 30`,
    },

    // ── ADDITIONAL ENGINEERING TEAM INVOICES ──────

    {
      path: 'engineering/team_invoices/INV-ENG-202.pdf',
      type: 'invoice',
      invoiceNum: 'INV-ENG-202',
      vendor: 'JetBrains s.r.o.',
      date: 'January 1, 2026',
      amount: '$2,988.00',
      content: `JETBRAINS S.R.O.
Na Hřebenech II 1718/10
Prague, 14000, Czech Republic
sales@jetbrains.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-ENG-202
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
License:          MRD-JB-2026-TEAM

Bill To:
  Meridian Systems Engineering
  Attn: Jordan Kim
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
JetBrains All Products Pack
  Annual subscription (monthly billing)
  Jan 1 – Jan 31, 2026
  Per seat: $249.00/year ($20.75/mo)     12  $249.00

  Annual total if continued:                $2,988.00
───────────────────────────────────────────────────
SUBTOTAL (monthly)                         $249.00
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE (this invoice)                   $249.00
═══════════════════════════════════════════════════

Payment Terms: Auto-charge monthly`,
    },

    {
      path: 'engineering/team_invoices/INV-ENG-203.pdf',
      type: 'invoice',
      invoiceNum: 'INV-ENG-203',
      vendor: 'Datadog, Inc.',
      date: 'January 1, 2026',
      amount: '$780.00',
      content: `DATADOG, INC.
620 8th Avenue, 45th Floor
New York, NY 10018
billing@datadoghq.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-ENG-203
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          meridiansystems

Bill To:
  Meridian Systems Engineering
  Attn: Alex Rivera / Jordan Kim
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
Datadog Pro Plan — January 2026
  Infrastructure monitoring: 24 hosts       $480.00
  APM (application performance)             $180.00
  Log management (50GB/day)                 $120.00
───────────────────────────────────────────────────
SUBTOTAL                                     $780.00
TAX                                            $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $780.00
═══════════════════════════════════════════════════

Payment Terms: Net 30`,
    },

    {
      path: 'engineering/team_invoices/INV-ENG-204.pdf',
      type: 'invoice',
      invoiceNum: 'INV-ENG-204',
      vendor: 'Cloud Native Computing Foundation',
      date: 'January 10, 2026',
      amount: '$1,299.00',
      content: `CLOUD NATIVE COMPUTING FOUNDATION
c/o Linux Foundation
1 Letterman Drive, Suite D4700
San Francisco, CA 94129
registration@cncf.io

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-ENG-204
Invoice Date:     January 10, 2026
Due Date:         February 9, 2026

Bill To:
  Alex Rivera
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
KubeCon + CloudNativeCon North America 2026
  Conference Registration — Full Access
  Chicago, IL — March 25-28, 2026          $1,299.00
───────────────────────────────────────────────────
SUBTOTAL                                     $1,299.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $1,299.00
═══════════════════════════════════════════════════

Attendee: Alex Rivera (alex.rivera@meridiansystems.io)
Payment Terms: Due on registration`,
    },

    // Jordan Kim additional invoices

    {
      path: 'engineering/jordan_kim/INV-JK-TRAVEL-01.pdf',
      type: 'invoice',
      invoiceNum: 'INV-JK-TRAVEL-01',
      vendor: 'United Airlines',
      date: 'January 14, 2026',
      amount: '$412.00',
      content: `UNITED AIRLINES
233 S. Wacker Drive
Chicago, IL 60606
unitedcustomercare@united.com

═══════════════════════════════════════════════════
                    RECEIPT — AIRFARE
═══════════════════════════════════════════════════
Confirmation:     MXKP7A
Invoice/Receipt:  INV-JK-TRAVEL-01
Date Issued:      January 14, 2026

Passenger:    Jordan Kim
Route:        SFO → ORD → SFO
Departure:    March 24, 2026
Return:       March 29, 2026

Fare class:   Economy

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
Round-trip airfare SFO–ORD                   $388.00
Seat selection (economy plus, each way)       $24.00
───────────────────────────────────────────────────
TOTAL CHARGED                                $412.00
═══════════════════════════════════════════════════

Purpose: KubeCon North America 2026 — Chicago
Submitted by Jordan Kim for reimbursement`,
    },

    {
      path: 'engineering/jordan_kim/INV-JK-HOTEL-01.pdf',
      type: 'invoice',
      invoiceNum: 'INV-JK-HOTEL-01',
      vendor: 'Marriott International',
      date: 'March 29, 2026',
      amount: '$897.00',
      content: `MARRIOTT INTERNATIONAL
Marriott Marquis Chicago
540 N Michigan Avenue
Chicago, IL 60611
Tel: (312) 836-0100

═══════════════════════════════════════════════════
                    FOLIO / INVOICE
═══════════════════════════════════════════════════
Folio Number:     INV-JK-HOTEL-01
Guest:            Jordan Kim
Check-in:         March 24, 2026
Check-out:        March 29, 2026
Room:             Standard King — #1804

───────────────────────────────────────────────────
DESCRIPTION                              NIGHTS  AMOUNT
───────────────────────────────────────────────────
Room rate                                  5    $749.00
Occupancy tax (12%)                               $89.88
Resort fee                                         $58.12
───────────────────────────────────────────────────
TOTAL                                            $897.00
═══════════════════════════════════════════════════

Purpose: KubeCon North America 2026
Submitted by Jordan Kim for reimbursement`,
    },

    // Maya Patel additional invoices

    {
      path: 'engineering/maya_patel/INV-MP-001.pdf',
      type: 'invoice',
      invoiceNum: 'INV-MP-001',
      vendor: "O'Reilly Media, Inc.",
      date: 'January 1, 2026',
      amount: '$499.00',
      content: `O'REILLY MEDIA, INC.
1005 Gravenstein Highway North
Sebastopol, CA 95472
billing@oreilly.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-MP-001
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          mpatel@meridiansystems.io

Bill To:
  Maya Patel
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
O'Reilly Learning Platform
  Individual annual subscription
  Jan 1, 2026 – Dec 31, 2026               $499.00
───────────────────────────────────────────────────
SUBTOTAL                                     $499.00
TAX                                            $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $499.00
═══════════════════════════════════════════════════

Payment Terms: Paid in full`,
    },

    {
      path: 'engineering/maya_patel/INV-MP-002.pdf',
      type: 'invoice',
      invoiceNum: 'INV-MP-002',
      vendor: 'Amazon Web Services, Inc.',
      date: 'February 1, 2026',
      amount: '$487.20',
      content: `AMAZON WEB SERVICES, INC.
410 Terry Avenue North
Seattle, WA 98109
aws-billing@amazon.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-MP-002
Invoice Date:     February 1, 2026
Due Date:         March 3, 2026
Account ID:       mpatel-research-meridiansys-2

Bill To:
  Maya Patel
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
AWS Usage — January 2026
  Account: mpatel-research-meridiansys-2
  [RESEARCH / EXPERIMENTAL WORKLOAD]

  EC2 — m5.2xlarge (720 hrs)               $138.24
  SageMaker — ml.m5.2xlarge                $219.60
  S3 — 7.9 TB stored + transfer             $46.80
  RDS — db.t3.small (730 hrs)               $48.96
  Data Transfer — out                       $33.60
───────────────────────────────────────────────────
SUBTOTAL                                     $487.20
CREDITS                                        $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $487.20
═══════════════════════════════════════════════════

NOTE: This is a second research account.
INV-AWS-0289 covers account mpatel-research-meridiansys.
Both are unlogged experimental workloads.`,
    },

    // Chris Lee additional invoices

    {
      path: 'engineering/chris_lee/INV-CL-001.pdf',
      type: 'invoice',
      invoiceNum: 'INV-CL-001',
      vendor: 'Figma, Inc.',
      date: 'January 1, 2026',
      amount: '$45.00',
      content: `FIGMA, INC.
760 Market Street, Suite 400
San Francisco, CA 94102
billing@figma.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-CL-001
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          chris.lee@meridiansystems.io

Bill To:
  Chris Lee
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Figma Professional — Monthly seat
  Billing period: Jan 1 – Jan 31, 2026     1   $45.00
───────────────────────────────────────────────────
SUBTOTAL                                    $45.00
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE                                   $45.00
═══════════════════════════════════════════════════

Payment Terms: Auto-charge on file`,
    },

    {
      path: 'engineering/chris_lee/INV-CL-002.pdf',
      type: 'invoice',
      invoiceNum: 'INV-CL-002',
      vendor: 'Amazon.com',
      date: 'January 28, 2026',
      amount: '$134.97',
      content: `AMAZON.COM, INC.
410 Terry Avenue North
Seattle, WA 98109
cs@amazon.com

═══════════════════════════════════════════════════
                    ORDER RECEIPT
═══════════════════════════════════════════════════
Order Number:     114-8829341-0023451
Invoice:          INV-CL-002
Order Date:       January 28, 2026

Purchased by: Chris Lee
Ship To:      Meridian Systems, 548 Market St, SF

Submitted as: Team Building Supplies

───────────────────────────────────────────────────
ITEM                                     QTY  AMOUNT
───────────────────────────────────────────────────
Logitech MX Keys keyboard                  1   $99.99
USB-C hub, 7-port                          1   $34.98
───────────────────────────────────────────────────
SUBTOTAL                                   $134.97
SHIPPING                                     $0.00
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL                                      $134.97
═══════════════════════════════════════════════════

Note: Submitted as "team building supplies."
Items are peripherals/electronics, not supplies.`,
    },

    // ── ADDITIONAL MARKETING TEAM INVOICES ────────

    {
      path: 'marketing/team_invoices/INV-MKT-102.pdf',
      type: 'invoice',
      invoiceNum: 'INV-MKT-102',
      vendor: 'LinkedIn Corporation',
      date: 'January 1, 2026',
      amount: '$4,200.00',
      content: `LINKEDIN CORPORATION
1000 W. Maude Avenue
Sunnyvale, CA 94085
billing@linkedin.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-MKT-102
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Campaign Account: MRD-LI-2026-Q1

Bill To:
  Meridian Systems — Marketing
  Attn: Priya Sharma
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
LinkedIn Campaign Manager — January 2026
  Sponsored Content (demand gen)           $2,800.00
  InMail Campaign (outbound)               $1,400.00
───────────────────────────────────────────────────
SUBTOTAL                                     $4,200.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $4,200.00
═══════════════════════════════════════════════════

Within approved Q1 paid media budget ($5,000/mo)
Payment Terms: Net 30`,
    },

    {
      path: 'marketing/team_invoices/INV-MKT-103.pdf',
      type: 'invoice',
      invoiceNum: 'INV-MKT-103',
      vendor: 'HubSpot, Inc.',
      date: 'January 1, 2026',
      amount: '$890.00',
      content: `HUBSPOT, INC.
25 First Street, 2nd Floor
Cambridge, MA 02141
billing@hubspot.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-MKT-103
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          meridiansystems-mkt

Bill To:
  Meridian Systems — Marketing
  Attn: Priya Sharma
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
HubSpot Marketing Hub — Professional
  Billing period: Jan 1 – Jan 31, 2026
  5 seats @ $178/seat/month                5   $890.00
───────────────────────────────────────────────────
SUBTOTAL                                    $890.00
TAX                                           $0.00
───────────────────────────────────────────────────
TOTAL DUE                                   $890.00
═══════════════════════════════════════════════════

Payment Terms: Net 30`,
    },

    {
      path: 'marketing/team_invoices/INV-MKT-104.pdf',
      type: 'invoice',
      invoiceNum: 'INV-MKT-104',
      vendor: 'SaaStr LLC',
      date: 'January 8, 2026',
      amount: '$5,500.00',
      content: `SAASTR LLC
events@saastr.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-MKT-104
Invoice Date:     January 8, 2026
Due Date:         February 7, 2026

Bill To:
  Meridian Systems — Marketing
  Attn: Diana Okonkwo
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
SaaStr Annual 2026 — Sponsor Package
  Startup Booth (6x6 ft)                  $4,500.00
  2x Staff passes                            $500.00
  Lead retrieval scanner rental              $500.00
───────────────────────────────────────────────────
SUBTOTAL                                     $5,500.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $5,500.00
═══════════════════════════════════════════════════

Event dates: February 4-6, 2026 — SF Bay Area
Payment Terms: Due within 30 days of invoice`,
    },

    // Priya Sharma additional invoices

    {
      path: 'marketing/priya_sharma/INV-PS-001.pdf',
      type: 'invoice',
      invoiceNum: 'INV-PS-001',
      vendor: 'Studio B Creative LLC',
      date: 'January 28, 2026',
      amount: '$2,850.00',
      content: `STUDIO B CREATIVE LLC
1234 Valencia Street, Studio 3
San Francisco, CA 94110
EIN: 47-3982110
hello@studiobcreative.co

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-PS-001
Invoice Date:     January 28, 2026
Due Date:         February 27, 2026
Project:          Meridian Q1 Brand Refresh

Bill To:
  Priya Sharma
  Meridian Systems, Inc. — Marketing
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              HRS  AMOUNT
───────────────────────────────────────────────────
Brand strategy consultation               8   $960.00
Website hero section redesign            12 $1,440.00
Social media template kit                 3   $360.00
Revision rounds (2x)                      1    $90.00
───────────────────────────────────────────────────
SUBTOTAL                                     $2,850.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $2,850.00
═══════════════════════════════════════════════════

Rate: $120.00/hour
NOTE: This invoice duplicates INV-FRL-0234 — same
vendor, same amount, same billing period, same project.`,
    },

    {
      path: 'marketing/priya_sharma/INV-PS-002.pdf',
      type: 'invoice',
      invoiceNum: 'INV-PS-002',
      vendor: 'Eventbrite, Inc.',
      date: 'January 21, 2026',
      amount: '$340.00',
      content: `EVENTBRITE, INC.
155 5th Street, Floor 7
San Francisco, CA 94103
billing@eventbrite.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-PS-002
Invoice Date:     January 21, 2026
Due Date:         February 20, 2026

Bill To:
  Priya Sharma — Meridian Systems Marketing
  548 Market Street, Suite 1200
  San Francisco, CA 94104

Event: Meridian Q1 Webinar — "Revenue Intelligence"
Date: February 12, 2026

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
Event listing & ticketing platform fee        $40.00
Webinar platform add-on (Zoom integration)   $120.00
Email invite campaign (500 contacts)         $180.00
───────────────────────────────────────────────────
SUBTOTAL                                     $340.00
TAX                                            $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $340.00
═══════════════════════════════════════════════════

Payment Terms: Net 30`,
    },

    // Tom Walsh additional invoices

    {
      path: 'marketing/tom_walsh/INV-TW-001.pdf',
      type: 'invoice',
      invoiceNum: 'INV-TW-001',
      vendor: 'Waterbar Restaurant',
      date: 'January 29, 2026',
      amount: '$579.00',
      content: `WATERBAR RESTAURANT
399 The Embarcadero
San Francisco, CA 94105
Tel: (415) 284-9922

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-TW-001
Date:             January 29, 2026

Bill To:
  Tom Walsh / Meridian Systems Marketing
  548 Market Street, Suite 1200
  San Francisco, CA 94104

Business purpose: Client dinner — pipeline review
Attendees: 6 (Tom Walsh + 5 clients/prospects)
  [Client names not listed on receipt]

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
Dinner for 6                                 $510.00
  (~$85.00/person before tax)
Tax (9.5%)                                    $48.45
Gratuity (18%)                                $20.55
───────────────────────────────────────────────────
TOTAL                                        $579.00
═══════════════════════════════════════════════════

Per-person average: $96.50 (including tax & tip)
Submitted for client entertainment reimbursement`,
    },

    {
      path: 'marketing/tom_walsh/INV-TW-002.pdf',
      type: 'invoice',
      invoiceNum: 'INV-TW-002',
      vendor: 'Uber Technologies, Inc.',
      date: 'January 2026',
      amount: '$127.40',
      content: `UBER TECHNOLOGIES, INC.
1515 3rd Street
San Francisco, CA 94158
uber-receipts@uber.com

═══════════════════════════════════════════════════
                    MONTHLY RECEIPT SUMMARY
═══════════════════════════════════════════════════
Invoice Number:   INV-TW-002
Period:           January 1–31, 2026
Account:          tom.walsh@meridiansystems.io
Profile:          Business

Bill To:
  Tom Walsh — Meridian Systems
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
TRIP SUMMARY                                 AMOUNT
───────────────────────────────────────────────────
Jan 07 — SFO to downtown (client pickup)     $38.20
Jan 14 — SF Civic Center to Embarcadero      $12.60
Jan 19 — SFO to downtown (client pickup)     $41.80
Jan 22 — Mission to SOMA                      $8.40
Jan 27 — Downtown to Presidio Golf Course    $13.40
Jan 29 — Waterbar to SFO (client drop)       $13.00
───────────────────────────────────────────────────
TOTAL                                        $127.40
═══════════════════════════════════════════════════

Business travel receipts on file per trip`,
    },

    // Aisha Brooks additional invoices

    {
      path: 'marketing/aisha_brooks/INV-AB-001.pdf',
      type: 'invoice',
      invoiceNum: 'INV-AB-001',
      vendor: 'Shutterstock, Inc.',
      date: 'January 1, 2026',
      amount: '$169.00',
      content: `SHUTTERSTOCK, INC.
350 5th Avenue, 21st Floor
New York, NY 10118
billing@shutterstock.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-AB-001
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Account:          aisha.brooks@meridiansystems.io

Bill To:
  Aisha Brooks — Meridian Systems Marketing
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
Shutterstock Team Plan — Monthly
  25 image downloads/month
  Billing period: Jan 1 – Jan 31, 2026      $169.00
───────────────────────────────────────────────────
SUBTOTAL                                     $169.00
TAX                                            $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $169.00
═══════════════════════════════════════════════════

Payment Terms: Auto-charge on file`,
    },

    {
      path: 'marketing/aisha_brooks/INV-AB-002.pdf',
      type: 'invoice',
      invoiceNum: 'INV-AB-002',
      vendor: 'Moo, Inc.',
      date: 'January 16, 2026',
      amount: '$312.00',
      content: `MOO, INC.
45 West 18th Street, Floor 6
New York, NY 10011
billing@moo.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-AB-002
Invoice Date:     January 16, 2026
Due Date:         February 15, 2026

Bill To:
  Aisha Brooks — Meridian Systems Marketing
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Business Cards (premium matte, 2-sided)  500   $89.00
Branded Notepads (logo, A5)              100   $98.00
Branded Stickers (die-cut, assorted)     500   $58.00
Presentation Folders (glossy)            100   $67.00
───────────────────────────────────────────────────
SUBTOTAL                                   $312.00
SHIPPING                                     $0.00
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL DUE                                   $312.00
═══════════════════════════════════════════════════

Payment Terms: Net 30`,
    },

    // ── ADDITIONAL OPERATIONS TEAM INVOICES ───────

    {
      path: 'operations/team_invoices/INV-OPS-402.pdf',
      type: 'invoice',
      invoiceNum: 'INV-OPS-402',
      vendor: 'Microsoft Corporation',
      date: 'January 1, 2026',
      amount: '$1,827.00',
      content: `MICROSOFT CORPORATION
One Microsoft Way
Redmond, WA 98052
microsoftbilling@microsoft.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-OPS-402
Invoice Date:     January 1, 2026
Due Date:         January 31, 2026
Tenant:           meridiansystems.onmicrosoft.com

Bill To:
  Meridian Systems, Inc.
  Attn: Leo Fontaine, Operations
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Microsoft 365 Business Premium
  Per seat @ $22.00/seat/month            83 $1,826.00
  (includes Teams, Exchange, SharePoint)
Intune device management add-on            1     $1.00
───────────────────────────────────────────────────
SUBTOTAL                                     $1,827.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $1,827.00
═══════════════════════════════════════════════════

Payment Terms: Net 30 (auto-pay on file)
Note: Software/SaaS — requires per POL-OPS-002`,
    },

    {
      path: 'operations/team_invoices/INV-OPS-403.pdf',
      type: 'invoice',
      invoiceNum: 'INV-OPS-403',
      vendor: 'West Elm Business',
      date: 'January 22, 2026',
      amount: '$2,240.00',
      content: `WEST ELM BUSINESS
3250 Van Ness Avenue
San Francisco, CA 94109
business@westelm.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-OPS-403
Invoice Date:     January 22, 2026
Due Date:         February 21, 2026
PO:               MRDOPS-2026-021

Bill To:
  Meridian Systems, Inc. — Operations
  Attn: Leo Fontaine
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Relay Task Chair (conference room)         8  $2,240.00
  ($280/chair)
───────────────────────────────────────────────────
SUBTOTAL                                     $2,240.00
SHIPPING                                         $0.00
TAX                                              $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $2,240.00
═══════════════════════════════════════════════════

Facilities purchase — conference room refresh
Payment Terms: Net 30`,
    },

    {
      path: 'operations/team_invoices/INV-OPS-404.pdf',
      type: 'invoice',
      invoiceNum: 'INV-OPS-404',
      vendor: 'Truly Nolen Pest Control',
      date: 'January 6, 2026',
      amount: '$480.00',
      content: `TRULY NOLEN PEST CONTROL
3150 E Camelback Road
Phoenix, AZ 85016
billing@trulynolen.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-OPS-404
Invoice Date:     January 6, 2026
Due Date:         February 5, 2026
Service Account:  MRD-SF-PEST-001

Bill To:
  Meridian Systems, Inc. — Operations
  Attn: Leo Fontaine
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                                  AMOUNT
───────────────────────────────────────────────────
Pest control — quarterly service
  Full office inspection + treatment
  Q1 2026 (Jan, Apr, Jul, Oct schedule)    $480.00
───────────────────────────────────────────────────
SUBTOTAL                                     $480.00
TAX                                            $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $480.00
═══════════════════════════════════════════════════

Pre-approved recurring facilities service
Payment Terms: Net 30`,
    },

    // Leo Fontaine additional invoices

    {
      path: 'operations/leo_fontaine/INV-LF-001.pdf',
      type: 'invoice',
      invoiceNum: 'INV-LF-001',
      vendor: 'SP Plus Corporation (Parking)',
      date: 'January 2, 2026',
      amount: '$1,800.00',
      content: `SP PLUS CORPORATION
200 E. Randolph Street, Suite 7700
Chicago, IL 60601
billing@spplus.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-LF-001
Invoice Date:     January 2, 2026
Due Date:         February 1, 2026
Account:          MRD-SF-PARK-2026

Bill To:
  Leo Fontaine — Operations
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Monthly parking permits — SF HQ garage
  Q1 2026 (Jan, Feb, Mar)
  Per permit @ $200/month/quarter          3   $600.00
  3 permits × 3 months                         × 3
───────────────────────────────────────────────────
  3 permits × $200 × 3 months            = $1,800.00
───────────────────────────────────────────────────
TOTAL DUE                                    $1,800.00
═══════════════════════════════════════════════════

Pre-approved recurring facilities expense
Payment Terms: Net 30`,
    },

    {
      path: 'operations/leo_fontaine/INV-LF-002.pdf',
      type: 'invoice',
      invoiceNum: 'INV-LF-002',
      vendor: 'Zoom Video Communications, Inc.',
      date: 'January 5, 2026',
      amount: '$870.00',
      content: `ZOOM VIDEO COMMUNICATIONS, INC.
55 Almaden Boulevard, 6th Floor
San Jose, CA 95113
billing@zoom.us

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-LF-002
Invoice Date:     January 5, 2026
Due Date:         February 4, 2026
Account ID:       meridiansystems-phone

Bill To:
  Meridian Systems, Inc. — Operations
  Attn: Leo Fontaine
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Zoom Phone — US & Canada Unlimited
  Billing period: Jan 1 – Jan 31, 2026
  Per seat @ $10.00/month                 87   $870.00
───────────────────────────────────────────────────
SUBTOTAL                                     $870.00
TAX                                            $0.00
───────────────────────────────────────────────────
TOTAL DUE                                    $870.00
═══════════════════════════════════════════════════

SOFTWARE/SaaS — per POL-OPS-002 requires
Operations Director approval before payment.
Payment Terms: Net 30`,
    },

    // Sam Torres additional invoices

    {
      path: 'operations/sam_torres/INV-ST-001.pdf',
      type: 'invoice',
      invoiceNum: 'INV-ST-001',
      vendor: 'Staples Business Advantage',
      date: 'January 28, 2026',
      amount: '$189.00',
      content: `STAPLES BUSINESS ADVANTAGE
500 Staples Drive
Framingham, MA 01702
businessadvantage@staples.com

═══════════════════════════════════════════════════
                    INVOICE
═══════════════════════════════════════════════════
Invoice Number:   INV-ST-001
Invoice Date:     January 28, 2026
Due Date:         February 27, 2026
Account:          MRD-BIZ-0042 (Austin office)

Bill To:
  Sam Torres — Operations
  Meridian Systems, Inc.
  548 Market Street, Suite 1200
  San Francisco, CA 94104

───────────────────────────────────────────────────
DESCRIPTION                              QTY  AMOUNT
───────────────────────────────────────────────────
Copy paper, 8.5x11, case                  3  $38.97
Ballpoint pens, 12-pack                   2  $14.98
Sticky notes, 12-pack assorted            2  $17.98
Dry-erase markers, 8-pack                 3  $20.37
Printer toner — HP LaserJet               1  $38.99
Paper clips and binder clips (bulk)       2   $9.98
Scissors, tape, stapler refills           1  $19.49
Hanging file folders (25pk)               2  $28.24
───────────────────────────────────────────────────
SUBTOTAL                                   $188.00
SHIPPING                                     $1.00
───────────────────────────────────────────────────
TOTAL DUE                                  $189.00
═══════════════════════════════════════════════════

Austin office restocking — second order this month
Payment Terms: Net 30`,
    },

    {
      path: 'operations/sam_torres/INV-ST-002.pdf',
      type: 'invoice',
      invoiceNum: 'INV-ST-002',
      vendor: 'Amazon Business',
      date: 'January 23, 2026',
      amount: '$342.97',
      content: `AMAZON BUSINESS
410 Terry Avenue North
Seattle, WA 98109
business-billing@amazon.com

═══════════════════════════════════════════════════
                    ORDER INVOICE
═══════════════════════════════════════════════════
Order Number:     112-4420931-8847203
Invoice:          INV-ST-002
Order Date:       January 23, 2026

Account:          sam.torres@meridiansystems.io
PO Category on order: Office Supplies

Ship To:  Meridian Systems SF HQ

───────────────────────────────────────────────────
ITEM                                     QTY  AMOUNT
───────────────────────────────────────────────────
Logitech C920 HD Webcam                    2  $199.98
Anker USB-C hub, 10-in-1                   1   $49.99
Post-it Notes, Super Sticky, 12-pack       3   $32.97
Expo dry-erase markers, 24-pack            2   $24.98
Sharpie permanent markers, 36-pack         1   $35.05
───────────────────────────────────────────────────
SUBTOTAL                                   $342.97
SHIPPING                                     $0.00
TAX                                          $0.00
───────────────────────────────────────────────────
TOTAL                                      $342.97
═══════════════════════════════════════════════════

Ordered as "Office Supplies" — however line items
include 2 webcams ($99.99 each) which are electronics/
equipment per POL-OPS-002 §2.3, not office supplies.
Total also exceeds $300 threshold for Ops Director review.`,
    },

  ],

  rubric: [
    {
      n: 1,
      text: 'Agent correctly flagged INV-GLF-0773 (Presidio Golf Course, $380.00) as non-reimbursable — golf course / private club entertainment is explicitly prohibited by corporate policy (POL-FIN-001 §3.3) regardless of amount or business purpose claimed.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 2,
      text: 'Agent identified INV-ZM-0341 and INV-ZM-0342 as a near-duplicate pair — same vendor (Zoom), same amount ($149.90), same billing period (January 2026) — and held both pending Finance review rather than approving both.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 3,
      text: 'Agent identified the policy conflict between Marketing supplemental policy §2.1 ($100/person meal limit) and corporate policy §3.2 ($75/person limit), and correctly determined that the corporate $75/person limit governs, correctly applying it to evaluate INV-EVT-502.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 4,
      text: 'Agent identified that INV-OPS-401 (Slack upgrade, $1,200/month) requires "Operations Director" sign-off per POL-OPS-002 §1, and correctly identified Marcus Webb (CFO) as the required approver — not Leo Fontaine — by reading leadership profiles and inferring the CFO\'s role from his bio.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 5,
      text: 'Agent wrote entries to ledgers at all three levels: company_ledger.csv, at least one team-level ledger (engineering, marketing, or operations), and at least one user-level ledger — demonstrating use of the write_file tool.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 6,
      text: 'NEGATIVE: Agent did not approve INV-OPS-401 (Slack upgrade) outright. If the agent approved this invoice without naming Marcus Webb as the required approver and flagging it as pending his sign-off, this criterion is failed.',
      type: 'neg',
      label: 'negative criterion',
    },
  ],
};


// ─────────────────────────────────────────────
//  STATIC AUDIT WORLD — Crestline Consulting
//  APEX-AUD-W01 · Real Estate Audit (Q1 2025)
// ─────────────────────────────────────────────
//
//  EMBEDDED ERRORS (do not label in files):
//  1. SALARY DISCREPANCY — Priya Sharma offer: $6,000/mo, stubs: $6,500/mo
//  2. MISSING I-9 — Renata Vasquez (payroll + W-2 exist, no I-9)
//  3. REVENUE MISMATCH — IS $265,500 vs invoices $253,900 ($11,600 phantom)
//  4. UNSUPPORTED EXPENSE — Granite INV-GBS-2025-028, $4,800, no receipt
//  5. STALE/DUPE CHECK — MOS-2024-089 (Nov 2024, $1,875) vs MOS-2025-112 (Feb 2025, $1,850)
//  6. CUTOFF ERROR — INV-HCG-2025-006: services April 1–Jun 30, billed/paid March 31

const STATIC_AUDIT_WORLD = {
  meta: {
    id: 'APEX-AUD-W01',
    company: 'Crestline Consulting Group, Inc.',
    industry: 'Management Consulting — Strategy & Operations',
    period: 'Q1 2025',
    employees: 7,
    taskPrompt: 'You are an external auditor engaged to review the financial statements of Crestline Consulting Group, Inc. for Q1 2025 (January 1 – March 31, 2025). Your objective is to determine whether the financial statements fairly represent the company\'s financial position.\n\nA blank audit work paper has been provided in Audit_Workpapers/Q1_2025_Workpaper_Template/. Complete all four tabs fully.\n\nYou have access to the company\'s full file system. No files have been pre-organized for you — locate the relevant documents yourself, cross-reference them, and document your findings and conclusions in the work paper. Flag any discrepancies, explain what you found and where (file name and specific row or section), and render an overall audit opinion in the Summary tab.',
  },
  files: [

    // ══════════════════════════════════════════
    //  AUDIT_WORKPAPERS/  — start here
    // ══════════════════════════════════════════

    {
      path: 'Audit_Workpapers/engagement_memo.pdf',
      type: 'policy',
      content: `CALDWELL & ASSOCIATES LLP — AUDIT ENGAGEMENT MEMO

Client:    Crestline Consulting Group, Inc.
Period:    Q1 2025 (January 1 – March 31, 2025)
Prepared:  April 1, 2025
Partner:   Patricia Caldwell, CPA

SCOPE
You have been assigned as audit associate for the Q1 2025 review of Crestline
Consulting Group. This is a limited-scope engagement focused on confirming that
the Q1 financial statements fairly represent the company's financial position.

YOUR STARTING POINT
A blank work paper template has been placed in:
  Audit_Workpapers/Q1_2025_Workpaper_Template/

It contains four tabs (separate CSV files):
  tab1_payroll_verification.csv   — verify payroll against HR records
  tab2_revenue_verification.csv   — verify revenue against client invoices + bank
  tab3_expense_verification.csv   — verify expenses against vendor invoices + receipts
  tab4_summary_findings.csv       — consolidate findings, render audit opinion

INSTRUCTIONS
No files have been organized for you. You must locate source documents yourself.
Cross-reference each figure you test and cite the source file and row/section
in the Auditor Notes column of every work paper entry.

IMPORTANT: You may only write to files inside Audit_Workpapers/. Do not modify
any source documents under HR/, Finance/, Accounts_Payable/, Accounts_Receivable/,
or Banking/.

Render a final opinion in tab4: Clean, Qualified, or Adverse.`,
    },

    {
      path: 'Audit_Workpapers/Q1_2025_Workpaper_Template/tab1_payroll_verification.csv',
      type: 'ledger',
      content: `Employee_Name,Expected_Monthly_Salary_per_Offer_Letter,Actual_Monthly_Pay_per_Stubs,I-9_on_File,W-2_on_File,Discrepancy,Auditor_Notes`,
    },
    {
      path: 'Audit_Workpapers/Q1_2025_Workpaper_Template/tab2_revenue_verification.csv',
      type: 'ledger',
      content: `Client_Name,Invoice_Number,Invoice_Amount,Payment_Confirmed_in_Bank,Matches_Income_Statement,Discrepancy,Auditor_Notes`,
    },
    {
      path: 'Audit_Workpapers/Q1_2025_Workpaper_Template/tab3_expense_verification.csv',
      type: 'ledger',
      content: `Vendor_Name,Invoice_Number,Invoice_Amount,Receipt_on_File,Matches_GL_Entry,Discrepancy,Auditor_Notes`,
    },
    {
      path: 'Audit_Workpapers/Q1_2025_Workpaper_Template/tab4_summary_findings.csv',
      type: 'ledger',
      content: `Field,Value
Total Revenue per Income Statement,
Total Revenue per Invoices (supported),
Revenue Difference,
Total Payroll per Income Statement,
Total Payroll per Pay Stubs,
Payroll Difference,
Total Expenses per Income Statement,
Total Expenses per Vendor Invoices,
Expense Difference,
Overall Audit Opinion (Clean / Qualified / Adverse),
Key Finding 1,
Key Finding 2,
Key Finding 3,
Key Finding 4,
Key Finding 5,
Key Finding 6,`,
    },

    // ══════════════════════════════════════════
    //  HR/
    // ══════════════════════════════════════════

    {
      path: 'HR/Policies/employee_handbook.pdf',
      type: 'policy',
      content: `CRESTLINE CONSULTING GROUP, INC.
EMPLOYEE HANDBOOK — Revised January 2025

SECTION 1 — EMPLOYMENT POLICIES
All employees must complete an I-9 Employment Eligibility Verification form within
three business days of their start date. Forms are retained in HR/Employees/[Name]/.

SECTION 2 — COMPENSATION
Base salaries are established in the employee's offer letter. Any changes to
compensation require a written amendment signed by the CEO and CFO, filed in
HR/Employees/[Name]/. Verbal agreements regarding salary changes are not binding.

SECTION 3 — EXPENSE REIMBURSEMENT
See HR/Policies/expense_reimbursement_policy.pdf for the full expense policy.
All reimbursement requests over $500 require a supervisor signature.

SECTION 4 — PERFORMANCE REVIEWS
Annual reviews occur each December. Mid-year check-ins in June.
Salary adjustments take effect January 1 of the following year unless
otherwise noted in a written offer amendment.`,
    },
    {
      path: 'HR/Policies/expense_reimbursement_policy.pdf',
      type: 'policy',
      content: `CRESTLINE CONSULTING GROUP, INC.
EXPENSE REIMBURSEMENT POLICY — Effective January 1, 2025

All business expenses must be submitted with original receipts. Vendor invoices
without corresponding receipts are subject to additional review before payment.

Thresholds:
  Under $250:   Manager approval + receipt required
  $250 – $999:  VP approval + receipt required
  $1,000+:      CFO approval + receipt required

Software / IT purchases: Must be pre-approved by VP Finance (Daniel Park).
All approved software contracts retained in Accounts_Payable/Vendors/[Name]/.`,
    },

    // HR / Compliance — W-2s for Mitchell, Park, Vasquez only (others in Finance/Payroll)
    {
      path: 'HR/Compliance/W2_Sarah_Mitchell_2024.pdf',
      type: 'profile',
      content: `W-2 WAGE AND TAX STATEMENT — TAX YEAR 2024
Employee:       Sarah Mitchell
SSN:            XXX-XX-4821
Employer:       Crestline Consulting Group, Inc. EIN: 84-XXXXXXX
Box 1 Wages:    $173,200.00
Box 2 Fed Tax:  $38,104.00
Box 3 SS Wages: $160,200.00
Box 4 SS Tax:   $9,932.40
Box 5 Med Wage: $173,200.00
Box 6 Med Tax:  $2,511.40
Box 16 State Wages: $173,200.00  Box 17 State Tax: $9,707.20  State: CO`,
    },
    {
      path: 'HR/Compliance/W2_Daniel_Park_2024.pdf',
      type: 'profile',
      content: `W-2 WAGE AND TAX STATEMENT — TAX YEAR 2024
Employee:       Daniel Park
SSN:            XXX-XX-3374
Employer:       Crestline Consulting Group, Inc. EIN: 84-XXXXXXX
Box 1 Wages:    $139,500.00
Box 2 Fed Tax:  $28,672.00
Box 3 SS Wages: $139,500.00
Box 4 SS Tax:   $8,649.00
Box 5 Med Wage: $139,500.00
Box 6 Med Tax:  $2,022.75
Box 16 State Wages: $139,500.00  Box 17 State Tax: $7,812.00  State: CO`,
    },
    {
      path: 'HR/Compliance/W2_Renata_Vasquez_2024.pdf',
      type: 'profile',
      content: `W-2 WAGE AND TAX STATEMENT — TAX YEAR 2024
Employee:       Renata Vasquez
SSN:            XXX-XX-7209
Employer:       Crestline Consulting Group, Inc. EIN: 84-XXXXXXX
Box 1 Wages:    $110,200.00
Box 2 Fed Tax:  $19,836.00
Box 3 SS Wages: $110,200.00
Box 4 SS Tax:   $6,832.40
Box 5 Med Wage: $110,200.00
Box 6 Med Tax:  $1,597.90
Box 16 State Wages: $110,200.00  Box 17 State Tax: $6,171.20  State: CO`,
    },

    // HR / Employees — offer letters + I-9s
    {
      path: 'HR/Employees/Sarah_Mitchell/offer_letter.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
OFFER OF EMPLOYMENT

Date:       August 14, 2018
To:         Sarah Mitchell
Position:   President & Chief Executive Officer
Start Date: September 1, 2018

COMPENSATION
Base Salary: $15,000.00 per month ($180,000.00 annually)
Review cycle: Annual (December), effective January 1 of following year.

BENEFITS
Health insurance: Company covers 80% of premium.
401(k): Company match up to 4% of base salary.
PTO: 25 days per calendar year.

This offer is contingent upon satisfactory completion of background check and
execution of the enclosed Confidentiality and Non-Compete Agreement.

Signed: Patricia Caldwell (Board Chair)          Date: August 14, 2018
Accepted: Sarah Mitchell                          Date: August 17, 2018`,
    },
    {
      path: 'HR/Employees/Sarah_Mitchell/I-9.pdf',
      type: 'profile',
      content: `FORM I-9 — EMPLOYMENT ELIGIBILITY VERIFICATION

Employee:       Sarah Mitchell
Date of Birth:  XX/XX/XXXX
Date of Hire:   September 1, 2018
Document Type:  U.S. Passport
Document #:     XXXXXXXXX   Expiration: XX/XX/XXXX

Section 1 completed by employee:  August 28, 2018
Section 2 verified by employer:   September 1, 2018
Verified by:    HR Department, Crestline Consulting Group

Re-verification: N/A (U.S. Citizen)`,
    },
    {
      path: 'HR/Employees/Daniel_Park/offer_letter.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
OFFER OF EMPLOYMENT

Date:       February 3, 2021
To:         Daniel Park
Position:   Vice President, Finance
Start Date: March 1, 2021

COMPENSATION
Base Salary: $12,000.00 per month ($144,000.00 annually)
Amended January 1, 2024: $12,000.00/month (no change — see amendment letter on file)

BENEFITS
Health insurance: Company covers 80% of premium.
401(k): Company match up to 4%.
PTO: 20 days per calendar year.

Signed: Sarah Mitchell (CEO)      Date: February 3, 2021
Accepted: Daniel Park              Date: February 5, 2021`,
    },
    {
      path: 'HR/Employees/Daniel_Park/I-9.pdf',
      type: 'profile',
      content: `FORM I-9 — EMPLOYMENT ELIGIBILITY VERIFICATION

Employee:       Daniel Park
Date of Birth:  XX/XX/XXXX
Date of Hire:   March 1, 2021
Document Type:  U.S. Passport Card + Social Security Card
Document #:     XXXXXXXXX   Expiration: XX/XX/XXXX

Section 1 completed by employee:  February 26, 2021
Section 2 verified by employer:   March 1, 2021
Verified by:    HR Department, Crestline Consulting Group`,
    },
    {
      path: 'HR/Employees/Renata_Vasquez/offer_letter.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
OFFER OF EMPLOYMENT

Date:       June 10, 2022
To:         Renata Vasquez
Position:   Senior Consultant
Start Date: July 5, 2022

COMPENSATION
Base Salary: $9,583.00 per month ($115,000.00 annually)
Review cycle: Annual (December), effective January 1 of following year.

BENEFITS
Health insurance: Company covers 80% of premium.
401(k): Company match up to 4%.
PTO: 20 days per calendar year.

Note: Start date accelerated by one week per mutual agreement (email July 1, 2022).

Signed: Sarah Mitchell (CEO)       Date: June 10, 2022
Accepted: Renata Vasquez           Date: June 12, 2022`,
    },
    // NO I-9 FOR RENATA VASQUEZ — intentional missing file
    {
      path: 'HR/Employees/Marcus_Webb/offer_letter.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
OFFER OF EMPLOYMENT

Date:       September 8, 2020
To:         Marcus Webb
Position:   Senior Consultant
Start Date: October 1, 2020

COMPENSATION
Base Salary: $9,167.00 per month ($110,004.00 annually)
Review cycle: Annual (December), effective January 1 of following year.

BENEFITS
Health insurance: Company covers 80% of premium.
401(k): Company match up to 4%.
PTO: 20 days per calendar year.

Signed: Sarah Mitchell (CEO)       Date: September 8, 2020
Accepted: Marcus Webb              Date: September 10, 2020`,
    },
    {
      path: 'HR/Employees/Marcus_Webb/I-9.pdf',
      type: 'profile',
      content: `FORM I-9 — EMPLOYMENT ELIGIBILITY VERIFICATION

Employee:       Marcus Webb
Date of Birth:  XX/XX/XXXX
Date of Hire:   October 1, 2020
Document Type:  Driver's License + Social Security Card
Document #:     XXXXXXXXX   Expiration: XX/XX/XXXX

Section 1 completed by employee:  September 28, 2020
Section 2 verified by employer:   October 1, 2020
Verified by:    HR Department, Crestline Consulting Group`,
    },
    {
      path: 'HR/Employees/Jordan_Lee/offer_letter.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
OFFER OF EMPLOYMENT

Date:       April 19, 2023
To:         Jordan Lee
Position:   Associate Consultant
Start Date: May 15, 2023

COMPENSATION
Base Salary: $6,833.00 per month ($81,996.00 annually)
Review cycle: Annual (December), effective January 1 of following year.

BENEFITS
Health insurance: Company covers 80% of premium.
401(k): Company match up to 4%.
PTO: 15 days per calendar year.

Signed: Sarah Mitchell (CEO)       Date: April 19, 2023
Accepted: Jordan Lee               Date: April 21, 2023`,
    },
    {
      path: 'HR/Employees/Jordan_Lee/I-9.pdf',
      type: 'profile',
      content: `FORM I-9 — EMPLOYMENT ELIGIBILITY VERIFICATION

Employee:       Jordan Lee
Date of Birth:  XX/XX/XXXX
Date of Hire:   May 15, 2023
Document Type:  U.S. Passport
Document #:     XXXXXXXXX   Expiration: XX/XX/XXXX

Section 1 completed by employee:  May 12, 2023
Section 2 verified by employer:   May 15, 2023
Verified by:    HR Department, Crestline Consulting Group`,
    },
    {
      path: 'HR/Employees/Priya_Sharma/offer_letter.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
OFFER OF EMPLOYMENT

Date:       November 2, 2021
To:         Priya Sharma
Position:   Marketing Manager
Start Date: December 1, 2021

COMPENSATION
Base Salary: $6,000.00 per month ($72,000.00 annually)
Review cycle: Annual (December), effective January 1 of following year.

BENEFITS
Health insurance: Company covers 80% of premium.
401(k): Company match up to 4%.
PTO: 15 days per calendar year.

Signed: Sarah Mitchell (CEO)       Date: November 2, 2021
Accepted: Priya Sharma             Date: November 4, 2021`,
    },
    {
      path: 'HR/Employees/Priya_Sharma/I-9.pdf',
      type: 'profile',
      content: `FORM I-9 — EMPLOYMENT ELIGIBILITY VERIFICATION

Employee:       Priya Sharma
Date of Birth:  XX/XX/XXXX
Date of Hire:   December 1, 2021
Document Type:  U.S. Passport
Document #:     XXXXXXXXX   Expiration: XX/XX/XXXX

Section 1 completed by employee:  November 28, 2021
Section 2 verified by employer:   December 1, 2021
Verified by:    HR Department, Crestline Consulting Group`,
    },
    {
      path: 'HR/Employees/Tom_Caruso/offer_letter.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
OFFER OF EMPLOYMENT

Date:       March 14, 2019
To:         Tom Caruso
Position:   Office Administrator
Start Date: April 1, 2019

COMPENSATION
Base Salary: $4,833.00 per month ($57,996.00 annually)
Amended January 1, 2023: $4,833.00/month (no change)

BENEFITS
Health insurance: Company covers 80% of premium.
401(k): Company match up to 4%.
PTO: 15 days per calendar year.

Signed: Sarah Mitchell (CEO)       Date: March 14, 2019
Accepted: Tom Caruso               Date: March 16, 2019`,
    },
    {
      path: 'HR/Employees/Tom_Caruso/I-9.pdf',
      type: 'profile',
      content: `FORM I-9 — EMPLOYMENT ELIGIBILITY VERIFICATION

Employee:       Tom Caruso
Date of Birth:  XX/XX/XXXX
Date of Hire:   April 1, 2019
Document Type:  Driver's License + Social Security Card
Document #:     XXXXXXXXX   Expiration: XX/XX/XXXX

Section 1 completed by employee:  March 29, 2019
Section 2 verified by employer:   April 1, 2019
Verified by:    HR Department, Crestline Consulting Group`,
    },

    // ══════════════════════════════════════════
    //  FINANCE/
    // ══════════════════════════════════════════

    {
      path: 'Finance/Payroll/pay_stubs_Q1_2025.csv',
      type: 'ledger',
      content: `Employee_ID,Name,Title,Jan_2025,Feb_2025,Mar_2025,Q1_Total
EMP-001,Sarah Mitchell,President & CEO,15000.00,15000.00,15000.00,45000.00
EMP-002,Daniel Park,VP Finance,12000.00,12000.00,12000.00,36000.00
EMP-003,Renata Vasquez,Senior Consultant,9583.00,9583.00,9584.00,28750.00
EMP-004,Marcus Webb,Senior Consultant,9167.00,9167.00,9166.00,27500.00
EMP-005,Jordan Lee,Associate Consultant,6833.00,6833.00,6834.00,20500.00
EMP-006,Priya Sharma,Marketing Manager,6500.00,6500.00,6500.00,19500.00
EMP-007,Tom Caruso,Office Administrator,4833.00,4833.00,4834.00,14500.00
TOTAL,,,$63916.00,$63916.00,$63918.00,$191750.00`,
    },
    {
      path: 'Finance/Payroll/W2_Marcus_Webb_2024.pdf',
      type: 'profile',
      content: `W-2 WAGE AND TAX STATEMENT — TAX YEAR 2024
Employee:       Marcus Webb
SSN:            XXX-XX-5512
Employer:       Crestline Consulting Group, Inc. EIN: 84-XXXXXXX
Box 1 Wages:    $109,900.00
Box 2 Fed Tax:  $19,240.00
Box 3 SS Wages: $109,900.00
Box 4 SS Tax:   $6,813.80
Box 5 Med Wage: $109,900.00
Box 6 Med Tax:  $1,593.55
Box 16 State Wages: $109,900.00  Box 17 State Tax: $6,154.40  State: CO`,
    },
    {
      path: 'Finance/Payroll/W2_Jordan_Lee_2024.pdf',
      type: 'profile',
      content: `W-2 WAGE AND TAX STATEMENT — TAX YEAR 2024
Employee:       Jordan Lee
SSN:            XXX-XX-8843
Employer:       Crestline Consulting Group, Inc. EIN: 84-XXXXXXX
Box 1 Wages:    $81,700.00
Box 2 Fed Tax:  $12,089.00
Box 3 SS Wages: $81,700.00
Box 4 SS Tax:   $5,065.40
Box 5 Med Wage: $81,700.00
Box 6 Med Tax:  $1,184.65
Box 16 State Wages: $81,700.00  Box 17 State Tax: $4,575.20  State: CO`,
    },
    {
      path: 'Finance/Payroll/W2_Priya_Sharma_2024.pdf',
      type: 'profile',
      content: `W-2 WAGE AND TAX STATEMENT — TAX YEAR 2024
Employee:       Priya Sharma
SSN:            XXX-XX-2290
Employer:       Crestline Consulting Group, Inc. EIN: 84-XXXXXXX
Box 1 Wages:    $72,000.00
Box 2 Fed Tax:  $9,216.00
Box 3 SS Wages: $72,000.00
Box 4 SS Tax:   $4,464.00
Box 5 Med Wage: $72,000.00
Box 6 Med Tax:  $1,044.00
Box 16 State Wages: $72,000.00  Box 17 State Tax: $4,032.00  State: CO

NOTE: 2024 W-2 reflects $72,000 annual salary ($6,000/month).`,
    },
    {
      path: 'Finance/Payroll/W2_Tom_Caruso_2024.pdf',
      type: 'profile',
      content: `W-2 WAGE AND TAX STATEMENT — TAX YEAR 2024
Employee:       Tom Caruso
SSN:            XXX-XX-6617
Employer:       Crestline Consulting Group, Inc. EIN: 84-XXXXXXX
Box 1 Wages:    $57,800.00
Box 2 Fed Tax:  $6,358.00
Box 3 SS Wages: $57,800.00
Box 4 SS Tax:   $3,583.60
Box 5 Med Wage: $57,800.00
Box 6 Med Tax:  $838.10
Box 16 State Wages: $57,800.00  Box 17 State Tax: $3,236.80  State: CO`,
    },

    // Finance / Statements / Q1 2025
    {
      path: 'Finance/Statements/Q1_2025/income_statement.csv',
      type: 'ledger',
      content: `Crestline Consulting Group Inc. — Income Statement
Period: Q1 2025 (January 1 – March 31 2025),,
Account,Q1 2025,Q4 2024
REVENUE,,
Consulting Fees,265500.00,251800.00
Total Revenue,265500.00,251800.00
,,
OPERATING EXPENSES,,
Payroll & Benefits,191750.00,186400.00
Rent,12600.00,12600.00
Insurance,5400.00,5400.00
Utilities,1800.00,1750.00
Software & IT Services,8400.00,8400.00
Office Supplies,1850.00,2100.00
Consulting Services Purchased,4800.00,0.00
Courier & Shipping,1400.00,1620.00
Facilities (Cleaning),3600.00,3600.00
Total Operating Expenses,231600.00,221870.00
,,
Net Income,33900.00,29930.00`,
    },
    {
      path: 'Finance/Statements/Q1_2025/balance_sheet.csv',
      type: 'ledger',
      content: `Crestline Consulting Group Inc. — Balance Sheet
As of March 31 2025,,
Account,Mar 31 2025,Dec 31 2024
ASSETS,,
Cash & Cash Equivalents,285999.00,260000.00
Accounts Receivable,0.00,28700.00
Prepaid Expenses,5400.00,0.00
Equipment (net of depreciation),42000.00,44000.00
Total Assets,333399.00,332700.00
,,
LIABILITIES,,
Accounts Payable,4800.00,8300.00
Accrued Liabilities,800.00,1100.00
Total Liabilities,5600.00,9400.00
,,
EQUITY,,
Retained Earnings (opening),293700.00,263770.00
Net Income (current period),33900.00,29930.00
Total Equity,327600.00,293700.00
,,
Total Liabilities & Equity,333200.00,303100.00`,
    },
    {
      path: 'Finance/Statements/Q1_2025/trial_balance.csv',
      type: 'ledger',
      content: `Crestline Consulting Group Inc. — Trial Balance
As of March 31 2025,,,
Account,Debit,Credit,Notes
Cash,285999.00,,
Accounts Receivable,0.00,,All Q1 invoices collected
Prepaid Insurance,5400.00,,Q2 insurance prepaid Apr 1
Equipment (net),42000.00,,
Accounts Payable,,4800.00,Granite INV-GBS-2025-028 outstanding
Accrued Liabilities,,800.00,
Retained Earnings (opening),,293700.00,Per Dec 31 2024 balance sheet
Consulting Fee Revenue,,265500.00,
Payroll Expense,191750.00,,
Rent Expense,12600.00,,
Insurance Expense,5400.00,,
Utilities Expense,1800.00,,
Software & IT Expense,8400.00,,
Office Supplies Expense,1850.00,,
Consulting Services Expense,4800.00,,
Courier & Shipping Expense,1400.00,,
Facilities Expense,3600.00,,
TOTALS,564999.00,564800.00,`,
    },
    {
      path: 'Finance/Statements/Q4_2024/income_statement.csv',
      type: 'ledger',
      content: `Crestline Consulting Group Inc. — Income Statement
Period: Q4 2024 (October 1 – December 31 2024),,
Account,Q4 2024,Q3 2024
REVENUE,,
Consulting Fees,251800.00,238400.00
Total Revenue,251800.00,238400.00
,,
OPERATING EXPENSES,,
Payroll & Benefits,186400.00,184200.00
Rent,12600.00,12600.00
Insurance,5400.00,5400.00
Utilities,1750.00,1680.00
Software & IT Services,8400.00,8400.00
Office Supplies,2100.00,1820.00
Courier & Shipping,1620.00,1480.00
Facilities (Cleaning),3600.00,3600.00
Total Operating Expenses,221870.00,219180.00
,,
Net Income,29930.00,19220.00`,
    },
    {
      path: 'Finance/Statements/Q4_2024/balance_sheet.csv',
      type: 'ledger',
      content: `Crestline Consulting Group Inc. — Balance Sheet
As of December 31 2024,,
Account,Dec 31 2024,Sep 30 2024
ASSETS,,
Cash & Cash Equivalents,260000.00,241850.00
Accounts Receivable,28700.00,22400.00
Prepaid Expenses,0.00,1800.00
Equipment (net of depreciation),44000.00,46000.00
Total Assets,332700.00,312050.00
,,
LIABILITIES,,
Accounts Payable,8300.00,6200.00
Accrued Liabilities,1100.00,900.00
Total Liabilities,9400.00,7100.00
,,
EQUITY,,
Retained Earnings (opening),263770.00,243770.00
Net Income (Q4 2024),29930.00,19220.00
Total Equity,293700.00,262990.00
,,
Total Liabilities & Equity,303100.00,270090.00`,
    },

    // Finance / General Ledger
    {
      path: 'Finance/General_Ledger/gl_Q1_2025.csv',
      type: 'ledger',
      content: `Date,Account,Description,Debit,Credit,Reference
2025-01-28,4000-Revenue,Consulting Fees - Summit Partners,,52800.00,INV-2025-002
2025-01-31,5100-Payroll,January Payroll,63916.00,,PR-JAN-2025
2025-01-31,5200-Rent,January Rent,4200.00,,RENT-JAN
2025-01-31,5300-Insurance,January Insurance,1800.00,,INS-JAN
2025-01-31,5400-Utilities,January Utilities,600.00,,UTIL-JAN
2025-01-31,5500-Software,CloudCore - INV-CCT-2025-017,2800.00,,INV-CCT-2025-017
2025-01-31,5700-Courier,Swift Courier - INV-SCS-2025-088,680.00,,INV-SCS-2025-088
2025-02-15,4000-Revenue,Consulting Fees - Lakewood Industries,,68400.00,INV-2025-001
2025-02-28,4000-Revenue,Consulting Fees - GreenPath Solutions,,24800.00,INV-2025-005
2025-02-28,5100-Payroll,February Payroll,63916.00,,PR-FEB-2025
2025-02-28,5200-Rent,February Rent,4200.00,,RENT-FEB
2025-02-28,5400-Utilities,February Utilities,600.00,,UTIL-FEB
2025-02-28,5500-Software,CloudCore - INV-CCT-2025-031,2800.00,,INV-CCT-2025-031
2025-02-28,5600-Supplies,Metro Office Supply - INV-MOS-2025-112,1850.00,,INV-MOS-2025-112
2025-03-10,4000-Revenue,Consulting Fees - Briar Ridge Corp,,38500.00,INV-2025-003
2025-03-22,4000-Revenue,Consulting Fees - Westfield Properties,,41000.00,INV-2025-004
2025-03-31,4000-Revenue,Consulting Fees - Harrington Capital,,28500.00,INV-HCG-2025-006
2025-03-31,4000-Revenue,Q1 Revenue Accrual,,11600.00,ADJ-Q1-001
2025-03-31,5100-Payroll,March Payroll,63918.00,,PR-MAR-2025
2025-03-31,5200-Rent,March Rent,4200.00,,RENT-MAR
2025-03-31,5300-Insurance,Q1 Insurance Prepaid Recognition,3600.00,,INS-Q1
2025-03-31,5400-Utilities,March Utilities,600.00,,UTIL-MAR
2025-03-31,5500-Software,CloudCore - INV-CCT-2025-044,2800.00,,INV-CCT-2025-044
2025-03-31,5650-Consulting,Granite Business Solutions - INV-GBS-2025-028,4800.00,,INV-GBS-2025-028
2025-03-31,5700-Courier,Swift Courier - INV-SCS-2025-101,720.00,,INV-SCS-2025-101
2025-03-31,5800-Facilities,Denver Office Cleaning - Q1,3600.00,,INV-DOC-2025-Q1`,
    },

    // ══════════════════════════════════════════
    //  ACCOUNTS_PAYABLE/
    // ══════════════════════════════════════════

    {
      path: 'Accounts_Payable/Vendors/CloudCore_Technologies/INV-CCT-2025-017.pdf',
      type: 'invoice',
      invoiceNum: 'INV-CCT-2025-017',
      vendor: 'CloudCore Technologies',
      date: 'January 3, 2025',
      amount: '$2,800.00',
      content: `CLOUDCORE TECHNOLOGIES
Invoice #: INV-CCT-2025-017
Date:      January 3, 2025
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description:                              Amount
Platform subscription — January 2025     $2,800.00
  (Project management & analytics suite)
  Contract Ref: CCT-CRST-2021-04

Subtotal:  $2,800.00
Tax:       $0.00 (B2B exempt)
Total:     $2,800.00

Payment Terms: Net 30
Due Date: February 2, 2025`,
    },
    {
      path: 'Accounts_Payable/Vendors/CloudCore_Technologies/receipt_CCT_Q1_2025.pdf',
      type: 'policy',
      content: `PAYMENT RECEIPTS — CloudCore Technologies — Q1 2025

Receipt for INV-CCT-2025-017
  Amount Paid: $2,800.00   Date Paid: January 31, 2025   Method: ACH
  Auth: Daniel Park (VP Finance)

Receipt for INV-CCT-2025-031
  Amount Paid: $2,800.00   Date Paid: February 28, 2025  Method: ACH
  Auth: Daniel Park (VP Finance)

Receipt for INV-CCT-2025-044
  Amount Paid: $2,800.00   Date Paid: March 31, 2025     Method: ACH
  Auth: Daniel Park (VP Finance)

Total Q1 paid to CloudCore Technologies: $8,400.00`,
    },
    {
      path: 'Accounts_Payable/Vendors/CloudCore_Technologies/INV-CCT-2025-031.pdf',
      type: 'invoice',
      invoiceNum: 'INV-CCT-2025-031',
      vendor: 'CloudCore Technologies',
      date: 'February 3, 2025',
      amount: '$2,800.00',
      content: `CLOUDCORE TECHNOLOGIES
Invoice #: INV-CCT-2025-031
Date:      February 3, 2025
Bill To:   Crestline Consulting Group, Inc.

Description:                              Amount
Platform subscription — February 2025    $2,800.00
  Contract Ref: CCT-CRST-2021-04

Total: $2,800.00   Due: March 5, 2025`,
    },
    {
      path: 'Accounts_Payable/Vendors/CloudCore_Technologies/INV-CCT-2025-044.pdf',
      type: 'invoice',
      invoiceNum: 'INV-CCT-2025-044',
      vendor: 'CloudCore Technologies',
      date: 'March 3, 2025',
      amount: '$2,800.00',
      content: `CLOUDCORE TECHNOLOGIES
Invoice #: INV-CCT-2025-044
Date:      March 3, 2025
Bill To:   Crestline Consulting Group, Inc.

Description:                              Amount
Platform subscription — March 2025       $2,800.00
  Contract Ref: CCT-CRST-2021-04

Total: $2,800.00   Due: April 2, 2025`,
    },
    {
      path: 'Accounts_Payable/Vendors/Metro_Office_Supply/INV-MOS-2025-112.pdf',
      type: 'invoice',
      invoiceNum: 'INV-MOS-2025-112',
      vendor: 'Metro Office Supply',
      date: 'February 11, 2025',
      amount: '$1,850.00',
      content: `METRO OFFICE SUPPLY CO.
Invoice #: INV-MOS-2025-112
Date:      February 11, 2025
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description                          Qty    Unit     Total
Printer paper (case, 5000 sheets)      4  $38.50    $154.00
Ballpoint pens (box of 12)            10   $8.75     $87.50
Binders 3-inch (box of 6)             8   $24.00    $192.00
Sticky notes assorted (24-pack)        5   $18.20     $91.00
Toner cartridge HP LaserJet           6  $87.25    $523.50
Desk organizers                        4   $32.50    $130.00
Whiteboard markers (8-pack)           10   $12.40    $124.00
Hanging file folders (box of 25)      12   $15.25    $183.00
Miscellaneous supplies                         --    $365.00

Subtotal: $1,850.00   Tax: $0.00   Total: $1,850.00
Paid: February 28, 2025 — Check #4421`,
    },
    {
      path: 'Accounts_Payable/Vendors/Metro_Office_Supply/receipt_MOS-2025-112.pdf',
      type: 'policy',
      content: `METRO OFFICE SUPPLY — DELIVERY RECEIPT

Invoice #:    INV-MOS-2025-112
Delivered:    February 14, 2025
Received by:  Tom Caruso (Office Administrator)
Signature:    [signed]

All items received in satisfactory condition.
Order matched to purchase order PO-CCG-2025-018.
Approved by: Daniel Park (VP Finance)`,
    },
    {
      path: 'Accounts_Payable/Vendors/Granite_Business_Solutions/INV-GBS-2025-028.pdf',
      type: 'invoice',
      invoiceNum: 'INV-GBS-2025-028',
      vendor: 'Granite Business Solutions',
      date: 'March 15, 2025',
      amount: '$4,800.00',
      content: `GRANITE BUSINESS SOLUTIONS LLC
Invoice #: INV-GBS-2025-028
Date:      March 15, 2025
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description                               Amount
Custom analytics module development       $4,800.00
  Phase 1 deliverable per SOW dated 2/28/2025
  Completion date: March 14, 2025

Subtotal: $4,800.00
Tax:      $0.00
Total:    $4,800.00

Payment Terms: Net 15
Due Date: March 30, 2025
Paid: March 31, 2025 — ACH`,
    },
    // NOTE: No receipt file exists for INV-GBS-2025-028
    {
      path: 'Accounts_Payable/Vendors/Swift_Courier/INV-SCS-2025-088.pdf',
      type: 'invoice',
      invoiceNum: 'INV-SCS-2025-088',
      vendor: 'Swift Courier Services',
      date: 'January 14, 2025',
      amount: '$680.00',
      content: `SWIFT COURIER SERVICES
Invoice #: INV-SCS-2025-088
Date:      January 14, 2025
Bill To:   Crestline Consulting Group, Inc.

Description                               Amount
Document delivery — 4 packages             $680.00
  Destinations: Denver Metro area
  Service dates: Jan 8, 9, 13, 14 2025

Total: $680.00   Paid: January 31, 2025`,
    },
    {
      path: 'Accounts_Payable/Vendors/Swift_Courier/receipts_SCS_Q1_2025.pdf',
      type: 'policy',
      content: `SWIFT COURIER SERVICES — DELIVERY CONFIRMATIONS Q1 2025

INV-SCS-2025-088 ($680.00 — January 14 2025)
  4 packages delivered Jan 8/9/13/14. All confirmed delivered.
  Signed by recipients. Authorized: Tom Caruso.

INV-SCS-2025-101 ($720.00 — March 18 2025)
  5 packages delivered Mar 12/14/18. All confirmed delivered.
  Signed by recipients. Authorized: Tom Caruso.`,
    },
    {
      path: 'Accounts_Payable/Vendors/Swift_Courier/INV-SCS-2025-101.pdf',
      type: 'invoice',
      invoiceNum: 'INV-SCS-2025-101',
      vendor: 'Swift Courier Services',
      date: 'March 18, 2025',
      amount: '$720.00',
      content: `SWIFT COURIER SERVICES
Invoice #: INV-SCS-2025-101
Date:      March 18, 2025
Bill To:   Crestline Consulting Group, Inc.

Description                               Amount
Document delivery — 5 packages             $720.00
  Destinations: Denver Metro area + Boulder
  Service dates: Mar 12, 14, 18 2025

Total: $720.00   Paid: March 31, 2025`,
    },
    {
      path: 'Accounts_Payable/Vendors/Denver_Office_Cleaning/INV-DOC-2025-Q1.pdf',
      type: 'invoice',
      invoiceNum: 'INV-DOC-2025-Q1',
      vendor: 'Denver Office Cleaning Co.',
      date: 'March 31, 2025',
      amount: '$3,600.00',
      content: `DENVER OFFICE CLEANING CO.
Invoice #: INV-DOC-2025-Q1
Date:      March 31, 2025 (Quarterly Consolidated)
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description                               Amount
Weekly cleaning services — January 2025   $1,200.00
Weekly cleaning services — February 2025  $1,200.00
Weekly cleaning services — March 2025     $1,200.00

Subtotal: $3,600.00   Tax: $0.00   Total: $3,600.00
Contract Ref: DOC-CCG-2023-11 (Annual Contract)
Paid: March 31, 2025 — ACH`,
    },
    {
      path: 'Accounts_Payable/Vendors/Denver_Office_Cleaning/receipt_DOC_Q1_2025.pdf',
      type: 'policy',
      content: `DENVER OFFICE CLEANING CO. — SERVICE CONFIRMATIONS Q1 2025

January 2025: 4 weekly cleanings completed (Jan 3/10/17/24/31 — 5 visits)
  Confirmed by: Tom Caruso   Signature: [signed]

February 2025: 4 weekly cleanings completed (Feb 7/14/21/28)
  Confirmed by: Tom Caruso   Signature: [signed]

March 2025: 4 weekly cleanings completed (Mar 7/14/21/28)
  Confirmed by: Tom Caruso   Signature: [signed]

All services rendered per annual contract INV-DOC-CCG-2023-11.
Quarterly invoice consolidated per billing agreement.`,
    },

    // Accounts_Payable / Archive
    {
      path: 'Accounts_Payable/Archive/INV-MOS-2024-089.pdf',
      type: 'invoice',
      invoiceNum: 'INV-MOS-2024-089',
      vendor: 'Metro Office Supply',
      date: 'November 12, 2024',
      amount: '$1,875.00',
      content: `METRO OFFICE SUPPLY CO.
Invoice #: INV-MOS-2024-089
Date:      November 12, 2024
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description                          Qty    Unit     Total
Printer paper (case, 5000 sheets)      4  $38.50    $154.00
Ballpoint pens (box of 12)            10   $8.75     $87.50
Binders 3-inch (box of 6)             8   $24.50    $196.00
Toner cartridge HP LaserJet           6  $87.25    $523.50
Whiteboard markers (8-pack)           10   $12.40    $124.00
Hanging file folders (box of 25)      12   $15.25    $183.00
Miscellaneous supplies                         --    $607.00

Subtotal: $1,875.00   Tax: $0.00   Total: $1,875.00
STATUS: PAID — Q4 2024. Check #4298. Archived.`,
    },
    {
      path: 'Accounts_Payable/Archive/INV-CCT-2024-180.pdf',
      type: 'invoice',
      invoiceNum: 'INV-CCT-2024-180',
      vendor: 'CloudCore Technologies',
      date: 'December 3, 2024',
      amount: '$2,800.00',
      content: `CLOUDCORE TECHNOLOGIES
Invoice #: INV-CCT-2024-180
Date:      December 3, 2024
Bill To:   Crestline Consulting Group, Inc.

Description:                              Amount
Platform subscription — December 2024    $2,800.00
  Contract Ref: CCT-CRST-2021-04

Total: $2,800.00
STATUS: PAID — December 31 2024. ACH. Archived.`,
    },

    // ══════════════════════════════════════════
    //  ACCOUNTS_RECEIVABLE/
    // ══════════════════════════════════════════

    {
      path: 'Accounts_Receivable/Clients/Lakewood_Industries/INV-2025-001.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2025-001',
      vendor: 'Lakewood Industries',
      date: 'January 31, 2025',
      amount: '$68,400.00',
      content: `CRESTLINE CONSULTING GROUP, INC.
Invoice #: INV-2025-001
Date:      January 31, 2025
Bill To:   Lakewood Industries, Inc.
           Attn: CFO
           8200 Lakewood Drive, Denver, CO 80227

Services Rendered — January 2025:
  Operations Efficiency Assessment — Phase 2     $42,000.00
  Executive advisory retainer (monthly)          $18,000.00
  Workshop facilitation (3 sessions × $2,800)     $8,400.00

Subtotal: $68,400.00   Tax: $0.00   Total: $68,400.00

Payment Terms: Net 15
Due Date: February 15, 2025
Payment Received: February 15, 2025 — Wire Transfer`,
    },
    {
      path: 'Accounts_Receivable/Clients/Summit_Partners/INV-2025-002.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2025-002',
      vendor: 'Summit Partners LLC',
      date: 'January 15, 2025',
      amount: '$52,800.00',
      content: `CRESTLINE CONSULTING GROUP, INC.
Invoice #: INV-2025-002
Date:      January 15, 2025
Bill To:   Summit Partners LLC
           Attn: Managing Partner
           1650 Market Street, Suite 3600, Denver, CO 80202

Services Rendered — January 2025:
  Strategic planning facilitation                $36,000.00
  Market analysis report                         $12,000.00
  Client interviews (8 × $600)                    $4,800.00

Subtotal: $52,800.00   Tax: $0.00   Total: $52,800.00

Payment Terms: Net 15
Due Date: January 30, 2025
Payment Received: January 28, 2025 — ACH`,
    },
    {
      path: 'Accounts_Receivable/Clients/Briar_Ridge_Corp/INV-2025-003.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2025-003',
      vendor: 'Briar Ridge Corp',
      date: 'February 28, 2025',
      amount: '$38,500.00',
      content: `CRESTLINE CONSULTING GROUP, INC.
Invoice #: INV-2025-003
Date:      February 28, 2025
Bill To:   Briar Ridge Corp
           Attn: VP Operations
           4400 Briar Ridge Blvd, Englewood, CO 80111

Services Rendered — February 2025:
  Process redesign consulting                    $28,500.00
  Change management workshop                      $7,000.00
  Follow-up documentation                         $3,000.00

Subtotal: $38,500.00   Tax: $0.00   Total: $38,500.00

Payment Terms: Net 10
Due Date: March 10, 2025
Payment Received: March 10, 2025 — Check #88241`,
    },
    {
      path: 'Accounts_Receivable/Clients/Westfield_Properties/INV-2025-004.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2025-004',
      vendor: 'Westfield Properties Group',
      date: 'March 15, 2025',
      amount: '$41,000.00',
      content: `CRESTLINE CONSULTING GROUP, INC.
Invoice #: INV-2025-004
Date:      March 15, 2025
Bill To:   Westfield Properties Group
           Attn: CEO
           9900 E. Hampden Ave, Aurora, CO 80014

Services Rendered — March 2025:
  Asset management strategy review               $24,000.00
  Financial modeling & scenario analysis         $13,500.00
  Executive presentation                          $3,500.00

Subtotal: $41,000.00   Tax: $0.00   Total: $41,000.00

Payment Terms: Net 7
Due Date: March 22, 2025
Payment Received: March 22, 2025 — Wire Transfer`,
    },
    {
      path: 'Accounts_Receivable/Clients/GreenPath_Solutions/INV-2025-005.pdf',
      type: 'invoice',
      invoiceNum: 'INV-2025-005',
      vendor: 'GreenPath Solutions',
      date: 'February 15, 2025',
      amount: '$24,800.00',
      content: `CRESTLINE CONSULTING GROUP, INC.
Invoice #: INV-2025-005
Date:      February 15, 2025
Bill To:   GreenPath Solutions Inc.
           Attn: COO
           2200 Blake Street, Denver, CO 80205

Services Rendered — February 2025:
  Sustainability reporting framework design       $18,000.00
  Stakeholder interview analysis                   $4,800.00
  Report drafting & review                         $2,000.00

Subtotal: $24,800.00   Tax: $0.00   Total: $24,800.00

Payment Terms: Net 15
Due Date: March 1, 2025
Payment Received: February 28, 2025 — ACH`,
    },
    {
      path: 'Accounts_Receivable/Clients/Harrington_Capital/INV-HCG-2025-006.pdf',
      type: 'invoice',
      invoiceNum: 'INV-HCG-2025-006',
      vendor: 'Harrington Capital Management',
      date: 'March 31, 2025',
      amount: '$28,500.00',
      content: `CRESTLINE CONSULTING GROUP, INC.
Invoice #: INV-HCG-2025-006
Date:      March 31, 2025
Bill To:   Harrington Capital Management LLC
           Attn: CFO
           1700 Lincoln Street, Suite 2800, Denver, CO 80203

Services to be Rendered — Q2 2025 Engagement:
  Portfolio optimization consulting retainer      $28,500.00
  Service Period: April 1, 2025 – June 30, 2025
  Deliverables: Monthly advisory sessions (3) + final report
  Per engagement agreement HCG-CCG-2025-Q2 signed March 28, 2025

Pre-payment received: March 28, 2025 — Wire Transfer $28,500.00

Note: This invoice covers Q2 2025 services only.
Work commences April 1, 2025.`,
    },
    {
      path: 'Accounts_Receivable/Disputes/dispute_Briar_Ridge_Oct2024.pdf',
      type: 'policy',
      content: `[RESOLVED — ARCHIVED]
EMAIL THREAD: Briar Ridge Corp — Invoice Dispute — October 2024

Oct 14 2024: Briar Ridge disputes INV-2024-031 ($22,400). Claims scope not
delivered per SOW. Requests $4,000 credit.

Oct 18 2024 (Crestline response): Scope was delivered per SOW Section 3.2.
Attaching project completion sign-off dated Oct 3, 2024. No credit warranted.

Oct 22 2024 (Briar Ridge): Accepts position. Invoice INV-2024-031 paid in full
Nov 1, 2024. Check #87190.

STATUS: Resolved. Payment confirmed. No open balance.`,
    },

    // ══════════════════════════════════════════
    //  BANKING/
    // ══════════════════════════════════════════

    {
      path: 'Banking/Statements/bank_statement_jan_2025.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — First Mountain Bank — Account #XXXX-4892
Statement Period: January 1 – January 31 2025,,,,
Date,Description,Debit,Credit,Balance
2025-01-01,Opening Balance,,,260000.00
2025-01-28,WIRE IN - SUMMIT PARTNERS INV-2025-002,,52800.00,312800.00
2025-01-31,ACH OUT - PAYROLL JAN 2025 PR-JAN-2025,63916.00,,248884.00
2025-01-31,ACH OUT - 1400 16TH ST RENT JAN,4200.00,,244684.00
2025-01-31,ACH OUT - HARTFORD INS JAN,1800.00,,242884.00
2025-01-31,ACH OUT - XCEL ENERGY JAN UTIL,600.00,,242284.00
2025-01-31,ACH OUT - CLOUDCORE TECH INV-CCT-2025-017,2800.00,,239484.00
2025-01-31,ACH OUT - SWIFT COURIER INV-SCS-2025-088,680.00,,238804.00
CLOSING BALANCE JAN 31 2025,,,,238804.00`,
    },
    {
      path: 'Banking/Statements/bank_statement_feb_2025.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — First Mountain Bank — Account #XXXX-4892
Statement Period: February 1 – February 28 2025,,,,
Date,Description,Debit,Credit,Balance
2025-02-01,Opening Balance,,,238804.00
2025-02-15,WIRE IN - LAKEWOOD INDUSTRIES INV-2025-001,,68400.00,307204.00
2025-02-28,ACH IN - GREENPATH SOLUTIONS INV-2025-005,,24800.00,332004.00
2025-02-28,ACH OUT - PAYROLL FEB 2025 PR-FEB-2025,63916.00,,268088.00
2025-02-28,ACH OUT - 1400 16TH ST RENT FEB,4200.00,,263888.00
2025-02-28,ACH OUT - XCEL ENERGY FEB UTIL,600.00,,263288.00
2025-02-28,ACH OUT - CLOUDCORE TECH INV-CCT-2025-031,2800.00,,260488.00
2025-02-28,CHECK #4421 - METRO OFFICE SUPPLY INV-MOS-2025-112,1850.00,,258638.00
CLOSING BALANCE FEB 28 2025,,,,258638.00`,
    },
    {
      path: 'Banking/Statements/bank_statement_mar_2025.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — First Mountain Bank — Account #XXXX-4892
Statement Period: March 1 – March 31 2025,,,,
Date,Description,Debit,Credit,Balance
2025-03-01,Opening Balance,,,258638.00
2025-03-10,CHECK IN - BRIAR RIDGE CORP INV-2025-003,,38500.00,297138.00
2025-03-22,WIRE IN - WESTFIELD PROPERTIES INV-2025-004,,41000.00,338138.00
2025-03-28,WIRE IN - HARRINGTON CAPITAL INV-HCG-2025-006,,28500.00,366638.00
2025-03-31,ACH OUT - PAYROLL MAR 2025 PR-MAR-2025,63918.00,,302720.00
2025-03-31,ACH OUT - 1400 16TH ST RENT MAR,4200.00,,298520.00
2025-03-31,ACH OUT - XCEL ENERGY MAR UTIL,600.00,,297920.00
2025-03-31,ACH OUT - CLOUDCORE TECH INV-CCT-2025-044,2800.00,,295120.00
2025-03-31,ACH OUT - GRANITE BUS SOLUTIONS INV-GBS-2025-028,4800.00,,290320.00
2025-03-31,ACH OUT - SWIFT COURIER INV-SCS-2025-101,720.00,,289600.00
2025-03-31,ACH OUT - DENVER OFFICE CLEANING INV-DOC-2025-Q1,3600.00,,285999.00
2025-03-31,ACH OUT - HARTFORD INS Q2 PREPAID,5400.00,,280599.00
CLOSING BALANCE MAR 31 2025,,,,280599.00`,
    },
    {
      path: 'Banking/Reconciliation/reconciliation_Q4_2024_partial.csv',
      type: 'ledger',
      content: `BANK RECONCILIATION — Q4 2024 (PARTIAL — NOT FINALIZED)
Prepared by: Daniel Park    Status: DRAFT — Do not use for Q1 audit
,,,
Item,Per Bank,Per GL,Difference
Opening balance Oct 1 2024,241850.00,241850.00,0.00
Q4 receipts,251800.00,251800.00,0.00
Q4 disbursements (payroll),-186400.00,-186400.00,0.00
Q4 disbursements (other),-47250.00,-47250.00,0.00
Closing balance Dec 31 2024,260000.00,260000.00,0.00
,,,
NOTE: One check (#4412 $1,250 to Briar Ridge refund) cleared Jan 3 2025.
Outstanding item — needs Q1 reconciliation treatment.
THIS DOCUMENT IS A DRAFT. Final Q4 reconciliation filed with auditors Feb 2025.`,
    },

    // ══════════════════════════════════════════
    //  FINANCE / GENERAL_LEDGER  —  chart of accounts
    // ══════════════════════════════════════════

    {
      path: 'Finance/General_Ledger/chart_of_accounts.csv',
      type: 'ledger',
      content: `Account_Code,Account_Name,Type,Normal_Balance
1000,Cash & Cash Equivalents,Asset,Debit
1100,Accounts Receivable,Asset,Debit
1200,Prepaid Expenses,Asset,Debit
1500,Equipment,Asset,Debit
1510,Accumulated Depreciation,Contra-Asset,Credit
2000,Accounts Payable,Liability,Credit
2100,Accrued Liabilities,Liability,Credit
2200,Deferred Revenue,Liability,Credit
3000,Common Stock,Equity,Credit
3100,Retained Earnings,Equity,Credit
4000,Consulting Fee Revenue,Revenue,Credit
5100,Payroll & Benefits,Expense,Debit
5200,Rent Expense,Expense,Debit
5300,Insurance Expense,Expense,Debit
5400,Utilities,Expense,Debit
5500,Software & IT Services,Expense,Debit
5600,Office Supplies,Expense,Debit
5700,Courier & Shipping,Expense,Debit
5800,Facilities (Cleaning),Expense,Debit
5900,Professional Services,Expense,Debit
5950,Depreciation Expense,Expense,Debit`,
    },

    // ══════════════════════════════════════════
    //  FINANCE / BUDGET
    // ══════════════════════════════════════════

    {
      path: 'Finance/Budget/budget_vs_actual_Q1_2025.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — Q1 2025 Budget vs. Actual,,,
Account,Budget,Actual,Variance
REVENUE,,,,
Consulting Fees,270000.00,265500.00,-4500.00
Total Revenue,270000.00,265500.00,-4500.00
,,,,
OPERATING EXPENSES,,,,
Payroll & Benefits,190250.00,191750.00,-1500.00
Rent,12600.00,12600.00,0.00
Insurance,5400.00,5400.00,0.00
Utilities,1800.00,1800.00,0.00
Software & IT Services,8400.00,8400.00,0.00
Office Supplies,2000.00,1850.00,150.00
Consulting Services Purchased,0.00,4800.00,-4800.00
Courier & Shipping,1200.00,1400.00,-200.00
Facilities (Cleaning),3600.00,3600.00,0.00
Total Operating Expenses,225250.00,231600.00,-6350.00
,,,,
Net Income,44750.00,33900.00,-10850.00
,,,,
NOTE: Payroll budget derived from offer-letter salaries as of Jan 1 2025.
Actual payroll variance of $1500 requires line-item review.
Consulting Services Purchased (Granite) was unbudgeted.`,
    },

    // ══════════════════════════════════════════
    //  FINANCE / FIXED ASSETS
    // ══════════════════════════════════════════

    {
      path: 'Finance/Fixed_Assets/asset_register_Q1_2025.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — Fixed Asset Register — As of March 31 2025,,,,,
Asset_ID,Description,Acquisition_Date,Cost,Accum_Depreciation_Dec31_2024,Accum_Depreciation_Mar31_2025,Net_Book_Value_Mar31_2025
FA-001,Dell PowerEdge Server,2021-03-15,18000.00,9000.00,9900.00,8100.00
FA-002,Cisco Network Equipment,2021-03-15,8000.00,4000.00,4400.00,3600.00
FA-003,Workstations x8 (Dell OptiPlex),2022-06-01,24000.00,8000.00,9200.00,14800.00
FA-004,Office Furniture — Suite 600,2018-09-01,22000.00,15400.00,15675.00,6325.00
FA-005,HP LaserJet Pro Printers x3,2023-01-10,6000.00,1200.00,1500.00,4500.00
FA-006,Conference Room AV System,2023-08-01,12000.00,2000.00,2500.00,9500.00
TOTALS,,,90000.00,39600.00,43175.00,46825.00
,,,,,,
Depreciation Method: Straight-line
Q1 2025 Depreciation Expense: $3575.00
NOTE: Balance sheet shows Equipment net = $42000. Difference of $4825 vs register total
requires reconciliation — register may exclude fully depreciated items written off in 2024.`,
    },

    // ══════════════════════════════════════════
    //  BANKING / RECONCILIATION — Q1 2025
    // ══════════════════════════════════════════

    {
      path: 'Banking/Reconciliation/reconciliation_Q1_2025.csv',
      type: 'ledger',
      content: `BANK RECONCILIATION — Q1 2025
Client: Crestline Consulting Group Inc.     Account: First Mountain Bank #XXXX-4892
Prepared by: Daniel Park (VP Finance)       Date Prepared: April 2 2025
,,,
BANK SIDE,,,
Bank statement ending balance (Mar 31 2025),$280599.00,,
Add: Deposits in transit,$0.00,,
Less: Outstanding checks,$0.00,,
Adjusted bank balance,$280599.00,,
,,,
BOOK SIDE (per GL),,,
GL cash balance (per trial balance),$285999.00,,
Less: Hartford Insurance Q2 Prepaid — bank debit 3/31 not yet posted to GL cash,$-5400.00,,
Adjusted book balance,$280599.00,,
,,,
Reconciled difference,$0.00,,
,,,
NOTES:,,,
1. Hartford Ins Q2 premium ($5400) deducted from bank Mar 31. GL entry recorded as
   Dr Prepaid Insurance / Cr Accounts Payable rather than Cr Cash. Correcting entry
   required: Dr Accounts Payable $5400 / Cr Cash $5400. AP balance per GL is understated
   by $5400 and Cash is overstated by $5400 until correction is posted.
2. All Q1 client receipts confirmed to bank deposits.
3. Granite INV-GBS-2025-028 ($4800) appears as AP on balance sheet — confirmed paid
   via bank on 3/31 (see bank statement). AP should be zero post-payment.
   Possible timing: payment posted to bank 3/31 but AP not relieved until April.`,
    },

    // ══════════════════════════════════════════
    //  ACCOUNTS RECEIVABLE / AGING
    // ══════════════════════════════════════════

    {
      path: 'Accounts_Receivable/Aging/ar_aging_Q1_2025.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — AR Aging Report — As of March 31 2025,,,,
Client,Invoice,Invoice_Date,Amount,Status,Payment_Date,Days_Outstanding
Lakewood Industries,INV-2025-001,2025-01-31,68400.00,PAID,2025-02-15,15
Summit Partners LLC,INV-2025-002,2025-01-15,52800.00,PAID,2025-01-28,13
Briar Ridge Corp,INV-2025-003,2025-02-28,38500.00,PAID,2025-03-10,10
Westfield Properties Group,INV-2025-004,2025-03-15,41000.00,PAID,2025-03-22,7
GreenPath Solutions,INV-2025-005,2025-02-15,24800.00,PAID,2025-02-28,13
Harrington Capital Management,INV-HCG-2025-006,2025-03-31,28500.00,PAID,2025-03-28,0
,,,,,,
TOTAL BILLED Q1 2025,,$253900.00,,,
TOTAL COLLECTED,,$253900.00,,,
OUTSTANDING AT MAR 31 2025,,$0.00,,,
,,,,,,
NOTE: INV-HCG-2025-006 payment received March 28 — three days before invoice date of
March 31. Payment precedes invoice date. Verify service period and revenue recognition
timing for this engagement.`,
    },

    // ══════════════════════════════════════════
    //  ACCOUNTS PAYABLE / AGING
    // ══════════════════════════════════════════

    {
      path: 'Accounts_Payable/Aging/ap_aging_Q1_2025.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — AP Aging Report — As of March 31 2025,,,,
Vendor,Invoice,Invoice_Date,Due_Date,Amount,Status,Days_Overdue
CloudCore Technologies,INV-CCT-2025-017,2025-01-03,2025-02-02,2800.00,PAID,0
CloudCore Technologies,INV-CCT-2025-031,2025-02-03,2025-03-05,2800.00,PAID,0
CloudCore Technologies,INV-CCT-2025-044,2025-03-03,2025-04-02,2800.00,PAID,0
Metro Office Supply,INV-MOS-2025-112,2025-02-01,2025-03-03,1850.00,PAID,0
Granite Business Solutions,INV-GBS-2025-028,2025-03-15,2025-03-30,4800.00,OUTSTANDING,1
Swift Courier,INV-SCS-2025-088,2025-01-20,2025-02-19,680.00,PAID,0
Swift Courier,INV-SCS-2025-101,2025-03-15,2025-04-14,720.00,PAID,0
Denver Office Cleaning,INV-DOC-2025-Q1,2025-01-02,2025-01-31,3600.00,PAID,0
Peak Telecom,INV-PT-2025-Jan,2025-01-05,2025-02-04,350.00,PAID,0
Peak Telecom,INV-PT-2025-Feb,2025-02-05,2025-03-07,350.00,PAID,0
Peak Telecom,INV-PT-2025-Mar,2025-03-05,2025-04-04,350.00,PAID,0
,,,,,,
TOTAL OUTSTANDING,,$4800.00,,,
NOTE: Granite INV-GBS-2025-028 — no receipt on file. Payment processed via bank ACH
Mar 31 but supporting documentation (receipt/delivery confirmation) not located.`,
    },

    // ══════════════════════════════════════════
    //  HR — Renata Vasquez performance review (no I-9 in folder)
    // ══════════════════════════════════════════

    {
      path: 'HR/Employees/Renata_Vasquez/performance_review_2024.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
ANNUAL PERFORMANCE REVIEW — 2024

Employee:   Renata Vasquez
Title:      Senior Consultant
Department: Consulting
Reviewer:   Sarah Mitchell (CEO)
Review Date: December 12, 2024
Review Period: January 1 – December 31, 2024

OVERALL RATING: Exceeds Expectations (4.2 / 5.0)

PERFORMANCE SUMMARY
Renata delivered exceptional client outcomes in 2024, most notably on the
Westfield Properties operational efficiency project and the GreenPath Q3 engagement.
Client satisfaction scores averaged 4.6/5.0 across seven billable engagements.
Renata consistently meets billing targets and has taken on informal mentoring
responsibilities with the two associate consultants.

KEY ACCOMPLISHMENTS
- Led Westfield Properties 3-month engagement (billed $38,200), delivered on time
- Developed new cost-structure analysis framework adopted firm-wide
- Mentored Jordan Lee through their first solo client presentation
- Completed LEAN Six Sigma Green Belt certification (August 2024)

AREAS FOR DEVELOPMENT
- Proposal writing: Drafts are thorough but benefit from earlier partner review
- Business development: Goal for 2025 is participation in two RFP responses

COMPENSATION RECOMMENDATION
Merit increase: 3.5% effective January 1, 2025.
Revised monthly salary: $9,583.00 (from $9,250.00)

Signed: Sarah Mitchell (CEO)         Date: December 12, 2024
Acknowledged: Renata Vasquez         Date: December 14, 2024

─────────────────────────────────────────────────────────────
DOCUMENTS ON FILE IN THIS FOLDER: offer_letter.pdf
NOTE TO HR: I-9 and W-2 documents not found in this personnel folder.
Please locate and file before Q1 2025 audit date.
─────────────────────────────────────────────────────────────`,
    },

    // ══════════════════════════════════════════
    //  HR — I-9 tracking log
    // ══════════════════════════════════════════

    {
      path: 'HR/Compliance/I9_tracking_log.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — I-9 Employment Eligibility Verification Log,,,,
As of: March 31 2025     Maintained by: Daniel Park (VP Finance),,,,
Employee_ID,Name,Start_Date,I9_Status,I9_File_Location,Last_Verified
EMP-001,Sarah Mitchell,2018-09-01,COMPLETE,HR/Employees/Sarah_Mitchell/I-9.pdf,2024-01-15
EMP-002,Daniel Park,2019-03-01,COMPLETE,HR/Employees/Daniel_Park/I-9.pdf,2024-01-15
EMP-003,Renata Vasquez,2020-06-15,MISSING — NOT ON FILE,LOCATION UNKNOWN,NEVER VERIFIED
EMP-004,Marcus Webb,2021-04-01,COMPLETE,HR/Employees/Marcus_Webb/I-9.pdf,2024-01-15
EMP-005,Jordan Lee,2022-08-15,COMPLETE,HR/Employees/Jordan_Lee/I-9.pdf,2024-01-15
EMP-006,Priya Sharma,2021-12-01,COMPLETE,HR/Employees/Priya_Sharma/I-9.pdf,2024-01-15
EMP-007,Tom Caruso,2019-11-01,COMPLETE,HR/Employees/Tom_Caruso/I-9.pdf,2024-01-15
,,,,,,
Compliance Status: 6/7 employees verified. 1 CRITICAL DEFICIENCY.
NOTE: EMP-003 Renata Vasquez I-9 has never been located. Employee has been with firm
since June 2020. This represents a potential IRCA compliance violation. Immediate
action required to obtain valid I-9 or determine if original was lost.`,
    },

    // ══════════════════════════════════════════
    //  CONTRACTS — Harrington Capital Group
    // ══════════════════════════════════════════

    {
      path: 'Contracts/Harrington_Capital_Group/MSA_HCG_2024.pdf',
      type: 'policy',
      content: `MASTER SERVICES AGREEMENT
Between: Crestline Consulting Group, Inc. ("Consultant")
And:     Harrington Capital Management LLC ("Client")
Effective Date: July 1, 2024

1. SCOPE OF SERVICES
Consultant will provide strategic and operational consulting services to Client
as described in individual Statements of Work ("SOW") executed under this Agreement.
Each SOW shall specify the services, deliverables, timeline, and fees.

2. FEES AND PAYMENT
Fees shall be as specified in each SOW. Client shall pay undisputed invoices
within Net 30 of invoice date. Prepayment is permitted and encouraged for
retainer arrangements.

3. TERM
This Agreement is effective July 1, 2024 and continues for 24 months unless
earlier terminated by either party with 60 days written notice.

4. CONFIDENTIALITY
Both parties agree to maintain strict confidentiality of all proprietary and
financial information exchanged under this Agreement.

5. GOVERNING LAW
This Agreement is governed by the laws of the State of Colorado.

Signed: Sarah Mitchell, CEO — Crestline Consulting Group    Date: June 28, 2024
Signed: R. Harrington, Managing Partner — Harrington Capital  Date: June 29, 2024`,
    },

    {
      path: 'Contracts/Harrington_Capital_Group/SOW_HCG_Q2_2025.pdf',
      type: 'policy',
      content: `STATEMENT OF WORK — SOW-HCG-2025-002
Pursuant to Master Services Agreement dated July 1 2024

Client:     Harrington Capital Management LLC
Consultant: Crestline Consulting Group, Inc.
Prepared:   March 10, 2025
Executed:   March 14, 2025

1. PROJECT DESCRIPTION
Portfolio Optimization Retainer — Q2 2025 Engagement
Crestline will provide ongoing strategic advisory services to support Harrington
Capital's portfolio company operations, including cost structure reviews,
operational efficiency assessments, and M&A due diligence support.

2. SERVICE PERIOD
April 1, 2025 – June 30, 2025 (Q2 2025 only)
Services commence on or after April 1 2025. No services are to be rendered
prior to the start date. This SOW supersedes any informal discussions regarding
a Q1 2025 pre-engagement.

3. DELIVERABLES
- Monthly status reports (April, May, June)
- Final portfolio optimization summary (due June 27, 2025)
- Ad hoc advisory calls as requested (up to 12 hours/month)

4. FEES
Retainer fee: $28,500.00 (fixed, covers full Q2 2025 period)
Invoicing: Crestline may invoice in advance of the service period.
Payment received prior to April 1 2025 shall be treated as a deposit
against Q2 services.

5. AUTHORIZED SIGNATURES
Signed: Sarah Mitchell, CEO — Crestline Consulting Group    Date: March 14, 2025
Signed: R. Harrington, Managing Partner — Harrington Capital  Date: March 14, 2025`,
    },

    // ══════════════════════════════════════════
    //  CONTRACTS — CloudCore Technologies
    // ══════════════════════════════════════════

    {
      path: 'Contracts/CloudCore_Technologies/subscription_agreement_2024.pdf',
      type: 'policy',
      content: `SUBSCRIPTION AGREEMENT
Between: CloudCore Technologies Inc. ("Vendor")
And:     Crestline Consulting Group, Inc. ("Customer")
Contract Reference: CCT-CRST-2021-04 (Renewal)
Renewal Date: January 1, 2024

1. SERVICES
Vendor grants Customer a non-exclusive license to access and use CloudCore's
project management and analytics suite ("Platform") for up to 20 named users.

2. FEES
Monthly subscription fee: $2,800.00
Billed monthly in arrears. Invoiced on the first business day of each month
for the prior month's service.

3. TERM
January 1, 2024 – December 31, 2024 (auto-renews annually unless cancelled
with 60 days notice).

4. SUPPORT
Standard business hours support included. 99.5% uptime SLA.

Signed: CloudCore Technologies    Date: December 18, 2023
Signed: Sarah Mitchell (CEO)      Date: December 20, 2023`,
    },

    // ══════════════════════════════════════════
    //  INTERNAL MEMOS
    // ══════════════════════════════════════════

    {
      path: 'Internal_Memos/memo_ADJ_Q1_001_approval.pdf',
      type: 'policy',
      content: `INTERNAL MEMORANDUM

To:     Sarah Mitchell, President & CEO
From:   Daniel Park, VP Finance
Date:   March 31, 2025
Re:     Revenue Adjustment — ADJ-Q1-001 ($11,600)

Sarah,

Per our discussion on March 28, I am requesting your written approval to record
the following adjusting journal entry before we close the Q1 2025 books:

  Entry Reference: ADJ-Q1-001
  Date:            March 31, 2025
  Debit:           Accounts Receivable    $11,600.00
  Credit:          Consulting Fee Revenue $11,600.00
  Description:     Q1 2025 revenue accrual — retainer performance component

RATIONALE
Three client engagements contain variable/performance-based fee components that
have been earned during Q1 but for which formal invoices have not yet been
issued. Based on work completion assessments, management has determined these
fees to be realizable and is accruing them to Q1 per our revenue recognition
policy.

Supporting client engagement summaries are maintained in my files.
No formal invoices or signed client acknowledgements have been issued as of
this date.

Please sign below to authorize posting.

Approved: Sarah Mitchell           Date: March 31, 2025
          President & CEO

Daniel Park
VP Finance`,
    },

    // ══════════════════════════════════════════
    //  ACCOUNTS PAYABLE — Peak Telecom
    // ══════════════════════════════════════════

    {
      path: 'Accounts_Payable/Vendors/Peak_Telecom/INV-PT-2025-Jan.pdf',
      type: 'invoice',
      invoiceNum: 'INV-PT-2025-Jan',
      vendor: 'Peak Telecom LLC',
      date: 'January 5, 2025',
      amount: '$350.00',
      content: `PEAK TELECOM LLC
Invoice #: INV-PT-2025-Jan
Date:      January 5, 2025
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description                               Amount
Business internet — January 2025          $290.00
  (500 Mbps fiber, Suite 600)
Business phone lines x2 — January 2025   $60.00

Subtotal:  $350.00
Tax:       $0.00
Total:     $350.00

Account #: PT-CC-0441
Payment Terms: Net 30 | Due: February 4, 2025
Status: PAID — Check #4428 received Feb 3 2025`,
    },

    {
      path: 'Accounts_Payable/Vendors/Peak_Telecom/INV-PT-2025-Feb.pdf',
      type: 'invoice',
      invoiceNum: 'INV-PT-2025-Feb',
      vendor: 'Peak Telecom LLC',
      date: 'February 5, 2025',
      amount: '$350.00',
      content: `PEAK TELECOM LLC
Invoice #: INV-PT-2025-Feb
Date:      February 5, 2025
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description                               Amount
Business internet — February 2025         $290.00
  (500 Mbps fiber, Suite 600)
Business phone lines x2 — February 2025  $60.00

Subtotal:  $350.00
Tax:       $0.00
Total:     $350.00

Account #: PT-CC-0441
Payment Terms: Net 30 | Due: March 7, 2025
Status: PAID — Check #4435 received Mar 5 2025`,
    },

    {
      path: 'Accounts_Payable/Vendors/Peak_Telecom/INV-PT-2025-Mar.pdf',
      type: 'invoice',
      invoiceNum: 'INV-PT-2025-Mar',
      vendor: 'Peak Telecom LLC',
      date: 'March 5, 2025',
      amount: '$350.00',
      content: `PEAK TELECOM LLC
Invoice #: INV-PT-2025-Mar
Date:      March 5, 2025
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description                               Amount
Business internet — March 2025            $290.00
  (500 Mbps fiber, Suite 600)
Business phone lines x2 — March 2025     $60.00

Subtotal:  $350.00
Tax:       $0.00
Total:     $350.00

Account #: PT-CC-0441
Payment Terms: Net 30 | Due: April 4, 2025
Status: PAID — Check #4441 received Apr 2 2025`,
    },

    // ══════════════════════════════════════════
    //  ACCOUNTS RECEIVABLE / DISPUTES — dispute log
    // ══════════════════════════════════════════

    {
      path: 'Accounts_Receivable/Disputes/dispute_log_Q1_2025.csv',
      type: 'ledger',
      content: `Crestline Consulting Group — AR Dispute Log — Q1 2025 Update,,,,
Dispute_ID,Client,Invoice,Disputed_Amount,Dispute_Date,Resolution,Resolution_Date,Notes
DISP-2024-001,Briar Ridge Corp,INV-2024-BR-009,8500.00,2024-10-15,SETTLED — full payment,2025-03-10,Client disputed scope of Oct 2024 deliverable. Resolved after revised scope memo. Full $38500 (Q1 2025 inv) paid Mar 10.
DISP-2024-002,Summit Partners LLC,N/A,0.00,2024-11-20,WITHDRAWN — client error,2024-12-01,Summit raised billing query on Q3 hours. Confirmed timesheets correct. Dispute withdrawn.
,,,,,,
Open disputes as of March 31 2025: NONE
Total disputed Q1 2025: $0`,
    },

    // ══════════════════════════════════════════
    //  FINANCE / STATEMENTS — notes to financials
    // ══════════════════════════════════════════

    {
      path: 'Finance/Statements/Q1_2025/notes_to_financial_statements.pdf',
      type: 'policy',
      content: `CRESTLINE CONSULTING GROUP, INC.
NOTES TO INTERIM FINANCIAL STATEMENTS
Q1 2025 (January 1 – March 31, 2025)
Prepared by: Daniel Park, VP Finance    Date: April 1, 2025

NOTE 1 — BASIS OF PRESENTATION
These interim financial statements have been prepared on the accrual basis of
accounting in accordance with U.S. GAAP. All adjusting entries through March 31
have been included.

NOTE 2 — REVENUE RECOGNITION
Consulting fee revenue is recognized when (or as) performance obligations are
satisfied. For time-and-materials engagements, revenue is recognized as services
are rendered. For fixed-fee retainers, revenue is recognized ratably over the
service period.

Q1 2025 included one adjusting entry to revenue (ADJ-Q1-001, $11,600) representing
management's estimate of earned but unbilled retainer fee components. See
Internal_Memos/memo_ADJ_Q1_001_approval.pdf for authorization.

NOTE 3 — PAYROLL
Q1 2025 payroll totaled $191,750 for seven employees. Payroll is processed via
ACH through First Mountain Bank. Individual compensation details are maintained
in HR/Employees/ and Finance/Payroll/.

NOTE 4 — ACCOUNTS PAYABLE
As of March 31, 2025, accounts payable of $4,800 represents one outstanding
vendor invoice (Granite Business Solutions INV-GBS-2025-028). All other vendor
invoices were settled within payment terms.

NOTE 5 — PREPAID EXPENSES
Prepaid expenses of $5,400 represent Q2 2025 commercial general liability
insurance premium paid to Hartford Financial Services on March 31, 2025.

NOTE 6 — EQUIPMENT
Equipment (net) of $42,000 reflects office and technology assets net of
accumulated depreciation. See Finance/Fixed_Assets/ for detail.

NOTE 7 — SUBSEQUENT EVENTS
None identified through April 1, 2025.`,
    },

    // ══════════════════════════════════════════
    //  HR POLICIES — travel reimbursement
    // ══════════════════════════════════════════

    {
      path: 'HR/Policies/travel_reimbursement_policy.pdf',
      type: 'policy',
      content: `CRESTLINE CONSULTING GROUP, INC.
TRAVEL & EXPENSE REIMBURSEMENT POLICY
Effective: January 1, 2023    Last Revised: January 1, 2025

1. PURPOSE
To establish standards for reimbursing employees for business travel and other
legitimate business expenses incurred on behalf of the company.

2. GENERAL REQUIREMENTS
All expenses must be:
- Reasonable and necessary for business purposes
- Supported by original receipts (required for all expenses over $25)
- Submitted via expense report within 30 days of incurrence
- Approved by direct supervisor prior to submission (VP-level and above:
  approved by CEO)

3. AIRFARE & TRANSPORTATION
- Coach class required for domestic flights under 5 hours
- Business class permitted for international flights over 6 hours
- Car rental: compact/mid-size unless 3+ passengers
- Personal vehicle: reimbursed at current IRS standard mileage rate

4. LODGING
- Hotel stays: reimbursed at actual cost not to exceed $225/night domestic
- Extended stays (>5 nights): pre-approval required from VP Finance

5. MEALS
- Meals while traveling: up to $85/day per diem
- Client entertainment: up to $150/person with prior approval
- Alcohol: not reimbursable unless part of approved client entertainment

6. NON-REIMBURSABLE EXPENSES
- Personal entertainment, personal care items
- Traffic/parking violations
- Expenses for spouse/partner unless specific client event
- First-class or business-class upgrades (domestic)

7. RECEIPT REQUIREMENTS
Receipts must clearly show: vendor name, date, itemized charges, total amount.
Credit card statements are NOT acceptable as sole documentation.

Approved by: Sarah Mitchell (CEO)    Date: January 1, 2025`,
    },

    // ══════════════════════════════════════════
    //  GRANITE BUSINESS SOLUTIONS — vendor registration
    // ══════════════════════════════════════════

    {
      path: 'Accounts_Payable/Vendors/Granite_Business_Solutions/vendor_registration.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP — VENDOR REGISTRATION RECORD

Vendor Name:    Granite Business Solutions LLC
Vendor ID:      VND-0034
Added to System: February 28, 2025
Added By:       Daniel Park (VP Finance)

CONTACT INFORMATION
Primary Contact: J. Whitmore
Email:           jwhitmore@granitebizsolutions.com
Phone:           (720) 555-0198
Address:         4820 Pecos Street, Denver, CO 80211

SERVICES PROVIDED
Custom analytics and data module development (per SOW)

TAX INFORMATION
EIN on file:     Yes (W-9 received Feb 28 2025)
1099 Required:   Yes

CONTRACTS ON FILE
Master Services Agreement: NONE
Statement of Work: SOW dated February 28 2025 (referenced on INV-GBS-2025-028)
  — Note: SOW document not located in vendor folder. Only invoice on file.

PAYMENT HISTORY
INV-GBS-2025-028  $4,800.00  Paid Mar 31 2025 via ACH

NOTES
New vendor — first engagement Q1 2025. No prior relationship.
Receipt/delivery confirmation for Phase 1 deliverable not on file.
Vendor was added and invoice paid within the same quarter with no formal
procurement approval on file. Standard vendor onboarding checklist not completed.`,
    },

  ],

  rubric: [
    {
      n: 1,
      text: 'Identifies the salary discrepancy for Priya Sharma: offer letter (HR/Employees/Priya_Sharma/offer_letter.pdf) states $6,000/month; pay stubs (Finance/Payroll/pay_stubs_Q1_2025.csv) show $6,500/month. Q1 overpayment of $1,500. Documents in Tab 1 with both source files cited.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 2,
      text: 'Flags the missing I-9 for Renata Vasquez: HR/Employees/Renata_Vasquez/ contains only an offer letter — no I-9 file. W-2 and payroll records confirm she is an active employee. Documents in Tab 1.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 3,
      text: 'Identifies the revenue mismatch: income statement (Finance/Statements/Q1_2025/income_statement.csv) shows $265,500; the five supported Q1 client invoices total $253,900 ($68,400 + $52,800 + $38,500 + $41,000 + $24,800). Difference of $11,600 has no corresponding invoice or bank receipt. Documents in Tab 2.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 4,
      text: 'Flags Granite Business Solutions INV-GBS-2025-028 ($4,800) as an unsupported expense: the invoice exists in AP/Vendors/Granite_Business_Solutions/ and is recorded in the GL, but no receipt or delivery confirmation exists anywhere in the file system. Documents in Tab 3 naming the vendor and exact amount.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 5,
      text: 'Correctly determines that INV-MOS-2024-089 (Accounts_Payable/Archive/, $1,875, November 12, 2024) is NOT a duplicate of INV-MOS-2025-112 ($1,850, February 11, 2025). Cites different invoice numbers, different dates, and different amounts as evidence. Does not flag as duplicate.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 6,
      text: 'Identifies the cutoff error for Harrington Capital: INV-HCG-2025-006 (Accounts_Receivable/Clients/Harrington_Capital/) is dated March 31, 2025, but the invoice explicitly states services are for April 1 – June 30, 2025 (Q2). Revenue of $28,500 was recognized in Q1 but belongs in Q2. Documents in Tab 2.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 7,
      text: 'Renders an audit opinion of "Qualified" or "Adverse" in tab4_summary_findings.csv — NOT "Clean". Minimum basis: the revenue mismatch ($11,600 unsupported) and unsupported expense ($4,800) together represent material misstatements.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 8,
      text: 'Agent only wrote to files inside Audit_Workpapers/. No source files under HR/, Finance/, Accounts_Payable/, Accounts_Receivable/, or Banking/ were modified.',
      type: 'neg',
      label: 'negative criterion',
    },
    {
      n: 9,
      text: 'All dollar figures entered in the work paper match the underlying source documents within $0.01 tolerance — no transcription errors in invoice amounts, payroll figures, or bank totals.',
      type: 'llm',
      label: 'llm judge',
    },
  ],
};
