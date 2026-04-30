const STATIC_ACQUI_WORLD = {
  meta: {
    id: 'APEX-ACQUI-W01',
    company: 'AcquiCo Inc.',
    industry: 'Industrial Automation',
    period: 'FY2021-FY2023',
    employees: 254,
    archetype: 'Deals Advisory Data Room',
    tier: 'Tier 3 — Judgment',
    taskPrompt: `You are a financial analyst at a private equity firm evaluating the acquisition of AcquiCo Inc., a mid-market industrial automation company. You have been given access to the company's data room.

TASK 1 (DETERMINISTIC — exact balance lookup): Using the trial balance files in 01_Financials/, state the exact cash & cash equivalents balance for each of FY2021, FY2022, and FY2023.

TASK 2 (LLM JUDGE — one-time item identification): Review all financial documents and identify every non-recurring or one-time item across FY2021, FY2022, and FY2023. For each item, state the year, the dollar amount, the nature of the item, and whether it is a positive or negative adjustment to normalized EBITDA.

TASK 3 (DETERMINISTIC — EBITDA bridge): Using the adjusted_ebitda_bridge.xlsx file, state the Adjusted EBITDA for each of FY2021, FY2022, FY2023.

TASK 4 (LLM JUDGE — personnel synergy): Based on the headcount files in 03_Headcount/, identify any personnel-related synergy opportunities that a potential acquirer should evaluate.

TASK 5 (NEGATION — noise rejection): Complete Task 2 WITHOUT citing or relying on any documents in the 05_NewsContext/ folder. You may use them for corroboration only after identifying items from primary sources.`,
  },

  files: [
    {
      path: 'task.txt',
      type: 'policy',
      content: `BENCHMARK TASK FILE — AcquiCo Inc. Deals Advisory World
================================================================

SCENARIO:
You are a financial analyst at a private equity firm evaluating the acquisition
of AcquiCo Inc., a mid-market industrial automation company. You have been given
access to the company's data room (files in this folder structure).

----------------------------------------------------------------
TASK 1 (DETERMINISTIC — exact balance lookup):
Using the trial balance files in 01_Financials/, state the exact cash & cash
equivalents balance for each of FY2021, FY2022, and FY2023.

TASK 2 (LLM JUDGE — one-time item identification):
Review all financial documents and identify every non-recurring or one-time item
across FY2021, FY2022, and FY2023. For each item: state the year, the dollar
amount, the nature of the item, and whether it is a positive or negative
adjustment to normalized EBITDA.

TASK 3 (DETERMINISTIC — EBITDA bridge):
Using the adjusted_ebitda_bridge.xlsx file, state the Adjusted EBITDA for each
of FY2021, FY2022, FY2023.

TASK 4 (LLM JUDGE — personnel synergy):
Based on the headcount files in 03_Headcount/, identify any personnel-related
synergy opportunities that a potential acquirer should evaluate.

TASK 5 (NEGATION — noise rejection):
Complete Task 2 WITHOUT citing or relying on any documents in the 05_NewsContext/
folder. You may use them for corroboration only after identifying items from
primary sources.`,
    },

    {
      path: '01_Financials/balance_sheet_3yr.xlsx',
      type: 'ledger',
      content: `Line Item,FY2021,FY2022,FY2023
Cash & Equivalents,4280,4520,4760
Accounts Receivable,8250,8550,8850
Inventory,5590,5680,5770
Prepaid Expenses,630,640,650
PP&E (net),23000,23200,23400
Intangible Assets,7200,7000,6800
Goodwill,12400,12400,12400
Accounts Payable,4860,4920,4980
Accrued Liabilities,2140,2180,2220
Short-Term Debt,5000,5000,5000
Deferred Revenue,1220,1240,1260
Long-Term Debt,18000,17000,16000
Common Stock,500,500,500
Retained Earnings,15800,16600,17400`,
    },
    {
      path: '01_Financials/income_statement_3yr.xlsx',
      type: 'ledger',
      content: `Line Item,FY2021,FY2022,FY2023
Product Revenue,22900,23800,24700
Service Revenue,8800,9100,9400
ONE-TIME: Real Estate Sale,0,10000,0
COGS,14400,14800,15200
Salaries & Wages,10000,10200,10400
Rent & Occupancy,1800,1800,1800
D&A,2250,2300,2350
Marketing,1230,1260,1290
G&A,2420,2440,2460
ONE-TIME: Restructuring Charge,0,3500,0
ONE-TIME: Litigation Settlement,2000,0,0
Interest Expense,900,900,900
Income Tax,850,900,950
Net Income,1550,3900,2100`,
    },
    {
      path: '01_Financials/adjusted_ebitda_bridge.xlsx',
      type: 'ledger',
      content: `Line Item,FY2021,FY2022,FY2023
Reported Net Income,1550,3900,2100
Income Tax Expense,850,900,950
Interest Expense,900,900,900
D&A,2250,2300,2350
Restructuring Charge Addback,0,3500,0
Litigation Settlement Addback,2000,0,0
Real Estate Sale Gain Subtraction,0,-10000,0
Adjusted EBITDA,5500,5200,6650`,
    },
    {
      path: '01_Financials/trial_balance_2021.xlsx',
      type: 'ledger',
      content: `Account Description,Account #,Debit ($000s),Credit ($000s)
Cash & Cash Equivalents,1010,165880,
Accounts Receivable,1200,311250,
Inventory,1300,187390,
Property Plant & Equipment gross,1700,1044500,
Accumulated Depreciation,1750,,819400
Product Revenue,4100,,1840900
Service Revenue,4200,,614800
Cost of Goods Sold,5100,822400,
Salaries & Wages,5200,414000,
ONE-TIME: Litigation Settlement (2021),5950,2000,
Marketing & Advertising,6100,61830,
General & Administrative,6200,42820,
Interest Expense,7100,900,
Income Tax Expense,8100,101850,
Source: AcquiCo internal GL export`,
    },
    {
      path: '01_Financials/trial_balance_2022.xlsx',
      type: 'ledger',
      content: `Account Description,Account #,Debit ($000s),Credit ($000s)
Cash & Cash Equivalents,1010,165960,
Accounts Receivable,1200,311400,
Inventory,1300,187480,
Product Revenue,4100,,1841800
Service Revenue,4200,,615100
ONE-TIME: Real Estate Sale (2022 only),4900,,10000
Cost of Goods Sold,5100,822800,
Salaries & Wages,5200,414200,
ONE-TIME: Restructuring Charge (2022),5900,3500,
Marketing & Advertising,6100,61860,
General & Administrative,6200,42840,
Interest Expense,7100,900,
Income Tax Expense,8100,101900,
Source: AcquiCo internal GL export`,
    },
    {
      path: '01_Financials/trial_balance_2023.xlsx',
      type: 'ledger',
      content: `Account Description,Account #,Debit ($000s),Credit ($000s)
Cash & Cash Equivalents,1010,166040,
Accounts Receivable,1200,311550,
Inventory,1300,187570,
Product Revenue,4100,,1842700
Service Revenue,4200,,615400
ONE-TIME: Real Estate Sale (2022 only),4900,,0
Cost of Goods Sold,5100,823200,
Salaries & Wages,5200,414400,
ONE-TIME: Restructuring Charge (2022),5900,0,
ONE-TIME: Litigation Settlement (2021),5950,0,
Marketing & Advertising,6100,61890,
General & Administrative,6200,42860,
Interest Expense,7100,900,
Income Tax Expense,8100,101950,
Source: AcquiCo internal GL export`,
    },

    {
      path: '02_ProForma/capex_schedule.xlsx',
      type: 'ledger',
      content: `Line Item,FY2021,FY2022,FY2023,FY2024,FY2025
Maintenance CapEx,1100,1150,1200,1250,1300
Growth CapEx,800,850,900,950,1000
ONE-TIME: Facility Expansion (2021),2400,0,0,0,0
D&A,2200,2250,2300,2350,2400
Note,2021 CapEx spike is non-recurring facility build-out and should be excluded from normalized CapEx.`,
    },
    {
      path: '02_ProForma/management_projections.xlsx',
      type: 'ledger',
      content: `Metric,2023,2024,2025,2026,2027
Revenue Growth Assumption %,5.5%,6.0%,6.5%,6.5%,7.0%
Total Revenue ($000s),34100,35976,38283,40771,43624
Adj. EBITDA Margin %,19.5%,21.0%,22.0%,22.5%,23.0%
Adj. EBITDA ($000s),6650,7555,8422,9173,10033
Capex ($000s),2100,2200,2300,2400,2500
D&A ($000s),2350,2400,2450,2500,2550
Change in Working Capital ($000s),-200,-250,-300,-320,-340
Unlevered Free Cash Flow ($000s),6800,7505,8272,8953,9843`,
    },
    {
      path: '02_ProForma/revenue_build_assumptions.xlsx',
      type: 'ledger',
      content: `Line Item,2023,2024,2025,2026,2027
Product Revenue — Legacy,18000,18500,19000,19500,20000
Product Revenue — New Products,6700,7200,7800,8400,9000
Service Revenue — Recurring,7800,8100,8400,8700,9000
Service Revenue — Project,1600,1700,1800,1900,2000`,
    },

    {
      path: '03_Headcount/headcount_by_dept_2023.xlsx',
      type: 'ledger',
      content: `Department,HC Count,Avg Base Salary,Total Base ($000s),Total Comp w/ Benefits,% of Total HC,Notes
Executive / C-Suite,6,280000,1680,2150.4,2.4%,Duplicate C-suite likely post-acquisition (2 CEOs, 2 CFOs)
Finance & Accounting,18,95000,1710,2188.8,7.1%,Potential acquirer overlap in finance/accounting
Sales & BD,42,88000,3696,4730.88,16.5%,
Marketing,22,82000,1804,2309.12,8.7%,
Engineering / Product,65,135000,8775,11232,25.6%,
Operations,38,72000,2736,3502.08,15.0%,
Customer Success,30,68000,2040,2611.2,11.8%,
Legal & Compliance,8,145000,1160,1484.8,3.1%,Potential acquirer overlap in legal/compliance
HR & People Ops,11,78000,858,1098.24,4.3%,
IT & Infrastructure,14,102000,1428,1827.84,5.5%`,
    },
    {
      path: '03_Headcount/comp_benefits_summary.xlsx',
      type: 'ledger',
      content: `Component,Amount ($000s),% of Revenue,Notes
Total Base Salaries,18400,5.4%,
Bonus & Variable Comp,2760,0.8%,~15% of base avg
Employer Payroll Taxes,1380,0.4%,7.65% FICA on applicable wages
Health & Dental Benefits,2208,0.6%,$1800/employee avg employer cost
401(k) Match,552,0.2%,3% of base match
Equity / Stock Comp,920,0.3%,Options + RSUs
Other Benefits,368,0.1%,
TOTAL COMPENSATION COST,26588,7.8%,`,
    },
    {
      path: '03_Headcount/dummy_census_file.xlsx',
      type: 'ledger',
      content: `Emp ID,First Name,Last Name,Title,Department,Base Salary,Start Date,Status,Location
EMP1006,Jennifer,Johnson,Chief Executive Officer,Executive / C-Suite,303000,2022-01-01,Active,Chicago IL
EMP1013,Michael,Davis,Chief Financial Officer,Executive / C-Suite,271000,2015-10-01,Active,Boston MA
EMP1034,Susan,Martinez,VP Finance,Finance & Accounting,122000,2017-04-01,Active,Remote
EMP1037,Donald,Wilson,VP Finance,Finance & Accounting,81000,2018-01-01,Active,Boston MA
EMP1052,Matthew,Thomas,Chief Executive Officer,Engineering / Product,163000,2020-04-01,Active,Remote
EMP1073,Mark,Smith,Chief Financial Officer,Executive / C-Suite,299000,2016-04-01,Active,San Francisco CA
EMP1079,Susan,Williams,Corporate Counsel,Legal & Compliance,174000,2019-01-01,Active,San Francisco CA
NOTE,Row 52 in source census is a second CEO. File also contains duplicate CFO and finance/legal leadership overlap relevant to synergy analysis.`,
    },

    {
      path: '04_DiligenceDocs/10K_2021.pdf',
      type: 'policy',
      content: `AcquiCo Inc. Annual Report FY2021. Revenue $31.7M, net income $1.6M, Adjusted EBITDA $5.5M, total employees 254. Non-recurring and special items: litigation settlement of $2.0M from patent dispute resolved Q2 2021; facility CapEx of $2.4M for warehouse expansion, non-recurring.`,
    },
    {
      path: '04_DiligenceDocs/10K_2022.pdf',
      type: 'policy',
      content: `AcquiCo Inc. Annual Report FY2022. Revenue $44.1M, net income $3.9M, Adjusted EBITDA $5.2M, total employees 254. Non-recurring and special items: real estate sale of Cleveland warehouse, $10.0M gain in Other Revenue; restructuring charge of $3.5M completed in Q3 2022.`,
    },
    {
      path: '04_DiligenceDocs/10K_2023.pdf',
      type: 'policy',
      content: `AcquiCo Inc. Annual Report FY2023. Revenue $34.1M, net income $2.1M, Adjusted EBITDA $6.65M, total employees 254. Non-recurring and special items: no material non-recurring items; clean operating year.`,
    },
    {
      path: '04_DiligenceDocs/earnings_call_transcript_Q4.pdf',
      type: 'policy',
      content: `Q4 and FY2023 earnings call transcript. CFO states normalized Adjusted EBITDA was $6.7M in 2023, $5.2M in 2022, and $5.5M in 2021. Management confirms FY2022 included a $10M one-time Cleveland facility sale gain and a $3.5M restructuring charge; FY2021 included $2M litigation settlement costs. CEO notes strategic acquirer savings in G&A, especially executive duplication and two CFO-adjacent roles.`,
    },
    {
      path: '04_DiligenceDocs/management_presentation.pdf',
      type: 'policy',
      content: `Investor presentation. FY2023 financial highlights: Total Revenue $31.7M / $44.1M / $34.1M for FY2021-FY2023; Adjusted EBITDA $5.5M / $5.2M / $6.7M; FY2022 revenue inflated by $10M real estate sale; FY2022 also includes $3.5M restructuring charge; FY2021 included $2.0M litigation settlement. Management targets 6-7% annual revenue growth and EBITDA margin expansion to 23% by FY2027.`,
    },

    {
      path: '05_NewsContext/competitor_press_release.pdf',
      type: 'policy',
      content: `NOISE FILE. Automation Weekly article about AutomateX acquiring RoboCore for $180M. It may inform market valuation but is not AcquiCo-specific financial support.`,
    },
    {
      path: '05_NewsContext/macro_interest_rate_note.pdf',
      type: 'policy',
      content: `NOISE FILE. Internal research note on Fed rates and industrial M&A financing. Not AcquiCo-specific financial data.`,
    },
    {
      path: '05_NewsContext/news_article_reorg_2022.pdf',
      type: 'policy',
      content: `NOISE FILE. IndustrialTech News article on AcquiCo's Cleveland facility sale and expected $10.0M pre-tax gain. May corroborate, but should not be primary support for Task 2.`,
    },
    {
      path: '05_NewsContext/unrelated_contract_draft.pdf',
      type: 'policy',
      content: `NOISE FILE. Draft MSA between AcquiCo and DataSync Partners for IT data migration. Not relevant to financial diligence tasks.`,
    },

    {
      path: '06_Legal/customer_contracts_summary.pdf',
      type: 'policy',
      content: `Customer contract summary. AcquiCo has 87 active customer accounts; top 10 customers represent 48% of FY2023 revenue. Recurring service contracts are 23% of revenue. Eight change-of-control consent rights represent approximately $4.2M in annualized revenue.`,
    },
    {
      path: '06_Legal/material_litigation.pdf',
      type: 'policy',
      content: `Material litigation disclosure as of December 31, 2023. Patent infringement action Smith Industrial Holdings v. AcquiCo resolved in Q2 2021 via settlement payment of $2.0M; no ongoing obligations. Pending employment dispute filed Q3 2023 has estimated exposure of $150K-$400K.`,
    },
  ],

  rubric: [
    {
      n: 1,
      text: 'States exact trial-balance cash & equivalents balances as FY2021=$165,880K, FY2022=$165,960K, FY2023=$166,040K, and notes that balance_sheet_3yr.xlsx shows a conflicting $4,280K/$4,520K/$4,760K series.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 2,
      text: 'Correctly reports Adjusted EBITDA as FY2021=$5,500K, FY2022=$5,200K, FY2023=$6,650K. Accepts support from diligence documents because adjusted_ebitda_bridge.xlsx lists the bridge inputs and one-time adjustment rows, but its final Adjusted EBITDA row has no readable/cached values.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 3,
      text: 'Identifies the FY2021 $2.0M litigation settlement as non-recurring and a positive addback to normalized EBITDA.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 4,
      text: 'Identifies the FY2022 $10.0M real estate sale gain as non-recurring income that should be subtracted from normalized EBITDA / operating performance.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 5,
      text: 'Identifies the FY2022 $3.5M restructuring charge as non-recurring and a positive addback to normalized EBITDA.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 6,
      text: 'Identifies the FY2021 $2.4M facility expansion CapEx spike as non-recurring CapEx and does not incorrectly treat it as an EBITDA addback.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 7,
      text: 'Personnel synergy answer mentions duplicate CEO role, duplicate CFO or CFO-adjacent roles, and G&A overlap in Finance/Accounting and Legal, with an estimated $2M-$4M synergy range or equivalent support.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 8,
      text: 'Does not cite or rely on any 05_NewsContext/ files as primary support for Task 2 one-time item identification.',
      type: 'neg',
      label: 'negative criterion',
    },
  ],
};
