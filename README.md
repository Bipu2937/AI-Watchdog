# AI Watchdog: Cinematic Login Gate

A Next.js login screen with a cinematic "security scan" animation sequence and an AI-assisted risk check that decides whether the session is allowed through. The visual scan is animation; the AI verdict is a real call to Claude behind a server-side API route.

## What's real, what's UI

- **AI login risk scoring** — real. `pages/api/validate.ts` calls Claude and returns a structured `{ allow, risk, reason }` verdict. The username never reaches the browser's network panel holding an API key because the key stays on the server.
- **Security scan overlay** — animation. The memory-address / port / neural-network log lines in `context/SecurityOverlayContext.tsx` are procedurally generated for effect. They are not scanning anything.

If you're looking for a real endpoint protection product, this isn't it. If you want a polished login UX with an actual LLM risk check underneath, this is it.

## Setup

1. Clone the repo.
2. `npm install`
3. Copy the env template and fill in your Anthropic API key:
   ```bash
   cp .env.example .env.local
   # then edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...
   ```
   `.env.local` is gitignored. **Do not** prefix the variable with `NEXT_PUBLIC_` — that would inline the key into the browser bundle.
4. `npm run dev`

## Usage

- Type a plausible username (e.g. `alice`, `jdoe`) → animation plays → Claude allows → dashboard.
- Type `hacker`, `admin'--`, or similar → Claude denies → failure overlay.

The verdict is whatever Claude returns, not a hardcoded list. The examples above are illustrative.

## Architecture

```
LoginForm ──▶ SecurityOverlayContext.startScan(username)
                    │
                    ├── renders animation (SecurityScanOverlay)
                    └── await validateWithAI(username)        [lib/ai-validator.ts]
                               │
                               └── POST /api/validate         [pages/api/validate.ts]
                                          │
                                          └── Anthropic SDK → Claude
                                                     │
                                                     └── structured verdict (zod)
```

Model: `claude-opus-4-7` with adaptive thinking. Swap to `claude-haiku-4-5` in `pages/api/validate.ts` if you want lower latency and cost — this is a single-shot classification and Haiku handles it well.
