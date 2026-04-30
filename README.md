# Accounting APEX — World Viewer

A sandbox environment viewer for benchmarking RL agents on accounting tasks.
Pick an archetype, generate a world with a configurable AI model, browse the files.

## Setup

**1. Install dependencies**
```
npm install
```

**2. Start the server**
```
npm start
```

**3. Open the app**
```
http://localhost:3001
```

**4. Configure an AI provider**
Open the API key modal in the grader, choose Anthropic or OpenAI, select a model, and paste the matching API key. Keys are stored locally in the browser.

## File structure

| File | Purpose |
|------|---------|
| `server.js` | Express proxy — forwards generation requests to Anthropic or OpenAI |
| `index.html` | App shell |
| `styles.css` | All styles |
| `data.js` | Static world data (Pixel & Pine fallback) + archetype definitions + generation prompt |
| `app.js` | UI rendering + generation logic |

## Upgrading to v3

To add more world archetypes or change the generation schema, edit `data.js` only.
`app.js` and `styles.css` don't need to change.
