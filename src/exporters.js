// Export an AI Chat answer (Markdown) to Word / Excel / PowerPoint.
// Heavy libraries are dynamically imported so they only load on first use.

function downloadBlob(blob, name) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}
const stripInline = (s) => String(s).replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/`([^`]*)`/g, "$1").trim();
const isDelim = (l) => /^[\s|:\-]+$/.test(l) && l.includes("-");
const splitRow = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => stripInline(c));

export function parseTables(md) {
  const lines = String(md || "").split("\n"); const tables = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("|") && i + 1 < lines.length && isDelim(lines[i + 1])) {
      const header = splitRow(lines[i]); let j = i + 2; const rows = [];
      while (j < lines.length && lines[j].includes("|") && lines[j].trim()) { rows.push(splitRow(lines[j])); j++; }
      tables.push({ header, rows }); i = j - 1;
    }
  }
  return tables;
}
export const hasTables = (md) => parseTables(md).length > 0;

// strip ```chart …``` and other fenced blocks for clean document output
const stripCharts = (md) => String(md || "").replace(/```chart[\s\S]*?```/g, "").replace(/```[\s\S]*?```/g, (b) => b.replace(/```[^\n]*\n?/, "").replace(/```$/, ""));

export async function exportExcel(md, name) {
  const XLSX = await import("xlsx");
  const tables = parseTables(md);
  const wb = XLSX.utils.book_new();
  if (tables.length) {
    tables.forEach((t, k) => {
      const ws = XLSX.utils.aoa_to_sheet([t.header, ...t.rows]);
      ws["!cols"] = t.header.map(() => ({ wch: 22 }));
      XLSX.utils.book_append_sheet(wb, ws, `Table ${k + 1}`);
    });
  } else {
    const ws = XLSX.utils.aoa_to_sheet(stripCharts(md).split("\n").map((l) => [stripInline(l)]));
    XLSX.utils.book_append_sheet(wb, ws, "Answer");
  }
  XLSX.writeFile(wb, `${name}.xlsx`);
}

export async function exportWord(md, name) {
  const { marked } = await import("marked");
  marked.setOptions({ gfm: true, breaks: false });
  const html = marked.parse(stripCharts(md));
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${name}</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#16202B;line-height:1.45}table{border-collapse:collapse;margin:8px 0}th,td{border:1px solid #999;padding:5px 9px;text-align:left}th{background:#EAF1F6}h1,h2,h3{color:#0B2545;font-family:Georgia,serif}code{font-family:Consolas,monospace}</style></head><body>${html}</body></html>`;
  downloadBlob(new Blob(["﻿" + doc], { type: "application/msword" }), `${name}.doc`);
}

function parseBlocks(md) {
  const lines = stripCharts(md).split("\n"); const blocks = []; let i = 0; let para = []; let li = [];
  const flushPara = () => { if (para.length) { blocks.push({ type: "p", text: stripInline(para.join(" ")) }); para = []; } };
  const flushLi = () => { if (li.length) { blocks.push({ type: "li", items: li.map(stripInline) }); li = []; } };
  while (i < lines.length) {
    const l = lines[i];
    if (l.includes("|") && i + 1 < lines.length && isDelim(lines[i + 1])) {
      flushPara(); flushLi();
      const header = splitRow(l); let j = i + 2; const rows = [];
      while (j < lines.length && lines[j].includes("|") && lines[j].trim()) { rows.push(splitRow(lines[j])); j++; }
      blocks.push({ type: "table", header, rows }); i = j; continue;
    }
    const h = l.match(/^(#{1,6})\s+(.*)/);
    if (h) { flushPara(); flushLi(); blocks.push({ type: "h", level: h[1].length, text: stripInline(h[2]) }); i++; continue; }
    const lim = l.match(/^\s*[-*]\s+(.*)/) || l.match(/^\s*\d+\.\s+(.*)/);
    if (lim) { flushPara(); li.push(lim[1]); i++; continue; }
    if (!l.trim()) { flushPara(); flushLi(); i++; continue; }
    para.push(l); i++;
  }
  flushPara(); flushLi();
  return blocks;
}

export async function exportPPT(md, name) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const p = new PptxGenJS(); p.layout = "LAYOUT_WIDE";
  const NAVY = "0B2545", INK = "16202B", TEAL = "1C7293";
  const blocks = parseBlocks(md);
  const slides = []; let cur = null;
  const ensure = (title) => { cur = { title: title || "AI output", body: [], tables: [] }; slides.push(cur); };
  for (const b of blocks) {
    if (b.type === "h" && b.level <= 2) { ensure(b.text); continue; }
    if (!cur) ensure(name || "AI output");
    if (b.type === "table") cur.tables.push(b);
    else if (b.type === "h") cur.body.push({ bold: true, text: b.text });
    else if (b.type === "li") b.items.forEach((it) => cur.body.push({ bullet: true, text: it }));
    else cur.body.push({ text: b.text });
  }
  if (!slides.length) ensure(name || "AI output");
  // title slide
  let s = p.addSlide(); s.background = { color: NAVY };
  s.addText(name || "AI output", { x: 0.7, y: 2.6, w: 12, h: 1, fontSize: 30, bold: true, color: "FFFFFF" });
  s.addText("Generated with the built-in AI assistant", { x: 0.7, y: 3.6, w: 12, h: 0.5, fontSize: 14, color: "C9D6E2" });
  for (const sl of slides) {
    s = p.addSlide();
    s.addText(sl.title, { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 20, bold: true, color: NAVY });
    let y = 1.1;
    if (sl.body.length) {
      const runs = sl.body.map((b) => ({ text: b.text + "\n", options: { bullet: b.bullet ? { indent: 14 } : false, bold: !!b.bold, fontSize: 12, color: INK } }));
      s.addText(runs, { x: 0.5, y, w: 12.3, h: Math.min(3.4, 0.3 + sl.body.length * 0.28), valign: "top" });
      y += Math.min(3.6, 0.4 + sl.body.length * 0.28);
    }
    for (const t of sl.tables) {
      const rows = [t.header.map((h) => ({ text: h, options: { bold: true, color: "FFFFFF", fill: TEAL } })), ...t.rows.map((r) => r.map((c) => ({ text: c })))];
      s.addTable(rows, { x: 0.5, y, w: 12.3, fontSize: 10, color: INK, border: { type: "solid", color: "D7DEE6" }, autoPage: true });
      y += 0.4 + (t.rows.length + 1) * 0.26;
    }
  }
  await p.writeFile({ fileName: `${name}.pptx` });
}
