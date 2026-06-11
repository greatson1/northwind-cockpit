import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import {
  Compass, ListChecks, LayoutGrid, Rocket, Home as HomeIcon, Copy, Check, Plus, X,
  AlertTriangle, ChevronRight, ChevronDown, Building2, Sparkles, CheckCircle2, Circle, Wand2,
  Users, UserPlus, LogOut, Shield, RefreshCw,
} from "lucide-react";

/* ---------------- palette & type ---------------- */
const C = {
  navy: "#0B2545", deep: "#13315C", teal: "#1C7293", mint: "#5BC0BE", amber: "#EE964B",
  gold: "#F4A259", light: "#F4F7FA", ink: "#16202B", body: "#33424F", muted: "#6B7C8C",
  line: "#E2E9F0", cardl: "#EAF1F6", green: "#1F8A78", greenl: "#E7F4F1", red: "#C2542F",
  redl: "#FBEDE6", white: "#FFFFFF",
};
const serif = "Georgia, 'Times New Roman', serif";
const sans = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SAFE_NOTE = "Northwind is fictional — safe to use in any AI tool. Never paste real, confidential data.";

/* ---------------- Northwind data ---------------- */
const PROFILE = [
  ["Revenue", "£1.8bn / year"], ["Footprint", "14 countries · 6 plants · 9 DCs"],
  ["Systems", "4 separate ERPs — no single view"], ["Suppliers", "~3,200 active"],
  ["Contracts", "~5,000 active"], ["Invoices", "~200,000 / year, mostly manual"],
  ["Procurement team", "95 people"], ["Spend concentration", "Top 50 ≈ 60% of spend"],
  ["Addressable spend", "~£1.1bn"], ["Scope 3 target", "−50% by 2030"],
];
const MANDATE = [["Release value", C.teal], ["Build resilience", C.amber], ["Deliver sustainability", C.mint], ["Transform the function", C.deep]];
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
  ["Annual transport spend", "£120m"], ["Mode split", "Road 60% · Sea 30% · Air 7% · Rail 3%"],
  ["On-time delivery", "87%"], ["Failed-delivery rate", "6%"], ["Fleet utilisation", "72%"],
  ["Planning", "Manual regional routing; default carriers"],
];
const EMISSIONS_SPLIT = [{ name: "Scope 3", value: 84, fill: C.navy }, { name: "Scope 2", value: 9, fill: C.teal }, { name: "Scope 1", value: 7, fill: C.mint }];
const EMISSIONS_NOTES = [
  ["Within Scope 3", "Purchased goods 52% · Transport 18% · Other 14%"],
  ["Concentration", "~15% of suppliers ≈ 60% of supply-chain emissions"],
  ["Data quality", "Spend-based estimate only — low confidence"], ["Target", "−50% Scope 3 by 2030"],
];
const GOALS = ["Release value", "Build resilience", "Deliver sustainability", "Transform the function"];
const GOAL_COLOR = { "Release value": C.teal, "Build resilience": C.amber, "Deliver sustainability": C.mint, "Transform the function": C.deep };
const LEVELS = ["High", "Medium", "Low"];

const PROMPT_LIB = [
  { h: "Analyse & prioritise", p: "You are a procurement analyst. Here is a list of [items] with [data]. Identify the top five that [criterion], explain each in one sentence, and present as a ranked table." },
  { h: "Summarise a document", p: "You are a contract specialist. Summarise the key commercial terms of the text below in plain English: value, duration, renewal, liability, termination. Flag anything risky. Text: [paste anonymised text]." },
  { h: "Draft a message", p: "You are a category manager. Draft a short, professional [email/message] to [who] that [goal]. Under 120 words, two tones." },
  { h: "Stress-test my thinking", p: "You are a critical but constructive reviewer. Here is my plan: [plan]. What are the three biggest weaknesses, what have I assumed that might be wrong, and what would you do differently?" },
];

