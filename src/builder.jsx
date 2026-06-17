// AI Procurement Agent Ecosystem Builder
// ----------------------------------------
// A visual architecture designer inside the Northwind Cockpit. Components from
// the catalogue (left) assemble onto a free-form React Flow canvas (centre) —
// drag nodes anywhere, draw your own connectors, pan/zoom, minimap. The right
// panel configures the selected node (Overview / Configuration / Integrations);
// the bottom panel shows a live health score + AI-written deliverables.
// Self-contained styling so it can run light/dark without touching the Cockpit.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, Handle, Position,
  addEdge, useNodesState, useEdgesState, MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus, X, Search, ChevronDown, ChevronRight, Wand2, Save, FolderOpen, FileJson,
  Image as ImageIcon, Printer, Moon, Sun, FilePlus2, Gauge, Sparkles, Download, Layers,
  Users as UsersIcon, Bot, Cpu, Database, Server, Globe, Wrench, ShieldCheck, BrainCircuit,
  Zap, UserCheck, Lock, Target, LayoutGrid, FileText, Star, Presentation,
} from "lucide-react";
import { apiChat } from "./App.jsx";

const uid = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

const theme = (dark) => dark ? {
  bg: "#0b1220", panel: "#131c2b", sub: "#0f1726", ink: "#e6edf3", body: "#aeb9c9",
  muted: "#7c8aa0", line: "#243044", chip: "#1b2638", chipLine: "#2c3a52", accent: "#5bc0be", gold: "#f4a259", canvas: "#0a111c",
} : {
  bg: "#eef3f8", panel: "#ffffff", sub: "#f4f7fa", ink: "#16202b", body: "#33424f",
  muted: "#6b7c8c", line: "#e2e9f0", chip: "#f4f7fa", chipLine: "#e2e9f0", accent: "#1c7293", gold: "#ee964b", canvas: "#e9eff5",
};

// ---- canvas layers --------------------------------------------------------
const LAYERS = [
  { id: "users", label: "Users", color: "#1c7293", icon: UsersIcon },
  { id: "agents", label: "AI Agents", color: "#ee964b", icon: Bot },
  { id: "llm", label: "LLM Layer", color: "#5bc0be", icon: Cpu },
  { id: "memory", label: "Memory", color: "#13315c", icon: Database },
  { id: "rag", label: "RAG / Retrieval", color: "#1f8a78", icon: Search },
  { id: "systems", label: "Enterprise Systems", color: "#0b2545", icon: Server },
  { id: "data", label: "Procurement Data", color: "#2a7ab0", icon: FileText },
  { id: "external", label: "External Data", color: "#c2542f", icon: Globe },
  { id: "tools", label: "Tools", color: "#7b6cc4", icon: Wrench },
  { id: "rules", label: "Business Rules & Governance", color: "#13315c", icon: ShieldCheck },
  { id: "reasoning", label: "Reasoning Engine", color: "#f4a259", icon: BrainCircuit },
  { id: "actions", label: "Action Layer", color: "#ee964b", icon: Zap },
  { id: "governance", label: "Human-in-the-Loop Governance", color: "#1f8a78", icon: UserCheck },
  { id: "security", label: "Security & Compliance", color: "#c2542f", icon: Lock },
  { id: "outcomes", label: "Business Outcomes", color: "#0b2545", icon: Target },
];
const LAYER_BY = Object.fromEntries(LAYERS.map((l) => [l.id, l]));

// ---- component library ----------------------------------------------------
const LIBRARY = [
  { cat: "Users", layer: "users", items: ["Procurement Manager", "Category Manager", "Buyer", "Contract Manager", "Supplier Relationship Manager", "Supply Chain Manager", "Finance Team", "Legal Team", "Risk Team", "Operations Team", "Asset Manager", "Executive Team", "CIO", "CPO"] },
  { cat: "AI Models (LLMs)", layer: "llm", items: ["GPT", "Claude", "Gemini", "Llama", "Mistral", "Azure OpenAI", "Bedrock Models", "Custom Enterprise Model"] },
  { cat: "Procurement AI Agents", layer: "agents", items: ["Procurement Co-Pilot Agent", "Supplier Risk Agent", "Supplier Performance Agent", "Supplier Discovery Agent", "Spend Analytics Agent", "Category Management Agent", "Strategic Sourcing Agent", "Supplier Onboarding Agent", "Contract Review Agent", "Contract Negotiation Agent", "Procurement Policy Agent", "ESG Compliance Agent", "Tail Spend Agent", "Inventory Optimisation Agent", "Market Intelligence Agent", "Savings Opportunity Agent", "Supplier Innovation Agent", "Procurement Training Agent", "Autonomous Buyer Agent", "Procurement Executive Advisor Agent"] },
  { cat: "Memory", layer: "memory", groups: [
    { g: "Short-Term Memory", items: ["Session Memory", "Conversation Memory", "Task Memory"] },
    { g: "Long-Term Memory", items: ["Supplier History", "Spend History", "Contract History", "Procurement Knowledge Base", "Category Strategies", "Lessons Learned Repository", "Supplier Knowledge Base"] },
  ] },
  { cat: "RAG / Knowledge Retrieval", layer: "rag", items: ["Contract Retrieval", "Policy Retrieval", "Knowledge Base Search", "Supplier Knowledge Search", "Procurement Playbook Search", "Lessons Learned Search", "Document Search"] },
  { cat: "Enterprise Systems & Data Sources", layer: "systems", groups: [
    { g: "ERP Systems", items: ["SAP ECC", "SAP S/4HANA", "Oracle ERP Cloud", "Oracle EBS", "Microsoft Dynamics 365", "NetSuite", "Infor ERP", "Epicor", "JD Edwards"] },
    { g: "Procurement Suites", items: ["SAP Ariba", "Coupa", "Ivalua", "Jaggaer", "GEP SMART", "Oracle Procurement Cloud", "Zycus", "Basware", "SynerTrade", "Tradeshift"] },
    { g: "Asset Management (EAM)", items: ["IBM Maximo", "SAP EAM", "Infor EAM", "Hexagon EAM", "Oracle EAM"] },
    { g: "Supplier Management", items: ["SAP SRM", "HICX", "TealBook", "Coupa Supplier Portal", "Oracle Supplier Management"] },
    { g: "Contract Management", items: ["Icertis", "Agiloft", "Ironclad", "Sirion", "DocuSign CLM", "SAP Ariba Contracts"] },
    { g: "Project Systems", items: ["Primavera P6", "Microsoft Project", "EcoSys", "Deltek", "Aconex"] },
    { g: "Inventory & Warehouse", items: ["SAP EWM", "SAP WM", "Oracle Inventory", "Manhattan Associates", "Blue Yonder"] },
    { g: "Manufacturing", items: ["MES Systems", "Production Planning", "Capacity Planning", "Quality Systems"] },
    { g: "Logistics", items: ["Transportation Management Systems", "Freight Platforms", "Fleet Management Systems", "Carrier Platforms"] },
    { g: "Knowledge Sources", items: ["SharePoint", "Microsoft Teams", "Confluence", "Google Drive", "OneDrive", "Internal Procurement Portal"] },
  ] },
  { cat: "Procurement Data", layer: "data", items: ["Purchase Orders", "Purchase Requisitions", "Spend Data", "Supplier Master Data", "Supplier Scorecards", "Supplier Audits", "Contracts", "Invoices", "Risk Registers", "Category Strategies", "Savings Data", "Inventory Data", "Demand Forecasts"] },
  { cat: "External Data Sources", layer: "external", groups: [
    { g: "Financial Data", items: ["Dun & Bradstreet", "Moody's", "S&P Global", "Creditsafe", "Experian"] },
    { g: "ESG Data", items: ["EcoVadis", "Sustainalytics", "MSCI ESG", "CDP", "ESG Book"] },
    { g: "Market Intelligence", items: ["Commodity Prices", "Market Reports", "Industry Reports", "Supplier Market Data"] },
    { g: "Geopolitical Data", items: ["Sanctions Lists", "Country Risk Data", "Trade Restrictions", "Political Risk Index"] },
    { g: "News & Media", items: ["News Feeds", "Regulatory Alerts", "Press Releases", "Social Media Monitoring"] },
    { g: "Climate & Weather", items: ["Flood Risk", "Wildfire Risk", "Hurricane Monitoring", "Weather Forecasting"] },
    { g: "Cyber Risk", items: ["Security Ratings", "Threat Intelligence", "Vulnerability Databases"] },
  ] },
  { cat: "Tools", layer: "tools", groups: [
    { g: "Supplier Risk Tools", items: ["Financial Risk Analysis", "ESG Risk Analysis", "Geopolitical Monitoring", "Continuous Monitoring", "Third-Party Risk Management"] },
    { g: "Spend Analytics", items: ["Spend Classification", "Opportunity Identification", "Savings Analysis", "Tail Spend Analysis"] },
    { g: "Contract Intelligence", items: ["Clause Extraction", "Risk Detection", "Compliance Review", "Contract Summarisation"] },
    { g: "Supplier Performance", items: ["KPI Monitoring", "Forecasting", "Benchmarking", "Supplier Health Scoring"] },
    { g: "Forecasting", items: ["Demand Forecasting", "Capacity Forecasting", "Inventory Forecasting"] },
    { g: "Market Intelligence", items: ["Commodity Monitoring", "Supplier Discovery", "Trend Analysis"] },
  ] },
  { cat: "Business Rules & Governance", layer: "rules", items: ["Procurement Policy", "Delegation of Authority", "Approval Limits", "ESG Policy", "Regulatory Compliance", "Supplier Qualification Rules", "Audit Controls"] },
  { cat: "Actions", layer: "actions", items: ["Create RFQ", "Create RFP", "Create Purchase Requisition", "Create Purchase Order", "Generate Supplier Scorecard", "Generate Supplier Risk Report", "Generate Negotiation Brief", "Trigger Risk Alert", "Send Email", "Schedule Supplier Review", "Launch Workflow", "Recommend Mitigation Plan"] },
  { cat: "Human-in-the-Loop Governance", layer: "governance", items: ["Procurement Approval", "Contract Approval", "Supplier Award Approval", "Executive Approval", "Risk Acceptance"] },
  { cat: "Security & Compliance", layer: "security", items: ["RBAC", "Identity Management", "Data Encryption", "Audit Trail", "Compliance Monitoring", "Cybersecurity Monitoring"] },
  { cat: "Business Outcomes", layer: "outcomes", items: ["Reduced Procurement Costs", "Reduced Supplier Risk", "Improved Supplier Performance", "Faster Procurement Cycles", "Better Compliance", "Better Spend Visibility", "Improved Supplier Collaboration", "Increased Savings", "Enhanced Resilience", "Strategic Procurement Decisions", "AI-Enabled Procurement Function"] },
];

