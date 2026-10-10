/* ============================================================
   MOLDBRIDGE catalog data
   ------------------------------------------------------------
   !! All prices, lead times, specs and the brand name are
   !! PLACEHOLDERS for review. Edit here; every page reads this file.
   Price unit: USD per piece, EXW. lead = working days.
   ============================================================ */
window.NM = window.NM || {};

NM.brand = "MOLDBRIDGE";
NM.contact = {
  email: "sales@moldbridge.example",
  phone: "+86 000 0000 0000",
  address: "Dongguan, Guangdong, China",
};

NM.families = [
  { id: "slides",   name: "Slides & undercuts", short: "Slides",       blurb: "Mechanical slide and lifter units for undercuts, no hydraulics required." },
  { id: "ejection", name: "Ejection",           short: "Ejection",     blurb: "Two-stage, accelerated and stepped ejection for thin walls and deep ribs." },
  { id: "guiding",  name: "Guiding & wear",     short: "Guiding",      blurb: "Self-lubricating guiding for clean-room and high-cycle molds." },
  { id: "trace",    name: "Traceability",       short: "Traceability", blurb: "Date stamps and cycle monitors so every part tells where it came from." },
  { id: "venting",  name: "Venting & cooling",  short: "Venting",      blurb: "Sintered vents, quick couplers and hydraulic cylinders." },
];

/* --- small SVG mechanism figures (160 × 100) ------------------- */
const F = {
  open: '<svg viewBox="0 0 160 100" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
  close: '</svg>',
};

