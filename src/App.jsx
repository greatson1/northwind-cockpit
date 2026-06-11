import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import {
  Compass, ListChecks, LayoutGrid, Rocket, Home as HomeIcon, Copy, Check,
  Plus, X, AlertTriangle, ChevronRight, Building2,
} from "lucide-react";

/* ---------------- palette & type ---------------- */
const C = {
  navy: "#0B2545", deep: "#13315C", teal: "#1C7293", mint: "#5BC0BE",
  amber: "#EE964B", gold: "#F4A259", light: "#F4F7FA", ink: "#16202B",
  body: "#33424F", muted: "#6B7C8C", line: "#E2E9F0", cardl: "#EAF1F6",
  white: "#FFFFFF",
};
const serif = "Georgia, 'Times New Roman', serif";
const sans = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/* ---------------- persistence ----------------
   Uses the sandbox window.storage API when present, otherwise falls back
   to browser localStorage so progress persists in a normal deployment. */
const store = {
  async get(key) {
    if (typeof window !== "undefined" && window.storage) return window.storage.get(key);
    if (typeof localStorage !== "undefined") {
      const value = localStorage.getItem(key);
      return value == null ? null : { value };
    }
    return null;
  },
  async set(key, value) {
    if (typeof window !== "undefined" && window.storage) return window.storage.set(key, value);
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  },
};

/* ---------------- Northwind data ---------------- */
const PROFILE = [
  ["Revenue", "£1.8bn / year"],
  ["Footprint", "14 countries · 6 plants · 9 DCs"],
  ["Systems", "4 separate ERPs — no single view"],
  ["Suppliers", "~3,200 active"],
  ["Contracts", "~5,000 active"],
  ["Invoices", "~200,000 / year, mostly manual"],
  ["Procurement team", "95 people"],
  ["Spend concentration", "Top 50 ≈ 60% of spend"],
  ["Addressable spend", "~£1.1bn"],
  ["Scope 3 target", "−50% by 2030"],
];
const MANDATE = [
  ["Release value", C.teal],
  ["Build resilience", C.amber],
  ["Deliver sustainability", C.mint],
  ["Transform the function", C.deep],
];
const SUPPLIERS = [
  { name: "Helios Components", cat: "Control modules", spend: 42, region: "SE Asia", risk: "High", single: true },
  { name: "Meridian Steel", cat: "Structural steel", spend: 88, region: "UK", risk: "Medium", single: false },
  { name: "Castore Logistics", cat: "Logistics (3PL)", spend: 54, region: "UK / EU", risk: "Medium", single: false },
  { name: "Verdant Polymers", cat: "Polymers & insulation", spend: 35, region: "EU", risk: "Medium", single: false },
  { name: "Atlas Freight", cat: "Sea freight", spend: 31, region: "Global", risk: "Medium", single: false },
  { name: "Aurora Electronics", cat: "Sensors", spend: 28, region: "East Asia", risk: "High", single: false },
  { name: "Sahara Cables", cat: "Wiring & cabling", spend: 22, region: "North Africa", risk: "High", single: true },
  { name: "Brunel Castings", cat: "Metal castings", spend: 19, region: "UK", risk: "Low", single: false },
  { name: "Nordic Glass", cat: "Glazing", spend: 16, region: "EU", risk: "Low", single: false },
  { name: "Pioneer Fasteners", cat: "Fasteners", spend: 9, region: "East Asia", risk: "Medium", single: false },
  { name: "Summit Software", cat: "SaaS / IT", spend: 7, region: "US", risk: "Low", single: false },
  { name: "Tail (~3,000 suppliers)", cat: "Mixed", spend: 410, region: "Global", risk: "Mixed", single: null },
];
const PERFORMANCE = {
  "Helios Components": { onTime: "91%", defect: "1.8%", lead: "Lengthening", resp: "Slow" },
  "Meridian Steel": { onTime: "96%", defect: "0.4%", lead: "Stable", resp: "Good" },
  "Castore Logistics": { onTime: "88%", defect: "service only", lead: "Worsening", resp: "Variable" },
  "Aurora Electronics": { onTime: "82%", defect: "3.1%", lead: "Volatile", resp: "Slow" },
  "Sahara Cables": { onTime: "90%", defect: "1.2%", lead: "Lengthening", resp: "Variable" },
};
const CONTRACTS = [
  { ref: "C-1001", supplier: "Helios Components", value: 42, term: "Auto-renews yearly; 90-day notice", liability: "Uncapped", exit: "No exit clause", price: "Fixed + annual review", other: "Standard" },
  { ref: "C-1002", supplier: "Meridian Steel", value: 88, term: "Ends 31 Dec 2026", liability: "Cap £5m", exit: "6-month notice", price: "Index-linked, no cap", other: "Standard" },
  { ref: "C-1003", supplier: "Castore Logistics", value: 54, term: "Ends 30 Jun 2027", liability: "Cap £2m", exit: "3-month notice", price: "Fixed", other: "Weak SLA penalties" },
  { ref: "C-1044", supplier: "Aurora Electronics", value: 28, term: "Evergreen; term expired", liability: "Not stated", exit: "Not stated", price: "Fixed", other: "Not stated" },
  { ref: "C-1071", supplier: "Verdant Polymers", value: 35, term: "60-day rolling", liability: "Cap £1m", exit: "60-day notice", price: "Fixed", other: "No volume commitment" },
  { ref: "C-2003", supplier: "Sahara Cables", value: 22, term: "Rolling", liability: "Cap £1m", exit: "30-day notice", price: "Fixed", other: "Single-source; N. Africa" },
  { ref: "C-4002", supplier: "Atlas Freight", value: 31, term: "Mixed spot / contract", liability: "Cap £1m", exit: "30-day notice", price: "Spot rates (volatile)", other: "Standard" },
  { ref: "C-3001", supplier: "Summit Software", value: 7, term: "Auto-renews", liability: "Cap = fees", exit: "30-day notice", price: "Annual uplift", other: "Light data & security" },
];
const DEMAND = [
  { cat: "Fast movers (controls)", method: "Statistical", acc: "80%", inv: 30, svc: "96%", issue: "Performing well" },
  { cat: "Seasonal (HVAC)", method: "Manual", acc: "62%", inv: 45, svc: "89%", issue: "Excess and stockouts" },
  { cat: "Promotional lines", method: "Manual", acc: "54%", inv: 22, svc: "88%", issue: "High obsolescence" },
  { cat: "Spares / slow movers", method: "Reorder point", acc: "60%", inv: 38, svc: "91%", issue: "Dead stock building" },
  { cat: "New products", method: "Judgement", acc: "40%", inv: 15, svc: "84%", issue: "Launch over/under-stock" },
];
const LOGISTICS = [
  ["Annual transport spend", "£120m"],
  ["Mode split", "Road 60% · Sea 30% · Air 7% · Rail 3%"],
  ["On-time delivery", "87%"],
  ["Failed-delivery rate", "6%"],
  ["Fleet utilisation", "72%"],
  ["Planning", "Manual regional routing; default carriers"],
];
const EMISSIONS_SPLIT = [
  { name: "Scope 3", value: 84, fill: C.navy },
  { name: "Scope 2", value: 9, fill: C.teal },
  { name: "Scope 1", value: 7, fill: C.mint },
];
const EMISSIONS_NOTES = [
  ["Within Scope 3", "Purchased goods 52% · Transport 18% · Other 14%"],
  ["Concentration", "~15% of suppliers ≈ 60% of supply-chain emissions"],
  ["Data quality", "Spend-based estimate only — low confidence"],
  ["Target", "−50% Scope 3 by 2030"],
];

