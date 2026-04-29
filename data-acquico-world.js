const STATIC_ACQUICO_WORLD = {
  meta: {
    id: 'APEX-MA-W01',
    company: 'AcquiCo Inc.',
    name: 'AcquiCo Inc.',
    type: 'Industrial Automation - Buy-Side Financial Diligence',
    method: 'Accrual',
    industry: 'Industrial automation',
    period: 'FY2021-FY2023',
    employees: 254,
    archetype: 'M&A diligence',
    tier: 'Tier 3 - Judgment',
    totalFiles: 24,
    coreFiles: 18,
    noiseFiles: 4,
    tasks: 5,
    taskPrompt: 'You are a financial analyst at a private equity firm evaluating the acquisition of AcquiCo Inc., a mid-market industrial automation company. Use the company data room to answer five diligence tasks: (1) state the exact cash and cash equivalents balance for FY2021, FY2022, and FY2023; (2) identify every non-recurring or one-time item across FY2021-FY2023, including year, dollar amount, nature, and normalized EBITDA treatment; (3) state Adjusted EBITDA for FY2021, FY2022, and FY2023 from the adjusted EBITDA bridge; (4) identify personnel-related synergy opportunities from the headcount files; and (5) complete the one-time item analysis without relying on documents in 05_NewsContext as primary sources.',
  },

  taskPrompt: 'You are a financial analyst at a private equity firm evaluating the acquisition of AcquiCo Inc., a mid-market industrial automation company. Use the company data room to answer five diligence tasks: (1) state the exact cash and cash equivalents balance for FY2021, FY2022, and FY2023; (2) identify every non-recurring or one-time item across FY2021-FY2023, including year, dollar amount, nature, and normalized EBITDA treatment; (3) state Adjusted EBITDA for FY2021, FY2022, and FY2023 from the adjusted EBITDA bridge; (4) identify personnel-related synergy opportunities from the headcount files; and (5) complete the one-time item analysis without relying on documents in 05_NewsContext as primary sources.',

  files: [
    {
      path: 'task.txt',
      type: 'policy',
      content: `BENCHMARK TASK FILE - AcquiCo Inc. Deals Advisory World

SCENARIO
You are a financial analyst at a private equity firm evaluating the acquisition of AcquiCo Inc., a mid-market industrial automation company. You have been given access to the company's data room.

TASK 1 - Deterministic exact balance lookup
Using the trial balance files in 01_Financials/, state the exact cash and cash equivalents balance for each of FY2021, FY2022, and FY2023.

TASK 2 - LLM judge one-time item identification
Review all financial documents and identify every non-recurring or one-time item across FY2021, FY2022, and FY2023. For each item, state the year, dollar amount, nature of the item, and whether it is a positive or negative adjustment to normalized EBITDA.

TASK 3 - Deterministic EBITDA bridge
Using adjusted_ebitda_bridge.xlsx, state Adjusted EBITDA for FY2021, FY2022, and FY2023.

TASK 4 - LLM judge personnel synergy
Based on the headcount files in 03_Headcount/, identify any personnel-related synergy opportunities that a potential acquirer should evaluate.

TASK 5 - Negative constraint noise rejection
Complete Task 2 without citing or relying on any documents in 05_NewsContext/ as primary sources. Those files may be used only as corroboration after the items are identified from primary sources.`,
    },

    {
      path: '01_Financials/income_statement_3yr.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Income Statement ($000s)
Line Item,FY2021,FY2022,FY2023
Product Revenue,22900,23800,24700
Service Revenue,8800,9100,9400
ONE-TIME: Real Estate Sale,0,10000,0
Total Revenue,31700,42900,34100
Cost of Goods Sold,14400,14800,15200
Gross Profit,17300,28100,18900
Salaries & Wages,10000,10200,10400
Rent & Occupancy,1800,1800,1800
D&A,2250,2300,2350
Marketing,1230,1260,1290
G&A,2420,2440,2460
ONE-TIME: Restructuring Charge,0,3500,0
ONE-TIME: Litigation Settlement,2000,0,0
Reported EBITDA,4300,11700,6400
Adjusted EBITDA,5500,5200,6650
Interest Expense,900,900,900
Income Tax,850,900,950
Net Income,1550,3900,2100`,
    },
    {
      path: '01_Financials/balance_sheet_3yr.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Balance Sheet ($000s)
Line Item,FY2021,FY2022,FY2023
Cash & Equivalents,4280,4520,4760
Accounts Receivable,8250,8550,8850
Inventory,5590,5680,5770
Prepaid Expenses,630,640,650
Total Current Assets,18750,19390,20030
PP&E (net),23000,23200,23400
Intangible Assets,7200,7000,6800
Goodwill,12400,12400,12400
Total Assets,61350,61990,62630
Accounts Payable,4860,4920,4980
Accrued Liabilities,2140,2180,2220
Short-Term Debt,5000,5000,5000
Deferred Revenue,1220,1240,1260
Long-Term Debt,18000,17000,16000
Common Stock,500,500,500
Retained Earnings,15800,16600,17400`,
    },
    {
      path: '01_Financials/trial_balance_2021.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Trial Balance FY2021 ($000s)
Account Description,Account #,Debit,Credit
Cash & Cash Equivalents,1010,4280,
Accounts Receivable,1200,8250,
Inventory,1300,5590,
Prepaid Expenses,1400,630,
Property Plant & Equipment (net),1700,23000,
Intangible Assets,1800,7200,
Goodwill,1900,12400,
Accounts Payable,2100,,4860
Accrued Liabilities,2200,,2140
Short-Term Debt,2300,,5000
Long-Term Debt,2500,,18000
Deferred Revenue,2600,,1220
Product Revenue,4100,,22900
Service Revenue,4200,,8800
Cost of Goods Sold,5100,14400,
Salaries & Wages,5200,10000,
Rent & Occupancy,5300,1800,
Depreciation & Amortization,5400,2250,
ONE-TIME: Litigation Settlement,5950,2000,
Marketing & Advertising,6100,1230,
General & Administrative,6200,2420,
Interest Expense,7100,900,
Income Tax Expense,8100,850,
Source: AcquiCo internal GL export`,
    },
    {
      path: '01_Financials/trial_balance_2022.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Trial Balance FY2022 ($000s)
Account Description,Account #,Debit,Credit
Cash & Cash Equivalents,1010,4520,
Accounts Receivable,1200,8550,
Inventory,1300,5680,
Prepaid Expenses,1400,640,
Property Plant & Equipment (net),1700,23200,
Intangible Assets,1800,7000,
Goodwill,1900,12400,
Accounts Payable,2100,,4920
Accrued Liabilities,2200,,2180
Short-Term Debt,2300,,5000
Long-Term Debt,2500,,17000
Deferred Revenue,2600,,1240
Product Revenue,4100,,23800
Service Revenue,4200,,9100
ONE-TIME: Real Estate Sale,4900,,10000
Cost of Goods Sold,5100,14800,
Salaries & Wages,5200,10200,
Rent & Occupancy,5300,1800,
Depreciation & Amortization,5400,2300,
ONE-TIME: Restructuring Charge,5900,3500,
Marketing & Advertising,6100,1260,
General & Administrative,6200,2440,
Interest Expense,7100,900,
Income Tax Expense,8100,900,
Source: AcquiCo internal GL export`,
    },
    {
      path: '01_Financials/trial_balance_2023.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Trial Balance FY2023 ($000s)
Account Description,Account #,Debit,Credit
Cash & Cash Equivalents,1010,4760,
Accounts Receivable,1200,8850,
Inventory,1300,5770,
Prepaid Expenses,1400,650,
Property Plant & Equipment (net),1700,23400,
Intangible Assets,1800,6800,
Goodwill,1900,12400,
Accounts Payable,2100,,4980
Accrued Liabilities,2200,,2220
Short-Term Debt,2300,,5000
Long-Term Debt,2500,,16000
Deferred Revenue,2600,,1260
Product Revenue,4100,,24700
Service Revenue,4200,,9400
Cost of Goods Sold,5100,15200,
Salaries & Wages,5200,10400,
Rent & Occupancy,5300,1800,
Depreciation & Amortization,5400,2350,
Marketing & Advertising,6100,1290,
General & Administrative,6200,2460,
Interest Expense,7100,900,
Income Tax Expense,8100,950,
Source: AcquiCo internal GL export`,
    },
    {
      path: '01_Financials/adjusted_ebitda_bridge.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Adjusted EBITDA Bridge ($000s)
Line Item,FY2021,FY2022,FY2023
Reported Net Income,1550,3900,2100
(+) Income Tax Expense,850,900,950
(+) Interest Expense,900,900,900
(+) D&A,2250,2300,2350
(+) Restructuring Charge (2022),0,3500,0
(+) Litigation Settlement (2021),2000,0,0
(-) Real Estate Sale Gain (2022),0,-10000,0
Adjusted EBITDA,5500,5200,6650
Adjusted EBITDA Margin,17.4%,19.4%,19.5%
Note: One-time items are normalized out of Adjusted EBITDA.`,
    },

    {
      path: '02_ProForma/management_projections.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Management 5-Year Projections ($000s)
Metric,2023,2024,2025,2026,2027
Revenue Growth Assumption %,5.5%,6.0%,6.5%,6.5%,7.0%
Total Revenue,34100,35976,38283,40771,43624
Adj. EBITDA Margin %,19.5%,21.0%,22.0%,22.5%,23.0%
Adj. EBITDA,6650,7555,8422,9173,10033
Capex,2100,2200,2300,2400,2500
D&A,2350,2400,2450,2500,2550
Change in Working Capital,-200,-250,-300,-320,-340
Unlevered Free Cash Flow,6800,7505,8272,8953,9843
Note: Management projections include optimistic assumptions regarding margin expansion. Compare against historical Adjusted EBITDA.`,
    },
    {
      path: '02_ProForma/revenue_build_assumptions.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Revenue Build ($000s)
Line Item,2023,2024,2025,2026,2027
Product Revenue - Legacy,18000,18500,19000,19500,20000
Product Revenue - New Products,6700,7200,7800,8400,9000
Total Product Revenue,24700,25700,26800,27900,29000
Service Revenue - Recurring,7800,8100,8400,8700,9000
Service Revenue - Project,1600,1700,1800,1900,2000
Total Service Revenue,9400,9800,10200,10600,11000
Total Revenue,34100,35500,37000,38500,40000`,
    },
    {
      path: '02_ProForma/capex_schedule.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Capital Expenditure Schedule ($000s)
Line Item,FY2021,FY2022,FY2023,FY2024,FY2025
Maintenance CapEx,1100,1150,1200,1250,1300
Growth CapEx,800,850,900,950,1000
ONE-TIME: Facility Expansion (2021),2400,0,0,0,0
Total CapEx,4300,2000,2100,2200,2300
CapEx as % of Revenue,13.6%,4.5%,6.2%,6.1%,6.0%
D&A,2200,2250,2300,2350,2400
CapEx / D&A ratio,2.0x,0.9x,0.9x,0.9x,1.0x
Note: 2021 CapEx spike is a non-recurring facility build-out and should be excluded from normalized CapEx. It is not an EBITDA adjustment.`,
    },

    {
      path: '03_Headcount/headcount_by_dept_2023.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Headcount by Department FY2023
Department,HC Count,Avg Base Salary,Total Base ($000s),Total Comp w/ Benefits,Notes
Executive / C-Suite,6,280000,1680,2150.4,Duplicate C-suite likely post-acquisition (2 CEOs, 2 CFOs)
Finance & Accounting,18,95000,1710,2188.8,Standalone company finance layer
Sales & BD,42,88000,3696,4730.9,
Marketing,22,82000,1804,2309.1,
Engineering / Product,65,135000,8775,11232.0,
Operations,38,72000,2736,3502.1,
Customer Success,30,68000,2040,2611.2,
Legal & Compliance,8,145000,1160,1484.8,Standalone legal/compliance layer
HR & People Ops,11,78000,858,1098.2,
IT & Infrastructure,14,102000,1428,1827.8,
Total,254,,25887,33143.5,
Note: redundant executive roles are flagged for post-acquisition synergy analysis.`,
    },
    {
      path: '03_Headcount/comp_benefits_summary.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Compensation & Benefits Summary FY2023
Component,Amount ($000s),% of Revenue,Notes
Total Base Salaries,18400,5.4%,
Bonus & Variable Comp,2760,0.8%,Approximately 15% of base average
Employer Payroll Taxes,1380,0.4%,7.65% FICA on applicable wages
Health & Dental Benefits,2208,0.6%,$1,800 per employee average employer cost
401(k) Match,552,0.2%,3% of base match
Equity / Stock Comp,920,0.3%,Options plus RSUs
Other Benefits,368,0.1%,Life, disability, and related benefits
Total Compensation Cost,26588,7.8%,`,
    },
    {
      path: '03_Headcount/dummy_census_file.xlsx',
      type: 'ledger',
      content: `AcquiCo Inc. - Employee Census Extract
Emp ID,First Name,Last Name,Title,Department,Base Salary,Status,Location
EMP1006,Jennifer,Johnson,Chief Executive Officer,Executive / C-Suite,303000,Active,Chicago IL
EMP1013,Michael,Davis,Chief Financial Officer,Executive / C-Suite,271000,Active,Boston MA
EMP1034,Susan,Martinez,VP Finance,Finance & Accounting,122000,Active,Remote
EMP1037,Donald,Wilson,VP Finance,Finance & Accounting,81000,Active,Boston MA
EMP1052,Matthew,Thomas,Chief Executive Officer,Engineering / Product,163000,Active,Remote
EMP1061,Matthew,Jones,Chief Marketing Officer,Executive / C-Suite,310000,Active,San Francisco CA
EMP1073,Mark,Smith,Chief Financial Officer,Executive / C-Suite,299000,Active,San Francisco CA
EMP1093,David,Martin,Chief Operating Officer,Executive / C-Suite,255000,Active,New York NY
EMP1012,Patricia,Johnson,General Counsel,Legal & Compliance,175000,Active,Boston MA
EMP1033,Jennifer,Thomas,Deputy GC,Legal & Compliance,114000,Active,San Francisco CA
EMP1050,Linda,Miller,Deputy GC,Legal & Compliance,128000,Active,San Francisco CA
EMP1079,Susan,Williams,Corporate Counsel,Legal & Compliance,174000,Active,San Francisco CA
EMP1045,Lisa,Thompson,Staff Accountant,Finance & Accounting,89000,Active,New York NY
EMP1066,Karen,Smith,Accounting Manager,Finance & Accounting,94000,Active,San Francisco CA
EMP1088,Daniel,Martin,Senior Financial Analyst,Finance & Accounting,98000,Active,Chicago IL
Note: Row 52 in the full census contains the second CEO. Use with headcount_by_dept_2023.xlsx for synergy analysis.`,
    },

    {
      path: '04_DiligenceDocs/management_presentation.pdf',
      type: 'policy',
      content: `CONFIDENTIAL - FOR DISCUSSION PURPOSES ONLY
AcquiCo Inc.
Investor Presentation | FY2023 Results & 5-Year Outlook

Company Overview
AcquiCo Inc. is a mid-market provider of industrial automation solutions, serving manufacturing, logistics, and energy clients across North America. Founded in 2003, the company operates through two segments: Product and Services.

FY2023 Financial Highlights
Metric,FY2021,FY2022,FY2023,Commentary
Total Revenue ($M),31.7,44.1,34.1,FY2022 inflated by $10.0M real estate sale
Adj. EBITDA ($M),5.5,5.2,6.7,Normalized for one-time items
Adj. EBITDA Margin,17.4%,19.4%,19.5%,Expanding margins on opex discipline
Net Income ($M),1.6,3.9,2.1,FY2022 boosted by asset sale gain
Headcount,248,254,254,Stable workforce

Management Commentary on FY2022
FY2022 results include two significant non-recurring items that should be excluded when assessing normalized performance: (1) a $10.0M gain from the sale of a legacy warehouse facility in Cleveland, Ohio, recorded in Other Revenue; and (2) a $3.5M restructuring charge related to a workforce rationalization program completed in Q3 2022. FY2021 included a $2.0M litigation settlement related to a resolved patent dispute.

Adjusted EBITDA excludes these items and shows $5.5M in FY2021, $5.2M in FY2022, and $6.7M in FY2023.`,
    },
    {
      path: '04_DiligenceDocs/10K_2021.pdf',
      type: 'policy',
      content: `AcquiCo Inc. - Annual Report FY2021 (10-K Summary)
Fiscal Year Ended December 31, 2021

Business Overview
AcquiCo Inc. designs, manufactures, and services industrial automation systems. For fiscal year 2021, the company reported total revenues of $31.7M and net income of $1.6M. Adjusted EBITDA was $5.5M after excluding non-recurring items.

Selected Financial Data
Revenue ($000s): 31,700
Net Income ($000s): 1,550
Adj. EBITDA ($000s): 5,500
Total Employees: 254

Non-Recurring & Special Items
Litigation settlement of $2.0M from a patent dispute resolved in Q2 2021. Facility CapEx of $2.4M for warehouse expansion, non-recurring.`,
    },
    {
      path: '04_DiligenceDocs/10K_2022.pdf',
      type: 'policy',
      content: `AcquiCo Inc. - Annual Report FY2022 (10-K Summary)
Fiscal Year Ended December 31, 2022

Business Overview
AcquiCo Inc. designs, manufactures, and services industrial automation systems. For fiscal year 2022, the company reported total revenues of $44.1M and net income of $3.9M. Adjusted EBITDA was $5.2M after excluding non-recurring items.

Selected Financial Data
Revenue ($000s): 44,100
Net Income ($000s): 3,900
Adj. EBITDA ($000s): 5,200
Total Employees: 254

Non-Recurring & Special Items
Real estate sale of Cleveland warehouse, $10.0M gain in Other Revenue. Restructuring charge of $3.5M in Q3 2022, completed.`,
    },
    {
      path: '04_DiligenceDocs/10K_2023.pdf',
      type: 'policy',
      content: `AcquiCo Inc. - Annual Report FY2023 (10-K Summary)
Fiscal Year Ended December 31, 2023

Business Overview
AcquiCo Inc. designs, manufactures, and services industrial automation systems. For fiscal year 2023, the company reported total revenues of $34.1M and net income of $2.1M. Adjusted EBITDA was $6.65M after excluding non-recurring items.

Selected Financial Data
Revenue ($000s): 34,100
Net Income ($000s): 2,100
Adj. EBITDA ($000s): 6,650
Total Employees: 254

Non-Recurring & Special Items
No material non-recurring items. Clean operating year.`,
    },
    {
      path: '04_DiligenceDocs/earnings_call_transcript_Q4.pdf',
      type: 'policy',
      content: `AcquiCo Inc. - Q4 & Full Year FY2023 Earnings Call Transcript
February 14, 2024 | Confidential

CEO: Full year revenue came in at $34.1 million, reflecting 7% organic growth in our core product and services segments. When discussing FY2022 comparisons, look past the headline $44.1M revenue number because that included a $10 million one-time gain from the Cleveland facility sale.

CFO: Normalized Adjusted EBITDA for 2023 was $6.7 million, or 19.5% margin. That's up from $5.2M adjusted in 2022 and $5.5M in 2021. The 2022 EBITDA was also burdened by a $3.5M restructuring charge we took to right-size our operations team.

Analyst: Can you walk us through the bridge?
CFO: In 2021, we had $2M in litigation settlement costs from a resolved IP dispute. In 2022, we add back the $3.5M restructuring, and subtract the $10M real estate gain because it is not operational. In 2023, clean year, no adjustments.

Analyst: How should acquirers think about synergy potential?
CEO: We have natural overlap in corporate functions. A strategic acquirer would find meaningful savings in G&A, particularly at the executive level where there would be duplication. We have two individuals in CFO-adjacent roles today that reflect our standalone needs as a private company.`,
    },

    {
      path: '06_Legal/customer_contracts_summary.pdf',
      type: 'policy',
      content: `AcquiCo Inc. - Customer Contract Summary
Prepared for Buyer Diligence | FY2023

AcquiCo has 87 active customer accounts. The top 10 customers represent approximately 48% of FY2023 revenue. Service contracts represent 23% of total revenue and are typically 1-3 year terms with auto-renewal provisions.

Average contract duration: 18 months.
Net Revenue Retention: 104% in FY2023.
Customer churn rate: 6.2% by revenue.
Change-of-control provisions: 34 of 87 contracts contain notification requirements; 8 contain consent rights.

Risk: The 8 contracts with consent rights represent approximately $4.2M in annualized revenue. Buyer should obtain consent from these customers prior to close.`,
    },
    {
      path: '06_Legal/material_litigation.pdf',
      type: 'policy',
      content: `AcquiCo Inc. - Material Litigation Disclosure
As of December 31, 2023 | Confidential Attorney-Client Communication

Resolved Matters
Patent Infringement Action (Smith Industrial Holdings v. AcquiCo): Resolved in Q2 2021 via settlement payment of $2.0 million. No ongoing obligations. All claims dismissed with prejudice.

Pending Matters
Employment Dispute (Garcia v. AcquiCo, filed Q3 2023): Former sales employee alleges wrongful termination. Company denies all claims. Estimated exposure: $150,000-$400,000. Matter expected to resolve in FY2024.

Regulatory
No material regulatory actions or investigations pending as of the date hereof.`,
    },

    {
      path: '05_NewsContext/competitor_press_release.pdf',
      type: 'policy',
      content: `Automation Weekly - January 8, 2024
AutomateX Acquires RoboCore for $180M - Consolidation Continues in Industrial Automation

AutomateX Corp announced it has agreed to acquire RoboCore Systems for $180 million, representing approximately 12x trailing EBITDA. Industry analysts note that mid-market automation companies in the $30M-$50M revenue range are attracting strong M&A interest, with EV/EBITDA multiples ranging from 10x to 14x for quality assets with recurring service revenue.

Noise file: Competitor deal. May inform valuation benchmarking but not AcquiCo financials.`,
    },
    {
      path: '05_NewsContext/news_article_reorg_2022.pdf',
      type: 'policy',
      content: `IndustrialTech News - March 15, 2022
AcquiCo Announces Completion of Cleveland Facility Sale

AcquiCo Inc. announced completion of the sale of its Cleveland, Ohio warehouse facility to Midwest Industrial Real Estate Partners for gross proceeds of $10.0 million. The company expects to record a pre-tax gain of approximately $10 million in Q2 2022.

Noise file: This sits in 05_NewsContext. It may corroborate the real estate gain but should not be used as the primary source for Task 2.`,
    },
    {
      path: '05_NewsContext/macro_interest_rate_note.pdf',
      type: 'policy',
      content: `Internal Research Note - Impact of Fed Rate Environment on Industrial M&A Financing

The Federal Reserve's rate hiking cycle has materially impacted leveraged buyout financing costs. Typical mid-market LBO capital structures are now priced at SOFR + 400-550 bps. Strategic acquirers with balance sheet capacity are advantaged.

Noise file: Macro context. Do not confuse this with AcquiCo-specific financial data.`,
    },
    {
      path: '05_NewsContext/unrelated_contract_draft.pdf',
      type: 'policy',
      content: `Draft - For Review Only
Master Services Agreement - AcquiCo Inc. & DataSync Partners LLC

This draft governs IT data migration and cloud infrastructure services. Fees: $240,000 annually, payable quarterly.

Noise file: Vendor contract draft. Not relevant to financial diligence tasks.`,
    },
  ],

  ambiguityTypes: [
    'One-time item normalization',
    'Primary-source vs noise-source distinction',
    'EBITDA vs CapEx treatment',
    'Personnel synergy judgment',
    'Exact financial statement lookup',
  ],

  misleadingFiles: [
    { file: '05_NewsContext/competitor_press_release.pdf', why: 'Competitor transaction context only; not AcquiCo financial evidence.' },
    { file: '05_NewsContext/news_article_reorg_2022.pdf', why: 'Corroborates real estate sale but must not be the primary source for Task 2.' },
    { file: '05_NewsContext/macro_interest_rate_note.pdf', why: 'Macro financing context only.' },
    { file: '05_NewsContext/unrelated_contract_draft.pdf', why: 'Unexecuted vendor draft unrelated to the benchmark tasks.' },
  ],

  rubric: [
    {
      n: 1,
      text: 'Task 1: States exact cash and cash equivalents balances as FY2021 = $4,280K, FY2022 = $4,520K, and FY2023 = $4,760K, citing the financial statements or trial balance source.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 2,
      text: 'Task 2: Identifies the FY2021 $2.0M litigation settlement as non-recurring and treats it as an add-back / positive adjustment to normalized EBITDA.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 3,
      text: 'Task 2: Identifies the FY2022 $10.0M real estate sale gain as non-recurring revenue and treats it as a subtractive / negative adjustment to normalized EBITDA.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 4,
      text: 'Task 2: Identifies the FY2022 $3.5M restructuring charge as non-recurring and treats it as an add-back / positive adjustment to normalized EBITDA.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 5,
      text: 'Task 2: Identifies the FY2021 $2.4M facility expansion CapEx spike as non-recurring CapEx, but does not incorrectly include it as an EBITDA add-back.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 6,
      text: 'Task 3: States Adjusted EBITDA as FY2021 = $5,500K, FY2022 = $5,200K, and FY2023 = $6,650K from adjusted_ebitda_bridge.xlsx.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 7,
      text: 'Task 4: Identifies personnel synergy opportunities around duplicate CEO roles, duplicate CFO / VP Finance or CFO-adjacent roles, and overlapping G&A functions such as Finance/Accounting and Legal/Compliance.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 8,
      text: 'Task 4: Quantifies or frames personnel synergy potential as approximately $2M-$4M, or gives a comparable supportable range tied to executive and G&A overlap.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 9,
      text: 'Task 5 negative constraint: Does not cite 05_NewsContext files as primary support for the one-time item list. Any use of those files is clearly secondary corroboration only.',
      type: 'neg',
      label: 'negative criterion',
    },
    {
      n: 10,
      text: 'Provides source-aware reasoning: distinguishes the adjusted EBITDA bridge, 10-K summaries, legal disclosure, and headcount schedules from noise/context files, and cites relevant file names for material claims.',
      type: 'llm',
      label: 'llm judge',
    },
  ],
};