/* ================= MISSION CONTENT ================= */
const DAYS = [
  {
    n: 1, title: "AI Foundations", theme: "Overview · Strategy · Ethics · Alignment · Relationships",
    objectives: ["Explain what AI is and where it fits", "Describe AI's strategic role", "Apply responsible-AI principles", "Align AI to goals", "See how AI reshapes relationships"],
    activities: [
      { id: "1.1e", sub: "1.1", type: "classify", title: "Automate, augment or keep human?",
        brief: "Sort these procurement tasks by how AI should help. Automate = routine & rules-based; Augment = AI assists a person; Keep human = needs judgement.",
        buckets: ["Automate", "Augment", "Keep human"],
        items: ["Invoice matching", "Spend classification", "Chasing PO status", "Supplier risk monitoring", "Supplier selection", "Contract negotiation"],
        correct: { "Invoice matching": "Automate", "Spend classification": "Automate", "Chasing PO status": "Automate", "Supplier risk monitoring": "Augment", "Supplier selection": "Keep human", "Contract negotiation": "Keep human" },
        model: ["High-volume, rules-based work automates; risk/insight work augments a person; selection and negotiation stay human.", "Start AI where volume is high and judgement is low."] },
      { id: "1.1a", sub: "1.1", type: "ai", title: "Generate a use-case list with an LLM",
        objective: "Get the AI to find and sort AI use cases for the team.",
        prompt: "You are a procurement transformation advisor. A £1.8bn building-systems manufacturer has a 95-person procurement team using four ERPs and mostly manual processes. List ten realistic ways AI could help. For each, give a one-line description and label it automate or augment. Present as a table.",
        good: ["Ten realistic, procurement-specific use cases", "Each labelled automate or augment sensibly", "Notes that most depend on clean, connected data"],
        evaluate: "Did it find use cases you missed? Ask it: which three would you start with, and why?" },
      { id: "1.2e", sub: "1.2", type: "reflect", title: "From task to strategy",
        brief: "Move from 'AI does the task faster' to 'AI changes the decision.'",
        questions: ["Pick three things procurement is measured on (e.g. savings, risk, performance).", "For each, how could AI improve the outcome — not just speed up the task?", "What would the freed time be spent on?"],
        model: ["Savings → AI surfaces leakage; risk → predictive early warning; performance → predict issues early.", "Freed time goes to strategy, supplier development and complex negotiation."] },
      { id: "1.2a", sub: "1.2", type: "ai", title: "Reframe a routine activity",
        objective: "Turn a backward-looking report into a strategic capability.",
        prompt: "You are a CPO coaching your team. Take the routine task of running spend reports each month. Explain how AI could turn this from a backward-looking report into a strategic capability that drives decisions. Give three concrete decisions it could inform, in plain English.",
        good: ["Moves from 'faster reports' to decisions", "Three concrete, business-relevant decisions", "Plain English, no jargon"],
        evaluate: "If it stays at task level, reply: what strategic question does each example answer?" },
      { id: "1.3e", sub: "1.3", type: "spot", title: "The fairness check",
        brief: "Northwind wants AI to auto-score and shortlist suppliers. Which of these are real risks? Select all that apply.",
        options: ["Biased data favours incumbents", "A black box with no explanation", "No appeal or human review", "It is always cheaper", "Supplier data could be exposed"],
        correct: ["Biased data favours incumbents", "A black box with no explanation", "No appeal or human review", "Supplier data could be exposed"],
        model: ["Real risks: bias, opacity, no human review, data security.", "Safeguards: explainable scores, human sign-off, a right to question, secure data."] },
      { id: "1.3a", sub: "1.3", type: "ai", title: "Pressure-test the ethics",
        objective: "Surface the ethical risks and safeguards of an AI use case.",
        prompt: "You are an AI ethics reviewer. A manufacturer wants to use AI to automatically score and rank suppliers for selection. List the main ethical and fairness risks, and for each give a practical safeguard. Present as a table of Risk and Safeguard.",
        good: ["Covers bias, transparency, accountability, security", "A practical safeguard for each", "Stresses a human owns the decision"],
        evaluate: "Ask: which one safeguard is most important to put in first, and why?" },
      { id: "1.4e", sub: "1.4", type: "classify", title: "Goal-link the ideas",
        brief: "Tie each AI idea to the board goal it most serves. (If you can't link it to a goal, it doesn't belong on the roadmap.)",
        buckets: GOALS,
        items: ["Spend analytics", "Supplier-risk early warning", "Scope 3 measurement", "Tail-spend automation"],
        correct: { "Spend analytics": "Release value", "Supplier-risk early warning": "Build resilience", "Scope 3 measurement": "Deliver sustainability", "Tail-spend automation": "Transform the function" },
        model: ["Spend analytics → value; risk early-warning → resilience; Scope 3 → sustainability; automation → transform."] },
      { id: "1.4a", sub: "1.4", type: "ai", title: "Map initiatives to goals",
        objective: "Tie AI initiatives to strategic goals with a measure.",
        prompt: "You are a strategy advisor. Here are four goals for a manufacturer's procurement team: release value, build resilience, deliver sustainability, transform the team. Suggest one strong AI initiative for each goal and explain in one sentence how it advances that goal. Present as a table of Goal, Initiative, How it helps.",
        good: ["Each initiative clearly tied to its goal", "Not generic", "Adds how to measure the impact"],
        evaluate: "Challenge it: how would we measure whether the first one released value?" },
      { id: "1.5e", sub: "1.5", type: "reflect", title: "Two points of view",
        brief: "AI changes the relationship on both sides.",
        questions: ["How does AI help the buyer? (two benefits)", "How might it concern the supplier? (one concern)", "One principle that keeps it fair as AI is introduced."],
        model: ["Buyer: better information, faster handling, more leverage.", "Supplier concern: opaque scoring / unfair treatment.", "Shared principle: transparency."] },
      { id: "1.5a", sub: "1.5", type: "ai", title: "See both sides",
        objective: "Represent the supplier's view, not just the buyer's.",
        prompt: "You are a relationship-management expert. A large manufacturer is introducing AI into how it manages suppliers (scoring, monitoring, automated communications). Describe how this looks from the buyer's side and the supplier's side, listing benefits and concerns for each. End with two principles that keep the relationship fair and trusting.",
        good: ["Genuinely represents the supplier's view", "Benefits and concerns for both sides", "Ends with fairness/trust principles"],
        evaluate: "Ask: what would make a supplier trust, rather than fear, this change?" },
      { id: "1lab", sub: "Lab", type: "lab", title: "Prompt Lab — practise the skills",
        chain: { lead: "Take the use-case table the AI gave you in 1.1 and push it forward.", prompt: "Here is a list of AI use cases for a procurement team: [paste the table from 1.1]. Pick the three with the best balance of value and ease, and for each draft a two-sentence pitch to the CPO explaining the benefit." },
        writeOwn: { task: "Build your own prompt to explain 'machine learning vs generative AI' to a non-technical buyer.", role: "a procurement trainer", context: "Your audience is a non-technical buyer.", task2: "Explain the difference between machine learning and generative AI.", format: "Under 120 words, one example of each." },
        stretch: "Ask the LLM to argue the opposite: make the strongest case NOT to rush into AI. The best point is the top of your risk list." },
      { id: "1case", sub: "Case", type: "case", title: "Northwind case — AI Opportunity Map",
        scenario: "The board asks procurement to show where AI could help. You advise the team, with the full dossier in Explore.",
        tasks: ["Brainstorm 8–10 AI opportunities across suppliers, contracts, supply chain and sustainability.", "For each, note the goal it serves, automate vs augment, and rough value.", "Pick the three to start with.", "Capture two safeguards that apply across all."],
        deliverable: "A one-page opportunity map. Add your best opportunities to the Backlog — it builds all week.", to: "backlog" },
    ],
  },
  {
    n: 2, title: "Supplier Management", theme: "SRM · Performance · Risk · Collaboration · Trust",
    objectives: ["Segment relationships", "Predict performance from data", "Identify & monitor risk", "Collaborate with AI", "Build trust & transparency"],
    activities: [
      { id: "2.1e", sub: "2.1", type: "classify", title: "Segment the base",
        brief: "Sort suppliers by how much management attention they need. (Tip: high spend OR high risk/single-source usually means strategic.)",
        buckets: ["Strategic", "Important", "Routine"],
        items: ["Helios Components", "Meridian Steel", "Castore Logistics", "Sahara Cables", "Summit Software", "Tail (~3,000)"],
        correct: { "Helios Components": "Strategic", "Meridian Steel": "Strategic", "Castore Logistics": "Strategic", "Sahara Cables": "Strategic", "Summit Software": "Routine", "Tail (~3,000)": "Routine" },
        model: ["Strategic: Helios, Meridian, Castore, Sahara (high spend or single-source risk).", "Routine: the tail and Summit. Don't segment on spend alone."] },
      { id: "2.1a", sub: "2.1", type: "ai", title: "Build a segmentation",
        objective: "Get a defensible supplier segmentation.",
        prompt: "You are a supplier-management expert. Segment these suppliers into Strategic, Important, Routine, based on spend, risk and single-source status: Helios (£42m, high, single source); Meridian (£88m, medium); Castore (£54m, medium); Verdant (£35m, medium); Aurora (£28m, high); Sahara (£22m, high, single source); tail (~3,000, £410m). Give a table with a one-line reason and management approach for each.",
        good: ["Three tiers with reasons", "Elevates single-source high-risk suppliers", "A management approach per tier"],
        evaluate: "Push back: should single-source high-risk suppliers be strategic even on modest spend?" },
      { id: "2.2e", sub: "2.2", type: "spot", title: "Spot the at-risk supplier", single: true,
        brief: "Based on the data below, which supplier is most at risk? Select one.",
        showPerf: true,
        options: ["Helios Components", "Meridian Steel", "Castore Logistics", "Aurora Electronics", "Sahara Cables"],
        correct: ["Aurora Electronics"],
        model: ["Aurora: lowest on-time (82%), highest defects (3.1%), volatile lead time.", "Extra signals AI could add: financial health, adverse news, capacity."] },
      { id: "2.2a", sub: "2.2", type: "ai", title: "Design an early-warning approach",
        objective: "Read the data and design early warnings.",
        prompt: "You are a supplier-performance analyst. Here is 12-month data: Helios 91% on-time, 1.8% defects, lengthening lead time; Meridian 96%, 0.4%, stable; Castore 88%, worsening; Aurora 82%, 3.1%, volatile; Sahara 90%, 1.2%, lengthening. Identify the most at-risk supplier and why, the extra signals AI could add, and three early-warning indicators that should trigger a human review.",
        good: ["Correctly flags Aurora", "Adds external/financial signals", "Three clear early-warning indicators"],
        evaluate: "Ask: what plain-English alert should we send a category manager when risk rises?" },
      { id: "2.3e", sub: "2.3", type: "spot", title: "Find the risk hotspots",
        brief: "Which two suppliers would you worry about most? (Think single-source + region + spend.) Select two.",
        options: ["Helios Components", "Meridian Steel", "Sahara Cables", "Brunel Castings", "Nordic Glass"],
        correct: ["Helios Components", "Sahara Cables"],
        model: ["Helios (single-source, SE Asia, uncapped liability) and Sahara (single-source, N. Africa).", "Mitigations: qualify a second source, targeted buffer, cap liability."] },
      { id: "2.3a", sub: "2.3", type: "ai", title: "Assess and prioritise risk",
        objective: "Rank supplier risk with drivers and mitigations.",
        prompt: "You are a supply-chain risk analyst. Rank the top three highest-risk suppliers and the drivers: Helios (£42m, SE Asia, single source, uncapped liability); Sahara (£22m, N Africa, single source); Aurora (£28m, East Asia); Meridian (£88m, UK); Castore (£54m, UK/EU). Present a ranked table with one mitigation each.",
        good: ["Ranks by risk, not spend", "Names the drivers", "One mitigation each"],
        evaluate: "Follow up: what sub-tier risks might we still be blind to?" },
      { id: "2.4e", sub: "2.4", type: "reflect", title: "A collaboration play",
        brief: "Good collaboration is reciprocal.",
        questions: ["Choose one strategic supplier.", "Two things Northwind could share (e.g. a cleaner forecast).", "Two things they could share back (e.g. capacity, lead times).", "The benefit to each side."],
        model: ["Northwind shares forecast + plan; supplier shares capacity + lead-time + risk.", "Both plan better; agree confidentiality and data use up front."] },
      { id: "2.4a", sub: "2.4", type: "ai", title: "Design a collaboration initiative",
        objective: "Make the value genuinely two-sided.",
        prompt: "You are a collaboration specialist. Propose a practical data-sharing initiative between a manufacturer and a key supplier that helps both plan better. Describe what each side shares, the benefit to each, and two things to agree up front (e.g. confidentiality, data use). Keep it concrete.",
        good: ["Two-sided value", "Explicit up-front agreements", "Concrete, not vague"],
        evaluate: "Ask: what would make the supplier confident enough to share their data?" },
      { id: "2.5e", sub: "2.5", type: "reflect", title: "The transparency line",
        brief: "Be honest without oversharing method.",
        questions: ["Three places Northwind might use AI on suppliers.", "For each: what to tell suppliers vs keep internal.", "One sentence to explain its AI use to a supplier."],
        model: ["Tell suppliers AI assists performance/risk with human oversight; keep method internal.", "Example: 'We use AI to help assess performance and risk; people review the results and decide.'"] },
      { id: "2.5a", sub: "2.5", type: "ai", title: "Draft a transparent statement",
        objective: "Build trust, not suspicion.",
        prompt: "You are a procurement communications advisor. Draft a short, plain-English statement a manufacturer could share with suppliers explaining that it uses AI to help assess performance and risk, reassuring them about fairness, human oversight and data handling. Under 120 words, not defensive.",
        good: ["Warm and non-defensive", "Mentions human oversight, fairness, data", "Under 120 words"],
        evaluate: "Ask for a warmer, more partnership-focused version, then choose." },
      { id: "2lab", sub: "Lab", type: "lab", title: "Prompt Lab — practise the skills",
        chain: { lead: "Take the segmentation from 2.1 and push it further.", prompt: "Here is my supplier segmentation: [paste]. For the Strategic tier only, draft a 90-day relationship plan for each supplier in five bullets." },
        writeOwn: { task: "Build a prompt to design a supplier scorecard with the five metrics that matter.", role: "a supplier-performance analyst", context: "For a key supplier and what you buy from them.", task2: "Design a one-page scorecard.", format: "A table of metric, why it matters, how measured." },
        stretch: "Feed the risk ranking from 2.3 back and ask: what tier-2 (sub-tier) risks might I still be blind to?" },
      { id: "2case", sub: "Case", type: "case", title: "Northwind case — Supplier Strategy & Risk",
        scenario: "After a near-miss with a single-source supplier, the CPO asks for a supplier review and how AI-enabled SRM would help.",
        tasks: ["Segment the named suppliers.", "Identify the top three risks and their drivers.", "Show how AI improves performance and collaboration for the strategic tier.", "Recommend one transparency principle."],
        deliverable: "A one-page supplier strategy. Add the strongest AI ideas to your Backlog.", to: "backlog" },
    ],
  },
  {
    n: 3, title: "Contract & Risk", theme: "Lifecycle · Negotiation · Risk · CLM · Ethics",
    objectives: ["Apply AI across the lifecycle", "Prepare to negotiate", "Identify contract risk", "Understand CLM automation", "Apply ethics in contracting"],
    activities: [
      { id: "3.1e", sub: "3.1", type: "spot", title: "Where is value leaking?",
        brief: "Which contracts have drifted into auto-renew, rolling or evergreen status (so nobody is actively managing them)? Select all.",
        showContracts: true,
        options: ["C-1001 Helios (auto-renews)", "C-1002 Meridian (ends 2026)", "C-1044 Aurora (evergreen)", "C-1071 Verdant (rolling)", "C-2003 Sahara (rolling)"],
        correct: ["C-1001 Helios (auto-renews)", "C-1044 Aurora (evergreen)", "C-1071 Verdant (rolling)", "C-2003 Sahara (rolling)"],
        model: ["Aurora's terms have lapsed entirely; Helios silently re-locks each year (mind the 90-day notice).", "Fixed-end contracts like Meridian are at least being tracked to a date."] },
      { id: "3.1a", sub: "3.1", type: "ai", title: "Triage the portfolio",
        objective: "Find the contracts needing urgent action.",
        prompt: "You are a contract manager. Identify which contracts need urgent attention and the next action for each: C-1001 Helios £42m auto-renews yearly (90-day notice), uncapped liability; C-1002 Meridian £88m ends 31 Dec 2026, index no cap; C-1044 Aurora £28m evergreen, expired term; C-1071 Verdant £35m 60-day rolling; C-2003 Sahara £22m rolling, single source. Present a table of Contract, Issue, Next action.",
        good: ["Flags the Helios notice deadline", "Flags Aurora's lapsed terms", "A clear next action each"],
        evaluate: "Ask: which one is most time-critical and why?" },
      { id: "3.2e", sub: "3.2", type: "reflect", title: "Prepare to negotiate",
        brief: "Meridian Steel: £88m, ends 2026, price index with no cap.",
        questions: ["Three pieces of evidence you'd want before renegotiating.", "Your top objective (e.g. cap the index).", "Your walk-away point."],
        model: ["Evidence: steel benchmarks/index data, our volumes, alternatives, our leverage.", "Objective: cap the index. Walk-away: capped escalation or re-tender."] },
      { id: "3.2a", sub: "3.2", type: "ai", title: "Build a negotiation brief",
        objective: "Prepare to renegotiate a specific contract.",
        prompt: "You are a negotiation coach. Help me prepare to renegotiate an £88m/year structural-steel contract that ends 2026 with an uncapped price index. Give me objectives, evidence to gather, three concessions I might trade, and two likely supplier counter-arguments with responses.",
        good: ["Specific to the uncapped index", "Tradeable concessions", "Counter-arguments with responses"],
        evaluate: "Ask: what is the single strongest point to cap that price index?" },
      { id: "3.3e", sub: "3.3", type: "spot", title: "Rank the riskiest contracts",
        brief: "Compare the actual terms (liability, exit, price, data). Which three carry the most risk? Select three.",
        showContracts: true,
        options: ["C-1001 Helios", "C-1002 Meridian", "C-1003 Castore", "C-1044 Aurora", "C-3001 Summit"],
        correct: ["C-1001 Helios", "C-1044 Aurora", "C-1003 Castore"],
        model: ["Helios worst: uncapped liability + no exit on an auto-renew.", "Aurora: every term 'not stated' (no signed contract). Castore: weak SLA penalties. Don't rank by value alone."] },
      { id: "3.3a", sub: "3.3", type: "ai", title: "Scan terms for risk",
        objective: "Rank contracts by clause risk.",
        prompt: "You are a commercial contracts reviewer. Rank these by overall risk, explaining the main risk in each: Helios (£42m, uncapped liability, no exit, auto-renews); Meridian (£88m, uncapped price index); Castore (£54m, weak SLA); Summit (£7m SaaS, light data clauses); Sahara (£22m, single source, rolling). Present a ranked table and note the recurring risk type.",
        good: ["Weights liability/exit above pure value", "Ranks sensibly", "Names the recurring risk type"],
        evaluate: "Follow up: draft a better liability clause for the Helios contract in plain English." },
      { id: "3.4e", sub: "3.4", type: "reflect", title: "Design the CLM flow",
        brief: "Sketch the lifecycle a new contract should pass through.",
        questions: ["The five stages from request to monitoring.", "One thing AI does at each stage.", "The stage where Northwind loses most control today."],
        model: ["Request → draft → approve → sign → store & monitor.", "Weakest stage is post-signature monitoring — the most valuable to fix."] },
      { id: "3.4a", sub: "3.4", type: "ai", title: "Map an automated workflow",
        objective: "Map an end-to-end CLM flow.",
        prompt: "You are a CLM specialist. Map an end-to-end automated contract lifecycle for a manufacturer, from request to post-signature monitoring. For each stage describe what happens and where AI adds value. Identify the two stages that most reduce risk if automated.",
        good: ["Includes ongoing monitoring, not just signing", "AI value at each stage", "Names highest risk-reduction stages"],
        evaluate: "Ask: what alerts should the system raise automatically after signature?" },
      { id: "3.5e", sub: "3.5", type: "reflect", title: "Draw the line",
        brief: "AI proposes; a human disposes.",
        questions: ["Three contracting tasks where AI could assist.", "For each, what a human must still own.", "One rule Northwind should set for AI on contracts."],
        model: ["AI assists drafting, risk-flagging, summarising; humans own the binding agreement.", "Default rule: AI proposes, a person approves — never auto-sign."] },
      { id: "3.5a", sub: "3.5", type: "ai", title: "Define responsible-use rules",
        objective: "Set plain-English rules for contract AI.",
        prompt: "You are an AI governance advisor. Propose five plain-English rules for the responsible use of AI in contract drafting and review, covering human accountability, transparency, confidentiality and checking AI output. Make each rule a single clear sentence.",
        good: ["Five usable, non-technical rules", "Covers accountability, transparency, confidentiality, checking", "Single clear sentences"],
        evaluate: "Ask: which rule matters most, and what goes wrong if it is ignored?" },
      { id: "3lab", sub: "Lab", type: "lab", title: "Prompt Lab — practise the skills",
        chain: { lead: "Take the triage from 3.1 and turn the top action into a deliverable.", prompt: "Here is my contract triage: [paste]. For the most urgent contract, draft the actual email to the supplier that initiates the action (e.g. serving notice). Professional, under 150 words." },
        writeOwn: { task: "Build a prompt to extract and risk-rate the terms from a clause you paste (anonymised only).", role: "a contract reviewer", context: "Paste an anonymised clause.", task2: "Summarise the terms and flag risk.", format: "Plain English, bullets, with a risk level." },
        stretch: "Ask the LLM to red-team its own advice: what could be wrong, or risky to rely on without a lawyer?" },
      { id: "3case", sub: "Case", type: "case", title: "Northwind case — Contract Risk Triage",
        scenario: "An auditor warns that Northwind's 5,000 contracts are poorly managed. Show how AI brings the portfolio under control.",
        tasks: ["Rank the contracts by risk and urgency.", "Pick the two most urgent and define the action.", "Show how AI-enabled CLM stops recurrence across ~5,000 contracts.", "State two ethics rules."],
        deliverable: "A one-page contract-risk plan. Carry the best ideas into your Backlog.", to: "backlog" },
    ],
  },
  {
    n: 4, title: "Supply-Chain Efficiency", theme: "Forecasting · Inventory · Automation · Logistics · Visibility",
    objectives: ["Forecast demand better", "Optimise inventory", "Automate high-value work", "Apply AI to logistics", "Build visibility"],
    activities: [
      { id: "4.1e", sub: "4.1", type: "spot", title: "Where would accuracy pay off?", single: true,
        brief: "Which category has the worst forecast accuracy (the best place to start)? Select one.",
        showDemand: true,
        options: ["Fast movers", "Seasonal (HVAC)", "Promotional lines", "Spares / slow movers", "New products"],
        correct: ["New products"],
        model: ["New products (40%) and promotional (54%) are worst and highest-impact.", "Extra signals: promo calendar, weather, analogues for new lines."] },
      { id: "4.1a", sub: "4.1", type: "ai", title: "Diagnose forecasting",
        objective: "Diagnose the problem and prescribe fixes.",
        prompt: "You are a demand-planning expert. A manufacturer has these accuracies: fast movers 80%, seasonal 62%, promotional 54%, slow movers 60%, new products 40%. Explain why the low ones are hard, what extra signals AI could use for each, and where to focus first for the biggest payoff. Present a short table.",
        good: ["Targets the hardest, highest-impact categories", "Realistic extra signals", "Says where to start"],
        evaluate: "Ask: what is a sensible first pilot, and how would we prove it worked?" },
      { id: "4.2e", sub: "4.2", type: "spot", title: "Free the trapped cash",
        brief: "Which categories most likely hold trapped or dead cash? Select up to two.",
        showDemand: true,
        options: ["Fast movers (£30m, 96%)", "Seasonal (£45m, 89%)", "Promotional (£22m, 88%)", "Slow movers (£38m, dead stock)"],
        correct: ["Seasonal (£45m, 89%)", "Slow movers (£38m, dead stock)"],
        model: ["Seasonal (£45m, service still 89%) and slow movers (£38m, dead stock) are prime suspects.", "Fix: dynamic safety stock + multi-echelon optimisation + obsolescence alerts."] },
      { id: "4.2a", sub: "4.2", type: "ai", title: "Recommend inventory actions",
        objective: "Release working capital without hurting service.",
        prompt: "You are an inventory-optimisation specialist. A manufacturer holds £150m of inventory with £9m of annual obsolescence write-offs and uses one blanket safety-stock rule across all sites. Suggest five AI-enabled changes to release working capital while protecting service, with the trade-off for each. Name the two likely to free the most cash.",
        good: ["Mentions dynamic safety stock and multi-echelon", "Protects service", "Names the biggest cash release"],
        evaluate: "Ask: how would we protect service while cutting the buffer?" },
      { id: "4.3e", sub: "4.3", type: "spot", title: "Pick the automation target", single: true,
        brief: "Which routine, high-volume task is the best first automation candidate? Select one.",
        options: ["Supplier selection", "Invoice matching (~200k/yr)", "Contract negotiation", "Category strategy"],
        correct: ["Invoice matching (~200k/yr)"],
        model: ["Invoice matching: ~200,000/year, rules-based, measurable (touchless rate, cost/invoice).", "Route the tricky exceptions to a human."] },
      { id: "4.3a", sub: "4.3", type: "ai", title: "Plan an automation quick win",
        objective: "Design a touchless invoice process.",
        prompt: "You are an intelligent-automation consultant. A manufacturer processes ~200,000 supplier invoices a year, mostly by hand, with errors and missed early-payment discounts. Explain how AI and automation could handle most of these, what touchless processing means, what to measure, and what should still go to a human.",
        good: ["Designs for exceptions (route the hard 20%)", "Real metrics (touchless %, cost/txn)", "Practical"],
        evaluate: "Ask: what metrics prove this is working, not just busy?" },
      { id: "4.4e", sub: "4.4", type: "spot", title: "Tune the network",
        brief: "Which two numbers are weakest (the best improvement targets)? Select two.",
        showLog: true,
        options: ["On-time 87%", "Failed deliveries 6%", "Fleet utilisation 72%", "Transport spend £120m"],
        correct: ["Failed deliveries 6%", "Fleet utilisation 72%"],
        model: ["Low utilisation (72%) and failed deliveries (6%) signal routing + ETA opportunities.", "Dynamic routing and predictive ETAs cut cost, miles and carbon together."] },
      { id: "4.4a", sub: "4.4", type: "ai", title: "Find logistics gains",
        objective: "Find high-impact logistics improvements.",
        prompt: "You are a logistics-optimisation expert. A manufacturer spends £120m on transport, 87% on-time, 6% failed deliveries, 72% fleet utilisation, manual regional routing, default carriers. Suggest the highest-impact AI improvements, the effect on cost, service and carbon for each, ranked by payback.",
        good: ["Connects cost and carbon", "Ranked by payback", "Targets the weak numbers"],
        evaluate: "Ask: which one would you pilot first and why?" },
      { id: "4.5e", sub: "4.5", type: "reflect", title: "Close the blind spots",
        brief: "Northwind has four ERPs and no single view.",
        questions: ["Three blind spots this creates.", "What data Northwind probably already has to connect.", "The one flow to make visible first."],
        model: ["Blind spots: end-to-end shipment status, cross-ERP inventory, sub-tier risk.", "Most value comes from connecting data already held — start with inbound critical components."] },
      { id: "4.5a", sub: "4.5", type: "ai", title: "Design a visibility roadmap",
        objective: "Build pragmatic visibility from existing data.",
        prompt: "You are a supply-chain visibility expert. A manufacturer runs four separate ERPs and only learns of disruptions when deliveries fail. Without a big new platform, how could it build useful real-time visibility from data it already has? Describe a control-tower approach, what it would predict, and a sensible first step.",
        good: ["Integrates existing data first", "Predictive control tower", "A pragmatic first step"],
        evaluate: "Ask: what single early-warning alert would deliver the most value first?" },
      { id: "4lab", sub: "Lab", type: "lab", title: "Prompt Lab — practise the skills",
        chain: { lead: "Take the forecasting diagnosis from 4.1 and turn it into a plan.", prompt: "Here is my forecasting diagnosis: [paste]. Design a one-page pilot to improve the worst category: goal, four or five steps, what to measure, and a timescale." },
        writeOwn: { task: "Build a prompt to turn the logistics snapshot into three prioritised recommendations for the COO.", role: "a logistics advisor", context: "Paste the logistics figures.", task2: "Give three prioritised recommendations.", format: "Ranked, each with cost/service/carbon impact." },
        stretch: "Compare two prompts: run your recommendation once with 'be concise' and once with 'be thorough.' Which suits a busy COO, and why?" },
      { id: "4case", sub: "Case", type: "case", title: "Northwind case — Supply-Chain Efficiency",
        scenario: "Too much of the wrong stock, poor forecasts, inefficient shipping, fragmented visibility. The COO wants a plan to release cash and improve service.",
        tasks: ["Find the fastest cash and service gains.", "Sequence AI actions across forecasting, inventory, automation and logistics by payback.", "Show how a control tower ties it together.", "Flag where efficiency could create fragility, and one safeguard."],
        deliverable: "A one-page efficiency plan. Add the strongest items to your Backlog.", to: "backlog" },
    ],
  },
  {
    n: 5, title: "Future & Strategy", theme: "Trends · Sustainability · Resilience · Roadmap · People",
    objectives: ["Anticipate AI trends", "Apply AI to sustainability", "Build resilience", "Build your roadmap", "Lead the people change"],
    activities: [
      { id: "5.1e", sub: "5.1", type: "classify", title: "Hype or ready?",
        brief: "Place each capability by how ready it is for everyday procurement use.",
        buckets: ["Adopt now", "Pilot", "Watch"],
        items: ["Generative AI assistants", "AI demand forecasting", "Supplier-risk monitoring", "Agents for routine buying", "Full autonomy"],
        correct: { "Generative AI assistants": "Adopt now", "AI demand forecasting": "Pilot", "Supplier-risk monitoring": "Pilot", "Agents for routine buying": "Pilot", "Full autonomy": "Watch" },
        model: ["Generative AI is ready now; forecasting, risk and bounded agents are pilots; full autonomy is watch.", "A safe bounded agent: tail-spend buying within strict limits."] },
      { id: "5.1a", sub: "5.1", type: "ai", title: "Separate signal from hype",
        objective: "Judge technologies on impact and readiness.",
        prompt: "You are a pragmatic AI advisor. For a procurement team, assess these on impact and readiness: generative AI assistants, AI agents for routine buying, AI demand forecasting, supplier-risk monitoring. For each say adopt now, pilot, or watch, with one sentence why. Present as a table.",
        good: ["Sensible readiness calls", "Treats agents as bounded", "One-line reasons"],
        evaluate: "Ask: what is a safe, bounded first use of an AI agent in procurement?" },
      { id: "5.2e", sub: "5.2", type: "spot", title: "Find the carbon hotspots",
        brief: "Scope 3 is 84%, and ~15% of suppliers drive ~60% of emissions. Which two suppliers would you engage first (high-spend, high-volume)? Select two.",
        options: ["Meridian Steel (£88m)", "Verdant Polymers (£35m)", "Summit Software (£7m)", "Nordic Glass (£16m)"],
        correct: ["Meridian Steel (£88m)", "Verdant Polymers (£35m)"],
        model: ["High-spend, high-volume materials suppliers (Meridian steel, Verdant polymers) are likely hotspots.", "Focusing on a few suppliers is the fastest route to the 2030 target."] },
      { id: "5.2a", sub: "5.2", type: "ai", title: "Plan a Scope 3 approach",
        objective: "Measure credibly and target reduction.",
        prompt: "You are a sustainable-procurement advisor. A manufacturer's emissions are 84% Scope 3, ~15% of suppliers drive 60% of emissions, and the current figure is spend-based only. Target is −50% by 2030. Outline how AI could measure Scope 3 credibly and where to focus reduction first. Give five practical steps.",
        good: ["Prioritises hotspots & supplier engagement", "Moves beyond spend-based estimate", "Avoids greenwashing"],
        evaluate: "Ask: how do we avoid greenwashing in how we report this?" },
      { id: "5.3e", sub: "5.3", type: "reflect", title: "Stress-test Northwind",
        brief: "Pick a single-source supplier (Helios or Sahara).",
        questions: ["What happens if it fails suddenly?", "Three things AI early-warning and scenario planning could do.", "The cheapest effective protection."],
        model: ["Single-source failure stops production; Helios also carries uncapped liability.", "AI: early warning, scenario stress-test, pre-qualified alternative + targeted buffer."] },
      { id: "5.3a", sub: "5.3", type: "ai", title: "Build a resilience playbook",
        objective: "Prepare for a single-source failure.",
        prompt: "You are a supply-chain resilience expert. A manufacturer depends on a single overseas source for critical control modules (£42m/year), uncapped liability, no exit clause. Build a short resilience playbook: early-warning signals, how to stress-test the dependency, pre-positioned actions, and what to do in the first 48 hours if supply is cut.",
        good: ["Favours early warning + alternatives over just more stock", "Stress-test and pre-positioning", "First-48-hours actions"],
        evaluate: "Ask: what is the cheapest effective protection here?" },
      { id: "5.4e", sub: "5.4", type: "reflect", title: "Prioritise the portfolio",
        brief: "Bring together your week's Opportunity Backlog.",
        questions: ["Score each idea on value and readiness.", "Pick two quick wins (high value, high readiness).", "Pick one strategic bet (high value, lower readiness).", "The one foundation you must fix to enable the bet."],
        model: ["Quick wins: spend analytics, contract review (high/high).", "Foundation: clean, connected supplier & contract master data."] },
      { id: "5.4a", sub: "5.4", type: "ai", title: "Sequence the roadmap",
        objective: "Phase the initiatives sensibly.",
        prompt: "You are an AI strategy advisor. Given initiatives with rough value/readiness — spend analytics (high/high), supplier risk (high/medium), contract review (high/medium), forecasting (high/medium), Scope 3 (medium/medium), agentic tail-spend (medium/low) — produce a phased roadmap (foundations, quick wins, scale, transform), say what to start first and why, and name the data foundations needed.",
        good: ["Leads with quick wins", "Builds foundations early", "Names the data foundations"],
        evaluate: "Ask: what would make this roadmap fail, and how do we avoid it?" },
      { id: "5.5e", sub: "5.5", type: "reflect", title: "Lead the change",
        brief: "Tell an anxious team that AI is coming.",
        questions: ["The one-sentence, honest 'why' that frames it as opportunity.", "Two fears you'd expect, and your honest response to each.", "One skill you'd invest in for the team."],
        model: ["Honest 'why': AI frees you from drudgery for higher-value work.", "Answer job fear with reskilling; answer distrust with human control. Invest in AI/data literacy."] },
      { id: "5.5a", sub: "5.5", type: "ai", title: "Craft the change message",
        objective: "Announce AI honestly and humanly.",
        prompt: "You are a change-management coach. Help a procurement leader announce AI to an anxious team. Draft a short, honest, human message (under 150 words) that explains why AI is coming, what it will and won't change, and how the team will be supported. Then list the three most likely objections with a genuine response to each.",
        good: ["Honest about change without threatening", "Human-centred", "Three objections + genuine responses"],
        evaluate: "Ask for a warmer, more reassuring version, then choose what you'd actually say." },
      { id: "5lab", sub: "Lab", type: "lab", title: "Prompt Lab — practise the skills",
        chain: { lead: "Take your roadmap from 5.4 and sell it upward.", prompt: "Here is my draft AI roadmap: [paste]. Write a one-page board summary that sells it: the why now, the first quick win and its value, the cost, and the cost of doing nothing. Crisp and non-technical." },
        writeOwn: { task: "Build a prompt to generate a change-communication plan for rolling AI out to your team.", role: "a change-management coach", context: "Your team and the change you're making.", task2: "Produce a simple communication plan.", format: "Key messages, audiences, and a first step." },
        stretch: "Ask the LLM to act as a sceptical CFO and challenge your roadmap. Capture the three toughest questions and your answers." },
      { id: "5case", sub: "Case", type: "case", title: "Northwind capstone — Build the Strategy",
        scenario: "The culminating exercise. Prioritise the week's initiatives against the board's four goals and build the strategy.",
        tasks: ["Prioritise initiatives on value and readiness.", "Sequence a phased roadmap (foundations → quick wins → scale → transform).", "Address people, ethics and governance.", "Be ready to present a one-page strategy."],
        deliverable: "Your one-page AI strategy. Open My Strategy to assemble and export it.", to: "strategy" },
    ],
  },
];
const ALL_IDS = DAYS.flatMap((d) => d.activities.map((a) => a.id));
const ACT_INDEX = {};
DAYS.forEach((d) => d.activities.forEach((a) => { ACT_INDEX[a.id] = { day: d.n, title: a.title, sub: a.sub }; }));

