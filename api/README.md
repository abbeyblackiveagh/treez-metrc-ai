# Metrc Bulletin Agent

A web app that pulls official Metrc bulletins for all states directly from metrc.com, summarizes them using Claude AI, and lets you browse, search, and export them.

---

## What it does

- Browse bulletins by state (all 24 Metrc-operated states)
- AI-powered summaries with key points and category tagging
- New bulletin alerts (tracked in your browser)
- Export any state's bulletins to CSV
- Dark mode support

---

## Stack

- **Frontend**: React + Vite
- **Backend**: Vercel serverless function (API proxy)
- **AI**: Anthropic Claude (claude-sonnet-4) with web search

---

## Deploy to Vercel (recommended — free tier works great)

### Step 1 — Get your Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Put the code on GitHub

1. Go to https://github.com/new and create a new repository (name it anything, e.g. `metrc-bulletin-agent`)
2. Upload all these files, or run:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/metrc-bulletin-agent.git
git push -u origin main
```

### Step 3 — Deploy on Vercel

1. Go to https://vercel.com and sign up (free)
2. Click **Add New Project**
3. Import your GitHub repo
4. Under **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from Step 1
5. Click **Deploy**

That's it — Vercel will give you a live URL like `https://metrc-bulletin-agent.vercel.app`

---

## Run locally

```bash
# Install dependencies
npm install

# Add your API key
cp .env.example .env.local
# Edit .env.local and paste your ANTHROPIC_API_KEY

# Start dev server (runs Vite + Vercel functions together)
npx vercel dev
```

Visit http://localhost:3000

---

## Custom domain (optional)

1. Buy a domain at Namecheap, Google Domains, or Cloudflare (~$10-15/year)
2. In Vercel: go to your project → **Settings** → **Domains**
3. Add your domain and follow the DNS instructions
4. Done — usually takes under 10 minutes to go live

---

## Project structure

```
metrc-bulletin-agent/
├── api/
│   └── claude.js          # Serverless proxy — keeps API key secure
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main UI component
│   ├── App.css             # Styles
│   ├── api.js              # Claude API calls
│   └── index.css           # Global styles
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
└── .env.example
```

---

## Security note

Your `ANTHROPIC_API_KEY` lives only in Vercel's environment variables — it is never sent to the browser. All API calls from the frontend go to `/api/claude` (your own serverless function), which adds the key server-side before forwarding to Anthropic.
