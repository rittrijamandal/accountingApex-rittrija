require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function apiCall(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
  });
  return res.json();
}

async function main() {
  const rows = await apiCall('worlds?select=id,title,is_published,created_at,updated_at&order=title,created_at');
  rows.forEach(r => console.log(`${r.id}  "${r.title}"  published=${r.is_published}  created=${r.created_at}`));
}
main().catch(console.error);