// map each catalogue item to its layer + sub-group (for the Diagram view)
const GROUP_OF = {};
LIBRARY.forEach((e) => { if (e.groups) e.groups.forEach((g) => g.items.forEach((i) => { GROUP_OF[i] = { layer: e.layer, group: g.g }; })); else e.items.forEach((i) => { GROUP_OF[i] = { layer: e.layer, group: null }; }); });
const libItems = (layer) => { const e = LIBRARY.find((x) => x.layer === layer); return e ? (e.items || e.groups.flatMap((g) => g.items)) : []; };
const REASONING_STEPS = ["Evaluate options", "Score suppliers", "Prioritise risks", "Optimise decisions", "Recommend actions", "Predict outcomes", "Generate insights", "Scenario analysis"];

// a full reference architecture so the builder opens populated like a board diagram
const REFERENCE_ALL = ["users", "memory", "rag", "data", "rules", "actions", "governance", "security", "outcomes"];
const REFERENCE_SEL = {
  agents: ["Procurement Co-Pilot Agent", "Supplier Risk Agent", "Supplier Performance Agent", "Supplier Discovery Agent", "Spend Analytics Agent", "Category Management Agent", "Strategic Sourcing Agent", "Supplier Onboarding Agent", "Contract Review Agent", "ESG Compliance Agent", "Market Intelligence Agent", "Autonomous Buyer Agent"],
  llm: ["GPT", "Claude", "Gemini", "Llama", "Mistral", "Azure OpenAI", "Custom Enterprise Model"],
  systems: ["SAP S/4HANA", "Oracle ERP Cloud", "SAP Ariba", "Coupa", "Ivalua", "IBM Maximo", "SAP SRM", "HICX", "Icertis", "DocuSign CLM", "Primavera P6", "SAP EWM", "Blue Yonder", "SharePoint", "Microsoft Teams"],
  external: ["Dun & Bradstreet", "Moody's", "S&P Global", "EcoVadis", "Sustainalytics", "CDP", "Commodity Prices", "Market Reports", "Sanctions Lists", "Country Risk Data", "News Feeds", "Regulatory Alerts", "Flood Risk", "Security Ratings", "Threat Intelligence"],
  tools: ["Financial Risk Analysis", "ESG Risk Analysis", "Continuous Monitoring", "Spend Classification", "Opportunity Identification", "Savings Analysis", "Clause Extraction", "Risk Detection", "KPI Monitoring", "Supplier Health Scoring", "Demand Forecasting", "Supplier Discovery"],
};
function buildReference() {
  const out = [];
  for (const L of LAYERS) {
    if (L.id === "reasoning") continue;
    const labels = REFERENCE_SEL[L.id] || (REFERENCE_ALL.includes(L.id) ? libItems(L.id) : []);
    labels.forEach((label) => out.push({ id: uid(), layer: L.id, label, note: "" }));
  }
  return out;
}

// ---- agent metadata (rich right-panel detail) -----------------------------
const AGENT_META = {
  "Procurement Co-Pilot Agent": { purpose: "A conversational assistant that helps buyers find information, draft documents and navigate procurement processes.", uses: ["Answering policy & process questions", "Drafting requisitions and emails", "Summarising contracts & suppliers"], inputs: ["Procurement Knowledge Base", "Policies", "Purchase Orders"], outputs: ["Guided answers", "Drafted documents"], complexity: "Medium", time: "6–10 Weeks", value: 4, roi: "High", risk: "Low" },
  "Supplier Risk Agent": { purpose: "Monitors and assesses supplier risk across financial, operational, ESG, geopolitical and cyber dimensions.", uses: ["Continuous supplier risk monitoring", "Early warning risk detection", "Supplier risk scoring & segmentation", "Risk mitigation recommendation"], inputs: ["Supplier Master Data", "Financial Data", "News Feeds", "ESG Data", "Risk Registers"], outputs: ["Risk Scores", "Risk Alerts", "Mitigation Plans", "Executive Dashboards"], complexity: "High", time: "8–12 Weeks", value: 5, roi: "High", risk: "Medium" },
  "Supplier Performance Agent": { purpose: "Tracks supplier KPIs, scores performance and flags declining suppliers.", uses: ["KPI monitoring", "Scorecard generation", "Performance benchmarking"], inputs: ["Supplier Scorecards", "Purchase Orders", "Contracts"], outputs: ["Performance scores", "Review packs"], complexity: "Medium", time: "6–10 Weeks", value: 4, roi: "High", risk: "Low" },
  "Supplier Discovery Agent": { purpose: "Finds and qualifies new suppliers from internal and market data.", uses: ["Sourcing new suppliers", "Market scanning", "Shortlist creation"], inputs: ["Supplier Market Data", "Industry Reports"], outputs: ["Qualified shortlists"], complexity: "Medium", time: "6–10 Weeks", value: 3, roi: "Medium", risk: "Low" },
  "Spend Analytics Agent": { purpose: "Classifies spend, surfaces savings opportunities and explains spend patterns.", uses: ["Spend classification", "Opportunity identification", "Savings tracking"], inputs: ["Spend Data", "Invoices", "Purchase Orders"], outputs: ["Spend cubes", "Savings opportunities"], complexity: "Medium", time: "6–10 Weeks", value: 5, roi: "High", risk: "Low" },
  "Category Management Agent": { purpose: "Supports category strategy with market, spend and supplier intelligence.", uses: ["Category strategy drafting", "Market analysis", "Should-cost modelling"], inputs: ["Category Strategies", "Commodity Prices", "Spend Data"], outputs: ["Category strategies", "Market briefs"], complexity: "Medium", time: "8–12 Weeks", value: 4, roi: "High", risk: "Low" },
  "Strategic Sourcing Agent": { purpose: "Runs sourcing events end-to-end, from RFx creation to award analysis.", uses: ["RFx creation", "Bid analysis", "Award recommendation"], inputs: ["Supplier Master Data", "Spend Data"], outputs: ["RFx packs", "Award analysis"], complexity: "High", time: "10–14 Weeks", value: 5, roi: "High", risk: "Medium" },
  "Supplier Onboarding Agent": { purpose: "Automates supplier registration, qualification and data validation.", uses: ["Onboarding workflows", "Qualification checks", "Data validation"], inputs: ["Supplier Master Data", "Supplier Qualification Rules"], outputs: ["Onboarded suppliers"], complexity: "Medium", time: "6–10 Weeks", value: 3, roi: "Medium", risk: "Low" },
  "Contract Review Agent": { purpose: "Reads contracts, extracts clauses and flags risks and non-compliance.", uses: ["Clause extraction", "Risk detection", "Compliance review"], inputs: ["Contracts", "Policies"], outputs: ["Clause summaries", "Risk flags"], complexity: "High", time: "8–12 Weeks", value: 5, roi: "High", risk: "Medium" },
  "Contract Negotiation Agent": { purpose: "Prepares negotiation strategy, briefs and fallback positions.", uses: ["Negotiation brief generation", "Benchmark analysis", "Playbook guidance"], inputs: ["Contracts", "Market Reports"], outputs: ["Negotiation briefs"], complexity: "High", time: "8–12 Weeks", value: 4, roi: "High", risk: "Medium" },
  "Procurement Policy Agent": { purpose: "Answers policy questions and checks actions against procurement rules.", uses: ["Policy Q&A", "Compliance checks"], inputs: ["Procurement Policy", "Approval Limits"], outputs: ["Policy guidance"], complexity: "Low", time: "4–8 Weeks", value: 3, roi: "Medium", risk: "Low" },
  "ESG Compliance Agent": { purpose: "Assesses supplier ESG performance and compliance against policy.", uses: ["ESG risk analysis", "Compliance monitoring", "Reporting"], inputs: ["ESG Data", "Supplier Audits"], outputs: ["ESG scores", "Compliance reports"], complexity: "Medium", time: "8–12 Weeks", value: 4, roi: "Medium", risk: "Medium" },
  "Tail Spend Agent": { purpose: "Identifies and automates management of fragmented tail spend.", uses: ["Tail spend analysis", "Consolidation", "Guided buying"], inputs: ["Spend Data", "Invoices"], outputs: ["Tail spend actions"], complexity: "Medium", time: "6–10 Weeks", value: 4, roi: "High", risk: "Low" },
  "Inventory Optimisation Agent": { purpose: "Optimises inventory levels using demand and supply signals.", uses: ["Demand forecasting", "Reorder optimisation", "Stockout prevention"], inputs: ["Inventory Data", "Demand Forecasts"], outputs: ["Reorder recommendations"], complexity: "High", time: "10–14 Weeks", value: 4, roi: "High", risk: "Medium" },
  "Market Intelligence Agent": { purpose: "Tracks commodity prices, market trends and supplier news.", uses: ["Commodity monitoring", "Trend analysis", "News scanning"], inputs: ["Commodity Prices", "News Feeds", "Market Reports"], outputs: ["Market briefs", "Alerts"], complexity: "Medium", time: "6–10 Weeks", value: 3, roi: "Medium", risk: "Low" },
  "Savings Opportunity Agent": { purpose: "Continuously surfaces and tracks savings opportunities.", uses: ["Opportunity identification", "Savings pipeline tracking"], inputs: ["Spend Data", "Savings Data"], outputs: ["Savings pipeline"], complexity: "Medium", time: "6–10 Weeks", value: 5, roi: "High", risk: "Low" },
  "Supplier Innovation Agent": { purpose: "Captures and evaluates supplier-led innovation ideas.", uses: ["Idea capture", "Value assessment", "Collaboration"], inputs: ["Supplier Knowledge Base"], outputs: ["Innovation pipeline"], complexity: "Medium", time: "8–12 Weeks", value: 3, roi: "Medium", risk: "Low" },
  "Procurement Training Agent": { purpose: "Coaches buyers and answers how-to questions on the ways of working.", uses: ["On-demand training", "Process coaching"], inputs: ["Procurement Knowledge Base", "Playbooks"], outputs: ["Training answers"], complexity: "Low", time: "4–8 Weeks", value: 3, roi: "Medium", risk: "Low" },
  "Autonomous Buyer Agent": { purpose: "Executes low-risk buying decisions end-to-end within set guardrails.", uses: ["Automated PO creation", "Guided buying", "Auto-replenishment"], inputs: ["Purchase Requisitions", "Procurement Policy", "Approval Limits"], outputs: ["Purchase Orders"], complexity: "High", time: "12–16 Weeks", value: 5, roi: "High", risk: "High" },
  "Procurement Executive Advisor Agent": { purpose: "Briefs leadership with synthesised insight across the procurement function.", uses: ["Executive reporting", "Scenario analysis", "Decision support"], inputs: ["Spend Data", "Risk Registers", "Savings Data"], outputs: ["Executive briefs"], complexity: "Medium", time: "8–12 Weeks", value: 4, roi: "High", risk: "Low" },
};

