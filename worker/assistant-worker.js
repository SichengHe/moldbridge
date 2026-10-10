/* ============================================================
   MOLDBRIDGE assistant — optional LLM backend (Cloudflare Worker).
   Paste into a Worker (dashboard → Quick edit), set the variables below,
   then set NM.assistantEndpoint = "https://<worker>.workers.dev" in
   assets/catalog.js and rebuild. Without this the site uses the local FAQ engine.

   Variables (Settings → Variables):
     ANTHROPIC_API_KEY   secret  — from console.anthropic.com
     SITE_URL            text    — e.g. https://sichenghe.github.io/moldbridge
     ALLOWED_ORIGIN      text    — e.g. https://sichenghe.github.io  (CORS)
   Raw HTTP is used on purpose: no npm/bundler, one file, pasteable.
   ============================================================ */
const MODEL = "claude-opus-5-5";
let knowledgeCache = { text: "", at: 0 };

const SYSTEM = `You are the customer assistant for a small mold-component company. Answer questions about products, sizing, ordering, delivery and the design-to-mold service using ONLY the knowledge base below. Be concise (2–5 sentences), concrete, and friendly. Reply in the language the customer writes in (English or Chinese). When a product is relevant, name its code and give its page link (e.g. #product-SB). For a slide balancer, pick the size from the mass bands: S 2–6 kg, M 5–15 kg, L 12–35 kg, XL 30–80 kg (use mass × cos(angle from vertical)). If the answer is not in the knowledge base, say so and suggest sending the question to sales via the RFQ page (#rfq); never invent prices, lead times or specs.`;

async function knowledge(env) {
  if (Date.now() - knowledgeCache.at < 10 * 60 * 1000 && knowledgeCache.text) return knowledgeCache.text;
  const r = await fetch(`${env.SITE_URL.replace(/\/$/, "")}/knowledge.md`, { cf: { cacheTtl: 600 } });
  if (!r.ok) throw new Error("knowledge.md " + r.status);
  knowledgeCache = { text: await r.text(), at: Date.now() };
  return knowledgeCache.text;
}
const cors = env => ({ "access-control-allow-origin": env.ALLOWED_ORIGIN || "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" });
const json = (obj, status, env) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", ...cors(env) } });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, env);
    let messages;
    try {
      const body = await request.json();
      messages = (body.messages || []).slice(-10)
        .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.length <= 2000)
        .map(m => ({ role: m.role, content: m.content }));
    } catch { return json({ error: "bad json" }, 400, env); }
    if (!messages.length || messages[0].role !== "user") return json({ error: "messages must start with a user turn" }, 400, env);

    const kb = await knowledge(env);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "server-side-fallback-2026-07-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,                       // short chat answers by design
        output_config: { effort: "low" },       // chat: low effort is enough
        fallbacks: "default",                   // re-run on a fallback model if a safety classifier declines
        system: [
          { type: "text", text: SYSTEM + "\n\n# Knowledge base\n\n" + kb, cache_control: { type: "ephemeral" } },
        ],
        messages,
      }),
    });
    const data = await res.json();
    if (!res.ok) return json({ error: data.error?.message || "upstream error" }, 502, env);
    if (data.stop_reason === "refusal") return json({ reply: "I can't help with that one. Please email sales." }, 200, env);
    const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    return json({ reply, usage: data.usage }, 200, env);
  },
};
