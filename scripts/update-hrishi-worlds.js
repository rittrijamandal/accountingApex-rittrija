/**
 * Update "Hrishi Invoice World" and "Hrishi Audit World" in Supabase
 * with the latest world data from data-invoice-world.js and data-audit-world.js.
 *
 * Preserves lobby-card metadata (archetype, tier, description, defaultExpandedFolders)
 * from the existing Supabase record while overwriting files, rubric, and taskPrompt.
 *
 * Usage: node scripts/update-hrishi-worlds.js
 */

require('dotenv').config();
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

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

function loadWorldFile(filePath, varName) {
  const code = fs.readFileSync(filePath, 'utf8');
  const wrapped = `${code}\nmodule.exports = ${varName};`;
  const tmp = path.join(os.tmpdir(), `apex_update_${Date.now()}_${varName}.js`);
  fs.writeFileSync(tmp, wrapped);
  const data = require(tmp);
  fs.unlinkSync(tmp);
  return data;
}

async function main() {
  const invoiceWorld = loadWorldFile('data-invoice-world.js', 'STATIC_WORLD');
  const auditWorld   = loadWorldFile('data-audit-world.js',   'STATIC_AUDIT_WORLD');

  const updates = [
    { title: 'Hrishi Invoice World', newWorld: invoiceWorld },
    { title: 'Hrishi Audit World',   newWorld: auditWorld   },
  ];

  for (const { title, newWorld } of updates) {
    console.log(`\nUpdating "${title}"…`);

    // Fetch existing record
    const rows = await apiCall(
      `worlds?title=eq.${encodeURIComponent(title)}&select=id,title,payload`,
      'GET'
    );
    if (!rows.length) {
      console.error(`  ✗ World "${title}" not found in Supabase.`);
      continue;
    }
    const { id, payload: existing } = rows[0];
    console.log(`  Found id=${id}`);

    // Preserve lobby-card meta fields from existing payload
    const preservedMeta = {};
    for (const key of ['archetype','tier','description','defaultExpandedFolders']) {
      if (existing?.meta?.[key] != null) {
        preservedMeta[key] = existing.meta[key];
      }
    }

    // Merge: new world data + preserved lobby fields
    const newPayload = {
      ...newWorld,
      meta: { ...newWorld.meta, ...preservedMeta },
    };

    const kb = Math.round(JSON.stringify(newPayload).length / 1024);
    console.log(`  Payload size: ~${kb} KB`);
    console.log(`  Files: ${newWorld.files?.length ?? 0}  Rubric: ${newWorld.rubric?.length ?? 0}`);

    // PATCH the world
    await apiCall(
      `worlds?id=eq.${id}`,
      'PATCH',
      { payload: newPayload, updated_at: new Date().toISOString() }
    );
    console.log(`  ✓ Updated successfully`);
  }

  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
