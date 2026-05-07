/**
 * Grader lobby world management script.
 *
 * Does the following in one pass:
 *   1. Renames "Hrishi Invoice World" → "Invoice Approval"
 *   2. Renames "Hrishi Audit World"   → "Audit"
 *   3. Renames the remaining two published worlds (by creation order) → "Sample World 1" / "Sample World 2"
 *   4. Seeds (upserts) the AcquiCo Inc. world into Supabase as a published world
 *
 * Usage:
 *   node scripts/manage-grader-worlds.js
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in .env (or environment).
 */

require('dotenv').config();
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const OWNER_EMAIL          = 'hdgen15@gmail.com';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Missing SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) in .env');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠   SUPABASE_SERVICE_KEY not found — falling back to SUPABASE_ANON_KEY.');
  console.warn('    RLS policies may block writes. Add SUPABASE_SERVICE_KEY for guaranteed access.\n');
}

// ── Supabase REST helper ──────────────────────────────────────────────────────

async function apiCall(endpoint, method = 'GET', body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method,
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer':        'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${method} ${endpoint} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// ── World data loader (mirrors update-hrishi-worlds.js pattern) ───────────────

function loadWorldFile(filePath, varName) {
  const code    = fs.readFileSync(filePath, 'utf8');
  const wrapped = `${code}\nmodule.exports = ${varName};`;
  const tmp     = path.join(os.tmpdir(), `apex_manage_${Date.now()}_${varName}.js`);
  fs.writeFileSync(tmp, wrapped);
  const data = require(tmp);
  fs.unlinkSync(tmp);
  return data;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // ── Step 0: look up owner (needed only for AcquiCo INSERT) ────────────────
  let creatorId = null;
  try {
    const profiles = await apiCall(
      `profiles?email=eq.${encodeURIComponent(OWNER_EMAIL)}&select=id,email,role`,
      'GET'
    );
    if (profiles.length) {
      creatorId = profiles[0].id;
      console.log(`✓  Owner: ${OWNER_EMAIL}  id=${creatorId}\n`);
    } else {
      console.warn(`⚠   Profile for ${OWNER_EMAIL} not found (RLS may be blocking). AcquiCo insert will be skipped if needed.\n`);
    }
  } catch (e) {
    console.warn(`⚠   Could not look up owner profile: ${e.message}. AcquiCo insert may fail.\n`);
  }

  // ── Step 1 & 2: rename Hrishi worlds ──────────────────────────────────────
  const hrishiRenames = [
    { from: 'Hrishi Invoice World', to: 'Invoice Approval' },
    { from: 'Hrishi Audit World',   to: 'Audit' },
  ];

  const renamedIds = new Set();

  for (const { from, to } of hrishiRenames) {
    console.log(`Renaming "${from}" → "${to}"…`);
    const rows = await apiCall(
      `worlds?title=eq.${encodeURIComponent(from)}&select=id,title`,
      'GET'
    );
    if (!rows.length) {
      console.log(`  ⚠  World "${from}" not found — skipping.`);
      continue;
    }
    const { id } = rows[0];
    await apiCall(
      `worlds?id=eq.${id}`,
      'PATCH',
      { title: to, updated_at: new Date().toISOString() }
    );
    renamedIds.add(id);
    console.log(`  ✓  id=${id} renamed to "${to}"`);
  }

  // ── Step 3: rename the remaining two published worlds ─────────────────────
  console.log('\nFetching all published worlds to rename remaining two…');
  const allPublished = await apiCall(
    'worlds?is_published=eq.true&select=id,title,created_at&order=created_at',
    'GET'
  );

  const remaining = allPublished.filter((w) => !renamedIds.has(w.id));

  const sampleNames = ['Sample World 1', 'Sample World 2'];
  for (let i = 0; i < Math.min(remaining.length, sampleNames.length); i++) {
    const w    = remaining[i];
    const name = sampleNames[i];
    console.log(`Renaming "${w.title}" → "${name}"…`);
    await apiCall(
      `worlds?id=eq.${w.id}`,
      'PATCH',
      { title: name, updated_at: new Date().toISOString() }
    );
    console.log(`  ✓  id=${w.id} renamed to "${name}"`);
  }

  if (remaining.length > sampleNames.length) {
    console.log(`\n⚠  ${remaining.length - sampleNames.length} additional published world(s) were not renamed:`);
    remaining.slice(sampleNames.length).forEach((w) =>
      console.log(`    id=${w.id}  "${w.title}"`)
    );
  }

  // ── Step 4: seed / upsert AcquiCo world ───────────────────────────────────
  console.log('\nSeeding AcquiCo world…');

  const acquiWorld = loadWorldFile(
    path.join(__dirname, '..', 'data-acqui-world.js'),
    'STATIC_ACQUI_WORLD'
  );

  // Add lobby-card metadata
  acquiWorld.meta.archetype             = 'Deals Advisory Data Room';
  acquiWorld.meta.tier                  = 'Tier 3 — Judgment';
  acquiWorld.meta.description           = 'PE diligence on AcquiCo Inc.: reconcile a 3-year data room, identify non-recurring items, build an EBITDA bridge, surface headcount synergies, and resist noise from press coverage.';
  acquiWorld.meta.defaultExpandedFolders = [
    '', '01_Financials', '02_Management', '03_Headcount', '04_Legal', '05_NewsContext',
  ];

  const ACQUI_TITLE = 'AcquiCo Inc.';

  const existing = await apiCall(
    `worlds?title=eq.${encodeURIComponent(ACQUI_TITLE)}&select=id,title`,
    'GET'
  );

  const payloadSize = Math.round(JSON.stringify(acquiWorld).length / 1024);
  console.log(`  Payload size: ~${payloadSize} KB`);

  if (existing.length) {
    // Update existing record (no creator_id needed)
    const { id } = existing[0];
    console.log(`  Found existing id=${id} — updating payload & republishing…`);
    await apiCall(
      `worlds?id=eq.${id}`,
      'PATCH',
      {
        payload:      acquiWorld,
        is_published: true,
        updated_at:   new Date().toISOString(),
      }
    );
    console.log(`  ✓  AcquiCo world updated (id=${id})`);
  } else if (creatorId) {
    // Insert new record
    console.log(`  No existing record — inserting new world…`);
    const [row] = await apiCall('worlds', 'POST', {
      creator_id:   creatorId,
      title:        ACQUI_TITLE,
      is_published: true,
      payload:      acquiWorld,
    });
    console.log(`  ✓  AcquiCo world created (id=${row.id})`);
  } else {
    console.warn(`  ⚠  Cannot insert AcquiCo world: owner lookup failed and no existing record found.`);
    console.warn(`     Add SUPABASE_SERVICE_KEY to .env and re-run, or manually create the world via the UI.`);
  }

  // ── Final summary ─────────────────────────────────────────────────────────
  console.log('\n── Final published worlds ──────────────────────────────────────');
  const final = await apiCall(
    'worlds?is_published=eq.true&select=id,title,created_at&order=title',
    'GET'
  );
  final.forEach((w) => console.log(`  "${w.title}"  id=${w.id}`));
  console.log('\n✅  Done.');
}

main().catch((err) => { console.error(err); process.exit(1); });