/* ---------------- small UI ---------------- */
const riskColor = (r) => (r === "High" ? C.amber : r === "Medium" ? C.teal : r === "Low" ? C.mint : C.muted);
function Pill({ children, bg, fg }) {
  return <span style={{ background: bg || C.cardl, color: fg || C.deep, fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}
function Btn({ children, onClick, kind = "solid", small, disabled, style }) {
  const base = { fontFamily: sans, fontSize: small ? 13 : 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8, padding: small ? "6px 12px" : "9px 16px", border: "1px solid transparent", display: "inline-flex", alignItems: "center", gap: 6, transition: "all .15s", opacity: disabled ? 0.45 : 1 };
  const kinds = { solid: { background: C.teal, color: "#fff" }, navy: { background: C.navy, color: "#fff" }, ghost: { background: "transparent", color: C.teal, border: `1px solid ${C.line}` } };
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{ ...base, ...kinds[kind], ...style }}>{children}</button>;
}
function Card({ children, style }) {
  return <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 2px rgba(11,37,69,0.04)", ...style }}>{children}</div>;
}
function H({ children, size = 22, style }) {
  return <h2 style={{ fontFamily: serif, color: C.navy, fontSize: size, fontWeight: 700, margin: 0, ...style }}>{children}</h2>;
}
function Table({ cols, rows, onRow }) {
  return (
    <div style={{ overflowX: "auto", border: `1px solid ${C.line}`, borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13.5, minWidth: 560 }}>
        <thead>
          <tr style={{ background: C.deep }}>
            {cols.map((c) => (
              <th key={c.key} style={{ textAlign: c.align || "left", color: "#fff", fontWeight: 600, padding: "10px 12px", whiteSpace: "nowrap" }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onClick={onRow ? () => onRow(r) : undefined} style={{ background: i % 2 ? C.light : "#fff", cursor: onRow ? "pointer" : "default" }}>
              {cols.map((c) => (
                <td key={c.key} style={{ padding: "9px 12px", color: C.body, textAlign: c.align || "left", borderTop: `1px solid ${C.line}` }}>
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
function PromptBox({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch (e) {}
  };
  return (
    <div style={{ background: C.light, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: 14, marginTop: 8 }}>
      <div style={{ fontFamily: "Consolas, monospace", fontSize: 13, color: C.ink, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{text}</div>
      <div style={{ marginTop: 10 }}>
        <Btn small kind="ghost" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy prompt"}</Btn>
      </div>
    </div>
  );
}
/* small labelled text input used by the prompt builder */
function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, display: "block" }}>{label}
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", boxSizing: "border-box", marginTop: 4, fontFamily: sans, fontSize: 13.5, padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff" }} />
    </label>
  );
}
function buildPrompt(v) {
  const tidy = (s) => (s || "").trim().replace(/\.$/, "");
  return [
    v && v.role ? `You are ${tidy(v.role)}.` : "",
    v && v.context ? `${tidy(v.context)}.` : "",
    v && v.task ? `${tidy(v.task)}.` : "",
    v && v.format ? `Format: ${tidy(v.format)}.` : "",
  ].filter(Boolean).join(" ");
}
function PromptBuilder({ value, onChange }) {
  const v = value || { role: "", context: "", task: "", format: "" };
  const set = (k, x) => onChange({ ...v, [k]: x });
  const assembled = buildPrompt(v);
  return (
    <div>
      <div style={{ display: "grid", gap: 8 }}>
        <LabeledInput label="Role — you are…" value={v.role} onChange={(x) => set("role", x)} placeholder="a procurement analyst" />
        <LabeledInput label="Context — the situation" value={v.context} onChange={(x) => set("context", x)} placeholder="A £1.8bn manufacturer with manual processes" />
        <LabeledInput label="Task — ask for…" value={v.task} onChange={(x) => set("task", x)} placeholder="List ten ways AI could help and label each" />
        <LabeledInput label="Format — shape the output" value={v.format} onChange={(x) => set("format", x)} placeholder="A table, under 150 words" />
      </div>
      <PromptBox text={assembled || "Fill the fields above to build your prompt…"} />
    </div>
  );
}
/* reusable reveal-the-model-answer block */
function ModelAnswer({ open, onToggle, lines }) {
  return (
    <div style={{ marginTop: 12 }}>
      <Btn small kind="ghost" onClick={onToggle}>{open ? "Hide model answer" : "Reveal model answer"}</Btn>
      {open && (
        <div style={{ marginTop: 8, background: C.greenl, border: `1px solid ${C.mint}`, borderRadius: 10, padding: "10px 14px" }}>
          <ul style={{ margin: 0, paddingLeft: 18, color: C.ink, fontSize: 13.5, lineHeight: 1.6 }}>
            {lines.map((l, i) => <li key={i} style={{ marginBottom: 2 }}>{l}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
function Notes({ value, onChange, placeholder }) {
  return (
    <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Your notes and answer…"}
      style={{ width: "100%", marginTop: 12, minHeight: 70, resize: "vertical", boxSizing: "border-box", fontFamily: sans, fontSize: 14, color: C.ink, padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, background: C.light }} />
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
            style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 600, padding: "7px 14px", borderRadius: 999, cursor: "pointer", border: `1px solid ${tab === t ? C.teal : C.line}`, background: tab === t ? C.teal : "#fff", color: tab === t ? "#fff" : C.body }}>{t}</button>
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{MANDATE.map(([g, col]) => <Pill key={g} bg={col} fg="#fff">{g}</Pill>)}</div>
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
                  <Bar dataKey="spend" radius={[0, 4, 4, 0]}>{chartData.map((d, i) => <Cell key={i} fill={i < 3 ? C.navy : C.teal} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div style={{ marginBottom: 10 }}><Btn small kind="ghost" onClick={() => setSortSpend((s) => !s)}>Sort by {sortSpend ? "name" : "spend"}</Btn></div>
          <Table onRow={(r) => setSel({ kind: "supplier", data: r })}
            cols={[
              { key: "name", label: "Supplier", render: (r) => <strong style={{ color: C.navy }}>{r.name}</strong> },
              { key: "cat", label: "Category" }, { key: "spend", label: "£m", align: "right" }, { key: "region", label: "Region" },
              { key: "risk", label: "Risk", render: (r) => <Pill bg={riskColor(r.risk)} fg="#fff">{r.risk}</Pill> },
              { key: "single", label: "Single?", render: (r) => (r.single ? "Yes" : r.single === false ? "No" : "—") },
            ]} rows={supRows} />
        </div>
      )}
      {tab === "Performance" && (
        <div>
          <Table cols={[
            { key: "name", label: "Supplier", render: (r) => <strong style={{ color: C.navy }}>{r.name}</strong> },
            { key: "onTime", label: "On-time %" }, { key: "defect", label: "Defect rate" }, { key: "lead", label: "Lead-time trend" }, { key: "resp", label: "Responsiveness" },
          ]} rows={Object.entries(PERFORMANCE).map(([name, p]) => ({ name, ...p }))} />
          <p style={{ color: C.muted, fontSize: 13, marginTop: 10, fontStyle: "italic" }}>Falling on-time, rising defects or lengthening lead times are early-warning signs. Aurora stands out.</p>
        </div>
      )}
      {tab === "Contracts" && (
        <div>
          <p style={{ color: C.muted, fontSize: 13.5, marginBottom: 10, fontStyle: "italic" }}>Each row shows the actual terms — compare across the columns to spot the risk yourself.</p>
          <Table onRow={(r) => setSel({ kind: "contract", data: r })}
            cols={[
              { key: "ref", label: "Ref", render: (r) => <strong style={{ color: C.navy }}>{r.ref}</strong> },
              { key: "supplier", label: "Supplier" }, { key: "value", label: "£m", align: "right" }, { key: "term", label: "Term & renewal" },
              { key: "liability", label: "Liability", render: (r) => <span style={{ color: r.liability === "Uncapped" || r.liability === "Not stated" ? C.amber : C.body, fontWeight: r.liability === "Uncapped" ? 700 : 400 }}>{r.liability}</span> },
              { key: "exit", label: "Exit / termination" }, { key: "price", label: "Price basis" },
            ]} rows={CONTRACTS} />
        </div>
      )}
      {tab === "Demand" && (
        <Table cols={[
          { key: "cat", label: "Category", render: (r) => <strong style={{ color: C.navy }}>{r.cat}</strong> },
          { key: "method", label: "Method" }, { key: "acc", label: "Accuracy" }, { key: "inv", label: "Inv £m", align: "right" }, { key: "svc", label: "Service" }, { key: "issue", label: "Main issue" },
        ]} rows={DEMAND} />
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
                  <Pie data={EMISSIONS_SPLIT} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>{EMISSIONS_SPLIT.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie>
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
              <Row k="Liability" v={contract.liability} /><Row k="Exit" v={contract.exit} /><Row k="Price" v={contract.price} /></>)}
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <Row k="Supplier" v={d.supplier} /><Row k="Value" v={`£${d.value}m/yr`} />
            <Row k="Term & renewal" v={d.term} /><Row k="Liability" v={d.liability} />
            <Row k="Exit / termination" v={d.exit} /><Row k="Price basis" v={d.price} /><Row k="Data & other" v={d.other} />
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

/* small inline data previews used inside spot activities */
function InlinePerf() {
  return <Table cols={[{ key: "name", label: "Supplier" }, { key: "onTime", label: "On-time" }, { key: "defect", label: "Defect" }, { key: "lead", label: "Lead time" }, { key: "resp", label: "Resp." }]}
    rows={Object.entries(PERFORMANCE).map(([name, p]) => ({ name, ...p }))} />;
}
function InlineContracts() {
  return <Table cols={[{ key: "ref", label: "Ref" }, { key: "supplier", label: "Supplier" }, { key: "liability", label: "Liability" }, { key: "exit", label: "Exit" }, { key: "term", label: "Term" }, { key: "other", label: "Data/other" }]} rows={CONTRACTS} />;
}
function InlineDemand() {
  return <Table cols={[{ key: "cat", label: "Category" }, { key: "method", label: "Method" }, { key: "acc", label: "Accuracy" }, { key: "inv", label: "Inv £m", align: "right" }, { key: "svc", label: "Service" }, { key: "issue", label: "Issue" }]} rows={DEMAND} />;
}
function InlineLog() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
      {LOGISTICS.map(([k, v]) => (
        <div key={k} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{k}</div>
          <div style={{ fontSize: 13.5, color: C.ink }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

/* ================= INTERACTIVE ACTIVITIES ================= */
const TYPE_META = {
  classify: { c: C.teal, t: "Sort it" },
  spot: { c: C.amber, t: "Spot it" },
  reflect: { c: C.deep, t: "Think it through" },
  ai: { c: C.gold, t: "AI practical" },
  lab: { c: C.mint, t: "Prompt Lab" },
  case: { c: C.navy, t: "Case challenge" },
};

/* drag-free click-to-place classification */
function ClassifyBody({ a, wk, patch, note, setNote, complete }) {
  const placements = wk.placements || {};
  const checked = !!wk.checked;
  const [sel, setSel] = useState(null);
  const pool = a.items.filter((it) => !placements[it]);
  const total = a.items.length;
  const score = a.items.filter((it) => placements[it] === a.correct[it]).length;
  const allPlaced = pool.length === 0;
  const place = (bucket) => { if (!sel) return; patch({ placements: { ...placements, [sel]: bucket }, checked: false }); setSel(null); };
  const unplace = (it) => { const p = { ...placements }; delete p[it]; patch({ placements: p, checked: false }); };
  const check = () => { patch({ checked: true }); if (score === total) complete(); setNote(`Sorted — scored ${score}/${total}`); };
  const chip = (it, placed) => {
    const ok = checked && placements[it] === a.correct[it];
    const bad = checked && placed && placements[it] !== a.correct[it];
    const picked = sel === it;
    return (
      <button key={it} onClick={() => (placed ? unplace(it) : setSel(picked ? null : it))}
        style={{ cursor: "pointer", fontFamily: sans, fontSize: 12.5, fontWeight: 600, padding: "6px 10px", borderRadius: 8, textAlign: "left",
          border: `1px solid ${picked ? C.navy : ok ? C.green : bad ? C.red : C.line}`,
          background: ok ? C.greenl : bad ? C.redl : picked ? C.cardl : "#fff",
          color: ok ? C.green : bad ? C.red : C.ink }}>
        {it}{checked && placed ? (ok ? " ✓" : ` → ${a.correct[it]}`) : ""}
      </button>
    );
  };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.light, border: `1px dashed ${C.line}`, borderRadius: 10, padding: 12, minHeight: 44, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {pool.length ? pool.map((it) => chip(it, false)) : <span style={{ fontSize: 12.5, color: C.muted }}>All placed — check your answer.</span>}
      </div>
      <p style={{ fontSize: 11.5, color: C.muted, margin: "6px 2px 10px" }}>{sel ? `“${sel}” selected — tap a column to place it.` : "Tap a chip to pick it up, then tap a column. Tap a placed chip to return it."}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(150px,1fr))`, gap: 10 }}>
        {a.buckets.map((b) => (
          <div key={b} onClick={() => place(b)} style={{ border: `1px solid ${sel ? C.teal : C.line}`, borderRadius: 10, background: "#fff", padding: 10, cursor: sel ? "pointer" : "default", minHeight: 70 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{b}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{a.items.filter((it) => placements[it] === b).map((it) => chip(it, true))}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <Btn small onClick={check} disabled={!allPlaced}><CheckCircle2 size={14} />Check answer</Btn>
        {checked && <span style={{ fontSize: 13.5, fontWeight: 700, color: score === total ? C.green : C.amber }}>{score === total ? "All correct!" : `${score}/${total} correct`}</span>}
      </div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}

function SpotBody({ a, wk, patch, note, setNote, complete }) {
  const selected = wk.sel || [];
  const checked = !!wk.checked;
  const total = a.correct.length;
  const toggle = (o) => {
    let next;
    if (a.single) next = [o];
    else next = selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o];
    patch({ sel: next, checked: false });
  };
  const correctCount = selected.filter((o) => a.correct.includes(o)).length;
  const wrongCount = selected.filter((o) => !a.correct.includes(o)).length;
  const allRight = checked && wrongCount === 0 && correctCount === total;
  const check = () => { patch({ checked: true }); if (wrongCount === 0 && correctCount === total) complete(); setNote(`${a.single ? "Picked" : "Selected"} — ${correctCount}/${total} right${wrongCount ? `, ${wrongCount} wrong` : ""}`); };
  const preview = a.showPerf ? <InlinePerf /> : a.showContracts ? <InlineContracts /> : a.showDemand ? <InlineDemand /> : a.showLog ? <InlineLog /> : null;
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      {preview && <div style={{ margin: "10px 0" }}>{preview}</div>}
      <div style={{ display: "grid", gap: 8 }}>
        {a.options.map((o) => {
          const isSel = selected.includes(o);
          const isCorrect = a.correct.includes(o);
          let bd = C.line, bg = "#fff", fg = C.ink, mark = null;
          if (checked) {
            if (isSel && isCorrect) { bd = C.green; bg = C.greenl; fg = C.green; mark = "✓"; }
            else if (isSel && !isCorrect) { bd = C.red; bg = C.redl; fg = C.red; mark = "✕"; }
            else if (!isSel && isCorrect) { bd = C.mint; mark = "missed"; }
          } else if (isSel) { bd = C.teal; bg = C.cardl; }
          return (
            <button key={o} onClick={() => toggle(o)}
              style={{ cursor: "pointer", textAlign: "left", fontFamily: sans, fontSize: 13.5, fontWeight: 600, padding: "10px 12px", borderRadius: 9, border: `1px solid ${bd}`, background: bg, color: fg, display: "flex", alignItems: "center", gap: 10 }}>
              {a.single
                ? (isSel ? <CheckCircle2 size={16} color={C.teal} /> : <Circle size={16} color={C.muted} />)
                : (isSel ? <CheckCircle2 size={16} color={checked ? (isCorrect ? C.green : C.red) : C.teal} /> : <Circle size={16} color={C.muted} />)}
              <span style={{ flex: 1 }}>{o}</span>
              {mark && <span style={{ fontSize: 11.5, fontWeight: 700 }}>{mark}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <Btn small onClick={check} disabled={selected.length === 0}><CheckCircle2 size={14} />Check answer</Btn>
        {checked && <span style={{ fontSize: 13.5, fontWeight: 700, color: allRight ? C.green : C.amber }}>{allRight ? "Spot on!" : `${correctCount}/${total} right${wrongCount ? `, ${wrongCount} to rethink` : ""}`}</span>}
      </div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}

function ReflectBody({ a, wk, patch, note, setNote }) {
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <ol style={{ margin: "10px 0 0", paddingLeft: 20, color: C.body, fontSize: 14, lineHeight: 1.6 }}>
        {a.questions.map((q, i) => <li key={i} style={{ marginBottom: 3 }}>{q}</li>)}
      </ol>
      <Notes value={note} onChange={setNote} placeholder="Write your answer…" />
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}

function AiBody({ a, wk, patch, note, setNote }) {
  const checks = wk.checks || {};
  const ticked = a.good.filter((_, i) => checks[i]).length;
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}><strong style={{ color: C.navy }}>Goal:</strong> {a.objective}</p>
      <PromptBox text={a.prompt} />
      <p style={{ color: C.muted, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>{SAFE_NOTE}</p>
      <div style={{ marginTop: 12, background: C.light, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Score the AI's answer ({ticked}/{a.good.length})</div>
        <div style={{ display: "grid", gap: 6 }}>
          {a.good.map((g, i) => (
            <button key={i} onClick={() => patch({ checks: { ...checks, [i]: !checks[i] } })}
              style={{ cursor: "pointer", textAlign: "left", border: "none", background: "none", display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontSize: 13.5, color: checks[i] ? C.green : C.body }}>
              {checks[i] ? <CheckCircle2 size={16} color={C.green} /> : <Circle size={16} color={C.muted} />}<span>{g}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 10, background: C.greenl, borderLeft: `4px solid ${C.mint}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}>
        <strong style={{ color: C.green }}>Push further: </strong>{a.evaluate}
      </div>
      <Notes value={note} onChange={setNote} placeholder="Paste the AI's answer here, or note what you learned / changed…" />
    </div>
  );
}

function LabBody({ a, wk, patch, note, setNote }) {
  const wo = a.writeOwn;
  const seed = { role: wo.role, context: wo.context, task: wo.task2, format: wo.format };
  const builder = wk.builder || seed;
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.teal, marginBottom: 4 }}>1 · CHAIN IT</div>
        <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, margin: 0 }}>{a.chain.lead}</p>
        <PromptBox text={a.chain.prompt} />
      </div>
      <div style={{ marginBottom: 14, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.teal, marginBottom: 4 }}>2 · BUILD YOUR OWN</div>
        <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, margin: "0 0 10px" }}>{wo.task}</p>
        <PromptBuilder value={builder} onChange={(v) => patch({ builder: v })} />
      </div>
      <div style={{ background: C.cardl, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Sparkles size={16} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
        <div><strong style={{ color: C.navy }}>Stretch: </strong>{a.stretch}</div>
      </div>
      <p style={{ color: C.muted, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>{SAFE_NOTE}</p>
    </div>
  );
}

function CaseBody({ a, wk, patch, note, setNote, go }) {
  const steps = wk.steps || {};
  const doneSteps = a.tasks.filter((_, i) => steps[i]).length;
  return (
    <div>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55 }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>THE BRIEF</span><br />{a.scenario}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.muted, margin: "14px 0 8px" }}>YOUR TASKS ({doneSteps}/{a.tasks.length})</div>
      <div style={{ display: "grid", gap: 6 }}>
        {a.tasks.map((t, i) => (
          <button key={i} onClick={() => patch({ steps: { ...steps, [i]: !steps[i] } })}
            style={{ cursor: "pointer", textAlign: "left", border: `1px solid ${C.line}`, background: steps[i] ? C.greenl : "#fff", borderRadius: 9, padding: "9px 11px", display: "flex", alignItems: "center", gap: 9, fontFamily: sans, fontSize: 13.5, color: steps[i] ? C.green : C.body }}>
            {steps[i] ? <CheckCircle2 size={16} color={C.green} /> : <Circle size={16} color={C.muted} />}<span>{t}</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}>
        <strong style={{ color: C.navy }}>Deliverable: </strong>{a.deliverable}
      </div>
      <div style={{ marginTop: 12 }}>
        <Btn small kind="ghost" onClick={() => go(a.to)}>Go to {a.to === "backlog" ? "Opportunity Backlog" : "My Strategy"} <ChevronRight size={14} /></Btn>
      </div>
      <Notes value={note} onChange={setNote} placeholder="Draft your one-page answer here…" />
    </div>
  );
}

function Activity({ a, answers, setAnswers, done, setDone, work, setWork, go }) {
  const wk = work[a.id] || {};
  const patch = (p) => setWork({ ...work, [a.id]: { ...wk, ...p } });
  const note = answers[a.id] || "";
  const setNote = (v) => setAnswers({ ...answers, [a.id]: v });
  const isDone = !!done[a.id];
  const complete = () => setDone({ ...done, [a.id]: true });
  const meta = TYPE_META[a.type] || TYPE_META.reflect;
  const common = { a, wk, patch, note, setNote, complete, go };
  return (
    <Card style={{ marginBottom: 14, borderLeft: `4px solid ${meta.c}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: meta.c, borderRadius: 6, padding: "3px 7px" }}>{a.sub}</span>
          <Pill bg={meta.c} fg="#fff">{meta.t}</Pill>
          <H size={17}>{a.title}</H>
        </div>
        <button onClick={() => setDone({ ...done, [a.id]: !isDone })}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", border: `1px solid ${isDone ? C.mint : C.line}`, background: isDone ? C.mint : "#fff", color: isDone ? "#fff" : C.muted, borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 600 }}>
          <Check size={14} />{isDone ? "Done" : "Mark done"}
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        {a.type === "classify" && <ClassifyBody {...common} />}
        {a.type === "spot" && <SpotBody {...common} />}
        {a.type === "reflect" && <ReflectBody {...common} />}
        {a.type === "ai" && <AiBody {...common} />}
        {a.type === "lab" && <LabBody {...common} />}
        {a.type === "case" && <CaseBody {...common} />}
      </div>
    </Card>
  );
}

/* ================= MISSIONS ================= */
function Missions({ day, setDay, answers, setAnswers, done, setDone, work, setWork, go }) {
  const d = DAYS[day - 1];
  const ids = d.activities.map((a) => a.id);
  const dayDone = ids.filter((id) => done[id]).length;
  return (
    <div>
      <H size={26}>Daily missions</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>Each task is interactive — sort, spot, build prompts, then reveal the model answer. Everything saves automatically.</p>
      <div style={{ display: "flex", gap: 8, margin: "18px 0", flexWrap: "wrap" }}>
        {DAYS.map((x) => {
          const cnt = x.activities.filter((a) => done[a.id]).length;
          const full = cnt === x.activities.length;
          const active = x.n === day;
          return (
            <button key={x.n} onClick={() => setDay(x.n)}
              style={{ flex: "1 1 120px", textAlign: "left", cursor: "pointer", borderRadius: 12, padding: "12px 14px", border: `1px solid ${active ? C.teal : C.line}`, background: active ? C.navy : "#fff" }}>
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
      {d.activities.map((a) => (
        <Activity key={a.id} a={a} answers={answers} setAnswers={setAnswers} done={done} setDone={setDone} work={work} setWork={setWork} go={go} />
      ))}
    </div>
  );
}

/* ================= AI SANDBOX ================= */
function Sandbox() {
  const [v, setV] = useState({ role: "", context: "", task: "", format: "" });
  return (
    <div>
      <H size={26}>AI Sandbox</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>A free space to practise prompting. Build a prompt from the parts, or start from a pattern, then copy it into any AI tool.</p>
      <Card style={{ margin: "18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Wand2 size={18} color={C.teal} /><H size={17}>Prompt builder</H>
        </div>
        <p style={{ color: C.body, fontSize: 13.5, margin: "0 0 12px" }}>A good prompt usually has four parts: <strong>role</strong>, <strong>context</strong>, <strong>task</strong> and <strong>format</strong>. Fill them in and copy the result.</p>
        <PromptBuilder value={v} onChange={setV} />
      </Card>
      <H size={17} style={{ margin: "8px 0 10px" }}>Starter patterns</H>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
        {PROMPT_LIB.map((p) => (
          <Card key={p.h} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Sparkles size={15} color={C.amber} /><strong style={{ color: C.navy, fontSize: 14.5 }}>{p.h}</strong>
            </div>
            <PromptBox text={p.p} />
          </Card>
        ))}
      </div>
      <Card style={{ marginTop: 14, background: C.light }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={18} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 13.5, color: C.body }}><strong style={{ color: C.navy }}>Replace the [brackets]</strong> with the fictional Northwind details from Explore. {SAFE_NOTE}</p>
        </div>
      </Card>
    </div>
  );
}

/* ================= BACKLOG ================= */
function Backlog({ backlog, setBacklog }) {
  const blank = { title: "", desc: "", goal: GOALS[0], type: "Augment", value: "High", readiness: "High" };
  const [form, setForm] = useState(blank);
  const add = () => { if (!form.title.trim()) return; setBacklog([...backlog, { ...form, id: Date.now() }]); setForm(blank); };
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
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Title (e.g. AI spend analytics)" style={{ ...selStyle, width: "100%", boxSizing: "border-box" }} />
          <input value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="One-line description (optional)" style={{ ...selStyle, width: "100%", boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <label style={{ fontSize: 12, color: C.muted }}>Goal<br /><select value={form.goal} onChange={(e) => set("goal", e.target.value)} style={selStyle}>{GOALS.map((g) => <option key={g}>{g}</option>)}</select></label>
            <label style={{ fontSize: 12, color: C.muted }}>Type<br /><select value={form.type} onChange={(e) => set("type", e.target.value)} style={selStyle}><option>Augment</option><option>Automate</option></select></label>
            <label style={{ fontSize: 12, color: C.muted }}>Value<br /><select value={form.value} onChange={(e) => set("value", e.target.value)} style={selStyle}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
            <label style={{ fontSize: 12, color: C.muted }}>Readiness<br /><select value={form.readiness} onChange={(e) => set("readiness", e.target.value)} style={selStyle}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
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
              <Pill bg={GOAL_COLOR[b.goal]} fg="#fff">{b.goal}</Pill><Pill>{b.type}</Pill><Pill bg={C.light}>Value: {b.value}</Pill><Pill bg={C.light}>Ready: {b.readiness}</Pill>
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
                  <div key={rd} style={{ minHeight: 70, borderRadius: 10, padding: 8, background: quick ? C.greenl : C.light, border: `1px solid ${quick ? C.mint : C.line}` }}>
                    {items.map((it) => (
                      <div key={it.id} style={{ fontSize: 11.5, background: "#fff", borderLeft: `3px solid ${GOAL_COLOR[it.goal]}`, borderRadius: 5, padding: "4px 7px", marginBottom: 5, color: C.ink }}>{it.title}</div>
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
          <div style={{ height: 8, background: C.line, borderRadius: 99, marginTop: 6 }}><div style={{ width: `${weekPct}%`, height: "100%", background: C.teal, borderRadius: 99 }} /></div>
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

/* ================= IDENTITY, STORAGE & SYNC ================= */
const STORAGE_PREFIX = "cockpit";
const PROFILES_KEY = `${STORAGE_PREFIX}:profiles`;
const dataKey = (id) => `${STORAGE_PREFIX}:v2:${id}`;

const SUPA_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPA_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const FN_URL = SUPA_URL ? `${SUPA_URL}/functions/v1/cockpit-sync` : "";

const ls = {
  get(key) { try { return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null; } catch { return null; } },
  set(key, val) { try { if (typeof localStorage !== "undefined") localStorage.setItem(key, val); } catch (e) {} },
};
const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

const fnHeaders = () => ({ "Content-Type": "application/json", apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` });
async function syncSave(learner, data) {
  if (!FN_URL) return;
  try {
    await fetch(FN_URL, { method: "POST", headers: fnHeaders(), body: JSON.stringify({ action: "save", learnerId: learner.learnerId, cohort: learner.cohort, name: learner.name, data }) });
  } catch (e) { /* offline — local copy is source of truth */ }
}
async function adminList(cohort, adminKey) {
  if (!FN_URL) throw new Error("Backend not configured (VITE_SUPABASE_URL is missing).");
  const res = await fetch(FN_URL, { method: "POST", headers: fnHeaders(), body: JSON.stringify({ action: "list", cohort: cohort || undefined, adminKey }) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body.sessions || [];
}
function loadProfiles() {
  try { const p = JSON.parse(ls.get(PROFILES_KEY) || "{}"); return { active: p.active || null, list: Array.isArray(p.list) ? p.list : [] }; }
  catch { return { active: null, list: [] }; }
}
const saveProfiles = (p) => ls.set(PROFILES_KEY, JSON.stringify(p));
const pctOf = (done) => Math.round((ALL_IDS.filter((id) => done && done[id]).length / ALL_IDS.length) * 100);

/* ================= APP SHELL ================= */
const NAV = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "missions", label: "Missions", icon: ListChecks },
  { id: "sandbox", label: "AI Sandbox", icon: Sparkles },
  { id: "backlog", label: "Backlog", icon: LayoutGrid },
  { id: "strategy", label: "My Strategy", icon: Rocket },
];

function Cockpit({ learner, profiles, onPick, onAdd, onRemove, onRename, openAdmin }) {
  const [view, setView] = useState("home");
  const [day, setDay] = useState(1);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState({});
  const [work, setWork] = useState({});
  const [backlog, setBacklog] = useState([]);
  const [plan, setPlan] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const syncTimer = useRef();

  useEffect(() => {
    setLoaded(false);
    let d = {};
    try { d = JSON.parse(ls.get(dataKey(learner.learnerId)) || "{}"); } catch (e) {}
    setAnswers(d.answers || {}); setDone(d.done || {}); setWork(d.work || {});
    setBacklog(d.backlog || []); setPlan(d.plan || "");
    setView("home"); setDay(1); setLoaded(true);
  }, [learner.learnerId]);

  useEffect(() => {
    if (!loaded) return;
    const data = { answers, done, work, backlog, plan };
    ls.set(dataKey(learner.learnerId), JSON.stringify(data));
    clearTimeout(syncTimer.current);
    const snap = { learnerId: learner.learnerId, cohort: learner.cohort, name: learner.name };
    syncTimer.current = setTimeout(() => syncSave(snap, data), 1200);
    return () => clearTimeout(syncTimer.current);
  }, [answers, done, work, backlog, plan, loaded, learner.learnerId, learner.cohort, learner.name]);

  const doneCount = ALL_IDS.filter((id) => done[id]).length;
  const weekPct = Math.round((doneCount / ALL_IDS.length) * 100);

  return (
    <div style={{ fontFamily: sans, background: C.light, minHeight: "100vh", color: C.body, display: "flex" }}>
      <nav style={{ width: 210, background: "#fff", borderRight: `1px solid ${C.line}`, padding: "20px 14px", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px 14px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={17} color={C.gold} /></div>
          <div style={{ fontFamily: serif, fontWeight: 700, color: C.navy, fontSize: 15, lineHeight: 1 }}>Northwind<br /><span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>Cockpit</span></div>
        </div>
        <button onClick={() => setSwitcher(true)}
          style={{ width: "100%", textAlign: "left", cursor: "pointer", border: `1px solid ${C.line}`, background: C.light, borderRadius: 10, padding: "8px 10px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 999, background: C.teal, color: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{(learner.name || "?").trim().charAt(0).toUpperCase() || "?"}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learner.name || "Learner"}</div>
            <div style={{ fontSize: 10.5, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Cohort {learner.cohort}</div>
          </div>
          <ChevronDown size={15} color={C.muted} />
        </button>
        {NAV.map((n) => {
          const Icon = n.icon; const active = view === n.id;
          return (
            <button key={n.id} onClick={() => setView(n.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4, borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", fontFamily: sans, fontSize: 14, fontWeight: 600, background: active ? C.cardl : "transparent", color: active ? C.navy : C.muted }}>
              <Icon size={17} color={active ? C.teal : C.muted} />{n.label}
            </button>
          );
        })}
        <div style={{ marginTop: 18, padding: "0 8px" }}>
          <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700, letterSpacing: 0.5 }}>WEEK PROGRESS</div>
          <div style={{ height: 6, background: C.line, borderRadius: 99, marginTop: 6 }}><div style={{ width: `${weekPct}%`, height: "100%", background: C.teal, borderRadius: 99 }} /></div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>{doneCount} of {ALL_IDS.length} done</div>
        </div>
      </nav>
      <main style={{ flex: 1, padding: "28px clamp(16px, 4vw, 44px)", maxWidth: 1080, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {view === "home" && <Home go={setView} weekPct={weekPct} backlogCount={backlog.length} name={learner.name} setName={onRename} />}
        {view === "explore" && <Explore />}
        {view === "missions" && <Missions day={day} setDay={setDay} answers={answers} setAnswers={setAnswers} done={done} setDone={setDone} work={work} setWork={setWork} go={setView} />}
        {view === "sandbox" && <Sandbox />}
        {view === "backlog" && <Backlog backlog={backlog} setBacklog={setBacklog} />}
        {view === "strategy" && <Strategy backlog={backlog} plan={plan} setPlan={setPlan} name={learner.name} />}
      </main>
      {switcher && (
        <Switcher learner={learner} profiles={profiles} onClose={() => setSwitcher(false)}
          onPick={(id) => { onPick(id); setSwitcher(false); }} onAdd={(n, c) => { onAdd(n, c); setSwitcher(false); }}
          onRemove={onRemove} openAdmin={() => { setSwitcher(false); openAdmin(); }} />
      )}
    </div>
  );
}

function Switcher({ learner, profiles, onClose, onPick, onAdd, onRemove, openAdmin }) {
  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState("");
  const [cohort, setCohort] = useState(learner ? learner.cohort : "");
  const inp = { width: "100%", boxSizing: "border-box", fontFamily: sans, fontSize: 14, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 9, color: C.ink, background: "#fff" };
  const submit = () => { if (name.trim() && cohort.trim()) onAdd(name.trim(), cohort.trim()); };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,37,69,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px,100%)", background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <H size={19}>Who's working?</H>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted }}><X size={20} /></button>
        </div>
        {profiles.length > 0 && (
          <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            {profiles.map((p) => {
              const active = learner && p.learnerId === learner.learnerId;
              return (
                <div key={p.learnerId} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${active ? C.teal : C.line}`, background: active ? C.cardl : "#fff", borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: active ? C.teal : C.muted, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{(p.name || "?").charAt(0).toUpperCase()}</div>
                  <button onClick={() => onPick(p.learnerId)} style={{ flex: 1, textAlign: "left", border: "none", background: "none", cursor: "pointer", minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{p.name}{active ? " · active" : ""}</div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>Cohort {p.cohort}</div>
                  </button>
                  <button title="Remove from this device" onClick={() => onRemove(p.learnerId)} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted }}><X size={15} /></button>
                </div>
              );
            })}
          </div>
        )}
        {adding ? (
          <div style={{ display: "grid", gap: 10, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.muted }}>NEW LEARNER</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inp} />
            <input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="Cohort / join code" style={inp} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={submit}><UserPlus size={15} />Create</Btn>
              {profiles.length > 0 && <Btn kind="ghost" onClick={() => setAdding(false)}>Cancel</Btn>}
            </div>
          </div>
        ) : (
          <Btn kind="ghost" onClick={() => { setName(""); setCohort(learner ? learner.cohort : ""); setAdding(true); }}><Plus size={15} />Add another learner</Btn>
        )}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
          <button onClick={openAdmin} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, fontFamily: sans }}>
            <Shield size={14} /> Instructor dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function StartGate({ onCreate, openAdmin }) {
  const [name, setName] = useState("");
  const [cohort, setCohort] = useState("");
  const inp = { width: "100%", boxSizing: "border-box", fontFamily: sans, fontSize: 15, padding: "11px 13px", border: `1px solid ${C.line}`, borderRadius: 10, color: C.ink, background: "#fff", marginTop: 6 };
  const go = () => { if (name.trim() && cohort.trim()) onCreate(name.trim(), cohort.trim()); };
  return (
    <div style={{ fontFamily: sans, minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy}, ${C.deep})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "min(460px,100%)", background: "#fff", borderRadius: 18, padding: "30px 28px", boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={21} color={C.gold} /></div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: C.amber }}>AI FOUNDATIONS · PROCUREMENT & SUPPLY CHAIN</div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.navy, lineHeight: 1.1 }}>The Northwind Cockpit</div>
          </div>
        </div>
        <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, margin: "0 0 18px" }}>Enter your name and the cohort code from your facilitator to start. Your progress saves on this device and to your cohort.</p>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: C.muted }}>Your name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Morgan" style={inp} onKeyDown={(e) => e.key === "Enter" && go()} />
        </label>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: C.muted, display: "block", marginTop: 14 }}>Cohort / join code
          <input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="e.g. JUN-2026" style={inp} onKeyDown={(e) => e.key === "Enter" && go()} />
        </label>
        <div style={{ marginTop: 20 }}>
          <Btn kind="navy" onClick={go} disabled={!(name.trim() && cohort.trim())} style={{ width: "100%", justifyContent: "center" }}>Enter the Cockpit <ChevronRight size={16} /></Btn>
        </div>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button onClick={openAdmin} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: sans }}>
            <Shield size={14} /> Instructor dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= INSTRUCTOR DASHBOARD ================= */
function Admin({ onExit }) {
  const [cohort, setCohort] = useState("");
  const [key, setKey] = useState("");
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const inp = { fontFamily: sans, fontSize: 14, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 9, color: C.ink, background: "#fff" };
  const run = async () => {
    setBusy(true); setErr("");
    try { setRows(await adminList(cohort.trim(), key.trim())); }
    catch (e) { setErr(e.message || "Failed to load"); setRows(null); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ fontFamily: sans, background: C.light, minHeight: "100vh", color: C.body }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.deep})`, color: "#fff", padding: "20px clamp(16px,4vw,44px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={20} color={C.gold} />
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.amber }}>NORTHWIND COCKPIT</div>
              <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700 }}>Instructor dashboard</div>
            </div>
          </div>
          <Btn kind="ghost" onClick={onExit} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}><LogOut size={15} />Back to app</Btn>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(16px,4vw,44px)" }}>
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Cohort code <span style={{ fontWeight: 400 }}>(blank = all)</span><br />
              <input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="e.g. JUN-2026" style={{ ...inp, marginTop: 5 }} onKeyDown={(e) => e.key === "Enter" && run()} /></label>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Admin passphrase<br />
              <input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder="passphrase" style={{ ...inp, marginTop: 5 }} onKeyDown={(e) => e.key === "Enter" && run()} /></label>
            <Btn kind="navy" onClick={run} disabled={!key.trim() || busy}><RefreshCw size={15} />{busy ? "Loading…" : "Load cohort"}</Btn>
          </div>
          {err && <p style={{ color: C.amber, fontSize: 13, marginTop: 10, marginBottom: 0 }}>⚠ {err}</p>}
        </Card>
        {rows && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
              <Stat label="LEARNERS" value={rows.length} />
              <Stat label="AVG PROGRESS" value={`${rows.length ? Math.round(rows.reduce((a, r) => a + pctOf(r.data?.done), 0) / rows.length) : 0}%`} />
              <Stat label="OPPORTUNITIES" value={rows.reduce((a, r) => a + (r.data?.backlog?.length || 0), 0)} />
              <Stat label="PLANS WRITTEN" value={rows.filter((r) => (r.data?.plan || "").trim()).length} />
            </div>
            {rows.length === 0 && <Card><p style={{ margin: 0, color: C.muted }}>No sessions yet for this cohort.</p></Card>}
            <div style={{ display: "grid", gap: 10 }}>
              {rows.map((r) => {
                const pct = pctOf(r.data?.done);
                const bl = r.data?.backlog || [];
                const isOpen = open === r.learner_id;
                return (
                  <Card key={r.learner_id} style={{ padding: 0, overflow: "hidden" }}>
                    <button onClick={() => setOpen(isOpen ? null : r.learner_id)}
                      style={{ width: "100%", border: "none", background: "none", cursor: "pointer", textAlign: "left", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 999, background: C.teal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{(r.name || "?").charAt(0).toUpperCase()}</div>
                      <div style={{ minWidth: 140, flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{r.name}</div>
                        <div style={{ fontSize: 11.5, color: C.muted }}>Cohort {r.cohort} · updated {new Date(r.updated_at).toLocaleString()}</div>
                      </div>
                      <div style={{ minWidth: 120 }}>
                        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{pct}% · {bl.length} opps</div>
                        <div style={{ height: 6, width: 120, background: C.line, borderRadius: 99, marginTop: 4 }}><div style={{ width: `${pct}%`, height: "100%", background: C.teal, borderRadius: 99 }} /></div>
                      </div>
                      <ChevronDown size={17} color={C.muted} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                    </button>
                    {isOpen && (
                      <div style={{ borderTop: `1px solid ${C.line}`, padding: 16, background: C.light }}>
                        <H size={14} style={{ marginBottom: 8 }}>Opportunity backlog ({bl.length})</H>
                        {bl.length === 0 ? <p style={{ color: C.muted, fontSize: 13, margin: "0 0 14px" }}>None captured.</p> : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                            {bl.map((b) => (
                              <span key={b.id} style={{ fontSize: 12.5, background: "#fff", border: `1px solid ${C.line}`, borderLeft: `3px solid ${GOAL_COLOR[b.goal] || C.teal}`, borderRadius: 7, padding: "5px 9px", color: C.ink }}>
                                {b.title} <span style={{ color: C.muted }}>· {b.value}/{b.readiness}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <H size={14} style={{ marginBottom: 8 }}>90-day plan</H>
                        <p style={{ whiteSpace: "pre-wrap", fontSize: 13.5, color: (r.data?.plan || "").trim() ? C.ink : C.muted, margin: "0 0 14px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, padding: 10 }}>
                          {(r.data?.plan || "").trim() || "— not written yet —"}
                        </p>
                        <H size={14} style={{ marginBottom: 8 }}>Mission notes</H>
                        {(() => {
                          const ans = r.data?.answers || {};
                          const filled = Object.entries(ans).filter(([, v]) => (v || "").trim());
                          if (filled.length === 0) return <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>No notes yet.</p>;
                          return (
                            <div style={{ display: "grid", gap: 8 }}>
                              {filled.map(([id, v]) => (
                                <div key={id} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, padding: 10 }}>
                                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{actLabel(id)}</div>
                                  <div style={{ fontSize: 13.5, color: C.ink, whiteSpace: "pre-wrap", marginTop: 3 }}>{v}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <Card style={{ padding: 14 }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: serif, fontSize: 28, color: C.navy, fontWeight: 700 }}>{value}</div>
    </Card>
  );
}
function actLabel(id) {
  const a = ACT_INDEX[id];
  return a ? `Day ${a.day} · ${a.sub} · ${a.title}` : id;
}

/* ================= ROOT ================= */
export default function App() {
  const [profiles, setProfiles] = useState(loadProfiles);
  const [mode, setMode] = useState(() => (typeof window !== "undefined" && window.location.hash === "#admin") ? "admin" : "app");
  useEffect(() => {
    const onHash = () => setMode(window.location.hash === "#admin" ? "admin" : "app");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const commit = (next) => { setProfiles(next); saveProfiles(next); };
  const onPick = (id) => commit({ ...profiles, active: id });
  const onAdd = (name, cohort) => {
    const learnerId = uuid();
    commit({ active: learnerId, list: [...profiles.list, { learnerId, name, cohort, createdAt: Date.now() }] });
  };
  const onRemove = (id) => {
    const list = profiles.list.filter((p) => p.learnerId !== id);
    commit({ active: profiles.active === id ? (list[0]?.learnerId || null) : profiles.active, list });
  };
  const onRename = (name) => commit({ ...profiles, list: profiles.list.map((p) => p.learnerId === profiles.active ? { ...p, name } : p) });
  const openAdmin = () => { window.location.hash = "#admin"; setMode("admin"); };
  const exitAdmin = () => { if (window.location.hash) window.location.hash = ""; setMode("app"); };

  if (mode === "admin") return <Admin onExit={exitAdmin} />;
  const active = profiles.list.find((p) => p.learnerId === profiles.active) || null;
  if (!active) return <StartGate onCreate={onAdd} openAdmin={openAdmin} />;
  return <Cockpit learner={active} profiles={profiles.list} onPick={onPick} onAdd={onAdd} onRemove={onRemove} onRename={onRename} openAdmin={openAdmin} />;
}
