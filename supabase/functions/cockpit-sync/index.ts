// Northwind Cockpit — session sync + admin dashboard edge function.
//
// Single endpoint, two actions:
//   { action: "save", learnerId, cohort, name, data }
//       → upserts the learner's snapshot into cockpit.cockpit_sessions
//   { action: "list", cohort?, adminKey }
//       → admin-only; returns sessions (optionally filtered by cohort)
//         after checking adminKey against the ADMIN_KEY secret
//
// Uses the service role (server-side only) so the table can stay in a
// private, RLS-locked schema that anon/public can never read or write.
// Deployed with --no-verify-jwt; access control is enforced in-function.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

// Table lives in the public schema (RLS-enabled, no policies + anon revoked),
// so only this service-role client can read or write it.
const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const action = payload?.action;

  if (action === "save") {
    const { learnerId, cohort, name, data } = payload;
    if (!learnerId || !UUID_RE.test(String(learnerId))) return json({ error: "bad learnerId" }, 400);
    if (!cohort || !String(cohort).trim()) return json({ error: "cohort required" }, 400);
    if (!name || !String(name).trim()) return json({ error: "name required" }, 400);

    const { error } = await db
      .from("cockpit_sessions")
      .upsert(
        {
          learner_id: learnerId,
          cohort: String(cohort).trim(),
          name: String(name).trim(),
          data: data ?? {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: "learner_id" },
      );

    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === "list") {
    const adminKey = Deno.env.get("ADMIN_KEY");
    if (!adminKey) return json({ error: "ADMIN_KEY not configured" }, 500);
    if (payload?.adminKey !== adminKey) return json({ error: "unauthorized" }, 401);

    let q = db
      .from("cockpit_sessions")
      .select("learner_id, cohort, name, data, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (payload?.cohort && String(payload.cohort).trim()) {
      q = q.eq("cohort", String(payload.cohort).trim());
    }

    const { data: rows, error } = await q;
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, sessions: rows ?? [] });
  }

  return json({ error: "unknown action" }, 400);
});