const GOALS = ["Release value", "Build resilience", "Deliver sustainability", "Transform the function"];
const GOAL_COLOR = { "Release value": C.teal, "Build resilience": C.amber, "Deliver sustainability": C.mint, "Transform the function": C.deep };
const LEVELS = ["High", "Medium", "Low"];

/* ---------------- mission content ---------------- */
const DAYS = [
  {
    n: 1, title: "AI Foundations", theme: "Overview · Strategy · Ethics · Alignment · Relationships",
    objectives: ["Explain what AI is and where it fits", "Describe AI's strategic role", "Apply responsible-AI principles", "Align AI to organisational goals", "See how AI reshapes relationships"],
    activities: [
      { type: "exercise", title: "Spot the AI opportunities", steps: ["In Explore, look at the company profile.", "List five tasks the 95-person team likely does manually.", "Mark each repetitive vs judgement, and pick the best AI candidate."] },
      { type: "ai", title: "Sort AI use cases with an LLM", prompt: "You are a procurement transformation advisor. A £1.8bn building-systems manufacturer has a 95-person procurement team using four ERPs and mostly manual processes. List ten realistic ways AI could help. For each, give a one-line description and label it automate or augment. Present as a table." },
      { type: "exercise", title: "Goal-link the ideas", steps: ["Read Northwind's four board goals.", "Link four of your AI ideas to a goal.", "Cross out any you cannot link — that is the test."] },
      { type: "challenge", title: "Build your AI Opportunity Map", body: "Brainstorm 8–10 AI opportunities across suppliers, contracts, supply chain and sustainability. Add the best to your Opportunity Backlog — it grows all week.", to: "backlog" },
    ],
  },
  {
    n: 2, title: "Supplier Management", theme: "SRM · Performance · Risk · Collaboration · Trust",
    objectives: ["Segment supplier relationships", "Predict performance from data", "Identify and monitor risk", "Use AI to collaborate", "Build trust and transparency"],
    activities: [
      { type: "exercise", title: "Segment the base", steps: ["In Explore, open Suppliers.", "Sort the named suppliers into strategic / important / routine.", "Base it on spend, risk and single-source."] },
      { type: "exercise", title: "Spot the at-risk supplier", steps: ["Open Supplier performance in Explore.", "Pick the supplier whose numbers worry you most.", "Name the warning signs in its data."] },
      { type: "ai", title: "Assess supplier risk with an LLM", prompt: "You are a supply-chain risk analyst. Rank the top three highest-risk suppliers and the drivers: Helios (£42m, SE Asia, single source, uncapped liability); Sahara (£22m, N Africa, single source); Aurora (sensors, £28m, East Asia); Meridian (£88m, UK); Castore (£54m, UK/EU). Present a ranked table with one mitigation each." },
      { type: "challenge", title: "Supplier strategy", body: "Produce a one-page supplier strategy: segmentation, top three risks with mitigations, and how AI-enabled SRM would help. Capture new opportunities in your Backlog.", to: "backlog" },
    ],
  },
  {
    n: 3, title: "Contract & Risk", theme: "Lifecycle · Negotiation · Risk · CLM · Ethics",
    objectives: ["Apply AI across the contract lifecycle", "Prepare for negotiation", "Identify contract risk", "Understand CLM automation", "Apply ethics in contracting"],
    activities: [
      { type: "exercise", title: "Find the risky terms", steps: ["In Explore, open Contracts.", "Compare liability, exit, price and data across contracts.", "Rank the top three by risk and name the worst."] },
      { type: "ai", title: "Triage the portfolio with an LLM", prompt: "You are a contract manager. Identify which contracts need urgent attention and the next action for each: C-1001 Helios £42m auto-renews yearly (90-day notice), uncapped liability; C-1002 Meridian £88m ends 31 Dec 2026, index no cap; C-1044 Aurora £28m evergreen with expired term; C-1071 Verdant £35m 60-day rolling; C-2003 Sahara £22m rolling, single source. Present a table of Contract, Issue, Next action." },
      { type: "exercise", title: "Design the CLM flow", steps: ["Sketch five stages from request to monitoring.", "Note one thing AI does at each.", "Mark where Northwind loses most control today."] },
      { type: "challenge", title: "Contract risk triage", body: "Rank the contracts by risk and urgency; pick the two most urgent and define the action. Add any AI opportunities to your Backlog.", to: "backlog" },
    ],
  },
  {
    n: 4, title: "Supply-Chain Efficiency", theme: "Forecasting · Inventory · Automation · Logistics · Visibility",
    objectives: ["Forecast demand better", "Optimise inventory", "Automate high-value processes", "Apply AI to logistics", "Build real-time visibility"],
    activities: [
      { type: "exercise", title: "Where would accuracy pay off?", steps: ["In Explore, open Demand & inventory.", "Find the worst forecast accuracy.", "List two consequences and one extra signal AI could use."] },
      { type: "exercise", title: "Free the trapped cash", steps: ["Find where inventory looks high vs service.", "Identify the most likely dead cash.", "Suggest one AI-enabled change to release it."] },
      { type: "ai", title: "Find logistics gains with an LLM", prompt: "You are a logistics-optimisation expert. A manufacturer spends £120m on transport, 87% on-time, 6% failed deliveries, 72% fleet utilisation, manual regional routing. Suggest the highest-impact AI improvements, with the effect on cost, service and carbon, ranked by payback." },
      { type: "challenge", title: "Efficiency plan", body: "Propose AI actions across forecasting, inventory, automation and logistics, sequenced by payback and tied together by a control tower. Add the strongest to your Backlog.", to: "backlog" },
    ],
  },
  {
    n: 5, title: "Future & Strategy", theme: "Trends · Sustainability · Resilience · Roadmap · People",
    objectives: ["Anticipate emerging AI trends", "Apply AI to sustainability", "Build resilience", "Build your roadmap", "Lead the people change"],
    activities: [
      { type: "exercise", title: "Find the carbon hotspots", steps: ["In Explore, open Emissions.", "Explain why focusing on a few suppliers is fastest.", "Name two suppliers to engage first."] },
      { type: "exercise", title: "Stress-test Northwind", steps: ["Pick a single-source supplier (Helios or Sahara).", "Describe the impact if it fails suddenly.", "List three things AI early-warning could do."] },
      { type: "ai", title: "Sequence the roadmap with an LLM", prompt: "You are an AI strategy advisor. Given these initiatives with rough value/readiness — spend analytics (high/high), supplier risk (high/medium), contract review (high/medium), forecasting (high/medium), Scope 3 (medium/medium), agentic tail-spend (medium/low) — produce a phased roadmap (foundations, quick wins, scale, transform), and say what to start first and why." },
      { type: "challenge", title: "Build your strategy", body: "Open My Strategy: turn your Opportunity Backlog into a phased roadmap and a personal 90-day action plan, then export it.", to: "strategy" },
    ],
  },
];
const ALL_ACTIVITIES = DAYS.flatMap((d) => d.activities.map((_, i) => `d${d.n}-${i}`));

