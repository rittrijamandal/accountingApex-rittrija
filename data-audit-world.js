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
      path: 'HR/Employees/Priya_Sharma/salary_amendment_2023.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
SALARY AMENDMENT NOTICE

Date:       December 20, 2022
To:         Priya Sharma, Marketing Manager
From:       Sarah Mitchell, President & CEO

Effective January 1, 2023, your base salary is amended as follows:

  Previous monthly base: $6,000.00
  Amended monthly base:  $6,200.00 ($74,400.00 annually)

This reflects your annual performance review outcome (Rating: Meets Expectations).

Signed: Sarah Mitchell (CEO)           Date: December 20, 2022
Acknowledged: Priya Sharma             Date: December 21, 2022`,
    },
    {
      path: 'HR/Employees/Priya_Sharma/amendment_draft_2025.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
SALARY AMENDMENT — DRAFT

Date:       [DRAFT — NOT EXECUTED]
To:         Priya Sharma, Marketing Manager
From:       Daniel Park, VP Finance

PROPOSED effective January 1, 2025:

  Previous monthly base: $6,200.00
  Proposed monthly base: $6,500.00 ($78,000.00 annually)

  Basis: 4.8% merit increase following 2024 performance review.

*** THIS DOCUMENT IS A DRAFT AND HAS NOT BEEN SIGNED OR EXECUTED ***
*** DO NOT USE AS AUTHORIZATION FOR PAYROLL CHANGES ***

Prepared by: Daniel Park              Date: December 18, 2024
CEO Signature: ____________________   Date: ____________  [PENDING]`,
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
EMP-008,A. Delgado,Project Coordinator,4500.00,0.00,0.00,4500.00
TOTAL,,,$68416.00,$63916.00,$63918.00,$196250.00`,
    },
    {
      path: 'Finance/Payroll/W2_Marcus_Webb_2024.pdf',
      type: 'profile',
      content: `W-2 WAGE AND TAX STATEMENT — TAX YEAR 2024
Employee:       Marcus Webb
SSN:            XXX-XX-5512
Employer:       Crestline Consulting Group, Inc. EIN: 84-XXXXXXX
Box 1 Wages:    $103,000.00
Box 2 Fed Tax:  $17,545.00
Box 3 SS Wages: $103,000.00
Box 4 SS Tax:   $6,386.00
Box 5 Med Wage: $103,000.00
Box 6 Med Tax:  $1,493.50
Box 16 State Wages: $103,000.00  Box 17 State Tax: $5,768.00  State: CO`,
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
2025-03-31,4000-Revenue,Consulting Fees — Lakewood Q1 Variable Component,,7200.00,REV-2025-Q1-04
2025-03-31,4000-Revenue,Performance Fee Accrual — Q1,,4400.00,REV-2025-Q1-05
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
      path: 'Accounts_Payable/Vendors/Granite_Business_Solutions/delivery_confirmation_GBS_2025.pdf',
      type: 'policy',
      content: `FWD: Granite Business Solutions — Service Delivery

-----Original Message-----
From:    Daniel Park <d.park@crestlineconsulting.com>
To:      Accounts Payable <ap@crestlineconsulting.com>
Date:    March 31, 2025 4:47 PM
Subject: FWD: Granite — March engagement wrap-up

AP team — please see Granite's note below confirming March work.
Approve for payment. —DP

-----Forwarded Message-----
From:    info@granitebizgroup.net
To:      d.park@crestlineconsulting.com
Date:    March 28, 2025 9:12 AM
Subject: March engagement wrap-up

Hi Daniel,

Just wanted to confirm we've wrapped up the March project work as discussed.
Let us know if you need anything else from our end.

Best,
G. Rutherford
Granite Business Solutions`,
    },
    {
      path: 'Accounts_Payable/Vendors/Granite_Business_Solutions/delivery_receipt_GBS_signed.pdf',
      type: 'policy',
      content: `DELIVERY & SERVICE RECEIPT

