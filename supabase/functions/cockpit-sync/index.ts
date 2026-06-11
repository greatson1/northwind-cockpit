// Northwind Cockpit — code-based identity + sync + admin dashboard.
//
// Per-learner identity with NO personal data: the instructor pre-issues seat
// codes (e.g. NW-7K2Q); the code is both the identity and the secret. Entering
// the same code on any device loads that learner's work (cross-device), and an
// unknown code cannot write (impersonation/spam proof — saves require a real,
// pre-issued seat).
//
// Data lives in an isolated `cockpit` schema, reached only through SECURITY
// DEFINER RPCs called with the service role — so anon/public can't touch it and
// we never use (or risk) Supabase Auth on this shared project.
//
// Actions:
//   { action: "signin", code }                       -> { ok, seat } | 404
//   { action: "save", code, handle?, data }          -> { ok } | 404
//   { action: "list", cohort?, adminKey }            -> { ok, seats }      (admin)
//   { action: "generate", cohort, count, adminKey }  -> { ok, codes }      (admin)
//
// Deployed with --no-verify-jwt; access control is enforced in-function.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

// unambiguous alphabet (no I/O/0/1/L) -> NW-XXXXX, ~24M combinations
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function genCode(): string {
  const b = crypto.getRandomValues(new Uint8Array(5));
  let s = "";
  for (const x of b) s += ALPHABET[x % ALPHABET.length];
  return `NW-${s}`;
}
const normCode = (c: unknown) => String(c ?? "").trim().toUpperCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: "invalid json" }, 400); }
  const action = payload?.action;

  if (action === "signin") {
    const code = normCode(payload?.code);
    if (!code) return json({ error: "code required" }, 400);
    const { data, error } = await db.rpc("cockpit_signin", { p_code: code });
    if (error) return json({ error: error.message }, 500);
    if (!data) return json({ error: "unknown code" }, 404);
    return json({ ok: true, seat: data });
  }

  if (action === "save") {
    const code = normCode(payload?.code);
    if (!code) return json({ error: "code required" }, 400);
    const { data, error } = await db.rpc("cockpit_save", {
      p_code: code,
      p_handle: payload?.handle ?? null,
      p_data: payload?.data ?? {},
    });
    if (error) return json({ error: error.message }, 500);
    if (!data) return json({ error: "unknown code" }, 404);
    return json({ ok: true });
  }

  if (action === "list") {
    const adminKey = Deno.env.get("ADMIN_KEY");
    if (!adminKey) return json({ error: "ADMIN_KEY not configured" }, 500);
    if (payload?.adminKey !== adminKey) return json({ error: "unauthorized" }, 401);
    const cohort = payload?.cohort && String(payload.cohort).trim() ? String(payload.cohort).trim() : null;
    const { data, error } = await db.rpc("cockpit_list", { p_cohort: cohort });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, seats: data ?? [] });
  }

  if (action === "generate") {
    const adminKey = Deno.env.get("ADMIN_KEY");
    if (!adminKey) return json({ error: "ADMIN_KEY not configured" }, 500);
    if (payload?.adminKey !== adminKey) return json({ error: "unauthorized" }, 401);
    const cohort = String(payload?.cohort ?? "").trim();
    if (!cohort) return json({ error: "cohort required" }, 400);
    const want = Math.min(Math.max(parseInt(payload?.count, 10) || 0, 1), 500);

    const out: string[] = [];
    let guard = 0;
    while (out.length < want && guard < 25) {
      guard++;
      const batch = Array.from({ length: want - out.length }, genCode);
      const { data, error } = await db.rpc("cockpit_generate", { p_cohort: cohort, p_codes: batch });
      if (error) return json({ error: error.message }, 500);
      for (const r of data ?? []) out.push(typeof r === "string" ? r : (r.new_code ?? r.code));
    }
    return json({ ok: true, cohort, codes: out });
  }

  return json({ error: "unknown action" }, 400);
});
