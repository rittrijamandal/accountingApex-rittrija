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

const AI_PROVIDERS = {
  anthropic: {
    label: 'Anthropic',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    ],
  },
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-4.1',
    models: [
      { id: 'gpt-4.1', label: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ],
  },
};

/**
 * Public config for browser AI provider/model selectors. API keys stay browser-local.
 */
app.get('/api/ai-config', (_req, res) => {
  res.json({
    providers: AI_PROVIDERS,
    defaultProvider: 'anthropic',
  });
});

/**
 * External integration proxy for Expert "Test Grader" / agent tooling.
 * Expects the selected provider key in `x-api-key`.
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

function normalizeAnthropicTextContent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((block) => block?.type === 'text' && block.text)
    .map((block) => block.text)
    .join('\n');
}

function normalizeOpenAiMessages(messages = [], system) {
  const out = [];
  if (system) out.push({ role: 'system', content: system });

  for (const msg of messages) {
    if (!msg || !msg.role) continue;

    if (Array.isArray(msg.content)) {
      const toolResults = msg.content.filter((block) => block?.type === 'tool_result');
      const text = normalizeAnthropicTextContent(msg.content);

      if (msg.role === 'assistant') {
        const toolCalls = msg.content
          .filter((block) => block?.type === 'tool_use')
          .map((block) => ({
            id: block.id,
            type: 'function',
            function: {
              name: block.name,
              arguments: JSON.stringify(block.input || {}),
            },
          }));
        out.push({
          role: 'assistant',
          content: text || null,
          ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
        });
        continue;
      }

      if (toolResults.length) {
        for (const block of toolResults) {
          out.push({
            role: 'tool',
            tool_call_id: block.tool_use_id,
            content: String(block.content || ''),
          });
        }
        if (text) out.push({ role: 'user', content: text });
        continue;
      }

      out.push({ role: msg.role, content: text });
      continue;
    }

    out.push({ role: msg.role, content: String(msg.content || '') });
  }

  return out;
}

function normalizeOpenAiTools(tools = []) {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description || '',
      parameters: tool.input_schema || { type: 'object', properties: {} },
    },
  }));
}

function normalizeOpenAiResponse(data) {
  const message = data?.choices?.[0]?.message || {};
  const content = [];
  if (message.content) content.push({ type: 'text', text: message.content });
  for (const call of message.tool_calls || []) {
    let input = {};
    try { input = JSON.parse(call.function?.arguments || '{}'); } catch (_) {}
    content.push({
      type: 'tool_use',
      id: call.id,
      name: call.function?.name,
      input,
    });
  }
  return {
    id: data.id,
    model: data.model,
    content,
    stop_reason: message.tool_calls?.length ? 'tool_use' : 'end_turn',
    usage: data.usage,
  };
}

function usesOpenAiCompletionTokenLimit(model = '') {
  return /^(gpt-5|gpt-4\.1|o[134]|o\d)/i.test(String(model));
}

async function openAiChatCompletionsPost(apiKey, body, res) {
  try {
    const model = body.model || AI_PROVIDERS.openai.defaultModel;
    const tokenLimit = body.max_completion_tokens || body.max_tokens;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: normalizeOpenAiMessages(body.messages, body.system),
        ...(tokenLimit
          ? usesOpenAiCompletionTokenLimit(model)
            ? { max_completion_tokens: tokenLimit }
            : { max_tokens: tokenLimit }
          : {}),
        ...(Array.isArray(body.tools) && body.tools.length ? { tools: normalizeOpenAiTools(body.tools) } : {}),
      }),
    });
    const data = await response.json();
    res.status(response.status).json(response.ok ? normalizeOpenAiResponse(data) : data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.post('/api/test-grader', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(400).json({ error: 'Missing API key' });
  const provider = String(req.headers['x-ai-provider'] || req.body.provider || 'anthropic').toLowerCase();
  if (provider === 'openai') return openAiChatCompletionsPost(apiKey, req.body, res);
  if (provider !== 'anthropic') return res.status(400).json({ error: `Unsupported AI provider: ${provider}` });
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
    console.log(`  AI proxy:             POST /api/test-grader\n`);
  });
}
