# Optional: LLM-powered assistant

The site ships with a browser-side FAQ assistant (`assets/assistant.js`) that needs no server.
This folder upgrades it to a Claude-powered assistant that can answer free-form questions
from the same knowledge (FAQ + catalog, generated into `knowledge.md` by `build.py`).

## Setup (about 10 minutes)
1. Get an API key at console.anthropic.com.
2. Cloudflare dashboard → Workers & Pages → Create → Worker → "Quick edit" → paste `assistant-worker.js` → Deploy.
3. Worker → Settings → Variables: add secret `ANTHROPIC_API_KEY`, text `SITE_URL` (your site URL), text `ALLOWED_ORIGIN` (your site origin).
4. In `assets/catalog.js` add `NM.assistantEndpoint = "https://<your-worker>.workers.dev";` then `python3 build.py`, commit, push.

If the worker is unreachable the widget silently falls back to the local FAQ engine.

## Cost (Claude Opus 5.5, $4 / $20 per MTok, cached system prompt $0.20 per MTok)
The knowledge base is ~4k tokens and is cached, so a typical question costs about half a cent. 1,000 questions ≈ $5. Cloudflare free tier covers 100k requests/day.

## Keep it safe
- The key lives only in the Worker secret, never in the site.
- The worker only accepts the last 10 turns, 2,000 chars each, from `ALLOWED_ORIGIN`.
- Add a Cloudflare rate-limiting rule (e.g. 30 requests/min per IP) if the widget gets abused.