Vendor:   Granite Business Solutions LLC
Client:   Crestline Consulting Group, Inc.
Invoice:  INV-GBS-2025-028
Amount:   $4,800.00
Date:     March 31, 2025

This receipt confirms that consulting services described in the above invoice
were delivered to the satisfaction of the receiving party during March 2025.

Received and accepted by:

Signature: J. Whitmore                Date: March 31, 2025
Title:     Account Manager
Organization: Granite Business Solutions LLC`,
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
      date: 'March 14, 2024',
      amount: '$1,850.00',
      content: `METRO OFFICE SUPPLY CO.
Invoice #: INV-MOS-2024-089
Date:      March 14, 2024
Bill To:   Crestline Consulting Group, Inc.
           1400 16th Street, Suite 600, Denver, CO 80202

Description                          Qty    Unit     Total
Printer paper (case, 5000 sheets)      3  $38.50    $115.50
Ballpoint pens (box of 12)             8   $8.75     $70.00
Binders 3-inch (box of 6)             6   $24.50    $147.00
Toner cartridge HP LaserJet           7  $87.25    $610.75
Whiteboard markers (8-pack)            8   $12.40     $99.20
Hanging file folders (box of 25)      10   $15.25    $152.50
Desk organizer sets (pack of 4)        3  $18.50     $55.50
Correction tape (6-pack)               5   $9.99     $49.99
Miscellaneous supplies                         --    $549.56

Subtotal: $1,850.00   Tax: $0.00   Total: $1,850.00
STATUS: PAID — Q1 2024. Check #3891. Archived.`,
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

Strategic Advisory Retainer — Engagement Ref. SOW-HCG-2025-002:
  Portfolio optimization and advisory services     $28,500.00
  Per engagement agreement SOW-HCG-2025-002 executed March 14, 2025
  Deliverables: Per SOW schedule

Pre-payment received: March 28, 2025 — Wire Transfer $28,500.00`,
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
      content: `Crestline Consulting Group — Q1 2025 Budget vs. Actual (Variance Analysis),,
Account,Actual,Variance_%
REVENUE,,,
Consulting Fees,265500.00,-1.67%
Total Revenue,265500.00,-1.67%
,,,
OPERATING EXPENSES,,,
Payroll & Benefits,191750.00,-0.79%
Rent,12600.00,0.00%
Insurance,5400.00,0.00%
Utilities,1800.00,0.00%
Software & IT Services,8400.00,0.00%
Office Supplies,1850.00,+7.50%
Consulting Services Purchased,4800.00,N/A (unbudgeted)
Courier & Shipping,1400.00,-16.67%
Facilities (Cleaning),3600.00,0.00%
Total Operating Expenses,231600.00,-2.82%
,,,
Net Income,33900.00,-24.24%
,,,
NOTE: Variance_% = (Actual - Budget) / Budget. Positive = favorable (under budget).
Budget figures available in Finance/Budget/budget_FY2025_approved.pdf on request.
Payroll variance driven by headcount and compensation mix; see HR for detail.`,
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
FA-007,Executive Laptop (Dell XPS 15),2025-02-15,3200.00,0.00,80.00,3120.00
TOTALS,,,93200.00,39600.00,43255.00,49945.00
,,,,,,
Depreciation Method: Straight-line
Q1 2025 Depreciation Expense: $3575.00
NOTE: Balance sheet shows Equipment net = $42000. Difference of $7945 vs register total.
FA-007 (Executive Laptop, $3,200) acquired February 2025; no purchase invoice on file in AP.`,
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
Metro Office Supply,INV-MOS-2025-112,2025-02-01,2025-03-03,1850.00,PAID,0 — see also archived INV-MOS-2024-089 (same vendor same amount)
Granite Business Solutions,INV-GBS-2025-028,2025-03-15,2025-03-30,4800.00,OUTSTANDING,1
Swift Courier,INV-SCS-2025-088,2025-01-20,2025-02-19,680.00,PAID,0
Swift Courier,INV-SCS-2025-101,2025-03-15,2025-04-14,720.00,PAID,0
Denver Office Cleaning,INV-DOC-2025-Q1,2025-01-02,2025-01-31,3600.00,PAID,0
Peak Telecom,INV-PT-2025-Jan,2025-01-05,2025-02-04,350.00,PAID,0
Peak Telecom,INV-PT-2025-Feb,2025-02-05,2025-03-07,350.00,PAID,0
Peak Telecom,INV-PT-2025-Mar,2025-03-05,2025-04-04,350.00,PAID,0
,,,,,,
TOTAL OUTSTANDING,,$4800.00,,,`,
    },

    // ══════════════════════════════════════════
    //  HR — Renata Vasquez performance review (no I-9 in folder)
    // ══════════════════════════════════════════

    {
      path: 'HR/Employees/Renata_Vasquez/I9_form_RV.pdf',
      type: 'profile',
      content: `CRESTLINE CONSULTING GROUP, INC.