/* ---------------- small UI helpers ---------------- */
const riskColor = (r) => (r === "High" ? C.amber : r === "Medium" ? C.teal : r === "Low" ? C.mint : C.muted);

function Pill({ children, bg, fg }) {
  return (
    <span style={{ background: bg || C.cardl, color: fg || C.deep, fontSize: 12, fontWeight: 600,
      padding: "2px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>
  );
}
function Btn({ children, onClick, kind = "solid", small, style }) {
  const base = { fontFamily: sans, fontSize: small ? 13 : 14, fontWeight: 600, cursor: "pointer",
    borderRadius: 8, padding: small ? "6px 12px" : "9px 16px", border: "1px solid transparent",
    display: "inline-flex", alignItems: "center", gap: 6, transition: "all .15s" };
  const kinds = {
    solid: { background: C.teal, color: "#fff" },
    navy: { background: C.navy, color: "#fff" },
    ghost: { background: "transparent", color: C.teal, border: `1px solid ${C.line}` },
  };
  return <button onClick={onClick} style={{ ...base, ...kinds[kind], ...style }}>{children}</button>;
}
function Card({ children, style }) {
  return <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14,
    padding: 20, boxShadow: "0 1px 2px rgba(11,37,69,0.04)", ...style }}>{children}</div>;
}
function H({ children, size = 22, style }) {
  return <h2 style={{ fontFamily: serif, color: C.navy, fontSize: size, fontWeight: 700, margin: 0, ...style }}>{children}</h2>;
}

