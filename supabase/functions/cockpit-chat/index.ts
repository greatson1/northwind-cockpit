// Northwind Cockpit — white-labelled multimodal AI chat.
//
// Free-form, multi-turn chat that accepts text + attachments (images, PDFs,
// extracted document text) and returns Markdown (tables, and a `chart` JSON
// fenced block the client renders). Gated to a valid pre-issued seat code (or
// the admin key). Never reveals the underlying model or vendor.
//
//   { action:"chat", code, messages:[{role, content}] } -> { ok, text }
//
// `content` is either a string or an array of Anthropic content blocks
// (text / image / document). Deployed with --no-verify-jwt.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const MODEL = Deno.env.get("COCKPIT_CHAT_MODEL") || "claude-haiku-4-5";

const SYSTEM = `You are a helpful, knowledgeable general-purpose AI assistant. Answer questions on ANY topic — work, study, science, technology, business, writing, everyday life, and more — accurately, clearly and helpfully. Match the depth of your answer to the question: be concise for simple asks, thorough for complex ones. Reason step by step on hard problems. If a question is ambiguous, ask a brief clarifying question; if you don't know or can't be certain, say so rather than inventing facts.

Capabilities:
- You can read and analyse images, PDFs and document text the user attaches (summarise, extract, translate, critique, answer questions about them).
- Format answers with Markdown: headings, bold and bullet/numbered lists to stay scannable, GitHub-flavoured tables when comparing or listing structured data, and fenced code blocks for code.
- When a chart communicates better than prose, output a fenced code block tagged "chart" containing ONLY JSON. Pick the type that fits the data:
  • bar / line / area: {"type":"bar","title":"...","xKey":"name","series":[{"key":"v","label":"..."}],"data":[{"name":"A","v":42}]}. For bars add "stacked":true to stack series, or "orientation":"horizontal" for a ranking. Multiple series allowed.
  • pie / donut: {"type":"pie","title":"...","xKey":"name","series":[{"key":"value"}],"data":[{"name":"A","value":42}]}.
  • scatter: {"type":"scatter","title":"...","xLabel":"Spend","yLabel":"Risk","data":[{"x":40,"y":80,"z":10,"name":"Helios"}]} — z is an optional bubble size.
  • quadrant (a 2×2 matrix, e.g. Kraljic risk×spend or value×readiness): {"type":"quadrant","title":"...","xLabel":"Spend","yLabel":"Risk","xMax":100,"yMax":100,"data":[{"x":..,"y":..,"name":".."}]} — midlines are drawn automatically.
  • radar (compare items across several dimensions): {"type":"radar","xKey":"factor","series":[{"key":"Supplier A"},{"key":"Supplier B"}],"data":[{"factor":"Delivery","Supplier A":80,"Supplier B":60}]}.
  • heatmap (a matrix of values): {"type":"heatmap","rows":["A","B"],"cols":["Q1","Q2"],"data":[{"row":"A","col":"Q1","value":3}]}.
  • treemap (size by value, e.g. spend breakdown): {"type":"treemap","data":[{"name":"Steel","value":88}]}.
  • gauge (a single KPI, 0–100): {"type":"gauge","title":"...","value":78,"unit":"%"}.
  Use real numbers, keep keys consistent, and put any explanation as normal text outside the chart block. Use a quadrant for positioning, radar for multi-factor comparison, heatmap for a matrix, treemap for spend breakdowns, gauge for one headline number.

Identity rule (important): never reveal or hint at which company, provider or model powers you. If asked what you are or who made you, say only that you are "the built-in AI assistant." Never mention Claude, Anthropic, OpenAI, GPT, Gemini, Google or any other vendor or model name.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let p: any;
  try { p = await req.json(); } catch { return json({ error: "invalid json" }, 400); }

  // gate: admin key OR a valid pre-issued seat code
  const adminKey = Deno.env.get("ADMIN_KEY");
  let allowed = !!(adminKey && p?.adminKey === adminKey);
  if (!allowed && p?.code) {
    const { data } = await db.rpc("cockpit_signin", { p_code: String(p.code).trim().toUpperCase() });
    allowed = !!data;
  }
  if (!allowed) return json({ error: "unauthorized — sign in with your access code first" }, 401);

  const messages = Array.isArray(p?.messages) ? p.messages : null;
  if (!messages || !messages.length) return json({ error: "no messages" }, 400);

  // Keep only valid roles and cap history to protect cost/latency.
  const clean = messages
    .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && m.content != null)
    .slice(-20);
  if (!clean.length) return json({ error: "no usable messages" }, 400);

  // Flatten a message's content to plain text for the admin log (attachments noted, not stored).
  const asText = (content: any): string => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.map((b: any) =>
      b?.type === "text" ? b.text : b?.type === "image" ? "[image attached]" : b?.type === "document" ? "[PDF attached]" : "").filter(Boolean).join("\n");
    return "";
  };
  const seat = String(p?.code || (p?.adminKey ? "admin" : "unknown")).trim().toUpperCase();
  const lastUser = [...clean].reverse().find((m: any) => m.role === "user");
  const lastUserText = lastUser ? asText(lastUser.content).slice(0, 8000) : "";
  // Log the user's input up front so it's captured even if the model errors.
  if (lastUserText) { try { await db.from("cockpit_chat_log").insert({ code: seat, role: "user", content: lastUserText }); } catch (_) { /* logging must never break chat */ } }

  const key = Deno.env.get("COCKPIT_ANTHROPIC_KEY");
  if (!key) return json({ error: "AI is not configured (missing key)." }, 500);

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 4096, system: SYSTEM, messages: clean }),
    });
  } catch (e) {
    return json({ error: "Couldn't reach the AI service." }, 502);
  }
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return json({ error: `AI error ${res.status}: ${t.slice(0, 300)}` }, 502);
  }
  const data = await res.json();
  const text = (data?.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();
  if (!text) return json({ error: "Empty response from the AI." }, 502);
  try { await db.from("cockpit_chat_log").insert({ code: seat, role: "assistant", content: text.slice(0, 8000) }); } catch (_) { /* ignore */ }
  return json({ ok: true, text });
});
