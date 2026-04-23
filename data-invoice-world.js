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
