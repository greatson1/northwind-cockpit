import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  Legend, ScatterChart, Scatter, ZAxis, LabelList, LineChart, Line,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, RadialBarChart, RadialBar, ReferenceArea, ReferenceLine,
} from "recharts";
import {
  Compass, ListChecks, LayoutGrid, Rocket, Home as HomeIcon, Copy, Check, Plus, X,
  AlertTriangle, ChevronRight, ChevronDown, Building2, Sparkles, CheckCircle2, Circle, Wand2,
  Users, UserPlus, LogOut, Shield, RefreshCw, Cpu, Trophy, Lock, Unlock, BookOpen,
  MessageSquare, Paperclip, Send, FileText, Code, Database, Boxes, FileSpreadsheet, Presentation,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CASES, CASE_IDS } from "./cases";
import EcosystemBuilder from "./builder.jsx";
import { exportWord, exportExcel, exportPPT, hasTables } from "./exporters.js";

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
  { name: "Helios Components", cat: "Control modules", spend: 42, region: "SE Asia", risk: "High", single: true, group: "Components", terms: "60 days", importance: "Critical", carbon: "Medium" },
  { name: "Meridian Steel", cat: "Structural steel", spend: 88, region: "UK", risk: "Medium", single: false, group: "Materials", terms: "30 days", importance: "Critical", carbon: "High" },
  { name: "Castore Logistics", cat: "Logistics (3PL)", spend: 54, region: "UK / EU", risk: "Medium", single: false, group: "Logistics", terms: "30 days", importance: "Critical", carbon: "Medium" },
  { name: "Verdant Polymers", cat: "Polymers & insulation", spend: 35, region: "EU", risk: "Medium", single: false, group: "Materials", terms: "45 days", importance: "Important", carbon: "High" },
  { name: "Atlas Freight", cat: "Sea freight", spend: 31, region: "Global", risk: "Medium", single: false, group: "Logistics", terms: "30 days", importance: "Important", carbon: "Medium" },
  { name: "Aurora Electronics", cat: "Sensors", spend: 28, region: "East Asia", risk: "High", single: false, group: "Components", terms: "60 days", importance: "Important", carbon: "Medium" },
  { name: "Sahara Cables", cat: "Wiring & cabling", spend: 22, region: "North Africa", risk: "High", single: true, group: "Materials", terms: "45 days", importance: "Critical", carbon: "Medium" },
  { name: "Brunel Castings", cat: "Metal castings", spend: 19, region: "UK", risk: "Low", single: false, group: "Materials", terms: "30 days", importance: "Important", carbon: "High" },
  { name: "Nordic Glass", cat: "Glazing", spend: 16, region: "EU", risk: "Low", single: false, group: "Materials", terms: "30 days", importance: "Routine", carbon: "Medium" },
  { name: "Pioneer Fasteners", cat: "Fasteners", spend: 9, region: "East Asia", risk: "Medium", single: false, group: "Components", terms: "30 days", importance: "Routine", carbon: "Low" },
  { name: "Summit Software", cat: "SaaS / IT", spend: 7, region: "US", risk: "Low", single: false, group: "IT/Services", terms: "30 days", importance: "Routine", carbon: "Low" },
  { name: "Tail (~3,000 suppliers)", cat: "Mixed", spend: 410, region: "Global", risk: "Mixed", single: null, group: "Mixed", terms: "Varies", importance: "Routine", carbon: "Mixed" },
];
const PERFORMANCE = {
  "Helios Components": { prior: "94%", onTime: "91%", change: "-3pp", defect: "1.8%", lead: "Lengthening", resp: "Slow" },
  "Meridian Steel": { prior: "97%", onTime: "96%", change: "-1pp", defect: "0.4%", lead: "Stable", resp: "Good" },
  "Castore Logistics": { prior: "93%", onTime: "88%", change: "-5pp", defect: "service only", lead: "Worsening", resp: "Variable" },
  "Aurora Electronics": { prior: "89%", onTime: "82%", change: "-7pp", defect: "3.1%", lead: "Volatile", resp: "Slow" },
  "Sahara Cables": { prior: "92%", onTime: "90%", change: "-2pp", defect: "1.2%", lead: "Lengthening", resp: "Variable" },
};
const CONTRACTS = [
  { ref: "C-1001", supplier: "Helios Components", value: 42, term: "Auto-renews 1 Jan; 90-day notice", liability: "Uncapped", exit: "No exit clause", price: "Fixed + annual review", other: "Standard", deadline: "1 Jan 2027", actionBy: "3 Oct 2026" },
  { ref: "C-1002", supplier: "Meridian Steel", value: 88, term: "Ends 31 Dec 2026", liability: "Cap £5m", exit: "6-month notice", price: "Index-linked, no cap", other: "Standard", deadline: "31 Dec 2026", actionBy: "30 Jun 2026" },
  { ref: "C-1003", supplier: "Castore Logistics", value: 54, term: "Ends 30 Jun 2027", liability: "Cap £2m", exit: "3-month notice", price: "Fixed", other: "Weak SLA penalties", deadline: "30 Jun 2027", actionBy: "31 Mar 2027" },
  { ref: "C-1044", supplier: "Aurora Electronics", value: 28, term: "Evergreen; term expired Mar 2024", liability: "Not stated", exit: "Not stated", price: "Fixed", other: "Not stated", deadline: "Immediate", actionBy: "Immediate" },
  { ref: "C-1071", supplier: "Verdant Polymers", value: 35, term: "60-day rolling", liability: "Cap £1m", exit: "60-day notice", price: "Fixed", other: "No volume commitment", deadline: "Rolling", actionBy: "60-day cycle" },
  { ref: "C-2003", supplier: "Sahara Cables", value: 22, term: "Rolling", liability: "Cap £1m", exit: "30-day notice", price: "Fixed", other: "Single-source; N. Africa", deadline: "Rolling", actionBy: "30-day cycle" },
  { ref: "C-4002", supplier: "Atlas Freight", value: 31, term: "Mixed spot / contract", liability: "Cap £1m", exit: "30-day notice", price: "Spot rates (volatile)", other: "Standard", deadline: "Ongoing", actionBy: "Ongoing" },
  { ref: "C-3001", supplier: "Summit Software", value: 7, term: "Auto-renews 1 Apr; 30-day notice", liability: "Cap = fees", exit: "30-day notice", price: "Annual uplift", other: "Light data & security", deadline: "1 Apr 2027", actionBy: "1 Mar 2027" },
];
const DEMAND = [
  { cat: "Fast movers (controls)", method: "Statistical", acc: "80%", inv: 30, svc: "96%", writeoff: 0.2, issue: "Performing well" },
  { cat: "Seasonal (HVAC)", method: "Manual", acc: "62%", inv: 45, svc: "89%", writeoff: 1.6, issue: "Excess and stockouts" },
  { cat: "Promotional lines", method: "Manual", acc: "54%", inv: 22, svc: "88%", writeoff: 2.8, issue: "High obsolescence" },
  { cat: "Spares / slow movers", method: "Reorder point", acc: "60%", inv: 38, svc: "91%", writeoff: 0.9, issue: "Dead stock building" },
  { cat: "New products", method: "Judgement", acc: "40%", inv: 15, svc: "84%", writeoff: 3.5, issue: "Launch over/under-stock" },
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

// Company situation brief — the narrative behind the whole week.
const NW_STORY = {
  intro: "Northwind Building Systems is a £1.8bn manufacturer of building controls, structural and energy-efficiency products, selling across 14 countries from 6 plants and 9 distribution centres. Its 95-person procurement team buys ~£1.1bn of addressable spend a year from ~3,200 suppliers under ~5,000 contracts.",
  burning: "Growth — much of it by acquisition — has outpaced the back office. Four legacy ERPs mean no single view of spend, suppliers or contracts; ~200,000 invoices a year are keyed by hand; and many contracts drift on auto-renew with nobody actively managing them. A recent near-miss, when a single-source supplier in SE Asia almost halted a production line, plus an internal audit flagging the unmanaged contract estate, have put procurement firmly in the spotlight.",
  mandate: "The board has handed the new CPO a four-part mandate — and asked how AI could help deliver it, responsibly. For this programme, you are advising that CPO across the week.",
};
const BASELINE = [
  ["Addressable spend", "~£1.1bn / year"],
  ["Savings delivered last year", "2.1% — below the 4–5% best-in-class"],
  ["Maverick (off-contract) spend", "~28% of addressable"],
  ["Invoices / year", "~200,000 · ~£12 each to process, mostly manual"],
  ["Early-payment discounts captured", "~31% of those available"],
  ["Purchase-order cycle time", "9 days average (best-in-class 2–3)"],
  ["Inventory held", "£150m · £9m/yr written off to obsolescence"],
  ["Contracts auto-renew / rolling / expired", "~40% of the 5,000"],
];
const MATURITY = [
  ["ERP landscape", "4 separate systems — no single source of truth"],
  ["Spend data", "Partially classified; ~28% sits uncategorised in the tail"],
  ["Supplier master data", "Duplicates and gaps; no shared supplier ID"],
  ["Contract repository", "Scattered across drives and inboxes — no central CLM"],
  ["Emissions data", "Spend-based estimate only — low confidence"],
  ["Analytics maturity", "Mostly spreadsheets; reporting is backward-looking"],
];
const BENCHMARKS = [
  ["Structural steel index", "European hot-rolled coil steel up 4–6% in 2024–25; Meridian's operating margin stable at ~14% — context for the Meridian renegotiation"],
  ["Sea-freight spot rates", "Off the 2022 peak but swing ±40% seasonally — affects Atlas Freight"],
  ["Electronics / sensor lead times", "Lengthening industry-wide — affects Aurora and Helios"],
  ["Polymer & insulation prices", "Track the oil price; eased recently — affects Verdant"],
];
const SUPPLIER_SIGNALS = {
  "Helios Components": { health: "Amber — thin margins, rising debt", news: "Reports of capacity strain at its main plant", subtier: "Leans on one rare-earth supplier" },
  "Aurora Electronics": { health: "Amber — recent profit warning", news: "Quality recall in a sister product line", subtier: "Multi-region but opaque" },
  "Sahara Cables": { health: "Unknown — limited public disclosure", news: "Regional instability risk (N. Africa)", subtier: "Single copper source" },
  "Meridian Steel": { health: "Green — stable, listed", news: "Passing through energy-cost rises", subtier: "Diversified inputs" },
  "Castore Logistics": { health: "Amber — 3PL margin pressure", news: "Service complaints trending up", subtier: "Subcontracts last-mile delivery" },
};
const GLOSSARY = [
  ["Automate vs Augment", "Automate = AI does a routine, rules-based task end to end. Augment = AI assists a person who still makes the decision."],
  ["Scope 1 / 2 / 3 emissions", "1 = your own operations; 2 = the energy you buy; 3 = everything else in your value chain (purchased goods, transport…). Scope 3 is usually the biggest and hardest to measure."],
  ["Single vs dual source", "Single source = only one supplier can provide an item — high risk if it fails. Dual / multi-source spreads that risk."],
  ["Tail spend", "The long tail of low-value purchases across many suppliers — often unmanaged, and a prime automation target."],
  ["Maverick spend", "Buying outside agreed contracts or process — it quietly leaks negotiated value."],
  ["Safety stock", "Buffer inventory held to absorb ups and downs in demand or supply."],
  ["Multi-echelon optimisation", "Optimising inventory across the whole network (plants, DCs, stores) together, rather than site by site."],
  ["Control tower", "A real-time, end-to-end view of the supply chain that predicts and flags issues before they bite."],
  ["Touchless processing", "A transaction (e.g. an invoice) handled start to finish with no human touch; only the tricky exceptions go to a person."],
  ["CLM — Contract Lifecycle Management", "Managing a contract through its whole life: request → draft → approve → sign → store → monitor."],
  ["Agentic AI", "AI that can take actions toward a goal, not just answer questions — best kept bounded (strict limits) in procurement."],
  ["SRM — Supplier Relationship Management", "Segmenting and managing suppliers according to their strategic importance."],
  ["Spend-based estimate", "Estimating emissions from £ spent × an emission factor — quick, but low accuracy."],
  ["Generative vs predictive AI", "Generative AI creates text and content; predictive AI forecasts numbers or risk from data. Procurement uses both."],
];

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
    takeaway: "Pick one routine task you own and decide honestly — automate, augment, or keep human — then try one AI-augmented version of it this week.",
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
        rubric: ["Covers all four areas — suppliers, contracts, supply chain, sustainability", "Each idea tagged automate/augment and linked to a board goal", "Prioritised on value AND readiness, not gut feel", "Names safeguards that apply across the board"],
        deliverable: "A one-page opportunity map. Add your best opportunities to the Backlog — it builds all week.", to: "backlog" },
    ],
  },
  {
    n: 2, title: "Supplier Management", theme: "SRM · Performance · Risk · Collaboration · Trust",
    objectives: ["Segment relationships", "Predict performance from data", "Identify & monitor risk", "Collaborate with AI", "Build trust & transparency"],
    takeaway: "Choose one real supplier you manage and sketch what an AI early-warning signal for them would look like — and who should act on it.",
    activities: [
      { id: "2.0p", sub: "2.0", type: "pain", title: "Find the Pain — where AI matters in SRM",
        brief: "Before the tools, find the need. Map your team's biggest supplier-management frustrations — how many hours a month each eats, how painful it is (1–5), and whether AI could help. The high time × pain rows where AI can help are exactly where it earns its keep.",
        seed: [{ act: "Supplier reporting", hours: 12, pain: 5, ai: "Yes" }, { act: "Risk monitoring", hours: 10, pain: 5, ai: "Yes" }, { act: "Supplier meetings", hours: 8, pain: 3, ai: "Partial" }],
        output: "Capture three AI opportunities for your own organisation, then send them to your Backlog — they seed the rest of the week.",
        model: ["High hours + high pain + 'AI can help' = your strongest opportunities — here supplier reporting and risk monitoring stand out.", "Judgement- and relationship-heavy work (like supplier meetings) is usually 'augment', not 'automate'.", "Low-pain or low-hours tasks are a nice-to-have for AI, not a priority."] },
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
      { id: "2.1seg", sub: "2.1b", type: "segment", title: "Supplier Segmentation Challenge — you vs the AI",
        brief: "Now go deeper than three tiers. Sort Northwind's key suppliers into the four-tier model — Strategic, Critical, Preferred, Transactional — first using your own judgement, then run the AI and compare. The gold is in where you disagree.",
        suppliers: [
          { name: "Helios Components", spend: "£42m", risk: "High", single: "Yes", esg: "Medium" },
          { name: "Meridian Steel", spend: "£88m", risk: "Medium", single: "No", esg: "Low" },
          { name: "Castore Logistics", spend: "£54m", risk: "Medium", single: "No", esg: "Medium" },
          { name: "Aurora Electronics", spend: "£28m", risk: "High", single: "No", esg: "Medium" },
          { name: "Sahara Cables", spend: "£22m", risk: "High", single: "Yes", esg: "Medium" },
          { name: "Pioneer Fasteners", spend: "£9m", risk: "Medium", single: "No", esg: "High" },
          { name: "Summit Software", spend: "£7m", risk: "Low", single: "No", esg: "High" },
        ],
        output: "An AI-assisted supplier segmentation framework you can defend — your tiering, the AI's, and a clear rationale wherever they differ.",
        model: ["Strategic = high spend + high impact (Meridian £88m, Castore £54m) — partner deeply, joint planning.", "Critical = high risk or single-source; protect continuity even on modest spend (Helios, Sahara, Aurora).", "Preferred = reliable mid-tier performers (Pioneer) — develop and consolidate volume.", "Transactional = low value and low risk (Summit) — automate and simplify.", "There's no single right answer — Helios sits on the Strategic/Critical line. What matters is consistent, defensible reasoning, and weighing risk + single-source, not spend alone."] },
      { id: "2.1disc", sub: "2.1c", type: "discovery", title: "AI-Powered Supplier Discovery — find alternatives to a single source",
        brief: "Helios Components is your single source for control modules — and it has just raised prices 12%, missed deliveries and become a real supply risk. The CPO wants alternatives, fast. Use AI to go from a blank page to a defensible supplier longlist, shortlist and one-page recommendation — in minutes, not weeks.",
        product: "Industrial control modules",
        output: "A supplier longlist, a top-3 shortlist and a one-page recommendation — built with AI and validated by you.",
        model: ["A strong search prompt sets the role (sourcing specialist), the context (single-source Helios, +12% price, delays, risk), the ask (10 alternatives) and the format (comparison table).", "The AI longlist is breadth on tap — the value you add is screening: which names are real, certified and financially sound.", "Ranking against weighted criteria (quality, delivery, ESG, innovation, cost) turns a list into a decision.", "AI compresses days of market research into ~20 minutes — but final selection still needs human due diligence: references, financial checks and site audits.", "Watch for invented or out-of-date suppliers and missing financials — never engage a supplier on the AI's word alone."] },
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
      { id: "2.2hc", sub: "2.2b", type: "health", title: "AI Supplier Health Check — you vs the AI",
        brief: "Read the KPIs like an analyst. Judge each supplier's health yourself — high-performing, on track or underperforming — then run the AI and compare. Weigh the trend, not just today's number.",
        suppliers: [
          { name: "Helios Components", otd: "91%", defects: "1.8%", lead: "Lengthening", change: "-3pp" },
          { name: "Meridian Steel", otd: "96%", defects: "0.4%", lead: "Stable", change: "-1pp" },
          { name: "Castore Logistics", otd: "88%", defects: "service only", lead: "Worsening", change: "-5pp" },
          { name: "Aurora Electronics", otd: "82%", defects: "3.1%", lead: "Volatile", change: "-7pp" },
          { name: "Sahara Cables", otd: "90%", defects: "1.2%", lead: "Lengthening", change: "-2pp" },
        ],
        output: "A supplier performance review report — your verdicts, the AI's, and an action for each underperformer. Tip: back at work, run the same prompt on your own suppliers' KPIs.",
        model: ["Meridian is the clear top performer — 96% OTD, 0.4% defects, stable.", "Aurora is the urgent underperformer — 82% OTD, 3.1% defects, volatile, down 7pp across the board.", "Castore is sliding (88%, worsening, -5pp) — watch closely; Helios and Sahara are on track but with lengthening lead times to monitor.", "Read the direction of travel: a falling number with a worsening trend is the early-warning pattern."] },
      { id: "2.2sc", sub: "2.2c", type: "scorecard", title: "Build an AI Supplier Scorecard",
        brief: "Design your own weighted supplier scorecard, then let AI do the scoring. Set the category weights (they must total 100%), generate the ranked scorecard with AI, and keep the weighting model as a template you can run every quarter.",
        categories: [["Delivery", 25], ["Quality", 25], ["Risk", 20], ["ESG", 15], ["Innovation", 15]],
        output: "A Supplier Scorecard Template — your weighting model plus the prompt that scores, ranks and recommends — ready to reuse in the office. Hit 'Copy template' to take it.",
        model: ["The weights ARE the strategy — heavier on Risk/ESG signals a resilience- and sustainability-led approach; heavier on Delivery/Quality signals an operational one.", "Make AI show its per-category scores, not just the total, so the ranking is explainable and challengeable.", "Run it the same way each quarter — a consistent scorecard turns subjective reviews into a trend you can manage."] },
      { id: "2.2li", sub: "2.2d", type: "classify", title: "Lagging vs Leading Indicators",
        brief: "Sort each supplier metric by what it tells you. A lagging indicator records what already happened; a leading indicator warns of what's coming. AI-enabled SRM is all about shifting from lagging to leading.",
        buckets: ["Lagging", "Leading"],
        items: ["On-time delivery last month", "Customer complaints", "Quality defects last quarter", "Missed deliveries", "Employee turnover", "Factory utilisation rate", "Supplier debt increase", "Management resignations"],
        correct: { "On-time delivery last month": "Lagging", "Customer complaints": "Lagging", "Quality defects last quarter": "Lagging", "Missed deliveries": "Lagging", "Employee turnover": "Leading", "Factory utilisation rate": "Leading", "Supplier debt increase": "Leading", "Management resignations": "Leading" },
        model: ["Lagging = the rear-view mirror: on-time last month, complaints, defects, missed deliveries — they record what already happened.", "Leading = the windscreen: employee turnover, factory utilisation, rising debt, management resignations — they signal trouble before it reaches delivery.", "AI-enabled risk monitoring earns its keep precisely because it watches leading signals that humans rarely track.", "Discuss: which variables look most strongly linked to future failure? Rising debt + management resignations + falling utilisation, together, is a classic pre-failure pattern.", "Key learning: identifying which signals predict failure is exactly how machine learning works — it learns the patterns from past failures and watches for them."] },
      { id: "2.2sig", sub: "2.2f", type: "signals", title: "Spot the Warning Signs — before the scorecard turns red",
        brief: "Your best supplier on paper just sent five quiet signals. Spot the genuine warning signs (don't be reassured by the good numbers), name the future risks, decide what to do now — then generate the AI early-warning report.",
        scenario: "Meridian Steel — your top performer on paper: 96% on-time, 0.4% defects, no issues reported. But this quarter, beneath the surface, several things changed.",
        signs: ["96% on-time delivery", "Excellent quality, no issues reported", "Employee turnover up 35%", "Overtime up 50%", "Supplier requested accelerated payments", "Credit rating downgraded", "Plant manager resigned"],
        real: ["Employee turnover up 35%", "Overtime up 50%", "Supplier requested accelerated payments", "Credit rating downgraded", "Plant manager resigned"],
        prompt: "You are a supplier-risk analyst. Review this supplier profile and identify early warning signs that may indicate future performance deterioration, the future risks they point to, and what procurement should do now.\n\nSupplier: Meridian Steel — currently 96% on-time, 0.4% defects, no issues reported. But this quarter: employee turnover up 35%, overtime up 50%, the supplier has requested accelerated payments, its credit rating was downgraded, and the plant manager resigned.\n\nReturn an early-warning report: the weak signals and what each implies, the most likely future risks, an overall concern level, and three actions procurement should take now.",
        output: "A Supplier Early Warning Report — the weak signals, the future risks they predict and the actions to take now, on a supplier that looks perfectly healthy on its scorecard.",
        model: ["The reassuring numbers (96% on-time, excellent quality) are lagging — they describe the past. The five changes are leading signals of future trouble.", "Turnover +35% and overtime +50% → capacity and quality strain coming. Accelerated-payment requests + a credit downgrade → financial distress. The plant manager resigning → instability at the top.", "Act now: request a financial and capacity assurance, raise monitoring frequency, and pre-qualify an alternative before performance actually slips.", "The lesson: don't wait for the scorecard to turn red — by then the problem is already here."] },
      { id: "2.2hs", sub: "2.2g", type: "healthscore", title: "Build a Supplier Health Score",
        brief: "See how predictive scoring actually works. Set the weights for four factors, and the model converts each supplier's data into 0–100 sub-scores, applies your weights, and ranks them live. Change a weight and watch the ranking move.",
        factors: [["Delivery", 30], ["Quality", 25], ["Financial Health", 25], ["Workforce Stability", 20]],
        data: [
          { name: "Meridian Steel", otd: 96, defects: 0.4, credit: "Good", turnover: "Low" },
          { name: "Helios Components", otd: 91, defects: 1.8, credit: "Fair", turnover: "Medium" },
          { name: "Castore Logistics", otd: 88, defects: 3.0, credit: "Fair", turnover: "Medium" },
          { name: "Aurora Electronics", otd: 82, defects: 3.1, credit: "Poor", turnover: "High" },
        ],
        output: "A Supplier Risk Ranking — a transparent, weighted health score per supplier. The lowest scorers are your highest risks.",
        model: ["The model is just weighted sub-scores: each factor becomes a 0–100 score, multiplied by its weight, then summed.", "The weights are a choice: weight Financial Health and Workforce Stability more and the leading risks dominate; weight Delivery/Quality more and you're scoring the past.", "Aurora ranks lowest on almost any sensible weighting — weak on all four factors.", "Debrief: AI performs a far more sophisticated version of this continuously — across hundreds of signals, updated in real time, not once a quarter."] },
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
      { id: "2.3det", sub: "2.3b", type: "risk", title: "Supplier Risk Detective — predict the breakdown",
        brief: "Four signals just broke for a single-source Northwind supplier. In your group, play detective: spot the genuine red flags, score the risk, and write a mitigation and a contingency plan — then compare with the AI's risk register and with the other groups.",
        scenario: "Helios Components — your single-source supplier of control modules (£42m/year, one factory in SE Asia; the contract has uncapped liability and no exit clause). This week several signals appeared at once.",
        signs: ["Revenue down 20% year-on-year", "Debt up 30%", "A strike announced at its main plant", "Single factory location — no alternative site", "Refreshed its company logo", "Switched to a new email provider"],
        real: ["Revenue down 20% year-on-year", "Debt up 30%", "A strike announced at its main plant", "Single factory location — no alternative site"],
        prompt: "You are a supply-chain risk analyst. Assess this supplier's risk profile, identify the warning signs, give an overall risk score out of 10, and recommend mitigation and contingency actions.\n\nSupplier: Helios Components — single-source supplier of control modules, £42m/year, one factory in SE Asia; the contract has uncapped liability and no exit clause.\nRecent signals: revenue down 20% year-on-year; debt up 30%; a strike announced at its main plant; no alternative manufacturing site.\n\nReturn: (1) an overall risk score out of 10 with a one-line justification, (2) the key warning signs, (3) three mitigation actions to take now, (4) a contingency plan if supply stops, and (5) a one-row supplier risk register entry (supplier, risk, score, owner, next action).",
        output: "An AI-generated Supplier Risk Register entry — alongside your group's risk score, mitigation plan and contingency plan to defend against the AI and the other groups.",
        model: ["Genuine red flags: revenue down, debt up, strike, single-site dependency. The logo refresh and email provider are noise.", "This is a critical risk (≈9/10): financial distress + labour action + single-source + no site redundancy + uncapped liability.", "Mitigation: qualify a second source now, request financial assurances, build a targeted buffer of critical modules, and cap liability at renewal.", "Contingency: a pre-positioned alternative supplier, safety stock to cover the qualification lead time, and a 48-hour response plan if supply stops."] },
      { id: "m3hidden", sub: "M3.1", type: "concentration", title: "Hidden Risk Detective — multi-tier visibility",
        brief: "At Tier 1 your spend looks nicely diversified across five suppliers. But risk hides deeper. Reveal the AI Tier-2 mapping, then work out the hidden risk, the consequences and what to do.",
        tier1: [["Alpha", "$5M"], ["Beta", "$4M"], ["Gamma", "$3M"], ["Delta", "$2M"], ["Omega", "$1M"]],
        tier2: "ChipCo",
        prompt: "Analyse this supplier network and identify concentration risks, hidden dependencies and mitigation strategies.\n\nTier 1 suppliers (spend): Alpha $5M, Beta $4M, Gamma $3M, Delta $2M, Omega $1M.\nTier 2 mapping: all five Tier-1 suppliers source their critical chips from a single Tier-2 supplier, ChipCo.\n\nReturn: the concentration / hidden-dependency risk, the likely consequences and business impact if ChipCo fails, and a prioritised set of mitigation strategies.",
        debrief: ["Are we really diversified?", "What happens if ChipCo fails?", "How would AI identify this faster than humans?"],
        output: "A Supplier Dependency Map — the hidden Tier-2 concentration behind a 'diversified' Tier-1 base, with consequences and mitigations.",
        model: ["No — five Tier-1 suppliers but ONE Tier-2 source (ChipCo) = 100% concentration on a single hidden point of failure.", "If ChipCo fails, all five 'diversified' suppliers stop together — a total supply stoppage, not a 20% hit.", "Mitigate: map the sub-tiers, qualify an alternative Tier-2, require multi-sourcing in contracts, and hold a buffer of ChipCo-dependent parts.", "AI maps sub-tier dependencies across thousands of relationships in minutes — humans almost never see past Tier 1."] },
      { id: "m3score", sub: "M3.2", type: "riskscore", title: "AI Risk Scoring Workshop — the heat map",
        brief: "Turn four risk dimensions into a single, weighted risk score per supplier. Set the weights and the model builds a live risk heat map and ranking — highest risk first.",
        factors: [["Financial Risk", 30], ["Operational Risk", 30], ["ESG Risk", 20], ["Cyber Risk", 20]],
        data: [
          { name: "Alpha", fin: "Good", ops: "Stable", esg: "High", cyber: "Low" },
          { name: "Beta", fin: "Poor", ops: "Stable", esg: "Medium", cyber: "Medium" },
          { name: "Gamma", fin: "Good", ops: "Unstable", esg: "Low", cyber: "High" },
          { name: "Delta", fin: "Poor", ops: "Unstable", esg: "Low", cyber: "High" },
        ],
        prompt: "Rank these suppliers from highest to lowest risk and recommend appropriate mitigation actions.\n\nSupplier risk data (Financial Health, Delivery Stability, ESG Rating, Cyber Risk):\n- Alpha: Good, Stable, High ESG, Low cyber\n- Beta: Poor, Stable, Medium ESG, Medium cyber\n- Gamma: Good, Unstable, Low ESG, High cyber\n- Delta: Poor, Unstable, Low ESG, High cyber\nWeighting: Financial 30%, Operational 30%, ESG 20%, Cyber 20%.\nReturn a ranked risk table with each factor, the weighted risk score, the priority (immediate action / monitor) and a mitigation for the top risks. Also present the ranked risk scores as a bar chart.",
        output: "A Supplier Risk Heat Map — each supplier scored and ranked by weighted risk, colour-coded so the priorities jump out.",
        model: ["Delta is the greatest risk — poor financials, unstable delivery, low ESG and high cyber: bad on every dimension.", "Gamma is close behind (unstable + low ESG + high cyber). Both need immediate action.", "Alpha is the safest — monitor only; Beta sits in the middle.", "Learning point: AI lets procurement focus on the few suppliers that matter most, not spread attention evenly."] },
      { id: "m3crisis", sub: "M3.3", type: "crisis", title: "Supplier Crisis Simulation — 09:00 Monday",
        brief: "An AI alert just fired on a critical single-source supplier. As the procurement leadership team, build your response across three horizons, pressure-test it with AI, and present.",
        alert: { supplier: "MicroTech Ltd", score: 87, signals: ["Revenue decline of 20%", "Credit downgrade", "Key executives resigning", "Labour strike announced", "Customer complaints increasing"], exposure: ["Supplies 65% of your critical components", "Single-source arrangement", "No approved alternative supplier"] },
        parts: [
          { key: "now", label: "Immediate response (next 24 hours)", hint: "What do you do today to protect supply and buy time?" },
          { key: "d30", label: "Short-term response (30 days)", hint: "How will you reduce exposure over the next month?" },
          { key: "y1", label: "Long-term resilience (12 months)", hint: "How do you ensure this never causes a major disruption again?" },
        ],
        prompt: "Act as a Chief Procurement Officer. Review this supplier risk scenario and create an immediate response plan, a mitigation strategy, and a long-term resilience roadmap.\n\nSupplier: MicroTech Ltd. AI risk score 87/100 (critical). Signals: revenue down 20%, credit downgrade, key executives resigning, labour strike announced, customer complaints rising. Exposure: supplies 65% of our critical components, single-source, no approved alternative.\n\nReturn: (1) immediate actions for the next 24 hours, (2) a 30-day mitigation plan to reduce exposure, and (3) a 12-month resilience roadmap.",
        output: "A crisis response pack — risk assessment, mitigation plan and executive recommendation — to present to the leadership team.",
        model: ["First 24h: stand up a response team, contact MicroTech for assurance, secure and expedite in-transit/on-hand stock, work out true days-of-cover, brief leadership.", "30 days: fast-track an alternative source, place a safety-stock buy, negotiate priority/anti-strike contingency, and start a daily monitoring cadence.", "12 months: dual-source the 65% dependency, design for component flexibility, embed AI sub-tier monitoring, and hold strategic buffers for critical parts.", "The point: AI risk management isn't about spotting risk — it's about resilience and business continuity."] },
      { id: "m4friction", sub: "M4.1", type: "friction", title: "Supplier Friction Mapping Workshop",
        brief: "Suppliers are complaining: slow responses, slow onboarding, no invoice visibility, repeated requests, slow escalations. Map the supplier journey, mark where the friction hides, then ask AI where to remove it.",
        seed: [{ activity: "Registration", process: "Manual", friction: "" }, { activity: "Contract approval", process: "Email", friction: "" }, { activity: "Invoice query", process: "Phone", friction: "" }, { activity: "Performance review", process: "Quarterly meeting", friction: "" }],
        debrief: ["Which friction points create the most supplier frustration?", "Which could AI eliminate quickly?"],
        output: "A Supplier Collaboration Improvement Map — the journey, the friction points, and where AI can remove them.",
        model: ["High-friction, high-frequency steps (invoice queries by phone, manual registration) are the quick wins — self-service and AI assistants remove them fast.", "Map friction by frequency × pain, just like the time × pain exercise — the noisy daily interactions matter more than rare ones.", "AI removes friction with self-service status, instant answers and auto-routing — freeing people for the high-value relationship work."] },
      { id: "m4comms", sub: "M4.2", type: "pack", title: "AI Communication Co-Pilot Challenge",
        brief: "Prepare for a tough supplier review in minutes. Generate three communication documents with AI, paste each to build your toolkit, then compare prompt quality across the group.",
        scenario: "A strategic supplier has missed delivery targets, raised quality concerns, and requested a 7% price increase. You're preparing for the supplier review meeting.",
        items: [
          { key: "agenda", label: "Supplier meeting agenda", prompt: "Create a supplier review meeting agenda for a strategic supplier experiencing delivery delays, quality issues and a request for a 7% price increase. Allocate time per item and end with agreed actions." },
          { key: "exec", label: "Executive briefing", prompt: "Summarise this supplier's performance issues (delivery delays, quality concerns) and the 7% price-increase request, with the key discussion points and a recommendation for senior management. Keep it to one page." },
          { key: "followup", label: "Follow-up email", prompt: "Draft a professional follow-up email after the supplier review summarising the agreed actions, responsibilities and deadlines, and the position on the 7% price request. Warm, clear and firm." },
        ],
        output: "A Supplier Communication Toolkit — agenda, executive briefing and follow-up — built in minutes. Compare prompt quality and outputs across the group.",
        model: ["Consistency wins — same facts and tone across all three documents.", "The executive briefing should lead with the decision needed, not the detail.", "Always edit in the real names, dates and numbers before anything is sent.", "Learning point: AI dramatically reduces the time spent preparing supplier interactions."] },
      { id: "m4innov", sub: "M4.3", type: "innovsprint", title: "Supplier Innovation Sprint — joint problem-solving",
        brief: "Act as a joint buyer-supplier innovation team. Pick a challenge, generate supplier-led ideas with AI, score them on four criteria, choose the best and build a short business case to present.",
        challenge: "Reduce procurement costs by 10%, improve sustainability, and reduce supply-chain waste — through supplier-led innovation.",
        examples: ["Packaging reduction", "Transport optimisation", "Inventory reduction", "Energy efficiency", "Material substitution"],
        output: "A Supplier Innovation Proposal — the chosen idea, expected benefits, risks and an implementation roadmap, ready to present.",
        model: ["The best ideas hit all three goals at once — cost, sustainability and waste — and need only realistic supplier cooperation.", "Score honestly: a brilliant idea that needs heavy supplier co-investment may lose to a simpler quick win.", "A business case is benefits + risks + a credible roadmap — not just the idea.", "Joint buyer-supplier innovation works because the supplier often knows where the cost and waste really sit."] },
      { id: "2.4e", sub: "2.4", type: "reflect", title: "A collaboration play",
        brief: "Good collaboration is reciprocal.",
        questions: ["Choose one strategic supplier.", "Two things Northwind could share (e.g. a cleaner forecast).", "Two things they could share back (e.g. capacity, lead times).", "The benefit to each side."],
        model: ["Northwind shares forecast + plan; supplier shares capacity + lead-time + risk.", "Both plan better; agree confidentiality and data use up front."] },
      { id: "2.4a", sub: "2.4", type: "ai", title: "Design a collaboration initiative",
        objective: "Make the value genuinely two-sided.",
        prompt: "You are a collaboration specialist. Propose a practical data-sharing initiative between a manufacturer and a key supplier that helps both plan better. Describe what each side shares, the benefit to each, and two things to agree up front (e.g. confidentiality, data use). Keep it concrete.",
        good: ["Two-sided value", "Explicit up-front agreements", "Concrete, not vague"],
        evaluate: "Ask: what would make the supplier confident enough to share their data?" },
      { id: "2.4dev", sub: "2.4b", type: "develop", title: "Supplier Turnaround Project — develop, don't drop",
        brief: "Don't just rate a poor supplier — improve it. Set six-month targets, have AI build a development programme with milestones, KPIs and owners, then run the advanced step: get AI to cost the business case and the ROI.",
        scenario: "Aurora Electronics — a key sensor supplier (£28m/year) that's been struggling: on-time delivery 82%, defects 3.1%, and long, volatile lead times. Rather than re-tender, the CPO wants a six-month turnaround plan.",
        output: "A supplier improvement roadmap — six months of milestones, KPIs and responsibilities — backed by a costed business case (cost of poor performance, savings opportunity and ROI). Reuse it with a real underperformer back at work.",
        model: ["A good programme is time-boxed and measurable: each month has a milestone, a KPI and a named owner (shared between buyer and supplier).", "Start with the two highest-impact actions — usually root-cause the defects and stabilise the worst lead times first.", "The ROI step is what gets it funded: quantify the current cost of poor performance (expediting, scrap, admin, lost service) against the savings if targets are hit.", "Develop before you drop — re-tendering a £28m relationship is slower and riskier than a focused turnaround."] },
      { id: "2.4inn", sub: "2.4c", type: "innovate", title: "Innovation Sprint — supplier-led ideas",
        brief: "Use AI as an ideation partner. Take a cost-and-sustainability challenge, sprint with AI for supplier-led innovation ideas, then pitch your best one — the idea, expected savings and implementation effort.",
        challenge: "Reduce Northwind's packaging and protective-materials cost by 10% — while improving sustainability — through supplier-led innovation.",
        output: "An innovation proposal — your best supplier-led idea, the expected savings and the implementation effort — ready to pitch to the room.",
        model: ["The strongest ideas cut cost AND carbon together — right-sizing packaging, reusable/returnable transit packaging, recycled-content materials, supplier-managed (vendor-managed) packaging.", "Rank by savings × ease: high-saving, low-effort is your quick win; high-effort ideas usually need the supplier to co-invest.", "A good pitch is specific — the idea, a credible number, the effort, and who does what."] },
      { id: "2.5e", sub: "2.5", type: "reflect", title: "The transparency line",
        brief: "Be honest without oversharing method.",
        questions: ["Three places Northwind might use AI on suppliers.", "For each: what to tell suppliers vs keep internal.", "One sentence to explain its AI use to a supplier."],
        model: ["Tell suppliers AI assists performance/risk with human oversight; keep method internal.", "Example: 'We use AI to help assess performance and risk; people review the results and decide.'"] },
      { id: "2.5a", sub: "2.5", type: "ai", title: "Draft a transparent statement",
        objective: "Build trust, not suspicion.",
        prompt: "You are a procurement communications advisor. Draft a short, plain-English statement a manufacturer could share with suppliers explaining that it uses AI to help assess performance and risk, reassuring them about fairness, human oversight and data handling. Under 120 words, not defensive.",
        good: ["Warm and non-defensive", "Mentions human oversight, fairness, data", "Under 120 words"],
        evaluate: "Ask for a warmer, more partnership-focused version, then choose." },
      { id: "2.5pack", sub: "2.5b", type: "pack", title: "15-Minute Procurement Assistant — the comms pack",
        brief: "The 15-minute procurement assistant. One difficult supplier situation, four documents to write — do it in minutes with AI. Generate each, paste the result to assemble your pack, then refine with the real names and dates.",
        scenario: "Aurora Electronics — a key sensor supplier (£28m/year). Lately: on-time delivery has slipped to 82%, defects have risen to 3.1%, and they've just requested a 6% price increase. You need to address all three — professionally, and fast.",
        items: [
          { key: "invite", label: "Meeting invitation", prompt: "You are a category manager. Draft a short, professional meeting invitation to a key sensor supplier (Aurora Electronics) to review their recent performance and a pricing request. Context: on-time delivery has fallen to 82%, defects have risen to 3.1%, and they've requested a 6% price increase. Collaborative but clearly a serious review. Include the purpose, who should attend, a proposed 45-minute slot (use a placeholder date/time), and what they should prepare." },
          { key: "agenda", label: "Agenda", prompt: "You are a category manager. Create a focused 45-minute agenda for a supplier performance and pricing review with Aurora Electronics. Cover delivery (82% on-time), quality (3.1% defects), the requested 6% price increase, root causes, and agreed actions with owners and dates. Allocate minutes to each item and end with next steps." },
          { key: "report", label: "Supplier review report", prompt: "You are a procurement analyst. Write a concise one-page supplier review report on Aurora Electronics for an internal audience. Summarise performance (on-time 82%, defects 3.1%, both worsening), the 6% price-increase request and whether it's justified, the key risks, and a clear recommendation. Use headings and a short summary table." },
          { key: "followup", label: "Follow-up email", prompt: "You are a category manager. Draft a professional follow-up email to send Aurora Electronics after the review meeting. Summarise what was discussed, the agreed actions with owners and deadlines, the position on the 6% price request, and the date of the next check-in. Warm, clear and firm." },
        ],
        output: "A complete supplier communication pack — invitation, agenda, review report and follow-up — produced in minutes. Tip: reuse these four prompts with your own supplier the day after the course.",
        model: ["A strong pack is consistent across all four — same facts, same tone, same agreed actions.", "Always edit the AI drafts: add the real names, dates and your own judgement before anything is sent.", "Keep the internal report frank; keep the supplier-facing notes firm but collaborative."] },
      { id: "2.6lab", sub: "2.6", type: "promptlab", title: "Prompt Engineering Lab — build your prompt library",
        brief: "Generative AI as your co-pilot. Write your OWN prompt for five everyday procurement tasks, test them on the Northwind supplier data, star your best for the competition, and keep them all as a personal prompt library. This is the takeaway most delegates value most.",
        slots: [
          { key: "exec", label: "Executive briefing", hint: "A five-line, board-ready summary of supplier status and the one decision needed." },
          { key: "review", label: "Supplier review report", hint: "A structured one-pager — performance, risk, commercial position, recommendation." },
          { key: "risk", label: "Risk assessment", hint: "Identify the risks, score them, and recommend a mitigation for each from the data." },
          { key: "meeting", label: "Meeting preparation", hint: "An agenda, the three questions to ask, and your objective and walk-away." },
          { key: "negotiation", label: "Negotiation plan", hint: "Objectives, evidence, concessions to trade, and likely supplier counter-arguments." },
        ],
        output: "Your Personal AI Prompt Library — five prompts you wrote and tested, ready to use at work on day one. Hit 'Copy library' to take it with you.",
        model: ["A strong prompt names the role ('You are a category manager…'), gives real context (the supplier's actual numbers), a precise task, and the exact output format (a table, five bullets, under 150 words).", "Specific beats generic: 'rank by risk and name one mitigation each' returns far more than 'analyse these suppliers'.", "Save the winners — your prompt library is the fastest way to get value from AI back at work on Monday."] },
      { id: "2lab", sub: "Lab", type: "lab", title: "Prompt Lab — practise the skills",
        chain: { lead: "Take the segmentation from 2.1 and push it further.", prompt: "Here is my supplier segmentation: [paste]. For the Strategic tier only, draft a 90-day relationship plan for each supplier in five bullets." },
        writeOwn: { task: "Build a prompt to design a supplier scorecard with the five metrics that matter.", role: "a supplier-performance analyst", context: "For a key supplier and what you buy from them.", task2: "Design a one-page scorecard.", format: "A table of metric, why it matters, how measured." },
        stretch: "Feed the risk ranking from 2.3 back and ask: what tier-2 (sub-tier) risks might I still be blind to?" },
      { id: "2case", sub: "Case", type: "case", title: "Northwind case — Supplier Strategy & Risk",
        scenario: "After a near-miss with a single-source supplier, the CPO asks for a supplier review and how AI-enabled SRM would help.",
        tasks: ["Segment the named suppliers.", "Identify the top three risks and their drivers.", "Show how AI improves performance and collaboration for the strategic tier.", "Recommend one transparency principle."],
        rubric: ["Segments on risk and single-source, not spend alone", "Top risks named with their real drivers", "Shows AI improving performance AND collaboration for strategic suppliers", "Includes a transparency principle a supplier would accept"],
        deliverable: "A one-page supplier strategy. Add the strongest AI ideas to your Backlog.", to: "backlog" },
    ],
  },
  {
    n: 3, title: "Contract & Risk", theme: "Lifecycle · Negotiation · Risk · CLM · Ethics",
    objectives: ["Apply AI across the lifecycle", "Prepare to negotiate", "Identify contract risk", "Understand CLM automation", "Apply ethics in contracting"],
    takeaway: "Find one of your own contracts on silent auto-renew, and put its next notice deadline in your calendar before it re-locks.",
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
        rubric: ["Ranks by liability / exit / price risk, not contract value", "Flags Helios (uncapped, no exit) and Aurora (no signed terms) as urgent", "Shows CLM monitoring stopping recurrence at scale", "States a clear 'AI proposes, a human approves' rule"],
        deliverable: "A one-page contract-risk plan. Carry the best ideas into your Backlog.", to: "backlog" },
      { id: "3.6cr", sub: "3.6", type: "risk", title: "Hidden Risk Challenge — the £15m contract",
        brief: "Northwind is about to sign a £15m national logistics contract. You get the one-page extract. First, Round 1: spot the genuine risk clauses yourself (some terms are perfectly standard — don't flag those). Score the overall risk and note how you'd fix it. Then Round 2: run the AI contract review and compare.",
        scenario: "A £15m, three-year national logistics contract is on the desk for signature next week. Procurement has called it 'standard' and wants a quick sign-off. Before you initial it, review the key terms below — Round 1 is your eyes only; Round 2 you compare with the AI.",
        signs: [
          "Unlimited supplier liability — no cap on the supplier's exposure",
          "No data protection / GDPR clause",
          "No service credits if delivery SLAs are missed",
          "Weak, supplier-favourable termination rights",
          "Ambiguous delivery obligation — 'reasonable endeavours', no fixed times",
          "No cybersecurity or information-security requirements",
          "Payment terms: 30 days from valid invoice",
          "Governing law: England & Wales; disputes in the English courts",
        ],
        real: [
          "Unlimited supplier liability — no cap on the supplier's exposure",
          "No data protection / GDPR clause",
          "No service credits if delivery SLAs are missed",
          "Weak, supplier-favourable termination rights",
          "Ambiguous delivery obligation — 'reasonable endeavours', no fixed times",
          "No cybersecurity or information-security requirements",
        ],
        prompt: "You are a commercial contracts lawyer reviewing a £15m, three-year national logistics contract for the buyer. Identify the key risks in these terms and, for each, give the potential impact and a recommended change:\n\n- Liability: unlimited, uncapped supplier liability.\n- Data protection: no GDPR / data-protection clause.\n- Service levels: no service credits for missed delivery SLAs.\n- Termination: weak, supplier-favourable termination rights.\n- Delivery: 'reasonable endeavours', no fixed delivery times.\n- Security: no cybersecurity / information-security requirements.\n- Payment: 30 days from valid invoice. Governing law: England & Wales.\n\nReturn a risk table (Risk · Potential impact · Recommended action), an overall risk rating out of 10, and the three clauses you would not sign without.",
        output: "A marked-up risk list for the £15m contract — your findings, the AI's, and the clauses you'd refuse to sign without. Take the prompt back to work and run it on a real (anonymised) contract.",
        model: [
          "AI contract analysis flags: missing GDPR/data-protection obligations; unlimited liability exposure; no service-credit mechanism; undefined disaster-recovery / cybersecurity requirements; weak supplier performance obligations; no audit rights; ambiguous termination provisions.",
          "The 30-day payment terms and England & Wales governing law are standard — not risks. The real skill is separating genuine risk from boilerplate, not flagging everything.",
          "Overall this is a high-risk draft (≈8–9/10): uncapped liability + no data protection + no security on a £15m contract that handles Northwind's data and deliveries.",
          "Don't sign without: a liability cap, a GDPR/data-protection clause, and security requirements — plus service credits to give the SLA teeth.",
          "Learning point: AI reviews a contract in seconds and rarely misses a standard clause — but a human still owns the commercial trade-offs and the signature. AI proposes; a person approves." ] },
      { id: "3.7itt", sub: "3.7", type: "pack", title: "AI Tender Generator — build an ITT in minutes",
        brief: "Northwind needs a new national transport provider. Instead of a blank page, generate a complete Invitation to Tender (ITT) with AI — six building blocks — then assemble and quality-check it. Race a flipchart 'human-only' team: a strong first draft in minutes, not days.",
        scenario: "The brief: a nationwide transport contract requiring 98% on-time delivery, sustainability targets, monthly reporting and cybersecurity compliance. Generate each ITT section with AI, mark it done, and paste the output to assemble your tender pack.",
        items: [
          { key: "qual", label: "Supplier qualification questions", prompt: "You are a procurement lead drafting an ITT for a national transport contract. Write the supplier qualification (PQQ) section: questions on financial stability, fleet size and national coverage, accreditations, insurance, references and business continuity. Group them and mark any that are pass/fail." },
          { key: "criteria", label: "Evaluation criteria & weightings", prompt: "Design the evaluation criteria and weightings for a national transport ITT. Include price, on-time-delivery capability, sustainability, cybersecurity, service management and social value. Give a weighting for each (totalling 100%) and a 0–5 scoring guide." },
          { key: "kpis", label: "KPIs & SLAs", prompt: "Define the KPIs and SLAs for a national transport contract, including a 98% on-time-delivery target and monthly reporting. For each KPI give the measure, the target, the reporting frequency and the consequence of missing it (e.g. service credits)." },
          { key: "sustain", label: "Sustainability requirements", prompt: "Write the sustainability requirements for a national transport ITT: carbon reporting, a fleet-decarbonisation roadmap, Scope 3 data, packaging and any social-value commitments. Make each requirement measurable." },
          { key: "risk", label: "Risk management requirements", prompt: "Write the risk-management requirements for a national transport ITT: business continuity and disaster recovery, cybersecurity and data protection (GDPR), liability and insurance, and sub-contractor / multi-tier risk. State the evidence suppliers must provide." },
          { key: "mgmt", label: "Contract management expectations", prompt: "Define the contract-management expectations for a national transport contract: governance and review cadence, performance reporting, continuous improvement, relationship management, and exit / transition arrangements." },
        ],
        output: "A complete ITT pack — qualification, evaluation criteria, KPIs, sustainability, risk and contract management — ready to refine and issue. Score it against a human-only version: count the criteria, the risk coverage and the time taken.",
        model: [
          "AI produces a strong first draft of every ITT section in minutes — the value you add is tailoring it to Northwind: real volumes, the 98% target, your sustainability and cyber standards.",
          "The weightings ARE your strategy: heavier on sustainability and cyber signals what matters; heavier on price signals a cost-led buy.",
          "Good KPIs always pair a target with a consequence (service credits) — a target with no teeth changes nothing.",
          "Don't skip risk: business continuity, GDPR and cybersecurity belong in the ITT, not discovered after signature.",
          "Learning point: AI gets you off the blank page so procurement spends its time improving quality and challenging suppliers — not formatting documents." ] },
      { id: "3.8clm", sub: "3.8", type: "lifecycle", title: "Contract Lifecycle Time Machine — redesign with AI",
        brief: "Northwind manages 5,000 supplier contracts and every stage is slow and manual. As the AI Transformation Team, redesign the lifecycle: for each stage set how far AI could realistically cut the time and name the AI solution. Watch the total cycle shrink live — then pitch the saving. The twist: your AI Capability Card sets the limits.",
        scenario: "Senior management wants to know how AI could transform contract operations across 5,000 contracts. Below is today's cycle time for a single contract. Redesign it: estimate the AI-enabled time for each stage and name what AI does — staying inside your capability card.",
        card: {
          can: ["Analyse contracts & extract terms", "Summarise & compare documents", "Generate draft clauses & reports", "Predict risk & monitor KPIs", "Send alerts & reminders"],
          cannot: ["Approve or sign contracts", "Replace the contract manager's judgement", "Own the supplier relationship"],
        },
        stages: [
          { stage: "Contract drafting", current: "10 days", days: 10, hint: "generate the first draft from a template + requirements" },
          { stage: "Legal review", current: "8 days", days: 8, hint: "flag risky clauses & missing terms for the lawyer" },
          { stage: "Approval process", current: "12 days", days: 12, hint: "route, check policy and chase — a human still approves" },
          { stage: "Renewal review", current: "5 days", days: 5, hint: "summarise performance & flag the notice deadline" },
          { stage: "Performance reporting", current: "3 days", days: 3, hint: "auto-compile the KPI report from the data" },
        ],
        prompt: "You are a contract lifecycle management (CLM) consultant. A manufacturer manages 5,000 supplier contracts. Today's cycle for one contract: drafting 10 days, legal review 8 days, approval 12 days, renewal review 5 days, performance reporting 3 days/month.\n\nRedesign the lifecycle with AI. For each stage give: the AI solution, the realistic new time, and the benefit (time, risk or cash). Then state the total time saved per contract and the implication across 5,000 contracts. Respect these limits — AI can analyse, summarise, generate, predict and monitor, but it must NOT approve or sign contracts, and a human owns the relationship.",
        output: "A redesigned contract lifecycle with an AI solution per stage, the new cycle time, and a headline saving you can pitch to senior management — built within realistic AI limits.",
        model: [
          "The biggest wins are usually drafting (AI first draft), legal review (AI flags clauses) and approval (AI routes & checks, human approves) — together they cut the largest, most manual chunk.",
          "Keep a human in the loop where the card says so: AI prepares the approval, but a person signs. AI proposes; a person disposes.",
          "Performance reporting drops to near-zero with AI (auto-compiled from the data) — and stops being a monthly scramble.",
          "Across 5,000 contracts, a per-contract saving compounds into thousands of days a year — that's the strategic pitch, not the single-contract number.",
          "The real prize isn't speed alone — it's the monitoring AI adds after signature: catching auto-renewals, price escalations and KPI slips that humans miss today." ] },
      { id: "3.9hai", sub: "3.9", type: "signals", title: "Human vs AI vs Human + AI — supplier performance",
        brief: "The classic showdown. You get a supplier's performance data. Round 1: spot the genuine problems yourself. Round 2: run the AI analysis. The real lesson is Round 3 — human judgement on top of AI's pattern-finding almost always wins. Spot the issues, note the risks and the actions, then generate the AI analysis and combine.",
        scenario: "Castore Logistics — £54m/year, a strategic carrier. Last quarter's data landed: on-time delivery fell from 88% to 79%; the defect/damage rate doubled to 2.4%; three SLA breaches (zero a year ago); unit costs up 9% (well above the index); five invoice disputes; and it gave no early notice of any of it. (It also rebranded its website and moved to a new CRM this quarter.)",
        signs: [
          "On-time delivery fell 88% → 79% over the quarter",
          "Defect / damage rate doubled to 2.4%",
          "Three SLA breaches this quarter (zero a year ago)",
          "Unit costs up 9% — well above the index",
          "Five invoice disputes raised",
          "No early notice given on any issue",
          "Rebranded its website",
          "Migrated to a new CRM system",
        ],
        real: [
          "On-time delivery fell 88% → 79% over the quarter",
          "Defect / damage rate doubled to 2.4%",
          "Three SLA breaches this quarter (zero a year ago)",
          "Unit costs up 9% — well above the index",
          "Five invoice disputes raised",
          "No early notice given on any issue",
        ],
        prompt: "You are a supplier-performance analyst. Analyse this supplier's quarter and recommend actions:\n\nCastore Logistics (£54m/year strategic carrier): on-time delivery 88% → 79%; defect/damage rate doubled to 2.4%; three SLA breaches (zero a year ago); unit costs up 9% (above index); five invoice disputes; no early notice given. (It also rebranded its website and changed CRM.)\n\nReturn: the genuine performance problems (ignore cosmetic noise), what they point to, an overall concern level, and a prioritised set of actions for the next supplier review.",
        output: "Three findings side by side — yours, the AI's, and the combined Human + AI recommendation. Compare them: which is strongest, and why?",
        model: [
          "Genuine problems: falling OTD, doubling defects, SLA breaches, above-index cost rises and invoice disputes — and crucially, no early warning. The rebrand and CRM change are noise.",
          "Round 1 (human only): you bring context — you know Castore is strategic and single-lane on some routes, and that 'no early notice' is a relationship problem, not just a data dip.",
          "Round 2 (AI only): fast, structured, catches every metric and ranks them — but it doesn't know what matters most to Northwind or what's politically sensitive.",
          "Round 3 (human + AI): the AI surfaces and quantifies everything in seconds; you weight it, add the relationship read, and decide the action. This is almost always the strongest result.",
          "Learning point: the future isn't human vs AI — it's human + AI. Use AI for breadth, speed and pattern-finding; keep humans for judgement, context and the decision." ] },
      { id: "3.10mind", sub: "3.10", type: "reveal", title: "The Supplier Mind Reader — read the position behind the ask",
        brief: "Northwind is negotiating with a transport provider that wants more money, fewer penalties and a longer term. Round 1: with only the public facts, work out why. Then reveal what AI surfaced about the supplier's real situation — and watch your strategy change.",
        scenario: "Your transport supplier has tabled three requests: an 8% price increase, reduced penalties, and a longer contract term. Before you respond, work out what's really driving it.",
        known: ["Supplier revenue up 2%", "Fuel costs up 3%", "Contract expires in 60 days"],
        round1: [{ key: "why", label: "Round 1 · Why is the supplier making these requests? (use only the facts above)", ph: "e.g. covering rising fuel costs, locking in revenue before the contract ends…" }],
        reveal: [
          "The supplier recently lost a major customer",
          "A new warehouse investment has increased its debt",
          "Shareholders are demanding margin improvement",
          "A competitor is entering its market",
        ],
        round2: [{ key: "strategy", label: "Round 2 · Now you can see the real drivers — how does your negotiation strategy change?", ph: "e.g. they need this contract more than it looked — hold on price, trade term length for better penalties/SLAs and a price cap…" }],
        prompt: "You are a negotiation strategist. Our transport supplier is requesting an 8% price increase, reduced penalties and a longer term. Public information: revenue up 2%, fuel costs up 3%, our contract expires in 60 days. We've also learned the supplier recently lost a major customer, took on debt for a new warehouse, faces shareholder pressure on margin, and a competitor is entering its market. What is the supplier's likely real position and motivation, what leverage do we actually have, and what strategy should we take? Give three concrete moves.",
        output: "A read on the supplier's true motivations — not just its stated position — and a revised negotiation plan that uses the leverage you didn't know you had.",
        model: [
          "Stated position ≠ real motivation. The requests look like cost recovery; the hidden drivers (lost customer, new debt, shareholder pressure, new competitor) say the supplier needs this contract more than we thought.",
          "That flips the leverage: we're a stable, known customer at the exact moment they need certainty. We can hold on price and trade term length for value — better penalties/SLAs and a price cap.",
          "AI's value here is surfacing motivation, not just position — the things the other side won't tell you.",
          "Caveat: validate AI's 'findings' before you bank them — treat them as leads to confirm, not facts to negotiate on blindly.",
          "Learning point: AI helps you negotiate against the real position, not just the one on the table." ] },
      { id: "3.11opt", sub: "3.11", type: "reveal", title: "The £1 Million Decision — model the trade-offs",
        brief: "The supplier has put three options on the table. Round 1: weigh them by hand and pick one. Then reveal the AI scenario model — cost, risk and service impact side by side — and make the call you can defend to the CFO.",
        scenario: "Renewing an £88m/year contract, the supplier offers three paths. Each trades cost against risk and service differently — and the difference is worth more than £1m over the term.",
        known: ["Option A — 8% price increase", "Option B — 3-year extension, no price increase", "Option C — reduced service levels, 2% increase"],
        round1: [{ key: "manual", label: "Round 1 · Evaluate the three options by hand — which would you pick, and what worries you about each?", ph: "e.g. A is simple but costly; B locks the price but ties us in; C is cheap but risky on service…" }],
        reveal: ["AI scenario model — the cost, risk and service impact of each option:"],
        matrix: { cols: ["Option", "Cost impact", "Risk impact", "Service impact"], rows: [["A — 8% increase", "High", "Medium", "None"], ["B — 3-yr extension, no rise", "Low", "Medium", "None"], ["C — reduced service, 2% rise", "Medium", "High", "High"]] },
        round2: [{ key: "rec", label: "Round 2 · With the model in front of you, recommend an option and justify it.", ph: "e.g. Option B — lowest cost impact, no service hit; the medium risk is lock-in, managed with a break clause…" }],
        prompt: "You are a commercial analyst. Model three supplier options for an £88m/year contract and recommend one. Option A: 8% price increase. Option B: 3-year extension with no price increase. Option C: reduced service levels with a 2% increase. For each, assess cost impact, risk impact and service impact, then recommend the best option with a clear justification and one risk to manage.",
        output: "A recommended option backed by an explicit cost/risk/service trade-off — the kind of analysis AI models in seconds that would take a team an afternoon.",
        model: [
          "On the model, Option B is usually strongest: lowest cost impact, no service hit — the main risk is lock-in, which a break clause or mid-term review manages.",
          "Option A is clean but expensive; Option C looks cheap but the high risk + service hit make it the weakest for a strategic contract.",
          "AI's value is making the trade-offs explicit and comparable in seconds — but the recommendation still needs your judgement on what Northwind can live with.",
          "Push the AI: ask it to put each High/Medium/Low into £ and a probability, and to state its assumptions.",
          "Learning point: AI lets negotiators evaluate trade-offs quickly and objectively — then a human owns the decision." ] },
      { id: "3.12clause", sub: "3.12", type: "reveal", title: "Live Clause Battle — negotiate the liability cap",
        brief: "The supplier proposes a liability clause that sounds reasonable. Round 1: spot the risks and draft your alternative. Then reveal the AI analysis and benchmark — and table the final wording.",
        scenario: "The supplier proposes: \"Supplier liability shall be limited to the annual contract value.\" It's a £15m/year contract that carries data-protection and cybersecurity obligations.",
        known: ["Proposed clause: \"Supplier liability shall be limited to the annual contract value.\"", "Contract value: £15m/year", "The contract involves data and cybersecurity obligations"],
        round1: [
          { key: "risks", label: "Round 1 · What's wrong with this liability cap for Northwind? (risks, and any benefits)", ph: "e.g. a serious incident could cost far more than one year's value; cyber/data losses aren't covered…" },
          { key: "alt", label: "Your alternative wording", ph: "e.g. liability capped at … times annual value, excluding …" },
        ],
        reveal: [
          "Potential exposure can exceed one year's contract value",
          "A cyber incident could blow straight through the cap",
          "Data breaches are excluded from the cap entirely",
          "Industry benchmark is 2–3× annual contract value",
          "Suggested wording: \"Liability capped at three times annual contract value, excluding fraud, gross negligence and data breaches.\"",
        ],
        round2: [{ key: "final", label: "Round 2 · Negotiate the final clause — what wording do you table, and what's your fallback?", ph: "e.g. open at 3× excluding data breaches/fraud/gross negligence; fall back to 2× with a separate data-breach carve-out…" }],
        prompt: "You are a commercial contracts specialist. A supplier proposes: 'Supplier liability shall be limited to the annual contract value' on a £15m/year contract involving data and cybersecurity obligations. Assess the risks and benefits of this cap, compare it to industry benchmarks, and propose stronger alternative wording for the buyer — noting what must be carved out of any cap.",
        output: "A negotiated liability clause — your wording, the AI's benchmark and carve-outs, and a fallback position ready for the table.",
        model: [
          "A single-year cap is below market: the benchmark is 2–3× annual value, and the big risks (cyber, data breaches) can dwarf one year's fees.",
          "Always carve fraud, gross negligence and data breaches OUT of any cap — those should be uncapped or separately capped.",
          "Strong alternative: \"Liability capped at three times annual contract value, excluding fraud, gross negligence and data breaches.\"",
          "AI gets you to a benchmarked, well-structured position in seconds — you keep the strategy: what to open with, what to trade, where to walk.",
          "Learning point: AI accelerates the legal and commercial analysis so negotiators spend their time on strategy, not clause interpretation." ] },
      { id: "3.13det", sub: "3.13", type: "reveal", title: "Contract Risk Detective — beat the AI on a new contract",
        brief: "A new supplier contract lands. Round 1: your team has 10 minutes to find the risks. Round 2: reveal what the AI found — it surfaces a dozen indicators in seconds, including the ones manual review misses. Then count the cost of doing this across 500 contracts.",
        scenario: "Northwind has received a new supplier contract for signature. The extract below has six obvious problems — but a thorough review finds more. Round 1 is your team's eyes only.",
        known: ["Unlimited liability", "No disaster recovery clause", "Weak service-level wording", "Missing audit rights", "No cybersecurity obligations", "Automatic renewal provision"],
        round1: [{ key: "risks", label: "Round 1 · You have 10 minutes — list the risks (risk · potential impact · recommended action)", ph: "e.g. Unlimited liability → uncapped exposure → cap at 2–3× annual value; auto-renewal → silent re-lock → diarise the notice date…" }],
        reveal: [
          "AI identified 12 risk indicators in seconds — including the ones teams usually miss:",
          "Missing cyber controls",
          "Weak termination rights",
          "Excessive liability exposure",
          "Missing business-continuity requirements",
          "Non-standard indemnity language",
        ],
        round2: [{ key: "missed", label: "Round 2 · Which risks did the AI catch that your team missed — and how long would a manual review take across all 500 contracts?", ph: "e.g. we missed the indemnity wording and business-continuity gap; 500 × 10 min ≈ 83 hours of review…" }],
        prompt: "You are a contract risk reviewer. Review this new supplier contract extract and list every risk indicator, with its potential impact and a recommended action. The extract includes: unlimited liability; no disaster-recovery clause; weak service-level wording; missing audit rights; no cybersecurity obligations; an automatic-renewal provision. Be thorough — also find the non-obvious risks (indemnity language, termination rights, business-continuity gaps). Return a risk table and an overall risk rating.",
        output: "A full risk register for the contract — your manual findings vs the AI's 12 indicators — and the time-saving case for AI review across 500 contracts.",
        model: [
          "AI typically surfaces ~12 indicators here versus the five or six a team finds in 10 minutes — including the subtle ones: indemnity language, termination rights, business-continuity gaps.",
          "The six obvious clauses are the start, not the finish — manual review tires and misses the quiet wording risks, and two reviewers rarely find the same set.",
          "Across 500 contracts at 10 minutes each that's ≈ 83 hours of manual review — AI does the first pass in minutes, identically every time, so people focus on the judgement calls.",
          "Learning point: AI dramatically increases review speed AND consistency — every contract gets the same thorough first pass." ] },
      { id: "3.14pred", sub: "3.14", type: "reveal", title: "Predict the Failure — act before the SLA breaks",
        brief: "You're monitoring a transport supplier. The numbers are still 'green' — but the trend isn't. Round 1: decide whether to escalate. Then reveal the AI forecast and build a plan that acts before the breach, not after.",
        scenario: "Northwind monitors a transport supplier against an 88% on-time-delivery SLA. Here's the last five months. The supplier is still meeting the SLA today.",
        known: ["On-time delivery — Jan 98%, Feb 97%, Mar 95%, Apr 92%, May 89%", "Current SLA threshold: 88%", "The supplier is still meeting its SLA"],
        round1: [{ key: "escalate", label: "Round 1 · Would you escalate? Why or why not? (the SLA is still being met)", ph: "e.g. no — still above 88%, no breach yet … or yes — the trend is the real signal …" }],
        reveal: [
          "AI forecast from the trend:",
          "SLA breach within 30 days",
          "Increased customer complaints",
          "Increased operational costs",
        ],
        round2: [{ key: "plan", label: "Round 2 · The AI predicts a breach within 30 days. Develop a proactive response plan.", ph: "e.g. raise it at this week's review, request a recovery plan, pre-qualify a backup lane, switch to a weekly OTD check…" }],
        prompt: "You are a supplier-performance analyst. A transport supplier's on-time delivery has fallen each month: Jan 98%, Feb 97%, Mar 95%, Apr 92%, May 89%. The SLA threshold is 88% — still being met. Forecast where this trend leads, when an SLA breach is likely, the knock-on impacts (complaints, cost), and a proactive response plan to act before the breach occurs.",
        output: "A proactive response plan that acts on the trend — not the threshold — so you intervene before the SLA breaks, not after.",
        model: [
          "The number is still 'green' (89% > 88%) but the trend is unmistakable: roughly 2–3 points lost every month points to a breach within about 30 days.",
          "Most teams say 'don't escalate' because the SLA is met — that's exactly the trap. A lagging threshold only tells you once it's too late.",
          "AI reads the direction of travel and forecasts the breach, the complaints and the cost rise before they land.",
          "Proactive plan: raise it now, request a supplier recovery plan, pre-qualify a backup lane, and switch from a monthly to a weekly check until it recovers.",
          "Learning point: AI helps you act before failures occur — manage the trend, not the threshold." ] },
      { id: "3.15cmd", sub: "3.15", type: "pick", title: "Build the AI Risk Command Centre — choose your vital signs",
        brief: "Design Northwind's AI-powered contract-risk dashboard. The catch: you can monitor only 10 indicators. Choose your vital few, name the command centre, and pitch why they matter and what the AI should predict. Favour leading signals over lagging ones.",
        scenario: "You've been asked to design an AI risk dashboard monitoring 500+ suppliers continuously. Compute and screen real-time is limited — pick the 10 indicators that best predict trouble.",
        options: ["Supplier profitability", "Credit rating", "Delivery performance", "SLA breaches", "Contract expiry dates", "Regulatory changes", "Cyber incidents", "ESG compliance", "Staff turnover", "Inventory shortages", "Customer complaints", "Pricing changes", "Audit findings", "Litigation activity", "Force majeure events"],
        limit: 10,
        nameLabel: "Name your command centre",
        namePh: "e.g. Northwind Supplier Risk Radar",
        asks: [
          { key: "why", label: "Why do these matter most? (your selection rationale)", ph: "e.g. we weighted leading financial + cyber signals over lagging delivery metrics…" },
          { key: "predict", label: "What should the AI predict or alert on from these indicators?", ph: "e.g. supplier-failure risk score, probability of SLA breach, renewals at risk, cost-escalation alerts…" },
        ],
        prompt: "You are designing an AI-powered contract-risk dashboard for a manufacturer monitoring 500+ suppliers. From these candidate indicators — supplier profitability, credit rating, delivery performance, SLA breaches, contract expiry dates, regulatory changes, cyber incidents, ESG compliance, staff turnover, inventory shortages, customer complaints, pricing changes, audit findings, litigation activity, force majeure — recommend the 10 most valuable to monitor continuously, explain why each earns its place, and state what the AI should predict or alert on. Favour leading indicators over lagging ones.",
        output: "A named risk command centre — your 10 indicators, the rationale, and what the AI predicts — ready to pitch to senior management.",
        model: [
          "Balance leading and lagging: lagging signals (SLA breaches, delivery performance, complaints, audit findings) tell you what already happened; leading signals (credit rating, profitability, staff turnover, cyber incidents, litigation, pricing changes) warn you before it does.",
          "A defensible 10 usually keeps: credit rating, supplier profitability, delivery performance, SLA breaches, contract expiry, cyber incidents, regulatory changes, litigation activity, pricing changes and customer complaints — covering financial, operational, compliance and cyber.",
          "What AI predicts: a supplier-failure risk score, probability of SLA breach, renewals/notice deadlines at risk, and cost-escalation alerts — updated continuously, not quarterly.",
          "You can't watch everything — the discipline is choosing the 10 signals that best predict failure, which is exactly how a risk model is built.",
          "Learning point: continuous AI monitoring turns a periodic manual review into a live early-warning system." ] },
    ],
  },
  {
    n: 4, title: "Supply-Chain Efficiency", theme: "Forecasting · Inventory · Automation · Logistics · Visibility",
    objectives: ["Forecast demand better", "Optimise inventory", "Automate high-value work", "Apply AI to logistics", "Build visibility"],
    takeaway: "Identify your highest-volume manual task and estimate, even roughly, what touchless processing would save in time and cost.",
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
        rubric: ["Targets the worst forecast and dead-stock categories first", "Sequences actions by payback — fastest cash first", "Ties it together with a control tower built from existing data", "Flags where efficiency creates fragility, with a safeguard"],
        deliverable: "A one-page efficiency plan. Add the strongest items to your Backlog.", to: "backlog" },
    ],
  },
  {
    n: 5, title: "Future & Strategy", theme: "Trends · Sustainability · Resilience · Roadmap · People",
    objectives: ["Anticipate AI trends", "Apply AI to sustainability", "Build resilience", "Build your roadmap", "Lead the people change"],
    takeaway: "Write the one-sentence, honest 'why' you'd give your own team about AI — and name one skill you'll start building.",
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
        rubric: ["Maps every initiative to a board goal", "Phases foundations → quick wins → scale → transform", "Addresses people, ethics and governance — not just the tech", "Leads with the data foundation that unlocks the rest", "Reads as a crisp one-pager a board could act on"],
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

/* ================= PROCUREMENT FRAMEWORK DIAGRAMS ================= */
function FlowArrow() { return <div style={{ flexShrink: 0, color: C.muted, fontSize: 18, fontWeight: 700, alignSelf: "center" }}>›</div>; }
function Stage({ title, ai, color, badge, badgeColor }) {
  return (
    <div style={{ flex: "0 0 auto", minWidth: 108, maxWidth: 150, border: `1px solid ${C.line}`, borderTop: `3px solid ${color || C.teal}`, borderRadius: 9, padding: "8px 10px", background: "#fff" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>{title}{badge && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: badgeColor || C.amber, borderRadius: 5, padding: "1px 5px" }}>{badge}</span>}</div>
      {ai && <div style={{ fontSize: 11, color: C.body, marginTop: 4, lineHeight: 1.35 }}><span style={{ color: C.teal, fontWeight: 700 }}>AI:</span> {ai}</div>}
    </div>
  );
}
function FlowRow({ children }) {
  return <div style={{ display: "flex", gap: 6, alignItems: "stretch", overflowX: "auto", paddingBottom: 6 }}>{children}</div>;
}
function S2PMap() {
  const up = [["Identify need", "spot demand & consolidation"], ["Specify", "draft specs from requirements"], ["Source / tender", "find & shortlist suppliers"], ["Evaluate", "score bids objectively"], ["Negotiate", "prep strategy & counters"], ["Contract", "draft & risk-flag clauses"]];
  const down = [["Requisition", "guided, on-contract buying"], ["Purchase order", "auto-create & send"], ["Receive", "match goods to the PO"], ["Invoice", "touchless 3-way match"], ["Pay", "capture early-pay discounts"]];
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.teal, margin: "0 0 6px" }}>SOURCE → CONTRACT &nbsp;(upstream · strategic)</div>
      <FlowRow>{up.map(([t, a], i) => <React.Fragment key={t}>{i > 0 && <FlowArrow />}<Stage title={t} ai={a} color={C.teal} /></React.Fragment>)}</FlowRow>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.amber, margin: "12px 0 6px" }}>PROCURE → PAY &nbsp;(downstream · operational)</div>
      <FlowRow>{down.map(([t, a], i) => <React.Fragment key={t}>{i > 0 && <FlowArrow />}<Stage title={t} ai={a} color={C.amber} /></React.Fragment>)}</FlowRow>
      <div style={{ marginTop: 12, fontSize: 12, color: C.muted, lineHeight: 1.5 }}><strong style={{ color: C.navy }}>Across the week:</strong> Day 1 frames the whole cycle · Day 2 suppliers & sourcing · Day 3 contracts · Day 4 procure-to-pay & supply chain · Day 5 the strategy across all of it.</div>
    </div>
  );
}
function CLMFlow() {
  const stages = [["Request", "intake & triage", null], ["Draft", "clause generation", null], ["Approve", "policy & risk checks", null], ["Sign", "e-signature", null], ["Store", "central repository", null], ["Monitor", "alerts, renewals, obligations", "WEAK SPOT"]];
  return (
    <div>
      <FlowRow>{stages.map(([t, a, b], i) => <React.Fragment key={t}>{i > 0 && <FlowArrow />}<Stage title={t} ai={a} color={b ? C.amber : C.deep} badge={b} badgeColor={C.red} /></React.Fragment>)}</FlowRow>
      <div style={{ marginTop: 10, fontSize: 12, color: C.muted, lineHeight: 1.5 }}><strong style={{ color: C.navy }}>Northwind's gap:</strong> contracts get signed, then drift — nobody owns the post-signature <em>Monitor</em> stage. That's where auto-renews silently re-lock and value leaks, and the highest-value place to add AI.</div>
    </div>
  );
}
function SupplyChainFlow() {
  const nodes = [["~3,200 suppliers", "risk monitoring"], ["Inbound logistics", "ETA prediction"], ["6 plants", "demand forecasting"], ["9 DCs", "inventory optimisation"], ["Customers", "dynamic routing & service"]];
  return (
    <div>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 9, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <Cpu size={15} color={C.gold} /> AI control tower — one end-to-end view that predicts and flags disruption across all four ERPs
      </div>
      <FlowRow>{nodes.map(([t, a], i) => <React.Fragment key={t}>{i > 0 && <FlowArrow />}<Stage title={t} ai={a} color={C.teal} /></React.Fragment>)}</FlowRow>
      <div style={{ marginTop: 10, fontSize: 12, color: C.muted, lineHeight: 1.5 }}><strong style={{ color: C.navy }}>The blind spot:</strong> four separate ERPs mean Northwind often only learns of a problem when a delivery fails. A control tower built from data it already holds turns that from reactive to predictive.</div>
    </div>
  );
}
function SRMMatrix() {
  const sup = SUPPLIERS.filter((s) => !s.name.startsWith("Tail"));
  const X0 = 46, X1 = 300, Y0 = 24, Y1 = 232, midX = (46 + 300) / 2, midY = (24 + 232) / 2;
  const px = (spend) => X0 + Math.min(1, spend / 90) * (X1 - X0);
  // spread suppliers vertically *within* their risk band so same-risk dots don't stack on one line
  const base = { High: 3, Medium: 2, Low: 1 };
  const score = (s) => {
    let w = (s.single ? 0.12 : 0) + ({ Critical: 0.1, Important: 0, Routine: -0.1 }[s.importance] || 0) + ({ High: 0.04, Medium: 0, Low: -0.04 }[s.carbon] || 0);
    w = Math.max(-0.18, Math.min(0.18, w));
    return Math.max(1, Math.min(3.5, (base[s.risk] || 2) + w));
  };
  const py = (sc) => Y1 - ((sc - 1) / 2.6) * (Y1 - Y0);
  const dotColor = (s) => s.risk === "High" ? C.red : s.risk === "Medium" ? C.teal : C.muted;
  // lay out labels with simple collision avoidance: nudge each clear of already-placed ones
  const placed = [];
  const pts = sup.map((s) => {
    const x = px(s.spend), y = py(score(s));
    const label = s.name.split(" ")[0] + (s.single ? " *" : "");
    const w = label.length * 4.1 + 6;
    const right = x > X1 - 64;
    const lx = right ? x - 7 : x + 7;
    const left = right ? lx - w : lx, rgt = right ? lx : lx + w;
    let ly = y + 2.6; const dir = y > midY ? -1 : 1; let g = 0;
    while (g++ < 50 && placed.some((q) => !(left > q.rgt || rgt < q.left) && Math.abs(ly - q.ly) < 8.5)) ly += dir * 8.5;
    placed.push({ left, rgt, ly });
    return { s, x, y, label, lx, ly, anchor: right ? "end" : "start" };
  });
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox="0 0 330 272" width="100%" style={{ maxWidth: 540, minWidth: 330, fontFamily: sans }}>
          <rect x={X0} y={Y0} width={midX - X0} height={midY - Y0} fill={C.redl} opacity="0.5" />
          <rect x={midX} y={Y0} width={X1 - midX} height={midY - Y0} fill={C.cardl} />
          <rect x={X0} y={midY} width={midX - X0} height={Y1 - midY} fill={C.light} />
          <rect x={midX} y={midY} width={X1 - midX} height={Y1 - midY} fill={C.greenl} />
          <text x={X0 + 6} y={Y0 + 14} fontSize="9" fontWeight="700" fill={C.amber}>BOTTLENECK</text>
          <text x={X0 + 6} y={Y0 + 24} fontSize="7.5" fill={C.muted}>secure / dual-source</text>
          <text x={midX + 6} y={Y0 + 14} fontSize="9" fontWeight="700" fill={C.teal}>STRATEGIC</text>
          <text x={midX + 6} y={Y0 + 24} fontSize="7.5" fill={C.muted}>partner closely</text>
          <text x={X0 + 6} y={Y1 - 16} fontSize="9" fontWeight="700" fill={C.muted}>ROUTINE</text>
          <text x={X0 + 6} y={Y1 - 6} fontSize="7.5" fill={C.muted}>automate / simplify</text>
          <text x={midX + 6} y={Y1 - 16} fontSize="9" fontWeight="700" fill={C.green}>LEVERAGE</text>
          <text x={midX + 6} y={Y1 - 6} fontSize="7.5" fill={C.muted}>use buying power</text>
          <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={C.line} />
          <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
          <line x1={midX} y1={Y0} x2={midX} y2={Y1} stroke={C.line} strokeDasharray="3 3" />
          <line x1={X0} y1={midY} x2={X1} y2={midY} stroke={C.line} strokeDasharray="3 3" />
          {pts.map(({ s, x, y, label, lx, ly, anchor }) => (
            <g key={s.name}>
              {Math.abs(ly - (y + 2.6)) > 7 && <line x1={x} y1={y} x2={anchor === "end" ? lx : lx} y2={ly - 2.4} stroke={C.line} strokeWidth="0.6" />}
              <circle cx={x} cy={y} r="4.5" fill={dotColor(s)} stroke="#fff" strokeWidth="1.2" />
              <text x={lx} y={ly} fontSize="8" textAnchor={anchor} fill={C.ink} stroke="#fff" strokeWidth="2.6" paintOrder="stroke" style={{ strokeLinejoin: "round" }}>{label}</text>
            </g>
          ))}
          <text x={(X0 + X1) / 2} y={264} fontSize="9" fontWeight="700" fill={C.body} textAnchor="middle">Spend / impact →</text>
          <text x={14} y={(Y0 + Y1) / 2} fontSize="9" fontWeight="700" fill={C.body} textAnchor="middle" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>Supply risk →</text>
        </svg>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: C.muted, lineHeight: 1.5 }}><strong style={{ color: C.navy }}>Read it:</strong> single-source suppliers (*) like Helios and Sahara sit high on risk even on modest spend — which is exactly why you can't segment on spend alone. The top half is where AI risk-monitoring earns its keep.</div>
    </div>
  );
}
// Compact "you are here" strip mapping each day onto the Source-to-Pay cycle.
const S2P_STAGES = ["Identify", "Specify", "Source", "Evaluate", "Negotiate", "Contract", "Requisition", "PO", "Receive", "Invoice", "Pay"];
const DAY_STAGES = { 1: "all", 2: [2, 3, 4], 3: [4, 5], 4: [6, 7, 8, 9, 10], 5: "all" };
function S2PStrip({ activeDay }) {
  const act = DAY_STAGES[activeDay] || [];
  const isOn = (i) => act === "all" ? true : act.includes(i);
  const label = activeDay === 1 ? "framing the whole cycle" : activeDay === 5 ? "strategy across the whole cycle" : activeDay === 2 ? "suppliers & sourcing" : activeDay === 3 ? "contracts" : activeDay === 4 ? "procure-to-pay & supply chain" : "";
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, color: C.teal, marginBottom: 7 }}>WHERE WE ARE THIS WEEK · DAY {activeDay}{label ? ` — ${label}` : ""}</div>
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
        {S2P_STAGES.map((s, i) => {
          const on = isOn(i);
          return (
            <React.Fragment key={s}>
              {i === 6 && <div style={{ alignSelf: "center", color: C.line, fontSize: 15, padding: "0 2px" }}>|</div>}
              <div style={{ flex: "0 0 auto", fontSize: 11, fontWeight: on ? 700 : 600, padding: "5px 9px", borderRadius: 7, whiteSpace: "nowrap", background: on ? C.teal : "#fff", color: on ? "#fff" : C.muted, border: `1px solid ${on ? C.teal : C.line}` }}>{s}</div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: C.muted, fontWeight: 700, marginTop: 3, padding: "0 2px" }}><span>SOURCE → CONTRACT</span><span>PROCURE → PAY</span></div>
    </div>
  );
}
const FRAMEWORK = {
  1: { t: "The big picture — Source-to-Pay", C: S2PMap },
  2: { t: "Framework — supplier segmentation (risk × spend)", C: SRMMatrix },
  3: { t: "Framework — the contract lifecycle (CLM)", C: CLMFlow },
  4: { t: "Framework — the supply chain & AI control tower", C: SupplyChainFlow },
};

/* ================= EXPLORE ================= */
const EX_TABS = ["Profile", "Frameworks", "Suppliers", "Performance", "Contracts", "Demand", "Logistics", "Emissions", "Signals", "Glossary"];
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
        <div style={{ display: "grid", gap: 16 }}>
          <Card style={{ borderTop: `4px solid ${C.navy}` }}>
            <H size={18} style={{ marginBottom: 8 }}>The situation</H>
            <p style={{ color: C.body, fontSize: 14.5, lineHeight: 1.6, margin: "0 0 10px" }}>{NW_STORY.intro}</p>
            <p style={{ color: C.body, fontSize: 14.5, lineHeight: 1.6, margin: "0 0 10px" }}>{NW_STORY.burning}</p>
            <p style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{NW_STORY.mandate}</p>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 8 }}>The board's four-part mandate</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{MANDATE.map(([g, col]) => <Pill key={g} bg={col} fg="#fff">{g}</Pill>)}</div>
            </div>
          </Card>
          <Card>
            <H size={16} style={{ marginBottom: 12 }}>At a glance</H>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
              {PROFILE.map(([k, v]) => (
                <div key={k} style={{ borderLeft: `3px solid ${C.teal}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 14.5, color: C.ink }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <H size={16} style={{ marginBottom: 4 }}>Baseline KPIs</H>
            <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 12px" }}>Where Northwind stands today — your reference for sizing the value of any AI opportunity.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
              {BASELINE.map(([k, v]) => (
                <div key={k} style={{ borderLeft: `3px solid ${C.amber}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 14, color: C.ink }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ background: C.light }}>
            <H size={16} style={{ marginBottom: 4 }}>Data & systems maturity</H>
            <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 12px" }}>The foundation almost every AI opportunity this week depends on.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
              {MATURITY.map(([k, v]) => (
                <div key={k} style={{ borderLeft: `3px solid ${C.deep}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 14, color: C.ink }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: C.navy, fontWeight: 600, margin: "12px 0 0" }}>The recurring lesson: clean, connected data is the foundation — fix it first, and most AI ideas become possible.</p>
          </Card>
        </div>
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
          <H size={15} style={{ margin: "18px 0 8px" }}>Additional supplier data</H>
          <div style={{ overflowX: "auto" }}>
            <Table cols={[
              { key: "name", label: "Supplier", render: (r) => <strong style={{ color: C.navy }}>{r.name}</strong> },
              { key: "group", label: "Category group" }, { key: "terms", label: "Payment terms" },
              { key: "importance", label: "Strategic importance", render: (r) => <Pill bg={r.importance === "Critical" ? C.navy : r.importance === "Important" ? C.teal : C.cardl} fg={r.importance === "Routine" ? C.navy : "#fff"}>{r.importance}</Pill> },
              { key: "carbon", label: "Carbon intensity", render: (r) => <Pill bg={r.carbon === "High" ? C.amber : r.carbon === "Medium" ? C.cardl : C.light} fg={r.carbon === "High" ? "#fff" : C.navy}>{r.carbon}</Pill> },
            ]} rows={supRows} />
          </div>
          <p style={{ fontSize: 11.5, color: C.muted, marginTop: 8, fontStyle: "italic" }}>Carbon intensity: High = energy-intensive materials (steel, polymers, castings); Medium = components, logistics; Low = IT/services, fasteners.</p>
        </div>
      )}
      {tab === "Performance" && (
        <div>
          <div style={{ overflowX: "auto" }}>
            <Table cols={[
              { key: "name", label: "Supplier", render: (r) => <strong style={{ color: C.navy }}>{r.name}</strong> },
              { key: "prior", label: "Prior qtr" }, { key: "onTime", label: "Current" },
              { key: "change", label: "Change", render: (r) => <span style={{ color: C.red, fontWeight: 700 }}>{r.change}</span> },
              { key: "defect", label: "Defect rate" }, { key: "lead", label: "Lead-time trend" }, { key: "resp", label: "Responsiveness" },
            ]} rows={Object.entries(PERFORMANCE).map(([name, p]) => ({ name, ...p }))} />
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 10, fontStyle: "italic" }}>A negative change combined with worsening lead-time or rising defects is the early-warning pattern. Aurora (−7pp, volatile, 3.1% defects) stands out across all four indicators.</p>
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
          <H size={15} style={{ margin: "18px 0 8px" }}>Action dates</H>
          <div style={{ overflowX: "auto" }}>
            <Table cols={[
              { key: "ref", label: "Ref", render: (r) => <strong style={{ color: C.navy }}>{r.ref}</strong> },
              { key: "supplier", label: "Supplier" }, { key: "term", label: "Term & renewal" },
              { key: "deadline", label: "Next deadline" },
              { key: "actionBy", label: "Action required by", render: (r) => <span style={{ color: r.actionBy === "Immediate" ? C.red : C.body, fontWeight: r.actionBy === "Immediate" ? 700 : 400 }}>{r.actionBy}</span> },
            ]} rows={CONTRACTS} />
          </div>
          <p style={{ fontSize: 11.5, color: C.muted, marginTop: 8, fontStyle: "italic" }}>'Action required by' = the date notice must be served to prevent automatic renewal or to meet exit terms. Aurora's terms have lapsed — act immediately. Meridian index: European hot-rolled coil steel, up 4–6% in 2024–25; Meridian operating margin stable at ~14%.</p>
        </div>
      )}
      {tab === "Demand" && (
        <div style={{ overflowX: "auto" }}>
          <Table cols={[
            { key: "cat", label: "Category", render: (r) => <strong style={{ color: C.navy }}>{r.cat}</strong> },
            { key: "method", label: "Method" }, { key: "acc", label: "Accuracy" }, { key: "inv", label: "Inv £m", align: "right" }, { key: "svc", label: "Service" },
            { key: "writeoff", label: "Write-off risk £m", align: "right", render: (r) => <span style={{ color: r.writeoff >= 2 ? C.amber : C.body, fontWeight: r.writeoff >= 2 ? 700 : 400 }}>{r.writeoff}</span> },
            { key: "issue", label: "Main issue" },
          ]} rows={DEMAND} />
          <p style={{ fontSize: 11.5, color: C.muted, marginTop: 8, fontStyle: "italic" }}>Total inventory ≈ £150m; obsolescence write-offs ≈ £9m/yr. Promotional and new-product lines carry the highest write-off risk. Safety stock is one blanket rule across all sites.</p>
        </div>
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
      {tab === "Frameworks" && (
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ color: C.muted, fontSize: 13.5, margin: "-4px 0 0", lineHeight: 1.5 }}>The standard procurement frameworks behind the week — see where AI plugs into each stage. The relevant one also appears at the top of its day's missions.</p>
          <Card style={{ borderTop: `4px solid ${C.teal}` }}><H size={16} style={{ marginBottom: 12 }}>Source-to-Pay — the procurement spine</H><S2PMap /></Card>
          <Card style={{ borderTop: `4px solid ${C.amber}` }}><H size={16} style={{ marginBottom: 12 }}>SRM — supplier segmentation (risk × spend)</H><SRMMatrix /></Card>
          <Card style={{ borderTop: `4px solid ${C.navy}` }}><H size={16} style={{ marginBottom: 12 }}>Supply chain & AI control tower</H><SupplyChainFlow /></Card>
          <Card style={{ borderTop: `4px solid ${C.deep}` }}><H size={16} style={{ marginBottom: 12 }}>Contract lifecycle (CLM)</H><CLMFlow /></Card>
        </div>
      )}
      {tab === "Signals" && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <H size={16} style={{ marginBottom: 4 }}>Market signals</H>
            <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 12px" }}>The external context the exercises assume — useful for negotiation prep (Day 3) and risk work (Day 2).</p>
            <div style={{ display: "grid", gap: 10 }}>
              {BENCHMARKS.map(([k, v]) => (
                <div key={k} style={{ borderLeft: `3px solid ${C.teal}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>{k}</div>
                  <div style={{ fontSize: 13.5, color: C.body }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <H size={16} style={{ marginBottom: 4 }}>Supplier external signals</H>
            <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 12px" }}>Financial health, news and sub-tier exposure — the kind of signal AI-enabled risk monitoring would add, since none of this sits in Northwind's ERPs today.</p>
            <div style={{ overflowX: "auto" }}>
              <Table cols={[
                { key: "name", label: "Supplier", render: (r) => <strong style={{ color: C.navy }}>{r.name}</strong> },
                { key: "health", label: "Financial health", render: (r) => <span style={{ color: r.health.startsWith("Green") ? C.green : r.health.startsWith("Amber") ? C.amber : C.muted, fontWeight: 600 }}>{r.health}</span> },
                { key: "news", label: "Recent news" }, { key: "subtier", label: "Sub-tier (tier-2) exposure" },
              ]} rows={Object.entries(SUPPLIER_SIGNALS).map(([name, s]) => ({ name, ...s }))} />
            </div>
          </Card>
        </div>
      )}
      {tab === "Glossary" && (
        <Card>
          <H size={18} style={{ marginBottom: 4 }}>Key terms</H>
          <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px" }}>Plain-English definitions for the language used across the week — no prior procurement or AI background needed.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {GLOSSARY.map(([term, def]) => (
              <div key={term} style={{ border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.teal}`, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{term}</div>
                <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}>{def}</div>
              </div>
            ))}
          </div>
        </Card>
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
  classify: { c: C.teal, t: "Sort it", how: "Tap an item to pick it up, then tap the column where it belongs. Place them all, then press Check answer.", gain: "Builds your instinct for where AI should automate, assist, or stay out of the way." },
  spot: { c: C.amber, t: "Spot it", how: "Select the option(s) you think are right, then press Check answer to see how you did.", gain: "Sharpens quick, evidence-based judgement on real supplier and contract data." },
  reflect: { c: C.deep, t: "Think it through", how: "Read the prompts and type your thinking in the answer box — there's no single right answer. Reveal the model answer when you're done.", gain: "Turns the ideas into your own words and decisions you can defend to the business." },
  ai: { c: C.gold, t: "AI practical", how: "Copy the prompt into any AI tool, run it, then tick off what a strong answer should contain. Note what you learned.", gain: "Builds hands-on prompting skill you can take straight back to your real work." },
  lab: { c: C.mint, t: "Prompt Lab", how: "Work through each step — chain a prompt onto earlier work, then build your own using the four-part recipe.", gain: "Makes you fluent at writing effective prompts from scratch." },
  case: { c: C.navy, t: "Case challenge", how: "Read the brief, work through each task and tick it off, then capture your output where it points you.", gain: "Pulls the day's skills together on a realistic, end-to-end Northwind challenge." },
  pain: { c: C.deep, t: "Map the pain", how: "List your real supplier-management tasks, set hours/month and a 1–5 pain score, mark where AI could help, then capture three opportunities and send them to your Backlog.", gain: "Turns 'AI is interesting' into 'here's exactly where AI pays off for me' — grounded in your own work." },
  segment: { c: C.teal, t: "You vs AI", how: "Pick a tier for each supplier yourself first, then run the AI prompt, record the AI's tiers, and compare where you agree and differ.", gain: "Sharpens your judgement on a richer segmentation model — and the habit of testing your call against the AI's." },
  discovery: { c: C.teal, t: "Supplier discovery", how: "Define your requirements, generate an AI search prompt, build a supplier longlist from the AI's results, then use AI to rank and recommend — validating each step yourself.", gain: "Shows how AI compresses days of supplier market research into minutes — while you stay the gatekeeper on validation and final choice." },
  health: { c: C.amber, t: "Health check", how: "Judge each supplier's health from its KPIs yourself, then run the AI prompt, record its verdicts and compare — and note an action for each underperformer.", gain: "Trains evidence-based performance judgement and the habit of reading the trend, not just the headline number." },
  risk: { c: C.red, t: "Risk detective", how: "Spot the genuine warning signs, score the risk out of 10, write a mitigation and a contingency plan, then run the AI and compare with its risk register.", gain: "Builds the instinct to read early-warning signals and turn them into a concrete, defensible risk response." },
  pack: { c: C.mint, t: "Comms pack", how: "From one supplier scenario, generate four communication documents with AI — invitation, agenda, review report and follow-up — ticking each off and pasting the result to assemble your pack.", gain: "Shows how AI turns a two-hour writing job into a 15-minute one you can use the day after the course." },
  develop: { c: C.teal, t: "Turnaround", how: "Set six-month targets for an underperforming supplier, generate a development programme with AI (milestones, KPIs, owners), then have AI estimate the cost impact, savings and ROI — and record the numbers.", gain: "Turns 'this supplier is poor' into a costed, time-bound improvement plan you could put to a supplier and a CFO." },
  innovate: { c: C.gold, t: "Innovation sprint", how: "Take a cost-and-sustainability challenge, sprint with AI for supplier-led innovation ideas, then pitch your best one: the idea, expected savings and implementation effort.", gain: "Practises using AI as an ideation partner — and turning a raw idea into a crisp, pitchable proposal." },
  promptlab: { c: C.gold, t: "Prompt lab", how: "Write your own prompt for each of five procurement tasks using the four-part recipe (role · context · task · format), test them in AI Chat, star your best, and copy your personal prompt library to keep.", gain: "The course's most reusable takeaway — a library of prompts you wrote and tested, ready for day-one use at work." },
  scorecard: { c: C.teal, t: "Scorecard", how: "Set the category weights so they total 100%, then use AI to score and rank the suppliers and recommend actions — and copy the weighting model as a reusable template.", gain: "Gives you a weighted supplier scorecard you designed and can run every quarter back in the office." },
  signals: { c: C.amber, t: "Weak signals", how: "Spot the genuine early-warning signals (don't be fooled by good past metrics), note the future risks and the actions to take now, then generate the AI early-warning report.", gain: "Trains you to catch weak signals before the scorecard turns red — the heart of predictive supplier management." },
  healthscore: { c: C.teal, t: "Predictive score", how: "Set the factor weights and the model converts each supplier's data into sub-scores, applies your weights and ranks them live — change a weight and watch the ranking move.", gain: "Shows exactly how predictive scoring works, and sets up how AI does the same thing continuously across far more signals." },
  concentration: { c: C.red, t: "Hidden risk", how: "Reveal the Tier-2 mapping behind your 'diversified' suppliers, then capture the hidden risk, the consequences and the mitigations — and check with AI.", gain: "Shows why Tier-1 diversification can hide a single point of failure deeper in the chain — and how AI surfaces it." },
  riskscore: { c: C.red, t: "Risk heat map", how: "Weight four risk dimensions and the model builds a live risk heat map and ranking — then compare with the AI's prioritisation.", gain: "Turns scattered risk ratings into one prioritised heat map so you focus on the suppliers that matter most." },
  crisis: { c: C.red, t: "Crisis sim", how: "Read the AI alert, then build your 24-hour, 30-day and 12-month response as the leadership team, pressure-test it with AI, and present.", gain: "Practises turning an AI risk alert into a real resilience and business-continuity plan under time pressure." },
  friction: { c: C.amber, t: "Friction map", how: "Map each supplier interaction and its current process, mark the friction level (high/medium/low), then ask AI where to remove the friction.", gain: "Turns vague 'suppliers are frustrated' into a concrete map of where AI can speed things up." },
  innovsprint: { c: C.gold, t: "Innovation lab", how: "Pick a challenge, generate supplier-led ideas with AI, score each on four criteria, choose the best and build a short business case to present.", gain: "Practises running a structured buyer-supplier innovation sprint with AI as the idea engine." },
  lifecycle: { c: C.teal, t: "Time machine", how: "For each contract-lifecycle stage, set the AI-enabled time and name the AI solution — staying inside your AI capability card — and watch the total cycle time shrink live. Then pressure-test the redesign with AI.", gain: "Moves you from single AI tools to designing AI across the whole contract lifecycle (CLM) — where the largest organisational savings sit." },
  reveal: { c: C.deep, t: "Reveal & decide", how: "Work the problem with the limited information a human would normally have and write your Round-1 read, then reveal the hidden AI findings and revise your decision in Round 2. Pressure-test with AI if a prompt is provided.", gain: "Shows how AI surfaces the motivations and trade-offs you can't see — so you negotiate on the real position, not just the stated one." },
  pick: { c: C.teal, t: "Build & pitch", how: "Choose your top indicators within the limit, name your dashboard, then explain why they matter and what AI should predict from them — and pitch it.", gain: "Practises the core risk-monitoring discipline: choosing the few signals that best predict failure — exactly how an AI risk model is built." },
};
// What data each activity type uses, so delegates know exactly what to work from.
const DATA_NOTE = {
  classify: "Provided here — sort the items shown.",
  spot: "Provided here — the options (and any data preview) are shown.",
  reflect: "No data needed — this is your own thinking.",
  ai: "Self-contained — the prompt already includes its example data; paste it as-is.",
  lab: "Use the Northwind dossier in Explore for any figures you need.",
  case: "Use the Northwind dossier (Explore → the relevant tab).",
  pain: "Use your own organisation's tasks — the examples are just a starter.",
  segment: "Provided in the table below (Northwind suppliers).",
  discovery: "Provided in the scenario below (the Helios single-source brief) plus your own requirements — the AI generates the supplier names.",
  health: "Provided in the table below (Northwind KPIs).",
  risk: "Provided in the scenario below.",
  pack: "Provided in the scenario below.",
  develop: "Provided in the scenario below — set your own targets.",
  innovate: "Provided — the challenge below (edit to your own).",
  promptlab: "Use the Northwind dossier in Explore (Suppliers, Performance, Contracts…).",
  scorecard: "Uses Northwind supplier data, built into the prompt.",
  signals: "Provided in the scenario below.",
  healthscore: "Provided in the table below.",
  concentration: "Provided — Tier-1 spend is shown; reveal the Tier-2 mapping.",
  riskscore: "Provided in the table below.",
  crisis: "Provided in the AI alert below.",
  friction: "Provided — the seeded journey (edit to your own).",
  innovsprint: "Provided — the challenge below (edit to your own).",
  lifecycle: "Provided below — today's cycle time per lifecycle stage; you set the AI-enabled times.",
  reveal: "Provided below — the limited human-visible facts; the AI findings are revealed when you're ready.",
  pick: "Provided below — choose from the candidate indicators shown.",
};
// Where a delegate would realistically source this kind of data back at work.
const REAL_SOURCE = {
  pain: "your team's time tracking and a quick poll of the buyers who feel the pain.",
  segment: "spend from your ERP/spend-analytics tool, risk from credit agencies (D&B, Creditsafe) and sourcing records, and ESG from ratings like EcoVadis.",
  discovery: "supplier-discovery platforms (TealBook, Scoutbee), trade directories and market reports to find names — then credit agencies and references to validate them.",
  health: "on-time and defect data from your ERP and quality system; lead-time trends from your order history.",
  risk: "company financials from credit agencies (D&B, Creditsafe), news/strike signals from news feeds or Google Alerts, and site/source detail from your supplier records.",
  pack: "the supplier's performance data from your ERP and the meeting context from your category team.",
  lifecycle: "your CLM or contract register for current cycle times, and your legal and operations teams for where the delays really are.",
  reveal: "your own market intelligence, credit/financial data and account history — plus what AI can infer about the other side's likely position.",
  pick: "your ERP, finance and risk systems, credit agencies, and news/regulatory feeds — the data behind each indicator.",
  develop: "supplier performance from your ERP/quality system and spend from your spend cube.",
  innovate: "your cost and sustainability baselines, plus ideas sourced directly from suppliers.",
  innovsprint: "your cost, waste and emissions data, plus supplier-submitted ideas from a joint innovation session.",
  promptlab: "your real supplier, contract and spend systems — anonymise before pasting into a public AI tool.",
  scorecard: "spend (ERP), performance (ERP/quality), financial health (credit agencies) and ESG (EcoVadis/CDP).",
  signals: "credit agencies for financials, and news / LinkedIn / Glassdoor for workforce and leadership changes.",
  healthscore: "ERP and quality systems for delivery & defects, credit agencies for financial health, news/LinkedIn for turnover.",
  concentration: "supplier disclosures and n-tier mapping tools (e.g. Interos, Everstream, Sourcemap).",
  riskscore: "credit agencies (financial), ERP (operational), EcoVadis (ESG) and cyber-ratings (BitSight, SecurityScorecard).",
  crisis: "an AI supplier risk-monitoring platform feeding real-time alerts.",
  friction: "supplier feedback/surveys and a walk-through of your purchase-to-pay and onboarding processes.",
};
function ActivityGuide({ meta, a }) {
  const dataNote = (a && a.dataNote) || DATA_NOTE[a && a.type];
  const realNote = (a && a.realWorld) || REAL_SOURCE[a && a.type];
  return (
    <div style={{ background: C.light, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 13px", margin: "0 0 14px", display: "grid", gap: 7 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <ListChecks size={15} color={C.teal} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}><strong style={{ color: C.navy }}>What to do — </strong>{meta.how}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Rocket size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}><strong style={{ color: C.navy }}>Why it helps — </strong>{meta.gain}</div>
      </div>
      {dataNote && <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Database size={15} color={C.deep} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}><strong style={{ color: C.navy }}>Data — </strong>{dataNote}</div>
      </div>}
      {realNote && <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Building2 size={15} color={C.muted} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}><strong style={{ color: C.body }}>In real life — </strong>{realNote}</div>
      </div>}
    </div>
  );
}

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
      {a.rubric && (
        <div style={{ marginTop: 12, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 8 }}>What a strong answer shows</div>
          <div style={{ display: "grid", gap: 6 }}>
            {a.rubric.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: C.body }}>
                <CheckCircle2 size={15} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} /><span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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

function PainBody({ a, wk, patch, note, setNote, complete, backlog, setBacklog }) {
  const rows = wk.rows || a.seed || [];
  const opps = wk.opps || ["", "", ""];
  const [added, setAdded] = useState(false);
  const setRows = (r) => patch({ rows: r });
  const setOpps = (o) => { patch({ opps: o }); const filled = o.filter((x) => x && x.trim()); setNote(filled.map((x, i) => `${i + 1}. ${x}`).join("\n")); if (filled.length >= 3) complete(); };
  const addRow = () => setRows([...rows, { act: "", hours: "", pain: 3, ai: "Yes" }]);
  const updRow = (i, k, v) => setRows(rows.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const delRow = (i) => setRows(rows.filter((_, j) => j !== i));
  const score = (r) => (Number(r.hours) || 0) * (Number(r.pain) || 0);
  const aiColor = (ai) => ai === "Yes" ? C.green : ai === "Partial" ? C.amber : C.muted;
  const chartData = rows.filter((r) => r.act && r.act.trim()).map((r) => ({ name: r.act.length > 16 ? r.act.slice(0, 15) + "…" : r.act, full: r.act, score: score(r), ai: r.ai }));
  const sel = { fontFamily: sans, fontSize: 12.5, padding: "5px 7px", borderRadius: 7, border: `1px solid ${C.line}`, color: C.ink, background: "#fff" };
  const sendToBacklog = () => {
    const valid = opps.map((o) => (o || "").trim()).filter(Boolean);
    if (!valid.length || !setBacklog) return;
    const now = Date.now();
    const items = valid.map((o, i) => ({ id: now + i, title: o.slice(0, 80), desc: "From Day 2 · Find the Pain", goal: "Build resilience", type: "Augment", value: "High", readiness: "Medium" }));
    setBacklog([...(backlog || []), ...items]);
    setAdded(true); setTimeout(() => setAdded(false), 2400);
  };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13, minWidth: 540 }}>
          <thead><tr style={{ background: C.deep }}>
            <th style={thL}>SRM activity</th><th style={thC}>Hrs/month</th><th style={thC}>Pain (1–5)</th><th style={thC}>AI help?</th><th style={thC}>Priority</th><th style={thC}></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? C.light : "#fff" }}>
                <td style={{ padding: "6px 8px", borderTop: `1px solid ${C.line}` }}><input value={r.act} onChange={(e) => updRow(i, "act", e.target.value)} placeholder="e.g. supplier reporting" style={{ ...sel, width: "100%", boxSizing: "border-box" }} /></td>
                <td style={tdC}><input value={r.hours} onChange={(e) => updRow(i, "hours", e.target.value.replace(/[^0-9]/g, ""))} style={{ ...sel, width: 54, textAlign: "center" }} /></td>
                <td style={tdC}><select value={r.pain} onChange={(e) => updRow(i, "pain", Number(e.target.value))} style={sel}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></td>
                <td style={tdC}><select value={r.ai} onChange={(e) => updRow(i, "ai", e.target.value)} style={sel}><option>Yes</option><option>Partial</option><option>No</option></select></td>
                <td style={{ ...tdC, fontWeight: 700, color: score(r) >= 30 ? C.red : score(r) >= 15 ? C.amber : C.muted }}>{score(r) || ""}</td>
                <td style={tdC}><button onClick={() => delRow(i)} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted }}><X size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0", flexWrap: "wrap" }}>
        <Btn small kind="ghost" onClick={addRow}><Plus size={14} />Add activity</Btn>
        <span style={{ fontSize: 12, color: C.muted }}>Priority = hours × pain. Aim for your 5 biggest frustrations.</span>
      </div>
      {chartData.length > 0 && (
        <div style={{ height: Math.max(150, chartData.length * 34) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: C.body }} />
              <Tooltip formatter={(v) => [v, "priority"]} labelFormatter={(l, p) => (p && p[0] ? p[0].payload.full : l)} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>{chartData.map((d, i) => <Cell key={i} fill={aiColor(d.ai)} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p style={{ fontSize: 11.5, color: C.muted, margin: "2px 0 14px" }}>Bars coloured by AI fit: <span style={{ color: C.green, fontWeight: 700 }}>green = yes</span> · <span style={{ color: C.amber, fontWeight: 700 }}>amber = partial</span> · grey = no. The longest green/amber bars are your best opportunities.</p>
      <div style={{ background: C.cardl, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 3 }}>Your 3 AI opportunities</div>
        {a.output && <p style={{ fontSize: 12.5, color: C.body, margin: "0 0 8px" }}>{a.output}</p>}
        <div style={{ display: "grid", gap: 8 }}>
          {opps.map((o, i) => (
            <input key={i} value={o} onChange={(e) => setOpps(opps.map((x, j) => j === i ? e.target.value : x))} placeholder={`Opportunity ${i + 1} — e.g. AI-drafted supplier reports`} style={{ fontFamily: sans, fontSize: 13.5, padding: "9px 11px", borderRadius: 8, border: `1px solid ${C.line}`, color: C.ink, background: "#fff", width: "100%", boxSizing: "border-box" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          <Btn small onClick={sendToBacklog} disabled={!opps.some((o) => (o || "").trim())}><Plus size={14} />Send to Backlog</Btn>
          {added && <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>✓ Added to your Backlog</span>}
        </div>
      </div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
const SEG_TIERS = ["Strategic", "Critical", "Preferred", "Transactional"];
function SegmentBody({ a, wk, patch, note, setNote, complete, go }) {
  const sups = a.suppliers || [];
  const mine = wk.mine || {};
  const ai = wk.ai || {};
  const summarise = (m, x) => {
    const both = sups.filter((s) => m[s.name] && x[s.name]);
    const agree = both.filter((s) => m[s.name] === x[s.name]).length;
    setNote(sups.map((s) => `${s.name}: you=${m[s.name] || "—"} / AI=${x[s.name] || "—"}`).join("\n") + (both.length ? `\nAgreement: ${agree}/${both.length}` : ""));
  };
  const setMine = (name, t) => { const m = { ...mine, [name]: t }; patch({ mine: m }); if (sups.every((s) => m[s.name])) complete(); summarise(m, ai); };
  const setAi = (name, t) => { const x = { ...ai, [name]: t }; patch({ ai: x }); summarise(mine, x); };
  const tierColor = (t) => t === "Strategic" ? C.navy : t === "Critical" ? C.amber : t === "Preferred" ? C.teal : t === "Transactional" ? C.muted : C.line;
  const dd = (val, on) => (
    <select value={val || ""} onChange={(e) => on(e.target.value)} style={{ fontFamily: sans, fontSize: 12.5, padding: "5px 7px", borderRadius: 7, border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}>
      <option value="">—</option>{SEG_TIERS.map((t) => <option key={t}>{t}</option>)}
    </select>
  );
  const both = sups.filter((s) => mine[s.name] && ai[s.name]);
  const agree = both.filter((s) => mine[s.name] === ai[s.name]).length;
  const prompt = `You are a supplier-management expert. Categorise these suppliers into four tiers — Strategic, Critical, Preferred and Transactional — and explain your reasoning for each in one line. Weigh supply risk and single-source dependency alongside spend; do not segment on spend alone.\n\nSuppliers (annual spend · risk · single-source · ESG rating):\n${sups.map((s) => `- ${s.name} — ${s.spend}, ${s.risk} risk, ${s.single === "Yes" ? "single source" : "not single source"}, ESG ${s.esg}`).join("\n")}\n\nReturn a table of Supplier, Tier and Reasoning, then one line on the management approach each tier deserves.`;
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "6px 0 12px" }}>
        {[["Strategic", "high value & impact — partner deeply"], ["Critical", "high risk / single-source — protect continuity"], ["Preferred", "reliable performers — develop & consolidate"], ["Transactional", "low value & risk — automate & simplify"]].map(([t, d]) => (
          <span key={t} style={{ fontSize: 11.5, color: C.body, background: "#fff", border: `1px solid ${C.line}`, borderLeft: `3px solid ${tierColor(t)}`, borderRadius: 7, padding: "4px 8px" }}><strong style={{ color: C.navy }}>{t}</strong> — {d}</span>
        ))}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "0 0 6px" }}>Step 1 · Segment them yourself. Step 3 · Record the AI's call to compare.</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13, minWidth: 640 }}>
          <thead><tr style={{ background: C.deep }}>
            <th style={thL}>Supplier</th><th style={thC}>Spend</th><th style={thC}>Risk</th><th style={thC}>Single?</th><th style={thC}>ESG</th><th style={thC}>Your call</th><th style={thC}>AI's call</th><th style={thC}>Match</th>
          </tr></thead>
          <tbody>
            {sups.map((s, i) => { const m = mine[s.name], x = ai[s.name]; const matched = m && x ? (m === x) : null; return (
              <tr key={s.name} style={{ background: i % 2 ? C.light : "#fff" }}>
                <td style={{ padding: "7px 9px", borderTop: `1px solid ${C.line}` }}><strong style={{ color: C.navy }}>{s.name}</strong></td>
                <td style={tdC}>{s.spend}</td>
                <td style={tdC}><Pill bg={s.risk === "High" ? C.red : s.risk === "Medium" ? C.amber : C.muted} fg="#fff">{s.risk}</Pill></td>
                <td style={tdC}>{s.single}</td>
                <td style={tdC}>{s.esg}</td>
                <td style={tdC}>{dd(m, (t) => setMine(s.name, t))}</td>
                <td style={tdC}>{dd(x, (t) => setAi(s.name, t))}</td>
                <td style={{ ...tdC, fontWeight: 700, color: matched === null ? C.line : matched ? C.green : C.amber }}>{matched === null ? "" : matched ? "✓" : "≠"}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      {both.length > 0 && <div style={{ marginTop: 10, background: agree === both.length ? C.greenl : C.cardl, border: `1px solid ${agree === both.length ? C.mint : C.line}`, borderRadius: 10, padding: "9px 13px", fontSize: 13.5, fontWeight: 700, color: C.navy }}>You and the AI agree on {agree} of {both.length}. {agree === both.length ? "Same read!" : "Where you differ — whose reasoning is stronger, and why?"}</div>}
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "16px 0 6px" }}>Step 2 · Run it with AI</div>
      <ol style={{ margin: "0 0 8px", paddingLeft: 20, color: C.body, fontSize: 13.5, lineHeight: 1.6 }}>
        <li>Copy the prompt below.</li>
        <li>Open <strong>AI Chat</strong> (or any AI tool) and paste it.</li>
        <li>Read the AI's tiers and reasoning, then record its call per supplier in the <em>AI's call</em> column above.</li>
      </ol>
      <PromptBox text={prompt} />
      <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}>
        <strong style={{ color: C.navy }}>Output: </strong>{a.output}
      </div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
const HEALTH_VERDICTS = ["High-performing", "On track", "Underperforming"];
function HealthBody({ a, wk, patch, note, setNote, complete, go }) {
  const sups = a.suppliers || [];
  const mine = wk.mine || {};
  const ai = wk.ai || {};
  const summarise = (m, x) => {
    const both = sups.filter((s) => m[s.name] && x[s.name]);
    const agree = both.filter((s) => m[s.name] === x[s.name]).length;
    setNote(sups.map((s) => `${s.name}: you=${m[s.name] || "—"} / AI=${x[s.name] || "—"}`).join("\n") + (both.length ? `\nAgreement: ${agree}/${both.length}` : ""));
  };
  const setMine = (name, t) => { const m = { ...mine, [name]: t }; patch({ mine: m }); if (sups.every((s) => m[s.name])) complete(); summarise(m, ai); };
  const setAi = (name, t) => { const x = { ...ai, [name]: t }; patch({ ai: x }); summarise(mine, x); };
  const vColor = (v) => v === "High-performing" ? C.green : v === "On track" ? C.teal : v === "Underperforming" ? C.red : C.line;
  const dd = (val, on) => (
    <select value={val || ""} onChange={(e) => on(e.target.value)} style={{ fontFamily: sans, fontSize: 12.5, padding: "5px 7px", borderRadius: 7, border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}>
      <option value="">—</option>{HEALTH_VERDICTS.map((t) => <option key={t}>{t}</option>)}
    </select>
  );
  const both = sups.filter((s) => mine[s.name] && ai[s.name]);
  const agree = both.filter((s) => mine[s.name] === ai[s.name]).length;
  const prompt = `You are a supplier-performance analyst. Analyse these supplier KPIs, identify the high-performing and the underperforming suppliers, and recommend one action for each underperformer. Weigh the trend (direction of change), not just the current number.\n\nSuppliers (on-time delivery · defect rate · lead-time trend · change vs prior quarter):\n${sups.map((s) => `- ${s.name} — ${s.otd} OTD, ${s.defects} defects, ${String(s.lead).toLowerCase()} lead time, ${s.change}`).join("\n")}\n\nReturn a table of Supplier, Verdict (high-performing / on track / underperforming), key reason and recommended action. Then name the single supplier needing urgent attention.`;
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "6px 0 6px" }}>Step 1 · Judge each supplier yourself. Step 3 · Record the AI's verdict to compare.</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13, minWidth: 660 }}>
          <thead><tr style={{ background: C.deep }}>
            <th style={thL}>Supplier</th><th style={thC}>OTD %</th><th style={thC}>Defects</th><th style={thC}>Lead-time</th><th style={thC}>Change</th><th style={thC}>Your call</th><th style={thC}>AI's call</th><th style={thC}>Match</th>
          </tr></thead>
          <tbody>
            {sups.map((s, i) => { const m = mine[s.name], x = ai[s.name]; const matched = m && x ? (m === x) : null; return (
              <tr key={s.name} style={{ background: i % 2 ? C.light : "#fff" }}>
                <td style={{ padding: "7px 9px", borderTop: `1px solid ${C.line}` }}><strong style={{ color: C.navy }}>{s.name}</strong></td>
                <td style={tdC}>{s.otd}</td>
                <td style={tdC}>{s.defects}</td>
                <td style={tdC}>{s.lead}</td>
                <td style={{ ...tdC, fontWeight: 700, color: C.red }}>{s.change}</td>
                <td style={tdC}>{dd(m, (t) => setMine(s.name, t))}</td>
                <td style={tdC}>{dd(x, (t) => setAi(s.name, t))}</td>
                <td style={{ ...tdC, fontWeight: 700, color: matched === null ? C.line : matched ? C.green : C.amber }}>{matched === null ? "" : matched ? "✓" : "≠"}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      {both.length > 0 && <div style={{ marginTop: 10, background: agree === both.length ? C.greenl : C.cardl, border: `1px solid ${agree === both.length ? C.mint : C.line}`, borderRadius: 10, padding: "9px 13px", fontSize: 13.5, fontWeight: 700, color: C.navy }}>You and the AI agree on {agree} of {both.length}. {agree === both.length ? "Same read!" : "Where you differ — whose evidence is stronger?"}</div>}
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "16px 0 6px" }}>Step 2 · Run it with AI</div>
      <ol style={{ margin: "0 0 8px", paddingLeft: 20, color: C.body, fontSize: 13.5, lineHeight: 1.6 }}>
        <li>Copy the prompt below.</li>
        <li>Open <strong>AI Chat</strong> (or any AI tool) and paste it.</li>
        <li>Read the AI's verdicts and actions, then record its call per supplier in the <em>AI's call</em> column above.</li>
      </ol>
      <PromptBox text={prompt} />
      <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}>
        <strong style={{ color: C.navy }}>Output: </strong>{a.output}
      </div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function RiskBody({ a, wk, patch, note, setNote, complete, go }) {
  const signs = wk.signs || [];
  const score = wk.score || 0;
  const aiScore = wk.aiScore || 0;
  const mitigation = wk.mitigation || "";
  const contingency = wk.contingency || "";
  const summarise = (st) => {
    const s = { signs, score, aiScore, mitigation, contingency, ...st };
    if (s.score && (s.mitigation || "").trim() && (s.contingency || "").trim()) complete();
    setNote(`Risk score: ${s.score || "—"}/10 (AI: ${s.aiScore || "—"}/10)\nMitigation: ${s.mitigation || "—"}\nContingency: ${s.contingency || "—"}`);
  };
  const set = (st) => { patch(st); summarise(st); };
  const toggleSign = (x) => set({ signs: signs.includes(x) ? signs.filter((y) => y !== x) : [...signs, x] });
  const scoreBtns = (val, on) => (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
      <button key={n} onClick={() => on(n)} style={{ width: 30, height: 30, borderRadius: 7, cursor: "pointer", fontFamily: sans, fontSize: 12.5, fontWeight: 700, border: `1px solid ${val === n ? C.navy : C.line}`, background: val === n ? (n >= 8 ? C.red : n >= 5 ? C.amber : C.green) : "#fff", color: val === n ? "#fff" : C.body }}>{n}</button>
    ))}</div>
  );
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 14px" }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>THE SCENARIO</span><br />{a.scenario}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Step 1 · Spot the genuine warning signs</div>
      <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
        {(a.signs || []).map((s) => { const sel = signs.includes(s); return (
          <button key={s} onClick={() => toggleSign(s)} style={{ cursor: "pointer", textAlign: "left", fontFamily: sans, fontSize: 13.5, fontWeight: 600, padding: "9px 11px", borderRadius: 9, border: `1px solid ${sel ? C.teal : C.line}`, background: sel ? C.cardl : "#fff", color: C.ink, display: "flex", alignItems: "center", gap: 9 }}>
            {sel ? <CheckCircle2 size={16} color={C.teal} /> : <Circle size={16} color={C.muted} />}<span>{s}</span>
          </button>
        ); })}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 2 · Your risk score (1 = low, 10 = critical)</div>
      <div style={{ marginBottom: 14 }}>{scoreBtns(score, (n) => set({ score: n }))}</div>
      <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
        <div><div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 3 · Mitigation plan <span style={{ fontWeight: 400, color: C.muted }}>(reduce the risk now)</span></div><textarea value={mitigation} onChange={(e) => set({ mitigation: e.target.value })} rows={3} placeholder="e.g. qualify a second source, request financial assurances, build a targeted buffer…" style={ta} /></div>
        <div><div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Contingency plan <span style={{ fontWeight: 400, color: C.muted }}>(if supply stops)</span></div><textarea value={contingency} onChange={(e) => set({ contingency: e.target.value })} rows={3} placeholder="e.g. switch to a pre-qualified alternative, draw safety stock, 48-hour response plan…" style={ta} /></div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 4 · Run the AI & compare</div>
      <ol style={{ margin: "0 0 8px", paddingLeft: 20, color: C.body, fontSize: 13.5, lineHeight: 1.6 }}>
        <li>Copy the prompt and run it in <strong>AI Chat</strong> (or any AI tool).</li>
        <li>Read the AI's risk register, then record the AI's score below and compare it with yours.</li>
      </ol>
      <PromptBox text={a.prompt} />
      <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "12px 0 6px" }}>The AI's risk score (1–10)</div>
      <div>{scoreBtns(aiScore, (n) => set({ aiScore: n }))}</div>
      {score > 0 && aiScore > 0 && <div style={{ marginTop: 10, background: Math.abs(score - aiScore) <= 1 ? C.greenl : C.cardl, border: `1px solid ${Math.abs(score - aiScore) <= 1 ? C.mint : C.line}`, borderRadius: 10, padding: "9px 13px", fontSize: 13.5, fontWeight: 700, color: C.navy }}>You scored {score}/10, the AI scored {aiScore}/10. {Math.abs(score - aiScore) <= 1 ? "Close read!" : "Why the gap — whose reasoning is stronger?"}</div>}
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function PackBody({ a, wk, patch, note, setNote, complete, go }) {
  const items = a.items || [];
  const gen = wk.gen || {};
  const out = wk.out || {};
  const setGen = (k, v) => { const g = { ...gen, [k]: v }; patch({ gen: g }); if (items.every((it) => g[it.key])) complete(); };
  const setOut = (k, v) => { const o = { ...out, [k]: v }; patch({ out: o }); setNote(items.map((it) => o[it.key] && o[it.key].trim() ? `## ${it.label}\n${o[it.key]}` : "").filter(Boolean).join("\n\n")); };
  const doneCount = items.filter((it) => gen[it.key]).length;
  const taStyle = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13, padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.4 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 14px" }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>THE SITUATION</span><br />{a.scenario}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.navy }}>Generate all four with AI — your pack in minutes. ({doneCount}/{items.length})</span>
        <Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn>
      </div>
      {items.map((it, i) => (
        <Card key={it.key} style={{ padding: 14, marginBottom: 10, borderLeft: `4px solid ${gen[it.key] ? C.mint : C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: C.deep, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            <H size={15}>{it.label}</H>
          </div>
          <PromptBox text={it.prompt} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            <button onClick={() => setGen(it.key, !gen[it.key])} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", border: `1px solid ${gen[it.key] ? C.mint : C.line}`, background: gen[it.key] ? C.mint : "#fff", color: gen[it.key] ? "#fff" : C.muted, borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 600 }}><Check size={14} />{gen[it.key] ? "Generated" : "Mark generated"}</button>
          </div>
          <textarea value={out[it.key] || ""} onChange={(e) => setOut(it.key, e.target.value)} rows={3} placeholder={`Paste the AI's ${it.label.toLowerCase()} here to build your pack (optional)…`} style={{ ...taStyle, marginTop: 8 }} />
        </Card>
      ))}
      <div style={{ marginTop: 2, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function DevelopBody({ a, wk, patch, note, setNote, complete, go }) {
  const t = wk.targets || { otd: "", def: "", lead: "" };
  const roadmap = wk.roadmap || "";
  const roi = wk.roi || { cost: "", savings: "", roi: "" };
  const writeNote = (tt, rm, rr) => setNote(`Targets: OTD ${tt.otd || "—"}%, defects <${tt.def || "—"}%, lead ${tt.lead || "—"}\nBusiness case: cost impact ${rr.cost || "—"}, savings ${rr.savings || "—"}, ROI ${rr.roi || "—"}\nRoadmap: ${rm ? (rm.slice(0, 200) + (rm.length > 200 ? "…" : "")) : "—"}`);
  const chk = (tt, rm, rr) => { if (String(tt.otd || "").trim() && rm.trim()) complete(); writeNote(tt, rm, rr); };
  const setTargets = (k, v) => { const n = { ...t, [k]: v }; patch({ targets: n }); chk(n, roadmap, roi); };
  const setRoadmap = (v) => { patch({ roadmap: v }); chk(t, v, roi); };
  const setRoi = (k, v) => { const n = { ...roi, [k]: v }; patch({ roi: n }); chk(t, roadmap, n); };
  const tg = (v, d) => (v && String(v).trim()) ? v : d;
  const prompt = `You are a supplier-development specialist. Create a six-month supplier development programme to turn around an underperforming sensor supplier (Aurora Electronics, £28m/year).\nCurrent performance: on-time delivery 82%, defect rate 3.1%, long and volatile lead times.\nSix-month targets: on-time ${tg(t.otd, "95")}%, defects below ${tg(t.def, "1")}%, ${tg(t.lead, "stable, shorter lead times")}.\nFor each month give the milestone, the KPI tracked, and who is responsible (supplier or buyer). End with the review cadence and the two highest-impact actions to start in month 1.`;
  const roiPrompt = `Estimate the business case for that six-month supplier development programme. The supplier is £28m/year of spend, currently 82% on-time with a 3.1% defect rate.\nShow as a short table, stating your assumptions: (1) the current annual cost of poor performance (late deliveries, defects, expediting, admin), (2) the savings opportunity if we hit the targets, (3) the programme cost, and (4) the ROI percentage and payback period.`;
  const inp = { fontFamily: sans, fontSize: 13, padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff" };
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13, padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.4 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 14px" }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>THE TURNAROUND</span><br />{a.scenario}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 1 · Set your six-month targets</div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: C.muted }}>Target on-time %<br /><input value={t.otd} onChange={(e) => setTargets("otd", e.target.value.replace(/[^0-9]/g, ""))} placeholder="95" style={{ ...inp, width: 70, marginTop: 4 }} /></label>
        <label style={{ fontSize: 12, color: C.muted }}>Target defects % (max)<br /><input value={t.def} onChange={(e) => setTargets("def", e.target.value.replace(/[^0-9.]/g, ""))} placeholder="1" style={{ ...inp, width: 70, marginTop: 4 }} /></label>
        <label style={{ fontSize: 12, color: C.muted }}>Lead-time goal<br /><input value={t.lead} onChange={(e) => setTargets("lead", e.target.value)} placeholder="stable & shorter" style={{ ...inp, width: 180, marginTop: 4 }} /></label>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 2 · Generate the development roadmap</div>
      <PromptBox text={prompt} />
      <div style={{ margin: "10px 0" }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <textarea value={roadmap} onChange={(e) => setRoadmap(e.target.value)} rows={4} placeholder="Paste the AI's six-month roadmap here to save it…" style={ta} />
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "16px 0 6px" }}>Step 3 · Advanced — build the business case</div>
      <PromptBox text={roiPrompt} />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "10px 0 0" }}>
        <label style={{ fontSize: 12, color: C.muted }}>Cost of poor performance<br /><input value={roi.cost} onChange={(e) => setRoi("cost", e.target.value)} placeholder="£…" style={{ ...inp, width: 110, marginTop: 4 }} /></label>
        <label style={{ fontSize: 12, color: C.muted }}>Savings opportunity<br /><input value={roi.savings} onChange={(e) => setRoi("savings", e.target.value)} placeholder="£…" style={{ ...inp, width: 110, marginTop: 4 }} /></label>
        <label style={{ fontSize: 12, color: C.muted }}>ROI<br /><input value={roi.roi} onChange={(e) => setRoi("roi", e.target.value)} placeholder="e.g. 320%" style={{ ...inp, width: 90, marginTop: 4 }} /></label>
      </div>
      <div style={{ marginTop: 14, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
// Day 3 "Time Machine" — redesign the contract lifecycle stage by stage. The
// learner sets an AI-enabled time per stage and names the AI solution, staying
// inside an "AI capability card", and the total cycle time shrinks live.
function LifecycleBody({ a, wk, patch, note, setNote, complete, go }) {
  const stages = a.stages || [];
  const ai = wk.ai || {};   // stage -> AI-enabled time (days, string)
  const sol = wk.sol || {}; // stage -> AI solution text
  const totalCur = stages.reduce((s, st) => s + (st.days || 0), 0);
  const aiTotal = (na) => stages.reduce((s, st) => { const v = parseFloat(na[st.stage]); return s + (isNaN(v) ? (st.days || 0) : v); }, 0);
  const totalAi = aiTotal(ai);
  const saved = totalCur > 0 ? Math.round(((totalCur - totalAi) / totalCur) * 100) : 0;
  const writeNote = (na, ns) => {
    const lines = stages.map((st) => `${st.stage}: ${st.current} → ${String(na[st.stage] ?? "").trim() !== "" ? na[st.stage] + "d" : "—"}${ns[st.stage] ? " · " + ns[st.stage] : ""}`);
    setNote(`Cycle: ${totalCur}d → ${Math.round(aiTotal(na))}d\n${lines.join("\n")}`);
  };
  const filled = stages.filter((st) => String(ai[st.stage] ?? "").trim() !== "").length;
  const setAi = (k, v) => { const n = { ...ai, [k]: v.replace(/[^0-9.]/g, "") }; patch({ ai: n }); if (stages.every((st) => String(n[st.stage] ?? "").trim() !== "")) complete(); writeNote(n, sol); };
  const setSol = (k, v) => { const n = { ...sol, [k]: v }; patch({ sol: n }); writeNote(ai, n); };
  const inp = { fontFamily: sans, fontSize: 13, padding: "6px 8px", border: `1px solid ${C.line}`, borderRadius: 7, color: C.ink, background: "#fff" };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 14px" }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>THE MISSION</span><br />{a.scenario}
      </div>
      {a.card && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ flex: "1 1 220px", background: C.greenl, border: `1px solid ${C.mint}`, borderRadius: 10, padding: "10px 13px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: 1, marginBottom: 6 }}>YOUR CARD · AI CAN</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: C.ink, fontSize: 13, lineHeight: 1.5 }}>{a.card.can.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div style={{ flex: "1 1 220px", background: C.redl, border: `1px solid ${C.red}`, borderRadius: 10, padding: "10px 13px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 1, marginBottom: 6 }}>AI CANNOT</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: C.ink, fontSize: 13, lineHeight: 1.5 }}>{a.card.cannot.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      )}
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Redesign each stage — set the AI-enabled time and name the AI solution ({filled}/{stages.length})</div>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        {stages.map((st) => (
          <div key={st.stage} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, color: C.navy, fontSize: 14, flex: "1 1 150px" }}>{st.stage}</span>
              <span style={{ fontSize: 12.5, color: C.muted }}>Now: <strong style={{ color: C.body }}>{st.current}</strong></span>
              <label style={{ fontSize: 12, color: C.muted, display: "inline-flex", alignItems: "center", gap: 5 }}>With AI:
                <input value={ai[st.stage] || ""} onChange={(e) => setAi(st.stage, e.target.value)} placeholder="?" style={{ ...inp, width: 52, textAlign: "center" }} /> days
              </label>
            </div>
            <input value={sol[st.stage] || ""} onChange={(e) => setSol(st.stage, e.target.value)} placeholder={`AI solution — e.g. ${st.hint}`} style={{ ...inp, width: "100%", boxSizing: "border-box", marginTop: 8 }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: saved > 0 ? C.greenl : C.cardl, border: `1px solid ${saved > 0 ? C.mint : C.line}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
        <span style={{ fontSize: 13.5, color: C.body }}>Cycle time: <strong style={{ color: C.navy }}>{totalCur} days</strong> → <strong style={{ color: saved > 0 ? C.green : C.navy }}>{Math.round(totalAi)} days</strong></span>
        {saved > 0 && <span style={{ fontSize: 15, fontWeight: 800, color: C.green }}>{saved}% faster</span>}
        <span style={{ fontSize: 12, color: C.muted }}>per contract · × 5,000 contracts</span>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Pressure-test the redesign with AI</div>
      <PromptBox text={a.prompt} />
      <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ marginTop: 14, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
// Day 3 negotiation pattern — "Reveal & decide". The learner works the problem
// with the limited info a human would normally have (Round 1), then reveals the
// hidden AI intel (motivations / a scenario model / a clause benchmark) and
// revises the decision (Round 2). Reused across the three negotiation exercises.
function RevealBody({ a, wk, patch, note, setNote, complete, go }) {
  const r1 = wk.r1 || {};
  const r2 = wk.r2 || {};
  const shown = !!wk.shown;
  const round1 = a.round1 || [];
  const round2 = a.round2 || [];
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  const writeNote = (a1, a2) => {
    const part = (obj, defs) => defs.map((f) => `${f.label.replace(/^Round \d+ · /, "")}: ${(obj[f.key] || "").trim() || "—"}`).join("\n");
    setNote(`${part(a1, round1)}\n${part(a2, round2)}`.trim());
  };
  const chk = (a1, a2, sh) => { if (sh && round1.every((f) => (a1[f.key] || "").trim()) && round2.every((f) => (a2[f.key] || "").trim())) complete(); writeNote(a1, a2); };
  const set1 = (k, v) => { const n = { ...r1, [k]: v }; patch({ r1: n }); chk(n, r2, shown); };
  const set2 = (k, v) => { const n = { ...r2, [k]: v }; patch({ r2: n }); chk(r1, n, shown); };
  const reveal = () => { patch({ shown: true }); chk(r1, r2, true); };
  const fld = (f, val, on) => (
    <div key={f.key} style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{f.label}</div>
      <textarea value={val[f.key] || ""} onChange={(e) => on(f.key, e.target.value)} rows={3} placeholder={f.ph} style={ta} />
    </div>
  );
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 14px" }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>THE SCENARIO</span><br />{a.scenario}
      </div>
      {a.known && (
        <div style={{ background: C.light, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 6 }}>WHAT YOU CAN SEE</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: C.ink, fontSize: 13.5, lineHeight: 1.55 }}>{a.known.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
      {round1.map((f) => fld(f, r1, set1))}
      <div style={{ margin: "4px 0 14px" }}>
        {!shown
          ? <Btn onClick={reveal}><Sparkles size={15} />Reveal the AI findings</Btn>
          : <div style={{ background: C.deep, color: "#fff", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.mint, letterSpacing: 1, marginBottom: 8 }}>AI FINDINGS</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>{(a.reveal || []).map((x) => <li key={x}>{x}</li>)}</ul>
              {a.matrix && (
                <div style={{ overflowX: "auto", marginTop: 10 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                    <thead><tr style={{ background: C.navy }}>{a.matrix.cols.map((c) => <th key={c} style={thL}>{c}</th>)}</tr></thead>
                    <tbody>{a.matrix.rows.map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci} style={{ padding: "8px 11px", borderTop: `1px solid ${C.line}`, color: C.ink, fontWeight: ci === 0 ? 700 : 400 }}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>}
      </div>
      {shown && round2.map((f) => fld(f, r2, set2))}
      {a.prompt && <><PromptBox text={a.prompt} /><div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div></>}
      <div style={{ marginTop: 14, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
// Day 3 "Build & pitch" — choose your top-N indicators from a candidate list
// (capped), name the dashboard, justify and say what AI should predict. Used by
// the Risk Command Centre exercise; reusable for any "pick the vital few" design.
function PickBody({ a, wk, patch, note, setNote, complete, go }) {
  const picks = wk.picks || [];
  const name = wk.name || "";
  const f = wk.f || {};
  const limit = a.limit || 10;
  const asks = a.asks || [];
  const writeNote = (p, nm, ff) => {
    setNote(`${a.nameLabel || "Name"}: ${nm || "—"}\nIndicators (${p.length}/${limit}): ${p.join(", ") || "—"}\n${asks.map((q) => `${q.label}: ${(ff[q.key] || "").trim() || "—"}`).join("\n")}`);
  };
  const chk = (p, nm, ff) => { if (p.length > 0 && (nm || "").trim() && asks.every((q) => (ff[q.key] || "").trim())) complete(); writeNote(p, nm, ff); };
  const toggle = (x) => {
    let p;
    if (picks.includes(x)) p = picks.filter((y) => y !== x);
    else { if (picks.length >= limit) return; p = [...picks, x]; }
    patch({ picks: p }); chk(p, name, f);
  };
  const setName = (v) => { patch({ name: v }); chk(picks, v, f); };
  const setF = (k, v) => { const n = { ...f, [k]: v }; patch({ f: n }); chk(picks, name, n); };
  const inp = { fontFamily: sans, fontSize: 13.5, padding: "8px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff" };
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 14px" }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>THE BRIEF</span><br />{a.scenario}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: picks.length >= limit ? C.green : C.navy, marginBottom: 8 }}>Choose up to {limit} indicators ({picks.length}/{limit})</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {(a.options || []).map((o) => { const sel = picks.includes(o); const full = !sel && picks.length >= limit; return (
          <button key={o} onClick={() => toggle(o)} disabled={full} style={{ cursor: full ? "not-allowed" : "pointer", fontFamily: sans, fontSize: 13, fontWeight: 600, padding: "7px 12px", borderRadius: 999, border: `1px solid ${sel ? C.teal : C.line}`, background: sel ? C.teal : "#fff", color: sel ? "#fff" : (full ? C.muted : C.body), opacity: full ? 0.55 : 1, display: "inline-flex", alignItems: "center", gap: 6 }}>
            {sel && <Check size={13} />}{o}
          </button>
        ); })}
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{a.nameLabel || "Name your dashboard"}</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={a.namePh || "e.g. Northwind Supplier Risk Radar"} style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
      </div>
      {asks.map((q) => (
        <div key={q.key} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{q.label}</div>
          <textarea value={f[q.key] || ""} onChange={(e) => setF(q.key, e.target.value)} rows={3} placeholder={q.ph} style={ta} />
        </div>
      ))}
      {a.prompt && <><PromptBox text={a.prompt} /><div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div></>}
      <div style={{ marginTop: 14, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
const EFFORT = ["Low", "Medium", "High"];
function SprintBody({ a, wk, patch, note, setNote, complete, go }) {
  const challenge = wk.challenge != null ? wk.challenge : (a.challenge || "");
  const idea = wk.idea || "";
  const savings = wk.savings || "";
  const effort = wk.effort || "";
  const sustain = wk.sustain || "";
  const writeNote = (s) => {
    const o = { idea, savings, effort, sustain, ...s };
    setNote(`Idea: ${o.idea || "—"}\nExpected savings: ${o.savings || "—"}\nImplementation effort: ${o.effort || "—"}\nSustainability: ${o.sustain || "—"}`);
    if ((o.idea || "").trim() && (o.savings || "").trim() && o.effort) complete();
  };
  const set = (s) => { patch(s); writeNote(s); };
  const prompt = `You are an innovation and value-engineering specialist for a building-systems manufacturer. Challenge: ${challenge || a.challenge}\n\nSuggest five innovative, supplier-led initiatives that reduce cost AND improve sustainability. For each give: the idea in one line, how it cuts cost, the sustainability benefit, a rough saving, and the implementation effort (low / medium / high). Rank them by the best balance of saving and ease, and flag any that need the supplier to co-invest.`;
  const inp = { fontFamily: sans, fontSize: 13, padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff" };
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.cardl, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "12px 14px", margin: "6px 0 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.navy, marginBottom: 6 }}>THE CHALLENGE</div>
        <input value={challenge} onChange={(e) => set({ challenge: e.target.value })} style={{ width: "100%", boxSizing: "border-box", fontFamily: sans, fontSize: 14, padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff" }} />
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 5 }}>Edit to run your own innovation challenge.</div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 1 · Sprint with AI for ideas</div>
      <PromptBox text={prompt} />
      <div style={{ margin: "10px 0" }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "8px 0 6px" }}>Step 2 · Your pitch</div>
      <div style={{ display: "grid", gap: 10 }}>
        <div><div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Innovation idea</div><textarea value={idea} onChange={(e) => set({ idea: e.target.value })} rows={2} placeholder="e.g. switch to reusable, returnable transit packaging with a supplier-run pooling scheme" style={ta} /></div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: C.muted }}>Expected savings<br /><input value={savings} onChange={(e) => set({ savings: e.target.value })} placeholder="e.g. £0.4m / 9%" style={{ ...inp, width: 130, marginTop: 4 }} /></label>
          <label style={{ fontSize: 12, color: C.muted }}>Implementation effort<br /><select value={effort} onChange={(e) => set({ effort: e.target.value })} style={{ ...inp, marginTop: 4 }}><option value="">—</option>{EFFORT.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label style={{ fontSize: 12, color: C.muted }}>Sustainability benefit<br /><input value={sustain} onChange={(e) => set({ sustain: e.target.value })} placeholder="e.g. cuts packaging waste 60%" style={{ ...inp, width: 200, marginTop: 4 }} /></label>
        </div>
      </div>
      <div style={{ marginTop: 14, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function PromptLabBody({ a, wk, patch, note, setNote, complete, go }) {
  const slots = a.slots || [];
  const prompts = wk.prompts || {};
  const best = wk.best || "";
  const [copied, setCopied] = useState("");
  const writeNote = (p, b) => {
    const lib = slots.map((s) => (p[s.key] && p[s.key].trim()) ? `## ${s.label}${b === s.key ? " ⭐ (competition pick)" : ""}\n${p[s.key]}` : "").filter(Boolean).join("\n\n");
    setNote(lib);
    if (slots.every((s) => (p[s.key] || "").trim())) complete();
  };
  const setPrompt = (k, v) => { const p = { ...prompts, [k]: v }; patch({ prompts: p }); writeNote(p, best); };
  const setBest = (k) => { const b = best === k ? "" : k; patch({ best: b }); writeNote(prompts, b); };
  const copy = async (text, key) => { try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1500); } catch (e) {} };
  const libraryText = slots.map((s) => (prompts[s.key] || "").trim() ? `### ${s.label}\n${prompts[s.key]}` : "").filter(Boolean).join("\n\n");
  const filled = slots.filter((s) => (prompts[s.key] || "").trim()).length;
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.cardl, borderRadius: 10, padding: "10px 13px", margin: "6px 0 12px", fontSize: 13, color: C.ink }}>
        <strong style={{ color: C.navy }}>The four-part recipe:</strong> Role · Context · Task · Format. Use the Northwind supplier data in Explore as your context.
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <Btn small kind="ghost" onClick={() => go("explore")}><Compass size={13} />Open Explore (data)</Btn>
          <Btn small onClick={() => go("chat")}><MessageSquare size={13} />Test in AI Chat</Btn>
        </div>
      </div>
      {slots.map((s) => (
        <Card key={s.key} style={{ padding: 12, marginBottom: 10, borderLeft: `4px solid ${(prompts[s.key] || "").trim() ? C.gold : C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <H size={15}>{s.label}</H>
            <button onClick={() => setBest(s.key)} title="Enter this one in the competition" style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: best === s.key ? C.amber : C.muted, display: "inline-flex", alignItems: "center", gap: 4 }}>{best === s.key ? "★ Competition pick" : "☆ Pick for competition"}</button>
          </div>
          <p style={{ fontSize: 12.5, color: C.muted, margin: "2px 0 6px" }}>{s.hint}</p>
          <textarea value={prompts[s.key] || ""} onChange={(e) => setPrompt(s.key, e.target.value)} rows={3} placeholder="Write your prompt — role, context, task, format…" style={ta} />
          <div style={{ marginTop: 6 }}><Btn small kind="ghost" onClick={() => copy(prompts[s.key] || "", s.key)} disabled={!(prompts[s.key] || "").trim()}>{copied === s.key ? <Check size={13} /> : <Copy size={13} />}{copied === s.key ? "Copied" : "Copy"}</Btn></div>
        </Card>
      ))}
      <div style={{ marginTop: 4, background: C.light, borderLeft: `4px solid ${C.gold}`, borderRadius: 10, padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ color: C.navy, fontSize: 13.5 }}>Your AI Prompt Library</strong>
          <span style={{ fontSize: 12, color: C.muted }}>{filled}/{slots.length} written</span>
          <Btn small onClick={() => copy(libraryText, "all")} disabled={!libraryText} style={{ marginLeft: "auto" }}>{copied === "all" ? <Check size={13} /> : <Copy size={13} />}{copied === "all" ? "Copied" : "Copy library"}</Btn>
        </div>
        <p style={{ fontSize: 12.5, color: C.body, margin: "8px 0 0" }}>{a.output}</p>
      </div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
const DISC_LOCS = ["Global", "Europe", "Middle East", "Africa", "Asia", "Americas"];
const DISC_REQS = ["ISO 9001 certified", "Min 5 years' experience", "In-house manufacturing", "ESG / sustainability commitments", "Financial stability", "No single-source dependency"];
const DISC_ADVANCED = ["IT hardware", "Facilities management", "Construction contractors", "Fleet vehicles", "Office supplies", "Solar panels", "Cybersecurity vendors", "Engineering services"];
const discRow = () => ({ supplier: "", country: "", capability: "", esg: "", notes: "" });
function DiscoveryBody({ a, wk, patch, note, setNote, complete, go }) {
  const req = wk.req || { product: a.product || "Industrial control modules", locations: ["Europe"], reqs: ["ISO 9001 certified", "Financial stability"] };
  const longlist = wk.longlist || [discRow(), discRow(), discRow()];
  const debrief = wk.debrief || "";
  const [copied, setCopied] = useState("");
  const copy = async (text, key) => { try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1500); } catch (e) {} };
  const save = (nReq, nList, nDeb) => {
    patch({ req: nReq, longlist: nList, debrief: nDeb });
    const filled = nList.filter((r) => (r.supplier || "").trim());
    const locs = nReq.locations.length ? nReq.locations.join(", ") : "Global";
    setNote(`Supplier discovery — ${nReq.product}. Locations: ${locs}. Longlist (${filled.length}): ${filled.map((r) => r.supplier).join(", ") || "—"}.${nDeb.trim() ? ` Debrief: ${nDeb.trim().slice(0, 220)}` : ""}`);
    if (nReq.product.trim() && nReq.locations.length && filled.length >= 3 && nDeb.trim()) complete();
  };
  const setReq = (p) => save({ ...req, ...p }, longlist, debrief);
  const toggle = (key, val) => { const cur = req[key] || []; setReq({ [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] }); };
  const setRow = (i, p) => save(req, longlist.map((r, j) => j === i ? { ...r, ...p } : r), debrief);
  const addRow = () => save(req, [...longlist, discRow()], debrief);
  const delRow = (i) => save(req, longlist.length > 1 ? longlist.filter((_, j) => j !== i) : longlist, debrief);

  const locs = req.locations.length ? req.locations.join(", ") : "Global";
  const reqs = req.reqs.length ? req.reqs.join("; ") : "quality certifications, manufacturing capability, sustainability, financial stability";
  const searchPrompt = `Act as a procurement sourcing specialist for Northwind, a UK industrial manufacturer. We currently single-source ${req.product} from one supplier (Helios Components, SE Asia), which has just raised prices 12%, missed deliveries and become a supply risk. Identify 10 alternative suppliers of ${req.product}. Preferred locations: ${locs}. Must-haves: ${reqs}. For each supplier consider manufacturing capability, geographic coverage, quality certifications, sustainability credentials and financial stability. Present the results as a comparison table with columns: Supplier | Country | Capability | ESG | Notes.`;
  const listText = longlist.filter((r) => (r.supplier || "").trim()).map((r) => `${r.supplier} | ${r.country} | ${r.capability} | ${r.esg} | ${r.notes}`).join("\n");
  const evalPrompt = `Here is my supplier longlist:\nSupplier | Country | Capability | ESG | Notes\n${listText || "[paste your longlist here]"}\n\nCompare these suppliers against the following requirements and rank them from most suitable to least suitable, explaining your reasoning for each: Quality, Delivery capability, ESG, Innovation, Cost competitiveness. Present as a ranked comparison table with a one-line rationale per supplier.`;
  const execPrompt = `Prepare a one-page executive summary for the CPO recommending the three strongest alternative suppliers to Helios Components for ${req.product}. For each, give the key benefits, the main risks, and a recommended next step (e.g. RFI, sample order, site audit). End with a single clear recommendation.`;
  const filled = longlist.filter((r) => (r.supplier || "").trim()).length;

  const chip = (on) => ({ cursor: "pointer", border: `1px solid ${on ? C.teal : C.line}`, background: on ? C.teal : "#fff", color: on ? "#fff" : C.body, borderRadius: 999, padding: "5px 11px", fontSize: 12.5, fontWeight: 600, fontFamily: sans });
  const tin = { width: "100%", boxSizing: "border-box", fontFamily: sans, fontSize: 12.5, padding: "5px 7px", border: `1px solid ${C.line}`, borderRadius: 6, color: C.ink, background: "#fff" };
  const th = { textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 700, padding: "0 6px 5px" };
  const td = { padding: "3px 4px", verticalAlign: "top" };
  const Prompt = ({ label, hint, text, k }) => (
    <Card style={{ padding: 12, marginBottom: 10, borderLeft: `4px solid ${C.gold}` }}>
      <H size={15}>{label}</H>
      {hint && <p style={{ fontSize: 12.5, color: C.muted, margin: "2px 0 6px" }}>{hint}</p>}
      <div style={{ background: C.light, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: C.ink, whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{text}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <Btn small kind="ghost" onClick={() => copy(text, k)}>{copied === k ? <Check size={13} /> : <Copy size={13} />}{copied === k ? "Copied" : "Copy prompt"}</Btn>
        <Btn small onClick={() => go("chat")}><MessageSquare size={13} />Open AI Chat</Btn>
      </div>
    </Card>
  );
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.redl, border: `1px solid ${C.red}`, borderRadius: 10, padding: "10px 13px", margin: "8px 0 14px", fontSize: 13, color: C.ink }}>
        <strong style={{ color: C.red }}>The trigger:</strong> single-source <strong>Helios Components</strong> — +12% price, late deliveries, rising risk. You have <strong>20 minutes</strong> to produce a longlist, a top-3 shortlist and a recommendation.
        <div style={{ marginTop: 8 }}><Btn small onClick={() => go("chat")}><MessageSquare size={13} />Open AI Chat</Btn></div>
      </div>

      <Card style={{ padding: 12, marginBottom: 10, borderLeft: `4px solid ${C.teal}` }}>
        <H size={15}>Step 1 · Define your requirements</H>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", margin: "8px 0 4px" }}>Product / service required</label>
        <input value={req.product} onChange={(e) => setReq({ product: e.target.value })} style={{ ...tin, fontSize: 13.5, padding: "7px 9px" }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: "10px 0 5px" }}>Location preference</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{DISC_LOCS.map((l) => <button key={l} onClick={() => toggle("locations", l)} style={chip(req.locations.includes(l))}>{l}</button>)}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: "12px 0 5px" }}>Supplier requirements</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{DISC_REQS.map((r) => <button key={r} onClick={() => toggle("reqs", r)} style={chip(req.reqs.includes(r))}>{r}</button>)}</div>
      </Card>

      <Prompt label="Step 2 · AI supplier search prompt" hint="Built live from your requirements above — copy it into AI Chat to generate the longlist." text={searchPrompt} k="search" />

      <Card style={{ padding: 12, marginBottom: 10, borderLeft: `4px solid ${C.teal}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <H size={15}>Step 3 · Build your supplier longlist</H>
          <span style={{ fontSize: 12, color: C.muted }}>{filled} added</span>
          <Btn small kind="ghost" onClick={() => copy(listText, "list")} disabled={!listText} style={{ marginLeft: "auto" }}>{copied === "list" ? <Check size={13} /> : <Copy size={13} />}{copied === "list" ? "Copied" : "Copy longlist"}</Btn>
        </div>
        <p style={{ fontSize: 12.5, color: C.muted, margin: "4px 0 8px" }}>Paste the AI's results in here (aim for ~10), screening as you go — drop anything that looks invented or unqualified.</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 580 }}>
            <thead><tr>{["Supplier", "Country", "Capability", "ESG", "Notes", ""].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {longlist.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...td, minWidth: 130 }}><input style={tin} value={r.supplier} onChange={(e) => setRow(i, { supplier: e.target.value })} placeholder={`Supplier ${i + 1}`} /></td>
                  <td style={{ ...td, minWidth: 90 }}><input style={tin} value={r.country} onChange={(e) => setRow(i, { country: e.target.value })} placeholder="Country" /></td>
                  <td style={{ ...td, minWidth: 90 }}><input style={tin} value={r.capability} onChange={(e) => setRow(i, { capability: e.target.value })} placeholder="High/Med/Low" /></td>
                  <td style={{ ...td, minWidth: 90 }}><input style={tin} value={r.esg} onChange={(e) => setRow(i, { esg: e.target.value })} placeholder="Strong/Mod…" /></td>
                  <td style={{ ...td, minWidth: 130 }}><input style={tin} value={r.notes} onChange={(e) => setRow(i, { notes: e.target.value })} placeholder="Notes" /></td>
                  <td style={td}><button onClick={() => delRow(i)} title="Remove" style={{ border: "none", background: "none", cursor: "pointer", color: C.muted, padding: 4 }}><X size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8 }}><Btn small kind="ghost" onClick={addRow}><Plus size={13} />Add supplier</Btn></div>
      </Card>

      <Prompt label="Step 4 · AI supplier evaluation & ranking" hint="Includes your longlist — AI ranks them on quality, delivery, ESG, innovation and cost." text={evalPrompt} k="eval" />
      <Prompt label="Step 5 · Executive recommendation" hint="A one-page CPO summary of your strongest three, with benefits, risks and next steps." text={execPrompt} k="exec" />

      <Card style={{ padding: 12, marginBottom: 10, borderLeft: `4px solid ${C.deep}` }}>
        <H size={15}>Debrief — what did AI change?</H>
        <p style={{ fontSize: 12.5, color: C.muted, margin: "2px 0 6px" }}>Traditionally this is days–weeks of research; here it's ~20 minutes. Did AI surface suppliers you'd not have considered? What was missing? What still needs human validation?</p>
        <textarea value={debrief} onChange={(e) => save(req, longlist, e.target.value)} rows={4} placeholder="Your reflections — time saved, surprises, gaps, and what you'd validate before engaging any supplier…" style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 }} />
      </Card>

      <div style={{ background: C.cardl, borderRadius: 10, padding: "9px 13px", fontSize: 12.5, color: C.body, marginBottom: 4 }}>
        <strong style={{ color: C.navy }}>Advanced (per-table) version:</strong> swap the category for a harder one — {DISC_ADVANCED.join(" · ")} — and present your search strategy, longlist, top 3 and the prompts you used.
      </div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
const SC_COLORS = [C.teal, C.amber, C.red, C.mint, C.gold, C.deep, C.navy];
function ScorecardBody({ a, wk, patch, note, setNote, complete, go }) {
  const cats = wk.cats || (a.categories || []).map(([name, w]) => ({ name, w }));
  const total = cats.reduce((s, c) => s + (Number(c.w) || 0), 0);
  const [copied, setCopied] = useState(false);
  const apply = (n) => { const t = n.reduce((s, c) => s + (Number(c.w) || 0), 0); patch({ cats: n }); if (t === 100) complete(); setNote(`Weights: ${n.map((c) => `${c.name} ${c.w}%`).join(", ")} (total ${t}%)`); };
  const setW = (i, v) => apply(cats.map((c, j) => j === i ? { ...c, w: Math.max(0, Number(v) || 0) } : c));
  const reset = () => apply((a.categories || []).map(([name, w]) => ({ name, w })));
  const data = "- Helios — 91% on-time, 1.8% defects, High risk (single-source, SE Asia), ESG medium\n- Meridian — 96% on-time, 0.4% defects, Medium risk, ESG lower (high-carbon steel)\n- Castore — 88% on-time (worsening), service quality, Medium risk, ESG medium\n- Aurora — 82% on-time, 3.1% defects, High risk, ESG medium\n- Sahara — 90% on-time, 1.2% defects, High risk (single-source), ESG medium";
  const prompt = `You are a procurement analyst. Build a weighted supplier scorecard using these category weights: ${cats.map((c) => `${c.name} ${c.w}%`).join(", ")}.\nScore each supplier 0–100 per category, apply the weights to get an overall score, rank them, and recommend one action for the lowest scorer.\nSuppliers:\n${data}\n(For Innovation, infer from the profile or note where you'd need more data.)\nReturn a table: Supplier, each category score, weighted total, rank and a recommended action. Show the weighting in the header. Also present the ranked overall scores as a bar chart.`;
  const template = `SUPPLIER SCORECARD TEMPLATE\n\nWeighting model:\n${cats.map((c) => `- ${c.name}: ${c.w}%`).join("\n")}\n\nPrompt to run each cycle:\n${prompt}`;
  const copy = async () => { try { await navigator.clipboard.writeText(template); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch (e) {} };
  const inp = { fontFamily: sans, fontSize: 13, padding: "6px 8px", border: `1px solid ${C.line}`, borderRadius: 7, color: C.ink, background: "#fff", width: 56, textAlign: "center" };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "6px 0 8px" }}>Step 1 · Design your weighting (must total 100%)</div>
      <div style={{ display: "grid", gap: 6, marginBottom: 8 }}>
        {cats.map((c, i) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: SC_COLORS[i % SC_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, color: C.ink, minWidth: 110 }}>{c.name}</span>
            <input value={c.w} onChange={(e) => setW(i, e.target.value.replace(/[^0-9]/g, ""))} style={inp} /><span style={{ fontSize: 12.5, color: C.muted }}>%</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", height: 14, borderRadius: 99, overflow: "hidden", border: `1px solid ${C.line}`, marginBottom: 6 }}>
        {cats.map((c, i) => <div key={c.name} title={`${c.name} ${c.w}%`} style={{ width: `${total ? (Number(c.w) || 0) / total * 100 : 0}%`, background: SC_COLORS[i % SC_COLORS.length] }} />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: total === 100 ? C.green : C.amber }}>Total: {total}% {total === 100 ? "✓" : "— adjust to 100%"}</span>
        <Btn small kind="ghost" onClick={reset}><RefreshCw size={13} />Reset weights</Btn>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 2 · Let AI score & rank</div>
      <PromptBox text={prompt} />
      <div style={{ display: "flex", gap: 8, margin: "10px 0", flexWrap: "wrap" }}>
        <Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn>
        <Btn small kind="ghost" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy template"}</Btn>
      </div>
      <div style={{ marginTop: 4, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function SignalsBody({ a, wk, patch, note, setNote, complete, go }) {
  const signs = wk.signs || [];
  const risks = wk.risks || "";
  const actions = wk.actions || "";
  const writeNote = (st) => {
    const o = { signs, risks, actions, ...st };
    setNote(`Warning signs: ${(o.signs || []).join("; ") || "—"}\nFuture risks: ${o.risks || "—"}\nActions now: ${o.actions || "—"}`);
    if ((o.signs || []).length && (o.risks || "").trim() && (o.actions || "").trim()) complete();
  };
  const set = (st) => { patch(st); writeNote(st); };
  const toggle = (x) => set({ signs: signs.includes(x) ? signs.filter((y) => y !== x) : [...signs, x] });
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 14px" }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>THE SCENARIO</span><br />{a.scenario}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Step 1 · Spot the genuine warning signs <span style={{ fontWeight: 400, color: C.muted }}>(don't be reassured by the good numbers)</span></div>
      <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
        {(a.signs || []).map((s) => { const sel = signs.includes(s); return (
          <button key={s} onClick={() => toggle(s)} style={{ cursor: "pointer", textAlign: "left", fontFamily: sans, fontSize: 13.5, fontWeight: 600, padding: "9px 11px", borderRadius: 9, border: `1px solid ${sel ? C.teal : C.line}`, background: sel ? C.cardl : "#fff", color: C.ink, display: "flex", alignItems: "center", gap: 9 }}>
            {sel ? <CheckCircle2 size={16} color={C.teal} /> : <Circle size={16} color={C.muted} />}<span>{s}</span>
          </button>
        ); })}
      </div>
      <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
        <div><div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 2 · Future risks <span style={{ fontWeight: 400, color: C.muted }}>(what could these signals lead to?)</span></div><textarea value={risks} onChange={(e) => set({ risks: e.target.value })} rows={3} placeholder="e.g. capacity strain → late deliveries; financial distress → supply interruption…" style={ta} /></div>
        <div><div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 3 · What procurement should do now</div><textarea value={actions} onChange={(e) => set({ actions: e.target.value })} rows={3} placeholder="e.g. request a financial & capacity assurance, raise monitoring, pre-qualify an alternative…" style={ta} /></div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Step 4 · Generate the AI early-warning report</div>
      <PromptBox text={a.prompt} />
      <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function HealthScoreBody({ a, wk, patch, note, setNote, complete }) {
  const factors = wk.factors || (a.factors || []).map(([name, w]) => ({ name, w }));
  const data = a.data || [];
  const total = factors.reduce((s, f) => s + (Number(f.w) || 0), 0);
  const fin = (c) => ({ Good: 90, Fair: 60, Poor: 25 }[c] != null ? { Good: 90, Fair: 60, Poor: 25 }[c] : 50);
  const wf = (t) => ({ Low: 90, Medium: 60, High: 25 }[t] != null ? { Low: 90, Medium: 60, High: 25 }[t] : 50);
  const subOf = (d) => ({ "Delivery": Math.max(0, Math.min(100, Number(d.otd) || 0)), "Quality": Math.max(0, Math.round(100 - (Number(d.defects) || 0) * 12.5)), "Financial Health": fin(d.credit), "Workforce Stability": wf(d.turnover) });
  const scoreWith = (d, facs, tot) => { const s = subOf(d); return Math.round(facs.reduce((acc, f) => acc + (s[f.name] || 0) * (Number(f.w) || 0), 0) / (tot || 1)); };
  const writeNote = (facs) => { const t = facs.reduce((s, f) => s + (Number(f.w) || 0), 0); const rank = [...data].map((d) => ({ n: d.name, sc: scoreWith(d, facs, t) })).sort((x, y) => y.sc - x.sc); setNote(`Weights: ${facs.map((f) => `${f.name} ${f.w}%`).join(", ")} (total ${t}%)\nRanking: ${rank.map((r, i) => `${i + 1}. ${r.n} (${r.sc})`).join(" · ")}`); if (t === 100) complete(); };
  const setW = (i, v) => { const n = factors.map((f, j) => j === i ? { ...f, w: Math.max(0, Number(v) || 0) } : f); patch({ factors: n }); writeNote(n); };
  const reset = () => { const n = (a.factors || []).map(([name, w]) => ({ name, w })); patch({ factors: n }); writeNote(n); };
  const scored = data.map((d) => ({ ...d, sub: subOf(d), score: scoreWith(d, factors, total) })).sort((x, y) => y.score - x.score);
  const riskColor = (sc) => sc >= 75 ? C.green : sc >= 60 ? C.amber : C.red;
  const fcol = [C.teal, C.amber, C.red, C.mint];
  const inp = { fontFamily: sans, fontSize: 13, padding: "6px 8px", border: `1px solid ${C.line}`, borderRadius: 7, color: C.ink, background: "#fff", width: 54, textAlign: "center" };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "6px 0 8px" }}>Step 1 · Set your factor weights (must total 100%)</div>
      <div style={{ display: "grid", gap: 6, marginBottom: 8 }}>
        {factors.map((f, i) => (
          <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: fcol[i % fcol.length], flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, color: C.ink, minWidth: 150 }}>{f.name}</span>
            <input value={f.w} onChange={(e) => setW(i, e.target.value.replace(/[^0-9]/g, ""))} style={inp} /><span style={{ fontSize: 12.5, color: C.muted }}>%</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: total === 100 ? C.green : C.amber }}>Total: {total}% {total === 100 ? "✓" : "— adjust to 100%"}</span>
        <Btn small kind="ghost" onClick={reset}><RefreshCw size={13} />Reset</Btn>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "0 0 6px" }}>Step 2 · Live ranking <span style={{ fontWeight: 400, color: C.muted }}>(updates as you change the weights)</span></div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13, minWidth: 620 }}>
          <thead><tr style={{ background: C.deep }}>
            <th style={thC}>#</th><th style={thL}>Supplier</th>{factors.map((f) => <th key={f.name} style={thC}>{f.name.split(" ")[0]}<br /><span style={{ fontWeight: 400, fontSize: 10 }}>{f.w}%</span></th>)}<th style={thC}>Health /100</th>
          </tr></thead>
          <tbody>
            {scored.map((d, i) => (
              <tr key={d.name} style={{ background: i % 2 ? C.light : "#fff" }}>
                <td style={{ ...tdC, fontWeight: 700, color: C.muted }}>{i + 1}</td>
                <td style={{ padding: "7px 9px", borderTop: `1px solid ${C.line}` }}><strong style={{ color: C.navy }}>{d.name}</strong><div style={{ fontSize: 11, color: C.muted }}>{d.otd}% OTD · {d.defects}% def · {d.credit} credit · {d.turnover} turnover</div></td>
                {factors.map((f) => <td key={f.name} style={{ ...tdC, color: C.body }}>{d.sub[f.name]}</td>)}
                <td style={tdC}><Pill bg={riskColor(d.score)} fg="#fff">{d.score}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11.5, color: C.muted, margin: "8px 0 0" }}>Each factor becomes a 0–100 score, multiplied by its weight and summed. Lowest health = highest risk. Try shifting weight onto Financial Health and Workforce Stability and watch the ranking move.</p>
      <div style={{ marginTop: 14, background: C.cardl, borderLeft: `4px solid ${C.teal}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Debrief: </strong>AI performs a far more sophisticated version of this continuously — across hundreds of signals, updated in real time, not once a quarter.</div>
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function ConcentrationBody({ a, wk, patch, note, setNote, complete, go }) {
  const revealed = !!wk.revealed;
  const f = wk.fields || { risk: "", impact: "", mitigation: "" };
  const writeNote = (x) => { const o = { ...f, ...x }; setNote(`Hidden risk: ${o.risk || "—"}\nConsequences/impact: ${o.impact || "—"}\nMitigation: ${o.mitigation || "—"}`); if ((o.risk || "").trim() && (o.impact || "").trim() && (o.mitigation || "").trim()) complete(); };
  const set = (x) => { patch({ fields: { ...f, ...x } }); writeNote(x); };
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "6px 0 6px" }}>Step 1 · The Tier-1 view {revealed ? "— and the hidden Tier-2 source" : "— looks nicely diversified"}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13, minWidth: 360 }}>
          <thead><tr style={{ background: C.deep }}><th style={thL}>Tier-1 supplier</th><th style={thC}>Spend</th>{revealed && <th style={thC}>Tier-2 source</th>}</tr></thead>
          <tbody>{a.tier1.map(([n, s], i) => (
            <tr key={n} style={{ background: i % 2 ? C.light : "#fff" }}><td style={{ padding: "7px 9px", borderTop: `1px solid ${C.line}` }}><strong style={{ color: C.navy }}>{n}</strong></td><td style={tdC}>{s}</td>{revealed && <td style={{ ...tdC, color: C.red, fontWeight: 700 }}>{a.tier2}</td>}</tr>
          ))}</tbody>
        </table>
      </div>
      {!revealed ? (
        <div style={{ marginTop: 12 }}><Btn small onClick={() => patch({ revealed: true })}><Sparkles size={14} />Reveal the AI Tier-2 mapping</Btn></div>
      ) : (
        <div style={{ marginTop: 10, background: C.redl, border: `1px solid ${C.red}`, borderRadius: 10, padding: "10px 13px", fontSize: 13.5, fontWeight: 700, color: C.red, display: "flex", gap: 8, alignItems: "center" }}><AlertTriangle size={17} />100% concentration — every Tier-1 supplier depends on {a.tier2}. The "diversified" base is a single point of failure.</div>
      )}
      {revealed && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div><div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>The hidden risk</div><textarea value={f.risk} onChange={(e) => set({ risk: e.target.value })} rows={2} placeholder="What's the real risk the Tier-1 view hides?" style={ta} /></div>
            <div><div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Consequences & business impact</div><textarea value={f.impact} onChange={(e) => set({ impact: e.target.value })} rows={2} placeholder="What happens — and what does it cost — if the Tier-2 source fails?" style={ta} /></div>
            <div><div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Recommended mitigation actions</div><textarea value={f.mitigation} onChange={(e) => set({ mitigation: e.target.value })} rows={2} placeholder="How do you de-risk this concentration?" style={ta} /></div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "14px 0 6px" }}>Check with AI</div>
          <PromptBox text={a.prompt} />
          <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
          {a.debrief && <div style={{ marginTop: 12, background: C.cardl, borderRadius: 10, padding: "10px 13px" }}><div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>DEBRIEF</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.body, lineHeight: 1.5 }}>{a.debrief.map((q, i) => <li key={i}>{q}</li>)}</ul></div>}
        </div>
      )}
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function RiskScoreBody({ a, wk, patch, note, setNote, complete }) {
  const factors = wk.factors || (a.factors || []).map(([name, w]) => ({ name, w }));
  const data = a.data || [];
  const total = factors.reduce((s, f) => s + (Number(f.w) || 0), 0);
  const riskOf = (fname, d) => {
    if (fname === "Financial Risk") return ({ Good: 20, Fair: 50, Poor: 85 }[d.fin] != null ? { Good: 20, Fair: 50, Poor: 85 }[d.fin] : 50);
    if (fname === "Operational Risk") return ({ Stable: 20, Unstable: 80 }[d.ops] != null ? { Stable: 20, Unstable: 80 }[d.ops] : 50);
    if (fname === "ESG Risk") return ({ High: 20, Medium: 50, Low: 85 }[d.esg] != null ? { High: 20, Medium: 50, Low: 85 }[d.esg] : 50);
    if (fname === "Cyber Risk") return ({ Low: 20, Medium: 55, High: 90 }[d.cyber] != null ? { Low: 20, Medium: 55, High: 90 }[d.cyber] : 50);
    return 50;
  };
  const raw = (fname, d) => fname === "Financial Risk" ? d.fin : fname === "Operational Risk" ? d.ops : fname === "ESG Risk" ? d.esg : d.cyber;
  const scoreWith = (d, facs, tot) => Math.round(facs.reduce((acc, f) => acc + riskOf(f.name, d) * (Number(f.w) || 0), 0) / (tot || 1));
  const writeNote = (facs) => { const t = facs.reduce((s, f) => s + (Number(f.w) || 0), 0); const rank = [...data].map((d) => ({ n: d.name, sc: scoreWith(d, facs, t) })).sort((x, y) => y.sc - x.sc); setNote(`Weights: ${facs.map((f) => `${f.name} ${f.w}%`).join(", ")} (total ${t}%)\nRisk ranking: ${rank.map((r, i) => `${i + 1}. ${r.n} (${r.sc})`).join(" · ")}`); if (t === 100) complete(); };
  const setW = (i, v) => { const n = factors.map((f, j) => j === i ? { ...f, w: Math.max(0, Number(v) || 0) } : f); patch({ factors: n }); writeNote(n); };
  const reset = () => { const n = (a.factors || []).map(([name, w]) => ({ name, w })); patch({ factors: n }); writeNote(n); };
  const heat = (sc) => sc >= 70 ? C.red : sc >= 45 ? C.amber : C.green;
  const scored = data.map((d) => ({ ...d, score: scoreWith(d, factors, total) })).sort((x, y) => y.score - x.score);
  const inp = { fontFamily: sans, fontSize: 13, padding: "6px 8px", border: `1px solid ${C.line}`, borderRadius: 7, color: C.ink, background: "#fff", width: 54, textAlign: "center" };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "6px 0 8px" }}>Step 1 · Weight the risk dimensions (must total 100%)</div>
      <div style={{ display: "grid", gap: 6, marginBottom: 8 }}>
        {factors.map((f, i) => (
          <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13.5, color: C.ink, minWidth: 150 }}>{f.name}</span>
            <input value={f.w} onChange={(e) => setW(i, e.target.value.replace(/[^0-9]/g, ""))} style={inp} /><span style={{ fontSize: 12.5, color: C.muted }}>%</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: total === 100 ? C.green : C.amber }}>Total: {total}% {total === 100 ? "✓" : "— adjust to 100%"}</span>
        <Btn small kind="ghost" onClick={reset}><RefreshCw size={13} />Reset</Btn>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "0 0 6px" }}>Step 2 · Risk heat map <span style={{ fontWeight: 400, color: C.muted }}>(highest risk first; red = worst)</span></div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13, minWidth: 600 }}>
          <thead><tr style={{ background: C.deep }}><th style={thC}>#</th><th style={thL}>Supplier</th>{factors.map((f) => <th key={f.name} style={thC}>{f.name.split(" ")[0]}</th>)}<th style={thC}>Risk /100</th><th style={thC}>Priority</th></tr></thead>
          <tbody>
            {scored.map((d, i) => { const pr = d.score >= 70 ? "Immediate" : d.score >= 45 ? "Watch" : "Monitor"; return (
              <tr key={d.name} style={{ background: i % 2 ? C.light : "#fff" }}>
                <td style={{ ...tdC, fontWeight: 700, color: C.muted }}>{i + 1}</td>
                <td style={{ padding: "7px 9px", borderTop: `1px solid ${C.line}` }}><strong style={{ color: C.navy }}>{d.name}</strong></td>
                {factors.map((f) => { const r = riskOf(f.name, d); return <td key={f.name} style={{ ...tdC, background: heat(r), color: "#fff", fontWeight: 600, fontSize: 12 }}>{raw(f.name, d)}</td>; })}
                <td style={tdC}><Pill bg={heat(d.score)} fg="#fff">{d.score}</Pill></td>
                <td style={{ ...tdC, fontWeight: 700, color: heat(d.score) }}>{pr}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "14px 0 6px" }}>Step 3 · Compare with AI</div>
      <PromptBox text={a.prompt} />
      <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ marginTop: 12, background: C.cardl, borderLeft: `4px solid ${C.teal}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Learning point: </strong>AI helps procurement focus on the suppliers that matter most.</div>
      <div style={{ marginTop: 10, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function CrisisBody({ a, wk, patch, note, setNote, complete, go }) {
  const al = a.alert || {};
  const r = wk.resp || {};
  const parts = a.parts || [];
  const writeNote = (x) => { const o = { ...r, ...x }; setNote(parts.map((p) => `${p.label}: ${(o[p.key] || "—")}`).join("\n")); if (parts.every((p) => (o[p.key] || "").trim())) complete(); };
  const set = (k, v) => { patch({ resp: { ...r, [k]: v } }); writeNote({ [k]: v }); };
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ background: C.redl, border: `1px solid ${C.red}`, borderRadius: 10, padding: "12px 14px", margin: "8px 0 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <AlertTriangle size={18} color={C.red} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.red }}>09:00 MONDAY · AI RISK ALERT</span>
          <span style={{ marginLeft: "auto", fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.red }}>{al.score}/100</span>
          <Pill bg={C.red} fg="#fff">CRITICAL</Pill>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{al.supplier}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 8 }}>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 3 }}>SIGNALS DETECTED</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>{(al.signals || []).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 3 }}>BUSINESS EXPOSURE</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>{(al.exposure || []).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 8 }}>You are the procurement leadership team. Build your response:</div>
      <div style={{ display: "grid", gap: 12 }}>
        {parts.map((p, i) => (
          <div key={p.key}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 6 }}><span style={{ color: C.red }}>Part {i + 1}</span> · {p.label}</div>
            <textarea value={r[p.key] || ""} onChange={(e) => set(p.key, e.target.value)} rows={3} placeholder={p.hint} style={ta} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "16px 0 6px" }}>Pressure-test with AI</div>
      <PromptBox text={a.prompt} />
      <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function FrictionBody({ a, wk, patch, note, setNote, complete, go }) {
  const rows = wk.rows || a.seed || [];
  const setRows = (r) => { patch({ rows: r }); if (r.length && r.every((x) => x.friction)) complete(); setNote(r.map((x) => `${x.activity || "?"} (${x.process || "?"}): ${x.friction || "—"} friction`).join("\n")); };
  const upd = (i, k, v) => setRows(rows.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const add = () => setRows([...rows, { activity: "", process: "", friction: "" }]);
  const del = (i) => setRows(rows.filter((_, j) => j !== i));
  const fcolor = (f) => f === "High" ? C.red : f === "Medium" ? C.amber : f === "Low" ? C.green : C.line;
  const prompt = `Review this supplier journey and identify inefficiencies, bottlenecks and opportunities for AI-enabled collaboration.\n\nSupplier journey (activity · current process · friction):\n${rows.filter((r) => r.activity).map((r) => `- ${r.activity}: ${r.process || "?"} (${r.friction || "unrated"} friction)`).join("\n")}\n\nFor each high-friction step, suggest how AI could remove or reduce the friction, and rank the quick wins.`;
  const inp = { fontFamily: sans, fontSize: 12.5, padding: "5px 7px", borderRadius: 7, border: `1px solid ${C.line}`, color: C.ink, background: "#fff", width: "100%", boxSizing: "border-box" };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "6px 0 6px" }}>Steps 1–2 · Map the supplier journey and mark the friction</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13, minWidth: 520 }}>
          <thead><tr style={{ background: C.deep }}><th style={thL}>Supplier activity</th><th style={thL}>Current process</th><th style={thC}>Friction</th><th style={thC}></th></tr></thead>
          <tbody>
            {rows.map((x, i) => (
              <tr key={i} style={{ background: i % 2 ? C.light : "#fff" }}>
                <td style={{ padding: "6px 8px", borderTop: `1px solid ${C.line}` }}><input value={x.activity} onChange={(e) => upd(i, "activity", e.target.value)} placeholder="e.g. registration" style={inp} /></td>
                <td style={{ padding: "6px 8px", borderTop: `1px solid ${C.line}` }}><input value={x.process} onChange={(e) => upd(i, "process", e.target.value)} placeholder="e.g. manual / email / phone" style={inp} /></td>
                <td style={tdC}><div style={{ display: "flex", gap: 4, justifyContent: "center" }}>{["High", "Medium", "Low"].map((f) => <button key={f} onClick={() => upd(i, "friction", f)} title={`${f} friction`} style={{ cursor: "pointer", border: `1px solid ${x.friction === f ? fcolor(f) : C.line}`, background: x.friction === f ? fcolor(f) : "#fff", color: x.friction === f ? "#fff" : C.muted, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>{f[0]}</button>)}</div></td>
                <td style={tdC}><button onClick={() => del(i)} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted }}><X size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0", flexWrap: "wrap" }}><Btn small kind="ghost" onClick={add}><Plus size={14} />Add interaction</Btn><span style={{ fontSize: 11.5, color: C.muted }}>🔴 High · 🟡 Medium · 🟢 Low friction</span></div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "8px 0 6px" }}>Step 3 · Ask AI to find the fixes</div>
      <PromptBox text={prompt} />
      <div style={{ marginTop: 10 }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      {a.debrief && <div style={{ marginTop: 12, background: C.cardl, borderRadius: 10, padding: "10px 13px" }}><div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>DEBRIEF</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.body, lineHeight: 1.5 }}>{a.debrief.map((q, i) => <li key={i}>{q}</li>)}</ul></div>}
      <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
const INNOV_CRIT = ["Cost saving", "Ease", "Sustainability", "Coop needed"];
function InnovSprintBody({ a, wk, patch, note, setNote, complete, go }) {
  const challenge = wk.challenge != null ? wk.challenge : (a.challenge || "");
  const ideas = wk.ideas || [{ name: "", c: {} }, { name: "", c: {} }, { name: "", c: {} }];
  const bc = wk.bc || { benefits: "", risks: "", roadmap: "" };
  const totalOf = (x) => (Number(x.c["Cost saving"]) || 0) + (Number(x.c["Ease"]) || 0) + (Number(x.c["Sustainability"]) || 0) + (6 - (Number(x.c["Coop needed"]) || 3));
  const writeNote = (ch, ids, b) => { setNote(`Challenge: ${ch || "—"}\nIdeas: ${ids.filter((x) => x.name).map((x) => `${x.name} [${INNOV_CRIT.map((cr) => x.c[cr] || "-").join("/")}]`).join("; ") || "—"}\nBusiness case — benefits: ${b.benefits || "—"}; risks: ${b.risks || "—"}; roadmap: ${b.roadmap || "—"}`); if ((ch || "").trim() && ids.some((x) => (x.name || "").trim()) && (b.benefits || "").trim() && (b.risks || "").trim() && (b.roadmap || "").trim()) complete(); };
  const setChallenge = (v) => { patch({ challenge: v }); writeNote(v, ideas, bc); };
  const setIdea = (i, k, v) => { const n = ideas.map((x, j) => j === i ? { ...x, [k]: v } : x); patch({ ideas: n }); writeNote(challenge, n, bc); };
  const setScore = (i, cr, v) => { const n = ideas.map((x, j) => j === i ? { ...x, c: { ...x.c, [cr]: v } } : x); patch({ ideas: n }); writeNote(challenge, n, bc); };
  const setBc = (k, v) => { const n = { ...bc, [k]: v }; patch({ bc: n }); writeNote(challenge, ideas, n); };
  const best = ideas.reduce((bI, x, i) => (x.name && totalOf(x) > (ideas[bI] && ideas[bI].name ? totalOf(ideas[bI]) : -1) ? i : bI), -1);
  const prompt = `Generate innovative supplier-led initiatives that reduce procurement costs by 10%, improve sustainability and enhance supplier collaboration. Focus area: ${challenge || a.challenge}.\nFor each idea give the cost saving, the sustainability benefit, the implementation effort and how much supplier cooperation it needs. Rank them by best overall value.`;
  const sel = { fontFamily: sans, fontSize: 12.5, padding: "4px 6px", borderRadius: 6, border: `1px solid ${C.line}`, color: C.ink, background: "#fff" };
  const ta = { width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: sans, fontSize: 13.5, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff", lineHeight: 1.45 };
  return (
    <div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, marginTop: 4 }}>{a.brief}</p>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "6px 0 6px" }}>Step 1 · Define the challenge</div>
      <input value={challenge} onChange={(e) => setChallenge(e.target.value)} style={{ width: "100%", boxSizing: "border-box", fontFamily: sans, fontSize: 14, padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 8, color: C.ink, background: "#fff" }} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>{(a.examples || []).map((ex) => <button key={ex} onClick={() => setChallenge(ex)} style={{ cursor: "pointer", border: `1px solid ${C.line}`, background: C.light, color: C.body, borderRadius: 999, padding: "4px 10px", fontSize: 12, fontFamily: sans }}>{ex}</button>)}</div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "14px 0 6px" }}>Step 2 · Generate ideas with AI</div>
      <PromptBox text={prompt} />
      <div style={{ margin: "10px 0" }}><Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn></div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "8px 0 6px" }}>Step 3 · Score the ideas (1–5)</div>
      <div style={{ display: "grid", gap: 8 }}>
        {ideas.map((x, i) => (
          <Card key={i} style={{ padding: 10, borderLeft: `4px solid ${i === best && x.name ? C.green : C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input value={x.name} onChange={(e) => setIdea(i, "name", e.target.value)} placeholder={`Idea ${i + 1}`} style={{ ...sel, flex: 1, fontSize: 13.5 }} />
              {i === best && x.name && <Pill bg={C.green} fg="#fff">Top pick · {totalOf(x)}/20</Pill>}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              {INNOV_CRIT.map((cr) => (
                <label key={cr} style={{ fontSize: 11, color: C.muted }}>{cr}<br /><select value={x.c[cr] || ""} onChange={(e) => setScore(i, cr, e.target.value)} style={{ ...sel, marginTop: 3 }}><option value="">—</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <p style={{ fontSize: 11.5, color: C.muted, margin: "6px 0 0" }}>Top pick = highest of cost + ease + sustainability, less the cooperation it needs. Use it as a guide — you choose.</p>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, margin: "16px 0 6px" }}>Step 4 · Business case for your chosen initiative</div>
      <div style={{ display: "grid", gap: 12 }}>
        <div><div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Expected benefits</div><textarea value={bc.benefits} onChange={(e) => setBc("benefits", e.target.value)} rows={2} placeholder="cost, sustainability, relationship benefits…" style={ta} /></div>
        <div><div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Risks</div><textarea value={bc.risks} onChange={(e) => setBc("risks", e.target.value)} rows={2} placeholder="what could go wrong, and how you'd manage it…" style={ta} /></div>
        <div><div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Implementation roadmap</div><textarea value={bc.roadmap} onChange={(e) => setBc("roadmap", e.target.value)} rows={2} placeholder="the key steps and who's involved…" style={ta} /></div>
      </div>
      <div style={{ marginTop: 14, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}><strong style={{ color: C.navy }}>Output: </strong>{a.output}</div>
      <ModelAnswer open={!!wk.reveal} onToggle={() => patch({ reveal: !wk.reveal })} lines={a.model} />
    </div>
  );
}
function Activity({ a, answers, setAnswers, done, setDone, work, setWork, go, backlog, setBacklog }) {
  const wk = work[a.id] || {};
  const patch = (p) => setWork({ ...work, [a.id]: { ...wk, ...p } });
  const note = answers[a.id] || "";
  const setNote = (v) => setAnswers({ ...answers, [a.id]: v });
  const isDone = !!done[a.id];
  const complete = () => setDone({ ...done, [a.id]: true });
  const meta = TYPE_META[a.type] || TYPE_META.reflect;
  const common = { a, wk, patch, note, setNote, complete, go, backlog, setBacklog };
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
        <ActivityGuide meta={meta} a={a} />
        {a.type === "classify" && <ClassifyBody {...common} />}
        {a.type === "spot" && <SpotBody {...common} />}
        {a.type === "reflect" && <ReflectBody {...common} />}
        {a.type === "ai" && <AiBody {...common} />}
        {a.type === "lab" && <LabBody {...common} />}
        {a.type === "case" && <CaseBody {...common} />}
        {a.type === "pain" && <PainBody {...common} />}
        {a.type === "segment" && <SegmentBody {...common} />}
        {a.type === "discovery" && <DiscoveryBody {...common} />}
        {a.type === "health" && <HealthBody {...common} />}
        {a.type === "risk" && <RiskBody {...common} />}
        {a.type === "pack" && <PackBody {...common} />}
        {a.type === "develop" && <DevelopBody {...common} />}
        {a.type === "lifecycle" && <LifecycleBody {...common} />}
        {a.type === "reveal" && <RevealBody {...common} />}
        {a.type === "pick" && <PickBody {...common} />}
        {a.type === "innovate" && <SprintBody {...common} />}
        {a.type === "promptlab" && <PromptLabBody {...common} />}
        {a.type === "scorecard" && <ScorecardBody {...common} />}
        {a.type === "signals" && <SignalsBody {...common} />}
        {a.type === "healthscore" && <HealthScoreBody {...common} />}
        {a.type === "concentration" && <ConcentrationBody {...common} />}
        {a.type === "riskscore" && <RiskScoreBody {...common} />}
        {a.type === "crisis" && <CrisisBody {...common} />}
        {a.type === "friction" && <FrictionBody {...common} />}
        {a.type === "innovsprint" && <InnovSprintBody {...common} />}
      </div>
    </Card>
  );
}

/* ================= MISSIONS ================= */
function LockedPanel({ title, msg, big }) {
  return (
    <Card style={{ textAlign: "center", padding: big ? "30px 20px" : "16px 18px", borderStyle: "dashed", background: C.light }}>
      <div style={{ width: 44, height: 44, borderRadius: 999, background: C.cardl, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><Lock size={20} color={C.muted} /></div>
      <H size={big ? 18 : 15} style={{ color: C.navy }}>{title}</H>
      <p style={{ color: C.muted, fontSize: 13.5, maxWidth: 470, margin: "6px auto 0", lineHeight: 1.5 }}>{msg}</p>
    </Card>
  );
}
function LockedActivity({ a }) {
  const meta = TYPE_META[a.type] || TYPE_META.reflect;
  return (
    <Card style={{ marginBottom: 14, borderLeft: `4px solid ${C.line}`, opacity: 0.9 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: C.muted, borderRadius: 6, padding: "3px 7px" }}>{a.sub}</span>
        <Pill bg={C.muted} fg="#fff">{meta.t}</Pill>
        <H size={16} style={{ color: C.muted }}>{a.title}</H>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: C.amber }}><Lock size={14} /> Locked</span>
      </div>
      <p style={{ color: C.muted, fontSize: 13, margin: "8px 0 0" }}>Your facilitator will open this activity shortly.</p>
    </Card>
  );
}
// Optional grouping of a day's activities into labelled sections (Day 2 has grown
// large). Activities not listed fall in "core". Days with one section render flat.
const DAY_SECTIONS = [
  { id: "core", label: "Core SRM" },
  { id: "applied", label: "AI in SRM — applied exercises" },
  { id: "applied3", label: "AI in contracts & risk — applied exercises" },
  { id: "neg3", label: "Module 2 · AI in negotiation" },
  { id: "mon3", label: "Module 3 · AI risk monitoring" },
  { id: "m2", label: "Module 2 · Predicting performance" },
  { id: "m3", label: "Module 3 · Risk & resilience" },
  { id: "m4", label: "Module 4 · Collaboration & innovation" },
];
const SECTION_OF = {
  "2.0p": "applied", "2.1seg": "applied", "2.1disc": "applied", "2.2hc": "applied", "2.2sc": "applied", "2.3det": "applied", "2.4dev": "applied", "2.4inn": "applied", "2.5pack": "applied", "2.6lab": "applied",
  "2.2li": "m2", "2.2sig": "m2", "2.2hs": "m2",
  "m3hidden": "m3", "m3score": "m3", "m3crisis": "m3",
  "m4friction": "m4", "m4comms": "m4", "m4innov": "m4",
  "3.6cr": "applied3", "3.7itt": "applied3", "3.8clm": "applied3", "3.9hai": "applied3",
  "3.10mind": "neg3", "3.11opt": "neg3", "3.12clause": "neg3",
  "3.13det": "mon3", "3.14pred": "mon3", "3.15cmd": "mon3",
};
function sectionGroups(activities) {
  return DAY_SECTIONS.map((s) => ({ s, items: activities.filter((a) => (SECTION_OF[a.id] || "core") === s.id) })).filter((g) => g.items.length);
}
function DayConfidence({ day, value, onSet }) {
  const labels = ["Not at all", "A little", "Okay", "Confident", "Very confident"];
  return (
    <Card style={{ marginTop: 12, borderLeft: `4px solid ${C.teal}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>How confident do you feel about Day {day} now?</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onSet(n)} title={labels[n - 1]}
            style={{ cursor: "pointer", width: 40, height: 40, borderRadius: 999, fontFamily: serif, fontWeight: 700, fontSize: 16,
              border: `1px solid ${value === n ? C.teal : C.line}`, background: value === n ? C.teal : "#fff", color: value === n ? "#fff" : C.body }}>{n}</button>
        ))}
        {value ? <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>✓ {labels[value - 1]}</span>
               : <span style={{ fontSize: 12.5, color: C.muted }}>1 = not at all · 5 = very confident</span>}
      </div>
    </Card>
  );
}
function Missions({ day, setDay, answers, setAnswers, done, setDone, work, setWork, go, release, confidence, setConfidence, backlog, setBacklog }) {
  const rel = release || { days: [], locked: [] };
  const dayOpen = (n) => rel.days.includes(n);
  const actLocked = (id) => rel.locked.includes(id);
  const d = DAYS[day - 1];
  const open = dayOpen(d.n);
  const checking = release === null;
  const dayDone = d.activities.filter((a) => done[a.id]).length;
  return (
    <div>
      <H size={26}>Daily missions</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>Each task is interactive — sort, spot, build prompts, then reveal the model answer. Everything saves automatically. Your facilitator opens each day as the programme runs.</p>
      <div style={{ display: "flex", gap: 8, margin: "18px 0", flexWrap: "wrap" }}>
        {DAYS.map((x) => {
          const cnt = x.activities.filter((a) => done[a.id]).length;
          const full = cnt === x.activities.length;
          const active = x.n === day;
          const locked = !dayOpen(x.n);
          return (
            <button key={x.n} onClick={() => setDay(x.n)}
              style={{ flex: "1 1 120px", textAlign: "left", cursor: "pointer", borderRadius: 12, padding: "12px 14px", border: `1px solid ${active ? C.teal : C.line}`, background: active ? C.navy : "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: active ? C.gold : C.muted, display: "flex", alignItems: "center", gap: 5 }}>DAY {x.n}{locked && <Lock size={11} color={active ? C.gold : C.muted} />}</div>
              <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: active ? "#fff" : C.navy, margin: "2px 0 6px" }}>{x.title}</div>
              <div style={{ fontSize: 11.5, color: active ? "#cdd9e6" : C.muted }}>{locked ? "🔒 Locked" : full ? "✓ complete" : `${cnt}/${x.activities.length} done`}</div>
            </button>
          );
        })}
      </div>
      <Card style={{ marginBottom: 16, background: C.navy, borderColor: C.navy }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.gold }}>DAY {d.n} · {open ? `${dayDone}/${d.activities.length} ACTIVITIES` : "LOCKED"}</div>
        <H size={24} style={{ color: "#fff", margin: "4px 0" }}>{d.title}</H>
        <p style={{ color: "#cdd9e6", fontSize: 13.5, margin: "0 0 12px" }}>{d.theme}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {d.objectives.map((o, i) => (
            <span key={i} style={{ fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.12)", padding: "4px 10px", borderRadius: 999 }}>{o}</span>
          ))}
        </div>
      </Card>
      {checking ? (
        <Card style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted }}><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 13.5 }}>Checking what's open…</span></Card>
      ) : !open ? (
        <LockedPanel big title={`Day ${d.n} is locked`} msg="Your facilitator will open this day when the session begins. The tabs above show the week ahead — check back shortly, or revisit a day that's already open." />
      ) : (
        <>
          <Card style={{ marginBottom: 14 }}><S2PStrip activeDay={d.n} /></Card>
          {FRAMEWORK[d.n] && (() => { const Cmp = FRAMEWORK[d.n].C; return (
            <Card style={{ marginBottom: 14 }}><H size={15} style={{ marginBottom: 10 }}>{FRAMEWORK[d.n].t}</H><Cmp /></Card>
          ); })()}
          {(() => {
            const renderAct = (a) => actLocked(a.id)
              ? <LockedActivity key={a.id} a={a} />
              : <Activity key={a.id} a={a} answers={answers} setAnswers={setAnswers} done={done} setDone={setDone} work={work} setWork={setWork} go={go} backlog={backlog} setBacklog={setBacklog} />;
            const groups = sectionGroups(d.activities);
            const multi = groups.length > 1;
            return groups.map((g) => (
              <React.Fragment key={g.s.id}>
                {multi && <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0 10px" }}><span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, color: C.teal, textTransform: "uppercase" }}>{g.s.label}</span><span style={{ fontSize: 11, color: C.muted }}>{g.items.length}</span><div style={{ flex: 1, height: 1, background: C.line }} /></div>}
                {g.items.map(renderAct)}
              </React.Fragment>
            ));
          })()}
          {d.takeaway && (
            <Card style={{ marginTop: 4, borderLeft: `4px solid ${C.mint}`, background: C.greenl }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Rocket size={18} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                <div><div style={{ fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: 0.5 }}>TAKE IT BACK TO WORK</div><p style={{ margin: "4px 0 0", fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{d.takeaway}</p></div>
              </div>
            </Card>
          )}
          <DayConfidence day={d.n} value={confidence && confidence[d.n]} onSet={(n) => setConfidence({ ...confidence, [d.n]: n })} />
        </>
      )}
    </div>
  );
}

/* ================= LIVE AI ANALYST (all five days) ================= */
const RISK_SET = ["Helios Components", "Meridian Steel", "Castore Logistics", "Verdant Polymers", "Atlas Freight", "Aurora Electronics", "Sahara Cables"];
const riskBand = (n) => (n >= 80 ? C.amber : n >= 60 ? C.teal : C.mint);
const valBand = (n) => (n >= 70 ? C.teal : n >= 45 ? C.mint : C.muted);
const CONTRACT_PICKS = [
  { value: "C-1001", label: "C-1001 · Helios" }, { value: "C-1002", label: "C-1002 · Meridian" },
  { value: "C-1003", label: "C-1003 · Castore" }, { value: "C-1044", label: "C-1044 · Aurora" },
  { value: "C-1071", label: "C-1071 · Verdant" }, { value: "C-2003", label: "C-2003 · Sahara" },
  { value: "C-3001", label: "C-3001 · Summit" },
];
const PHASE_COLOR = { "Foundations": C.deep, "Quick wins": C.mint, "Scale": C.teal, "Transform": C.amber };
const shortName = (v) => { v = String(v); return v.length <= 15 ? v : v.slice(0, 14) + "…"; };

const AI_DAYS = [
  { n: 1, kind: "opportunity-map", tab: "Day 1", title: "AI Opportunity Map",
    blurb: "Watch the AI scan Northwind and propose where AI could help — each idea labelled automate or augment and scored by value.",
    arr: "items", nameKey: "title", nameLabel: "Opportunity", scoreKey: "value", scoreLabel: "Value", band: valBand,
    cols: [{ key: "type", label: "Type" }, { key: "goal", label: "Goal" }, { key: "ease", label: "Ease", align: "right" }], pick: null },
  { n: 2, kind: "supplier-risk", tab: "Day 2", title: "Supplier Risk",
    blurb: "Back your judgement first, then watch the AI rank Northwind's suppliers by supply risk and see how you compare.",
    arr: "suppliers", nameKey: "name", nameLabel: "Supplier", scoreKey: "risk", scoreLabel: "Risk", band: riskBand,
    cols: [{ key: "driver", label: "Main driver" }, { key: "mitigation", label: "Mitigation" }],
    pick: { n: 3, prompt: "Which 3 suppliers carry the highest supply risk?", items: RISK_SET.map((s) => ({ value: s, label: s })), top: (r) => (r.suppliers || []).slice(0, 3).map((s) => s.name) } },
  { n: 3, kind: "contract-risk", tab: "Day 3", title: "Contract Risk",
    blurb: "Pick the contracts you'd act on first, then see the AI's triage of the portfolio by risk and urgency.",
    arr: "contracts", nameKey: "ref", nameLabel: "Contract", scoreKey: "risk", scoreLabel: "Risk", band: riskBand,
    cols: [{ key: "supplier", label: "Supplier" }, { key: "issue", label: "Issue" }, { key: "action", label: "Next action" }],
    pick: { n: 2, prompt: "Which 2 contracts would you act on first?", items: CONTRACT_PICKS, top: (r) => (r.contracts || []).slice(0, 2).map((c) => c.ref) } },
  { n: 4, kind: "logistics-gains", tab: "Day 4", title: "Logistics Gains",
    blurb: "Watch the AI find the highest-payback logistics improvements, with their effect on cost, service and carbon.",
    arr: "improvements", nameKey: "title", nameLabel: "Improvement", scoreKey: "payback", scoreLabel: "Payback", band: valBand,
    cols: [{ key: "cost", label: "Cost" }, { key: "service", label: "Service" }, { key: "carbon", label: "Carbon" }], pick: null },
  { n: 5, kind: "roadmap", tab: "Day 5", title: "Strategy Roadmap",
    blurb: "The AI turns YOUR Opportunity Backlog into a phased roadmap, live. Add items in the Backlog first for a richer result.",
    roadmap: true, pick: null },
];

function AiAnalyst({ code, backlog }) {
  const [dayN, setDayN] = useState(2);
  const cfg = AI_DAYS.find((d) => d.n === dayN);
  const [picks, setPicks] = useState([]);
  const [phase, setPhase] = useState("intro"); // intro | loading | result
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => { setPicks([]); setPhase("intro"); setResult(null); setErr(""); }, [dayN]);

  const togglePick = (v) => {
    if (phase === "result" || !cfg.pick) return;
    setPicks((p) => (p.includes(v) ? p.filter((x) => x !== v) : p.length < cfg.pick.n ? [...p, v] : p));
  };
  const run = async () => {
    setPhase("loading"); setErr("");
    const extra = cfg.kind === "roadmap" ? { backlog } : undefined;
    const r = await apiAnalyze(cfg.kind, code, extra);
    if (!r.ok || !r.result) { setErr(r.error || "The AI couldn't run."); setPhase(result ? "result" : "intro"); return; }
    setResult(r.result); setPhase("result");
  };
  const canRun = !cfg.pick || picks.length === cfg.pick.n;
  const aiTop = cfg.pick && result ? cfg.pick.top(result) : [];
  const matched = cfg.pick ? picks.filter((p) => aiTop.includes(p)).length : 0;
  const arr = result && !cfg.roadmap ? result[cfg.arr] || [] : [];
  const chartData = arr.map((x) => ({ name: shortName(x[cfg.nameKey]), full: String(x[cfg.nameKey]), score: Number(x[cfg.scoreKey]) || 0 }));

  return (
    <Card style={{ marginBottom: 18, borderTop: `4px solid ${C.amber}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Cpu size={19} color={C.amber} /><H size={18}>Live AI Analyst</H></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {AI_DAYS.map((d) => (
          <button key={d.n} onClick={() => setDayN(d.n)}
            style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 700, padding: "6px 12px", borderRadius: 999, cursor: "pointer",
              border: `1px solid ${dayN === d.n ? C.teal : C.line}`, background: dayN === d.n ? C.teal : "#fff", color: dayN === d.n ? "#fff" : C.body }}>{d.tab}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <H size={17}>{cfg.title}</H>
        <Pill bg={C.deep} fg="#fff">{cfg.tab}</Pill>
      </div>
      <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, margin: "8px 0 12px" }}>{cfg.blurb}</p>

      {cfg.pick && phase !== "result" && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{cfg.pick.prompt}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
            {cfg.pick.items.map((it) => {
              const sel = picks.includes(it.value);
              return (
                <button key={it.value} onClick={() => togglePick(it.value)} disabled={phase === "loading"}
                  style={{ cursor: phase === "loading" ? "default" : "pointer", textAlign: "left", fontFamily: sans, fontSize: 13, fontWeight: 600,
                    padding: "9px 11px", borderRadius: 9, display: "flex", alignItems: "center", gap: 8,
                    border: `1px solid ${sel ? C.teal : C.line}`, background: sel ? C.cardl : "#fff", color: C.ink }}>
                  {sel ? <CheckCircle2 size={15} color={C.teal} /> : <Circle size={15} color={C.muted} />}<span style={{ flex: 1 }}>{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase !== "loading" && phase !== "result" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Btn onClick={run} disabled={!canRun}><Sparkles size={15} />{cfg.pick ? "Reveal the AI's analysis" : "Run the AI analysis"}</Btn>
          {cfg.pick && <span style={{ fontSize: 12.5, color: C.muted }}>{picks.length}/{cfg.pick.n} picked</span>}
          {cfg.roadmap && <span style={{ fontSize: 12.5, color: C.muted }}>{(backlog || []).length} backlog item{(backlog || []).length === 1 ? "" : "s"}</span>}
        </div>
      )}
      {phase === "loading" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.deep, fontSize: 14, fontWeight: 600, padding: "6px 0" }}>
          <RefreshCw size={17} style={{ animation: "spin 1s linear infinite" }} /> The AI is analysing the Northwind case…
        </div>
      )}
      {err && <p style={{ color: C.red, fontSize: 13, marginTop: 8 }}>⚠ {err}</p>}

      {phase === "result" && result && (
        <div>
          {cfg.pick && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: matched >= Math.ceil(cfg.pick.n / 2) ? C.greenl : C.cardl, border: `1px solid ${matched >= Math.ceil(cfg.pick.n / 2) ? C.mint : C.line}`, borderRadius: 10, padding: "10px 14px", margin: "6px 0 14px" }}>
              <Trophy size={18} color={matched >= Math.ceil(cfg.pick.n / 2) ? C.green : C.teal} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>You matched {matched} of the AI's top {cfg.pick.n} — {matched === cfg.pick.n ? "perfect read!" : matched === 0 ? "the AI sees it differently." : "good instincts."}</span>
            </div>
          )}

          <div style={{ background: C.navy, color: "#fff", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, marginBottom: 14 }}>
            <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>AI EXECUTIVE SUMMARY</span><br />{result.narrative}
          </div>

          {cfg.roadmap ? (
            <div style={{ display: "grid", gap: 10 }}>
              {(result.phases || []).map((ph, pi) => (
                <Card key={pi} style={{ borderLeft: `4px solid ${PHASE_COLOR[ph.phase] || C.teal}`, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: (ph.items || []).length ? 8 : 0 }}>
                    <H size={16}>{ph.phase}</H><Pill bg={PHASE_COLOR[ph.phase] || C.teal} fg="#fff">{(ph.items || []).length}</Pill>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {(ph.items || []).map((it, i) => (
                      <div key={i} style={{ fontSize: 13, color: C.ink, background: C.light, border: `1px solid ${C.line}`, borderRadius: 8, padding: "7px 10px" }}>
                        <strong style={{ color: C.navy }}>{it.title}</strong>{it.why ? <span style={{ color: C.muted }}> — {it.why}</span> : null}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div>
              <H size={15} style={{ marginBottom: 6 }}>{cfg.scoreLabel} ranking (AI-scored 0–100)</H>
              <div style={{ height: Math.max(180, chartData.length * 32) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 24 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: C.muted }} />
                    <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: C.body }} />
                    <Tooltip formatter={(v) => [`${v}/100`, cfg.scoreLabel]} labelFormatter={(l, p) => (p && p[0] ? p[0].payload.full : l)} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={cfg.band(d.score)} stroke={picks.includes(d.full) ? C.navy : "none"} strokeWidth={picks.includes(d.full) ? 2 : 0} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {cfg.pick && <p style={{ fontSize: 11.5, color: C.muted, margin: "2px 0 14px" }}>Bars outlined in navy are your picks.</p>}
              <Table rows={arr} cols={[
                { key: cfg.nameKey, label: cfg.nameLabel, render: (r) => <strong style={{ color: C.navy }}>{r[cfg.nameKey]}{cfg.pick && picks.includes(r[cfg.nameKey]) ? " ●" : ""}</strong> },
                { key: cfg.scoreKey, label: cfg.scoreLabel, align: "right", render: (r) => <Pill bg={cfg.band(Number(r[cfg.scoreKey]) || 0)} fg="#fff">{r[cfg.scoreKey]}</Pill> },
                ...cfg.cols,
              ]} />
            </div>
          )}

          <div style={{ marginTop: 12, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: C.ink }}>
            <strong style={{ color: C.navy }}>Now debate it: </strong>Where do you agree or disagree with the AI — and why? It reasons only from the facts it's given; your judgement and context are the part AI can't do for you.
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cfg.pick && <Btn kind="ghost" small onClick={() => { setPicks([]); setResult(null); setErr(""); setPhase("intro"); }}><RefreshCw size={14} />Play again</Btn>}
            <Btn kind="ghost" small onClick={run}><Cpu size={14} />Re-run the AI</Btn>
          </div>
          <p style={{ color: C.muted, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>Live analysis by AI on the fictional Northwind data — results vary slightly each run, just like real models.</p>
        </div>
      )}
    </Card>
  );
}

/* ================= AI SANDBOX ================= */
function Sandbox({ code, backlog }) {
  const [v, setV] = useState({ role: "", context: "", task: "", format: "" });
  return (
    <div>
      <H size={26}>AI Lab</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>Watch AI analyse the Northwind case live across all five days, then practise prompting yourself.</p>
      <div style={{ marginTop: 18 }}><AiAnalyst code={code} backlog={backlog} /></div>
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

/* ================= AI CHAT ================= */
const MD = {
  table: (p) => <div style={{ overflowX: "auto", margin: "8px 0" }}><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>{p.children}</table></div>,
  th: (p) => <th style={{ border: `1px solid ${C.line}`, padding: "6px 9px", background: C.cardl, textAlign: "left", color: C.navy, fontWeight: 700 }}>{p.children}</th>,
  td: (p) => <td style={{ border: `1px solid ${C.line}`, padding: "6px 9px", verticalAlign: "top" }}>{p.children}</td>,
  a: (p) => <a href={p.href} style={{ color: C.teal }} target="_blank" rel="noreferrer">{p.children}</a>,
  h1: (p) => <div style={{ fontFamily: serif, fontWeight: 700, color: C.navy, fontSize: 18, margin: "10px 0 4px" }}>{p.children}</div>,
  h2: (p) => <div style={{ fontFamily: serif, fontWeight: 700, color: C.navy, fontSize: 16, margin: "10px 0 4px" }}>{p.children}</div>,
  h3: (p) => <div style={{ fontWeight: 700, color: C.navy, fontSize: 14.5, margin: "8px 0 3px" }}>{p.children}</div>,
  p: (p) => <p style={{ margin: "6px 0", lineHeight: 1.55 }}>{p.children}</p>,
  ul: (p) => <ul style={{ margin: "6px 0", paddingLeft: 20, lineHeight: 1.5 }}>{p.children}</ul>,
  ol: (p) => <ol style={{ margin: "6px 0", paddingLeft: 20, lineHeight: 1.5 }}>{p.children}</ol>,
  code: (p) => {
    const txt = String(Array.isArray(p.children) ? p.children.join("") : (p.children ?? ""));
    const block = !!p.className || txt.includes("\n");
    return block
      ? <code style={{ display: "block", background: C.navy, color: "#e6edf3", padding: "10px 12px", borderRadius: 8, overflowX: "auto", fontSize: 12.5, fontFamily: "Consolas, monospace", whiteSpace: "pre", margin: "6px 0" }}>{p.children}</code>
      : <code style={{ background: C.cardl, padding: "1px 5px", borderRadius: 5, fontSize: 12.5, fontFamily: "Consolas, monospace" }}>{p.children}</code>;
  },
  pre: (p) => <>{p.children}</>,
};
// GFM tables only parse when flush-left and preceded by a blank line. Models often
// indent them, fence them, or glue them to the previous line — repair that here.
const isTableBlock = (s) => {
  const ls = String(s).trim().split("\n").map((x) => x.trim()).filter(Boolean);
  if (ls.length < 2) return false;
  const piped = ls.filter((l) => l.includes("|")).length;
  const hasDelim = ls.some((l) => /-{3,}/.test(l) && /^[|:\-\s]+$/.test(l));
  return piped >= 2 && hasDelim;
};
function normalizeMd(text) {
  let s = String(text || "").replace(/```[^\n`]*\n([\s\S]*?)```/g, (full, inner) => isTableBlock(inner) ? `\n${inner.trim()}\n` : full);
  const lines = s.split("\n").map((l) => l.trimStart().startsWith("|") ? l.trimStart() : l);
  const out = [];
  for (const l of lines) {
    const isRow = l.trimStart().startsWith("|");
    const prev = out.length ? out[out.length - 1] : "";
    if (isRow && prev.trim() !== "" && !prev.trimStart().startsWith("|")) out.push("");
    out.push(l);
  }
  return out.join("\n");
}
function ChatMarkdown({ text }) {
  return <div style={{ fontSize: 14, color: C.ink }}><ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>{normalizeMd(text)}</ReactMarkdown></div>;
}
const CHART_PAL = [C.teal, C.amber, C.mint, C.deep, C.navy, C.gold, C.green, C.red];
function ChartSpec({ raw }) {
  let s; try { s = JSON.parse(raw); } catch { return <ChatMarkdown text={"```\n" + raw + "\n```"} />; }
  const pal = CHART_PAL;
  const type = String(s.type || "bar").toLowerCase();
  const data = Array.isArray(s.data) ? s.data : [];
  const series = Array.isArray(s.series) && s.series.length ? s.series : [{ key: "value", label: s.valueLabel || "Value" }];
  const xKey = s.xKey || "name";
  const Wrap = ({ h = 300, children }) => (
    <Card style={{ margin: "10px 0" }}>
      {s.title && <H size={14} style={{ marginBottom: 8 }}>{s.title}</H>}
      <div style={{ height: h, width: "100%" }}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
      {s.note && <p style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{s.note}</p>}
    </Card>
  );

  if (type === "heatmap") {
    const rows = s.rows || [...new Set(data.map((d) => d.row))];
    const cols = s.cols || [...new Set(data.map((d) => d.col))];
    const vals = data.map((d) => Number(d.value) || 0);
    const min = s.min != null ? s.min : Math.min(...vals, 0);
    const max = s.max != null ? s.max : Math.max(...vals, 1);
    const at = (r, c) => { const f = data.find((d) => d.row === r && d.col === c); return f ? (Number(f.value) || 0) : null; };
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);
    const color = (v) => { if (v == null) return "#fff"; const t = Math.max(0, Math.min(1, (v - min) / ((max - min) || 1))); return t < 0.5 ? `rgb(${lerp(28, 238, t / 0.5)},${lerp(114, 150, t / 0.5)},${lerp(147, 75, t / 0.5)})` : `rgb(${lerp(238, 194, (t - 0.5) / 0.5)},${lerp(150, 84, (t - 0.5) / 0.5)},${lerp(75, 47, (t - 0.5) / 0.5)})`; };
    return (
      <Card style={{ margin: "10px 0" }}>
        {s.title && <H size={14} style={{ marginBottom: 8 }}>{s.title}</H>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 3, fontFamily: sans }}>
            <thead><tr><th></th>{cols.map((c) => <th key={c} style={{ fontSize: 11, color: C.muted, fontWeight: 700, padding: "0 6px 4px" }}>{c}</th>)}</tr></thead>
            <tbody>{rows.map((r) => (<tr key={r}><td style={{ fontSize: 11.5, fontWeight: 600, color: C.navy, paddingRight: 8, whiteSpace: "nowrap" }}>{r}</td>{cols.map((c) => { const v = at(r, c); return <td key={c} title={`${r} · ${c}: ${v == null ? "—" : v}`} style={{ width: 46, height: 32, textAlign: "center", borderRadius: 5, background: color(v), color: "#fff", fontSize: 11, fontWeight: 700 }}>{v == null ? "" : v}</td>; })}</tr>))}</tbody>
          </table>
        </div>
        {s.note && <p style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{s.note}</p>}
      </Card>
    );
  }
  if (type === "gauge" || type === "radial") {
    const val = Number(s.value != null ? s.value : (data[0] && data[0].value)) || 0;
    const gd = [{ name: s.label || s.title || "", value: val, fill: val >= 70 ? C.green : val >= 40 ? C.amber : C.red }];
    return <Wrap h={230}><RadialBarChart innerRadius="64%" outerRadius="100%" data={gd} startAngle={210} endAngle={-30}><PolarAngleAxis type="number" domain={[0, s.max || 100]} tick={false} /><RadialBar dataKey="value" cornerRadius={8} background /><text x="50%" y="58%" textAnchor="middle" style={{ fontFamily: serif, fontWeight: 700, fontSize: 28, fill: C.navy }}>{val}{s.unit || ""}</text></RadialBarChart></Wrap>;
  }
  if (!data.length) return null;
  if (type === "pie" || type === "donut") {
    const dk = series[0].key;
    return <Wrap><PieChart><Pie data={data} dataKey={dk} nameKey={xKey} innerRadius={type === "donut" ? 55 : 0} outerRadius={92} paddingAngle={2}>{data.map((d, i) => <Cell key={i} fill={d.fill || pal[i % pal.length]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></Wrap>;
  }
  if (type === "scatter" || type === "quadrant") {
    const pts = data.map((d) => ({ x: Number(d.x) || 0, y: Number(d.y) || 0, z: Number(d.z) || 1, name: d.name }));
    const isQ = type === "quadrant";
    const xMax = s.xMax != null ? s.xMax : (isQ ? 100 : Math.max(...pts.map((p) => p.x), 10));
    const yMax = s.yMax != null ? s.yMax : (isQ ? 100 : Math.max(...pts.map((p) => p.y), 10));
    const xMid = s.xMid != null ? s.xMid : xMax / 2, yMid = s.yMid != null ? s.yMid : yMax / 2;
    return <Wrap h={340}>
      <ScatterChart margin={{ top: 16, right: 20, bottom: 26, left: 0 }}>
        {isQ && <ReferenceArea x1={0} x2={xMid} y1={yMid} y2={yMax} fill={C.redl} fillOpacity={0.5} />}
        {isQ && <ReferenceArea x1={xMid} x2={xMax} y1={yMid} y2={yMax} fill={C.cardl} fillOpacity={0.6} />}
        {isQ && <ReferenceArea x1={0} x2={xMid} y1={0} y2={yMid} fill={C.light} fillOpacity={0.8} />}
        {isQ && <ReferenceArea x1={xMid} x2={xMax} y1={0} y2={yMid} fill={C.greenl} fillOpacity={0.6} />}
        <XAxis type="number" dataKey="x" domain={[0, xMax]} tick={{ fontSize: 11, fill: C.muted }} label={{ value: s.xLabel || "", position: "insideBottom", offset: -14, fontSize: 12, fill: C.muted }} />
        <YAxis type="number" dataKey="y" domain={[0, yMax]} tick={{ fontSize: 11, fill: C.muted }} label={{ value: s.yLabel || "", angle: -90, position: "insideLeft", fontSize: 12, fill: C.muted }} />
        <ZAxis type="number" dataKey="z" range={[60, 500]} />
        {isQ && <ReferenceLine x={xMid} stroke={C.line} />}
        {isQ && <ReferenceLine y={yMid} stroke={C.line} />}
        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTip />} />
        <Scatter data={pts}>{pts.map((p, i) => <Cell key={i} fill={pal[i % pal.length]} fillOpacity={0.8} stroke={C.navy} strokeWidth={0.5} />)}<LabelList dataKey="name" position="top" style={{ fontSize: 10, fill: C.body }} /></Scatter>
      </ScatterChart>
    </Wrap>;
  }
  if (type === "radar") {
    return <Wrap h={340}><RadarChart data={data} outerRadius="72%"><PolarGrid /><PolarAngleAxis dataKey={xKey} tick={{ fontSize: 11, fill: C.body }} /><PolarRadiusAxis tick={{ fontSize: 10, fill: C.muted }} />{series.map((se, i) => <Radar key={se.key} dataKey={se.key} name={se.label || se.key} stroke={pal[i % pal.length]} fill={pal[i % pal.length]} fillOpacity={0.3} />)}<Legend wrapperStyle={{ fontSize: 11 }} /><Tooltip /></RadarChart></Wrap>;
  }
  if (type === "treemap") {
    const td = data.map((d, i) => ({ name: d.name, size: Number(d.value != null ? d.value : d.size) || 0 }));
    const TreeCell = (p) => (p.width > 0 && p.height > 0) ? <g><rect x={p.x} y={p.y} width={p.width} height={p.height} fill={pal[p.index % pal.length]} stroke="#fff" />{p.width > 44 && p.height > 18 && <text x={p.x + 6} y={p.y + 16} fontSize="11" fill="#fff">{p.name}</text>}</g> : null;
    return <Wrap><Treemap data={td} dataKey="size" nameKey="name" content={<TreeCell />} /></Wrap>;
  }
  if (type === "area") {
    return <Wrap><AreaChart data={data} margin={{ left: -12, right: 10, top: 6, bottom: 4 }}><XAxis dataKey={xKey} tick={{ fontSize: 11, fill: C.muted }} /><YAxis tick={{ fontSize: 11, fill: C.muted }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />{series.map((se, i) => <Area key={se.key} dataKey={se.key} name={se.label || se.key} stroke={pal[i % pal.length]} fill={pal[i % pal.length]} fillOpacity={0.25} stackId={s.stacked ? "1" : undefined} />)}</AreaChart></Wrap>;
  }
  if (type === "line") {
    return <Wrap><LineChart data={data} margin={{ left: -12, right: 10, top: 6, bottom: 4 }}><XAxis dataKey={xKey} tick={{ fontSize: 11, fill: C.muted }} /><YAxis tick={{ fontSize: 11, fill: C.muted }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />{series.map((se, i) => <Line key={se.key} dataKey={se.key} name={se.label || se.key} stroke={pal[i % pal.length]} strokeWidth={2} dot={false} />)}</LineChart></Wrap>;
  }
  const horizontal = s.orientation === "horizontal" || s.layout === "vertical";
  return <Wrap h={Math.max(260, horizontal ? data.length * 36 + 60 : 300)}>
    <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 10 : -12, right: 14, top: 6, bottom: 4 }}>
      {horizontal
        ? <><XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} /><YAxis type="category" dataKey={xKey} width={110} tick={{ fontSize: 11, fill: C.body }} /></>
        : <><XAxis dataKey={xKey} tick={{ fontSize: 11, fill: C.body }} interval={0} angle={data.length > 6 ? -20 : 0} textAnchor={data.length > 6 ? "end" : "middle"} height={data.length > 6 ? 60 : 30} /><YAxis tick={{ fontSize: 11, fill: C.muted }} /></>}
      <Tooltip cursor={{ fill: C.light }} /><Legend wrapperStyle={{ fontSize: 11 }} />
      {series.map((se, i) => <Bar key={se.key} dataKey={se.key} name={se.label || se.key} fill={pal[i % pal.length]} stackId={s.stacked ? "1" : undefined} radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}>{series.length === 1 ? data.map((d, idx) => <Cell key={idx} fill={d.fill || pal[i % pal.length]} />) : null}</Bar>)}
    </BarChart>
  </Wrap>;
}
function ExportBar({ text }) {
  const [busy, setBusy] = useState("");
  const name = "northwind-ai-output";
  const run = async (kind, fn) => { setBusy(kind); try { await fn(); } catch (e) { alert("Export failed: " + (e.message || e)); } setBusy(""); };
  const btn = { display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${C.line}`, background: "#fff", color: C.body, borderRadius: 7, padding: "4px 9px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: sans };
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 }}>
      <button style={btn} disabled={!!busy} onClick={() => run("copy", async () => { await navigator.clipboard.writeText(text); })}>{busy === "copy" ? <Check size={13} color={C.mint} /> : <Copy size={13} />}Copy</button>
      <button style={btn} disabled={!!busy} onClick={() => run("word", () => exportWord(text, name))}><FileText size={13} color={C.teal} />Word</button>
      <button style={btn} disabled={!!busy} onClick={() => run("xls", () => exportExcel(text, name))}><FileSpreadsheet size={13} color={C.green} />Excel</button>
      <button style={btn} disabled={!!busy} onClick={() => run("ppt", () => exportPPT(text, name))}><Presentation size={13} color={C.amber} />PPT</button>
    </div>
  );
}
function AssistantMessage({ text }) {
  const parts = [];
  const re = /```chart\s*([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ t: "md", c: text.slice(last, m.index) });
    parts.push({ t: "chart", c: m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ t: "md", c: text.slice(last) });
  return <>{parts.map((p, i) => p.t === "chart" ? <ChartSpec key={i} raw={p.c} /> : <ChatMarkdown key={i} text={p.c} />)}</>;
}
const CHAT_SUGGESTIONS = [
  "Explain a tricky concept simply — e.g. how compound interest works.",
  "Draft a clear, polite email declining a meeting.",
  "Make a table comparing three options I'm weighing up.",
  "Summarise a PDF or document I attach into 5 key points.",
];
function ChatPage({ code, chat, setChat }) {
  const [msgs, setMsgs] = useState(() => Array.isArray(chat) ? chat : []);
  const [input, setInput] = useState("");
  const [atts, setAtts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [snip, setSnip] = useState(null); // null = closed; string = open snippet box
  const fileRef = useRef();
  const endRef = useRef();
  const firstRef = useRef(true);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  // Persist a slim transcript (text + attachment labels, no heavy bytes) into the learner's
  // synced data, so the conversation follows them across devices and survives refresh.
  // Skip the first run so mounting never overwrites already-loaded history.
  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; }
    const slim = msgs.slice(-60).map((m) => m.role === "user"
      ? { role: "user", text: m.text, atts: (m.atts || []).map((a) => ({ name: a.name, kind: a.kind })) }
      : { role: "assistant", text: m.text });
    setChat(slim);
  }, [msgs]);
  const newChat = () => { setMsgs([]); setAtts([]); setInput(""); setErr(""); setSnip(null); setChat([]); };
  const addSnippet = () => {
    const t = (snip || "").trim();
    if (!t) { setSnip(null); return; }
    setAtts((a) => [...a, { name: `Snippet (${t.length} chars)`, kind: "snippet", block: { type: "text", text: `[Pasted snippet]\n\n${t}` } }]);
    setSnip(null);
  };
  const onPaste = async (e) => {
    const items = (e.clipboardData && e.clipboardData.items) || [];
    for (const it of items) {
      if (it.type && it.type.startsWith("image/")) { const f = it.getAsFile(); if (f) { e.preventDefault(); await addFiles([f]); } }
    }
  };

  const addFiles = async (fileList) => {
    setErr("");
    for (const f of Array.from(fileList || [])) {
      if (f.size > 4.5 * 1024 * 1024) { setErr(`"${f.name}" is over 4.5 MB — please attach a smaller file.`); continue; }
      try {
        const lower = f.name.toLowerCase();
        if (f.type.startsWith("image/")) {
          const { b64, media } = await readBase64(f);
          setAtts((a) => [...a, { name: f.name, kind: "image", thumb: `data:${media};base64,${b64}`, block: { type: "image", source: { type: "base64", media_type: media, data: b64 } } }]);
        } else if (f.type === "application/pdf" || lower.endsWith(".pdf")) {
          const { b64 } = await readBase64(f);
          setAtts((a) => [...a, { name: f.name, kind: "pdf", block: { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } } }]);
        } else if (lower.endsWith(".docx")) {
          const mod = await import("mammoth/mammoth.browser");
          const out = await mod.extractRawText({ arrayBuffer: await f.arrayBuffer() });
          setAtts((a) => [...a, { name: f.name, kind: "doc", block: { type: "text", text: `[Attached document "${f.name}"]\n\n${out.value}` } }]);
        } else if (f.type.startsWith("text/") || /\.(txt|md|csv|tsv|json|log)$/i.test(lower)) {
          const t = await f.text();
          setAtts((a) => [...a, { name: f.name, kind: "doc", block: { type: "text", text: `[Attached file "${f.name}"]\n\n${t.slice(0, 60000)}` } }]);
        } else {
          setErr(`"${f.name}" — unsupported. Try an image, PDF, .docx, or a text file.`);
        }
      } catch (e) { setErr(`Couldn't read "${f.name}".`); }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !atts.length) || busy) return;
    const blocks = atts.map((a) => a.block);
    if (text) blocks.push({ type: "text", text });
    const userMsg = { role: "user", blocks, text, atts: atts.map((a) => ({ name: a.name, kind: a.kind, thumb: a.thumb })) };
    const next = [...msgs, userMsg];
    setMsgs(next); setInput(""); setAtts([]); setBusy(true); setErr("");
    const apiMessages = next.map((m) => ({ role: m.role, content: m.role === "user" ? (m.blocks || [{ type: "text", text: m.text || "" }]) : m.text }));
    const r = await apiChat(code, apiMessages);
    setBusy(false);
    if (!r.ok) { setErr(r.error || "The AI couldn't respond."); return; }
    setMsgs((cur) => [...cur, { role: "assistant", text: r.text }]);
  };
  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const inputStyle = { width: "100%", boxSizing: "border-box", resize: "none", fontFamily: sans, fontSize: 14, padding: "10px 12px", border: `1px solid ${C.line}`, borderRadius: 10, color: C.ink, background: "#fff", lineHeight: 1.4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", maxHeight: "calc(100vh - 56px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <H size={26}>AI Chat</H>
          <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>Your built-in AI assistant — ask about anything, from work and study to everyday questions. Attach images, PDFs, documents or snippets, and get answers with tables and charts when they help. Your conversation is saved on this device. Avoid sharing real confidential or personal data.</p>
        </div>
        {msgs.length > 0 && <Btn small kind="ghost" onClick={newChat}><Plus size={14} />New chat</Btn>}
      </div>
      <div style={{ flex: 1, overflowY: "auto", margin: "14px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.length === 0 && !busy && (
          <Card style={{ background: C.light }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Try one of these to start:</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8 }}>
              {CHAT_SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setInput(s)} style={{ textAlign: "left", cursor: "pointer", border: `1px solid ${C.line}`, background: "#fff", borderRadius: 9, padding: "9px 11px", fontFamily: sans, fontSize: 13, color: C.body, lineHeight: 1.4 }}>{s}</button>
              ))}
            </div>
          </Card>
        )}
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
            <div style={{ background: C.navy, color: "#fff", borderRadius: "12px 12px 2px 12px", padding: "10px 13px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
            {m.atts && m.atts.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end", marginTop: 6 }}>
                {m.atts.map((a, j) => a.kind === "image" && a.thumb
                  ? <img key={j} src={a.thumb} alt={a.name} style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.line}` }} />
                  : <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.body, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 7, padding: "4px 8px" }}><FileText size={13} color={C.teal} />{a.name}</span>)}
              </div>
            )}
          </div>
        ) : (
          <div key={i} style={{ alignSelf: "flex-start", maxWidth: "92%" }}>
            <Card style={{ borderTopLeftRadius: 2 }}><AssistantMessage text={m.text} /></Card>
            {m.text && m.text.trim() && <ExportBar text={m.text} />}
          </div>
        ))}
        {busy && <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 13.5 }}><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Thinking…</div>}
        {err && <div style={{ alignSelf: "center", color: C.red, fontSize: 13 }}>⚠ {err}</div>}
        <div ref={endRef} />
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
        {atts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {atts.map((a, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.body, background: C.cardl, border: `1px solid ${C.line}`, borderRadius: 7, padding: "4px 8px" }}>
                {a.kind === "image" ? <img src={a.thumb} alt="" style={{ width: 18, height: 18, objectFit: "cover", borderRadius: 3 }} /> : a.kind === "snippet" ? <Code size={13} color={C.teal} /> : <FileText size={13} color={C.teal} />}
                {a.name}
                <button onClick={() => setAtts((x) => x.filter((_, j) => j !== i))} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted, display: "flex" }}><X size={13} /></button>
              </span>
            ))}
          </div>
        )}
        {snip != null && (
          <div style={{ marginBottom: 8, border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, background: C.light }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Attach a snippet</div>
            <textarea value={snip} onChange={(e) => setSnip(e.target.value)} rows={5} autoFocus placeholder="Paste a block of text or code to attach as context…" style={{ ...inputStyle, fontFamily: "Consolas, monospace", fontSize: 12.5 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Btn small onClick={addSnippet}><Plus size={13} />Attach</Btn>
              <Btn small kind="ghost" onClick={() => setSnip(null)}>Cancel</Btn>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <input ref={fileRef} type="file" multiple accept="image/*,application/pdf,.pdf,.docx,.txt,.md,.csv,.tsv,.json,.log" style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
          <button onClick={() => fileRef.current && fileRef.current.click()} title="Attach image, PDF or document" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.teal }}><Paperclip size={18} /></button>
          <button onClick={() => setSnip((s) => s == null ? "" : null)} title="Attach a text or code snippet" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 10, border: `1px solid ${snip != null ? C.amber : C.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: snip != null ? C.amber : C.teal }}><Code size={18} /></button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} onPaste={onPaste} rows={Math.min(5, Math.max(1, input.split("\n").length))} placeholder="Ask anything, attach a file, or paste a snippet…" style={inputStyle} />
          <button onClick={send} disabled={busy || (!input.trim() && !atts.length)} title="Send" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 10, border: "none", background: (busy || (!input.trim() && !atts.length)) ? C.line : C.teal, color: "#fff", cursor: (busy || (!input.trim() && !atts.length)) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Send size={18} /></button>
        </div>
        <p style={{ fontSize: 11, color: C.muted, margin: "6px 2px 0" }}>Enter to send · Shift+Enter for a new line · attach images, PDF, .docx, text files or a snippet — or paste an image (max 4.5 MB).</p>
      </div>
    </div>
  );
}

/* ================= CASE STUDIES ================= */
function CompareBox({ without, withAi }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, margin: "4px 0" }}>
      <div style={{ border: `1px solid ${C.line}`, borderTop: `3px solid ${C.muted}`, borderRadius: 9, padding: "10px 12px", background: C.redl }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>WITHOUT AI</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.body, lineHeight: 1.5 }}>{without.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </div>
      <div style={{ border: `1px solid ${C.line}`, borderTop: `3px solid ${C.green}`, borderRadius: 9, padding: "10px 12px", background: C.greenl }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 6 }}>WITH AI</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>{withAi.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </div>
    </div>
  );
}
function CaseBlock({ b }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {b.h && <H size={15} style={{ marginBottom: 6 }}>{b.h}</H>}
      {b.body && <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, margin: "0 0 8px" }}>{b.body}</p>}
      {b.bullets && <ul style={{ margin: "0 0 8px", paddingLeft: 20, color: C.body, fontSize: 13.5, lineHeight: 1.6 }}>{b.bullets.map((x, i) => <li key={i}>{x}</li>)}</ul>}
      {b.prompt && <PromptBox text={b.prompt} />}
      {b.prompt && <div style={{ display: "flex", alignItems: "flex-start", gap: 6, margin: "4px 2px 2px", fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}><Sparkles size={12} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} /><span>Worked-example prompt — built on this case's own (fictional) company, not the Northwind dossier. Paste it into AI Chat to run.</span></div>}
      {b.compare && <CompareBox without={b.compare.without} withAi={b.compare.with} />}
      {b.note && <div style={{ marginTop: 8, background: C.greenl, borderLeft: `4px solid ${C.mint}`, borderRadius: 10, padding: "9px 13px", fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{b.note}</div>}
    </div>
  );
}
function CaseStudies({ release, go }) {
  const [sel, setSel] = useState(null);
  const checking = release === null;
  const isOpen = (id) => !!(release && (release.cases || []).includes(id));
  const c = sel && isOpen(sel) ? CASES.find((x) => x.id === sel) : null;

  if (c) {
    return (
      <div>
        <button onClick={() => setSel(null)} style={{ border: "none", background: "none", cursor: "pointer", color: C.teal, fontWeight: 600, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}>‹ All case studies</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Pill bg={c.kind === "primary" ? C.navy : C.cardl} fg={c.kind === "primary" ? "#fff" : C.navy}>{c.code}</Pill>
          <Pill bg={C.deep} fg="#fff">Day {c.day}</Pill>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: c.kind === "primary" ? C.amber : C.muted }}>{c.kind === "primary" ? "PRIMARY" : "SUPPLEMENTARY"}</span>
        </div>
        <H size={26} style={{ margin: "8px 0 2px" }}>{c.title}</H>
        <div style={{ fontSize: 13, color: C.muted }}>{c.area}</div>
        <p style={{ fontStyle: "italic", color: C.body, fontSize: 14, margin: "8px 0 0" }}>{c.theme}</p>
        <Card style={{ marginTop: 14 }}>
          <Row k="Organisation" v={c.org} />
          <div style={{ fontSize: 13.5, color: C.body, lineHeight: 1.55, marginTop: 8 }}>{c.profile}</div>
        </Card>
        <div style={{ marginTop: 14, background: C.cardl, borderLeft: `4px solid ${C.teal}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>THE CHALLENGE</div>
          <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55 }}>{c.challenge}</div>
        </div>
        <div style={{ marginTop: 16 }}>{c.blocks.map((b, i) => <CaseBlock key={i} b={b} />)}</div>
        <div style={{ marginTop: 6, background: C.light, borderLeft: `4px solid ${C.amber}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>YOUR TASK</div>
          <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55 }}>{c.task}</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, margin: "8px 0 0", fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}><LayoutGrid size={12} color={C.teal} style={{ flexShrink: 0, marginTop: 2 }} /><span>This one uses the Northwind dossier — open Explore for the figures.</span></div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn small onClick={() => go("chat")}><MessageSquare size={14} />Open AI Chat</Btn>
            <Btn small kind="ghost" onClick={() => go("sandbox")}><Sparkles size={14} />Open AI Lab</Btn>
          </div>
        </div>
        <div style={{ marginTop: 14, background: C.greenl, borderLeft: `4px solid ${C.mint}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 4 }}>KEY LESSON</div>
          <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55, fontWeight: 600 }}>{c.lesson}</div>
        </div>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {c.metrics.map((m, i) => (
            <Card key={i} style={{ padding: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, letterSpacing: 0.5 }}>KEY METRIC</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginTop: 4, lineHeight: 1.35 }}>{m}</div>
            </Card>
          ))}
        </div>
        <p style={{ color: C.muted, fontSize: 12, marginTop: 12, fontStyle: "italic" }}>{SAFE_NOTE}</p>
      </div>
    );
  }

  return (
    <div>
      <H size={26}>Case studies</H>
      <p style={{ color: C.muted, marginTop: 6, fontSize: 14.5 }}>Twelve real-world AI procurement stories — one primary case per day plus supplementary deep-dives. Every prompt is copy-ready for AI Chat (or the AI Lab), and every task links back to the Northwind dossier. Your facilitator opens each case when it's time.</p>
      {checking && <Card style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", color: C.muted }}><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 13.5 }}>Checking what's open…</span></Card>}
      {!checking && DAYS.map((d) => {
        const items = CASES.filter((x) => x.day === d.n);
        return (
          <div key={d.n} style={{ marginTop: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.muted }}>DAY {d.n} · {d.title.toUpperCase()}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12, marginTop: 8 }}>
              {items.map((x) => {
                const open = isOpen(x.id);
                const prim = x.kind === "primary";
                return (
                  <Card key={x.id} style={{ padding: 0, overflow: "hidden", borderTop: `4px solid ${prim ? C.navy : C.line}`, opacity: open ? 1 : 0.85 }}>
                    <button onClick={() => open && setSel(x.id)} disabled={!open}
                      style={{ width: "100%", textAlign: "left", border: "none", background: "none", cursor: open ? "pointer" : "default", padding: 14, display: "block" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                        <Pill bg={prim ? C.navy : C.cardl} fg={prim ? "#fff" : C.navy}>{x.code}</Pill>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: prim ? C.amber : C.muted }}>{prim ? "PRIMARY" : "SUPPLEMENTARY"}</span>
                        {!open && <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: C.amber }}><Lock size={13} /> Locked</span>}
                      </div>
                      <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: C.navy, lineHeight: 1.2 }}>{x.title}</div>
                      <div style={{ fontSize: 12, color: C.muted, margin: "6px 0 8px" }}>{x.area}</div>
                      {open
                        ? <div style={{ fontSize: 13, color: C.body, lineHeight: 1.45 }}>{x.theme}</div>
                        : <div style={{ fontSize: 12.5, color: C.muted }}>Your facilitator will open this case shortly.</div>}
                      {open && <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: C.teal }}>Open case <ChevronRight size={14} /></div>}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
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

/* ================= IDENTITY, STORAGE & SYNC =================
   Code-based identity, no personal data. The instructor pre-issues seat codes
   (e.g. NW-7K2Q); the code is both the learner's identity and their secret.
   Entering it on any device loads their work (cross-device); an unknown code
   cannot write. Data lives in an isolated `cockpit` schema, reached only via the
   service-role edge function — no Supabase Auth, so no risk to other apps. */
const STORAGE_PREFIX = "cockpit";
const PROFILES_KEY = `${STORAGE_PREFIX}:profiles:v3`;
const dataKey = (code) => `${STORAGE_PREFIX}:v3:${code}`;
const normCode = (c) => String(c || "").trim().toUpperCase();

const SUPA_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPA_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const FN_URL = SUPA_URL ? `${SUPA_URL}/functions/v1/cockpit-sync` : "";
const FN_AI_URL = SUPA_URL ? `${SUPA_URL}/functions/v1/cockpit-ai` : "";
const FN_CHAT_URL = SUPA_URL ? `${SUPA_URL}/functions/v1/cockpit-chat` : "";

const ls = {
  get(key) { try { return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null; } catch { return null; } },
  set(key, val) { try { if (typeof localStorage !== "undefined") localStorage.setItem(key, val); } catch (e) {} },
};
const fnHeaders = () => ({ "Content-Type": "application/json", apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` });

// Sign in with a seat code — also the cross-device data load. Distinguishes
// unknown code (rejected) from offline (so returning users can work locally).
async function apiSignin(code) {
  if (!FN_URL) return { ok: false, offline: true };
  try {
    const res = await fetch(FN_URL, { method: "POST", headers: fnHeaders(), body: JSON.stringify({ action: "signin", code }) });
    if (res.status === 404) return { ok: false, unknown: true };
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body.error || `Error ${res.status}` };
    return { ok: true, seat: body.seat };
  } catch (e) { return { ok: false, offline: true }; }
}
async function apiSave(code, handle, data) {
  if (!FN_URL) return;
  try { await fetch(FN_URL, { method: "POST", headers: fnHeaders(), body: JSON.stringify({ action: "save", code, handle, data }) }); }
  catch (e) { /* offline — local copy is source of truth, resyncs on next change */ }
}
async function adminList(cohort, adminKey) {
  if (!FN_URL) throw new Error("Backend not configured (VITE_SUPABASE_URL is missing).");
  const res = await fetch(FN_URL, { method: "POST", headers: fnHeaders(), body: JSON.stringify({ action: "list", cohort: cohort || undefined, adminKey }) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body.seats || [];
}
// Live AI analysis — authorised by the learner's seat code.
async function apiAnalyze(kind, code, extra) {
  if (!FN_AI_URL) return { ok: false, error: "AI service not configured." };
  try {
    const res = await fetch(FN_AI_URL, { method: "POST", headers: fnHeaders(), body: JSON.stringify({ action: "analyze", kind, code, ...(extra || {}) }) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body.error || `AI error (${res.status})` };
    return { ok: true, result: body.result };
  } catch (e) { return { ok: false, error: "Couldn't reach the AI service." }; }
}
// Free-form multimodal chat — authorised by the learner's seat code.
export async function apiChat(code, messages) {
  if (!FN_CHAT_URL) return { ok: false, error: "Chat is not configured (no backend)." };
  try {
    const res = await fetch(FN_CHAT_URL, { method: "POST", headers: fnHeaders(), body: JSON.stringify({ action: "chat", code, messages }) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body.error || `Error ${res.status}` };
    return { ok: true, text: body.text };
  } catch (e) { return { ok: false, error: "Couldn't reach the AI service." }; }
}
function readBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => { const s = String(r.result); const i = s.indexOf(","); const head = s.slice(0, i); const media = (head.match(/data:(.*?);base64/) || [])[1] || file.type; resolve({ b64: s.slice(i + 1), media }); };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
async function adminGenerate(cohort, count, adminKey) {
  if (!FN_URL) throw new Error("Backend not configured (VITE_SUPABASE_URL is missing).");
  const res = await fetch(FN_URL, { method: "POST", headers: fnHeaders(), body: JSON.stringify({ action: "generate", cohort, count, adminKey }) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body.codes || [];
}

// ---- Instructor-controlled content release (central, shared by all delegates) ----
// Read is public (anon, RLS read-only); writes go through a passphrase-checked
// SECURITY DEFINER function. `days` = released day numbers; `locked` = activity
// ids explicitly locked within an otherwise-open day.
const REST_URL = SUPA_URL ? `${SUPA_URL}/rest/v1` : "";
const ALL_DAYS = DAYS.map((d) => d.n);
async function fetchRelease() {
  if (!REST_URL) return { days: ALL_DAYS, locked: [], cases: CASE_IDS }; // local-only mode: everything open
  try {
    const res = await fetch(`${REST_URL}/cockpit_release?select=days,locked_acts,cases&id=eq.1`, { headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` } });
    if (!res.ok) return null;
    const rows = await res.json();
    const r = Array.isArray(rows) ? rows[0] : null;
    return { days: (r && r.days) || [], locked: (r && r.locked_acts) || [], cases: (r && r.cases) || [] };
  } catch { return null; }
}
async function setReleaseRemote(days, locked, cases, adminKey) {
  if (!REST_URL) throw new Error("Backend not configured (VITE_SUPABASE_URL is missing).");
  const res = await fetch(`${REST_URL}/rpc/cockpit_set_release`, {
    method: "POST", headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_days: days, p_locked: locked, p_cases: cases, p_admin: (adminKey || "").trim() }),
  });
  if (!res.ok) { const t = await res.text().catch(() => ""); throw new Error(/unauthorized/i.test(t) ? "Wrong admin passphrase." : (t || `Failed (${res.status})`)); }
  return res.json();
}
async function adminChatLog(adminKey) {
  if (!REST_URL) throw new Error("Backend not configured (VITE_SUPABASE_URL is missing).");
  const res = await fetch(`${REST_URL}/rpc/cockpit_chat_log_list`, { method: "POST", headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_admin: (adminKey || "").trim(), p_limit: 2000 }) });
  if (!res.ok) { const t = await res.text().catch(() => ""); throw new Error(/unauthorized/i.test(t) ? "Wrong admin passphrase." : (t || `Failed (${res.status})`)); }
  return res.json();
}
// Read the autonomous-agent run log (written by the n8n Supplier Intelligence workflow).
async function adminAgentLog() {
  if (!REST_URL) return [];
  try {
    const res = await fetch(`${REST_URL}/cockpit_agent_log?select=*&order=created_at.desc&limit=200`, { headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` } });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { return []; }
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
  { id: "cases", label: "Case Studies", icon: BookOpen },
  { id: "sandbox", label: "AI Lab", icon: Sparkles },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "builder", label: "Ecosystem Builder", icon: Boxes },
  { id: "backlog", label: "Backlog", icon: LayoutGrid },
  { id: "strategy", label: "My Strategy", icon: Rocket },
];

function Cockpit({ learner, profiles, onPick, onClaim, onRemove, onRename, openAdmin }) {
  const [view, setView] = useState("home");
  const [day, setDay] = useState(1);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState({});
  const [work, setWork] = useState({});
  const [backlog, setBacklog] = useState([]);
  const [plan, setPlan] = useState("");
  const [confidence, setConfidence] = useState({});
  const [chat, setChat] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [release, setReleaseState] = useState(null);
  const syncTimer = useRef();

  // Poll the instructor's central release config so days/activities open live,
  // without a reload. Fail open if the backend is unreachable (never lock a
  // delegate out over a connection blip).
  useEffect(() => {
    let alive = true;
    const load = async () => { const r = await fetchRelease(); if (alive) setReleaseState((prev) => r || prev || { days: ALL_DAYS, locked: [], cases: CASE_IDS }); };
    load();
    const iv = setInterval(load, 20000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(iv); window.removeEventListener("focus", onFocus); };
  }, []);

  // Load this learner's work: prefer the server copy (cross-device), fall back
  // to the local cache when offline.
  useEffect(() => {
    let alive = true;
    setLoaded(false);
    (async () => {
      let d = {};
      try { d = JSON.parse(ls.get(dataKey(learner.code)) || "{}"); } catch (e) {}
      const r = await apiSignin(learner.code);
      if (r.ok && r.seat) {
        d = r.seat.data || {};
        ls.set(dataKey(learner.code), JSON.stringify(d));
        if (r.seat.handle && r.seat.handle !== learner.handle) onRename(r.seat.handle);
      }
      if (!alive) return;
      setAnswers(d.answers || {}); setDone(d.done || {}); setWork(d.work || {});
      setBacklog(d.backlog || []); setPlan(d.plan || ""); setConfidence(d.confidence || {}); setChat(Array.isArray(d.chat) ? d.chat : []);
      setView("home"); setDay(1); setLoaded(true);
    })();
    return () => { alive = false; };
  }, [learner.code]);

  useEffect(() => {
    if (!loaded) return;
    const data = { answers, done, work, backlog, plan, confidence, chat };
    ls.set(dataKey(learner.code), JSON.stringify(data));
    clearTimeout(syncTimer.current);
    const code = learner.code, handle = learner.handle;
    syncTimer.current = setTimeout(() => apiSave(code, handle, data), 1200);
    return () => clearTimeout(syncTimer.current);
  }, [answers, done, work, backlog, plan, confidence, chat, loaded, learner.code, learner.handle]);

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
          <div style={{ width: 26, height: 26, borderRadius: 999, background: C.teal, color: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{((learner.handle || learner.code || "?").trim().charAt(0) || "?").toUpperCase()}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learner.handle || learner.code}</div>
            <div style={{ fontSize: 10.5, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Cohort {learner.cohort} · {learner.code}</div>
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
      <main style={view === "builder"
        ? { flex: 1, minWidth: 0, width: "100%", boxSizing: "border-box" }
        : { flex: 1, padding: "28px clamp(16px, 4vw, 44px)", maxWidth: 1080, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {view === "home" && <Home go={setView} weekPct={weekPct} backlogCount={backlog.length} name={learner.handle} setName={onRename} />}
        {view === "explore" && <Explore />}
        {view === "missions" && <Missions day={day} setDay={setDay} answers={answers} setAnswers={setAnswers} done={done} setDone={setDone} work={work} setWork={setWork} go={setView} release={release} confidence={confidence} setConfidence={setConfidence} backlog={backlog} setBacklog={setBacklog} />}
        {view === "cases" && <CaseStudies release={release} go={setView} />}
        {view === "chat" && (loaded ? <ChatPage key={learner.code} code={learner.code} chat={chat} setChat={setChat} /> : <Card><p style={{ margin: 0, color: C.muted }}>Loading your conversation…</p></Card>)}
        {view === "builder" && <EcosystemBuilder code={learner.code} />}
        {view === "sandbox" && <Sandbox code={learner.code} backlog={backlog} />}
        {view === "backlog" && <Backlog backlog={backlog} setBacklog={setBacklog} />}
        {view === "strategy" && <Strategy backlog={backlog} plan={plan} setPlan={setPlan} name={learner.handle} />}
      </main>
      {switcher && (
        <Switcher learner={learner} profiles={profiles} onClose={() => setSwitcher(false)}
          onPick={(c) => { onPick(c); setSwitcher(false); }} onClaim={(seat, nm) => { onClaim(seat, nm); setSwitcher(false); }}
          onRemove={onRemove} openAdmin={() => { setSwitcher(false); openAdmin(); }} />
      )}
    </div>
  );
}

function Switcher({ learner, profiles, onClose, onPick, onClaim, onRemove, openAdmin }) {
  const [adding, setAdding] = useState(profiles.length === 0);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inp = { width: "100%", boxSizing: "border-box", fontFamily: sans, fontSize: 14, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 9, color: C.ink, background: "#fff" };
  const codeInp = { ...inp, letterSpacing: 1 };
  const submit = async () => {
    const c = normCode(code);
    if (!c || !name.trim() || busy) return;
    setBusy(true); setErr("");
    const r = await apiSignin(c);
    setBusy(false);
    if (r.unknown) { setErr("That access code isn't recognised."); return; }
    if (r.offline) { setErr("Couldn't reach the server — check your connection."); return; }
    if (!r.ok) { setErr(r.error || "Something went wrong."); return; }
    onClaim(r.seat, name.trim());
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,37,69,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px,100%)", background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <H size={19}>Switch learner</H>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted }}><X size={20} /></button>
        </div>
        {profiles.length > 0 && (
          <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            {profiles.map((p) => {
              const active = learner && p.code === learner.code;
              return (
                <div key={p.code} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${active ? C.teal : C.line}`, background: active ? C.cardl : "#fff", borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: active ? C.teal : C.muted, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{((p.handle || p.code || "?").charAt(0) || "?").toUpperCase()}</div>
                  <button onClick={() => onPick(p.code)} style={{ flex: 1, textAlign: "left", border: "none", background: "none", cursor: "pointer", minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{p.handle || p.code}{active ? " · active" : ""}</div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>Cohort {p.cohort} · {p.code}</div>
                  </button>
                  <button title="Remove from this device" onClick={() => onRemove(p.code)} style={{ border: "none", background: "none", cursor: "pointer", color: C.muted }}><X size={15} /></button>
                </div>
              );
            })}
          </div>
        )}
        {adding ? (
          <div style={{ display: "grid", gap: 10, borderTop: profiles.length ? `1px solid ${C.line}` : "none", paddingTop: profiles.length ? 14 : 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.muted }}>ADD A SEAT</div>
            <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="Your name" style={inp} onKeyDown={(e) => e.key === "Enter" && submit()} />
            <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(""); }} placeholder="Access code (e.g. NW-7K2Q)" style={codeInp} onKeyDown={(e) => e.key === "Enter" && submit()} />
            {err && <p style={{ color: C.red, fontSize: 12.5, margin: 0 }}>⚠ {err}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={submit} disabled={busy || !normCode(code) || !name.trim()}><UserPlus size={15} />{busy ? "Checking…" : "Sign in"}</Btn>
              {profiles.length > 0 && <Btn kind="ghost" onClick={() => { setAdding(false); setErr(""); }}>Cancel</Btn>}
            </div>
          </div>
        ) : (
          <Btn kind="ghost" onClick={() => { setCode(""); setName(""); setErr(""); setAdding(true); }}><Plus size={15} />Add a seat</Btn>
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

function StartGate({ onClaim, openAdmin }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const codeInp = { width: "100%", boxSizing: "border-box", fontFamily: sans, fontSize: 18, fontWeight: 700, letterSpacing: 2, textAlign: "center", padding: "13px 13px", border: `1px solid ${C.line}`, borderRadius: 10, color: C.ink, background: "#fff", marginTop: 6 };
  const nameInp = { width: "100%", boxSizing: "border-box", fontFamily: sans, fontSize: 15, padding: "11px 13px", border: `1px solid ${C.line}`, borderRadius: 10, color: C.ink, background: "#fff", marginTop: 6 };
  const ready = normCode(code) && name.trim();
  const go = async () => {
    if (!ready || busy) return;
    setBusy(true); setErr("");
    const r = await apiSignin(normCode(code));
    setBusy(false);
    if (r.unknown) { setErr("That access code isn't recognised. Check it with your facilitator."); return; }
    if (r.offline) { setErr("Couldn't reach the server — check your connection and try again."); return; }
    if (!r.ok) { setErr(r.error || "Something went wrong. Please try again."); return; }
    onClaim(r.seat, name.trim());
  };
  return (
    <div style={{ fontFamily: sans, minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy}, ${C.deep})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "min(440px,100%)", background: "#fff", borderRadius: 18, padding: "30px 28px", boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={21} color={C.gold} /></div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: C.amber }}>AI FOUNDATIONS · PROCUREMENT & SUPPLY CHAIN</div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.navy, lineHeight: 1.1 }}>The Northwind Cockpit</div>
          </div>
        </div>
        <p style={{ color: C.body, fontSize: 14, lineHeight: 1.55, margin: "0 0 18px" }}>Enter your name and the access code your facilitator gave you. The code is your private key — your work follows it on any device.</p>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: C.muted }}>Your name
          <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="e.g. Alex Morgan" style={nameInp} onKeyDown={(e) => e.key === "Enter" && go()} autoFocus />
        </label>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: C.muted, display: "block", marginTop: 14 }}>Access code
          <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(""); }} placeholder="NW-XXXXX" style={codeInp} onKeyDown={(e) => e.key === "Enter" && go()} />
        </label>
        {err && <p style={{ color: C.red, fontSize: 13, margin: "10px 0 0" }}>⚠ {err}</p>}
        <div style={{ marginTop: 20 }}>
          <Btn kind="navy" onClick={go} disabled={!ready || busy} style={{ width: "100%", justifyContent: "center" }}>{busy ? "Checking…" : "Enter the Cockpit"} {!busy && <ChevronRight size={16} />}</Btn>
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

/* ================= INSTRUCTOR DASHBOARD — analytics ================= */
const ACT_DEF = {};
DAYS.forEach((d) => d.activities.forEach((a) => { ACT_DEF[a.id] = a; }));
const MEDAL = ["🥇", "🥈", "🥉"];
const segBtn = (active) => ({ fontFamily: sans, fontSize: 12.5, fontWeight: 700, padding: "6px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${active ? C.teal : C.line}`, background: active ? C.teal : "#fff", color: active ? "#fff" : C.body });
const chipBtn = (active) => ({ fontFamily: sans, fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 8, cursor: "pointer", border: `1px solid ${active ? C.navy : C.line}`, background: active ? C.cardl : "#fff", color: active ? C.navy : C.body, textAlign: "left" });
const thL = { textAlign: "left", color: "#fff", fontWeight: 600, padding: "9px 11px", whiteSpace: "nowrap" };
const thC = { textAlign: "center", color: "#fff", fontWeight: 600, padding: "9px 11px", whiteSpace: "nowrap" };
const tdC = { textAlign: "center", padding: "8px 11px", borderTop: `1px solid ${C.line}` };

// per-learner quiz accuracy + score, computed from the interactive `work` state
function quizStats(data) {
  const work = (data && data.work) || {};
  let correct = 0, possible = 0, answered = 0;
  Object.keys(ACT_DEF).forEach((id) => {
    const a = ACT_DEF[id], wk = work[id];
    if (!wk || !wk.checked) return;
    if (a.type === "classify") {
      const pl = wk.placements || {};
      correct += a.items.filter((it) => pl[it] === a.correct[it]).length;
      possible += a.items.length; answered++;
    } else if (a.type === "spot") {
      const sel = wk.sel || [];
      correct += sel.filter((s) => a.correct.includes(s)).length;
      possible += a.correct.length; answered++;
    }
  });
  return { correct, possible, answered, pct: possible ? Math.round((correct / possible) * 100) : 0 };
}
function scoreOf(data) {
  const done = ALL_IDS.filter((id) => data && data.done && data.done[id]).length;
  const q = quizStats(data);
  const backlog = (data && data.backlog && data.backlog.length) || 0;
  const plan = data && (data.plan || "").trim() ? 1 : 0;
  return { done, correct: q.correct, accuracy: q.pct, answered: q.answered, backlog, plan, points: done + q.correct * 2 + backlog + plan * 5 };
}

/* ---- Winners / leaderboard ---- */
function Leaderboard({ learners }) {
  if (learners.length === 0) return <Card><p style={{ margin: 0, color: C.muted }}>No one has signed in yet.</p></Card>;
  const ranked = learners.map((l) => ({ ...l, s: scoreOf(l.data) })).sort((a, b) => b.s.points - a.s.points);
  const max = Math.max(1, ranked[0].s.points);
  const top3 = ranked.slice(0, 3);
  const best = (key) => ranked.slice().sort((a, b) => b.s[key] - a.s[key])[0];
  const supers = [
    { label: "Furthest along", w: best("done"), val: (s) => `${Math.round((s.done / ALL_IDS.length) * 100)}%`, ok: (s) => s.done > 0 },
    { label: "Sharpest answers", w: best("accuracy"), val: (s) => `${s.accuracy}%`, ok: (s) => s.answered >= 2 },
    { label: "Most opportunities", w: best("backlog"), val: (s) => `${s.backlog}`, ok: (s) => s.backlog > 0 },
  ].filter((x) => x.w && x.ok(x.w.s));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, top3.length)},1fr)`, gap: 12, marginBottom: 16 }}>
        {top3.map((l, i) => (
          <Card key={l.code} style={{ textAlign: "center", borderTop: `4px solid ${[C.gold, C.muted, C.amber][i]}`, padding: "18px 14px" }}>
            <div style={{ fontSize: 30 }}>{MEDAL[i]}</div>
            <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: C.navy, marginTop: 2 }}>{l.display}</div>
            <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: C.teal, lineHeight: 1.1 }}>{l.s.points}</div>
            <div style={{ fontSize: 11, color: C.muted }}>points</div>
          </Card>
        ))}
      </div>
      {supers.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
          {supers.map((x) => (
            <Card key={x.label} style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: C.muted, fontWeight: 700 }}><Trophy size={13} color={C.amber} />{x.label.toUpperCase()}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginTop: 3 }}>{x.w.display}</div>
              <div style={{ fontSize: 13, color: C.teal, fontWeight: 700 }}>{x.val(x.w.s)}</div>
            </Card>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gap: 8 }}>
        {ranked.map((l, i) => (
          <div key={l.code} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ width: 28, textAlign: "center", fontWeight: 700, color: C.muted, fontSize: i < 3 ? 18 : 14 }}>{i < 3 ? MEDAL[i] : i + 1}</div>
            <div style={{ minWidth: 120, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{l.display}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{Math.round((l.s.done / ALL_IDS.length) * 100)}% done · {l.s.accuracy}% accuracy · {l.s.backlog} opps{l.s.plan ? " · plan ✓" : ""}</div>
            </div>
            <div style={{ width: "38%", minWidth: 110 }}>
              <div style={{ height: 8, background: C.line, borderRadius: 99 }}><div style={{ width: `${(l.s.points / max) * 100}%`, height: "100%", background: C.teal, borderRadius: 99 }} /></div>
            </div>
            <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: C.navy, width: 40, textAlign: "right" }}>{l.s.points}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11.5, color: C.muted, marginTop: 10 }}>Points = activities done + 2× correct quiz answers + opportunities captured + 5 for a written plan.</p>
    </div>
  );
}

/* ---- per-exercise aggregation ---- */
function ExerciseAgg({ a, learners }) {
  if (a.type === "classify") {
    const rows = a.items.map((it) => {
      const counts = {}; a.buckets.forEach((b) => (counts[b] = 0));
      let placed = 0, correct = 0;
      learners.forEach((l) => {
        const wk = (l.data.work || {})[a.id]; if (!wk || !wk.checked) return;
        const b = (wk.placements || {})[it];
        if (b && counts[b] !== undefined) { counts[b]++; placed++; if (b === a.correct[it]) correct++; }
      });
      return { it, counts, placed, correct };
    });
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans, fontSize: 13, minWidth: 480 }}>
          <thead><tr style={{ background: C.deep }}><th style={thL}>Item</th>{a.buckets.map((b) => <th key={b} style={thC}>{b}</th>)}<th style={thC}>Right</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.it} style={{ background: i % 2 ? C.light : "#fff" }}>
                <td style={{ textAlign: "left", padding: "8px 11px", borderTop: `1px solid ${C.line}` }}><strong style={{ color: C.navy }}>{r.it}</strong></td>
                {a.buckets.map((b) => { const ok = a.correct[r.it] === b; return <td key={b} style={{ ...tdC, background: ok ? C.greenl : "transparent", fontWeight: ok ? 700 : 400, color: ok ? C.green : C.body }}>{r.counts[b] || ""}</td>; })}
                <td style={{ ...tdC, color: C.muted }}>{r.placed ? Math.round((r.correct / r.placed) * 100) + "%" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 11.5, color: C.muted, marginTop: 8 }}>Green column = the correct bucket. Numbers = how many learners placed each item there.</p>
      </div>
    );
  }
  if (a.type === "spot") {
    const data = a.options.map((o) => {
      let n = 0; learners.forEach((l) => { const wk = (l.data.work || {})[a.id]; if (wk && wk.checked && (wk.sel || []).includes(o)) n++; });
      return { name: o.length > 24 ? o.slice(0, 23) + "…" : o, full: o, n, correct: a.correct.includes(o) };
    });
    let answered = 0, full = 0;
    learners.forEach((l) => { const wk = (l.data.work || {})[a.id]; if (wk && wk.checked) { answered++; const sel = wk.sel || []; if (sel.length === a.correct.length && sel.every((s) => a.correct.includes(s))) full++; } });
    return (
      <div>
        <div style={{ height: Math.max(150, data.length * 34) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 24 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: C.body }} />
              <Tooltip formatter={(v) => [v, "picked"]} labelFormatter={(l, p) => (p && p[0] ? p[0].payload.full : l)} />
              <Bar dataKey="n" radius={[0, 4, 4, 0]}>{data.map((d, i) => <Cell key={i} fill={d.correct ? C.green : C.muted} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>Green bars = correct answers · {full}/{answered} got it fully right.</p>
      </div>
    );
  }
  // text-based: reflect / ai / case / lab
  const responses = learners.map((l) => {
    let text = (l.data.answers || {})[a.id] || "";
    if (a.type === "lab" && !text.trim()) { const b = (l.data.work || {})[a.id] && (l.data.work || {})[a.id].builder; if (b) text = buildPrompt(b); }
    return { name: l.display, text };
  }).filter((x) => x.text.trim());
  if (responses.length === 0) return <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>No written responses yet.</p>;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {responses.map((r, i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>{r.name}</div>
          <div style={{ fontSize: 13.5, color: C.ink, whiteSpace: "pre-wrap", marginTop: 3 }}>{r.text}</div>
        </div>
      ))}
    </div>
  );
}
function ByExercise({ learners }) {
  const [dayN, setDayN] = useState(1);
  const [actId, setActId] = useState(DAYS[0].activities[0].id);
  const day = DAYS[dayN - 1];
  const a = ACT_DEF[actId] && ACT_DEF[actId].id && day.activities.some((x) => x.id === actId) ? ACT_DEF[actId] : day.activities[0];
  const pickDay = (n) => { setDayN(n); setActId(DAYS[n - 1].activities[0].id); };
  const responders = learners.filter((l) => {
    const wk = (l.data.work || {})[a.id], ans = (l.data.answers || {})[a.id];
    return (wk && (wk.checked || wk.builder)) || (ans && ans.trim());
  });
  const meta = TYPE_META[a.type] || { c: C.teal, t: a.type };
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {DAYS.map((d) => <button key={d.n} onClick={() => pickDay(d.n)} style={segBtn(dayN === d.n)}>Day {d.n}</button>)}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {day.activities.map((act) => <button key={act.id} onClick={() => setActId(act.id)} style={chipBtn(a.id === act.id)}>{act.sub} · {act.title}</button>)}
      </div>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <Pill bg={meta.c} fg="#fff">{meta.t}</Pill><H size={17}>{a.title}</H>
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>{responders.length} of {learners.length} answered</div>
        <ExerciseAgg a={a} learners={learners} />
      </Card>
    </div>
  );
}

/* ---- cohort backlog ---- */
function CohortBacklog({ learners }) {
  const all = learners.flatMap((l) => l.data.backlog || []);
  if (!all.length) return <Card><p style={{ margin: 0, color: C.muted }}>No opportunities captured yet.</p></Card>;
  const pieData = GOALS.map((g) => ({ name: g, value: all.filter((b) => b.goal === g).length, fill: GOAL_COLOR[g] })).filter((d) => d.value > 0);
  const cell = (v, r) => all.filter((b) => b.value === v && b.readiness === r).length;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Stat label="OPPORTUNITIES" value={all.length} />
        <Stat label="CONTRIBUTORS" value={learners.filter((l) => (l.data.backlog || []).length).length} />
        <Stat label="QUICK WINS" value={all.filter((b) => b.value === "High" && b.readiness === "High").length} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <Card>
          <H size={16} style={{ marginBottom: 8 }}>By goal</H>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={78} paddingAngle={2}>{pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {pieData.map((e) => <span key={e.name} style={{ fontSize: 12, color: C.body, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: e.fill, display: "inline-block" }} />{e.name} {e.value}</span>)}
          </div>
        </Card>
        <Card>
          <H size={16} style={{ marginBottom: 8 }}>Value × readiness</H>
          <div style={{ display: "grid", gridTemplateColumns: "62px repeat(3,1fr)", gap: 6 }}>
            <div />
            {LEVELS.slice().reverse().map((rd) => <div key={rd} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.muted }}>R:{rd}</div>)}
            {LEVELS.map((v) => (
              <React.Fragment key={v}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "flex", alignItems: "center" }}>V:{v}</div>
                {LEVELS.slice().reverse().map((rd) => { const n = cell(v, rd); const quick = v === "High" && rd === "High"; return (
                  <div key={rd} style={{ minHeight: 46, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontSize: 20, fontWeight: 700, color: n ? (quick ? C.green : C.navy) : C.line, background: quick ? C.greenl : C.light, border: `1px solid ${quick ? C.mint : C.line}` }}>{n || ""}</div>
                ); })}
              </React.Fragment>
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Top-left (high value, high readiness) = the cohort's quick wins.</p>
        </Card>
      </div>
      <H size={16} style={{ margin: "18px 0 10px" }}>All opportunities ({all.length})</H>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
        {all.map((b, i) => <div key={i} style={{ fontSize: 12.5, background: "#fff", border: `1px solid ${C.line}`, borderLeft: `3px solid ${GOAL_COLOR[b.goal] || C.teal}`, borderRadius: 7, padding: "6px 9px", color: C.ink }}><strong style={{ color: C.navy }}>{b.title}</strong> <span style={{ color: C.muted }}>· {b.value}/{b.readiness}</span></div>)}
      </div>
    </div>
  );
}

/* ---- roster (per-seat detail) ---- */
function Roster({ rows, open, setOpen, anon }) {
  if (rows.length === 0) return <Card><p style={{ margin: 0, color: C.muted }}>No seats yet for this cohort. Generate some codes above.</p></Card>;
  let n = 0; const delegNum = {};
  rows.forEach((r) => { if (r.claimed_at) { n++; delegNum[r.code] = n; } });
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((r) => {
        const claimed = !!r.claimed_at;
        const pct = pctOf(r.data && r.data.done);
        const bl = (r.data && r.data.backlog) || [];
        const isOpen = open === r.code;
        const title = anon && claimed ? `Delegate ${delegNum[r.code]}` : (r.handle || (claimed ? "(no name set)" : "Unclaimed seat"));
        return (
          <Card key={r.code} style={{ padding: 0, overflow: "hidden", opacity: claimed ? 1 : 0.7 }}>
            <button onClick={() => claimed && setOpen(isOpen ? null : r.code)}
              style={{ width: "100%", border: "none", background: "none", cursor: claimed ? "pointer" : "default", textAlign: "left", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 34, height: 34, borderRadius: 999, background: claimed ? C.teal : C.muted, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{claimed ? (anon ? delegNum[r.code] : (r.handle ? r.handle.charAt(0).toUpperCase() : "·")) : "·"}</div>
              <div style={{ minWidth: 140, flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: claimed ? C.navy : C.muted }}>{title}{!anon && <span style={{ fontFamily: "Consolas, monospace", fontSize: 12, color: C.muted, fontWeight: 600 }}> · {r.code}</span>}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>Cohort {r.cohort} · {claimed ? `active ${new Date(r.updated_at).toLocaleString()}` : "not yet used"}</div>
              </div>
              {claimed && <div style={{ minWidth: 120 }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{pct}% · {bl.length} opps</div>
                <div style={{ height: 6, width: 120, background: C.line, borderRadius: 99, marginTop: 4 }}><div style={{ width: `${pct}%`, height: "100%", background: C.teal, borderRadius: 99 }} /></div>
              </div>}
              {claimed && <ChevronDown size={17} color={C.muted} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />}
            </button>
            {isOpen && claimed && (
              <div style={{ borderTop: `1px solid ${C.line}`, padding: 16, background: C.light }}>
                <H size={14} style={{ marginBottom: 8 }}>Opportunity backlog ({bl.length})</H>
                {bl.length === 0 ? <p style={{ color: C.muted, fontSize: 13, margin: "0 0 14px" }}>None captured.</p> : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {bl.map((b) => <span key={b.id} style={{ fontSize: 12.5, background: "#fff", border: `1px solid ${C.line}`, borderLeft: `3px solid ${GOAL_COLOR[b.goal] || C.teal}`, borderRadius: 7, padding: "5px 9px", color: C.ink }}>{b.title} <span style={{ color: C.muted }}>· {b.value}/{b.readiness}</span></span>)}
                  </div>
                )}
                <H size={14} style={{ marginBottom: 8 }}>90-day plan</H>
                <p style={{ whiteSpace: "pre-wrap", fontSize: 13.5, color: (r.data && (r.data.plan || "").trim()) ? C.ink : C.muted, margin: "0 0 14px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, padding: 10 }}>{(r.data && (r.data.plan || "").trim()) || "— not written yet —"}</p>
                <H size={14} style={{ marginBottom: 8 }}>Mission notes</H>
                {(() => {
                  const ans = (r.data && r.data.answers) || {};
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
  );
}

/* ---- per-delegate visual results ---- */
function metricsOf(l) {
  const s = scoreOf(l.data);
  return { progress: Math.round((s.done / ALL_IDS.length) * 100), accuracy: s.accuracy, opps: s.backlog, plan: s.plan, points: s.points, answered: s.answered };
}

function Ring({ pct, color, size = 64 }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" style={{ fontFamily: serif, fontWeight: 700, fontSize: 14, fill: C.navy }}>{pct}%</text>
    </svg>
  );
}

const ScatterTip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 9px", fontSize: 12, color: C.body, boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}>
      <strong style={{ color: C.navy }}>{d.name}</strong><br />{d.x}% done · {d.y}% accuracy · {d.opps} opp{d.opps === 1 ? "" : "s"}
    </div>
  );
};

function DelegateCompareChart({ learners }) {
  const data = learners.map((l) => { const m = metricsOf(l); return { name: l.display, "Progress %": m.progress, "Accuracy %": m.accuracy, Opportunities: m.opps }; })
    .sort((a, b) => b["Progress %"] - a["Progress %"]);
  return (
    <Card>
      <H size={16} style={{ marginBottom: 4 }}>Delegate comparison</H>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px" }}>Progress & accuracy on the left axis (0–100), opportunities on the right.</p>
      <div style={{ height: Math.max(260, 90 + data.length * 18), minWidth: Math.max(360, data.length * 70) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 6, left: -10, bottom: 50 }} barGap={1}>
            <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={60} tick={{ fontSize: 10.5, fill: C.body }} />
            <YAxis yAxisId="pct" domain={[0, 100]} tick={{ fontSize: 11, fill: C.muted }} />
            <YAxis yAxisId="cnt" orientation="right" allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} />
            <Tooltip cursor={{ fill: C.light }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="pct" dataKey="Progress %" fill={C.teal} radius={[3, 3, 0, 0]} />
            <Bar yAxisId="pct" dataKey="Accuracy %" fill={C.mint} radius={[3, 3, 0, 0]} />
            <Bar yAxisId="cnt" dataKey="Opportunities" fill={C.amber} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ProgressAccuracyScatter({ learners }) {
  const pts = learners.map((l) => { const m = metricsOf(l); return { x: m.progress, y: m.accuracy, z: Math.max(1, m.opps), name: l.display, opps: m.opps }; });
  const fillFor = (p) => (p.x >= 50 && p.y >= 50 ? C.green : p.x < 50 && p.y < 50 ? C.amber : C.teal);
  return (
    <Card>
      <H size={16} style={{ marginBottom: 4 }}>Progress vs accuracy</H>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px" }}>How far along (→) vs how accurate (↑). Bubble size = opportunities captured. Top-right = your strongest delegates.</p>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 14, right: 18, bottom: 28, left: 0 }}>
            <XAxis type="number" dataKey="x" name="Progress" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: C.muted }}
              label={{ value: "Progress", position: "insideBottom", offset: -14, fontSize: 12, fill: C.muted }} />
            <YAxis type="number" dataKey="y" name="Accuracy" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: C.muted }}
              label={{ value: "Accuracy", angle: -90, position: "insideLeft", fontSize: 12, fill: C.muted }} />
            <ZAxis type="number" dataKey="z" range={[80, 520]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTip />} />
            <Scatter data={pts}>
              {pts.map((p, i) => <Cell key={i} fill={fillFor(p)} fillOpacity={0.78} stroke={C.navy} strokeWidth={0.5} />)}
              <LabelList dataKey="name" position="top" style={{ fontSize: 10, fill: C.body }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function DelegateCards({ learners }) {
  const ranked = learners.map((l) => ({ l, m: metricsOf(l) })).sort((a, b) => b.m.points - a.m.points);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
      {ranked.map(({ l, m }) => (
        <Card key={l.code} style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Ring pct={m.progress} color={m.progress >= 66 ? C.green : m.progress >= 33 ? C.teal : C.amber} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.display}</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{m.points} points</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 11 }}>
            <Pill bg={C.cardl} fg={C.navy}>Accuracy {m.accuracy}%</Pill>
            <Pill bg={C.cardl} fg={C.navy}>{m.opps} opp{m.opps === 1 ? "" : "s"}</Pill>
            {m.plan ? <Pill bg={C.greenl} fg={C.green}>Plan ✓</Pill> : <Pill bg={C.light} fg={C.muted}>No plan</Pill>}
          </div>
        </Card>
      ))}
    </div>
  );
}

function cellStatus(data, id) {
  if (data && data.done && data.done[id]) return 2;
  const ans = (data && data.answers && data.answers[id]) || "";
  const wk = (data && data.work && data.work[id]) || null;
  if ((ans && ans.trim()) || (wk && (wk.checked || wk.builder || (wk.sel && wk.sel.length) || (wk.placements && Object.keys(wk.placements).length)))) return 1;
  return 0;
}
function CompletionHeatmap({ learners }) {
  const STAT = [C.light, C.gold, C.teal];
  const LABELS = ["not started", "in progress", "completed"];
  return (
    <Card>
      <H size={16} style={{ marginBottom: 4 }}>Completion heatmap</H>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px" }}>Each square is one activity. Hover for details.</p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 3, fontFamily: sans }}>
          <thead>
            <tr>
              <th style={{ position: "sticky", left: 0, background: "#fff" }}></th>
              {DAYS.map((d) => <th key={d.n} colSpan={d.activities.length} style={{ fontSize: 11, color: C.muted, fontWeight: 700, padding: "0 0 6px", textAlign: "center", borderBottom: `2px solid ${C.line}` }}>Day {d.n}</th>)}
            </tr>
          </thead>
          <tbody>
            {learners.map((l) => (
              <tr key={l.code}>
                <td style={{ position: "sticky", left: 0, background: "#fff", fontSize: 12, fontWeight: 600, color: C.navy, paddingRight: 10, whiteSpace: "nowrap", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis" }}>{l.display}</td>
                {DAYS.flatMap((d) => d.activities.map((a) => {
                  const s = cellStatus(l.data, a.id);
                  return <td key={a.id} title={`${l.display} — ${a.sub} · ${a.title}: ${LABELS[s]}`}
                    style={{ width: 18, height: 18, minWidth: 18, borderRadius: 4, background: STAT[s], border: `1px solid ${s === 0 ? C.line : "transparent"}`, cursor: "default" }} />;
                }))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
        {LABELS.map((t, i) => <span key={t} style={{ fontSize: 11.5, color: C.body, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: STAT[i], border: `1px solid ${i === 0 ? C.line : "transparent"}` }} />{t}</span>)}
      </div>
    </Card>
  );
}

function CohortConfidence({ learners }) {
  const data = DAYS.map((d) => {
    const vals = learners.map((l) => (l.data.confidence || {})[d.n]).filter((v) => typeof v === "number");
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { name: `Day ${d.n}`, avg: Math.round(avg * 10) / 10, n: vals.length };
  });
  const any = data.some((x) => x.n > 0);
  return (
    <Card>
      <H size={16} style={{ marginBottom: 4 }}>Confidence by day</H>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 12px" }}>Average self-rated confidence (1–5) at the end of each day. Amber bars flag where the cohort feels shaky — worth revisiting.</p>
      {!any ? <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>No confidence ratings submitted yet.</p> : (
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -12, right: 10, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.body }} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: C.muted }} />
              <Tooltip formatter={(v, k, p) => [`${v}/5 · ${p.payload.n} rated`, "Avg confidence"]} cursor={{ fill: C.light }} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>{data.map((d, i) => <Cell key={i} fill={d.avg >= 3.5 ? C.green : d.avg >= 2.5 ? C.teal : d.avg > 0 ? C.amber : C.line} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
function Delegates({ learners }) {
  if (learners.length === 0) return <Card><p style={{ margin: 0, color: C.muted }}>No delegates have signed in yet.</p></Card>;
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <DelegateCompareChart learners={learners} />
      <CohortConfidence learners={learners} />
      <ProgressAccuracyScatter learners={learners} />
      <div>
        <H size={16} style={{ margin: "2px 0 10px" }}>Per-delegate progress</H>
        <DelegateCards learners={learners} />
      </div>
      <CompletionHeatmap learners={learners} />
    </div>
  );
}

/* ---- instructor content release control ---- */
function ReleaseControl({ adminKey }) {
  const [days, setDays] = useState([]);
  const [locked, setLocked] = useState([]);
  const [cases, setCases] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState(""); // "" | "saving" | "saved" | "err:<msg>"
  const [expand, setExpand] = useState(null);
  useEffect(() => { (async () => { const r = await fetchRelease(); if (r) { setDays(r.days || []); setLocked(r.locked || []); setCases(r.cases || []); } setLoaded(true); })(); }, []);
  // Auto-publish on every change — toggling IS the action, no separate save.
  const persist = async (nextDays, nextLocked, nextCases) => {
    setStatus("saving");
    try { await setReleaseRemote(nextDays, nextLocked, nextCases, adminKey); setStatus("saved"); setTimeout(() => setStatus((s) => s === "saved" ? "" : s), 1800); }
    catch (e) { setStatus("err:" + (e.message || "Failed to publish")); }
  };
  const toggleDay = (n) => { const nd = days.includes(n) ? days.filter((x) => x !== n) : [...days, n].sort((a, b) => a - b); setDays(nd); persist(nd, locked, cases); };
  const toggleAct = (id) => { const nl = locked.includes(id) ? locked.filter((x) => x !== id) : [...locked, id]; setLocked(nl); persist(days, nl, cases); };
  const toggleCase = (id) => { const nc = cases.includes(id) ? cases.filter((x) => x !== id) : [...cases, id]; setCases(nc); persist(days, locked, nc); };
  const openAll = () => { const nd = ALL_DAYS.slice(); setDays(nd); persist(nd, locked, cases); };
  const lockAll = () => { setDays([]); setLocked([]); setCases([]); persist([], [], []); };
  const openAllCases = () => { const nc = CASE_IDS.slice(); setCases(nc); persist(days, locked, nc); };
  const lockAllCases = () => { setCases([]); persist(days, locked, []); };
  const lockSec = (ids) => { const nl = Array.from(new Set([...locked, ...ids])); setLocked(nl); persist(days, nl, cases); };
  const openSec = (ids) => { const nl = locked.filter((x) => !ids.includes(x)); setLocked(nl); persist(days, nl, cases); };
  if (!loaded) return <Card><p style={{ margin: 0, color: C.muted }}>Loading release state…</p></Card>;
  const statusEl = status === "saving" ? <span style={{ fontSize: 12.5, color: C.muted, display: "inline-flex", alignItems: "center", gap: 5 }}><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />Publishing…</span>
    : status === "saved" ? <span style={{ fontSize: 12.5, fontWeight: 700, color: C.green }}>✓ Live — delegates update within ~20s</span>
    : status.startsWith("err:") ? <span style={{ fontSize: 12.5, color: C.red }}>⚠ {status.slice(4)}</span> : null;
  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}><Lock size={17} color={C.teal} /><H size={16}>Content release</H><span style={{ marginLeft: "auto" }}>{statusEl}</span></div>
        <p style={{ color: C.body, fontSize: 13, margin: "0 0 12px" }}>Flip a day to <strong>Released</strong> and it publishes instantly — every delegate's screen opens within ~20 seconds, no reload. Locked days/activities show a "your facilitator will open this" message. <strong>Releasing a day opens all its activities</strong>; use the per-activity locks only to hold specific ones back.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn small kind="ghost" onClick={openAll}><Unlock size={14} />Open all days</Btn>
          <Btn small kind="ghost" onClick={lockAll}><Lock size={14} />Lock everything</Btn>
        </div>
      </Card>
      <div style={{ display: "grid", gap: 10 }}>
        {DAYS.map((d) => {
          const open = days.includes(d.n);
          const isExp = expand === d.n;
          const lockedCount = d.activities.filter((a) => locked.includes(a.id)).length;
          return (
            <Card key={d.n} style={{ padding: 0, overflow: "hidden", borderLeft: `4px solid ${open ? C.mint : C.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", flexWrap: "wrap" }}>
                <div style={{ minWidth: 150, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.muted }}>DAY {d.n}</div>
                  <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: C.navy }}>{d.title}</div>
                </div>
                {open && <button onClick={() => setExpand(isExp ? null : d.n)} style={{ border: "none", background: "none", cursor: "pointer", color: lockedCount ? C.amber : C.muted, fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {lockedCount ? `${lockedCount} locked` : "Per-activity"} <ChevronDown size={15} style={{ transform: isExp ? "rotate(180deg)" : "none" }} /></button>}
                <button onClick={() => toggleDay(d.n)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", border: `1px solid ${open ? C.mint : C.line}`, background: open ? C.mint : "#fff", color: open ? "#fff" : C.muted, borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700 }}>
                  {open ? <><Unlock size={14} /> Released</> : <><Lock size={14} /> Locked</>}
                </button>
              </div>
              {open && isExp && (
                <div style={{ borderTop: `1px solid ${C.line}`, padding: 14, background: C.light, display: "grid", gap: 6 }}>
                  <p style={{ fontSize: 12, color: C.muted, margin: "0 0 4px" }}>Day {d.n} is open. Lock any individual activity — or a whole section — you want to hold back for now.</p>
                  {(() => {
                    const groups = sectionGroups(d.activities);
                    const multi = groups.length > 1;
                    const mini = { cursor: "pointer", border: `1px solid ${C.line}`, background: "#fff", color: C.muted, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, fontFamily: sans };
                    return groups.map((g) => {
                      const ids = g.items.map((x) => x.id);
                      return (
                        <div key={g.s.id} style={{ display: "grid", gap: 6 }}>
                          {multi && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: C.teal, textTransform: "uppercase" }}>{g.s.label}</span>
                            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                              <button onClick={() => openSec(ids)} style={mini}>Open all</button>
                              <button onClick={() => lockSec(ids)} style={mini}>Lock all</button>
                            </div>
                          </div>}
                          {g.items.map((a) => {
                            const alock = locked.includes(a.id);
                            return (
                              <button key={a.id} onClick={() => toggleAct(a.id)}
                                style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer", border: `1px solid ${alock ? C.amber : C.line}`, background: "#fff", borderRadius: 8, padding: "8px 11px", fontFamily: sans }}>
                                {alock ? <Lock size={15} color={C.amber} /> : <Unlock size={15} color={C.mint} />}
                                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 30 }}>{a.sub}</span>
                                <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{a.title}</span>
                                <span style={{ fontSize: 11.5, fontWeight: 700, color: alock ? C.amber : C.mint }}>{alock ? "Locked" : "Open"}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <Card style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}><BookOpen size={17} color={C.teal} /><H size={16}>Case studies</H>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Btn small kind="ghost" onClick={openAllCases}><Unlock size={14} />Release all</Btn>
            <Btn small kind="ghost" onClick={lockAllCases}><Lock size={14} />Lock all</Btn>
          </div>
        </div>
        <p style={{ color: C.body, fontSize: 13, margin: "0 0 12px" }}>Release each case study to delegates independently — default is locked. Publishes instantly, like the days above.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {DAYS.map((d) => {
            const items = CASES.filter((x) => x.day === d.n);
            return (
              <div key={d.n}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.muted, marginBottom: 6 }}>DAY {d.n} · {d.title}</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {items.map((x) => {
                    const open = cases.includes(x.id);
                    return (
                      <button key={x.id} onClick={() => toggleCase(x.id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer", border: `1px solid ${open ? C.mint : C.line}`, background: "#fff", borderRadius: 8, padding: "8px 11px", fontFamily: sans }}>
                        {open ? <Unlock size={15} color={C.mint} /> : <Lock size={15} color={C.muted} />}
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: x.kind === "primary" ? C.navy : C.muted, borderRadius: 5, padding: "2px 6px", flexShrink: 0 }}>{x.code}</span>
                        <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{x.title}</span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: open ? C.mint : C.muted }}>{open ? "Released" : "Locked"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: C.muted }}>{days.length}/{ALL_DAYS.length} days open · {locked.length} activit{locked.length === 1 ? "y" : "ies"} locked · {cases.length}/{CASE_IDS.length} cases released</span>
        <span style={{ marginLeft: "auto" }}>{statusEl}</span>
      </div>
    </div>
  );
}

/* ---- facilitator run-sheet (instructor-only talking points) ---- */
const FACILITATOR = {
  "1.1e": "Watch for over-automating — selection and negotiation must stay human. Land: high volume + low judgement = automate first.",
  "1.1a": "Compare the AI's list to theirs: did it surface use cases they missed? Push the 'which three would you start with' follow-up.",
  "1.2e": "Push past 'AI does it faster' to 'AI changes the decision'. The freed-time answer reveals who really gets it.",
  "1.2a": "If the AI stays at task level, model the reframe: what strategic question does each example actually answer?",
  "1.3e": "Every option is a real risk except 'it is always cheaper'. Draw out the safeguard for each as you reveal.",
  "1.3a": "Land that a human owns the decision — AI scores, people decide. Ask which safeguard goes in first.",
  "1.4e": "The point to land: if an idea can't be tied to a board goal, it doesn't belong on the roadmap.",
  "1.4a": "Drive to measurement — how would we prove the first initiative released value?",
  "1.5e": "Most groups forget the supplier has concerns. Surface the supplier's view, not just the buyer's.",
  "1.5a": "Good answers genuinely represent the supplier. Ask: what makes a supplier trust rather than fear this?",
  "1lab": "First real prompt practice. Watch the four-part recipe (role/context/task/format); the stretch (argue against AI) builds the risk list.",
  "1case": "Day 1 capstone. Insist on breadth — all four areas — and that the best ideas land in the Backlog; it builds all week.",
  "2.0p": "Day 2 opener — get delegates mapping their REAL frustrations (hours × pain) before any tool talk. Push them to send their top 3 to the Backlog; it seeds the whole week's strategy.",
  "2.1e": "The trap is segmenting on spend alone. Single-source / high-risk suppliers are strategic even on modest spend.",
  "2.1a": "Push back on the AI: should single-source, high-risk suppliers be strategic even on low spend?",
  "2.1seg": "Four-tier model (Strategic/Critical/Preferred/Transactional). Insist delegates commit their OWN tiers before running the AI, then drive the debate where they differ — Helios on the Strategic/Critical line is the richest discussion.",
  "2.1disc": "20-minute sourcing sprint off the Helios single-source crisis. For the advanced version, give each table a different category (IT hardware, FM, construction, fleet, office supplies, solar, cybersecurity, engineering services) and have them present search strategy + longlist + top 3 + prompts used. Debrief hard on validation: which AI-named suppliers are real? what's missing (financials, references)? what still needs human due diligence? Land 'days→minutes, but humans still own the final decision'.",
  "2.2e": "Answer is Aurora (worst on-time + defects + volatile). Make them justify it from the data, not the name.",
  "2.2a": "Land the shift from lagging to leading indicators — what external signal would warn us earlier? (See the Signals tab.)",
  "2.2hc": "Make delegates commit a verdict per supplier before the AI. Land 'read the trend, not the number' — Aurora (down across the board) is urgent; Meridian is the benchmark.",
  "2.2sc": "Groups design the weighting (must total 100%) — debate the weights, that IS the learning. Then AI scores and ranks. The output is a template they run quarterly; push them to 'Copy template' to take it.",
  "2.2li": "Quick 15-min sorter (Module 2 opener). Land the rear-view (lagging) vs windscreen (leading) metaphor, then discuss which variables most predict failure — that's exactly what ML does. The leading set (turnover, utilisation, debt, resignations) is what AI monitoring can watch and humans rarely do.",
  "2.2sig": "The 'looks fine but isn't' exercise. Don't let them be reassured by Meridian's 96% on-time — those are lagging. The five changes are leading signals of trouble. Land: act before the scorecard turns red.",
  "2.2hs": "A live scoring calculator — change a weight and the ranking moves. The 'aha': scoring is just weighted sub-scores. Debrief that AI does this continuously across hundreds of signals. Aurora ranks worst on almost any sensible weighting.",
  "2.3e": "Helios and Sahara (single-source + region). Land: weigh dependency and region above raw spend.",
  "2.3a": "Ask what sub-tier (tier-2) risks they're still blind to — sets up the supplier-signals discussion.",
  "2.3det": "Run as a group competition: each group agrees a risk score + mitigation + contingency, then compares with the AI and the other groups (their scores show in the By-exercise tab). Land single-source + financial distress + no site redundancy = critical; logo/email are noise.",
  "m3hidden": "Module 3 opener. Let them feel 'diversified' at Tier 1, then hit Reveal — all five depend on ChipCo. The aha: Tier-1 diversification can hide a 100% single point of failure. AI maps sub-tiers humans never see.",
  "m3score": "Live risk heat map — weight the four dimensions and the ranking updates. Delta is worst on every dimension; Gamma close. Learning point: AI focuses you on the few suppliers that matter most.",
  "m3crisis": "The capstone simulation (40–45 min). Groups are the leadership team — 24h / 30-day / 12-month response, then pressure-test with AI and present (Risk assessment · Mitigation · Executive recommendation). Land: the goal is resilience and continuity, not just spotting risk.",
  "m4friction": "Module 4 opener. Map the journey, mark friction, then let AI find the fixes. Quick wins are the high-frequency, high-pain steps (invoice queries, manual registration). Debrief which AI could eliminate fastest.",
  "m4comms": "Timed comms drill (reuses the 15-minute-assistant format). Three docs in minutes, then groups compare prompt quality and output. Land: AI slashes prep time — but always edit in real names/dates.",
  "m4innov": "Joint buyer-supplier innovation sprint (40–45 min). Pick a challenge, AI-generate ideas, score on four criteria, pick the best, build a business case, present (idea · benefits · risks · roadmap). Reward ideas that hit cost + sustainability + waste together.",
  "2.4e": "Good collaboration is reciprocal. Watch for one-sided 'the supplier gives us data' answers.",
  "2.4a": "Drive to the up-front agreements (confidentiality, data use) — that's what makes data-sharing safe.",
  "2.4dev": "Land that AI turns 'this supplier is poor' into a costed, time-bound turnaround. Push the advanced ROI step — quantifying cost-of-poor-performance vs savings is what gets a development programme funded. Theme: develop before you drop.",
  "2.4inn": "Run as a timed sprint, then a 60-second pitch per team: idea, expected savings, implementation effort. The savings × effort framing surfaces the quick wins; reward ideas where the supplier co-invests.",
  "2.5e": "The line: be transparent that you use AI, keep the method internal. Avoid both over-sharing and hiding.",
  "2.5a": "Aim for warm and non-defensive — a defensive statement breeds the suspicion it's trying to avoid.",
  "2.5pack": "Time them — 15 minutes to generate all four documents. The lesson is speed + consistency; insist they'd edit in real names/dates before sending. A strong 'use it tomorrow' moment.",
  "2.6lab": "The most valuable takeaway — everyone leaves with a personal prompt library. Run the competition: best prompt per category wins (their starred picks show in the By-exercise tab). Enforce the four-part recipe and insist on real Northwind context, not generic prompts.",
  "2lab": "Chain the segmentation into a relationship plan. The stretch surfaces sub-tier blind spots again.",
  "2case": "Triggered by a near-miss. Insist risk ranking beats spend ranking, plus a transparency principle suppliers would accept.",
  "3.1e": "Auto-renew / rolling / evergreen = nobody managing it. Aurora's terms have lapsed entirely — the worst kind.",
  "3.1a": "Land the Helios 90-day notice deadline as time-critical. Ask which single contract is most urgent.",
  "3.2e": "Negotiation prep: evidence before emotion. Use the steel index in Signals. Land the walk-away point.",
  "3.2a": "Push for the single strongest point to cap the uncapped index — that's the crux of the negotiation.",
  "3.3e": "Helios (uncapped liability + no exit) and Aurora (no signed terms) over higher-value Meridian. Don't rank by value.",
  "3.3a": "Have the AI draft a plain-English liability clause for Helios — turns analysis into a deliverable.",
  "3.4e": "Weakest stage is post-signature monitoring, where Northwind loses control — the highest-value fix.",
  "3.4a": "Insist the flow includes ongoing monitoring and automatic post-signature alerts, not just e-signing.",
  "3.5e": "The rule to land: AI proposes, a human approves — never auto-sign a binding agreement.",
  "3.5a": "Ask which of the five rules matters most and what breaks if ignored — usually human accountability.",
  "3lab": "Turn the triage into a real supplier email (e.g. serving notice). Stretch: red-team the AI's own advice.",
  "3case": "Auditor-driven. Land how CLM monitoring stops recurrence across 5,000 contracts, plus two ethics rules.",
  "4.1e": "New products (40%) is worst and highest-impact — start where accuracy is poorest, not where it's easiest.",
  "4.1a": "Drive to a concrete first pilot and how they'd prove it worked — avoid vague 'use more AI'.",
  "4.2e": "Seasonal (£45m) and slow movers (dead stock) hold trapped cash. Fast movers at 96% are fine.",
  "4.2a": "Land dynamic safety stock + multi-echelon, while protecting service. Name the biggest cash release.",
  "4.3e": "Invoice matching (~200k/yr, rules-based, measurable) is the automation sweet spot. Route exceptions to people.",
  "4.3a": "Define touchless and the exception route. Push for real metrics (touchless %, cost/txn), not 'looking busy'.",
  "4.4e": "Failed deliveries (6%) and fleet utilisation (72%) are the weak numbers — routing and ETA opportunities.",
  "4.4a": "Land that dynamic routing cuts cost, miles and carbon together. Rank ideas by payback.",
  "4.5e": "Four ERPs = blind spots. Most value comes from connecting data already held — start with inbound critical parts.",
  "4.5a": "Push for a control tower built from existing data (no big platform) and the single highest-value early alert.",
  "4lab": "Turn the forecasting diagnosis into a one-page pilot. Stretch contrasts 'concise' vs 'thorough' prompts.",
  "4case": "COO wants cash and service. Insist on payback sequencing and one safeguard against efficiency-driven fragility.",
  "5.1e": "GenAI = adopt now; forecasting / risk / bounded agents = pilot; full autonomy = watch. Separate hype from ready.",
  "5.1a": "Land 'bounded agent' — e.g. tail-spend buying within strict limits. Ask for a safe first agent use.",
  "5.2e": "Meridian (steel) and Verdant (polymers): high-spend materials = carbon hotspots. ~15% of suppliers ≈ 60% of emissions.",
  "5.2a": "Move beyond spend-based estimates; prioritise the hotspots. Land the anti-greenwashing point.",
  "5.3e": "Single-source failure stops production; Helios also carries uncapped liability. Cheapest fix = pre-qualified alternative + targeted buffer.",
  "5.3a": "Favour early warning and alternatives over just holding more stock. Land the first-48-hours actions.",
  "5.4e": "Bring the week's backlog together. Quick wins = high value + high readiness. Name the data foundation to fix.",
  "5.4a": "Roadmap leads with quick wins and builds foundations early. Ask what would make it fail.",
  "5.5e": "Lead the people change: an honest 'why', name the fears, answer with reskilling and human control.",
  "5.5a": "Aim for honest and human, not threatening. Three objections with genuine responses — rehearse the real message.",
  "5lab": "Sell the roadmap upward (board summary + cost of doing nothing). Stretch: the sceptical-CFO challenge.",
  "5case": "The capstone. Every initiative maps to a board goal; phased roadmap; people / ethics / governance; lead with the data foundation.",
};
function Facilitator() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><ListChecks size={17} color={C.teal} /><H size={16}>Facilitator run-sheet</H></div>
        <p style={{ color: C.body, fontSize: 13, margin: "8px 0 0" }}>For each activity: the point to land or the misconception to watch — plus every day's objectives and its take-it-back-to-work action. Visible only here in the dashboard, never to delegates.</p>
      </Card>
      {DAYS.map((d) => (
        <Card key={d.n} style={{ borderLeft: `4px solid ${C.navy}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.muted }}>DAY {d.n} · {d.theme}</div>
          <H size={18} style={{ margin: "2px 0 8px" }}>{d.title}</H>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>{d.objectives.map((o, i) => <Pill key={i} bg={C.cardl} fg={C.navy}>{o}</Pill>)}</div>
          <div style={{ display: "grid", gap: 0 }}>
            {d.activities.map((a) => {
              const meta = TYPE_META[a.type] || TYPE_META.reflect;
              return (
                <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderTop: `1px solid ${C.line}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: meta.c, borderRadius: 6, padding: "3px 7px", flexShrink: 0, minWidth: 34, textAlign: "center" }}>{a.sub}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy }}>{a.title} <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>· {meta.t}</span></div>
                    <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5, marginTop: 2 }}>{FACILITATOR[a.id] || "—"}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, background: C.greenl, borderLeft: `4px solid ${C.mint}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: C.ink }}>
            <strong style={{ color: C.green }}>Take it back to work: </strong>{d.takeaway}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---- admin: per-delegate AI Chat log ---- */
function AgentActivity() {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => { setBusy(true); setRows(await adminAgentLog()); setBusy(false); };
  useEffect(() => { load(); }, []);
  const sev = (n) => (n >= 70 ? C.red : n >= 40 ? C.amber : C.green);
  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Cpu size={17} color={C.teal} /><H size={16}>Agent activity</H>
          <Btn small kind="ghost" onClick={load} style={{ marginLeft: "auto" }}><RefreshCw size={14} />Refresh</Btn>
        </div>
        <p style={{ color: C.body, fontSize: 13, margin: "8px 0 0" }}>Live feed of supplier risk assessments written by the n8n Supplier Intelligence workflow. Each row is one AI scoring run — its risk score, categories, rationale and whether an alert email was sent.</p>
      </Card>
      {busy && !rows && <Card><p style={{ margin: 0, color: C.muted }}>Loading…</p></Card>}
      {rows && rows.length === 0 && <Card><p style={{ margin: 0, color: C.muted }}>No agent runs yet — results appear here once your n8n workflow runs and writes to Supabase.</p></Card>}
      <div style={{ display: "grid", gap: 10 }}>
        {(rows || []).map((r) => (
          <Card key={r.id} style={{ borderLeft: `4px solid ${sev(r.risk_score)}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: sev(r.risk_score), fontFamily: serif, minWidth: 34, textAlign: "center" }}>{r.risk_score ?? "—"}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.navy }}>{r.supplier || "Unknown supplier"}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>{[r.region, r.category].filter(Boolean).join(" · ")}</div>
              </div>
              {r.email_sent && <Pill bg={C.mint} fg="#fff">Email sent</Pill>}
              <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</span>
            </div>
            {Array.isArray(r.categories) && r.categories.length > 0 && <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>{r.categories.map((c, i) => <Pill key={i} bg={C.cardl} fg={C.navy}>{c}</Pill>)}</div>}
            {r.rationale && <p style={{ fontSize: 13, color: C.body, margin: "8px 0 0", lineHeight: 1.5 }}>{r.rationale}</p>}
            {r.mitigation && typeof r.mitigation === "object" && Array.isArray(r.mitigation.actions) && r.mitigation.actions.length > 0 && (
              <div style={{ marginTop: 8, background: C.greenl, border: `1px solid ${C.green}`, borderRadius: 8, padding: "7px 10px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 3 }}>RECOMMENDED MITIGATION{r.mitigation.owner ? ` · ${r.mitigation.owner}` : ""}</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>{r.mitigation.actions.map((x, i) => <li key={i}>{x}</li>)}</ul>
                {(r.mitigation.impact || r.mitigation.likelihood) && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{r.mitigation.impact ? `Impact: ${r.mitigation.impact}` : ""}{r.mitigation.likelihood ? ` · Likelihood: ${r.mitigation.likelihood}` : ""}</div>}
              </div>
            )}
            {(r.confidence != null || r.decision) && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{r.confidence != null ? `Confidence: ${Math.round((Number(r.confidence) || 0) * 100)}%` : ""}{r.decision ? ` · ${r.decision}` : ""}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
function ChatLogView({ adminKey, rows, anon }) {
  const [log, setLog] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const load = async () => { setBusy(true); setErr(""); try { setLog(await adminChatLog(adminKey)); } catch (e) { setErr(e.message || "Failed to load"); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const claimed = (rows || []).filter((r) => r.claimed_at);
  const numByCode = {}; claimed.forEach((r, i) => { numByCode[r.code] = i + 1; });
  const handleByCode = {}; (rows || []).forEach((r) => { handleByCode[r.code] = r.handle; });
  const nameFor = (code) => anon ? (numByCode[code] ? `Delegate ${numByCode[code]}` : code) : (handleByCode[code] || code);
  const groups = {};
  (log || []).forEach((r) => { (groups[r.code] = groups[r.code] || []).push(r); });
  Object.values(groups).forEach((arr) => arr.sort((a, b) => a.id - b.id));
  const codes = Object.keys(groups).sort((a, b) => groups[b][groups[b].length - 1].id - groups[a][groups[a].length - 1].id);
  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <MessageSquare size={17} color={C.teal} /><H size={16}>AI Chat log</H>
          <Btn small kind="ghost" onClick={load} style={{ marginLeft: "auto" }}><RefreshCw size={14} />Refresh</Btn>
        </div>
        <p style={{ color: C.body, fontSize: 13, margin: "8px 0 0" }}>Every delegate's AI Chat conversation, grouped by person. Each chat is private to that delegate inside the app — this is your facilitator-only window into what they asked.</p>
        {err && <p style={{ color: C.red, fontSize: 13, marginTop: 8 }}>⚠ {err}</p>}
      </Card>
      {busy && !log && <Card><p style={{ margin: 0, color: C.muted }}>Loading…</p></Card>}
      {log && codes.length === 0 && <Card><p style={{ margin: 0, color: C.muted }}>No chats yet — they'll appear here as delegates use AI Chat.</p></Card>}
      <div style={{ display: "grid", gap: 10 }}>
        {codes.map((code) => {
          const msgs = groups[code];
          const isOpen = open === code;
          const userCount = msgs.filter((m) => m.role === "user").length;
          const last = msgs[msgs.length - 1];
          return (
            <Card key={code} style={{ padding: 0, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? null : code)} style={{ width: "100%", textAlign: "left", border: "none", background: "none", cursor: "pointer", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: C.teal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{(nameFor(code) || "?").charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: C.navy }}>{nameFor(code)}{!anon && <span style={{ fontFamily: "Consolas, monospace", fontSize: 12, color: C.muted, fontWeight: 600 }}> · {code}</span>}</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>{userCount} message{userCount === 1 ? "" : "s"} · last {new Date(last.created_at).toLocaleString()}</div>
                </div>
                <ChevronDown size={17} color={C.muted} style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${C.line}`, padding: 14, background: C.light, display: "flex", flexDirection: "column", gap: 8 }}>
                  {msgs.map((m) => (
                    <div key={m.id} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 2, textAlign: m.role === "user" ? "right" : "left" }}>{m.role === "user" ? nameFor(code) : "AI assistant"} · {new Date(m.created_at).toLocaleTimeString()}</div>
                      <div style={{ background: m.role === "user" ? C.navy : "#fff", color: m.role === "user" ? "#fff" : C.ink, border: m.role === "user" ? "none" : `1px solid ${C.line}`, borderRadius: 10, padding: "8px 11px", fontSize: 13, whiteSpace: m.role === "user" ? "pre-wrap" : "normal", lineHeight: 1.45 }}>{m.role === "user" ? m.content : <AssistantMessage text={m.content} />}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ================= INSTRUCTOR DASHBOARD ================= */
const ADMIN_KEY_LS = "cockpit:adminKey";
function Admin({ onExit }) {
  const [cohort, setCohort] = useState("");
  const [key, setKey] = useState(() => { try { return localStorage.getItem(ADMIN_KEY_LS) || ""; } catch (e) { return ""; } });
  const [rows, setRows] = useState(null);
  const [authed, setAuthed] = useState(false); // unlocked only after the passphrase verifies server-side
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const [tab, setTab] = useState("board");
  const [anon, setAnon] = useState(false); // anonymise names across every view (for projecting to the room)
  // code generator
  const [genCohort, setGenCohort] = useState("");
  const [genCount, setGenCount] = useState("10");
  const [genCodes, setGenCodes] = useState(null);
  const [genBusy, setGenBusy] = useState(false);
  const [genErr, setGenErr] = useState("");
  const [copied, setCopied] = useState(false);
  const inp = { fontFamily: sans, fontSize: 14, padding: "9px 11px", border: `1px solid ${C.line}`, borderRadius: 9, color: C.ink, background: "#fff" };
  const run = async () => {
    setBusy(true); setErr("");
    try {
      setRows(await adminList(cohort.trim(), key.trim())); setAuthed(true);
      try { localStorage.setItem(ADMIN_KEY_LS, key.trim()); } catch (e) {}
    }
    catch (e) {
      setErr(e.message || "Failed to load"); setRows(null); setAuthed(false);
      if (/unauthorized|passphrase/i.test(e.message || "")) { try { localStorage.removeItem(ADMIN_KEY_LS); } catch (_) {} }
    }
    finally { setBusy(false); }
  };
  // Stay signed in across refreshes — auto-unlock once if a passphrase was saved.
  useEffect(() => { if (key.trim() && !authed) run(); /* eslint-disable-next-line */ }, []);
  const signOut = () => { try { localStorage.removeItem(ADMIN_KEY_LS); } catch (e) {} setKey(""); setAuthed(false); setRows(null); };
  const generate = async () => {
    if (!key.trim()) { setGenErr("Enter the admin passphrase above first."); return; }
    if (!genCohort.trim()) { setGenErr("Enter a cohort name for the new codes."); return; }
    setGenBusy(true); setGenErr(""); setGenCodes(null); setCopied(false);
    try { setGenCodes(await adminGenerate(genCohort.trim(), parseInt(genCount, 10) || 10, key.trim())); }
    catch (e) { setGenErr(e.message || "Failed to generate"); }
    finally { setGenBusy(false); }
  };
  const copyCodes = async () => { try { await navigator.clipboard.writeText((genCodes || []).join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch (e) {} };
  const claimedRows = rows ? rows.filter((r) => r.claimed_at) : [];
  const learners = claimedRows.map((r, i) => ({ name: r.handle, code: r.code, data: r.data || {}, display: anon ? `Delegate ${i + 1}` : (r.handle || r.code) }));
  const TABS = [{ id: "board", label: "Leaderboard" }, { id: "delegates", label: "Delegates" }, { id: "exercise", label: "By exercise" }, { id: "backlog", label: "Cohort backlog" }, { id: "roster", label: "Roster" }, { id: "chats", label: "AI Chat log" }, { id: "agents", label: "🤖 Agent activity" }, { id: "facilitator", label: "Facilitator" }, { id: "release", label: "🔒 Release" }];
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {authed && <Btn kind="ghost" onClick={signOut} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}><Lock size={15} />Sign out</Btn>}
            <Btn kind="ghost" onClick={onExit} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}><LogOut size={15} />Back to app</Btn>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(16px,4vw,44px)" }}>
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Admin passphrase<br />
              <input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder="passphrase" style={{ ...inp, marginTop: 5 }} onKeyDown={(e) => e.key === "Enter" && run()} /></label>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Cohort filter <span style={{ fontWeight: 400 }}>(blank = all)</span><br />
              <input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="e.g. JUN-2026" style={{ ...inp, marginTop: 5 }} onKeyDown={(e) => e.key === "Enter" && run()} /></label>
            <Btn kind="navy" onClick={run} disabled={!key.trim() || busy}><RefreshCw size={15} />{busy ? "Loading…" : authed ? "Reload roster" : "Unlock dashboard"}</Btn>
          </div>
          {err && <p style={{ color: C.amber, fontSize: 13, marginTop: 10, marginBottom: 0 }}>⚠ {err}</p>}
        </Card>

        {!authed && (
          <Card style={{ marginBottom: 18, textAlign: "center", color: C.muted }}>
            <Shield size={20} color={C.muted} style={{ marginBottom: 6 }} />
            <p style={{ fontSize: 13.5, margin: 0 }}>Enter the admin passphrase above to unlock the instructor tools — issuing access codes, the roster and cohort analytics.</p>
          </Card>
        )}

        {authed && (<>
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><UserPlus size={17} color={C.teal} /><H size={16}>Issue access codes</H></div>
          <p style={{ color: C.body, fontSize: 13, margin: "0 0 10px" }}>Generate seat codes for a cohort, then hand them out — one per learner. The code is their identity and key; their work follows it across devices.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Cohort name<br />
              <input value={genCohort} onChange={(e) => setGenCohort(e.target.value)} placeholder="e.g. JUN-2026" style={{ ...inp, marginTop: 5 }} /></label>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>How many<br />
              <input value={genCount} onChange={(e) => setGenCount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="10" style={{ ...inp, marginTop: 5, width: 80 }} /></label>
            <Btn onClick={generate} disabled={genBusy}><Plus size={15} />{genBusy ? "Generating…" : "Generate codes"}</Btn>
          </div>
          {genErr && <p style={{ color: C.amber, fontSize: 13, marginTop: 10, marginBottom: 0 }}>⚠ {genErr}</p>}
          {genCodes && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.navy }}>{genCodes.length} code{genCodes.length === 1 ? "" : "s"} for “{genCohort.trim()}”</span>
                <Btn small kind="ghost" onClick={copyCodes}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy all"}</Btn>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, background: C.light, border: `1px solid ${C.line}`, borderRadius: 10, padding: 12 }}>
                {genCodes.map((c) => <span key={c} style={{ fontFamily: "Consolas, monospace", fontSize: 13.5, fontWeight: 700, color: C.navy, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 7, padding: "4px 9px", letterSpacing: 1 }}>{c}</span>)}
              </div>
            </div>
          )}
        </Card>

        {rows && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
              <Stat label="SEATS" value={rows.length} />
              <Stat label="SIGNED IN" value={claimedRows.length} />
              <Stat label="AVG PROGRESS" value={`${claimedRows.length ? Math.round(claimedRows.reduce((a, r) => a + pctOf(r.data && r.data.done), 0) / claimedRows.length) : 0}%`} />
              <Stat label="OPPORTUNITIES" value={rows.reduce((a, r) => a + ((r.data && r.data.backlog && r.data.backlog.length) || 0), 0)} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
              {TABS.map((t) => <button key={t.id} onClick={() => setTab(t.id)} style={segBtn(tab === t.id)}>{t.label}</button>)}
              <button onClick={() => setAnon((v) => !v)} title="Toggle real names vs anonymised labels — handy when projecting to the room"
                style={{ ...segBtn(false), marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, borderColor: anon ? C.amber : C.line, color: anon ? C.amber : C.body }}>
                {anon ? <><Users size={14} /> Anonymised — show names</> : <><Shield size={14} /> Showing names — anonymise</>}
              </button>
            </div>
            {tab === "release" && <ReleaseControl adminKey={key.trim()} />}
            {tab === "chats" && <ChatLogView adminKey={key.trim()} rows={rows} anon={anon} />}
            {tab === "agents" && <AgentActivity />}
            {tab === "facilitator" && <Facilitator />}
            {tab === "board" && <Leaderboard learners={learners} />}
            {tab === "delegates" && <Delegates learners={learners} />}
            {tab === "exercise" && <ByExercise learners={learners} />}
            {tab === "backlog" && <CohortBacklog learners={learners} />}
            {tab === "roster" && <Roster rows={rows} open={open} setOpen={setOpen} anon={anon} />}
          </div>
        )}
        </>)}
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
  const onPick = (code) => commit({ ...profiles, active: code });
  // claim/sign in a seat returned by the edge function; attach the entered name
  // to the seat (so the dashboard shows it) and cache its data locally
  const onClaim = (seat, name) => {
    const handle = (name && name.trim()) || seat.handle || "";
    const prof = { code: seat.code, cohort: seat.cohort, handle };
    const data = seat.data || {};
    ls.set(dataKey(seat.code), JSON.stringify(data));
    if (handle && handle !== seat.handle) apiSave(seat.code, handle, data); // persist name to the seat
    const exists = profiles.list.some((p) => p.code === seat.code);
    const list = exists ? profiles.list.map((p) => p.code === seat.code ? prof : p) : [...profiles.list, prof];
    commit({ active: seat.code, list });
  };
  const onRemove = (code) => {
    const list = profiles.list.filter((p) => p.code !== code);
    commit({ active: profiles.active === code ? (list[0]?.code || null) : profiles.active, list });
  };
  const onRename = (handle) => commit({ ...profiles, list: profiles.list.map((p) => p.code === profiles.active ? { ...p, handle } : p) });
  const openAdmin = () => { window.location.hash = "#admin"; setMode("admin"); };
  const exitAdmin = () => { if (window.location.hash) window.location.hash = ""; setMode("app"); };

  if (mode === "admin") return <Admin onExit={exitAdmin} />;
  const active = profiles.list.find((p) => p.code === profiles.active) || null;
  if (!active) return <StartGate onClaim={onClaim} openAdmin={openAdmin} />;
  return <Cockpit learner={active} profiles={profiles.list} onPick={onPick} onClaim={onClaim} onRemove={onRemove} onRename={onRename} openAdmin={openAdmin} />;
}
