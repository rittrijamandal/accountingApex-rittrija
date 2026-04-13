require('dotenv').config();
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

const SUPABASE_URL     = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

app.use(express.json({ limit: '2mb' }));

/** Public config for browser Supabase client (anon key is safe with RLS). */
app.get('/api/bootstrap', (_req, res) => {
  res.json({
    supabaseUrl:     SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  });
});

/**
 * Sole external integration: Claude Messages API for Expert "Test Grader" / agent tooling.
 * Expects Anthropic API key in `x-api-key` (browser continues to supply the caller's key until Phase 2+ server-side secrets).
 */
async function anthropicMessagesPost(apiKey, body, res) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.post('/api/test-grader', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(400).json({ error: 'Missing API key' });
  await anthropicMessagesPost(apiKey, req.body, res);
});

// Ensure root always resolves on serverless platforms.
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(path.join(__dirname)));

// Vercel serverless entrypoint
module.exports = app;

// Local dev server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  APEX server running at http://localhost:${PORT}`);
    console.log(`  Home (auth redirect): http://localhost:${PORT}/`);
    console.log(`  Sample world viewer:  http://localhost:${PORT}/viewer.html`);
    console.log(`  Agent runner UI:      http://localhost:${PORT}/agent.html`);
    console.log(`  Claude proxy only:    POST /api/test-grader\n`);
  });
}
