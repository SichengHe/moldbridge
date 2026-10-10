/* ============================================================
   NEXMOLD — single-file site logic, hash-routed.
   Routes: #home[-anchor]  #products[-family]  #product-<ID>
           #services[-anchor]  #rfq[-design]
   No build step; runs from file://, any static host, or embedded.
   ============================================================ */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => "$" + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- RFQ store (localStorage, best effort) ---------------- */
  const RFQ = {
    key: "nm_rfq", mem: [],
    load() { try { return JSON.parse(localStorage.getItem(this.key)) || this.mem; } catch { return this.mem; } },
    save(items) { this.mem = items; try { localStorage.setItem(this.key, JSON.stringify(items)); } catch {} updateCount(); },
    add(item) { const items = this.load(); const ex = items.find(i => i.pn === item.pn); if (ex) ex.qty += item.qty; else items.push(item); this.save(items); },
    remove(pn) { this.save(this.load().filter(i => i.pn !== pn)); },
    setQty(pn, qty) { const items = this.load(); const it = items.find(i => i.pn === pn); if (it) it.qty = Math.max(1, qty | 0); this.save(items); },
    clear() { this.save([]); },
  };
  function updateCount() {
    const n = RFQ.load().reduce((a, i) => a + i.qty, 0);
    $$(".rfq-count").forEach(el => { el.textContent = n; el.dataset.n = n; });
  }

  /* ---------------- toast ---------------- */
  let toastEl, toastT;
  function toast(html) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.innerHTML = html; toastEl.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ---------------- reveal on scroll ---------------- */
  let io;
  function initReveal(root = document) {
    const els = $$(".reveal:not(.in)", root);
    if (reduced || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
    els.forEach(e => io.observe(e));
  }

  /* ---------------- product helpers ---------------- */
  const defaults = p => { const c = {}; (p.config?.fields || []).forEach(f => c[f.key] = f.opts[0]); return c; };
  const leadText = p => p.stock ? `Stock · ships in ${p.lead} days` : `Made to order · ${p.lead} days`;
  function cardHTML(p) {
    const fam = NM.familyById(p.family);
    const price = p.config ? p.config.price(defaults(p)) : null;
    return `<article class="card reveal" data-id="${p.id}">
      <a class="card-fig" href="#product-${p.id}" aria-label="${esc(p.name)}">
        ${p.isNew ? '<span class="badge">New 2026</span>' : ""}
        ${p.stock ? '<span class="badge stock">In stock</span>' : ""}
        <div class="ic">${p.fig}</div>
      </a>
      <div class="card-body">
        <div class="sku">${p.code} · ${esc(fam.short)}</div>
        <h3><a href="#product-${p.id}">${esc(p.name)}</a></h3>
        <p>${esc(p.tag)}</p>
        <div class="chips">${p.specs.slice(0, 2).map(s => `<span class="chip">${esc(s[1])}</span>`).join("")}</div>
      </div>
      <div class="card-foot">
        <div class="price">${price != null ? "from " + money(price) : "Quote"}<small>${leadText(p)}</small></div>
        <a class="btn btn-sm" href="#product-${p.id}">Configure</a>
      </div>
    </article>`;
  }

  /* ================= HOME ================= */
  const SB_BANDS = { S: [2, 6], M: [5, 15], L: [12, 35], XL: [30, 80] };
  let hero;
  const home = {
    inited: false,
    init(anchor) {
      const view = $('main[data-view="home"]');
      if (!this.inited) {
        this.inited = true;
        $("#featured").innerHTML = NM.products.filter(p => p.isNew).slice(0, 4).map(cardHTML).join("");
        hero = heroStage($("#hero-canvas"));
        const m = $("#sz-m"), s = $("#sz-s"), out = $("#sz-out"), go = $("#sz-go");
        const size = () => {
          const mass = +m.value || 0, W = mass * 9.81;
          const fit = Object.entries(SB_BANDS).find(([, [lo, hi]]) => mass >= lo && mass <= hi);
          $$(".band").forEach(b => b.classList.toggle("on", !!fit && b.dataset.size === fit[0]));
          if (fit) {
            const p = NM.byId("SB"), c = { size: fit[0], s: s.value };
            out.innerHTML = `<span class="pn">${p.config.pn(c)}</span> · ${money(p.config.price(c))} · weight <b>${W.toFixed(0)} N</b> · preload <b>${(W / 2).toFixed(0)} N</b> per spring`;
            go.textContent = `Configure ${p.config.pn(c)}`; go.href = `#product-SB_${c.size}_${c.s}`;
          } else {
            out.innerHTML = mass < 2 ? "Below 2 kg a spring plunger holds the slide; the SB is not needed." : "Above 80 kg: ask us for a tandem unit (two SB-XL on one slide).";
            go.textContent = "Configure the SB"; go.href = "#product-SB";
          }
        };
        m.addEventListener("input", size); s.addEventListener("input", size); size();
      }
      hero?.start();
      initReveal(view);
      scrollToAnchor(view, anchor);
    },
    leave() { hero?.stop(); },
  };

  /* Wireframe two-plate mold: opens, ejects, closes, counts cycles. */
  function heroStage(cv) {
    const ctx = cv.getContext("2d");
    const hud = { cycle: $("#hud-cycle"), gap: $("#hud-gap"), state: $("#hud-state") };
    let W = 0, H = 0, raf = 0, running = false;
    const resize = () => {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect(); W = r.width || 400; H = r.height || 400;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    window.addEventListener("resize", () => { resize(); if (reduced && running) frame(performance.now()); });

    const P = 300, GAP_MAX = 120, EJ_MAX = 40, PERIOD = 7;
    let count = 1204317, lastPhase = 3;
    const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const BLUE = css("--blue") || "#5b8def", ACC = css("--accent") || "#ff6a1a";
    const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
    const kin = t => ({
      gap: GAP_MAX * (ease(seg(t, 0, .16)) - ease(seg(t, .5, .66))),
      ej: EJ_MAX * (ease(seg(t, .2, .3)) - ease(seg(t, .34, .44))),
      phase: t < .16 ? 0 : t < .5 ? 1 : t < .66 ? 2 : 3,
    });
    const project = (pt, yaw, pitch, scale) => {
      const [x, y, z] = pt, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const s = 1500 / (1500 + z2);
      return [W / 2 + x1 * s * scale, H / 2 - y2 * s * scale, z2];
    };
    const box = (cx, y0, y1, w, d) => { const hx = w / 2, hz = d / 2; return [[cx - hx, y0, -hz], [cx + hx, y0, -hz], [cx + hx, y0, hz], [cx - hx, y0, hz], [cx - hx, y1, -hz], [cx + hx, y1, -hz], [cx + hx, y1, hz], [cx - hx, y1, hz]]; };
    const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const line = (a, b, color, as = 1, w = 1) => {
      ctx.strokeStyle = color; ctx.globalAlpha = Math.max(.12, Math.min(1, .9 - (a[2] + b[2]) / 1000)) * as; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    };
    const drawBox = (c, prj, color, w = 1) => { const p = c.map(prj); EDGES.forEach(([i, j]) => line(p[i], p[j], color, 1, w)); };
    const drawCyl = (cx, cz, r, y0, y1, prj, color) => {
      const N = 20, top = [], bot = [];
      for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; top.push(prj([cx + r * Math.cos(a), y1, cz + r * Math.sin(a)])); bot.push(prj([cx + r * Math.cos(a), y0, cz + r * Math.sin(a)])); }
      for (let i = 0; i < N; i++) { line(top[i], top[(i + 1) % N], color, 1, 1.2); line(bot[i], bot[(i + 1) % N], color, .7); }
      for (let i = 0; i < N; i += 5) line(top[i], bot[i], color, .8);
    };
    function frame(now) {
      const t = (now / 1000 % PERIOD) / PERIOD;
      const k = reduced ? { gap: 70, ej: 0, phase: 1 } : kin(t);
      if (!reduced && k.phase === 3 && lastPhase === 2) count++;
      lastPhase = k.phase;
      const yaw = reduced ? .6 : .55 + now / 1000 * .18, pitch = -.42, scale = Math.min(W, H) / 640;
      const prj = pt => project(pt, yaw, pitch, scale);
      ctx.clearRect(0, 0, W, H); ctx.lineCap = "round";
      let y = -(320 + GAP_MAX) / 2;
      const yClampB = y; y += 30; const ySpacer = y; y += 90; const ySupport = y; y += 50; const yCore = y; y += 60; const yPL = y;
      const yCav = yPL + k.gap, yClampT = yCav + 60;
      drawBox(box(0, yClampB, yClampB + 30, P + 60, P), prj, BLUE);
      drawBox(box(-(P / 2 - 25), ySpacer, ySpacer + 90, 50, P), prj, BLUE);
      drawBox(box(P / 2 - 25, ySpacer, ySpacer + 90, 50, P), prj, BLUE);
      drawBox(box(0, ySupport, ySupport + 50, P, P), prj, BLUE);
      drawBox(box(0, yCore, yCore + 60, P, P), prj, BLUE, 1.3);
      const yEj = ySpacer + 8 + k.ej;
      drawBox(box(0, yEj, yEj + 22, P - 120, P - 40), prj, BLUE);
      drawBox(box(0, yEj + 22, yEj + 44, P - 120, P - 40), prj, BLUE);
      [[-70, -70], [70, -70], [-70, 70], [70, 70], [0, 0]].forEach(([x, z]) => line(prj([x, yEj + 44, z]), prj([x, yCore + 60 + k.ej, z]), ACC, .9, 1.2));
      drawBox(box(0, yCav, yCav + 60, P, P), prj, BLUE, 1.3);
      drawBox(box(0, yClampT, yClampT + 30, P + 60, P), prj, BLUE);
      const pl = box(0, yPL, yCav, P, P).map(prj);
      [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4]].forEach(([i, j]) => line(pl[i], pl[j], ACC, 1, 1.4));
      [[-115, -115], [115, -115], [-115, 115], [115, 115]].forEach(([x, z]) => { drawCyl(x, z, 12, yCav - 110, yCav + 60, prj, ACC); drawCyl(x, z, 16, yCore, yCore + 60, prj, BLUE); });
      drawCyl(0, 0, 50, yClampT + 30, yClampT + 36, prj, BLUE);
      drawCyl(0, 0, 10, yCav, yClampT + 36, prj, ACC);
      ctx.globalAlpha = 1;
      if (hud.cycle) hud.cycle.textContent = count.toLocaleString("en-US").replace(/,/g, " ");
      if (hud.gap) hud.gap.textContent = k.gap < .5 ? "CLOSED" : k.gap.toFixed(1) + " mm";
      if (hud.state) hud.state.textContent = ["OPENING", k.ej > 1 ? "EJECTING" : "OPEN", "CLOSING", "INJECT / HOLD"][k.phase];
      if (running && !reduced) raf = requestAnimationFrame(frame);
    }
    return {
      start() { if (running) return; running = true; resize(); raf = requestAnimationFrame(frame); },
      stop() { running = false; cancelAnimationFrame(raf); },
    };
  }

  /* ================= PRODUCTS (catalog) ================= */
  const products = {
    inited: false,
    init(family) {
      const view = $('main[data-view="products"]');
      const grid = $("#grid"), fams = $("#fam-filters"), q = $("#q"), sort = $("#sort"),
        onlyNew = $("#only-new"), onlyStock = $("#only-stock"), count = $("#count");
      const render = () => {
        const on = new Set($$("input:checked", fams).map(i => i.value));
        const term = q.value.trim().toLowerCase();
        const pr = p => p.config ? p.config.price(defaults(p)) : 1e9;
        const sorters = {
          featured: (a, b) => (b.isNew - a.isNew) || (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0) || a.name.localeCompare(b.name),
          name: (a, b) => a.name.localeCompare(b.name), lead: (a, b) => a.lead - b.lead, price: (a, b) => pr(a) - pr(b),
        };
        const list = NM.products.filter(p => on.has(p.family)
          && (!onlyNew.checked || p.isNew) && (!onlyStock.checked || p.stock)
          && (!term || [p.id, p.name, p.tag, p.blurb, p.problem || "", ...p.specs.flat()].join(" ").toLowerCase().includes(term)))
          .sort(sorters[sort.value] || sorters.featured);
        grid.innerHTML = list.length ? list.map(cardHTML).join("")
          : `<div class="empty">No components match. <button class="btn btn-sm" type="button" data-reset>Clear filters</button></div>`;
        count.innerHTML = `<b>${list.length}</b> of ${NM.products.length} components`;
        initReveal(view);
      };
      const reset = () => { $$("input", fams).forEach(i => i.checked = true); q.value = ""; onlyNew.checked = false; onlyStock.checked = false; sort.value = "featured"; render(); };
      if (!this.inited) {
        this.inited = true;
        fams.innerHTML = NM.families.map(f => `<label><input type="checkbox" value="${f.id}" checked> ${esc(f.name)}<span class="n">${NM.products.filter(p => p.family === f.id).length}</span></label>`).join("");
        [fams, q, sort, onlyNew, onlyStock].forEach(el => el.addEventListener("input", render));
        $("#clear").addEventListener("click", reset);
        grid.addEventListener("click", e => { if (e.target.closest("[data-reset]")) reset(); });
      }
      if (family && NM.familyById(family)) $$("input", fams).forEach(i => i.checked = i.value === family);
      else $$("input", fams).forEach(i => i.checked = true);
      render();
      window.scrollTo(0, 0);
    },
  };

  /* ================= PRODUCT (detail + configurator) ================= */
  const product = {
    inited: false,
    init(id) {
      const view = $('main[data-view="product"]');
      const [pid, ...preset] = (id || "").split("_");
      const p = NM.byId(pid.toUpperCase()) || NM.byId("SB");
      const fam = NM.familyById(p.family);
      document.title = `${p.name} · ${NM.brand}`;
      $("#crumb-fam").textContent = fam.name; $("#crumb-fam").href = `#products-${fam.id}`;
      $("#crumb-p").textContent = p.code;
      $("#p-code").textContent = `${p.code} · ${fam.name}`;
      $("#p-name").textContent = p.name;
      $("#p-tag").textContent = p.tag;
      $("#p-blurb").textContent = p.blurb;
      $("#p-story").innerHTML = p.problem ? `<div class="story"><div><span class="lbl">Problem</span><p>${esc(p.problem)}</p></div><div><span class="lbl">Standard part</span><p>${esc(p.solution)}</p></div></div>` : "";
      $("#p-badges").innerHTML = (p.isNew ? '<span class="chip chip-acc">New 2026</span>' : "") + `<span class="chip ${p.stock ? "chip-ok" : "chip-warn"}">${leadText(p)}</span>`;
      $("#specs").innerHTML = p.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
      $("#related").innerHTML = NM.products.filter(x => x.family === p.family && x.id !== p.id).concat(NM.products.filter(x => x.family !== p.family)).slice(0, 4).map(cardHTML).join("");

      const cfgEl = $("#config"), drawEl = $("#drawing"), capEl = $("#draw-cap"), cfg = p.config, state = defaults(p);
      (cfg?.fields || []).forEach((f, i) => { if (preset[i] && f.opts.includes(preset[i])) state[f.key] = preset[i]; });
      cfgEl.innerHTML = `
        <h3>${cfg ? "Configure" : "Order"}</h3>
        ${cfg ? `<div class="opts">${cfg.fields.map(f => `
          <div class="field">
            <label for="f-${f.key}">${esc(f.label)}${f.unit ? ` (${f.unit})` : ""}</label>
            <select class="select" id="f-${f.key}" data-key="${f.key}">${f.opts.map(o => `<option value="${o}"${o === state[f.key] ? " selected" : ""}>${o}</option>`).join("")}</select>
            ${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}
          </div>`).join("")}</div>` : ""}
        ${p.calc === "lifter" ? lifterCalcHTML() : p.calc === "balancer" ? balancerCalcHTML() : ""}
        <div class="out">
          <div><div class="pn-l">Part number</div><div class="pn" id="pn">${p.code}</div></div>
          <div class="pr" id="pr"></div>
        </div>
        <div class="err" id="cfg-err" hidden></div>
        <div class="buy-row">
          <div class="qty"><button type="button" data-d="-1" aria-label="Decrease">−</button><input id="qty" type="number" min="1" value="1" aria-label="Quantity"><button type="button" data-d="1" aria-label="Increase">+</button></div>
          <button class="btn btn-primary" id="add" type="button">Add to RFQ</button>
        </div>`;
      const pnEl = $("#pn"), prEl = $("#pr"), errEl = $("#cfg-err"), qtyEl = $("#qty");
      const update = () => {
        $$("select[data-key]", cfgEl).forEach(s => state[s.dataset.key] = s.value);
        const err = cfg?.validate ? cfg.validate(state) : null;
        errEl.hidden = !err; errEl.textContent = err || "";
        const pn = cfg ? cfg.pn(state) : p.code;
        pnEl.textContent = pn;
        const price = cfg && !err ? cfg.price(state) : null;
        prEl.innerHTML = price != null ? `${money(price)}<small>per piece · EXW · ${p.stock ? "stock" : "made to order"}</small>` : `—<small>${err ? "fix selection" : "quote on request"}</small>`;
        renderDrawing(p, state, drawEl, capEl);
        if (p.calc === "lifter") lifterCalc(state);
        if (p.calc === "balancer") balancerCalc(state);
        return { pn, price, err };
      };
      cfgEl.oninput = update;
      cfgEl.onclick = e => {
        const b = e.target.closest(".qty button"); if (b) { qtyEl.value = Math.max(1, (+qtyEl.value || 1) + +b.dataset.d); return; }
        if (e.target.closest("#add")) {
          const { pn, price, err } = update();
          if (err) { toast(err); return; }
          const conf = cfg ? cfg.fields.map(f => `${f.label.split(" ")[0]} ${state[f.key]}${f.unit || ""}`).join(" · ") : "";
          RFQ.add({ pn, id: p.id, name: p.name, conf, price, qty: Math.max(1, +qtyEl.value || 1) });
          toast(`Added <b>${esc(pn)}</b> to RFQ · <a href="#rfq">review</a>`);
        }
      };
      if (!this.inited) {
        this.inited = true;
        $$("[data-cad]", view).forEach(b => b.addEventListener("click", () => toast(`CAD for <b>${esc($("#pn").textContent)}</b> is not connected yet. Ask for it in the RFQ notes.`)));
      }
      update();
      $$(".reveal", view).forEach(e => e.classList.add("in"));
      window.scrollTo(0, 0);
    },
  };

  /* lifter stroke: plate stroke S to clear undercut u + clearance c at angle a */
  function lifterCalcHTML() {
    return `<div class="calc">
      <div class="calc-h">Stroke check <span class="hint">plate stroke needed to clear the undercut at the selected angle</span></div>
      <div class="opts">
        <div class="field"><label for="c-u">Undercut depth (mm)</label><input class="input" id="c-u" type="number" step="0.1" min="0" value="4"></div>
        <div class="field"><label for="c-c">Clearance (mm)</label><input class="input" id="c-c" type="number" step="0.1" min="0" value="1"></div>
      </div>
      <div class="calc-out mono" id="c-out"></div>
    </div>`;
  }
  function lifterCalc(state) {
    const u = +$("#c-u").value || 0, c = +$("#c-c").value || 0, a = (+state.a) * Math.PI / 180, s = +state.s;
    const S = (u + c) / Math.tan(a), travel = S / Math.cos(a), ok = S <= s;
    $("#c-out").innerHTML = `S = (${u} + ${c}) / tan ${state.a}° = <b>${S.toFixed(1)} mm</b> plate stroke · rod travel ${travel.toFixed(1)} mm · selected ${s} mm → <span class="${ok ? "ok" : "bad"}">${ok ? "OK" : "choose a longer stroke or a larger angle"}</span>`;
  }
  /* slide balancer: slide mass → spring preload and size band */
  function balancerCalcHTML() {
    return `<div class="calc">
      <div class="calc-h">Size check <span class="hint">the balancer carries the slide's full weight at mid-stroke</span></div>
      <div class="opts">
        <div class="field"><label for="c-m">Slide mass (kg)</label><input class="input" id="c-m" type="number" step="0.1" min="0" value="9"></div>
        <div class="field"><label for="c-ang">Travel angle from vertical (°)</label><input class="input" id="c-ang" type="number" step="1" min="0" max="90" value="0"></div>
      </div>
      <div class="calc-out mono" id="c-out"></div>
    </div>`;
  }
  function balancerCalc(state) {
    const m = +$("#c-m").value || 0, ang = Math.min(90, Math.max(0, +$("#c-ang").value || 0));
    const W = m * 9.81 * Math.cos(ang * Math.PI / 180), mEff = W / 9.81;
    const fit = Object.entries(SB_BANDS).find(([, [lo, hi]]) => mEff >= lo && mEff <= hi);
    const sel = SB_BANDS[state.size], ok = mEff >= sel[0] && mEff <= sel[1];
    $("#c-out").innerHTML = `W = ${m} kg × 9.81 × cos ${ang}° = <b>${W.toFixed(0)} N</b> · preload per spring ${(W / 2).toFixed(0)} N · balance error ≤ ±${(W * .05).toFixed(0)} N<br>`
      + `selected <b>SB-${state.size}</b> (${sel[0]}–${sel[1]} kg) → <span class="${ok ? "ok" : "bad"}">${ok ? "OK" : fit ? "use SB-" + fit[0] + " (" + fit[1][0] + "–" + fit[1][1] + " kg)" : mEff < 2 ? "below 2 kg: a spring plunger is enough" : "above 80 kg: ask us for a tandem unit"}</span>`;
  }

  /* ---------------- dimensioned drawings ---------------- */
  function renderDrawing(p, c, el, cap) {
    const dim = (x1, y1, x2, y2) => `<path class="ddim" d="M${x1} ${y1}L${x2} ${y2}"/>`;
    const txt = (x, y, s, cls = "acc", anchor = "middle") => `<text class="dtext ${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;
    let svg = "", caption = "";
    if (p.drawing === "pin") {
      const d1 = +c.d1, d2 = +c.d2, L = +c.L, l2 = Math.min(+c.l2, L - 10);
      const k = 3, lenPx = 300, x0 = 60, cy = 78, sx = lenPx / L, headW = 14, headH = d1 * k + 14, l1 = L - l2;
      const x1 = x0 + headW, x2 = x1 + l1 * sx, x3 = x2 + l2 * sx, yb = cy + headH / 2;
      svg = `<svg viewBox="0 0 420 180" role="img" aria-label="Stepped ejector pin drawing">
        <path class="dcenter" d="M${x0 - 14} ${cy}H${x3 + 18}"/>
        <rect class="dfill" x="${x0}" y="${cy - headH / 2}" width="${headW}" height="${headH}"/>
        <rect class="dfill" x="${x1}" y="${cy - d1 * k / 2}" width="${(l1 * sx).toFixed(1)}" height="${d1 * k}"/>
        <rect class="dfill" x="${x2.toFixed(1)}" y="${cy - d2 * k / 2}" width="${(l2 * sx).toFixed(1)}" height="${d2 * k}"/>
        ${dim(x0, yb + 6, x0, yb + 34)}${dim(x3, cy + d2 * k / 2 + 6, x3, yb + 34)}${dim(x0, yb + 28, x3, yb + 28)}
        ${txt((x0 + x3) / 2, yb + 24, `L = ${L}`)}
        ${dim(x2, cy - d1 * k / 2 - 6, x2, cy - d1 * k / 2 - 30)}${dim(x3, cy - d2 * k / 2 - 6, x3, cy - d1 * k / 2 - 30)}${dim(x2, cy - d1 * k / 2 - 24, x3, cy - d1 * k / 2 - 24)}
        ${txt((x2 + x3) / 2, cy - d1 * k / 2 - 28, `${l2}`)}
        ${dim(x1 + 20, cy - d1 * k / 2, x1 + 20, cy - d1 * k / 2 - 14)}${dim(x1 + 20, cy + d1 * k / 2, x1 + 20, cy + d1 * k / 2 + 14)}
        ${txt(x1 + 26, cy - d1 * k / 2 - 6, `Ø${d1} −0.005/−0.015`, "acc", "start")}
        ${txt(x2 + 8, cy + d2 * k / 2 + 16, `Ø${d2} −0.005/−0.015`, "acc", "start")}
        ${txt(x0 + headW / 2, cy - headH / 2 - 8, `R0.3 step`, "dim")}
        ${txt(x0 - 6, cy + 4, `SKD61`, "dim", "end")}
      </svg>`;
      caption = `SP · d1 Ø${d1} · d2 Ø${d2} · L ${L} · tip ${l2}`;
    } else if (p.drawing === "bushing") {
      const d = +c.d, L = +c.L, wall = Math.max(4, d * .22), D = d + 2 * wall, k = 2, sx = 3;
      const x0 = 90, cy = 100, w = L * sx, hD = D * k, hd = d * k;
      const plugs = []; for (let i = 0; i < Math.floor(w / 28); i++) plugs.push(`<circle class="dline" cx="${x0 + 14 + i * 28}" cy="${cy - hd / 2 - wall * k / 2}" r="3"/><circle class="dline" cx="${x0 + 14 + i * 28 + 14}" cy="${cy + hd / 2 + wall * k / 2}" r="3"/>`);
      svg = `<svg viewBox="0 0 420 200" role="img" aria-label="Guide bushing section">
        <path class="dcenter" d="M${x0 - 20} ${cy}H${x0 + w + 20}"/>
        <rect class="dfill" x="${x0}" y="${cy - hD / 2}" width="${w}" height="${hD}"/>
        <rect class="dthin" x="${x0}" y="${cy - hd / 2}" width="${w}" height="${hd}" style="fill:var(--bg-2)"/>
        ${plugs.join("")}
        ${dim(x0, cy - hD / 2 - 6, x0, cy - hD / 2 - 30)}${dim(x0 + w, cy - hD / 2 - 6, x0 + w, cy - hD / 2 - 30)}${dim(x0, cy - hD / 2 - 24, x0 + w, cy - hD / 2 - 24)}
        ${txt(x0 + w / 2, cy - hD / 2 - 28, `L = ${L}`)}
        ${dim(x0 + w + 8, cy - hd / 2, x0 + w + 30, cy - hd / 2)}${dim(x0 + w + 8, cy + hd / 2, x0 + w + 30, cy + hd / 2)}${dim(x0 + w + 24, cy - hd / 2, x0 + w + 24, cy + hd / 2)}
        ${txt(x0 + w + 32, cy + 4, `Ø${d} H7`, "acc", "start")}
        ${dim(x0 - 8, cy - hD / 2, x0 - 30, cy - hD / 2)}${dim(x0 - 8, cy + hD / 2, x0 - 30, cy + hD / 2)}${dim(x0 - 24, cy - hD / 2, x0 - 24, cy + hD / 2)}
        ${txt(x0 - 32, cy + 4, `Ø${D} p6`, "acc", "end")}
        ${txt(x0 + w / 2, cy + hD / 2 + 18, "graphite plugs, both rows", "dim")}
      </svg>`;
      caption = `GB · bore Ø${d} H7 · OD Ø${D} p6 · L ${L} · CuSn + graphite`;
    } else if (p.drawing === "balancer") {
      const size = c.size, s = +c.s, Wmm = { S: 40, M: 50, L: 64, XL: 80 }[size], spring = { S: 28, M: 34, L: 42, XL: 52 }[size];
      const Lh = s + 2 * spring + 24, sx = Math.min(1.6, 300 / Lh), k = 1.1;
      const x0 = 60, cy = 100, w = Lh * sx, h = Wmm * k, sp = spring * sx, pad = 12 * sx;
      const zig = (x, dir) => { let d = `M${x} ${cy}`; const n = 6, step = sp / n; for (let i = 0; i < n; i++) d += ` l${(dir * step / 2).toFixed(1)} ${i % 2 ? h * .28 : -h * .28} l${(dir * step / 2).toFixed(1)} ${i % 2 ? -h * .28 : h * .28}`; return d; };
      const xs1 = x0 + pad, xs2 = x0 + w - pad;
      svg = `<svg viewBox="0 0 420 215" role="img" aria-label="Slide balancer drawing">
        <path class="dcenter" d="M${x0 - 16} ${cy}H${x0 + w + 16}"/>
        <rect class="dfill" x="${x0}" y="${cy - h / 2}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>
        <path class="dline" d="${zig(xs1, 1)}"/><path class="dline" d="${zig(xs2, -1)}"/>
        <path class="dline" d="M${(xs1 + sp).toFixed(1)} ${cy}H${(xs2 - sp).toFixed(1)}" stroke-width="3"/>
        <rect class="dfill" x="${(x0 + w / 2 - 8).toFixed(1)}" y="${cy - h / 2 - 10}" width="16" height="${h + 20}" rx="2"/>
        <circle class="dline" cx="${x0 + 10}" cy="${cy - h / 2 + 9}" r="3"/><circle class="dline" cx="${x0 + w - 10}" cy="${cy - h / 2 + 9}" r="3"/><circle class="dline" cx="${x0 + 10}" cy="${cy + h / 2 - 9}" r="3"/><circle class="dline" cx="${x0 + w - 10}" cy="${cy + h / 2 - 9}" r="3"/>
        ${dim(x0, cy - h / 2 - 16, x0, cy - h / 2 - 40)}${dim(x0 + w, cy - h / 2 - 16, x0 + w, cy - h / 2 - 40)}${dim(x0, cy - h / 2 - 34, x0 + w, cy - h / 2 - 34)}
        ${txt(x0 + w / 2, cy - h / 2 - 38, `${Lh} overall`)}
        ${dim(xs1 + sp, cy + h / 2 + 8, xs1 + sp, cy + h / 2 + 32)}${dim(xs2 - sp, cy + h / 2 + 8, xs2 - sp, cy + h / 2 + 32)}${dim(xs1 + sp, cy + h / 2 + 26, xs2 - sp, cy + h / 2 + 26)}
        ${txt(x0 + w / 2, cy + h / 2 + 44, `stroke ${s}`)}
        ${dim(x0 + w + 10, cy - h / 2, x0 + w + 32, cy - h / 2)}${dim(x0 + w + 10, cy + h / 2, x0 + w + 32, cy + h / 2)}${dim(x0 + w + 26, cy - h / 2, x0 + w + 26, cy + h / 2)}
        ${txt(x0 + w + 34, cy + 4, `${Wmm}`, "acc", "start")}
        ${txt(x0 - 8, cy - h / 2 + 12, "M" + (size === "S" || size === "M" ? 6 : 8), "dim", "end")}
        ${txt(210, 206, "collar bolts to slide back · each spring preloaded to ½ slide weight", "dim")}
      </svg>`;
      caption = `SB-${size}-${s} · ${Lh} × ${Wmm} mm · spring ${spring} mm · stroke ${s}`;
    } else if (p.drawing === "cyl") {
      const b = +c.b, s = +c.s, k = 1.6, sx = Math.min(1.6, 320 / (2 * s + 50)), x0 = 60, cy = 90;
      const bw = (s + 50) * sx, bh = (b + 36) * k, rh = Math.max(8, b * .5 * k), rl = s * sx;
      svg = `<svg viewBox="0 0 420 180" role="img" aria-label="Block cylinder drawing">
        <path class="dcenter" d="M${x0 - 16} ${cy}H${x0 + bw + rl + 40}"/>
        <rect class="dfill" x="${x0}" y="${cy - bh / 2}" width="${bw}" height="${bh}" rx="3"/>
        <rect class="dthin" x="${x0 + 16}" y="${cy - b * k / 2}" width="${bw - 32}" height="${b * k}" stroke-dasharray="4 3"/>
        <rect class="dfill" x="${x0 + bw}" y="${cy - rh / 2}" width="${rl}" height="${rh}"/>
        <rect class="dfill" x="${x0 + bw + rl}" y="${cy - rh / 2 - 6}" width="12" height="${rh + 12}"/>
        <circle class="dline" cx="${x0 + 14}" cy="${cy - bh / 2 + 10}" r="3"/><circle class="dline" cx="${x0 + bw - 14}" cy="${cy - bh / 2 + 10}" r="3"/>
        ${dim(x0 + bw, cy + rh / 2 + 8, x0 + bw, cy + rh / 2 + 32)}${dim(x0 + bw + rl, cy + rh / 2 + 14, x0 + bw + rl, cy + rh / 2 + 32)}${dim(x0 + bw, cy + rh / 2 + 26, x0 + bw + rl, cy + rh / 2 + 26)}
        ${txt(x0 + bw + rl / 2, cy + rh / 2 + 22, `stroke ${s}`)}
        ${dim(x0 - 8, cy - b * k / 2, x0 - 30, cy - b * k / 2)}${dim(x0 - 8, cy + b * k / 2, x0 - 30, cy + b * k / 2)}${dim(x0 - 24, cy - b * k / 2, x0 - 24, cy + b * k / 2)}
        ${txt(x0 - 32, cy + 4, `Ø${b} bore`, "acc", "end")}
        ${txt(x0 + 14, cy - bh / 2 - 8, "sensor S1", "dim")}${txt(x0 + bw - 14, cy - bh / 2 - 8, "sensor S2", "dim")}
        ${txt(x0 + bw / 2, cy + bh / 2 + 14, "ports G1/4, rear", "dim")}
      </svg>`;
      caption = `HC · bore Ø${b} · stroke ${s} · 14 MPa · FKM seals`;
    } else {
      svg = `<div class="fig-big">${p.fig}</div>`;
      caption = `${p.code} · ${p.tag}`;
    }
    el.innerHTML = svg;
    cap.innerHTML = `<span>${esc(caption)}</span><span>UNITS mm · NOT TO SCALE</span>`;
  }

  /* ================= SERVICES ================= */
  const services = { init(anchor) { const view = $('main[data-view="services"]'); initReveal(view); scrollToAnchor(view, anchor); } };

  /* ================= RFQ ================= */
  const rfq = {
    inited: false,
    init(type) {
      const list = $("#rfq-items"), form = $("#rfq-form"), out = $("#rfq-out"), outText = $("#rfq-text"),
        typeSel = $("#f-type"), notes = $("#f-notes"), sum = $("#rfq-sum");
      const render = () => {
        const items = RFQ.load();
        list.innerHTML = items.length ? items.map(i => `<div class="rfq-item" data-pn="${esc(i.pn)}">
            <div><div class="pn">${esc(i.pn)}</div><div class="nm">${esc(i.name)}</div>${i.conf ? `<div class="cf">${esc(i.conf)}</div>` : ""}</div>
            <div class="qty"><button type="button" data-d="-1" aria-label="Decrease">−</button><input type="number" min="1" value="${i.qty}" aria-label="Quantity"><button type="button" data-d="1" aria-label="Increase">+</button></div>
            <button class="rm" type="button" aria-label="Remove ${esc(i.pn)}">×</button>
          </div>`).join("")
          : `<div class="empty">Your RFQ list is empty. <a class="btn btn-sm" href="#products">Browse components</a><br><br><span class="muted">A design project does not need items here. Describe the part in the form.</span></div>`;
        const n = items.reduce((a, i) => a + i.qty, 0), est = items.reduce((a, i) => a + (i.price || 0) * i.qty, 0);
        sum.innerHTML = items.length ? `<span>${items.length} lines · ${n} pcs</span><span>list est. ${money(est)} before volume pricing</span>` : "";
      };
      if (!this.inited) {
        this.inited = true;
        list.addEventListener("click", e => {
          const row = e.target.closest(".rfq-item"); if (!row) return;
          const pn = row.dataset.pn;
          if (e.target.closest(".rm")) { RFQ.remove(pn); render(); return; }
          const b = e.target.closest("button[data-d]"); if (b) { RFQ.setQty(pn, (+$("input", row).value || 1) + +b.dataset.d); render(); }
        });
        list.addEventListener("change", e => { const row = e.target.closest(".rfq-item"); if (row && e.target.matches("input")) { RFQ.setQty(row.dataset.pn, +e.target.value || 1); render(); } });
        form.addEventListener("submit", e => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(form).entries());
          if (!f.company || !f.email) { toast("Company and email are required."); return; }
          const items = RFQ.load();
          const text = [
            `RFQ — ${NM.brand}`, `Date: ${new Date().toISOString().slice(0, 10)}`,
            `Type: ${typeSel.options[typeSel.selectedIndex].text}`, "",
            `Company: ${f.company}`, `Contact: ${f.name || "-"}`, `Email: ${f.email}`, `Phone: ${f.phone || "-"}`, `Country: ${f.country || "-"}`, "",
            "Items:", ...(items.length ? items.map((i, n) => `  ${n + 1}. ${i.pn}  ${i.name}${i.conf ? " (" + i.conf + ")" : ""}  × ${i.qty}`) : ["  (none)"]), "",
            "Notes:", f.notes || "-",
          ].join("\n");
          outText.value = text; out.classList.add("show");
          $("#rfq-mail").href = `mailto:${NM.contact.email}?subject=${encodeURIComponent("RFQ " + f.company)}&body=${encodeURIComponent(text)}`;
          out.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        });
        $("#rfq-copy").addEventListener("click", async () => {
          try { await navigator.clipboard.writeText(outText.value); toast("RFQ copied."); }
          catch { outText.select(); toast("Select the text and copy it."); }
        });
        $("#rfq-clear").addEventListener("click", () => { RFQ.clear(); render(); });
      }
      if (type === "design") {
        typeSel.value = "design";
        if (!notes.value) notes.value = "Part: (STEP by email)\nResin: \nAnnual volume / shot count: \nCavitation: \nPress: tonnage, tie-bar spacing, max mold height\nTarget date for T1: ";
      }
      render();
      window.scrollTo(0, 0);
    },
  };

  /* ================= ROUTER ================= */
  const VIEWS = { home, products, product, services, rfq };
  const TITLES = { home: "", products: "Components", services: "Design → Mold", rfq: "RFQ" };
  let current = null;
  function parseHash() {
    const h = decodeURIComponent((location.hash || "").replace(/^#\/?/, ""));
    const m = h.match(/^([a-z]+)(?:-(.+))?$/i);
    return m && VIEWS[m[1].toLowerCase()] ? { name: m[1].toLowerCase(), arg: m[2] || "" } : { name: "home", arg: "" };
  }
  function scrollToAnchor(view, anchor) {
    const el = anchor && $(`#${CSS.escape(anchor)}`, view);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }));
    else window.scrollTo(0, 0);
  }
  function route() {
    const { name, arg } = parseHash();
    if (current && current !== name) VIEWS[current].leave?.();
    Object.keys(VIEWS).forEach(v => { $(`main[data-view="${v}"]`).hidden = v !== name; });
    $$(".nav-links a").forEach(a => {
      const h = (a.getAttribute("href") || "").replace(/^#/, "");
      const on = h === name || (h === "products" && name === "product");
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $(".nav")?.classList.remove("open");
    if (name !== "product") document.title = (TITLES[name] ? TITLES[name] + " · " : "") + NM.brand;
    VIEWS[name].init(arg);
    current = name;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const nav = $(".nav"), tg = $(".nav-toggle");
    tg?.addEventListener("click", () => { const open = nav.classList.toggle("open"); tg.setAttribute("aria-expanded", open); });
    $$("[data-brand]").forEach(el => el.textContent = NM.brand);
    $$("[data-contact]").forEach(el => el.textContent = NM.contact[el.dataset.contact] || "");
    $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
    $$("[data-fam-count]").forEach(el => { const n = NM.products.filter(p => p.family === el.dataset.famCount).length; el.textContent = n + (n === 1 ? " product" : " products"); });
    updateCount();
    window.addEventListener("hashchange", route);
    route();
  });
})();
