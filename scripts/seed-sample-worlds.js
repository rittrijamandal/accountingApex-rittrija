/**
 * One-time seed: insert Meridian Systems (invoice world) and Crestline Consulting (audit world)
 * into Supabase as worlds owned by a specific user account, marked is_published = true.
 *
 * Usage:
 *   1. Add SUPABASE_SERVICE_KEY to your .env (Supabase Dashboard → Settings → API → service_role key)
 *   2. node scripts/seed-sample-worlds.js
 */

require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OWNER_EMAIL = 'hdgen15@gmail.com';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

// Load static world data (files use `const X = {...}` without module.exports)
function loadWorldData(filePath) {
  const fs = require('fs');
  const code = fs.readFileSync(filePath, 'utf8');
  // Wrap in a function that returns the value
  const varName = filePath.includes('audit') ? 'STATIC_AUDIT_WORLD' : 'STATIC_WORLD';
  const wrapped = `${code}; module.exports = ${varName};`;
  const tmp = require('os').tmpdir() + `/apex_seed_${Date.now()}_${varName}.js`;
  fs.writeFileSync(tmp, wrapped);
  const data = require(tmp);
  fs.unlinkSync(tmp);
  return data;
}

async function apiCall(path, method, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  // Look up the owner's user ID
  const profiles = await apiCall(`profiles?email=eq.${encodeURIComponent(OWNER_EMAIL)}&select=id,email,role`, 'GET');
  if (!profiles.length) {
    console.error(`No profile found for ${OWNER_EMAIL}. Make sure the account exists and has logged in at least once.`);
    process.exit(1);
  }
  const { id: creatorId, role } = profiles[0];
  console.log(`Found user: ${OWNER_EMAIL}  id=${creatorId}  role=${role}`);

  if (!['expert', 'admin'].includes(role)) {
    console.warn(`Warning: ${OWNER_EMAIL} has role "${role}". Worlds insert policy requires expert or admin.`);
    console.warn('The service role key bypasses RLS so the insert will still work, but the user will not be able to edit the worlds from the UI until their role is upgraded.');
  }

  const invoiceWorld = loadWorldData('data-invoice-world.js');
  const auditWorld = loadWorldData('data-audit-world.js');

  // Add lobby card metadata to each world's meta
  invoiceWorld.meta.archetype = 'Invoice Approval';
  invoiceWorld.meta.tier = 'Tier 2 — Execution';
  invoiceWorld.meta.description = 'Multi-level invoice approval hierarchy: process invoices across company, team, and employee levels. Navigate policy conflicts, escalation rules, and duplicate detection.';
  invoiceWorld.meta.defaultExpandedFolders = ['', 'company_invoices', 'leadership', 'engineering', 'engineering/team_invoices', 'marketing', 'marketing/team_invoices', 'operations', 'operations/team_invoices'];

  auditWorld.meta.archetype = 'Financial Audit';
  auditWorld.meta.tier = 'Tier 3 — Judgment';
  auditWorld.meta.description = 'Q1 2025 external audit engagement: verify payroll, revenue, and expenses across 78 files. Identify discrepancies, complete the four-tab work paper, and render an audit opinion.';
  auditWorld.meta.defaultExpandedFolders = ['Audit_Workpapers', 'Audit_Workpapers/Q1_2025_Workpaper_Template', 'Finance', 'Finance/Statements', 'Finance/Statements/Q1_2025', 'HR', 'Accounts_Payable', 'Accounts_Receivable', 'Banking'];

  const worlds = [
    { title: 'Meridian Systems, Inc.',     payload: invoiceWorld },
    { title: 'Crestline Consulting Group', payload: auditWorld   },
  ];

  for (const { title, payload } of worlds) {
    const payloadStr = JSON.stringify(payload);
    const kb = Math.round(payloadStr.length / 1024);
    console.log(`\nInserting "${title}" (~${kb} KB payload)…`);

    // Check if already exists (avoid duplicates on re-run)
    const existing = await apiCall(
      `worlds?creator_id=eq.${creatorId}&title=eq.${encodeURIComponent(title)}&select=id,title`,
      'GET'
    );
    if (existing.length) {
      console.log(`  → Already exists (id=${existing[0].id}), skipping.`);
      continue;
    }

    const [row] = await apiCall('worlds', 'POST', {
      creator_id: creatorId,
      title,
      is_published: true,
      payload,
    });
    console.log(`  → Created: id=${row.id}  is_published=${row.is_published}`);
  }

  console.log('\nDone. Both worlds are now owned by', OWNER_EMAIL, 'and published.');
}

main().catch((err) => { console.error(err); process.exit(1); });
// Run with: node scripts/seed-sample-worlds.js --list  to see all worlds
// Run with: node scripts/seed-sample-worlds.js --cleanup  to remove old duplicates
