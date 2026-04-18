# AI Watchdog: Cinematic Login Gate

A Next.js login screen with a cinematic "security scan" animation sequence and an **AI-assisted risk assessment** that decides whether to allow the login. The visual scan is pure animation; the AI verdict is a real call to Claude running behind a server-side API route.

## What's Real vs What's Theater

| Feature | Status | Details |
|---------|--------|---------|
| Security scan animation | 🎬 Animation | Procedurally-generated logs (memory addresses, ports, neural network references) for visual effect |
| AI login risk scoring | ✅ Real | Claude evaluates the username via `POST /api/validate` and returns `{ allow, risk, reason }` |
| Dashboard access | ✅ Real | Successful login renders the dashboard; denied login shows failure overlay |

This is a **polished demo**, not endpoint protection software. It's a login UX that happens to have an actual LLM under the hood.

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- An [Anthropic API key](https://console.anthropic.com/dashboard/api-keys)

### Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/Bipu2937/AI-Watchdog.git
   cd AI-Watchdog
   npm install
   ```

2. **Add your API key:**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and set:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...your-key-here...
   ```
   `.env.local` is gitignored — your key stays local and is never committed.

3. **Run the dev server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## Usage

### Login Flow

1. **Enter a username** in the login form
2. **Watch the animation** — the "security scan" plays while Claude evaluates the risk
3. **See the verdict:**
   - ✅ **Allow path** — Username looks clean → animation succeeds → dashboard loads
   - ❌ **Deny path** — Username flagged as risky → animation fails → "Lockdown" overlay shows

### Try These Usernames

| Username | Expected Outcome | Why |
|----------|------------------|-----|
| `alice` | ✅ Allow | Normal, plausible name |
| `jdoe` | ✅ Allow | Looks like a real person |
| `hacker` | ❌ Deny | Obvious attacker handle |
| `admin'--` | ❌ Deny | SQL injection attempt |
| `root` | ❌ Deny | Privileged account handle |
| `"; DROP TABLE users;--` | ❌ Deny | Injection payload |

Claude **doesn't use a hardcoded blocklist** — it evaluates each username at inference time. The examples above are illustrative; unusual usernames may still pass if they look plausible.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ Browser (Client)                                     │
│ ┌──────────────────────────────────────────────┐   │
│ │ LoginForm                                    │   │
│ │ ↓                                            │   │
│ │ SecurityOverlayContext.startScan(username)  │   │
│ │ ├─ Render animation (SecurityScanOverlay)   │   │
│ │ └─ await validateWithAI(username)           │   │
│ │    ├─ POST /api/validate                    │   │
│ │    │  (fetch wrapper, no key exposure)      │   │
│ │    └─ return { allow: boolean }             │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Server (Next.js API Route)                           │
│ ┌──────────────────────────────────────────────┐   │
│ │ pages/api/validate.ts                        │   │
│ │ ├─ Read ANTHROPIC_API_KEY from process.env  │   │
│ │ ├─ Call client.messages.parse() with:       │   │
│ │ │  ├─ model: claude-opus-4-7                │   │
│ │ │  ├─ thinking: adaptive                    │   │
│ │ │  ├─ output_config: Zod schema validation  │   │
│ │ │  └─ system: risk assessment prompt        │   │
│ │ └─ Return { allow, risk, reason }           │   │
│ │    (or failsafe-deny on any error)          │   │
│ └──────────────────────────────────────────────┘   │
│         ↓                                            │
│ ┌──────────────────────────────────────────────┐   │
│ │ Anthropic API                                │   │
│ │ Claude evaluates username & returns verdict │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Key Design Points:**

- **API key security:** The `ANTHROPIC_API_KEY` stays on the server. The client never sees it. The browser's Network tab will show `POST /api/validate` with a username, but no secret.
- **Structured outputs:** The server uses `messages.parse()` with a Zod schema to guarantee `{ allow, risk, reason }` structure. No hand-rolled JSON parsing.
- **Failsafe:** If the API call fails, the route returns `{ allow: false }` so the animation completes and the login is denied — no crashes or exposed errors.
- **Adaptive thinking:** Claude uses `thinking: { type: "adaptive" }` to decide how much reasoning is needed per username. Typical latency is 1–3 seconds.

---

## Customization

### Change the Model

To use a cheaper/faster model (e.g., `claude-haiku-4-5`), edit `pages/api/validate.ts`:

```typescript
const message = await client.messages.parse({
  model: 'claude-haiku-4-5',  // ← change here
  // ... rest of config
});
```

Haiku is a good fit here — it's a one-shot classification task. Opus is overkill but still works.

### Adjust Risk Assessment Rules

The system prompt in `pages/api/validate.ts` defines what Claude looks for:

```typescript
const SYSTEM_PROMPT = `You are a login risk assessor for a demo web application.

Given a username string submitted at a login form, return a verdict on whether to allow the session.

Deny (allow: false) when the username shows hallmarks of abuse or clearly isn't a real person:
- Obvious attacker handles: "hacker", "root", "admin'--", "administrator"
- Injection payloads: SQL fragments, shell metacharacters, angle brackets, null bytes
- Credential-stuffing tells: random hex strings, emails with known breach corpora
- Extreme length, non-printable characters, or encoded payloads

Allow (allow: true) for anything that looks like a plausible real username.

...`;
```

Edit this prompt to change what Claude considers risky.

### Theme & Animation

The UI is powered by Framer Motion. To customize:

- **Layout & styling:** `styles/globals.css`, `components/LoginForm.tsx`, `components/SecurityScanOverlay.tsx`
- **Animation timing & effects:** `context/SecurityOverlayContext.tsx` (controls log timing and overlay behavior)
- **Color scheme:** Edit CSS variables in `globals.css`

---

## Production Notes

⚠️ **This is a demo.** Before production:

1. **Rate limiting:** Add rate limiting to `/api/validate` to prevent brute-force abuse.
2. **Logging:** Log all login attempts (successful and denied) to your security system.
3. **HTTPS only:** Always use HTTPS in production to protect the API key in transit.
4. **Environment:** Use a secrets manager (GitHub Actions Secrets, AWS Secrets Manager, etc.) instead of `.env.local` files.
5. **CORS:** If the frontend and API are on different domains, configure CORS appropriately.
6. **Real auth:** After the AI risk check passes, implement proper authentication (passwords, MFA, sessions, etc.) — this demo skips that entirely.

---

## Troubleshooting

### Build fails with "Turbopack build failed"
Ensure `package.json` has `"type": "module"` (ESM), not `"type": "commonjs"`. All source files use ESM syntax.

### API returns `{ allow: false, reason: "validation unavailable" }`
- Check that `ANTHROPIC_API_KEY` is set in `.env.local`
- Check server logs for the actual error
- Ensure the key has API access enabled in the Anthropic console

### Login hangs without response
- Check the browser DevTools console for fetch errors
- Verify the API route is running (`npm run dev` should show `ready - started server on 0.0.0.0:3000`)
- Confirm Claude isn't rate-limited (check Anthropic API dashboard)

---

## License

ISC

---

## Credits

- **UI/Animation:** Framer Motion, Next.js
- **AI Risk Scoring:** Anthropic Claude API
- **Original concept:** [Md Abu Saim](https://github.com/Bipu2937)

---

## Resources

- [Anthropic API Docs](https://platform.anthropic.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion)
- [Zod Validation](https://zod.dev)