NM.products = [
  {
    id: "SB", code: "SB", family: "slides", isNew: true, stock: true, lead: 5, flagship: true,
    name: "Dual-spring slide balancer",
    tag: "Cancels the slide's weight so the design can ignore gravity",
    blurb: "For slides that travel vertically on the press. Two opposed die springs in a sealed cartridge hold the slide at every point of its stroke, so it neither drops when the mold opens nor loads the angle pin on closing. It replaces a counterweight with a part that bolts into a standard pocket.",
    problem: "A heavy slide mounted on the top or bottom of the mold sags under its own weight as soon as the angle pin leaves it. The slide drifts, the retainer wears, and the angle pin takes a side load on every close. The usual fix is a one-off counterweight or an oversized spring plunger tuned by trial.",
    solution: "Two die springs act on the slide from opposite sides through a floating rod. Their preload is set so the net force equals the slide's weight at mid-stroke and stays within ±5 % over the whole travel. The slide behaves as if it had no mass in the gravity direction; the retainer and the angle pin see only the molding loads they were sized for.",
    specs: [
      ["Housing", "SKD61, 50–54 HRC"],
      ["Springs", "2 × CrSi die springs, ISO 10243"],
      ["Rod", "SUJ2, 58–62 HRC, ground"],
      ["Slide mass", "S 2–6 · M 5–15 · L 12–35 · XL 30–80 kg"],
      ["Stroke", "20 – 120 mm"],
      ["Balance error", "≤ ±5 % of slide weight over stroke"],
      ["Temperature", "up to 200 °C"],
      ["Rated life", "1 × 10⁶ cycles"],
      ["Mounting", "4 × M6 (S/M) · 4 × M8 (L/XL), from slide back"],
    ],
    config: {
      fields: [
        { key: "size", label: "Size", opts: ["S", "M", "L", "XL"], hint: "S 2–6 kg · M 5–15 kg · L 12–35 kg · XL 30–80 kg" },
        { key: "s", label: "Stroke", opts: ["20", "40", "60", "80", "100", "120"], unit: "mm" },
      ],
      pn: c => `SB-${c.size}-${c.s}`,
      price: c => ({ S: 96, M: 128, L: 182, XL: 265 }[c.size] + +c.s * 0.6),
    },
    calc: "balancer",
    drawing: "balancer",
    fig: F.open + `
      <path d="M30 8v84"/><path d="M26 8h8M26 92h8" opacity=".6"/>
      <g class="a-spring-top"><path class="s-acc" d="M56 14v2l6 3-12 3 12 3-12 3 12 3-6 3v2"/></g>
      <g class="a-spring-bot"><path class="s-acc" d="M56 86v-2l6-3-12-3 12-3-12-3 12-3-6-3v-2"/></g>
      <g class="a-balance"><rect class="s-acc f-acc" x="38" y="38" width="36" height="24" rx="2"/><path d="M38 50h36" opacity=".4"/></g>
      <path d="M110 30v34" opacity=".7"/><path d="M106 60l4 4 4-4" opacity=".7"/>
      <text x="118" y="50" class="t-dim">m·g</text>
      <text x="96" y="90" class="t-dim">ΣF = 0</text>` + F.close,
  },
  {
    id: "SR", code: "SR", family: "slides", isNew: true, stock: true, lead: 3,
    name: "QuickLock slide retainer",
    tag: "Positive detent, no springs to lose",
    blurb: "Holds the slide in its open position with a hardened ball detent instead of a leaf spring. Installs from the parting line in one pocket; no side access needed.",
    specs: [
      ["Body", "SKD61, 50–54 HRC"],
      ["Detent ball", "SUJ2, Ø4 / Ø5 / Ø6"],
      ["Holding force", "150 / 250 / 400 N"],
      ["Repeatability", "±0.02 mm"],
      ["Temperature", "up to 180 °C"],
      ["Mounting", "2 × M4 from parting line"],
    ],
    config: {
      fields: [
        { key: "size", label: "Size", opts: ["S", "M", "L"], hint: "S 12×30 · M 16×40 · L 20×50 mm" },
        { key: "force", label: "Holding force", opts: ["150", "250", "400"], unit: "N" },
      ],
      pn: c => `SR-${c.size}-${c.force}`,
      price: c => ({ S: 38, M: 46, L: 58 }[c.size] + (c.force === "400" ? 6 : 0)),
    },
    fig: F.open + `
      <rect x="10" y="62" width="140" height="14" rx="1"/>
      <path d="M74 62v-4h10v4"/>
      <g class="a-shift-x">
        <rect class="s-acc f-acc" x="30" y="36" width="46" height="26" rx="2"/>
        <circle class="s-acc" cx="53" cy="61" r="3.5"/>
        <path class="s-acc" d="M53 50v-6M49 47l4-3 4 3M49 42l4-3 4 3"/>
      </g>
      <path d="M10 88h140" stroke-dasharray="3 5" opacity=".5"/>
      <text x="118" y="54" class="t-dim">OPEN</text>` + F.close,
  },
  {
    id: "MS", code: "MS", family: "slides", isNew: true, stock: true, lead: 5,
    name: "Mini slide unit",
    tag: "100 % mechanical core cam for small undercuts",
    blurb: "A self-contained cam unit for undercuts up to 10 mm where a full slide does not fit. The angle is built into the housing, so there is no angle pin to machine or align.",
    specs: [
      ["Housing", "SKD61, 50–54 HRC"],
      ["Core block", "SKD61, nitrided"],
      ["Max undercut", "10 mm"],
      ["Angle", "15° fixed"],
      ["Width", "12 / 16 / 20 mm"],
      ["Min pocket depth", "stroke + 18 mm"],
    ],
    config: {
      fields: [
        { key: "w", label: "Width", opts: ["12", "16", "20"], unit: "mm" },
        { key: "s", label: "Stroke", opts: ["4", "6", "8", "10"], unit: "mm" },
      ],
      pn: c => `MS-${c.w}-${c.s}`,
      price: c => 110 + +c.w * 2 + +c.s * 3,
    },
    fig: F.open + `
      <path d="M20 20v60h50V20"/>
      <path d="M70 20h70v60H70" opacity=".4"/>
      <g class="a-cam">
        <rect class="s-acc f-acc" x="42" y="38" width="30" height="24" rx="1.5"/>
        <path class="s-acc" d="M72 44h16v12H72"/>
      </g>
      <path d="M28 76l24-48" stroke-dasharray="3 4" opacity=".6"/>
      <text x="96" y="30" class="t-dim">CAVITY</text>` + F.close,
  },
  {
    id: "LC", code: "LC", family: "slides", isNew: true, stock: true, lead: 5,
    name: "Flex lifter coupling",
    tag: "Self-aligning lifter base, up to 15°",
    blurb: "Lets the lifter rod find its own angle while the ejector plate moves straight. Takes up plate misalignment that would otherwise gall the rod.",
    specs: [
      ["Coupling body", "S45C, black oxide"],
      ["Slider", "Bronze-graphite, self-lube"],
      ["Rod Ø", "10 / 12 / 16 / 20 mm"],
      ["Max angle", "15°"],
      ["Max stroke", "60 mm"],
      ["Rated side load", "1.2 kN (Ø16)"],
    ],
    config: {
      fields: [
        { key: "d", label: "Rod Ø", opts: ["10", "12", "16", "20"], unit: "mm" },
        { key: "s", label: "Stroke", opts: ["20", "30", "40", "60"], unit: "mm" },
        { key: "a", label: "Angle", opts: ["5", "8", "10", "12", "15"], unit: "°" },
      ],
      pn: c => `LC-${c.d}-${c.s}-${c.a}`,
      price: c => 48 + +c.d * 1.5 + +c.s * 0.4,
    },
    calc: "lifter",
    fig: F.open + `
      <path d="M10 22h140" opacity=".4"/>
      <g class="a-lift">
        <rect x="10" y="78" width="140" height="10"/>
        <g class="a-tilt">
          <rect class="s-acc f-acc" x="68" y="64" width="24" height="14" rx="2"/>
          <path class="s-acc" d="M80 64V30"/>
          <path class="s-acc" d="M72 30h20v-8H72z"/>
        </g>
      </g>
      <path d="M100 22v-6h22v6" opacity=".6"/>
      <text x="104" y="40" class="t-dim">UNDERCUT</text>` + F.close,
  },
  {
    id: "TE", code: "TE", family: "ejection", isNew: true, stock: false, lead: 10,
    name: "Two-stage ejector",
    tag: "Two strokes from one ejector plate",
    blurb: "Releases the part from the core first, then pushes it off the stripper or lifter. Purely mechanical latch, so the sequence is the same on every cycle and every press.",
    specs: [
      ["Latch", "SKD11, 58–60 HRC"],
      ["Stroke 1", "10–50 mm"],
      ["Stroke 2", "10–40 mm"],
      ["Rated load", "8 kN per unit"],
      ["Units per mold", "2 or 4 (sym.)"],
      ["Reset", "automatic on close"],
    ],
    config: {
      fields: [
        { key: "s1", label: "Stroke 1", opts: ["10", "20", "30", "40", "50"], unit: "mm" },
        { key: "s2", label: "Stroke 2", opts: ["10", "20", "30", "40"], unit: "mm" },
      ],
      pn: c => `TE-${c.s1}-${c.s2}`,
      price: c => 160 + (+c.s1 + +c.s2) * 1.2,
    },
    fig: F.open + `
      <g class="a-stage2"><rect x="20" y="24" width="120" height="10"/><path d="M50 24v-10M110 24v-10"/></g>
      <g class="a-stage1"><rect class="s-acc f-acc" x="20" y="46" width="120" height="10"/><path class="s-acc" d="M80 46V14"/></g>
      <rect x="20" y="84" width="120" height="8" opacity=".5"/>
      <path d="M150 84V46" class="s-acc" stroke-dasharray="2 3"/>
      <text x="8" y="20" class="t-dim">2</text><text x="8" y="43" class="t-dim">1</text>` + F.close,
  },
  {
    id: "AE", code: "AE", family: "ejection", isNew: false, stock: true, lead: 5,
    name: "Accelerated ejector",
    tag: "Pin travels 1.5× or 2× the plate stroke",
    blurb: "A lever inside the unit multiplies the ejector plate stroke for one or two pins. Use it to clear a deep boss or a tall rib without a longer press stroke.",
    specs: [
      ["Lever", "SKD11, 58–60 HRC"],
      ["Ratio", "1.5 : 1 or 2 : 1"],
      ["Plate stroke", "20–60 mm"],
      ["Pin Ø", "up to 8 mm"],
      ["Rated load", "2 kN"],
    ],
    config: {
      fields: [
        { key: "r", label: "Ratio", opts: ["1.5", "2.0"] },
        { key: "s", label: "Plate stroke", opts: ["20", "30", "40", "50", "60"], unit: "mm" },
      ],
      pn: c => `AE-${c.r.replace(".", "")}-${c.s}`,
      price: c => 95 + +c.s * 0.8 + (c.r === "2.0" ? 12 : 0),
    },
    fig: F.open + `
      <g class="a-lift-sm"><rect x="20" y="70" width="120" height="10"/><path d="M60 70V50"/></g>
      <g class="a-lift-lg"><path class="s-acc" d="M100 70V18"/><path class="s-acc" d="M94 18h12"/></g>
      <path d="M46 50l54 12" class="s-acc"/><circle cx="60" cy="52" r="3"/><circle cx="100" cy="64" r="3" class="s-acc"/>
      <path d="M20 90h120" stroke-dasharray="3 5" opacity=".5"/>` + F.close,
  },
  {
    id: "SP", code: "SP", family: "ejection", isNew: true, stock: true, lead: 3,
    name: "One-piece stepped ejector pin",
    tag: "Ground from solid, no welded joint",
    blurb: "A stepped pin machined from one bar instead of a welded assembly. No heat-affected zone at the step, so the small diameter survives thin-wall ejection.",
    specs: [
      ["Material", "SKD61 (H13)"],
      ["Core hardness", "45–50 HRC"],
      ["Surface", "nitrided, ≥ 900 HV0.1"],
      ["d1 tolerance", "−0.005 / −0.015"],
      ["d2 tolerance", "−0.005 / −0.015"],
      ["Straightness", "0.03 mm / 300 mm"],
      ["Step radius", "R0.3"],
    ],
    config: {
      fields: [
        { key: "d1", label: "d1 (shank)", opts: ["3", "4", "5", "6", "8", "10", "12"], unit: "mm" },
        { key: "d2", label: "d2 (tip)", opts: ["1.5", "2", "2.5", "3", "4", "5", "6", "8"], unit: "mm" },
        { key: "L", label: "Length L", opts: ["100", "150", "200", "250", "300", "400"], unit: "mm" },
        { key: "l2", label: "Tip length", opts: ["20", "30", "40", "50", "60"], unit: "mm" },
      ],
      pn: c => `SP-${c.d1}-${c.d2}-${c.L}-${c.l2}`,
      price: c => 6.5 + +c.d1 * 0.6 + +c.L * 0.02,
      validate: c => +c.d2 < +c.d1 ? null : "Tip diameter d2 must be smaller than shank d1.",
    },
    drawing: "pin",
    fig: F.open + `
      <path d="M16 38h8v24h-8z"/>
      <rect class="s-acc f-acc" x="24" y="44" width="76" height="12"/>
      <path class="s-acc" d="M100 44v2h40v8h-40v2"/>
      <g class="a-pulse"><path d="M24 70v10M100 70v10M24 76h76" stroke-dasharray="2 2"/><text x="56" y="90" class="t-dim">L1</text></g>
      <text x="108" y="38" class="t-dim">d2</text>` + F.close,
  },
  {
    id: "GB", code: "GB", family: "guiding", isNew: true, stock: true, lead: 3,
    name: "Self-lube guide bushing",
    tag: "Graphite plugs, zero grease",
    blurb: "A bronze alloy bushing with embedded graphite plugs. Runs dry, so there is no grease to migrate onto medical or optical parts and no relubrication interval to schedule.",
    specs: [
      ["Material", "CuSn / graphite plugs"],
      ["Bore tolerance", "H7"],
      ["Mating pillar", "h6, 58–62 HRC"],
      ["Max PV", "1.6 MPa·m/s"],
      ["Temperature", "−40 to 200 °C"],
      ["Press fit", "ISO 286 p6"],
    ],
    config: {
      fields: [
        { key: "d", label: "Bore Ø", opts: ["12", "16", "20", "25", "30", "40"], unit: "mm" },
        { key: "L", label: "Length", opts: ["30", "40", "50", "60", "80"], unit: "mm" },
      ],
      pn: c => `GB-${c.d}-${c.L}`,
      price: c => 14 + +c.d * 0.7 + +c.L * 0.15,
    },
    drawing: "bushing",
    fig: F.open + `
      <rect class="s-acc" x="44" y="32" width="72" height="36" rx="3"/>
      <path class="s-acc" d="M44 32h-8v36h8"/>
      <g fill="currentColor" stroke="none" opacity=".8">
        <circle cx="58" cy="40" r="2"/><circle cx="74" cy="40" r="2"/><circle cx="90" cy="40" r="2"/><circle cx="106" cy="40" r="2"/>
        <circle cx="66" cy="60" r="2"/><circle cx="82" cy="60" r="2"/><circle cx="98" cy="60" r="2"/>
      </g>
      <g class="a-shift-x"><path d="M10 44h120M10 56h120" opacity=".6"/></g>` + F.close,
  },
  {
    id: "DS", code: "DS", family: "trace", isNew: false, stock: true, lead: 3,
    name: "Date stamp insert",
    tag: "Replaceable year ring, flush face",
    blurb: "Year/month marking with a screwdriver-set arrow. The year ring swaps from the molding face, so the mold stays on the press at year end.",
    specs: [
      ["Material", "SUS420, 48–52 HRC"],
      ["Face", "flush ±0.01 mm"],
      ["Ø", "4 – 20 mm"],
      ["Formats", "Y/M arrow · M/Y arrow"],
      ["Set", "year ring + 1 arrow"],
    ],
    config: {
      fields: [
        { key: "d", label: "Ø", opts: ["4", "5", "6", "8", "10", "12", "16", "20"], unit: "mm" },
        { key: "f", label: "Format", opts: ["YM", "MY"], hint: "YM year outer · MY month outer" },
        { key: "y", label: "Year ring", opts: ["2026", "2027", "2028", "2029"] },
      ],
      pn: c => `DS-${c.d}-${c.f}-${c.y.slice(2)}`,
      price: c => 8 + +c.d * 0.35,
    },
    fig: F.open + `
      <circle cx="80" cy="50" r="34"/><circle cx="80" cy="50" r="14" class="s-acc"/>
      <g opacity=".7"><path d="M80 16v6M80 78v6M46 50h6M108 50h6M56 26l4 4M100 70l4 4M104 26l-4 4M60 70l-4 4"/></g>
      <g class="a-spin"><path class="s-acc" d="M80 50l0-11M76 43l4-4 4 4"/></g>
      <text x="118" y="24" class="t-dim">26</text>` + F.close,
  },
  {
    id: "CM", code: "CM", family: "trace", isNew: true, stock: true, lead: 5,
    name: "Electronic cycle monitor",
    tag: "Counts, times and reports every shot",
    blurb: "A sealed counter that logs cycle count and cycle time, then syncs over Bluetooth to a phone or the shop gateway. Flags preventive-maintenance intervals before the mold is late.",
    specs: [
      ["Housing", "SUS304, IP67"],
      ["Count", "up to 9,999,999"],
      ["Time resolution", "0.1 s"],
      ["Battery", "10 yr @ 20 s cycle"],
      ["Sync", "Bluetooth 5.0 LE"],
      ["Export", "CSV, JSON"],
      ["Mounting", "Ø26 pocket, 2 × M3"],
    ],
    config: {
      fields: [
        { key: "v", label: "Variant", opts: ["STD", "GW"], hint: "STD phone app · GW with shop gateway" },
      ],
      pn: c => `CM-${c.v}`,
      price: c => (c.v === "GW" ? 390 : 240),
    },
    fig: F.open + `
      <rect x="40" y="28" width="80" height="48" rx="4"/>
      <rect x="50" y="38" width="60" height="22" rx="1" class="s-acc"/>
      <text x="55" y="54" class="t-num">1 204 3</text><text x="99" y="54" class="t-num a-blink">17</text>
      <g class="a-wave"><path d="M128 42a10 10 0 0 1 0 16"/><path d="M134 36a18 18 0 0 1 0 28"/></g>
      <path d="M48 76v6M112 76v6"/>` + F.close,
  },
  {
    id: "VI", code: "VI", family: "venting", isNew: false, stock: true, lead: 3,
    name: "Sintered vent insert",
    tag: "Porous steel where a vent slot will not fit",
    blurb: "A sintered stainless insert that vents gas through its whole face. Put it at the bottom of a deep rib or boss where a parting-line vent cannot reach.",
    specs: [
      ["Material", "sintered SUS316"],
      ["Pore size", "7 / 20 µm"],
      ["Air flow", "≥ 1.5 L/min @ 0.1 MPa (Ø8, 20 µm)"],
      ["Hardness", "~ 30 HRC"],
      ["Fit", "press fit, m6"],
      ["Service", "clean with ultrasonic bath"],
    ],
    config: {
      fields: [
        { key: "d", label: "Ø", opts: ["6", "8", "10", "12"], unit: "mm" },
        { key: "p", label: "Pore", opts: ["7", "20"], unit: "µm" },
      ],
      pn: c => `VI-${c.d}-${c.p}`,
      price: c => 16 + +c.d * 1.2,
    },
    fig: F.open + `
      <path d="M20 20h120v62H20z" opacity=".4"/>
      <rect class="s-acc" x="60" y="48" width="40" height="34"/>
      <g fill="currentColor" stroke="none" opacity=".7">
        <circle cx="68" cy="56" r="1.3"/><circle cx="80" cy="56" r="1.3"/><circle cx="92" cy="56" r="1.3"/>
        <circle cx="74" cy="64" r="1.3"/><circle cx="86" cy="64" r="1.3"/>
        <circle cx="68" cy="72" r="1.3"/><circle cx="80" cy="72" r="1.3"/><circle cx="92" cy="72" r="1.3"/>
      </g>
      <g class="a-flow"><path d="M70 44V26M80 44V26M90 44V26" stroke-dasharray="3 4"/></g>
      <text x="26" y="34" class="t-dim">GAS</text>` + F.close,
  },
  {
    id: "HC", code: "HC", family: "venting", isNew: false, stock: false, lead: 12,
    name: "Core-pull hydraulic cylinder",
    tag: "Compact block cylinder with position sensing",
    blurb: "Short block cylinder for core pulls and long-stroke slides. Inductive end sensors come fitted, with M12 connectors wired to the press.",
    specs: [
      ["Bore", "25 / 32 / 40 / 50 mm"],
      ["Stroke", "25 – 100 mm"],
      ["Pressure", "max 14 MPa"],
      ["Rod", "C45, hard chrome 20 µm"],
      ["Seals", "FKM, 150 °C"],
      ["Sensors", "2 × inductive, M12"],
    ],
    config: {
      fields: [
        { key: "b", label: "Bore", opts: ["25", "32", "40", "50"], unit: "mm" },
        { key: "s", label: "Stroke", opts: ["25", "50", "80", "100"], unit: "mm" },
      ],
      pn: c => `HC-${c.b}-${c.s}`,
      price: c => 180 + +c.b * 3 + +c.s * 1.5,
    },
    drawing: "cyl",
    fig: F.open + `
      <rect x="20" y="32" width="70" height="36" rx="2"/>
      <path d="M30 32v-8M80 32v-8"/>
      <g class="a-shift-x"><path class="s-acc" d="M90 46h40v8H90z"/><path class="s-acc" d="M130 42h10v16h-10z"/></g>
      <circle cx="34" cy="50" r="3" class="s-acc"/><circle cx="76" cy="50" r="3" class="s-acc"/>` + F.close,
  },
];

NM.byId = id => NM.products.find(p => p.id === id);
NM.familyById = id => NM.families.find(f => f.id === id);