// ---- auto-architecture presets -------------------------------------------
const OBJECTIVES = ["Supplier Risk Management", "Supplier Performance Management", "SRM", "Contract Intelligence", "Strategic Sourcing", "Spend Analytics", "Procurement Co-Pilot", "ESG Compliance", "Inventory Optimisation", "Autonomous Procurement"];
const PRESETS = {
  "Supplier Risk Management": { users: ["Risk Team", "Supplier Relationship Manager", "CPO"], agents: ["Supplier Risk Agent", "Market Intelligence Agent"], llm: ["Claude"], memory: ["Supplier History", "Lessons Learned Repository"], rag: ["Supplier Knowledge Search"], systems: ["SAP Ariba", "HICX"], data: ["Supplier Master Data", "Risk Registers", "Supplier Audits"], external: ["Dun & Bradstreet", "EcoVadis", "Sanctions Lists", "News Feeds", "Security Ratings"], tools: ["Financial Risk Analysis", "ESG Risk Analysis", "Geopolitical Monitoring", "Continuous Monitoring"], rules: ["Supplier Qualification Rules", "Regulatory Compliance"], actions: ["Trigger Risk Alert", "Generate Supplier Risk Report", "Recommend Mitigation Plan"], governance: ["Risk Acceptance"], security: ["Audit Trail", "Compliance Monitoring"], outcomes: ["Reduced Supplier Risk", "Enhanced Resilience"] },
  "Supplier Performance Management": { users: ["Supplier Relationship Manager", "Category Manager"], agents: ["Supplier Performance Agent"], llm: ["Claude"], memory: ["Supplier History", "Supplier Knowledge Base"], rag: ["Supplier Knowledge Search"], systems: ["SAP Ariba", "Coupa"], data: ["Supplier Scorecards", "Purchase Orders", "Contracts"], external: ["EcoVadis"], tools: ["KPI Monitoring", "Benchmarking", "Supplier Health Scoring", "Forecasting"], rules: ["Supplier Qualification Rules"], actions: ["Generate Supplier Scorecard", "Schedule Supplier Review"], governance: ["Procurement Approval"], security: ["Audit Trail"], outcomes: ["Improved Supplier Performance", "Improved Supplier Collaboration"] },
  "SRM": { users: ["Supplier Relationship Manager", "Category Manager", "CPO"], agents: ["Supplier Performance Agent", "Supplier Risk Agent", "Supplier Innovation Agent"], llm: ["Claude"], memory: ["Supplier History", "Supplier Knowledge Base", "Lessons Learned Repository"], rag: ["Supplier Knowledge Search", "Procurement Playbook Search"], systems: ["SAP Ariba", "HICX", "SAP SRM"], data: ["Supplier Master Data", "Supplier Scorecards", "Contracts", "Risk Registers"], external: ["Dun & Bradstreet", "EcoVadis"], tools: ["Supplier Health Scoring", "KPI Monitoring", "Financial Risk Analysis"], rules: ["Supplier Qualification Rules"], actions: ["Generate Supplier Scorecard", "Schedule Supplier Review", "Recommend Mitigation Plan"], governance: ["Supplier Award Approval"], security: ["Audit Trail", "RBAC"], outcomes: ["Improved Supplier Performance", "Improved Supplier Collaboration", "Reduced Supplier Risk"] },
  "Contract Intelligence": { users: ["Contract Manager", "Legal Team"], agents: ["Contract Review Agent", "Contract Negotiation Agent"], llm: ["Claude"], memory: ["Contract History"], rag: ["Contract Retrieval", "Policy Retrieval"], systems: ["Icertis", "DocuSign CLM", "SAP Ariba Contracts"], data: ["Contracts"], external: ["Regulatory Alerts"], tools: ["Clause Extraction", "Risk Detection", "Compliance Review", "Contract Summarisation"], rules: ["Regulatory Compliance", "Approval Limits"], actions: ["Generate Negotiation Brief"], governance: ["Contract Approval"], security: ["Audit Trail", "Data Encryption"], outcomes: ["Better Compliance", "Faster Procurement Cycles"] },
  "Strategic Sourcing": { users: ["Category Manager", "Buyer", "Procurement Manager"], agents: ["Strategic Sourcing Agent", "Category Management Agent", "Supplier Discovery Agent"], llm: ["Claude"], memory: ["Category Strategies", "Spend History"], rag: ["Procurement Playbook Search"], systems: ["SAP Ariba", "Jaggaer"], data: ["Spend Data", "Supplier Master Data", "Savings Data"], external: ["Commodity Prices", "Supplier Market Data"], tools: ["Opportunity Identification", "Supplier Discovery", "Trend Analysis"], rules: ["Procurement Policy", "Delegation of Authority"], actions: ["Create RFP", "Create RFQ"], governance: ["Supplier Award Approval"], security: ["RBAC"], outcomes: ["Increased Savings", "Strategic Procurement Decisions"] },
  "Spend Analytics": { users: ["Procurement Manager", "Finance Team", "CPO"], agents: ["Spend Analytics Agent", "Savings Opportunity Agent", "Tail Spend Agent"], llm: ["Claude"], memory: ["Spend History"], rag: ["Knowledge Base Search"], systems: ["SAP S/4HANA", "Coupa"], data: ["Spend Data", "Purchase Orders", "Invoices", "Savings Data"], external: ["Commodity Prices"], tools: ["Spend Classification", "Opportunity Identification", "Savings Analysis", "Tail Spend Analysis"], rules: ["Procurement Policy"], actions: ["Launch Workflow"], governance: ["Procurement Approval"], security: ["Audit Trail"], outcomes: ["Better Spend Visibility", "Increased Savings", "Reduced Procurement Costs"] },
  "Procurement Co-Pilot": { users: ["Buyer", "Category Manager", "Procurement Manager"], agents: ["Procurement Co-Pilot Agent", "Procurement Policy Agent", "Procurement Training Agent"], llm: ["Claude"], memory: ["Session Memory", "Conversation Memory", "Procurement Knowledge Base"], rag: ["Knowledge Base Search", "Policy Retrieval", "Document Search"], systems: ["SAP Ariba", "Coupa", "Internal Procurement Portal"], data: ["Purchase Orders", "Contracts", "Supplier Master Data"], external: ["Market Reports"], tools: ["Contract Summarisation", "KPI Monitoring"], rules: ["Procurement Policy", "Approval Limits"], actions: ["Create Purchase Requisition", "Create Purchase Order", "Send Email"], governance: ["Procurement Approval"], security: ["RBAC", "Identity Management"], outcomes: ["Faster Procurement Cycles", "AI-Enabled Procurement Function"] },
  "ESG Compliance": { users: ["Risk Team", "Supplier Relationship Manager", "Legal Team"], agents: ["ESG Compliance Agent", "Supplier Risk Agent"], llm: ["Claude"], memory: ["Supplier History"], rag: ["Policy Retrieval", "Supplier Knowledge Search"], systems: ["SAP Ariba", "HICX"], data: ["Supplier Master Data", "Supplier Audits"], external: ["EcoVadis", "Sustainalytics", "CDP", "MSCI ESG"], tools: ["ESG Risk Analysis", "Continuous Monitoring", "Compliance Review"], rules: ["ESG Policy", "Regulatory Compliance"], actions: ["Generate Supplier Risk Report", "Trigger Risk Alert"], governance: ["Risk Acceptance"], security: ["Compliance Monitoring", "Audit Trail"], outcomes: ["Better Compliance", "Enhanced Resilience"] },
  "Inventory Optimisation": { users: ["Supply Chain Manager", "Operations Team", "Asset Manager"], agents: ["Inventory Optimisation Agent", "Market Intelligence Agent"], llm: ["Claude"], memory: ["Spend History"], rag: ["Knowledge Base Search"], systems: ["SAP S/4HANA", "SAP EWM", "Blue Yonder"], data: ["Inventory Data", "Demand Forecasts", "Purchase Orders"], external: ["Commodity Prices", "Weather Forecasting"], tools: ["Demand Forecasting", "Inventory Forecasting", "Capacity Forecasting"], rules: ["Procurement Policy"], actions: ["Create Purchase Order", "Launch Workflow"], governance: ["Procurement Approval"], security: ["Audit Trail"], outcomes: ["Enhanced Resilience", "Reduced Procurement Costs"] },
  "Autonomous Procurement": { users: ["Buyer", "Procurement Manager", "CPO"], agents: ["Autonomous Buyer Agent", "Procurement Co-Pilot Agent", "Spend Analytics Agent", "Supplier Risk Agent"], llm: ["Custom Enterprise Model", "Claude"], memory: ["Session Memory", "Task Memory", "Procurement Knowledge Base", "Supplier History"], rag: ["Knowledge Base Search", "Policy Retrieval", "Supplier Knowledge Search"], systems: ["SAP S/4HANA", "SAP Ariba", "Coupa"], data: ["Purchase Orders", "Purchase Requisitions", "Spend Data", "Supplier Master Data", "Contracts"], external: ["Dun & Bradstreet", "Commodity Prices", "News Feeds"], tools: ["Spend Classification", "Financial Risk Analysis", "Continuous Monitoring", "Opportunity Identification"], rules: ["Procurement Policy", "Delegation of Authority", "Approval Limits", "Audit Controls"], actions: ["Create Purchase Requisition", "Create Purchase Order", "Trigger Risk Alert", "Launch Workflow"], governance: ["Procurement Approval", "Executive Approval"], security: ["RBAC", "Identity Management", "Audit Trail", "Compliance Monitoring"], outcomes: ["AI-Enabled Procurement Function", "Faster Procurement Cycles", "Increased Savings", "Reduced Procurement Costs"] },
};