ONBOARDING ACKNOWLEDGEMENT — EMPLOYMENT ELIGIBILITY

Employee:   Renata Vasquez
Date:       June 17, 2020
HR Contact: Daniel Park (VP Finance)

This document confirms that Renata Vasquez has been advised of the requirement
to provide documentation establishing identity and employment authorization
in accordance with the Immigration Reform and Control Act (IRCA).

Employee acknowledges:
[ ] I have been informed of the requirement to complete Form I-9.
[ ] I understand that failure to provide required documentation may affect
    my employment status.

Employee Signature: Renata Vasquez           Date: June 17, 2020
HR Representative:  Daniel Park              Date: June 17, 2020

NOTE: This acknowledgement form is NOT a substitute for the completed
Form I-9 (U.S. Citizenship and Immigration Services). The original I-9
must be filed separately per federal retention requirements.`,
    },
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

`,
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
EMP-003,Renata Vasquez,2020-06-15,PENDING — VERIFICATION IN PROGRESS,HR/Employees/Renata_Vasquez/I9_form_RV.pdf,2020-06-17
EMP-004,Marcus Webb,2021-04-01,COMPLETE,HR/Employees/Marcus_Webb/I-9.pdf,2024-01-15
EMP-005,Jordan Lee,2022-08-15,COMPLETE,HR/Employees/Jordan_Lee/I-9.pdf,2024-01-15
EMP-006,Priya Sharma,2021-12-01,COMPLETE,HR/Employees/Priya_Sharma/I-9.pdf,2024-01-15
EMP-007,Tom Caruso,2019-11-01,COMPLETE,HR/Employees/Tom_Caruso/I-9.pdf,2024-01-15
EMP-008,A. Delgado,2024-03-01,TERMINATED — Dec 31 2024,N/A,2024-03-01
,,,,,,
Compliance Status: 6/7 active employees verified. 1 item pending resolution. 1 employee terminated Dec 31 2024.`,
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
      path: 'Contracts/Harrington_Capital_Group/kickoff_meeting_notes_mar2025.pdf',
      type: 'policy',
      content: `HARRINGTON CAPITAL MANAGEMENT — CRESTLINE CONSULTING GROUP
KICKOFF MEETING NOTES

Date:        March 28, 2025
Attendees:   Sarah Mitchell (CEO, Crestline), Daniel Park (VP Finance, Crestline),
             R. Harrington (Managing Partner, HCM), M. Torres (COO, HCM)
Location:    Harrington Capital offices, 1700 Lincoln Street, Denver CO

AGENDA AND DISCUSSION

1. ENGAGEMENT OVERVIEW
   Parties reviewed the SOW-HCG-2025-002 scope. Crestline confirmed readiness
   to commence portfolio optimization work as scoped.