/* ---------------- generic table ---------------- */
function Table({ cols, rows, onRow }) {
  return (
    <div style={{ overflowX: "auto", border: `1px solid ${C.line}`, borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13.5, minWidth: 560 }}>
        <thead>
          <tr style={{ background: C.deep }}>
            {cols.map((c) => (
              <th key={c.key} style={{ textAlign: c.align || "left", color: "#fff", fontWeight: 600,
                padding: "10px 12px", whiteSpace: "nowrap" }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onClick={onRow ? () => onRow(r) : undefined}
              style={{ background: i % 2 ? C.light : "#fff", cursor: onRow ? "pointer" : "default" }}>
              {cols.map((c) => (
                <td key={c.key} style={{ padding: "9px 12px", color: C.body, textAlign: c.align || "left",
                  borderTop: `1px solid ${C.line}` }}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- copy-prompt block ---------------- */
function PromptBox({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch (e) {}
  };
  return (
    <div style={{ background: C.light, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.amber}`,
      borderRadius: 10, padding: 14, marginTop: 8 }}>
      <div style={{ fontFamily: "Consolas, monospace", fontSize: 13, color: C.ink, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{text}</div>
      <div style={{ marginTop: 10 }}>
        <Btn small kind="ghost" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy prompt"}
        </Btn>
      </div>
    </div>
  );
}

/* ================= EXPLORE ================= */
const EX_TABS = ["Profile", "Suppliers", "Performance", "Contracts", "Demand", "Logistics", "Emissions"];

function Explore() {
  const [tab, setTab] = useState("Suppliers");
  const [sel, setSel] = useState(null);
  const [sortSpend, setSortSpend] = useState(true);

  const supRows = useMemo(() => {
    const r = [...SUPPLIERS];
    r.sort((a, b) => (sortSpend ? b.spend - a.spend : a.name.localeCompare(b.name)));
    return r;
  }, [sortSpend]);

  const chartData = SUPPLIERS.filter((s) => !s.name.startsWith("Tail")).slice().sort((a, b) => b.spend - a.spend).map((s) => ({ name: s.name.split(" ")[0], spend: s.spend }));

  return (
    <div>
      <H size={26}>Explore the Northwind case</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>The live dossier behind every exercise. Click a supplier or contract for detail.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "18px 0" }}>
        {EX_TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setSel(null); }}
            style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 600, padding: "7px 14px", borderRadius: 999,
              cursor: "pointer", border: `1px solid ${tab === t ? C.teal : C.line}`,
              background: tab === t ? C.teal : "#fff", color: tab === t ? "#fff" : C.body }}>{t}</button>
        ))}
      </div>

      {tab === "Profile" && (
        <Card>
          <H size={18} style={{ marginBottom: 12 }}>Company profile</H>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
            {PROFILE.map(([k, v]) => (
              <div key={k} style={{ borderLeft: `3px solid ${C.teal}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 14.5, color: C.ink }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <H size={16} style={{ marginBottom: 8 }}>The board's mandate</H>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MANDATE.map(([g, col]) => <Pill key={g} bg={col} fg="#fff">{g}</Pill>)}
            </div>
          </div>
        </Card>
      )}

      {tab === "Suppliers" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <H size={16} style={{ marginBottom: 10 }}>Spend by supplier (£m/yr)</H>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11, fill: C.body }} />
                  <Tooltip />
                  <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={i < 3 ? C.navy : C.teal} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div style={{ marginBottom: 10 }}>
            <Btn small kind="ghost" onClick={() => setSortSpend((s) => !s)}>Sort by {sortSpend ? "name" : "spend"}</Btn>
          </div>
          <Table onRow={(r) => setSel({ kind: "supplier", data: r })}
            cols={[
              { key: "name", label: "Supplier", render: (r) => <strong style={{ color: C.navy }}>{r.name}</strong> },
              { key: "cat", label: "Category" },
              { key: "spend", label: "£m", align: "right" },
              { key: "region", label: "Region" },
              { key: "risk", label: "Risk", render: (r) => <Pill bg={riskColor(r.risk)} fg="#fff">{r.risk}</Pill> },
              { key: "single", label: "Single?", render: (r) => (r.single ? "Yes" : r.single === false ? "No" : "—") },
            ]}
            rows={supRows} />
        </div>
      )}

      {tab === "Performance" && (
        <div>
          <Table
            cols={[
              { key: "name", label: "Supplier", render: (r) => <strong style={{ color: C.navy }}>{r.name}</strong> },
              { key: "onTime", label: "On-time %" },
              { key: "defect", label: "Defect rate" },
              { key: "lead", label: "Lead-time trend" },
              { key: "resp", label: "Responsiveness" },
            ]}
            rows={Object.entries(PERFORMANCE).map(([name, p]) => ({ name, ...p }))} />
          <p style={{ color: C.muted, fontSize: 13, marginTop: 10, fontStyle: "italic" }}>
            Falling on-time, rising defects or lengthening lead times are early-warning signs. Aurora stands out.
          </p>
        </div>
      )}

      {tab === "Contracts" && (
        <div>
          <p style={{ color: C.muted, fontSize: 13.5, marginBottom: 10, fontStyle: "italic" }}>Each row shows the actual terms — compare across the columns to spot the risk yourself.</p>
          <Table onRow={(r) => setSel({ kind: "contract", data: r })}
            cols={[
              { key: "ref", label: "Ref", render: (r) => <strong style={{ color: C.navy }}>{r.ref}</strong> },
              { key: "supplier", label: "Supplier" },
              { key: "value", label: "£m", align: "right" },
              { key: "term", label: "Term & renewal" },
              { key: "liability", label: "Liability", render: (r) => <span style={{ color: r.liability === "Uncapped" || r.liability === "Not stated" ? C.amber : C.body, fontWeight: r.liability === "Uncapped" ? 700 : 400 }}>{r.liability}</span> },
              { key: "exit", label: "Exit / termination" },
              { key: "price", label: "Price basis" },
            ]}
            rows={CONTRACTS} />
        </div>
      )}

      {tab === "Demand" && (
        <Table
          cols={[
            { key: "cat", label: "Category", render: (r) => <strong style={{ color: C.navy }}>{r.cat}</strong> },
            { key: "method", label: "Method" },
            { key: "acc", label: "Accuracy" },
            { key: "inv", label: "Inv £m", align: "right" },
            { key: "svc", label: "Service" },
            { key: "issue", label: "Main issue" },
          ]}
          rows={DEMAND} />
      )}

      {tab === "Logistics" && (
        <Card>
          <H size={18} style={{ marginBottom: 12 }}>Logistics snapshot</H>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {LOGISTICS.map(([k, v]) => (
              <div key={k} style={{ borderLeft: `3px solid ${C.amber}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 14.5, color: C.ink }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Emissions" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          <Card>
            <H size={16} style={{ marginBottom: 8 }}>Footprint split</H>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={EMISSIONS_SPLIT} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {EMISSIONS_SPLIT.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              {EMISSIONS_SPLIT.map((e) => (
                <span key={e.name} style={{ fontSize: 12.5, color: C.body, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: e.fill, display: "inline-block" }} />{e.name} {e.value}%
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <H size={16} style={{ marginBottom: 10 }}>The detail</H>
            {EMISSIONS_NOTES.map(([k, v]) => (
              <div key={k} style={{ marginBottom: 12, borderLeft: `3px solid ${C.mint}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 14, color: C.ink }}>{v}</div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {sel && <DetailDrawer sel={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function DetailDrawer({ sel, onClose }) {
  const isSup = sel.kind === "supplier";
  const d = sel.data;
  const perf = isSup ? PERFORMANCE[d.name] : null;
  const contract = isSup ? CONTRACTS.find((c) => c.supplier === d.name) : null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,37,69,0.35)", zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px,100%)", height: "100%", background: "#fff", padding: 24, overflowY: "auto", boxShadow: "-8px 0 30px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <H size={20}>{isSup ? d.name : d.ref + " · " + d.supplier}</H>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted }}><X size={22} /></button>
        </div>
        {isSup ? (
          <div style={{ marginTop: 14 }}>
            <Row k="Category" v={d.cat} /><Row k="Annual spend" v={`£${d.spend}m`} />
            <Row k="Region" v={d.region} /><Row k="Risk" v={d.risk} />
            <Row k="Single source" v={d.single ? "Yes" : d.single === false ? "No" : "—"} />
            {perf && (<><div style={{ marginTop: 16 }}><H size={15}>Performance</H></div>
              <Row k="On-time" v={perf.onTime} /><Row k="Defect rate" v={perf.defect} />
              <Row k="Lead-time trend" v={perf.lead} /><Row k="Responsiveness" v={perf.resp} /></>)}
            {contract && (<><div style={{ marginTop: 16 }}><H size={15}>Contract {contract.ref}</H></div>
              <Row k="Liability" v={contract.liability} /><Row k="Exit" v={contract.exit} />
              <Row k="Price" v={contract.price} /></>)}
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <Row k="Supplier" v={d.supplier} /><Row k="Value" v={`£${d.value}m/yr`} />
            <Row k="Term & renewal" v={d.term} /><Row k="Liability" v={d.liability} />
            <Row k="Exit / termination" v={d.exit} /><Row k="Price basis" v={d.price} />
            <Row k="Data & other" v={d.other} />
          </div>
        )}
      </div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: C.muted, fontSize: 13 }}>{k}</span>
      <span style={{ color: C.ink, fontSize: 13.5, fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}

/* ================= MISSIONS ================= */
function Missions({ day, setDay, answers, setAnswers, done, setDone, go }) {
  const d = DAYS[day - 1];
  const dayDone = d.activities.filter((_, i) => done[`d${d.n}-${i}`]).length;
  return (
    <div>
      <H size={26}>Daily missions</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>Work through each day alongside the slides. Your answers save automatically.</p>

      <div style={{ display: "flex", gap: 8, margin: "18px 0", flexWrap: "wrap" }}>
        {DAYS.map((x) => {
          const cnt = x.activities.filter((_, i) => done[`d${x.n}-${i}`]).length;
          const full = cnt === x.activities.length;
          const active = x.n === day;
          return (
            <button key={x.n} onClick={() => setDay(x.n)}
              style={{ flex: "1 1 120px", textAlign: "left", cursor: "pointer", borderRadius: 12, padding: "12px 14px",
                border: `1px solid ${active ? C.teal : C.line}`, background: active ? C.navy : "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: active ? C.gold : C.muted }}>DAY {x.n}</div>
              <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: active ? "#fff" : C.navy, margin: "2px 0 6px" }}>{x.title}</div>
              <div style={{ fontSize: 11.5, color: active ? "#cdd9e6" : C.muted }}>{full ? "✓ complete" : `${cnt}/${x.activities.length} done`}</div>
            </button>
          );
        })}
      </div>

      <Card style={{ marginBottom: 16, background: C.navy, borderColor: C.navy }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.gold }}>DAY {d.n} · {dayDone}/{d.activities.length} ACTIVITIES</div>
        <H size={24} style={{ color: "#fff", margin: "4px 0" }}>{d.title}</H>
        <p style={{ color: "#cdd9e6", fontSize: 13.5, margin: "0 0 12px" }}>{d.theme}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {d.objectives.map((o, i) => (
            <span key={i} style={{ fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.12)", padding: "4px 10px", borderRadius: 999 }}>{o}</span>
          ))}
        </div>
      </Card>

      {d.activities.map((a, i) => {
        const id = `d${d.n}-${i}`;
        const isDone = !!done[id];
        const kindMeta = { exercise: { c: C.teal, t: "Exercise" }, ai: { c: C.amber, t: "AI practical" }, challenge: { c: C.navy, t: "Case challenge" } }[a.type];
        return (
          <Card key={id} style={{ marginBottom: 14, borderLeft: `4px solid ${kindMeta.c}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Pill bg={kindMeta.c} fg="#fff">{kindMeta.t}</Pill>
                <H size={17}>{a.title}</H>
              </div>
              <button onClick={() => setDone({ ...done, [id]: !isDone })}
                style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", border: `1px solid ${isDone ? C.mint : C.line}`,
                  background: isDone ? C.mint : "#fff", color: isDone ? "#fff" : C.muted, borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 600 }}>
                <Check size={14} />{isDone ? "Done" : "Mark done"}
              </button>
            </div>

            {a.steps && (
              <ol style={{ margin: "12px 0 0", paddingLeft: 20, color: C.body, fontSize: 14, lineHeight: 1.6 }}>
                {a.steps.map((s, j) => <li key={j} style={{ marginBottom: 3 }}>{s}</li>)}
              </ol>
            )}
            {a.body && <p style={{ color: C.body, fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>{a.body}</p>}
            {a.prompt && (<><PromptBox text={a.prompt} />
              <p style={{ color: C.muted, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>Northwind is fictional — safe to use in any AI tool. Never paste real, confidential data.</p></>)}
            {a.to && <div style={{ marginTop: 12 }}><Btn small kind="ghost" onClick={() => go(a.to)}>Go to {a.to === "backlog" ? "Opportunity Backlog" : "My Strategy"} <ChevronRight size={14} /></Btn></div>}

            <textarea value={answers[id] || ""} onChange={(e) => setAnswers({ ...answers, [id]: e.target.value })}
              placeholder="Your notes and answer…"
              style={{ width: "100%", marginTop: 12, minHeight: 70, resize: "vertical", boxSizing: "border-box",
                fontFamily: sans, fontSize: 14, color: C.ink, padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, background: C.light }} />
          </Card>
        );
      })}
    </div>
  );
}

/* ================= BACKLOG ================= */
function Backlog({ backlog, setBacklog }) {
  const blank = { title: "", desc: "", goal: GOALS[0], type: "Augment", value: "High", readiness: "High" };
  const [form, setForm] = useState(blank);
  const add = () => {
    if (!form.title.trim()) return;
    setBacklog([...backlog, { ...form, id: Date.now() }]);
    setForm(blank);
  };
  const remove = (id) => setBacklog(backlog.filter((b) => b.id !== id));
  const set = (k, v) => setForm({ ...form, [k]: v });
  const selStyle = { fontFamily: sans, fontSize: 13.5, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.line}`, color: C.ink, background: "#fff" };

  return (
    <div>
      <H size={26}>Opportunity backlog</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>Capture every AI opportunity you spot this week. It builds into your Day 5 strategy.</p>

      <Card style={{ margin: "18px 0" }}>
        <H size={16} style={{ marginBottom: 12 }}>Add an opportunity</H>
        <div style={{ display: "grid", gap: 10 }}>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Title (e.g. AI spend analytics)"
            style={{ ...selStyle, width: "100%", boxSizing: "border-box" }} />
          <input value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="One-line description (optional)"
            style={{ ...selStyle, width: "100%", boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <label style={{ fontSize: 12, color: C.muted }}>Goal<br />
              <select value={form.goal} onChange={(e) => set("goal", e.target.value)} style={selStyle}>{GOALS.map((g) => <option key={g}>{g}</option>)}</select></label>
            <label style={{ fontSize: 12, color: C.muted }}>Type<br />
              <select value={form.type} onChange={(e) => set("type", e.target.value)} style={selStyle}><option>Augment</option><option>Automate</option></select></label>
            <label style={{ fontSize: 12, color: C.muted }}>Value<br />
              <select value={form.value} onChange={(e) => set("value", e.target.value)} style={selStyle}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
            <label style={{ fontSize: 12, color: C.muted }}>Readiness<br />
              <select value={form.readiness} onChange={(e) => set("readiness", e.target.value)} style={selStyle}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
          </div>
          <div><Btn onClick={add}><Plus size={16} />Add to backlog</Btn></div>
        </div>
      </Card>

      <H size={16} style={{ margin: "8px 0 10px" }}>Your opportunities ({backlog.length})</H>
      {backlog.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>Nothing yet. Add your first opportunity above — or jump in from a Day 1 mission.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
        {backlog.map((b) => (
          <Card key={b.id} style={{ padding: 14, borderTop: `4px solid ${GOAL_COLOR[b.goal] || C.teal}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong style={{ color: C.navy, fontSize: 14.5 }}>{b.title}</strong>
              <button onClick={() => remove(b.id)} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted }}><X size={16} /></button>
            </div>
            {b.desc && <p style={{ color: C.body, fontSize: 13, margin: "6px 0 10px" }}>{b.desc}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              <Pill bg={GOAL_COLOR[b.goal]} fg="#fff">{b.goal}</Pill>
              <Pill>{b.type}</Pill>
              <Pill bg={C.light}>Value: {b.value}</Pill>
              <Pill bg={C.light}>Ready: {b.readiness}</Pill>
            </div>
          </Card>
        ))}
      </div>

      {backlog.length > 0 && <Matrix backlog={backlog} />}
    </div>
  );
}

function Matrix({ backlog }) {
  const cell = (val, rd) => backlog.filter((b) => b.value === val && b.readiness === rd);
  return (
    <div style={{ marginTop: 26 }}>
      <H size={18} style={{ marginBottom: 4 }}>Value × readiness</H>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>Top-right (high value, high readiness) are your quick wins.</p>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px repeat(3,minmax(120px,1fr))", gap: 6, minWidth: 520 }}>
          <div />
          {LEVELS.slice().reverse().map((rd) => <div key={rd} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: C.muted }}>Ready: {rd}</div>)}
          {LEVELS.map((val) => (
            <React.Fragment key={val}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "flex", alignItems: "center" }}>Value: {val}</div>
              {LEVELS.slice().reverse().map((rd) => {
                const items = cell(val, rd);
                const quick = val === "High" && rd === "High";
                return (
                  <div key={rd} style={{ minHeight: 70, borderRadius: 10, padding: 8,
                    background: quick ? "#E7F4F1" : C.light, border: `1px solid ${quick ? C.mint : C.line}` }}>
                    {items.map((it) => (
                      <div key={it.id} style={{ fontSize: 11.5, background: "#fff", borderLeft: `3px solid ${GOAL_COLOR[it.goal]}`,
                        borderRadius: 5, padding: "4px 7px", marginBottom: 5, color: C.ink }}>{it.title}</div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= STRATEGY ================= */
function Strategy({ backlog, plan, setPlan, name }) {
  const phase = (b) => {
    if (b.value === "High" && b.readiness === "High") return "Quick wins";
    if (b.value === "High" && b.readiness === "Low") return "Strategic bets";
    if (b.readiness === "Low") return "Foundations";
    return "Scale";
  };
  const phases = ["Quick wins", "Scale", "Strategic bets", "Foundations"];
  const grouped = phases.map((p) => ({ p, items: backlog.filter((b) => phase(b) === p) }));
  const phaseColor = { "Quick wins": C.mint, "Scale": C.teal, "Strategic bets": C.amber, "Foundations": C.deep };

  return (
    <div>
      <H size={26}>My strategy</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>Your week, assembled. This turns your backlog into a phased roadmap and a personal plan.</p>

      {backlog.length === 0 ? (
        <Card style={{ marginTop: 18 }}><p style={{ color: C.muted, fontSize: 14, margin: 0 }}>Add opportunities to your Backlog first — they'll flow into your roadmap here.</p></Card>
      ) : (
        <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
          {grouped.map(({ p, items }) => (
            <Card key={p} style={{ borderLeft: `4px solid ${phaseColor[p]}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: items.length ? 10 : 0 }}>
                <H size={18}>{p}</H><Pill bg={phaseColor[p]} fg="#fff">{items.length}</Pill>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {items.map((it) => (
                  <span key={it.id} style={{ fontSize: 13, color: C.ink, background: C.light, border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 10px" }}>
                    {it.title} <span style={{ color: C.muted, fontSize: 11 }}>· {it.goal}</span>
                  </span>
                ))}
                {items.length === 0 && <span style={{ color: C.muted, fontSize: 13 }}>—</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card style={{ marginTop: 16 }}>
        <H size={18} style={{ marginBottom: 4 }}>My 90-day action plan</H>
        <p style={{ color: C.muted, fontSize: 13.5, marginBottom: 10 }}>One concrete action beats a long wish-list. What will you actually start, and by when?</p>
        <textarea value={plan} onChange={(e) => setPlan(e.target.value)} placeholder={"My top goal…\nThe quick win I'll start first…\nThe foundation I must fix…\nMy first action this month, and the date…"}
          style={{ width: "100%", boxSizing: "border-box", minHeight: 150, resize: "vertical", fontFamily: sans, fontSize: 14, color: C.ink, padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, background: C.light }} />
        <div style={{ marginTop: 12 }}><Btn kind="navy" onClick={() => window.print()}><Rocket size={15} />Export / print my strategy</Btn></div>
      </Card>
    </div>
  );
}

/* ================= HOME ================= */
function Home({ go, weekPct, backlogCount, name, setName }) {
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.deep})`, borderRadius: 18, padding: "32px 30px", color: "#fff" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: C.gold }}>AI FOUNDATIONS IN PROCUREMENT & SUPPLY CHAIN</div>
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, margin: "10px 0 8px", lineHeight: 1.15 }}>The Northwind Transformation Cockpit</h1>
        <p style={{ color: "#cdd9e6", fontSize: 15, maxWidth: 620, margin: 0 }}>You advise Northwind's CPO. Across the week you'll explore the case, complete daily missions, and build your own AI strategy — assembled here, ready to take back to work.</p>
        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn kind="solid" onClick={() => go("missions")} style={{ background: C.amber }}>Start today's missions <ChevronRight size={15} /></Btn>
          <Btn kind="ghost" onClick={() => go("explore")} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>Explore the case</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 18 }}>
        <Card>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>WEEK PROGRESS</div>
          <div style={{ fontFamily: serif, fontSize: 32, color: C.navy, fontWeight: 700 }}>{weekPct}%</div>
          <div style={{ height: 8, background: C.line, borderRadius: 99, marginTop: 6 }}>
            <div style={{ width: `${weekPct}%`, height: "100%", background: C.teal, borderRadius: 99 }} />
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>OPPORTUNITIES CAPTURED</div>
          <div style={{ fontFamily: serif, fontSize: 32, color: C.navy, fontWeight: 700 }}>{backlogCount}</div>
          <div style={{ fontSize: 12.5, color: C.muted }}>building toward your strategy</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>YOUR NAME (for your export)</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add your name"
            style={{ width: "100%", boxSizing: "border-box", marginTop: 8, fontFamily: sans, fontSize: 14, padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink }} />
        </Card>
      </div>

      <Card style={{ marginTop: 14, background: C.light }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={18} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 13.5, color: C.body }}><strong style={{ color: C.navy }}>Data-safe by design.</strong> Everything here is the fictional Northwind case, so it's safe to use in any AI tool. Back at work, never paste real confidential data into public AI — use only approved tools.</p>
        </div>
      </Card>
    </div>
  );
}

/* ================= APP SHELL ================= */
const NAV = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "missions", label: "Missions", icon: ListChecks },
  { id: "backlog", label: "Backlog", icon: LayoutGrid },
  { id: "strategy", label: "My Strategy", icon: Rocket },
];
const KEY = "cockpit:v1";

export default function App() {
  const [view, setView] = useState("home");
  const [day, setDay] = useState(1);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState({});
  const [backlog, setBacklog] = useState([]);
  const [plan, setPlan] = useState("");
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await store.get(KEY);
        if (alive && r && r.value) {
          const d = JSON.parse(r.value);
          setAnswers(d.answers || {}); setDone(d.done || {});
          setBacklog(d.backlog || []); setPlan(d.plan || ""); setName(d.name || "");
        }
      } catch (e) { /* no saved state yet */ }
      if (alive) setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await store.set(KEY, JSON.stringify({ answers, done, backlog, plan, name }));
      } catch (e) {}
    })();
  }, [answers, done, backlog, plan, name, loaded]);

  const doneCount = ALL_ACTIVITIES.filter((id) => done[id]).length;
  const weekPct = Math.round((doneCount / ALL_ACTIVITIES.length) * 100);

  return (
    <div style={{ fontFamily: sans, background: C.light, minHeight: "100vh", color: C.body, display: "flex" }}>
      {/* rail */}
      <nav style={{ width: 210, background: "#fff", borderRight: `1px solid ${C.line}`, padding: "20px 14px", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px 18px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={17} color={C.gold} />
          </div>
          <div style={{ fontFamily: serif, fontWeight: 700, color: C.navy, fontSize: 15, lineHeight: 1 }}>Northwind<br /><span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>Cockpit</span></div>
        </div>
        {NAV.map((n) => {
          const Icon = n.icon; const active = view === n.id;
          return (
            <button key={n.id} onClick={() => setView(n.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4,
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", fontFamily: sans, fontSize: 14, fontWeight: 600,
                background: active ? C.cardl : "transparent", color: active ? C.navy : C.muted }}>
              <Icon size={17} color={active ? C.teal : C.muted} />{n.label}
            </button>
          );
        })}
        <div style={{ marginTop: 18, padding: "0 8px" }}>
          <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700, letterSpacing: 0.5 }}>WEEK PROGRESS</div>
          <div style={{ height: 6, background: C.line, borderRadius: 99, marginTop: 6 }}>
            <div style={{ width: `${weekPct}%`, height: "100%", background: C.teal, borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>{doneCount} of {ALL_ACTIVITIES.length} done</div>
        </div>
      </nav>

      {/* main */}
      <main style={{ flex: 1, padding: "28px clamp(16px, 4vw, 44px)", maxWidth: 1080, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {view === "home" && <Home go={setView} weekPct={weekPct} backlogCount={backlog.length} name={name} setName={setName} />}
        {view === "explore" && <Explore />}
        {view === "missions" && <Missions day={day} setDay={setDay} answers={answers} setAnswers={setAnswers} done={done} setDone={setDone} go={setView} />}
        {view === "backlog" && <Backlog backlog={backlog} setBacklog={setBacklog} />}
        {view === "strategy" && <Strategy backlog={backlog} plan={plan} setPlan={setPlan} name={name} />}
      </main>
    </div>
  );
}