// ---- health score ---------------------------------------------------------
function healthScore(comps) {
  const has = (l) => comps.some((n) => n.layer === l);
  const cnt = (l) => comps.filter((n) => n.layer === l).length;
  const cap = (x) => Math.max(0, Math.min(100, Math.round(x)));
  const completeness = cap((["users", "agents", "llm", "data", "actions", "outcomes"].filter(has).length / 6) * 100);
  const governance = cap((has("governance") ? 55 : 0) + (has("rules") ? 45 : 0));
  const security = cap((cnt("security") / 4) * 100);
  const dataReadiness = cap((["systems", "data", "external"].filter(has).length / 3) * 100);
  const aiReadiness = cap((["agents", "llm", "memory", "rag"].filter(has).length / 4) * 100);
  const businessValue = cap(cnt("agents") * 14 + (has("outcomes") ? 30 : 0) + (has("actions") ? 12 : 0));
  const roiPotential = cap(cnt("agents") * 9 + cnt("actions") * 7 + (has("data") ? 18 : 0) + (has("external") ? 10 : 0));
  const scores = { completeness, dataReadiness, governance, security, businessValue, aiReadiness, roiPotential };
  const overall = cap(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
  return { ...scores, overall };
}
const SCORE_LABEL = { completeness: "Completeness", dataReadiness: "Data Readiness", governance: "Governance", security: "Security", businessValue: "Business Value", aiReadiness: "AI Readiness", roiPotential: "ROI Potential" };
const maturityOf = (o) => o >= 80 ? "Advanced" : o >= 60 ? "Established" : o >= 40 ? "Developing" : "Emerging";

// ---- deliverables ---------------------------------------------------------
const DELIVERABLES = [
  { id: "exec", label: "Executive Summary", ask: "Write a concise, boardroom-ready EXECUTIVE SUMMARY of this AI procurement operating model — the vision, what it does, the headline benefits and the strategic case for investment." },
  { id: "tech", label: "Technical Architecture", ask: "Write a TECHNICAL ARCHITECTURE description. Explain each layer and how a request flows from users → agents → LLM → memory → RAG → enterprise systems & data → tools → reasoning → actions → human governance → business outcomes. Note key integrations and data flows." },
  { id: "business", label: "Business Case", ask: "Write a BUSINESS CASE: the problem/opportunity, the proposed solution, quantified benefits, indicative costs, ROI logic, and key risks with mitigations." },
  { id: "roadmap", label: "Transformation Roadmap", ask: "Write a phased PROCUREMENT TRANSFORMATION ROADMAP (Foundations → Quick Wins → Scale → Transform) to deliver this architecture, with the focus, key activities and outcomes of each phase." },
  { id: "implementation", label: "Implementation Plan", ask: "Write an IMPLEMENTATION PLAN: workstreams, sequencing, dependencies, team/roles needed, data prerequisites and a rough timeline." },
  { id: "costbenefit", label: "Cost–Benefit Analysis", ask: "Write a COST–BENEFIT ANALYSIS with an indicative table of cost categories vs benefit categories, payback logic and sensitivity notes. Use a markdown table." },
  { id: "catalogue", label: "AI Agent Catalogue", ask: "Write an AI AGENT CATALOGUE: for each agent in the architecture, a one-paragraph profile — purpose, the data/tools it uses, the actions it can take and the human checkpoints. Use a markdown table or clear headings." },
  { id: "opmodel", label: "Operating Model", ask: "Describe the target PROCUREMENT OPERATING MODEL enabled by this architecture: how roles change, what humans do vs what AI does, governance and the new ways of working." },
];
function archDigest(name, objective, comps) {
  const lines = LAYERS.map((L) => {
    const ns = comps.filter((n) => n.layer === L.id);
    return ns.length ? `- ${L.label}: ${ns.map((n) => n.label).join(", ")}` : null;
  }).filter(Boolean);
  return `Architecture name: ${name || "Untitled AI Procurement Ecosystem"}\nPrimary objective: ${objective || "General AI procurement transformation"}\n\nComponents by layer:\n${lines.join("\n") || "(none selected yet)"}`;
}

// ---- layout geometry ------------------------------------------------------
const CARDW = 158, CARDH = 56, GX = 16, GY = 14, PERROW = 6, BANDPADX = 18, BANDTITLE = 30, BANDPADY = 14, VGAP = 56, X0 = 40, TOP = 24;
function layoutPositions(comps, pinned) {
  const pos = {}; let y = TOP;
  for (const L of LAYERS) {
    const inL = comps.filter((c) => c.layer === L.id);
    if (!inL.length) continue;
    let slot = 0, maxR = 0;
    for (const c of inL) {
      if (pinned[c.id]) { pos[c.id] = pinned[c.id]; continue; }
      const r = Math.floor(slot / PERROW), col = slot % PERROW;
      pos[c.id] = { x: X0 + BANDPADX + col * (CARDW + GX), y: y + BANDTITLE + r * (CARDH + GY) };
      maxR = Math.max(maxR, r); slot++;
    }
    const rows = Math.max(1, maxR + 1);
    y += BANDTITLE + rows * (CARDH + GY) + BANDPADY + VGAP;
  }
  return pos;
}
function bandsFromComps(compNodes) {
  const byLayer = {};
  compNodes.forEach((n) => { (byLayer[n.data.layer] = byLayer[n.data.layer] || []).push(n); });
  return LAYERS.filter((L) => byLayer[L.id]).map((L) => {
    const ns = byLayer[L.id];
    const minX = Math.min(...ns.map((n) => n.position.x)) - BANDPADX;
    const minY = Math.min(...ns.map((n) => n.position.y)) - BANDTITLE;
    const maxX = Math.max(...ns.map((n) => n.position.x + CARDW)) + BANDPADX;
    const maxY = Math.max(...ns.map((n) => n.position.y + CARDH)) + BANDPADY;
    return {
      id: `band-${L.id}`, type: "band", position: { x: minX, y: minY }, draggable: false, selectable: false, connectable: false,
      data: { label: L.label, color: L.color, count: ns.length, icon: L.icon }, zIndex: 0,
      style: { width: maxX - minX, height: maxY - minY },
    };
  });
}
function defaultEdges(bandNodes) {
  const e = [];
  for (let i = 0; i < bandNodes.length - 1; i++) {
    e.push({ id: `flow-${bandNodes[i].id}-${bandNodes[i + 1].id}`, source: bandNodes[i].id, target: bandNodes[i + 1].id, animated: true, style: { stroke: "#9fb3c8", strokeWidth: 1.6 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#9fb3c8" } });
  }
  return e;
}

// ---- node types -----------------------------------------------------------
function CompNode({ data, selected }) {
  const Icon = data.icon || LayoutGrid;
  return (
    <div style={{ width: CARDW, minHeight: CARDH, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10,
      background: data.t.panel, border: `1.5px solid ${selected ? data.color : data.t.chipLine}`, boxShadow: selected ? `0 0 0 3px ${data.color}33` : "0 1px 3px rgba(11,37,69,.08)", cursor: "pointer" }}>
      <Handle type="target" position={Position.Top} style={hStyle} />
      <Handle type="target" position={Position.Left} id="l" style={hStyle} />
      <div style={{ width: 26, height: 26, borderRadius: 7, background: data.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={15} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: data.t.ink, lineHeight: 1.15 }}>{data.label}</div>
        <div style={{ fontSize: 9.5, color: data.t.muted }}>{data.layerLabel}</div>
      </div>
      {data.hasNote && <span title="has notes" style={{ width: 6, height: 6, borderRadius: 99, background: data.t.gold, marginLeft: "auto", flexShrink: 0 }} />}
      <Handle type="source" position={Position.Bottom} style={hStyle} />
      <Handle type="source" position={Position.Right} id="r" style={hStyle} />
    </div>
  );
}
function BandNode({ data }) {
  const Icon = data.icon;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 12, border: `1.5px solid ${data.color}`, background: `${data.color}0d` }}>
      <Handle type="target" position={Position.Top} style={hInvisible} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: data.color, textTransform: "uppercase" }}>
        <Icon size={13} />{data.label} <span style={{ opacity: 0.7, fontWeight: 600 }}>· {data.count}</span>
      </div>
      <Handle type="source" position={Position.Bottom} style={hInvisible} />
    </div>
  );
}
const hStyle = { width: 7, height: 7, background: "#9fb3c8", border: "1px solid #fff" };
const hInvisible = { opacity: 0, pointerEvents: "none" };
const nodeTypes = { comp: CompNode, band: BandNode };

// ---- main component -------------------------------------------------------
export default function EcosystemBuilder({ code }) {
  return <ReactFlowProvider><Builder code={code} /></ReactFlowProvider>;
}

