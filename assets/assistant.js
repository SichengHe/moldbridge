/* ============================================================
   MOLDBRIDGE assistant — FAQ + catalog answer bot.
   Runs in the browser (no server, no key). If NM.assistantEndpoint is
   set (see worker/README.md) questions go to that endpoint first and
   fall back to the local engine on any error.
   ============================================================ */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const isZh = t => /[一-鿿]/.test(t);
  const norm = t => t.toLowerCase().replace(/[“”"'’!?？！。，,.;:()（）]/g, " ").replace(/\s+/g, " ").trim();
  const money = n => "$" + n.toFixed(2);

  /* product keyword map (EN + 中文) */
  const PKW = {
    SB: ["balancer", "slide balancer", "gravity", "counterweight", "平衡器", "配重"],
    SR: ["retainer", "slide lock", "detent", "quicklock", "滑块锁", "定位"],
    MS: ["mini slide", "core cam", "small slide", "cam unit", "迷你滑块", "斜楔"],
    LC: ["lifter", "flex lifter", "coupling", "斜顶", "斜顶座"],
    TE: ["two-stage", "two stage", "double ejection", "两级顶出", "二次顶出"],
    AE: ["accelerated", "accelerator", "加速顶出"],
    SP: ["stepped pin", "ejector pin", "step pin", "阶梯顶针", "顶针"],
    GB: ["bushing", "guide bush", "self-lube", "graphite", "导套", "自润滑"],
    DS: ["date stamp", "date insert", "date code", "日期章", "日期码"],
    CM: ["cycle monitor", "counter", "cycle count", "bluetooth", "计数器", "监控"],
    VI: ["vent", "venting", "porous", "sintered", "排气", "烧结"],
    HC: ["cylinder", "hydraulic", "core pull", "油缸", "抽芯"],
  };
  const SB_BANDS = { S: [2, 6], M: [5, 15], L: [12, 35], XL: [30, 80] };

  function findProducts(text) {
    const t = norm(text), hits = new Set();
    const code = text.match(/\b(SB|SR|MS|LC|TE|AE|SP|GB|DS|CM|VI|HC)(?:-[\w.]+)?\b/gi);
    if (code) code.forEach(c => hits.add(c.split("-")[0].toUpperCase()));
    Object.entries(PKW).forEach(([id, kws]) => { if (kws.some(k => t.includes(k))) hits.add(id); });
    return [...hits].map(id => NM.byId(id)).filter(Boolean);
  }
  function scoreFaq(text) {
    const t = " " + norm(text) + " ";
    return NM.faq.map(f => ({ f, s: f.kw.reduce((a, k) => a + (t.includes(k.toLowerCase()) ? (k.length >= 8 ? 3 : k.length >= 3 || /[\u4e00-\u9fff]/.test(k) ? 2 : 1) : 0), 0) }))
      .filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  }
  const leadText = p => p.stock ? `in stock, ships in ${p.lead} days` : `made to order, ${p.lead} days`;
  const defaults = p => { const c = {}; (p.config?.fields || []).forEach(f => c[f.key] = f.opts[0]); return c; };
  const productCard = (p, zh) => {
    const price = p.config ? p.config.price(defaults(p)) : null;
    return `<div class="ai-card"><div class="ai-card-t"><b>${p.code}</b> ${esc(p.name)}</div><div>${esc(p.tag)}</div>
      <div class="ai-card-m">${price != null ? "from " + money(price) + " · " : ""}${leadText(p)}</div>
      <a href="#product-${p.id}" class="ai-link">${zh ? "打开产品页，选规格" : "Open and configure"} →</a></div>`;
  };

  /* ---- local engine: returns {html, chips?} ---- */
  function answer(text) {
    const zh = isZh(text), t = norm(text);
    // greeting
    if (/^(hi|hello|hey|你好|您好|在吗|hola)\b/.test(t) || t.length < 2) {
      return { html: zh ? "你好，我可以回答交期、价格、选型、安装和工程服务的问题。试试下面的问题，或直接输入。" : "Hi. I can answer questions on lead times, prices, sizing, installation and our engineering service. Try one of the suggestions or type your own.", chips: true };
    }
    // slide mass → SB size
    const kg = text.match(/(\d+(?:[.,]\d+)?)\s*(kg|公斤|千克)/i);
    if (kg && (t.includes("slide") || t.includes("balanc") || t.includes("滑块") || t.includes("平衡") || t.includes("sb") || !findProducts(text).some(p => p.id !== "SB"))) {
      const m = parseFloat(kg[1].replace(",", "."));
      const fit = Object.entries(SB_BANDS).find(([, [lo, hi]]) => m >= lo && m <= hi);
      const W = m * 9.81, p = NM.byId("SB");
      if (!fit) return { html: m < 2 ? (zh ? `${m} kg 的滑块不需要平衡器，一个弹簧柱塞就够了。` : `A ${m} kg slide does not need a balancer; a spring plunger holds it.`) : (zh ? `${m} kg 超过单个 XL 的 80 kg 上限，需要两个 SB-XL 并联。请发 RFQ，我们按滑块尺寸出方案。` : `${m} kg is above the 80 kg limit of one XL unit. Two SB-XL in tandem cover it; send an RFQ with the slide dimensions and we lay it out.`) };
      const c = { size: fit[0], s: "60" };
      return { html: (zh ? `${m} kg 的滑块选 <b>SB-${fit[0]}</b>（${fit[1][0]}–${fit[1][1]} kg）。重力 ${W.toFixed(0)} N，每个弹簧预载 ${(W / 2).toFixed(0)} N。行程 60 mm 时零件号 ${p.config.pn(c)}，${money(p.config.price(c))}。` : `For a ${m} kg slide use <b>SB-${fit[0]}</b> (${fit[1][0]}–${fit[1][1]} kg). Weight ${W.toFixed(0)} N, preload ${(W / 2).toFixed(0)} N per spring. With a 60 mm stroke the part number is ${p.config.pn(c)} at ${money(p.config.price(c))}.`) + `<br><a class="ai-link" href="#product-SB_${fit[0]}_60">${zh ? "打开并调整行程" : "Open and adjust the stroke"} →</a>` };
    }
    // undercut + angle → lifter stroke
    const uc = text.match(/(?:undercut|倒扣)\D{0,12}(\d+(?:\.\d+)?)/i), ang = text.match(/(\d+(?:\.\d+)?)\s*(?:°|deg|degrees|度)/i);
    if (uc && ang) {
      const u = +uc[1], a = +ang[1], S = (u + 1) / Math.tan(a * Math.PI / 180);
      return { html: (zh ? `倒扣 ${u} mm、斜顶角 ${a}°，加 1 mm 间隙，需要顶出行程 <b>${S.toFixed(1)} mm</b>（= (${u} + 1) / tan ${a}°）。` : `Undercut ${u} mm at ${a}° with 1 mm clearance needs a plate stroke of <b>${S.toFixed(1)} mm</b> (= (${u} + 1) / tan ${a}°).`) + ` <a class="ai-link" href="#product-LC">${zh ? "斜顶座页面有计算器" : "The LC page has the calculator"} →</a>` };
    }
    const prods = findProducts(text), faqs = scoreFaq(text);
    const asksPrice = /(price|cost|how much|价格|多少钱|报价)/.test(t), asksLead = /(lead|ship|delivery|how long|交期|发货|多久)/.test(t);
    // product-specific price / lead
    if (prods.length && (asksPrice || asksLead) && !(faqs[0] && faqs[0].s > 3)) {
      return { html: prods.slice(0, 3).map(p => productCard(p, zh)).join("") + (asksPrice ? `<div class="ai-note">${zh ? "标价为美元出厂价、单件；50 件以上有批量价。" : "List prices are USD, EXW, per piece; volume pricing from 50 pcs."}</div>` : "") };
    }
    // FAQ match
    if (faqs.length && faqs[0].s >= 2) {
      const f = faqs[0].f;
      let html = `<div class="ai-q">${esc(zh && f.zh_q ? f.zh_q : f.q)}</div>${esc(zh && f.zh ? f.zh : f.a)}`;
      if (f.link) html += `<br><a class="ai-link" href="${f.link[0]}">${esc(f.link[1])} →</a>`;
      const more = faqs.slice(1, 3).filter(x => x.s >= 2).map(x => `<button class="ai-chip" data-q="${esc(x.f.q)}">${esc(zh && x.f.zh_q ? x.f.zh_q : x.f.q)}</button>`).join("");
      if (more) html += `<div class="ai-chips">${more}</div>`;
      return { html };
    }
    // product only
    if (prods.length) return { html: prods.slice(0, 3).map(p => productCard(p, zh)).join("") };
    // fallback
    return {
      html: (zh ? "这个问题 FAQ 里没有。把它发给销售工程师，一个工作日内回复：" : "That one is not in the FAQ. Send it to a sales engineer and you get an answer within one working day:")
        + `<div class="ai-chips"><button class="ai-chip ai-chip-acc" data-rfq="${esc(text)}">${zh ? "发给销售（RFQ）" : "Send to sales (RFQ)"}</button><a class="ai-chip" href="#faq">${zh ? "浏览全部 FAQ" : "Browse the FAQ"}</a></div>`,
    };
  }

  /* ---- remote (optional) ---- */
  async function remote(history) {
    const r = await fetch(NM.assistantEndpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.slice(-10) }) });
    if (!r.ok) throw new Error("endpoint " + r.status);
    const d = await r.json();
    if (!d.reply) throw new Error("empty");
    return d.reply;
  }

  /* ---- widget ---- */
  const SUGGEST = [
    ["How fast do you ship?", "交期多久？"], ["Which balancer for a 20 kg slide?", "20 kg 滑块选哪个平衡器？"],
    ["Can I get STEP files?", "有 STEP 文件吗？"], ["What does the DFM review cost?", "DFM 评审收费吗？"],
  ];
  function mount() {
    const root = document.createElement("div");
    root.className = "ai";
    root.innerHTML = `
      <button class="ai-fab" type="button" aria-expanded="false" aria-controls="ai-panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg><span>Ask</span></button>
      <section class="ai-panel" id="ai-panel" role="dialog" aria-label="Assistant" hidden>
        <header class="ai-head"><div><b>${esc(NM.brand)} assistant</b><span>FAQ + catalog · answers in EN / 中文</span></div><button class="ai-close" type="button" aria-label="Close">×</button></header>
        <div class="ai-log" aria-live="polite"></div>
        <form class="ai-form"><input class="ai-in" type="text" placeholder="Ask about lead time, sizing, prices… / 中文也可以" aria-label="Your question" autocomplete="off"><button class="ai-send" type="submit" aria-label="Send">↑</button></form>
      </section>`;
    document.body.appendChild(root);
    const fab = $(".ai-fab", root), panel = $(".ai-panel", root), log = $(".ai-log", root), form = $(".ai-form", root), input = $(".ai-in", root);
    const history = [];
    const add = (who, html) => { const m = document.createElement("div"); m.className = "ai-msg " + who; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
    const chips = (zh) => `<div class="ai-chips">${SUGGEST.map(([en, cn]) => `<button class="ai-chip" data-q="${esc(zh ? cn : en)}">${esc(zh ? cn : en)}</button>`).join("")}</div>`;
    const open = () => { panel.hidden = false; fab.setAttribute("aria-expanded", "true"); if (!log.children.length) add("bot", answer("hi").html + chips(false)); input.focus(); };
    const close = () => { panel.hidden = true; fab.setAttribute("aria-expanded", "false"); fab.focus(); };
    fab.addEventListener("click", () => panel.hidden ? open() : close());
    $(".ai-close", root).addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) close(); });
    async function ask(q) {
      q = q.trim(); if (!q) return;
      add("user", esc(q)); history.push({ role: "user", content: q });
      const pending = add("bot", `<span class="ai-dots">…</span>`);
      let html;
      if (NM.assistantEndpoint) { try { html = esc(await remote(history)).replace(/\n/g, "<br>"); } catch { html = null; } }
      if (!html) { const r = answer(q); html = r.html + (r.chips ? chips(isZh(q)) : ""); }
      pending.innerHTML = html; history.push({ role: "assistant", content: pending.textContent });
      log.scrollTop = log.scrollHeight;
    }
    form.addEventListener("submit", e => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); });
    log.addEventListener("click", e => {
      const c = e.target.closest("[data-q]"); if (c) { ask(c.dataset.q); return; }
      const r = e.target.closest("[data-rfq]"); if (r) { try { sessionStorage.setItem("nm_rfq_prefill", "Question from the assistant: " + r.dataset.rfq); } catch {} location.hash = "#rfq"; close(); return; }
      if (e.target.closest("a[href^='#']")) close();
    });
    window.NMAssistant = { open, ask };
    document.addEventListener("click", e => { const b = e.target.closest("[data-ask]"); if (b) { open(); if (b.dataset.ask) ask(b.dataset.ask); } });
  }
  NM.assistantAnswer = answer;
  document.addEventListener("DOMContentLoaded", mount);
})();