2. PRELIMINARY ACTIVITIES COMPLETED (PRE-ENGAGEMENT)
   Sarah Mitchell noted that preliminary data gathering and scope finalization
   activities were conducted during the week of March 24–28. These consisted of:
   - Review of HCM's existing portfolio company financials (read-only access)
   - Internal scoping calls at Crestline to staff the engagement
   - Draft workplan preparation

   R. Harrington acknowledged these preparatory steps and signed the SOW.

3. COMMENCEMENT DATE CONFIRMED
   Both parties confirmed April 1, 2025 as the official service commencement date
   per SOW Section 2. No billable deliverables are due prior to April 1, 2025.

4. INVOICE DISCUSSION
   Daniel Park noted that Crestline had already issued INV-HCG-2025-006 ($28,500)
   dated March 31, 2025 as advance invoicing per SOW Section 4 (prepayment permitted).
   R. Harrington confirmed wire transfer of $28,500 on March 28, 2025.

Next steps: Full engagement kick-off call scheduled April 2, 2025.

Prepared by: Daniel Park, VP Finance     Date: March 28, 2025
Reviewed by: Sarah Mitchell, CEO         Date: March 29, 2025`,
    },
    {
      path: 'Contracts/Harrington_Capital_Group/SOW_HCG_2025_002.pdf',
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
      path: 'Internal_Memos/q1_revenue_review.pdf',
      type: 'policy',
      content: `INTERNAL MEMORANDUM

To:     Sarah Mitchell, President & CEO
From:   Daniel Park, VP Finance
Date:   March 31, 2025
Re:     Q1 2025 Revenue Review — Final Adjustments

Sarah,

Per our discussion last Friday, I am requesting your written approval for the
final Q1 closing entry before we lock the books.

  Date:            March 31, 2025
  Debit:           Accounts Receivable    $11,600.00
  Credit:          Consulting Fee Revenue $11,600.00
  Description:     Q1 consulting performance component — see engagement files

RATIONALE
Certain client engagements have variable fee components earned in Q1 for which
invoices are in preparation. Management has assessed realizability and is
accruing per revenue recognition policy.

Supporting detail is maintained in my working files.
No client-countersigned invoices have been issued as of this date.

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

Q1 2025 included one adjusting entry to revenue ($11,600) representing
management's estimate of earned but unbilled consulting fee components.
Authorization documentation is on file with the VP Finance.

NOTE 3 — PAYROLL
Q1 2025 payroll totaled $196,250 per payroll records. See Finance/Payroll/ for detail. Payroll is processed via
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

NOTE 7 — RELATED PARTIES
Management has reviewed transactions for related-party characteristics.
No related-party transactions requiring ASC 850 disclosure were identified
during Q1 2025.

NOTE 8 — SUBSEQUENT EVENTS
None identified through April 1, 2025.`,
    },

    // ══════════════════════════════════════════
    //  HR POLICIES — travel reimbursement
    // ══════════════════════════════════════════

    {
      path: 'HR/Policies/company_profile.pdf',
      type: 'policy',
      content: `CRESTLINE CONSULTING GROUP, INC. — COMPANY PROFILE
As of January 1, 2025

OVERVIEW
Crestline Consulting Group is a Denver-based management consulting firm
specializing in strategy and operational advisory for mid-market companies.
Founded 2018. 7 employees. Offices: 1400 16th Street, Suite 600, Denver CO.

LEADERSHIP
  President & CEO:    Sarah Mitchell
  VP Finance:         Daniel Park

ADVISORY BOARD
Crestline's Advisory Board provides strategic guidance to leadership.
Current members include industry and client representatives:
  - J. Alderton (former McKinsey partner, retired)
  - R. Harrington (Managing Partner, Harrington Capital Management)
  - L. Voss (COO, Briar Ridge Corp)