function Builder({ code }) {
  const [dark, setDark] = useState(false);
  const t = theme(dark);
  const boot = useRef(loadCurrent(code)).current; // restore the in-progress architecture (survives tab switches & refresh)
  const [mode, setMode] = useState("editor");             // "editor" | "diagram"
  const [ppt, setPpt] = useState("");                     // PowerPoint build status
  const [comps, setComps] = useState(() => boot ? (boot.comps || []) : buildReference()); // pre-populated reference on first visit
  const diagramRef = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [customEdges, setCustomEdges, onEdgesChange] = useEdgesState((boot?.edges || []).map(styleEdge));
  const [selectedId, setSelectedId] = useState(null);
  const [objective, setObjective] = useState(boot?.objective || "");
  const [archName, setArchName] = useState(boot?.name || "");
  const [query, setQuery] = useState("");
  const [openCats, setOpenCats] = useState({ Users: true, "Procurement AI Agents": true });
  const [tab, setTab] = useState("health");
  const [cfgTab, setCfgTab] = useState("overview");
  const [del, setDel] = useState({});
  const [saves, setSaves] = useState(() => loadSaves(code));
  const [showLoad, setShowLoad] = useState(false);
  const pinnedRef = useRef(boot?.positions || {});
  const rfRef = useRef(null);
  const fileRef = useRef(null);
  const wrapRef = useRef(null);

  const health = useMemo(() => healthScore(comps), [comps]);
  const selected = comps.find((c) => c.id === selectedId) || null;

  // rebuild canvas nodes whenever the domain model changes
  const rebuild = useCallback((nextComps, opts = {}) => {
    if (opts.relayout) pinnedRef.current = {};
    const pos = layoutPositions(nextComps, pinnedRef.current);
    const compNodes = nextComps.map((c) => ({
      id: c.id, type: "comp", position: pinnedRef.current[c.id] || pos[c.id] || { x: X0, y: TOP },
      data: { label: c.label, layer: c.layer, layerLabel: LAYER_BY[c.layer]?.label, color: LAYER_BY[c.layer]?.color, icon: LAYER_BY[c.layer]?.icon, hasNote: !!c.note, t },
      zIndex: 2,
    }));
    setNodes([...bandsFromComps(compNodes), ...compNodes]);
  }, [setNodes, t]);

  // keep node card theming + note dot in sync without moving anything
  useEffect(() => { setNodes((nds) => nds.map((n) => n.type === "comp"
    ? { ...n, data: { ...n.data, t, hasNote: !!(comps.find((c) => c.id === n.id)?.note) } }
    : { ...n, data: { ...n.data } })); }, [t, comps, setNodes]);

  const refreshBands = useCallback(() => {
    setNodes((nds) => { const compNodes = nds.filter((n) => n.type === "comp"); return [...bandsFromComps(compNodes), ...compNodes]; });
  }, [setNodes]);

  // populate the editor canvas from the preloaded/restored architecture on first mount
  useEffect(() => { rebuild(comps, boot ? {} : { relayout: true }); setTimeout(() => rfRef.current?.fitView({ padding: 0.15 }), 150); /* eslint-disable-next-line */ }, []);

  // auto-persist the working architecture so it survives leaving the page or refreshing
  const persistCurrent = useCallback(() => { saveCurrent(code, { name: archName, objective, comps, positions: pinnedRef.current, edges: customEdges.map(minEdge) }); }, [code, archName, objective, comps, customEdges]);
  useEffect(() => { persistCurrent(); }, [persistCurrent]);

  // ---- domain ops
  const addComp = (layer, label) => {
    if (comps.some((c) => c.layer === layer && c.label === label)) return;
    const next = [...comps, { id: uid(), layer, label, note: "" }];
    setComps(next); rebuild(next);
  };
  const removeComp = (id) => {
    const next = comps.filter((c) => c.id !== id); setComps(next);
    delete pinnedRef.current[id];
    setCustomEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    if (selectedId === id) setSelectedId(null);
    rebuild(next);
  };
  const updateComp = (id, patch) => setComps((p) => p.map((c) => c.id === id ? { ...c, ...patch } : c));
  const clearAll = () => { if (comps.length && !confirm("Start a new architecture? This clears the canvas.")) return; pinnedRef.current = {}; setComps([]); setNodes([]); setCustomEdges([]); setSelectedId(null); setObjective(""); setArchName(""); };
  const autoArrange = () => { pinnedRef.current = {}; rebuild(comps, { relayout: true }); setTimeout(() => rfRef.current?.fitView({ padding: 0.15 }), 60); };

  const autoGenerate = (obj) => {
    setObjective(obj);
    const preset = PRESETS[obj]; if (!preset) return;
    const next = [];
    Object.entries(preset).forEach(([layer, labels]) => labels.forEach((label) => next.push({ id: uid(), layer, label, note: "" })));
    pinnedRef.current = {}; setCustomEdges([]); setComps(next); setSelectedId(null);
    rebuild(next, { relayout: true });
    setTimeout(() => rfRef.current?.fitView({ padding: 0.15 }), 80);
  };

  // ---- react flow events
  const onConnect = useCallback((c) => {
    if (c.source === c.target) return;
    if (String(c.source).startsWith("band-") || String(c.target).startsWith("band-")) return;
    setCustomEdges((es) => addEdge({ ...c, animated: false, style: { stroke: "#1c7293", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#1c7293" } }, es));
  }, [setCustomEdges]);
  const onNodeDragStop = useCallback((_e, node) => { if (node.type !== "comp") return; pinnedRef.current[node.id] = node.position; refreshBands(); persistCurrent(); }, [refreshBands, persistCurrent]);
  const onSelectionChange = useCallback(({ nodes: sel }) => { const c = (sel || []).find((n) => n.type === "comp"); setSelectedId(c ? c.id : null); if (c) setCfgTab("overview"); }, []);

  const bandNodes = useMemo(() => nodes.filter((n) => n.type === "band"), [nodes]);
  const edges = useMemo(() => [...defaultEdges(bandNodes), ...customEdges.map((e) => ({ ...e, label: e.label }))], [bandNodes, customEdges]);

  // ---- persistence
  const snapshot = () => ({ name: archName, objective, comps, positions: pinnedRef.current, edges: customEdges.map(({ id, source, target, sourceHandle, targetHandle }) => ({ id, source, target, sourceHandle, targetHandle })) });
  const doSave = () => {
    const name = (archName || prompt("Name this architecture:", "AI Procurement Ecosystem") || "").trim();
    if (!name) return; setArchName(name);
    const rec = { id: uid(), ...snapshot(), name, ts: new Date().toISOString() };
    const next = [rec, ...saves.filter((s) => s.name !== name)].slice(0, 30);
    setSaves(next); persistSaves(code, next);
  };
  const applySnapshot = (d) => {
    pinnedRef.current = d.positions || {};
    setComps(d.comps || []); setObjective(d.objective || ""); setArchName(d.name || ""); setSelectedId(null);
    setCustomEdges((d.edges || []).map((e) => ({ ...e, animated: false, style: { stroke: "#1c7293", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#1c7293" } })));
    rebuild(d.comps || []);
    setTimeout(() => rfRef.current?.fitView({ padding: 0.15 }), 80);
  };
  const doLoad = (rec) => { applySnapshot(rec); setShowLoad(false); };
  const doDeleteSave = (id) => { const next = saves.filter((s) => s.id !== id); setSaves(next); persistSaves(code, next); };
  const exportJSON = () => download(new Blob([JSON.stringify(snapshot(), null, 2)], { type: "application/json" }), `${fname(archName)}.json`);
  const importJSON = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { applySnapshot(JSON.parse(String(r.result))); } catch { alert("That file isn't a valid architecture JSON."); } }; r.readAsText(f); e.target.value = ""; };
  const exportPNG = async () => {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const target = mode === "diagram" ? diagramRef.current
        : (wrapRef.current?.querySelector(".react-flow__viewport")?.parentElement || wrapRef.current);
      const canvas = await html2canvas(target, { backgroundColor: t.panel, scale: 2 });
      canvas.toBlob((b) => b && download(b, `${fname(archName)}.png`));
    } catch { alert("Couldn't render PNG here — use Print (Save as PDF) instead."); }
  };

  // ---- AI deliverables
  const askDeliverable = async (d) => {
    const prompt = `You are an enterprise procurement transformation consultant. Based ONLY on the architecture below, ${d.ask}\n\nWrite in clear, professional British English using Markdown (headings, bold, bullet points and tables where useful). Be specific to the components listed — name the agents, systems and data sources where relevant. Keep it tight and senior-audience-ready.\n\n${archDigest(archName, objective, comps)}`;
    return apiChat(code, [{ role: "user", content: prompt }]);
  };
  const generate = async (d) => {
    setTab(d.id); setDel((p) => ({ ...p, [d.id]: { loading: true } }));
    const r = await askDeliverable(d);
    setDel((p) => ({ ...p, [d.id]: r.ok ? { text: r.text } : { error: r.error || "Generation failed." } }));
  };

  // ---- PowerPoint board pack
  const exportPPTX = async () => {
    if (ppt) return;
    try {
      setPpt("Preparing diagram…");
      const prevMode = mode;
      if (mode !== "diagram") { setMode("diagram"); await sleep(550); }
      let img = null, ratio = 1.9;
      try {
        const { default: html2canvas } = await import("html2canvas");
        const node = diagramRef.current;
        const c = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
        img = c.toDataURL("image/png"); ratio = c.width / c.height;
      } catch (e) {}
      // ensure a core set of deliverables exists (reuse any already generated)
      const coreIds = ["exec", "tech", "business", "roadmap"];
      const want = Array.from(new Set([...coreIds, ...Object.keys(del).filter((id) => del[id]?.text)]));
      const texts = {};
      for (const id of want) {
        const d = DELIVERABLES.find((x) => x.id === id); if (!d) continue;
        if (del[id]?.text) { texts[id] = del[id].text; continue; }
        setPpt(`Writing ${d.label}…`);
        const r = await askDeliverable(d);
        if (r.ok && r.text) { texts[id] = r.text; setDel((p) => ({ ...p, [id]: { text: r.text } })); }
      }
      setPpt("Building deck…");
      const { default: PptxGenJS } = await import("pptxgenjs");
      const p = new PptxGenJS(); p.layout = "LAYOUT_WIDE"; const PW = 13.33;
      const NAVY = "0B2545", TEAL = "1C7293", INK = "16202B", MUTE = "6B7C8C";
      // title
      let s = p.addSlide(); s.background = { color: NAVY };
      s.addText("AI Procurement Agent Ecosystem", { x: 0.7, y: 2.2, w: 12, h: 0.7, fontSize: 30, bold: true, color: "FFFFFF" });
      s.addText(archName || "Reference Architecture", { x: 0.7, y: 3.0, w: 12, h: 0.6, fontSize: 20, color: "F4A259" });
      s.addText(`${objective || "Enterprise AI procurement operating model"}  ·  ${comps.length} components  ·  ${maturityOf(health.overall)} maturity  ·  Health ${health.overall}/100`, { x: 0.7, y: 3.8, w: 12, h: 0.5, fontSize: 13, color: "C9D6E2" });
      // diagram
      if (img) { s = p.addSlide(); s.addText("Architecture Overview", { x: 0.5, y: 0.25, w: 12, h: 0.5, fontSize: 18, bold: true, color: NAVY });
        let w = 12.3, h = w / ratio; if (h > 6.3) { h = 6.3; w = h * ratio; }
        s.addImage({ data: img, x: (PW - w) / 2, y: 0.9, w, h }); }
      // health + summary
      s = p.addSlide(); s.addText("Architecture Health & Summary", { x: 0.5, y: 0.3, w: 12, h: 0.5, fontSize: 18, bold: true, color: NAVY });
      s.addText(`Overall ${health.overall}/100 · ${maturityOf(health.overall)}`, { x: 0.5, y: 0.85, w: 12, h: 0.4, fontSize: 13, color: TEAL, bold: true });
      const hrows = [[{ text: "Dimension", options: { bold: true, color: "FFFFFF", fill: TEAL } }, { text: "Score", options: { bold: true, color: "FFFFFF", fill: TEAL } }]];
      Object.keys(SCORE_LABEL).forEach((k) => hrows.push([SCORE_LABEL[k], `${health[k]}/100`]));
      s.addTable(hrows, { x: 0.5, y: 1.4, w: 6, fontSize: 12, color: INK, border: { type: "solid", color: "E2E9F0" }, rowH: 0.34 });
      const counts = [["Users", byL(comps, "users")], ["AI Agents", byL(comps, "agents")], ["Data Sources", byL(comps, "systems") + byL(comps, "data") + byL(comps, "external")], ["Tools", byL(comps, "tools")], ["Business Rules", byL(comps, "rules")], ["Actions", byL(comps, "actions")]];
      const crows = [[{ text: "Component group", options: { bold: true, color: "FFFFFF", fill: NAVY } }, { text: "Count", options: { bold: true, color: "FFFFFF", fill: NAVY } }]];
      counts.forEach((r) => crows.push([r[0], String(r[1])]));
      s.addTable(crows, { x: 7, y: 1.4, w: 5.8, fontSize: 12, color: INK, border: { type: "solid", color: "E2E9F0" }, rowH: 0.34 });
      // deliverables (chunked)
      for (const id of want) {
        if (!texts[id]) continue;
        const d = DELIVERABLES.find((x) => x.id === id);
        const chunks = chunkText(mdToText(texts[id]), 1700);
        chunks.forEach((ch, i) => {
          const sl = p.addSlide();
          sl.addText(d.label + (chunks.length > 1 ? ` (${i + 1}/${chunks.length})` : ""), { x: 0.5, y: 0.3, w: 12, h: 0.5, fontSize: 18, bold: true, color: NAVY });
          sl.addText(ch, { x: 0.5, y: 1.0, w: 12.3, h: 6.2, fontSize: 11, color: INK, valign: "top", lineSpacingMultiple: 1.05 });
        });
      }
      await p.writeFile({ fileName: `${fname(archName)}-board-pack.pptx` });
      setMode(prevMode);
    } catch (e) { alert("Couldn't build the PowerPoint: " + (e.message || e)); }
    finally { setPpt(""); }
  };

  const filteredLib = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LIBRARY;
    return LIBRARY.map((e) => {
      if (e.groups) { const groups = e.groups.map((g) => ({ ...g, items: g.items.filter((i) => i.toLowerCase().includes(q)) })).filter((g) => g.items.length); return groups.length ? { ...e, groups } : null; }
      const items = e.items.filter((i) => i.toLowerCase().includes(q)); return items.length ? { ...e, items } : null;
    }).filter(Boolean);
  }, [query]);

  const activeLayers = LAYERS.filter((L) => comps.some((c) => c.layer === L.id)).length;

  return (
    <div style={{ fontFamily: sansLocal, background: t.bg, color: t.body, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* TOP NAV */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: t.panel, borderBottom: `1px solid ${t.line}`, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Layers size={16} color="#fff" /></div>
          <div style={{ fontFamily: serifLocal, fontWeight: 700, fontSize: 14, color: t.ink, lineHeight: 1.05 }}>AI Procurement<br /><span style={{ fontSize: 10.5, color: t.muted, fontWeight: 400 }}>Agent Ecosystem Builder</span></div>
        </div>
        <input value={archName} onChange={(e) => setArchName(e.target.value)} placeholder="Architecture name…" style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.line}`, background: t.sub, color: t.ink, fontSize: 12.5, fontFamily: "inherit", width: 190 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
          <Tool t={t} icon={FilePlus2} label="New" onClick={clearAll} />
          <Tool t={t} icon={Save} label="Save" onClick={doSave} />
          <Tool t={t} icon={FolderOpen} label="Load" onClick={() => setShowLoad((s) => !s)} />
          <Tool t={t} icon={FileJson} label="JSON" onClick={exportJSON} />
          <Tool t={t} icon={Download} label="Import" onClick={() => fileRef.current?.click()} />
          <Tool t={t} icon={ImageIcon} label="PNG" onClick={exportPNG} />
          <Tool t={t} icon={FileText} label="PDF" onClick={() => window.print()} />
          <Tool t={t} icon={Presentation} label={ppt ? ppt : "PPT"} primary={!!ppt} disabled={!!ppt} onClick={exportPPTX} />
          <input ref={fileRef} type="file" accept="application/json" onChange={importJSON} style={{ display: "none" }} />
        </div>
        <Tool t={t} icon={dark ? Sun : Moon} label={dark ? "Light" : "Dark"} onClick={() => setDark((d) => !d)} />
      </div>

      {/* AUTO-GENERATOR */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: t.sub, borderBottom: `1px solid ${t.line}`, flexWrap: "wrap" }}>
        <div style={{ display: "flex", border: `1px solid ${t.line}`, borderRadius: 8, overflow: "hidden", marginRight: 4 }}>
          <button onClick={() => setMode("editor")} style={seg(t, mode === "editor")}>Editor</button>
          <button onClick={() => setMode("diagram")} style={seg(t, mode === "diagram")}>Diagram</button>
        </div>
        <Wand2 size={15} color={t.gold} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: t.ink }}>Auto-architecture:</span>
        <span style={{ fontSize: 12, color: t.muted }}>pick an objective for a recommended starting design.</span>
        {mode === "editor" && <Tool t={t} icon={LayoutGrid} label="Auto-arrange" onClick={autoArrange} />}
        <select value={objective} onChange={(e) => e.target.value && autoGenerate(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.line}`, background: t.panel, color: t.ink, fontSize: 12.5, fontFamily: "inherit", marginLeft: "auto" }}>
          <option value="">Choose objective…</option>
          {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* MIDDLE */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {mode === "diagram" ? <DiagramView t={t} comps={comps} health={health} diagramRef={diagramRef} /> : <>
        {/* LEFT */}
        <div style={{ width: 248, flexShrink: 0, background: t.panel, borderRight: `1px solid ${t.line}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${t.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: t.muted, marginBottom: 6 }}>COMPONENT LIBRARY</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: t.sub, border: `1px solid ${t.line}`, borderRadius: 8, padding: "5px 8px" }}>
              <Search size={13} color={t.muted} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search components…" style={{ border: "none", outline: "none", background: "transparent", color: t.ink, fontSize: 12.5, fontFamily: "inherit", width: "100%" }} />
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "6px 8px" }}>
            {filteredLib.map((entry) => {
              const open = !!openCats[entry.cat] || !!query; const lc = LAYER_BY[entry.layer]?.color || t.accent;
              return (
                <div key={entry.cat} style={{ marginBottom: 4 }}>
                  <button onClick={() => setOpenCats((o) => ({ ...o, [entry.cat]: !open }))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "7px 6px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", color: t.ink, fontSize: 12.5, fontWeight: 700, textAlign: "left" }}>
                    {open ? <ChevronDown size={14} color={t.muted} /> : <ChevronRight size={14} color={t.muted} />}
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: lc, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{entry.cat}</span>
                  </button>
                  {open && (entry.groups
                    ? entry.groups.map((g) => (
                      <div key={g.g} style={{ marginLeft: 8 }}>
                        <div style={{ fontSize: 10.5, color: t.muted, fontWeight: 700, margin: "4px 0 2px 4px" }}>{g.g}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>{g.items.map((i) => <Chip key={i} t={t} label={i} layer={entry.layer} onAdd={addComp} />)}</div>
                      </div>
                    ))
                    : <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "0 0 6px 14px" }}>{entry.items.map((i) => <Chip key={i} t={t} label={i} layer={entry.layer} onAdd={addComp} />)}</div>)}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER — React Flow */}
        <div ref={wrapRef} style={{ flex: 1, minWidth: 0, position: "relative", background: t.canvas }}>
          <ReactFlow
            nodes={nodes} edges={edges} nodeTypes={nodeTypes}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
            onNodeDragStop={onNodeDragStop} onSelectionChange={onSelectionChange}
            onInit={(inst) => { rfRef.current = inst; }} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={(e) => { e.preventDefault(); try { const d = JSON.parse(e.dataTransfer.getData("text/plain")); if (d?.label) addComp(d.layer, d.label); } catch {} }}
            fitView minZoom={0.2} maxZoom={1.8} defaultEdgeOptions={{ type: "smoothstep" }} proOptions={{ hideAttribution: true }}>
            <Background color={t.line} gap={20} />
            <Controls />
            {comps.length > 0 && <MiniMap pannable zoomable nodeColor={(n) => n.type === "band" ? "#ffffff00" : (n.data?.color || t.accent)} nodeStrokeColor={(n) => n.data?.color || t.line} maskColor={dark ? "#0b122099" : "#eef3f8aa"} style={{ background: t.panel, border: `1px solid ${t.line}` }} />}
            {comps.length === 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ textAlign: "center", color: t.muted, padding: "40px", border: `2px dashed ${t.line}`, borderRadius: 14, background: t.panel, maxWidth: 440 }}>
                  <Layers size={32} color={t.muted} style={{ opacity: 0.6 }} />
                  <p style={{ fontSize: 15, fontWeight: 700, color: t.ink, margin: "10px 0 4px" }}>Design your AI procurement ecosystem</p>
                  <p style={{ fontSize: 13, margin: 0 }}>Click or drag components from the left, draw your own connectors between nodes, or pick an objective above to auto-generate.</p>
                </div>
              </div>
            )}
          </ReactFlow>
        </div>

        {/* RIGHT */}
        <div style={{ width: 280, flexShrink: 0, background: t.panel, borderLeft: `1px solid ${t.line}`, overflowY: "auto" }}>
          {selected ? <ConfigPanel t={t} comp={selected} cfgTab={cfgTab} setCfgTab={setCfgTab} updateComp={updateComp} removeComp={removeComp} edges={customEdges} comps={comps} /> : (
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: t.muted, marginBottom: 8 }}>ARCHITECTURE OVERVIEW</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                <Donut t={t} value={health.overall} />
                <div style={{ fontSize: 12, color: t.body }}>
                  <div style={{ fontWeight: 700, color: t.ink, fontSize: 13 }}>{comps.length} components</div>
                  <div style={{ color: t.muted }}>{activeLayers} active layers · {customEdges.length} custom links</div>
                  <div style={{ marginTop: 3 }}><Tag color={t.accent}>{maturityOf(health.overall)}</Tag></div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: t.muted, margin: "4px 0 8px" }}>HEALTH SCORE</div>
              {Object.keys(SCORE_LABEL).map((k) => <Bar key={k} t={t} label={SCORE_LABEL[k]} value={health[k]} />)}
              <p style={{ fontSize: 11, color: t.muted, marginTop: 10 }}>Select any node to configure it. Drag to reposition, and drag from a node's edge handle to draw your own connections.</p>
            </div>
          )}
        </div>
        </>}
      </div>

      {/* BOTTOM */}
      <div style={{ height: 232, flexShrink: 0, background: t.panel, borderTop: `1px solid ${t.line}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderBottom: `1px solid ${t.line}`, overflowX: "auto" }}>
          <Sparkles size={14} color={t.gold} style={{ flexShrink: 0 }} />
          <button onClick={() => setTab("health")} style={pill(t, tab === "health")}><Gauge size={12} />Health</button>
          {DELIVERABLES.map((d) => <button key={d.id} onClick={() => (del[d.id]?.text || del[d.id]?.loading) ? setTab(d.id) : generate(d)} style={pill(t, tab === d.id)}>{del[d.id]?.loading ? "… " : ""}{d.label}</button>)}
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px" }}>
          {tab === "health" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
              {Object.keys(SCORE_LABEL).map((k) => <Bar key={k} t={t} label={SCORE_LABEL[k]} value={health[k]} />)}
              <div style={{ gridColumn: "1 / -1", fontSize: 11.5, color: t.muted }}>Overall health <strong style={{ color: t.ink }}>{health.overall}/100</strong> · Maturity <strong style={{ color: t.ink }}>{maturityOf(health.overall)}</strong>. Add governance, security and business-outcome components to raise the weaker dimensions, then generate the deliverables for a board pack.</div>
            </div>
          ) : (() => {
            const d = DELIVERABLES.find((x) => x.id === tab); const state = del[tab] || {};
            return (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <strong style={{ color: t.ink, fontSize: 13 }}>{d?.label}</strong>
                  <Tool t={t} icon={Wand2} label={state.text ? "Regenerate" : "Generate"} primary onClick={() => generate(d)} disabled={state.loading} />
                  {state.loading && <span style={{ fontSize: 12, color: t.muted }}>Generating from your architecture…</span>}
                </div>
                {state.error && <p style={{ color: "#c2542f", fontSize: 12.5 }}>{state.error}</p>}
                {state.text ? <div style={{ fontSize: 13, lineHeight: 1.55, color: t.body }} className="builder-md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{state.text}</ReactMarkdown></div>
                  : !state.loading && !state.error && <p style={{ fontSize: 12.5, color: t.muted }}>Click Generate to produce a {d?.label.toLowerCase()} written from the components on your canvas.</p>}
              </div>
            );
          })()}
        </div>
      </div>

      {showLoad && (
        <div onClick={() => setShowLoad(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: t.panel, borderRadius: 12, padding: 18, width: 420, maxWidth: "90vw", maxHeight: "70vh", overflowY: "auto", border: `1px solid ${t.line}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><strong style={{ color: t.ink, fontSize: 14 }}>Saved architectures</strong><button onClick={() => setShowLoad(false)} style={iconBtn(t)}><X size={14} /></button></div>
            {saves.length === 0 && <p style={{ color: t.muted, fontSize: 13 }}>No saved architectures yet. Build one and hit Save.</p>}
            {saves.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: `1px solid ${t.line}`, borderRadius: 8, marginBottom: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: t.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div><div style={{ fontSize: 11, color: t.muted }}>{(s.comps || []).length} components · {s.objective || "no objective"}</div></div>
                <Tool t={t} label="Load" primary onClick={() => doLoad(s)} />
                <button onClick={() => doDeleteSave(s.id)} style={iconBtn(t)}><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- right-panel config ---------------------------------------------------
function ConfigPanel({ t, comp, cfgTab, setCfgTab, updateComp, removeComp, edges, comps }) {
  const L = LAYER_BY[comp.layer]; const meta = AGENT_META[comp.label];
  const linked = edges.filter((e) => e.source === comp.id || e.target === comp.id)
    .map((e) => comps.find((c) => c.id === (e.source === comp.id ? e.target : e.source))).filter(Boolean);
  const Icon = L?.icon || LayoutGrid;
  return (
    <div>
      <div style={{ padding: "12px 12px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: L?.color, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={17} color="#fff" /></div>
            <div><div style={{ fontSize: 13.5, fontWeight: 700, color: t.ink, lineHeight: 1.1 }}>{comp.label}</div><div style={{ fontSize: 11, color: t.muted }}>{L?.label}</div></div>
          </div>
          <Tag color="#1f8a78">Selected</Tag>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 12, borderBottom: `1px solid ${t.line}` }}>
          {[["overview", "Overview"], ["config", "Configuration"], ["integrations", "Integrations"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setCfgTab(id)} style={{ padding: "6px 8px", border: "none", borderBottom: `2px solid ${cfgTab === id ? t.accent : "transparent"}`, background: "transparent", color: cfgTab === id ? t.ink : t.muted, fontWeight: 700, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit" }}>{lbl}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: 12 }}>
        {cfgTab === "overview" && (meta ? (
          <>
            <Sec t={t} title="Purpose"><p style={{ margin: 0, fontSize: 12.5, color: t.body, lineHeight: 1.5 }}>{meta.purpose}</p></Sec>
            <Sec t={t} title="Procurement Use Cases">{meta.uses.map((u) => <Line key={u} t={t} ok>{u}</Line>)}</Sec>
            <div style={{ display: "flex", gap: 16 }}>
              <Sec t={t} title="Inputs" flex>{meta.inputs.map((i) => <Line key={i} t={t} dot={t.accent}>{i}</Line>)}</Sec>
              <Sec t={t} title="Outputs" flex>{meta.outputs.map((o) => <Line key={o} t={t} dot={t.gold}>{o}</Line>)}</Sec>
            </div>
            <Sec t={t} title="Assessment">
              <Row t={t} k="Implementation Complexity" v={meta.complexity} />
              <Row t={t} k="Implementation Time" v={meta.time} />
              <Row t={t} k="Business Value" v={<Stars n={meta.value} />} />
              <Row t={t} k="ROI Potential" v={meta.roi} />
              <Row t={t} k="Risk Level" v={meta.risk} />
            </Sec>
          </>
        ) : (
          <>
            <Sec t={t} title="Role in the architecture"><p style={{ margin: 0, fontSize: 12.5, color: t.body, lineHeight: 1.5 }}>Part of the <strong>{L?.label}</strong> layer. {LAYER_DESC[comp.layer] || ""}</p></Sec>
            <Sec t={t} title="Notes"><p style={{ margin: 0, fontSize: 12.5, color: comp.note ? t.body : t.muted, lineHeight: 1.5 }}>{comp.note || "No notes yet — add scope, owner or integration detail in the Configuration tab."}</p></Sec>
          </>
        ))}
        {cfgTab === "config" && (
          <>
            <label style={lbl(t)}>Label</label>
            <input value={comp.label} onChange={(e) => updateComp(comp.id, { label: e.target.value })} style={inp(t)} />
            <label style={lbl(t)}>Notes / configuration</label>
            <textarea value={comp.note} onChange={(e) => updateComp(comp.id, { note: e.target.value })} rows={6} placeholder="e.g. owner, scope, KPIs, integration detail, guardrails…" style={{ ...inp(t), resize: "vertical" }} />
            <button onClick={() => removeComp(comp.id)} style={{ marginTop: 10, width: "100%", padding: 8, borderRadius: 8, border: "1px solid #c2542f", background: "transparent", color: "#c2542f", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><X size={14} />Remove component</button>
          </>
        )}
        {cfgTab === "integrations" && (
          <>
            <Sec t={t} title={`Connected components (${linked.length})`}>
              {linked.length ? linked.map((c) => <Line key={c.id} t={t} dot={LAYER_BY[c.layer]?.color}>{c.label} <span style={{ color: t.muted }}>· {LAYER_BY[c.layer]?.label}</span></Line>)
                : <p style={{ margin: 0, fontSize: 12, color: t.muted }}>No custom connections yet. Drag from this node's edge handle to another node on the canvas to link them.</p>}
            </Sec>
            <Sec t={t} title="Layer dependencies">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{(meta ? ["LLM Model", "Tools", "External Data", "RAG Layer", "Memory"] : ["LLM Model", "Reasoning Engine"]).map((d) => <Tag key={d} color={t.muted} light>{d}</Tag>)}</div>
            </Sec>
          </>
        )}
      </div>
    </div>
  );
}
const LAYER_DESC = {
  users: "These are the people who interact with the agents and consume the outputs.",
  llm: "The foundation model that powers reasoning and language understanding for the agents.",
  memory: "Stores short- and long-term context so agents recall history and decisions.",
  rag: "Retrieves relevant documents and knowledge to ground the agents' answers.",
  systems: "The systems of record the agents read from and write back to.",
  data: "The procurement data the agents reason over.",
  external: "Third-party signals that enrich decisions with the outside view.",
  tools: "Capabilities the agents call to analyse, score and act.",
  rules: "The policies and guardrails every decision is checked against.",
  actions: "The concrete operations the architecture can execute.",
  governance: "Human checkpoints that approve or accept before high-stakes actions.",
  security: "Controls that keep the platform safe, compliant and auditable.",
  outcomes: "The business value this architecture is designed to deliver.",
};

// ---- diagram (boardroom infographic) view ---------------------------------
function DiagramView({ t, comps, health, diagramRef }) {
  const byLayer = (id) => comps.filter((c) => c.layer === id);
  const layerHas = (id) => byLayer(id).length > 0;
  const summary = [
    { icon: UsersIcon, label: "Users", n: byLayer("users").length, color: LAYER_BY.users.color },
    { icon: Bot, label: "AI Agents", n: byLayer("agents").length, color: LAYER_BY.agents.color },
    { icon: Server, label: "Data Sources", n: byLayer("systems").length + byLayer("data").length + byLayer("external").length, color: LAYER_BY.systems.color },
    { icon: Wrench, label: "Tools", n: byLayer("tools").length, color: LAYER_BY.tools.color },
    { icon: ShieldCheck, label: "Business Rules", n: byLayer("rules").length, color: LAYER_BY.rules.color },
    { icon: Zap, label: "Actions", n: byLayer("actions").length, color: LAYER_BY.actions.color },
  ];
  const band = (id, opts = {}) => {
    const L = LAYER_BY[id]; const items = byLayer(id);
    if (!items.length && !opts.always) return null;
    return <DiagBand t={t} color={L.color} icon={L.icon} title={L.label} count={items.length} style={opts.style}>
      {opts.grouped ? groupedContent(t, id, items) : items.map((c) => <DiagCard key={c.id} t={t} label={c.label} color={L.color} />)}
    </DiagBand>;
  };
  return (
    <div style={{ flex: 1, minWidth: 0, overflow: "auto", background: t.canvas, padding: 18 }}>
      <div ref={diagramRef} style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 6, background: t.canvas, padding: 6, borderRadius: 8 }}>
        {band("users")}
        {layerHas("users") && layerHas("agents") && <DiagArrow />}
        {band("agents")}
        {(layerHas("agents")) && (layerHas("llm") || layerHas("memory") || layerHas("rag")) && <DiagArrow />}
        <DiagRow>{band("llm")}{band("memory")}{band("rag")}</DiagRow>
        {(layerHas("llm") || layerHas("memory") || layerHas("rag")) && layerHas("systems") && <DiagArrow />}
        {band("systems", { grouped: true })}
        {layerHas("systems") && (layerHas("data") || layerHas("external") || layerHas("tools")) && <DiagArrow />}
        <DiagRow>{band("data")}{band("external", { grouped: true })}{band("tools", { grouped: true })}</DiagRow>
        <DiagArrow />
        <DiagRow>
          {band("rules")}
          <DiagBand t={t} color={LAYER_BY.reasoning.color} icon={LAYER_BY.reasoning.icon} title="Reasoning & Decision Engine">
            {REASONING_STEPS.map((s) => <DiagCard key={s} t={t} label={s} color={LAYER_BY.reasoning.color} />)}
          </DiagBand>
          {band("actions")}
        </DiagRow>
        {(layerHas("governance") || layerHas("security") || layerHas("outcomes")) && <DiagArrow />}
        <DiagRow>{band("governance")}{band("security")}{band("outcomes")}</DiagRow>

        {/* footer: health + summary */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, background: t.panel, border: `1px solid ${t.line}`, borderRadius: 12, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Donut t={t} value={health.overall} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: 0.4 }}>ARCHITECTURE HEALTH</div>
              <div style={{ fontSize: 13, color: t.ink, fontWeight: 700 }}>{maturityOf(health.overall)} maturity</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 18px" }}>
            {Object.keys(SCORE_LABEL).map((k) => <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: t.body }}><span>{SCORE_LABEL[k]}</span><strong style={{ color: health[k] >= 70 ? "#1f8a78" : health[k] >= 40 ? "#ee964b" : "#c2542f" }}>{health[k]}</strong></div>)}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {summary.map((s) => (
              <div key={s.label} style={{ textAlign: "center", border: `1px solid ${t.line}`, borderRadius: 10, padding: "8px 12px", minWidth: 78 }}>
                <s.icon size={16} color={s.color} />
                <div style={{ fontFamily: serifLocal, fontSize: 18, fontWeight: 700, color: t.ink, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 9.5, color: t.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function DiagRow({ children }) { return <div style={{ display: "flex", gap: 6, alignItems: "stretch", flexWrap: "wrap" }}>{React.Children.toArray(children).filter(Boolean).map((c, i) => <div key={i} style={{ flex: 1, minWidth: 220 }}>{c}</div>)}</div>; }
function DiagBand({ t, color, icon: Icon, title, count, children, style }) {
  return (
    <div style={{ border: `1.5px solid ${color}`, borderRadius: 12, background: `${color}0d`, padding: "8px 11px", height: "100%", boxSizing: "border-box", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Icon size={13} color={color} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, color, textTransform: "uppercase" }}>{title}</span>
        {count != null && <span style={{ marginLeft: "auto", fontSize: 10.5, color: t.muted, fontWeight: 700 }}>{count}</span>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{children}</div>
    </div>
  );
}
function DiagCard({ t, label, color }) {
  return <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 7, border: `1px solid ${t.chipLine}`, background: t.panel, fontSize: 11, color: t.ink, fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: color, flexShrink: 0 }} />{label}</div>;
}
function groupedContent(t, layerId, items) {
  const groups = {};
  items.forEach((c) => { const g = GROUP_OF[c.label]?.group || "Other"; (groups[g] = groups[g] || []).push(c); });
  const color = LAYER_BY[layerId].color;
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 14, width: "100%" }}>{Object.entries(groups).map(([g, arr]) => (
    <div key={g} style={{ minWidth: 128 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: t.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>{g}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{arr.map((c) => <DiagCard key={c.id} t={t} label={c.label} color={color} />)}</div>
    </div>
  ))}</div>;
}
function DiagArrow() {
  return <div style={{ display: "flex", justifyContent: "center", padding: "1px 0" }}><svg width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="#9fb3c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="1" x2="9" y2="12" /><polyline points="4 8 9 13 14 8" /></svg></div>;
}

// ---- atoms ----------------------------------------------------------------
function Tool({ t, onClick, icon: Icon, label, primary, disabled }) {
  return <button onClick={onClick} disabled={disabled} title={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, cursor: disabled ? "default" : "pointer", border: `1px solid ${primary ? t.accent : t.line}`, background: primary ? t.accent : t.panel, color: primary ? "#fff" : t.body, fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap" }}>{Icon && <Icon size={14} />}{label}</button>;
}
function Chip({ t, label, layer, onAdd }) {
  return <button draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ layer, label }))} onClick={() => onAdd(layer, label)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 7px", borderRadius: 7, cursor: "grab", border: `1px solid ${t.chipLine}`, background: t.chip, color: t.body, fontSize: 11.5, fontFamily: "inherit", textAlign: "left" }}><Plus size={11} color={t.muted} />{label}</button>;
}
function Bar({ t, label, value }) {
  const col = value >= 70 ? "#1f8a78" : value >= 40 ? "#ee964b" : "#c2542f";
  return <div style={{ marginBottom: 7 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: t.body, marginBottom: 3 }}><span>{label}</span><span style={{ fontWeight: 700, color: col }}>{value}</span></div><div style={{ height: 6, background: t.line, borderRadius: 99 }}><div style={{ width: `${value}%`, height: "100%", background: col, borderRadius: 99, transition: "width .4s" }} /></div></div>;
}
function Donut({ t, value }) {
  const col = value >= 70 ? "#1f8a78" : value >= 40 ? "#ee964b" : "#c2542f";
  return <div style={{ width: 60, height: 60, borderRadius: 99, flexShrink: 0, background: `conic-gradient(${col} ${value * 3.6}deg, ${t.line} 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 46, height: 46, borderRadius: 99, background: t.panel, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: t.ink, fontFamily: serifLocal }}>{value}</div></div>;
}
function Sec({ t, title, children, flex }) { return <div style={{ marginBottom: 14, flex: flex ? 1 : undefined, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: t.ink, marginBottom: 6 }}>{title}</div>{children}</div>; }
function Line({ t, children, ok, dot }) { return <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: t.body, marginBottom: 4 }}>{ok ? <Check size={13} color="#1f8a78" style={{ flexShrink: 0, marginTop: 1 }} /> : <span style={{ width: 7, height: 7, borderRadius: 99, background: dot || t.accent, flexShrink: 0, marginTop: 4 }} />}<span>{children}</span></div>; }
function Row({ t, k, v }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "4px 0", borderBottom: `1px solid ${t.line}` }}><span style={{ color: t.muted }}>{k}</span><span style={{ fontWeight: 700, color: t.ink }}>{v}</span></div>; }
function Stars({ n }) { return <span style={{ display: "inline-flex", gap: 1 }}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} color="#ee964b" fill={i <= n ? "#ee964b" : "none"} />)}</span>; }
function Tag({ children, color, light }) { return <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color: light ? color : "#fff", background: light ? `${color}22` : color, border: light ? `1px solid ${color}55` : "none", borderRadius: 6, padding: "2px 7px" }}>{children}</span>; }
function Check(props) { return <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke={props.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={props.style}><polyline points="20 6 9 17 4 12" /></svg>; }

const serifLocal = "Georgia, 'Times New Roman', serif";
const sansLocal = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const iconBtn = (t) => ({ width: 24, height: 24, borderRadius: 6, border: `1px solid ${t.line}`, background: t.sub, color: t.body, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" });
const lbl = (t) => ({ display: "block", fontSize: 11, fontWeight: 700, color: t.muted, margin: "10px 0 4px" });
const inp = (t) => ({ width: "100%", boxSizing: "border-box", padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.line}`, background: t.sub, color: t.ink, fontSize: 12.5, fontFamily: "inherit", outline: "none" });
const pill = (t, on) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99, cursor: "pointer", whiteSpace: "nowrap", border: `1px solid ${on ? t.accent : t.line}`, background: on ? t.accent : "transparent", color: on ? "#fff" : t.body, fontSize: 12, fontWeight: 600, fontFamily: "inherit", flexShrink: 0 });
const seg = (t, on) => ({ padding: "5px 12px", border: "none", background: on ? t.accent : t.panel, color: on ? "#fff" : t.muted, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" });
function download(blob, name) { const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); }
function fname(n) { return (n || "architecture").replace(/\s+/g, "-").toLowerCase(); }
function loadSaves(code) { try { return JSON.parse(localStorage.getItem(`cockpit:builder:${code}`) || "[]"); } catch { return []; } }
function persistSaves(code, list) { try { localStorage.setItem(`cockpit:builder:${code}`, JSON.stringify(list)); } catch {} }
function loadCurrent(code) { try { const r = localStorage.getItem(`cockpit:builder:current:${code}`); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveCurrent(code, snap) { try { localStorage.setItem(`cockpit:builder:current:${code}`, JSON.stringify(snap)); } catch {} }
const EDGE_STYLE = { animated: false, style: { stroke: "#1c7293", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#1c7293" } };
const styleEdge = (e) => ({ ...e, ...EDGE_STYLE });
const minEdge = ({ id, source, target, sourceHandle, targetHandle }) => ({ id, source, target, sourceHandle, targetHandle });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const byL = (comps, id) => comps.filter((c) => c.layer === id).length;
const mdToText = (md) => (md || "").replace(/^#{1,6}\s*/gm, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/`/g, "").replace(/^\s*[-*]\s+/gm, "• ").replace(/\|/g, "  ").replace(/\n{3,}/g, "\n\n").trim();
function chunkText(text, max) { const paras = text.split(/\n+/); const out = []; let cur = ""; for (const p of paras) { if ((cur + "\n" + p).length > max && cur) { out.push(cur); cur = p; } else { cur = cur ? cur + "\n" + p : p; } } if (cur) out.push(cur); return out.length ? out : [text]; }
const CSS = `.builder-md table{border-collapse:collapse;margin:8px 0;font-size:12px}.builder-md th,.builder-md td{border:1px solid #d7dee6;padding:5px 9px;text-align:left}.builder-md h1,.builder-md h2,.builder-md h3{margin:12px 0 6px}.builder-md ul,.builder-md ol{margin:6px 0;padding-left:20px}.builder-md p{margin:6px 0}.react-flow__attribution{display:none}`;
