// Northwind Cockpit — live AI Analyst (all five days).
//
// Runs a real Claude analysis on the (fictional) Northwind case and returns a
// structured result the app renders as a narrative + live chart/table/roadmap.
// Gated to a valid pre-issued seat code (or the admin key). Fictional data only.
//
//   { action:"analyze", kind, code, backlog? }  -> { ok, result }
//
// kinds: opportunity-map | supplier-risk | contract-risk | logistics-gains | roadmap

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CLAUDE_MODEL = "claude-haiku-4-5";
const GEMINI_MODEL = "gemini-2.5-flash";
const SYSTEM = "You are a precise procurement and supply-chain analyst for a training simulation. You always output strictly valid JSON matching the requested schema, and nothing else.";

const NW = `Northwind is a fictional £1.8bn building-systems manufacturer: a 95-person procurement team, four separate ERPs (no single view), ~200,000 mostly-manual invoices a year, ~3,200 suppliers, ~5,000 contracts, top-50 suppliers ≈ 60% of spend. Board goals: Release value, Build resilience, Deliver sustainability, Transform the function.`;

function userPrompt(kind: string, payload: any): string | null {
  switch (kind) {
    case "opportunity-map":
      return `${NW}\nPropose 8 high-impact, realistic AI opportunities for this team across suppliers, contracts, supply chain and sustainability. For each give: a short title, type ("Automate" or "Augment"), the single board goal it best serves, a value score 0-100, an ease-of-implementation score 0-100, and a one-line note.\nReturn ONLY JSON: {"narrative":"2-3 sentence executive summary","items":[{"title":"","type":"Automate","goal":"Release value","value":85,"ease":70,"note":""}]} ordered by value descending. The goal must be exactly one of the four board goals.`;
    case "supplier-risk":
      return `You are ranking the supply risk of these suppliers of Northwind (a fictional £1.8bn building-systems manufacturer). Use ONLY these, names EXACTLY as written:
- Helios Components — £42m/yr, control modules, SE Asia, SINGLE SOURCE, on-time 91% but lead times lengthening, contract auto-renews with UNCAPPED liability and no exit clause.
- Meridian Steel — £88m/yr, structural steel, UK, on-time 96% stable, but price is an UNCAPPED index.
- Castore Logistics — £54m/yr, 3PL logistics, UK/EU, on-time 88% and worsening, weak SLA penalties.
- Verdant Polymers — £35m/yr, polymers & insulation, EU, 60-day rolling contract, no volume commitment.
- Atlas Freight — £31m/yr, sea freight, global, volatile spot rates.
- Aurora Electronics — £28m/yr, sensors, East Asia, on-time 82%, defects 3.1%, volatile lead times, contract terms expired/"not stated".
- Sahara Cables — £22m/yr, wiring & cabling, North Africa, SINGLE SOURCE, region risk.
Rank ALL seven from highest to lowest overall supply risk. Weigh single-source dependency, region, contract weakness and performance trend ABOVE raw spend.
Return ONLY JSON: {"narrative":"2-3 sentence summary a CPO could read aloud","suppliers":[{"name":"<exact name>","risk":0-100,"driver":"one short line","mitigation":"one short line"}]} ordered highest risk first, with risk scores spread across the range.`;
    case "contract-risk":
      return `${NW}\nTriage these contracts and rank by overall risk & urgency: C-1001 Helios £42m auto-renews yearly (90-day notice), UNCAPPED liability, no exit; C-1002 Meridian £88m ends 31 Dec 2026, UNCAPPED price index; C-1003 Castore £54m ends 2027, weak SLA penalties; C-1044 Aurora £28m evergreen, terms expired/"not stated"; C-1071 Verdant £35m 60-day rolling, no volume commitment; C-2003 Sahara £22m rolling, SINGLE SOURCE; C-3001 Summit £7m SaaS, light data/security.\nReturn ONLY JSON: {"narrative":"","contracts":[{"ref":"C-1001","supplier":"Helios Components","risk":0-100,"issue":"one line","action":"the single next action"}]} ordered by risk descending. Use the exact refs given.`;
    case "logistics-gains":
      return `${NW}\nNorthwind's logistics: £120m transport spend (road 60% / sea 30% / air 7% / rail 3%), 87% on-time, 6% failed deliveries, 72% fleet utilisation, manual regional routing, default carriers. Propose the highest-impact AI improvements. For each give a payback score 0-100 (higher = faster payback) and one short line each for cost, service and carbon impact.\nReturn ONLY JSON: {"narrative":"","improvements":[{"title":"","payback":0-100,"cost":"","service":"","carbon":""}]} ordered by payback descending.`;
    case "roadmap": {
      const bl = Array.isArray(payload?.backlog) ? payload.backlog : [];
      const list = bl.length
        ? bl.map((b: any) => `- ${String(b.title || "").slice(0, 80)} (goal: ${b.goal || "?"}, value: ${b.value || "?"}, readiness: ${b.readiness || "?"})`).join("\n")
        : "(The learner's backlog is empty — propose a sensible starter set of 6 Northwind AI initiatives instead.)";
      return `${NW}\nTurn this learner's AI opportunity backlog into a phased roadmap for Northwind.\nBacklog:\n${list}\nGroup the items into EXACTLY four phases, in this order: Foundations, Quick wins, Scale, Transform. Place each item in the best phase and add a one-line "why". You may add 1-2 sensible items if a phase would otherwise be empty.\nReturn ONLY JSON: {"narrative":"","phases":[{"phase":"Foundations","items":[{"title":"","why":""}]},{"phase":"Quick wins","items":[]},{"phase":"Scale","items":[]},{"phase":"Transform","items":[]}]} with all four phases present, in that order.`;
    }
    default:
      return null;
  }
}

