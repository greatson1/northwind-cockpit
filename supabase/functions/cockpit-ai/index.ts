// Northwind Cockpit — live AI Analyst.
//
// Runs a real Claude analysis on the (fictional) Northwind case and returns a
// structured result the app renders as a narrative + live chart + table.
// Gated to a valid pre-issued seat code (or the admin key) so the paid endpoint
// can't be abused. Fictional data only — nothing personal or confidential.
//
//   { action: "analyze", kind: "supplier-risk", code }  -> { ok, result }
//
// result = { narrative, suppliers: [{ name, risk(0-100), driver, mitigation }] }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const GEMINI_MODEL = "gemini-2.5-flash";

// The fixed supplier set the AI must rank — names must match so the app can score "Beat the AI".
const SUPPLIER_BRIEF = `You are ranking the supply risk of these suppliers of Northwind, a fictional £1.8bn building-systems manufacturer. Use ONLY these and keep the names EXACTLY as written:
- Helios Components — £42m/yr, control modules, SE Asia, SINGLE SOURCE, on-time 91% but lead times lengthening, contract auto-renews with UNCAPPED liability and no exit clause.
- Meridian Steel — £88m/yr, structural steel, UK, on-time 96% stable, but price is an UNCAPPED index (cost risk).
- Castore Logistics — £54m/yr, 3PL logistics, UK/EU, on-time 88% and worsening, weak SLA penalties.
- Verdant Polymers — £35m/yr, polymers & insulation, EU, 60-day rolling contract, no volume commitment.
- Atlas Freight — £31m/yr, sea freight, global, volatile spot rates.
- Aurora Electronics — £28m/yr, sensors, East Asia, on-time 82%, defects 3.1%, volatile lead times, contract terms expired/"not stated".
- Sahara Cables — £22m/yr, wiring & cabling, North Africa, SINGLE SOURCE, region risk.`;

const SCHEMA_INSTRUCTION = `Rank ALL seven suppliers from highest to lowest overall supply risk. Weigh single-source dependency, region, contract weakness (uncapped liability, no exit, expired terms), and performance trend ABOVE raw spend. Respond with ONLY a JSON object, no prose before or after:
{"narrative":"2-3 sentence executive summary a CPO could read aloud","suppliers":[{"name":"<exact name>","risk":<integer 0-100>,"driver":"one short line — the main risk driver","mitigation":"one short line — a practical mitigation"}]}
Order the suppliers array from highest risk to lowest. Make risk scores spread across the range so the ranking is clear.`;

async function callGemini(): Promise<any> {
  const key = Deno.env.get("COCKPIT_GEMINI_KEY") || Deno.env.get("GEMINI_API_KEY");
  if (!key) return { error: "GEMINI_API_KEY not configured" };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: "You are a precise supply-chain risk analyst. Output strictly valid JSON matching the requested schema and nothing else." }] },
      contents: [{ role: "user", parts: [{ text: `${SUPPLIER_BRIEF}\n\n${SCHEMA_INSTRUCTION}` }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048, responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  if (!res.ok) return { error: `model error ${res.status}: ${(await res.text()).slice(0, 200)}` };
  const data = await res.json();
  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  let parsed: any = null;
  try { parsed = JSON.parse(txt); } catch {
    const a = txt.indexOf("{"), b = txt.lastIndexOf("}");
    if (a >= 0 && b > a) { try { parsed = JSON.parse(txt.slice(a, b + 1)); } catch (e) {} }
  }
  return parsed ? { parsed } : { error: "unparseable model response" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let p: any;
  try { p = await req.json(); } catch { return json({ error: "invalid json" }, 400); }
  if (p?.action !== "analyze") return json({ error: "unknown action" }, 400);
  if (p?.kind !== "supplier-risk") return json({ error: "unsupported kind" }, 400);

  // gate: admin key OR a valid pre-issued seat code
  const adminKey = Deno.env.get("ADMIN_KEY");
  let allowed = adminKey && p?.adminKey === adminKey;
  if (!allowed && p?.code) {
    const { data } = await db.rpc("cockpit_signin", { p_code: String(p.code).trim().toUpperCase() });
    allowed = !!data;
  }
  if (!allowed) return json({ error: "unauthorized — sign in with your access code first" }, 401);

  const out = await callGemini();
  if (out.error) return json({ error: out.error }, 502);

  // sanitise
  const suppliers = Array.isArray(out.parsed.suppliers) ? out.parsed.suppliers : [];
  const clean = suppliers
    .filter((s: any) => s && s.name)
    .map((s: any) => ({
      name: String(s.name),
      risk: Math.max(0, Math.min(100, Math.round(Number(s.risk) || 0))),
      driver: String(s.driver || "").slice(0, 160),
      mitigation: String(s.mitigation || "").slice(0, 160),
    }))
    .sort((a: any, b: any) => b.risk - a.risk)
    .slice(0, 8);

  return json({ ok: true, result: { narrative: String(out.parsed.narrative || "").slice(0, 600), suppliers: clean } });
});
