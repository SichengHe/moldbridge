// Builds knowledge.md (FAQ + catalog summary) for the optional LLM worker. Run by build.py.
const fs = require("fs"), path = require("path");
globalThis.window = globalThis;
const root = path.join(__dirname, "..");
eval(fs.readFileSync(path.join(root, "assets/catalog.js"), "utf8"));
eval(fs.readFileSync(path.join(root, "assets/faq.js"), "utf8"));
const defaults = p => { const c = {}; (p.config?.fields || []).forEach(f => c[f.key] = f.opts[0]); return c; };
let md = `# ${NM.brand} knowledge base\n\nContact: ${NM.contact.email} · ${NM.contact.phone} · ${NM.contact.address}\nPrices USD, EXW, per piece. Lead times in working days. Units mm.\n\n## Products\n\n`;
for (const p of NM.products) {
  const fam = NM.familyById(p.family), c = defaults(p);
  md += `### ${p.code} — ${p.name} (${fam.name})\n${p.tag}. ${p.blurb}\n`;
  if (p.problem) md += `Problem: ${p.problem}\nSolution: ${p.solution}\n`;
  md += `Lead: ${p.stock ? "stock, ships in " + p.lead + " days" : "made to order, " + p.lead + " days"}. `;
  if (p.config) md += `Options: ${p.config.fields.map(f => `${f.label} = ${f.opts.join("/")}${f.unit ? " " + f.unit : ""}`).join("; ")}. Example part number ${p.config.pn(c)} at $${p.config.price(c).toFixed(2)}.`;
  md += `\nSpecs: ${p.specs.map(s => s[0] + ": " + s[1]).join("; ")}\nPage: #product-${p.id}\n\n`;
}
md += `## FAQ\n\n`;
for (const f of NM.faq) md += `Q: ${f.q} (${f.zh_q || ""})\nA: ${f.a}\n${f.zh ? "中文: " + f.zh + "\n" : ""}${f.link ? "Link: " + f.link[0] + "\n" : ""}\n`;
fs.writeFileSync(path.join(root, "knowledge.md"), md);
console.log(`knowledge.md ${Math.round(md.length / 1024)} KB`);