function extractJson(txt: string, lead = ""): any {
  let raw = lead + txt;
  try { return JSON.parse(raw); } catch (e) {}
  const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(raw.slice(a, b + 1)); } catch (e) {} }
  return null;
}

async function callClaude(prompt: string): Promise<any> {
  const key = Deno.env.get("COCKPIT_ANTHROPIC_KEY");
  if (!key) return { error: "no claude key" };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: CLAUDE_MODEL, max_tokens: 1400, system: SYSTEM,
      messages: [{ role: "user", content: prompt }, { role: "assistant", content: "{" }],
    }),
  });
  if (!res.ok) return { error: `model error ${res.status}: ${(await res.text()).slice(0, 200)}` };
  const data = await res.json();
  const parsed = extractJson(data?.content?.[0]?.text ?? "", "{");
  return parsed ? { parsed } : { error: "unparseable model response" };
}

async function callGemini(prompt: string): Promise<any> {
  const key = Deno.env.get("COCKPIT_GEMINI_KEY") || Deno.env.get("GEMINI_API_KEY");
  if (!key) return { error: "no gemini key" };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048, responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  if (!res.ok) return { error: `model error ${res.status}: ${(await res.text()).slice(0, 200)}` };
  const data = await res.json();
  const parsed = extractJson(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
  return parsed ? { parsed } : { error: "unparseable model response" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let p: any;
  try { p = await req.json(); } catch { return json({ error: "invalid json" }, 400); }
  if (p?.action !== "analyze") return json({ error: "unknown action" }, 400);

  const prompt = userPrompt(p?.kind, p);
  if (!prompt) return json({ error: "unsupported kind" }, 400);

  // gate: admin key OR a valid pre-issued seat code
  const adminKey = Deno.env.get("ADMIN_KEY");
  let allowed = adminKey && p?.adminKey === adminKey;
  if (!allowed && p?.code) {
    const { data } = await db.rpc("cockpit_signin", { p_code: String(p.code).trim().toUpperCase() });
    allowed = !!data;
  }
  if (!allowed) return json({ error: "unauthorized — sign in with your access code first" }, 401);

  const out = Deno.env.get("COCKPIT_ANTHROPIC_KEY") ? await callClaude(prompt) : await callGemini(prompt);
  if (out.error) return json({ error: out.error }, 502);
  return json({ ok: true, result: out.parsed });
});
