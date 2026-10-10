/* ============================================================
   MOLDBRIDGE FAQ — one source for the FAQ page AND the assistant.
   Each entry: id, cat, q / zh_q, a / zh (answers), kw (match words,
   EN + 中文), link [hash, label] optional.
   !! Policies marked (verify) are placeholders — confirm before launch.
   ============================================================ */
window.NM = window.NM || {};

NM.faqCats = [
  { id: "order", name: "Ordering & delivery", zh: "订购与交付" },
  { id: "product", name: "Components", zh: "产品" },
  { id: "eng", name: "Engineering service", zh: "工程服务" },
  { id: "company", name: "Company", zh: "公司" },
];

NM.faq = [
  {
    id: "lead", cat: "order",
    q: "How fast do you ship?", zh_q: "交期多久？",
    a: "Stock sizes ship in 3–5 working days from Dongguan. Made-to-order items (two-stage ejectors, hydraulic cylinders, custom sizes) take 10–15 working days. Every product page shows its lead time next to the price.",
    zh: "库存规格 3–5 个工作日从东莞发出；订做件（两级顶出、油缸、非标尺寸）10–15 个工作日。每个产品页价格旁边都标了交期。",
    kw: ["lead time", "ship", "shipping time", "delivery", "how long", "how fast", "how soon", "交期", "发货", "多久", "几天", "多长时间"],
    link: ["#products", "See what is in stock"],
  },
  {
    id: "moq", cat: "order",
    q: "Is there a minimum order?", zh_q: "有起订量吗？",
    a: "No minimum. Stock parts can be ordered from one piece at the list price shown. Volume pricing starts at 50 pieces of one part number; ask for it in the RFQ notes. (verify)",
    zh: "没有起订量，库存件 1 件起按标价出。同一零件号 50 件以上有批量价，在 RFQ 备注里说明即可。（待确认）",
    kw: ["minimum", "moq", "min order", "one piece", "single", "quantity", "起订", "最少", "一个", "数量"],
  },
  {
    id: "price", cat: "order",
    q: "How are prices quoted?", zh_q: "价格怎么算？",
    a: "Prices on the site are list prices in USD, EXW Dongguan, per piece, for the configuration you select. Freight, duties and bank charges are extra. Mold bases, custom sizes and design work are quoted on request.",
    zh: "网站价格为美元标价、东莞出厂价（EXW）、按所选规格单件计。运费、关税、银行手续费另计。模架、非标尺寸和设计服务按询价报价。",
    kw: ["price", "pricing", "cost", "how much", "quote", "usd", "exw", "价格", "多少钱", "报价", "费用"],
  },
  {
    id: "pay", cat: "order",
    q: "How do I order and pay?", zh_q: "怎么下单付款？",
    a: "Configure the parts, add them to the RFQ list and send it. We reply with a proforma invoice within one working day. Payment is by bank transfer (T/T) or PayPal; cards are coming. Parts ship when payment clears. Repeat customers can ask for net-30 terms. (verify)",
    zh: "在网站上选好规格加入 RFQ 清单发给我们，一个工作日内回形式发票。付款方式：电汇（T/T）或 PayPal，信用卡即将开通。款到发货，老客户可申请 30 天账期。（待确认）",
    kw: ["how do i order", "place an order", "ordering", "pay", "payment", "paypal", "credit card", "invoice", "bank transfer", "t/t", "buy", "purchase", "checkout", "下单", "付款", "支付", "怎么买", "购买", "发票"],
    link: ["#rfq", "Open my RFQ list"],
  },
  {
    id: "intl", cat: "order",
    q: "Do you ship internationally? Which incoterms?", zh_q: "可以发海外吗？",
    a: "Yes. Default is EXW Dongguan with DHL or FedEx on your account or ours. DAP is available on request. Mold components are small and dense, so most orders go as a 1–5 kg express parcel. We provide a commercial invoice and packing list; HS codes are on the invoice.",
    zh: "可以。默认东莞出厂价，DHL / FedEx 快递，可用你方或我方账号；也可按 DAP 报价。模具配件体积小，大多数订单是 1–5 kg 快递包裹，随附商业发票和装箱单。",
    kw: ["international", "overseas", "export", "incoterm", "dhl", "fedex", "freight", "customs", "duty", "dap", "海外", "出口", "国际", "快递", "关税"],
  },
  {
    id: "cad", cat: "product",
    q: "Can I get CAD files?", zh_q: "有 CAD 文件吗？",
    a: "Yes. STEP (3D) and DWG (2D) are available for every size. Direct download is being set up; for now ask for the files in the RFQ notes or by email and you get them the same working day.",
    zh: "有。每个规格都有 STEP（3D）和 DWG（2D）。在线下载正在接入，目前在 RFQ 备注或邮件里说明，当个工作日发给你。",
    kw: ["cad", "step", "dwg", "3d", "2d", "drawing", "model", "download", "iges", "图纸", "模型", "下载"],
  },
  {
    id: "custom", cat: "product",
    q: "Can you make a custom size?", zh_q: "可以做非标尺寸吗？",
    a: "Yes. Every component is a sized series, and a size between or beyond the catalog is a drawing change, not a new design. Send the pocket or slide dimensions; custom sizes take 10–15 working days and are priced like the nearest catalog size plus a one-time drawing fee. (verify)",
    zh: "可以。每个产品都是系列化设计，目录以外的尺寸只是改图不是新开发。把安装槽或滑块尺寸发给我们，非标 10–15 个工作日，价格按最近的目录规格加一次性制图费。（待确认）",
    kw: ["custom", "special size", "non-standard", "different size", "bespoke", "非标", "定制", "特殊尺寸"],
  },
  {
    id: "material", cat: "product",
    q: "What materials and hardness do you use?", zh_q: "用什么材料、硬度多少？",
    a: "Housings and cams are SKD61 (H13) at 50–54 HRC. Rods, pins and pillars are SUJ2 or SKD61, ground, 58–62 HRC or nitrided to ≥ 900 HV. Latches are SKD11 at 58–60 HRC. Self-lube bushings are a bronze alloy with graphite plugs. A material certificate with heat number ships with every batch on request.",
    zh: "壳体和斜楔用 SKD61（H13），50–54 HRC；杆、针、导柱用 SUJ2 或 SKD61，磨削，58–62 HRC 或氮化 ≥ 900 HV；卡扣用 SKD11，58–60 HRC；自润滑导套是铜合金嵌石墨。每批可随附带炉号的材质证明。",
    kw: ["material", "steel", "hardness", "hrc", "skd61", "h13", "suj2", "nitrid", "bronze", "certificate", "材料", "硬度", "钢", "氮化", "材质"],
  },
  {
    id: "quality", cat: "product",
    q: "What is the warranty?", zh_q: "质保怎么算？",
    a: "Every part is inspected before it ships, and a dimension report is available on request. Any part that fails from a material or workmanship defect within 12 months is replaced free, including freight. Wear from running without the specified clearance or lubrication is not covered. (verify)",
    zh: "每件出厂前检验，可提供尺寸报告。12 个月内因材料或工艺缺陷失效的零件免费更换，含运费。未按规定间隙或润滑使用造成的磨损不在质保范围。（待确认）",
    kw: ["warranty", "guarantee", "quality", "inspection", "defect", "return", "replace", "质保", "保修", "质量", "退货", "检验"],
  },
  {
    id: "sb-size", cat: "product",
    q: "Which slide balancer size do I need?", zh_q: "滑块平衡器怎么选型号？",
    a: "By slide mass: S 2–6 kg, M 5–15 kg, L 12–35 kg, XL 30–80 kg. If the slide travels at an angle to vertical, use only the weight component along the travel (mass × cos angle). Tell me the mass, for example \"18 kg\", and I will pick the size. Above 80 kg we fit two XL units.",
    zh: "按滑块质量选：S 2–6 kg，M 5–15 kg，L 12–35 kg，XL 30–80 kg。滑块行程与竖直方向有夹角时，只算沿行程方向的重力分量（质量 × cos 角度）。直接告诉我质量，比如「18 kg」，我来选型。超过 80 kg 用两个 XL。",
    kw: ["balancer size", "which size", "sb size", "slide mass", "slide weight", "heavy slide", "gravity", "平衡器", "选型", "滑块重", "重力"],
    link: ["#home-balancer", "Open the sizing tool"],
  },
  {
    id: "sb-install", cat: "product",
    q: "How is the slide balancer installed?", zh_q: "滑块平衡器怎么安装？",
    a: "One rectangular pocket per size, machined in the slide back or the mold plate behind it. The housing bolts in with 4 × M6 (S, M) or 4 × M8 (L, XL); the collar bolts to the slide back. Springs are replaced from the parting line without removing the slide. The pocket drawing is on the product page and in the STEP file.",
    zh: "每个规格一个矩形安装槽，开在滑块背面或其后的模板上。壳体用 4 × M6（S、M）或 4 × M8（L、XL）固定，中间卡箍锁在滑块背面。换弹簧从分型面操作，不用拆滑块。安装槽尺寸见产品页和 STEP 文件。",
    kw: ["install", "mount", "pocket", "assembly", "bolt", "安装", "装配", "固定", "安装槽"],
    link: ["#product-SB", "SB product page"],
  },
  {
    id: "dfm", cat: "eng",
    q: "What is the DFM review and what does it cost?", zh_q: "DFM 评审是什么？收费吗？",
    a: "You send a STEP file, resin, volume and press data; within 48 hours you get a marked-up model and a short report: wall thickness, draft, undercut strategy, gate and parting proposal, sink and warp risk, achievable tolerances. It is free when the project goes on to mold design with us, and quoted separately otherwise.",
    zh: "发来 STEP、材料、产量和注塑机参数，48 小时内给你标注后的模型和简短报告：壁厚、拔模、倒扣方案、浇口和分型建议、缩痕翘曲风险、可达公差。后续委托我们做模具设计则免费，否则单独报价。",
    kw: ["dfm", "review", "design for", "moldability", "feasibility", "48", "report", "评审", "可制造性", "分析"],
    link: ["#services-dfm", "What the DFM review covers"],
  },
  {
    id: "send", cat: "eng",
    q: "What should I send for a quote on a mold?", zh_q: "做模具报价需要提供什么？",
    a: "The part model (STEP, Parasolid or X_T), resin grade, annual volume and target cycle time, cavitation preference, press data (tonnage, tie-bar spacing, max mold height), cosmetic faces and texture spec, critical dimensions with tolerances, and your target date for first samples. Send what you have; we ask for the rest.",
    zh: "零件模型（STEP / Parasolid / X_T）、材料牌号、年产量和目标周期、穴数要求、注塑机参数（吨位、拉杆间距、最大模厚）、外观面和纹理要求、关键尺寸及公差、首样目标日期。有什么先发什么，缺的我们再问。",
    kw: ["what should i send", "what to send", "what do you need", "provide", "information", "requirements", "resin", "press data", "tonnage", "提供", "需要什么", "资料", "发什么"],
    link: ["#services-send", "Full checklist"],
  },
  {
    id: "timeline", cat: "eng",
    q: "How long does a mold take, design to T1?", zh_q: "模具从设计到试模要多久？",
    a: "DFM report on day 2, mold design released in 7–10 working days after the part is frozen, T1 samples 25–35 working days after design approval. So about 35–45 working days from a frozen part to measured samples, depending on size and cavitation.",
    zh: "第 2 天出 DFM 报告，零件冻结后 7–10 个工作日放模具设计，设计确认后 25–35 个工作日出 T1 样件。从零件冻结到带测量报告的样件大约 35–45 个工作日，视模具大小和穴数而定。",
    kw: ["timeline", "t1", "trial", "mold build", "how long mold", "schedule", "weeks", "design to", "周期", "试模", "多久出模", "时间表"],
    link: ["#services", "Design → Mold service"],
  },
  {
    id: "nda", cat: "company",
    q: "Do you sign NDAs?", zh_q: "签保密协议吗？",
    a: "Yes. Send yours or ask for our standard mutual NDA; we sign before any part file is opened. Files are kept on our own server and deleted on request after the project.",
    zh: "签。可以用贵司模板，也可以用我们的标准双向保密协议，签完才打开零件文件。文件存在我们自己的服务器，项目结束后可按要求删除。",
    kw: ["nda", "confidential", "secret", "privacy", "agreement", "保密", "协议", "机密"],
  },
  {
    id: "contact", cat: "company",
    q: "How do I reach a person?", zh_q: "怎么联系到人？",
    a: "Email sales@moldbridge.example or call / WeChat +86 000 0000 0000, Monday to Saturday 08:30–18:00 China time, in English or Chinese. Engineers answer the technical questions themselves.",
    zh: "邮件 sales@moldbridge.example，电话 / 微信 +86 000 0000 0000，周一到周六 08:30–18:00（北京时间），中英文均可。技术问题由工程师直接回答。",
    kw: ["contact", "email", "phone", "wechat", "whatsapp", "human", "person", "someone", "sales", "联系", "电话", "微信", "邮箱", "人工", "客服"],
    link: ["#home-contact", "Contact details"],
  },
  {
    id: "where", cat: "company",
    q: "Where are you and who are you?", zh_q: "你们在哪里、是什么公司？",
    a: "A small engineering team in Dongguan, Guangdong. We design molds and the standard components that come out of that work; parts are machined by partner shops within 40 km under our drawings and inspected here before they ship.",
    zh: "我们是广东东莞的一个小型工程团队，做模具设计，并把设计中反复遇到的问题做成标准件。零件由 40 km 内的合作加工厂按我们的图纸加工，在我们这里检验后发货。",
    kw: ["where are you", "location", "who are you", "about you", "your company", "team", "factory", "dongguan", "china", "哪里", "公司", "工厂", "介绍"],
    link: ["#home-what", "What we do"],
  },
];