MAJOR CLIENTS (Q1 2025)
  Lakewood Industries, GreenPath Solutions, Briar Ridge Corp,
  Westfield Properties, Harrington Capital Management`,
    },
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

PURCHASE HISTORY (per internal records):
  INV-GBS-2025-028   March 2025    $4,800.00   Consulting services
  FA-007 Purchase    February 2025  $3,200.00   Hardware procurement (ref: asset register)

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
      text: 'Identifies the unauthorized salary overpayment for Priya Sharma: pay stubs show $6,500/month, but the only executed salary amendment (HR/Employees/Priya_Sharma/salary_amendment_2023.pdf) authorizes $6,200/month. The 2025 draft amendment proposing $6,500 was never signed. Overpayment is $300/month ($900 for Q1). Agent must evaluate all three documents — offer letter, 2023 amendment, and unsigned 2025 draft — and cite the signed 2023 amendment as the controlling rate. Documents in Tab 1.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 2,
      text: 'Flags the missing I-9 for Renata Vasquez: HR/Employees/Renata_Vasquez/ contains an offer letter and an I9_form_RV.pdf, but the latter is an internal acknowledgement-of-receipt form — not the actual USCIS Form I-9. Agent reads the file content, correctly identifies it as not a valid I-9, and flags the I-9 as missing. Documents in Tab 1.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 3,
      text: 'Identifies the $11,600 unsupported revenue: income statement shows $265,500; five supported client invoices total $253,900. The gap is comprised of two GL entries — REV-2025-Q1-04 ($7,200 labeled as Lakewood variable component) and REV-2025-Q1-05 ($4,400 performance fee accrual). Agent must sum both entries, recognize that INV-2025-001 already covers Lakewood\'s full Q1 engagement, and flag the combined $11,600 as having no invoice or bank receipt support. Documents in Tab 2.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 4,
      text: 'Flags Granite Business Solutions INV-GBS-2025-028 ($4,800) as an unsupported expense: the vendor folder contains two documents — delivery_confirmation_GBS_2025.pdf (a Daniel Park self-forwarded email) and delivery_receipt_GBS_signed.pdf (signed by J. Whitmore of Granite Business Solutions). Agent correctly identifies that both documents originate from or are signed by the vendor itself and neither constitutes an independent third-party receipt. Documents in Tab 3 explaining why vendor-signed receipts do not satisfy independence requirements.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 5,
      text: 'Correctly determines that INV-MOS-2024-089 (Accounts_Payable/Archive/, $1,850, March 14, 2024) is NOT a duplicate of INV-MOS-2025-112 ($1,850, February 11, 2025) despite the identical amounts. Agent reads both invoices, notes different invoice numbers, different dates (14 months apart), and different line items as evidence of distinct purchases. Does not flag as duplicate.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 6,
      text: 'Identifies the Q1 cutoff error for Harrington Capital: INV-HCG-2025-006 is dated March 31 and recorded as Q1 revenue, but SOW-HCG-2025-002 specifies April 1 as the service commencement date. The kickoff_meeting_notes_mar2025.pdf confirms pre-engagement activities are non-billable setup. Agent must address the kickoff memo and explain why preliminary data gathering does not constitute a satisfied ASC 606 performance obligation, concluding that $28,500 belongs in Q2. Documents in Tab 2 citing both the SOW and the meeting notes.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 7,
      text: 'Renders a "Qualified" opinion (not "Clean" and not "Adverse") in tab4_summary_findings.csv. Misstatements are material but contained to two discrete items ($11,600 unsupported revenue + $4,800 unsupported expense); they do not pervasively affect the financial statements, making Adverse unwarranted. Agent must document the materiality threshold judgment, not simply default to the most severe opinion.',
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
      text: 'Transcription accuracy: Renata Vasquez Q1 payroll total ($28,750.00), total AP outstanding ($4,800.00), and the five supported client invoice amounts ($68,400 + $52,800 + $38,500 + $41,000 + $24,800 = $253,900) are all recorded in the workpaper without digit-transposition or rounding errors. These figures are independent of the salary discrepancy finding and test whether the agent copies numbers faithfully from source documents.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 10,
      text: 'Flags the Daniel Park conflict of interest: Daniel Park (VP Finance) both registered Granite Business Solutions as a vendor (Accounts_Payable/Vendors/Granite_Business_Solutions/vendor_registration.pdf) and authorized the $4,800 payment with no contract on file — a single individual controlling vendor onboarding and payment approval for the same vendor. Agent flags this as a segregation-of-duties deficiency or related-party risk in Tab 3 or Tab 4.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 11,
      text: 'Identifies the $5,400 GL cash overstatement: Banking/Reconciliation/reconciliation_Q1_2025.csv shows GL cash balance of $285,999.00 vs. adjusted bank balance of $280,599.00. The $5,400 difference is explained by a Hartford Insurance premium debited from the bank on March 31 but recorded in the GL as Dr Prepaid / Cr AP rather than Cr Cash — leaving cash overstated by $5,400. Agent documents this in Tab 3 or Tab 4 with both the GL figure and bank figure cited.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 12,
      text: 'Applies analytical review using budget_vs_actual_Q1_2025.csv: the file shows revenue variance of -1.67%. Agent back-calculates the implied budget ($265,500 / (1 - 0.0167) ≈ $270,000), then connects that the $11,600 unsupported accrual (REV-2025-Q1-04 + REV-2025-Q1-05) bridges the gap between supported revenue ($253,900) and budget — flagging this as an earnings management red flag. Agent must show the arithmetic and explicitly name budget proximity as an analytical concern in Tab 2 or Tab 4.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 13,
      text: 'Identifies the related-party conflict for Harrington Capital: HR/Policies/company_profile.pdf lists R. Harrington (Managing Partner, Harrington Capital Management) as a member of Crestline\'s Advisory Board, while Harrington Capital is also Crestline\'s largest Q1 client (INV-HCG-2025-006, $28,500). Note 7 of the financial statements states no related-party transactions were identified — agent must contradict this, flag R. Harrington\'s dual role as advisory board member and client, and note that ASC 850 disclosure is required. Documents in Tab 2 or Tab 4.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 14,
      text: 'Flags the post-termination payroll payment for EMP-008 (A. Delgado): Finance/Payroll/pay_stubs_Q1_2025.csv shows EMP-008 received $4,500 in January 2025, but HR/Compliance/I9_tracking_log.csv shows EMP-008 was terminated December 31, 2024. No offer letter, I-9, or W-2 exists in any HR folder for this employee. Agent flags this as a potential ghost-employee or post-termination fraud risk and documents in Tab 1 or Tab 4.',
      type: 'det',
      label: 'deterministic',
    },
    {
      n: 15,
      text: 'Flags FA-007 (Executive Laptop, $3,200) in Finance/Fixed_Assets/asset_register_Q1_2025.csv as a potentially fictitious asset: no purchase invoice exists in Accounts_Payable/ for this acquisition, but Accounts_Payable/Vendors/Granite_Business_Solutions/vendor_registration.pdf shows Granite as the supplier. This extends the Daniel Park / Granite conflict-of-interest pattern into capital expenditures — a single individual procured and registered a capital asset with no independent purchase documentation. Documents in Tab 3 or Tab 4.',
      type: 'llm',
      label: 'llm judge',
    },
    {
      n: 16,
      text: 'Identifies the Marcus Webb W-2 anomaly: Finance/Payroll/W2_Marcus_Webb_2024.pdf shows 2024 Box 1 wages of $103,000, but Q1 2025 pay stubs show $9,167/month ($110,004 annualized). The $7,004 gap cannot be explained by the known Q1 2025 figures alone \u2014 it implies either a mid-2024 undocumented salary increase or a 2024 payroll error. Agent flags this discrepancy and notes no salary amendment document exists in HR/Employees/Marcus_Webb/ to explain the change. Documents in Tab 1.',
      type: 'llm',
      label: 'llm judge',
    },
  ],
};
