import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Zap,
  BarChart3,
  Presentation,
  Database,
  X,
  Info,
} from "lucide-react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
// TEMPORARY hackathon demo dataset. Safe to remove when live API is wired up.
import {
  ENGINEER_SAMPLE_DATA,
  buildResultsFromPrecalculated,
} from "./engineerSampleData";

/* ────────────────────────────────────────────────────────────────────────
   PLANET DDS BRAND
   ──────────────────────────────────────────────────────────────────────── */
const C = {
  blue: "#0069DC",
  darkBlue: "#000F60",
  blueWater: "#D3E6F5",
  orange: "#FA4616",
  green: "#257226",
  white: "#FFFFFF",
  // soft tints
  ink: "#0A1640",
  paper: "#F7FAFD",
  line: "#E4ECF6",
  mute: "#5B6B91",
};

// Band fills used only inside BenchmarkBand. 4x darker than STATUS.*.bg.
const BAND_BG = {
  AT_RISK: "#FBAF8F",
  ON_TRACK: "#8FBFEF",
  ELITE: "#87C387",
};

const STATUS = {
  AT_RISK: {
    key: "AT_RISK",
    label: "At Risk",
    color: C.orange,
    bg: "#FEEBE3",
    border: "#FAC9B6",
    icon: AlertTriangle,
  },
  ON_TRACK: {
    key: "ON_TRACK",
    label: "On Track",
    color: C.blue,
    bg: "#E3EFFB",
    border: "#B7D3F1",
    icon: CheckCircle2,
  },
  ELITE: {
    key: "ELITE",
    label: "Elite",
    color: C.green,
    bg: "#E1F0E1",
    border: "#B7D9B7",
    icon: Star,
  },
};

/* ────────────────────────────────────────────────────────────────────────
   KPI CONFIG (single source of truth)
   ──────────────────────────────────────────────────────────────────────── */
const KPI_CONFIG = {
  confirmation_rate: {
    id: "confirmation_rate",
    label: "Confirmation Rate",
    category: "Schedule Optimization",
    slide: 2,
    unit: "%",
    direction: "higher",
    priority: 5,
    peerAverage: 86.4,
    benchmarks: { atRisk: "< 80%", onTrack: "80 - 90%", elite: "> 90%" },
    targetValue: 90,
    eliteValue: 95,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v > 90 ? "ELITE" : v >= 80 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters:
      "Confirmation rates drive show rate, schedule stability, and ultimately production.",
    actionAtRisk:
      "Low confirmation rates may be contributing to schedule instability and lost production. Focus on confirming upcoming appointments before the date of service.",
    actionOnTrack:
      "Confirmations are healthy. Sustain outreach cadence and watch for slips during peak weeks.",
    actionElite:
      "Top quartile execution. Use this lift to model best practices for sister locations.",
  },
  show_rate: {
    id: "show_rate",
    label: "Show Rate",
    category: "Schedule Optimization",
    slide: 2,
    unit: "%",
    direction: "higher",
    priority: 4,
    peerAverage: 92.1,
    benchmarks: { atRisk: "< 90%", onTrack: "90 - 95%", elite: "> 95%" },
    targetValue: 95,
    eliteValue: 97,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v > 95 ? "ELITE" : v >= 90 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters:
      "Show rate directly affects chair utilization & realized production.",
    actionAtRisk:
      "Show rate is below benchmark, which may indicate missed production opportunity and inefficient chair utilization.",
    actionOnTrack:
      "Solid show rate. Focus next on filling holes from late cancels.",
    actionElite:
      "Excellent chair utilization. Document confirmation & reminder workflow for replication.",
  },
  hygiene_reappt_rate: {
    id: "hygiene_reappt_rate",
    label: "Hygiene Reappointment Rate",
    category: "Schedule Optimization",
    slide: 2,
    unit: "%",
    direction: "higher",
    priority: 8,
    peerAverage: 71.5,
    benchmarks: { atRisk: "< 65%", onTrack: "65 - 80%", elite: "> 80%" },
    targetValue: 80,
    eliteValue: 85,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v > 80 ? "ELITE" : v >= 65 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters:
      "Pre-appointing hygiene drives future schedule density & retention.",
    actionAtRisk:
      "Hygiene reappointment rate is below benchmark, creating future schedule risk and weakening patient retention.",
    actionOnTrack:
      "Reappointment is steady. Push toward 80%+ by closing the loop before checkout.",
    actionElite:
      "Best in class. Capture the hygienist & front-desk handoff playbook.",
  },
  case_acceptance: {
    id: "case_acceptance",
    label: "Case Acceptance Rate",
    category: "Case Pipeline",
    slide: 3,
    unit: "%",
    direction: "higher",
    priority: 6,
    peerAverage: 60.4,
    benchmarks: { atRisk: "< 55%", onTrack: "55 - 65%", elite: "> 65%" },
    targetValue: 65,
    eliteValue: 70,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v > 65 ? "ELITE" : v >= 55 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters:
      "Acceptance converts diagnosed value into scheduled production.",
    actionAtRisk:
      "Acceptance is trailing benchmark. Tighten case presentation, financing options, and same-day scheduling.",
    actionOnTrack:
      "Acceptance is in band. Layer in financial coordinator coaching to push higher.",
    actionElite:
      "Strong acceptance. Make sure scheduled cases stay on the books.",
  },
  case_completion: {
    id: "case_completion",
    label: "Case Completion Rate",
    category: "Case Pipeline",
    slide: 3,
    unit: "%",
    direction: "higher",
    priority: 7,
    peerAverage: 51.2,
    benchmarks: { atRisk: "< 45%", onTrack: "45 - 55%", elite: "> 55%" },
    targetValue: 55,
    eliteValue: 60,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v > 55 ? "ELITE" : v >= 45 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters: "Completion converts accepted cases into realized revenue.",
    actionAtRisk:
      "Accepted cases are stalling. Audit broken appointments on accepted treatment plans and re-engage patients.",
    actionOnTrack:
      "Completion is healthy. Watch for high-value cases drifting past 90 days.",
    actionElite:
      "Outstanding follow-through. Model this for under-performing sites.",
  },
  otc_collection: {
    id: "otc_collection",
    label: "OTC Collection Rate",
    category: "Revenue Cycle",
    slide: 4,
    unit: "%",
    direction: "higher",
    priority: 1,
    peerAverage: 92.7,
    benchmarks: { atRisk: "< 90%", onTrack: "90 - 95%", elite: "> 95%" },
    targetValue: 95,
    eliteValue: 97,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v > 95 ? "ELITE" : v >= 90 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters:
      "Over-the-counter collections protect cash flow and reduce write-offs.",
    actionAtRisk:
      "OTC collections are below benchmark. Tighten time-of-service collection scripts and verify patient responsibility before checkout.",
    actionOnTrack:
      "Healthy OTC capture. Push toward 95%+ by closing patient balance gaps at checkout.",
    actionElite:
      "Top quartile cash capture. Lock in by templating the checkout workflow.",
  },
  days_to_claim: {
    id: "days_to_claim",
    label: "Avg Days to Claim Submission",
    category: "Revenue Cycle",
    slide: 4,
    unit: "days",
    direction: "lower",
    priority: 3,
    peerAverage: 2.1,
    benchmarks: { atRisk: "> 3 days", onTrack: "1 - 3 days", elite: "< 1 day" },
    targetValue: 1,
    eliteValue: 0.5,
    format: (v) => `${v.toFixed(1)} days`,
    getStatus: (v) => (v < 1 ? "ELITE" : v <= 3 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters: "Faster claim submission shortens AR & speeds cash flow.",
    actionAtRisk:
      "Claims are taking longer than expected to submit, which can delay cash flow and increase revenue cycle friction.",
    actionOnTrack:
      "Submission cadence is acceptable. Targeting same-day submission unlocks meaningful cash velocity.",
    actionElite:
      "Same-day submission keeps cash moving. Sustain by monitoring exceptions weekly.",
  },
  clean_claim: {
    id: "clean_claim",
    label: "Clean Claim Rate",
    category: "Revenue Cycle",
    slide: 4,
    unit: "%",
    direction: "higher",
    priority: 2,
    peerAverage: 92.3,
    benchmarks: { atRisk: "< 90%", onTrack: "90 - 95%", elite: "> 95%" },
    targetValue: 95,
    eliteValue: 97,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v > 95 ? "ELITE" : v >= 90 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters:
      "Clean claims minimize rework, denials, and revenue leakage.",
    actionAtRisk:
      "Denials are reworking your team. Audit top denial reasons and tighten eligibility & coding upstream.",
    actionOnTrack:
      "Clean claim rate is in band. Eligibility automation can lift this further.",
    actionElite:
      "Best-in-class clean claim performance. Lock in playbook & monitor for drift.",
  },
  notes_signed: {
    id: "notes_signed",
    label: "Progress Notes Signed on DOS",
    category: "Utilization & Adoption",
    slide: 5,
    unit: "%",
    direction: "higher",
    priority: 9,
    peerAverage: 96.8,
    benchmarks: { atRisk: "< 97%", onTrack: "97 - 99%", elite: "100%" },
    targetValue: 99,
    eliteValue: 100,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v >= 100 ? "ELITE" : v >= 97 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters:
      "Same-day note signing protects clinical documentation & billing readiness.",
    actionAtRisk:
      "Unsigned progress notes create clinical documentation risk and may slow billing or audit readiness.",
    actionOnTrack:
      "Documentation is solid. Final 1-2% typically comes from provider-level coaching.",
    actionElite:
      "Full compliance. Maintain through provider scorecard reporting.",
  },
  ledger_posted: {
    id: "ledger_posted",
    label: "Ledger Charges Posted on DOS",
    category: "Utilization & Adoption",
    slide: 5,
    unit: "%",
    direction: "higher",
    priority: 10,
    peerAverage: 96.4,
    benchmarks: { atRisk: "< 97%", onTrack: "97 - 99%", elite: "100%" },
    targetValue: 99,
    eliteValue: 100,
    format: (v) => `${v.toFixed(1)}%`,
    getStatus: (v) => (v >= 100 ? "ELITE" : v >= 97 ? "ON_TRACK" : "AT_RISK"),
    whyItMatters:
      "Same-day posting accelerates claims, OTC capture, and accurate ledgers.",
    actionAtRisk:
      "Charges posted after DOS slow downstream billing & introduce reconciliation risk. Tighten checkout-time posting.",
    actionOnTrack:
      "Posting is in band. Move toward 100% by routing exceptions through a daily review.",
    actionElite:
      "100% posting compliance. Reinforce via daily checkout audit.",
  },
};

const KPI_LIST = Object.values(KPI_CONFIG);

const SLIDE_DEFINITIONS = [
  {
    id: 1,
    title: "KPI Benchmark Summary",
    subtitle: "Operational health overview",
    type: "summary",
  },
  {
    id: 2,
    title: "Schedule Optimization Drivers",
    subtitle: "Confirmations, show rate, & retention",
    type: "kpis",
    kpis: ["confirmation_rate", "show_rate", "hygiene_reappt_rate"],
  },
  {
    id: 3,
    title: "Case Pipeline Health",
    subtitle: "Diagnosed value through realized revenue",
    type: "kpis",
    kpis: ["case_acceptance", "case_completion"],
  },
  {
    id: 4,
    title: "Revenue Cycle Indicators",
    subtitle: "Cash velocity & claim quality",
    type: "kpis",
    kpis: ["otc_collection", "days_to_claim", "clean_claim"],
  },
  {
    id: 5,
    title: "Utilization & Adoption Metrics",
    subtitle: "Workflow compliance at the point of care",
    type: "kpis",
    kpis: ["notes_signed", "ledger_posted"],
  },
];

/* ────────────────────────────────────────────────────────────────────────
   EXCEL SCHEMA
   ──────────────────────────────────────────────────────────────────────── */
const REQUIRED_SCHEMA = {
  Appointments: [
    "location_id",
    "patient_id",
    "appointment_date",
    "appointment_status",
    "confirmed_flag",
    "appointment_type",
    "hygiene_reappointment_flag",
  ],
  Clinical: [
    "location_id",
    "patient_id",
    "case_id",
    "case_presented_date",
    "case_value",
    "case_accepted_flag",
    "case_completed_flag",
  ],
  RevenueCycle: [
    "location_id",
    "claim_id",
    "date_of_service",
    "claim_submitted_date",
    "clean_claim_flag",
    "patient_responsibility",
    "otc_collected_amount",
  ],
  Operational: [
    "location_id",
    "visit_id",
    "date_of_service",
    "progress_note_signed_flag",
    "ledger_posted_flag",
    "checked_out_flag",
  ],
};

/* ────────────────────────────────────────────────────────────────────────
   MOCK DATA
   ──────────────────────────────────────────────────────────────────────── */
const LOCATIONS = [
  { id: "ALL", name: "All Locations" },
  { id: "L01", name: "Austin North" },
  { id: "L02", name: "Austin South" },
  { id: "L03", name: "San Antonio Central" },
  { id: "L04", name: "Dallas Uptown" },
  { id: "L05", name: "Houston Heights" },
];

const TIME_PERIODS = [
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
  { id: "ytd", label: "Year to date" },
  { id: "12m", label: "Last 12 months" },
];

// Mulberry32 seeded RNG for deterministic mock data
function seeded(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMockWorkbook() {
  const rng = seeded(1729);
  const locProfiles = {
    L01: { perf: 0.82 },
    L02: { perf: 0.66 },
    L03: { perf: 0.91 },
    L04: { perf: 0.74 },
    L05: { perf: 0.55 },
  };
  const Appointments = [];
  const Clinical = [];
  const RevenueCycle = [];
  const Operational = [];

  Object.entries(locProfiles).forEach(([locationId, { perf }]) => {
    // 600 appointments / location
    for (let i = 0; i < 600; i++) {
      const isHygiene = rng() < 0.4;
      const cancelled = rng() < 0.05 + (1 - perf) * 0.06;
      const noShow = !cancelled && rng() < 0.04 + (1 - perf) * 0.06;
      const status = cancelled
        ? "cancelled"
        : noShow
        ? "no_show"
        : rng() < 0.97
        ? "completed"
        : "scheduled";
      const confirmed = !cancelled && rng() < 0.6 + perf * 0.35;
      const reappt =
        isHygiene && status === "completed" && rng() < 0.45 + perf * 0.4;
      const day = new Date();
      day.setDate(day.getDate() - Math.floor(rng() * 90));
      Appointments.push({
        location_id: locationId,
        patient_id: `P${locationId}-${i}`,
        appointment_date: day.toISOString().slice(0, 10),
        appointment_status: status,
        confirmed_flag: confirmed,
        appointment_type: isHygiene ? "hygiene" : "general",
        hygiene_reappointment_flag: reappt,
      });
    }
    // 200 cases / location
    for (let i = 0; i < 200; i++) {
      const value = Math.round(800 + rng() * 6000);
      const accepted = rng() < 0.5 + perf * 0.25;
      const completed = accepted && rng() < 0.6 + perf * 0.25;
      const day = new Date();
      day.setDate(day.getDate() - Math.floor(rng() * 120));
      Clinical.push({
        location_id: locationId,
        patient_id: `P${locationId}-C${i}`,
        case_id: `C${locationId}-${i}`,
        case_presented_date: day.toISOString().slice(0, 10),
        case_value: value,
        case_accepted_flag: accepted,
        case_completed_flag: completed,
      });
    }
    // 500 claims / location
    for (let i = 0; i < 500; i++) {
      const dos = new Date();
      dos.setDate(dos.getDate() - Math.floor(rng() * 90));
      const lagDays =
        rng() < 0.5 + perf * 0.4 ? rng() * 1.5 : 1 + rng() * 5;
      const submitted = new Date(dos);
      submitted.setDate(submitted.getDate() + lagDays);
      const patResp = Math.round(60 + rng() * 380);
      const otc =
        rng() < 0.85 + perf * 0.13 ? patResp : Math.round(patResp * (0.5 + rng() * 0.4));
      RevenueCycle.push({
        location_id: locationId,
        claim_id: `K${locationId}-${i}`,
        date_of_service: dos.toISOString().slice(0, 10),
        claim_submitted_date: submitted.toISOString().slice(0, 10),
        clean_claim_flag: rng() < 0.86 + perf * 0.12,
        patient_responsibility: patResp,
        otc_collected_amount: otc,
      });
    }
    // 700 visits / location
    for (let i = 0; i < 700; i++) {
      const dos = new Date();
      dos.setDate(dos.getDate() - Math.floor(rng() * 90));
      Operational.push({
        location_id: locationId,
        visit_id: `V${locationId}-${i}`,
        date_of_service: dos.toISOString().slice(0, 10),
        progress_note_signed_flag: rng() < 0.94 + perf * 0.06,
        ledger_posted_flag: rng() < 0.93 + perf * 0.07,
        checked_out_flag: rng() < 0.95 + perf * 0.05,
      });
    }
  });

  return { Appointments, Clinical, RevenueCycle, Operational };
}

const MOCK_DATA = buildMockWorkbook();

/* ────────────────────────────────────────────────────────────────────────
   KPI CALCULATIONS
   ──────────────────────────────────────────────────────────────────────── */
const tb = (v) => v === true || v === "true" || v === 1 || v === "1" || v === "TRUE";

function filterByLocation(rows, locId) {
  if (!locId || locId === "ALL") return rows;
  return rows.filter((r) => r.location_id === locId);
}

function safeDiv(num, den) {
  if (!den) return 0;
  return num / den;
}

function calculateKPIs(data, locationId) {
  const ap = filterByLocation(data.Appointments || [], locationId);
  const cl = filterByLocation(data.Clinical || [], locationId);
  const rc = filterByLocation(data.RevenueCycle || [], locationId);
  const op = filterByLocation(data.Operational || [], locationId);

  // Confirmation
  const confirmed = ap.filter((r) => tb(r.confirmed_flag)).length;
  const confirmation_rate = safeDiv(confirmed, ap.length) * 100;

  // Show rate (excl cancelled)
  const eligible = ap.filter((r) => r.appointment_status !== "cancelled");
  const completed = eligible.filter((r) => r.appointment_status === "completed").length;
  const show_rate = safeDiv(completed, eligible.length) * 100;

  // Hygiene reappt
  const hygCompleted = ap.filter(
    (r) => r.appointment_type === "hygiene" && r.appointment_status === "completed"
  );
  const hygReappt = hygCompleted.filter((r) => tb(r.hygiene_reappointment_flag)).length;
  const hygiene_reappt_rate = safeDiv(hygReappt, hygCompleted.length) * 100;

  // Case acceptance (by value)
  const presentedValue = cl.reduce((s, r) => s + Number(r.case_value || 0), 0);
  const acceptedValue = cl
    .filter((r) => tb(r.case_accepted_flag))
    .reduce((s, r) => s + Number(r.case_value || 0), 0);
  const completedValue = cl
    .filter((r) => tb(r.case_completed_flag))
    .reduce((s, r) => s + Number(r.case_value || 0), 0);
  const case_acceptance = safeDiv(acceptedValue, presentedValue) * 100;
  const case_completion = safeDiv(completedValue, acceptedValue) * 100;

  // OTC
  const totalResp = rc.reduce((s, r) => s + Number(r.patient_responsibility || 0), 0);
  const totalOtc = rc.reduce((s, r) => s + Number(r.otc_collected_amount || 0), 0);
  const otc_collection = safeDiv(totalOtc, totalResp) * 100;

  // Days to claim
  const daysList = rc
    .map((r) => {
      const a = new Date(r.date_of_service);
      const b = new Date(r.claim_submitted_date);
      return (b - a) / 86400000;
    })
    .filter((d) => Number.isFinite(d) && d >= 0);
  const days_to_claim = daysList.length
    ? daysList.reduce((s, x) => s + x, 0) / daysList.length
    : 0;

  // Clean claim
  const cleanClaim = rc.filter((r) => tb(r.clean_claim_flag)).length;
  const clean_claim = safeDiv(cleanClaim, rc.length) * 100;

  // Notes / ledger
  const notesSigned = op.filter((r) => tb(r.progress_note_signed_flag)).length;
  const ledgerPosted = op.filter((r) => tb(r.ledger_posted_flag)).length;
  const notes_signed = safeDiv(notesSigned, op.length) * 100;
  const ledger_posted = safeDiv(ledgerPosted, op.length) * 100;

  const raw = {
    confirmation_rate,
    show_rate,
    hygiene_reappt_rate,
    case_acceptance,
    case_completion,
    otc_collection,
    days_to_claim,
    clean_claim,
    notes_signed,
    ledger_posted,
  };

  // Build enriched results
  const results = {};
  Object.entries(raw).forEach(([id, v]) => {
    const cfg = KPI_CONFIG[id];
    const status = cfg.getStatus(v);
    // synth a "trend" vs prior period (deterministic from id+loc)
    const seed =
      (id.length * 7 + (locationId || "ALL").length * 13 + Math.floor(v * 10)) % 17;
    const delta = (seed - 8) / 8; // -1..+1
    results[id] = {
      id,
      value: v,
      status,
      trend: delta * (cfg.unit === "days" ? 0.6 : 2.4),
      config: cfg,
    };
  });
  return results;
}

function calculateHealthScore(results) {
  const arr = Object.values(results);
  if (!arr.length) return { score: 0, points: 0, max: 0, label: "Needs Attention" };
  const points = arr.reduce(
    (s, r) => s + (r.status === "ELITE" ? 2 : r.status === "ON_TRACK" ? 1 : 0),
    0
  );
  const max = arr.length * 2;
  const score = Math.round((points / max) * 100);
  let label = "Needs Attention";
  if (score >= 90) label = "Elite Operator";
  else if (score >= 75) label = "Strong";
  else if (score >= 50) label = "Stable";
  return { score, points, max, label };
}

function statusCounts(results) {
  const arr = Object.values(results);
  return {
    AT_RISK: arr.filter((r) => r.status === "AT_RISK").length,
    ON_TRACK: arr.filter((r) => r.status === "ON_TRACK").length,
    ELITE: arr.filter((r) => r.status === "ELITE").length,
  };
}

function getTopFocusAreas(results, n = 3) {
  const arr = Object.values(results);
  // Score = (status weight) * (priority weight) * (distance from target)
  const scored = arr.map((r) => {
    const cfg = r.config;
    const statusWeight = r.status === "AT_RISK" ? 3 : r.status === "ON_TRACK" ? 1 : 0;
    const priWeight = (11 - cfg.priority) / 10; // higher business impact -> larger
    let dist = 0;
    if (cfg.direction === "higher") {
      dist = Math.max(0, cfg.targetValue - r.value);
    } else {
      dist = Math.max(0, r.value - cfg.targetValue);
    }
    const distNorm = Math.min(1, dist / Math.max(1, cfg.targetValue * 0.25));
    return {
      ...r,
      focusScore: statusWeight * priWeight * (0.4 + distNorm * 0.6),
    };
  });
  return scored
    .filter((r) => r.focusScore > 0)
    .sort((a, b) => b.focusScore - a.focusScore)
    .slice(0, n);
}

function dynamicSummary(score, counts) {
  if (score.score >= 90)
    return `Elite operator performance. ${counts.ELITE} of 10 metrics at elite level. Lock in the playbook and replicate across the broader portfolio.`;
  if (score.score >= 75)
    return `Strong operator performance. The schedule, case pipeline, and revenue cycle indicators are largely on benchmark. Targeted action on a small set of metrics will move this site into elite range.`;
  if (score.score >= 50)
    return `Stable performance with clear upside. ${counts.AT_RISK} metrics are below benchmark and will benefit from focused execution over the next 30-60 days.`;
  return `Operational health needs attention. ${counts.AT_RISK} metrics are below benchmark and are likely creating compounding pressure on production and cash flow. Prioritize the top three focus areas to unlock fast gains.`;
}

function actionForStatus(cfg, status) {
  if (status === "AT_RISK") return cfg.actionAtRisk;
  if (status === "ON_TRACK") return cfg.actionOnTrack;
  return cfg.actionElite;
}

/* ────────────────────────────────────────────────────────────────────────
   SHARED UI BITS
   ──────────────────────────────────────────────────────────────────────── */

function StatusBadge({ status, size = "sm" }) {
  const s = STATUS[status];
  const Icon = s.icon;
  const sizes = {
    sm: { px: 8, py: 3, fs: 11, ic: 12 },
    md: { px: 10, py: 4, fs: 12, ic: 13 },
    lg: { px: 12, py: 6, fs: 13, ic: 15 },
  }[size];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: `${sizes.py}px ${sizes.px}px`,
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontSize: sizes.fs,
        fontWeight: 700,
        letterSpacing: 0.2,
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={sizes.ic} strokeWidth={2.4} />
      {s.label}
    </span>
  );
}

function TrendChip({ delta, unit }) {
  const isUp = delta > 0.05;
  const isDown = delta < -0.05;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const color = unit === "days"
    ? isUp ? C.orange : isDown ? C.green : C.mute
    : isUp ? C.green : isDown ? C.orange : C.mute;
  const sign = delta > 0 ? "+" : "";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 11,
        fontWeight: 600,
        color,
      }}
    >
      <Icon size={12} />
      {sign}
      {delta.toFixed(1)}
      {unit === "days" ? "d" : "pp"}
    </span>
  );
}

// Visual benchmark band: shows where the value sits across At Risk / On Track / Elite ranges
function BenchmarkBand({ kpi }) {
  const cfg = kpi.config;
  // Pick a reasonable scale per direction
  const isAdoption = cfg.id === "notes_signed" || cfg.id === "ledger_posted";
  const scale =
    cfg.direction === "lower"
      ? { min: 0, max: 6, atRiskFrom: 3, eliteTo: 1 }
      : isAdoption
      ? { min: 90, max: 100, atRiskTo: 97, eliteFrom: 100 }
      : cfg.id === "case_acceptance"
      ? { min: 40, max: 80, atRiskTo: 55, eliteFrom: 65 }
      : cfg.id === "case_completion"
      ? { min: 30, max: 70, atRiskTo: 45, eliteFrom: 55 }
      : cfg.id === "hygiene_reappt_rate"
      ? { min: 50, max: 90, atRiskTo: 65, eliteFrom: 80 }
      : cfg.id === "show_rate"
      ? { min: 80, max: 100, atRiskTo: 90, eliteFrom: 95 }
      : cfg.id === "confirmation_rate"
      ? { min: 70, max: 100, atRiskTo: 80, eliteFrom: 90 }
      : { min: 80, max: 100, atRiskTo: 90, eliteFrom: 95 }; // generic 90/95

  const rng = scale.max - scale.min;
  const clamp = (v) => Math.max(scale.min, Math.min(scale.max, v));
  const pct = (v) => ((clamp(v) - scale.min) / rng) * 100;

  let pAtRisk, pElite;
  if (cfg.direction === "lower") {
    pAtRisk = pct(scale.atRiskFrom); // below this is on-track
    pElite = pct(scale.eliteTo); // below this is elite
  } else {
    pAtRisk = pct(scale.atRiskTo);
    pElite = pct(scale.eliteFrom);
  }

  const valuePct = pct(kpi.value);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          height: 10,
          borderRadius: 999,
          display: "flex",
          background: C.line,
        }}
      >
          <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 999,
      overflow: "hidden",
      display: "flex",
    }}
  >
  </div>
        {cfg.direction === "lower" ? (
          <>
            {/* Elite zone (left) */}
            <div style={{ width: `${pElite}%`, background: BAND_BG.ELITE }} />
            {/* On track */}
            <div
              style={{
                width: `${pAtRisk - pElite}%`,
                background: BAND_BG.ON_TRACK,
              }}
            />
            {/* At risk */}
            <div
              style={{ width: `${100 - pAtRisk}%`, background: BAND_BG.AT_RISK }}
            />
          </>
        ) : (
          <>
            <div
              style={{ width: `${pAtRisk}%`, background: BAND_BG.AT_RISK }}
            />
            <div
              style={{
                width: `${pElite - pAtRisk}%`,
                background: BAND_BG.ON_TRACK,
              }}
            />
            <div
              style={{ width: `${100 - pElite}%`, background: BAND_BG.ELITE }}
            />
          </>
        )}
        {/* Value marker */}
        <div
          style={{
            position: "absolute",
            top: -3,
            left: `calc(${valuePct}% - 8px)`,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: C.darkBlue,
            border: "3px solid #fff",
            boxShadow: "0 1px 4px rgba(0,15,96,0.35)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          fontSize: 10,
          color: C.mute,
          fontWeight: 600,
        }}
      >
        <span>{cfg.benchmarks.atRisk}</span>
        <span>{cfg.benchmarks.onTrack}</span>
        <span>{cfg.benchmarks.elite}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   PLANET DDS LOGOMARK (the "flag")
   ──────────────────────────────────────────────────────────────────────── */
function Logomark({ size = 28, color = C.blue }) {
  const bars = [
    { x: 0, h: 0.95 },
    { x: 6, h: 0.7 },
    { x: 12, h: 0.55 },
    { x: 18, h: 0.4 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={(1 - b.h) * 12}
          width="3"
          height={b.h * 24}
          rx="1"
          fill={color}
        />
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   DASHBOARD KPI CARD
   ──────────────────────────────────────────────────────────────────────── */
function KPICard({ kpi }) {
  const cfg = kpi.config;
  const insight = actionForStatus(cfg, kpi.status);
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        padding: 18,
        border: `1px solid ${C.line}`,
        boxShadow: "0 1px 2px rgba(0,15,96,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: C.blue,
            }}
          >
            {cfg.category}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: C.darkBlue,
              marginTop: 2,
              lineHeight: 1.25,
            }}
          >
            {cfg.label}
          </div>
        </div>
        <StatusBadge status={kpi.status} />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: C.darkBlue,
            letterSpacing: -0.5,
            lineHeight: 1,
          }}
        >
          {cfg.format(kpi.value)}
        </div>
        <TrendChip delta={kpi.trend} unit={cfg.unit} />
      </div>

      <BenchmarkBand kpi={kpi} />

      <div
        style={{
          fontSize: 12,
          color: C.mute,
          lineHeight: 1.45,
          paddingTop: 4,
          borderTop: `1px solid ${C.line}`,
        }}
      >
        {insight}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   PRESENTATION KPI CARD (slide variant)
   ──────────────────────────────────────────────────────────────────────── */
function PresentationKPICard({ kpi }) {
  const cfg = kpi.config;
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 18,
        padding: 22,
        border: `1px solid ${C.line}`,
        boxShadow: "0 2px 8px rgba(0,15,96,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: C.darkBlue,
            lineHeight: 1.2,
            flex: 1,
          }}
        >
          {cfg.label}
        </div>
        <StatusBadge status={kpi.status} size="md" />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: C.blue,
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {cfg.format(kpi.value)}
        </div>
        <div style={{ fontSize: 12, color: C.mute, fontWeight: 600 }}>
          Peer avg{" "}
          <span style={{ color: C.darkBlue }}>
            {cfg.format(cfg.peerAverage)}
          </span>
        </div>
      </div>

      <BenchmarkBand kpi={kpi} />

      <div
        style={{
          padding: "10px 12px",
          background: C.blueWater,
          borderRadius: 10,
          fontSize: 12.5,
          color: C.darkBlue,
          lineHeight: 1.45,
          fontWeight: 500,
        }}
      >
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: C.blue,
            fontWeight: 700,
            marginBottom: 3,
          }}
        >
          Why it matters
        </div>
        {cfg.whyItMatters}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: C.darkBlue,
          lineHeight: 1.45,
          fontWeight: 500,
        }}
      >
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: C.orange,
            fontWeight: 700,
            marginBottom: 3,
          }}
        >
          Recommended action
        </div>
        {actionForStatus(cfg, kpi.status)}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   SLIDE FRAME (16:9)
   ──────────────────────────────────────────────────────────────────────── */
function SlideFrame({ children, slide, totalSlides, slideRefSetter }) {
  return (
    <div
      ref={slideRefSetter}
      style={{
        aspectRatio: "16/9",
        width: "100%",
        background: C.white,
        borderRadius: 18,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 8px 32px rgba(0,15,96,0.10)",
        border: `1px solid ${C.line}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: 28,
          right: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: C.mute,
          fontWeight: 600,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logomark size={18} />
          <span>BenchmarkIQ • Planet DDS</span>
        </div>
        <div>
          {slide} / {totalSlides}
        </div>
      </div>
    </div>
  );
}

function SlideHeader({ title, subtitle }) {
  return (
    <div
      style={{
        background: C.darkBlue,
        padding: "20px 32px",
        color: C.white,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: C.blueWater,
            fontWeight: 500,
            marginTop: 2,
            letterSpacing: 0.2,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   SLIDE 1 - SUMMARY
   ──────────────────────────────────────────────────────────────────────── */
function SummarySlide({ kpis, score, counts, focus }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SlideHeader
        title="KPI Benchmark Summary"
        subtitle="Operational health overview"
      />
      <div
        style={{
          flex: 1,
          padding: "24px 32px 60px 32px",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 24,
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${C.darkBlue} 0%, ${C.blue} 100%)`,
              borderRadius: 16,
              padding: "20px 22px",
              color: C.white,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                opacity: 0.85,
                fontWeight: 700,
              }}
            >
              Operational Health Score
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginTop: 4,
              }}
            >
              <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1 }}>
                {score.score}
              </div>
              <div style={{ fontSize: 20, opacity: 0.85 }}>/ 100</div>
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              {score.label}
            </div>
            <div
              style={{
                marginTop: 14,
                height: 6,
                background: "rgba(255,255,255,0.25)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${score.score}%`,
                  height: "100%",
                  background: C.white,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { k: "AT_RISK", v: counts.AT_RISK, label: "At Risk" },
              { k: "ON_TRACK", v: counts.ON_TRACK, label: "On Track" },
              { k: "ELITE", v: counts.ELITE, label: "Elite" },
            ].map((s) => {
              const st = STATUS[s.k];
              return (
                <div
                  key={s.k}
                  style={{
                    background: st.bg,
                    border: `1px solid ${st.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: st.color,
                      lineHeight: 1,
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: st.color,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginTop: 4,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              background: C.blueWater,
              borderRadius: 14,
              padding: "16px 18px",
              fontSize: 13,
              color: C.darkBlue,
              lineHeight: 1.55,
              fontWeight: 500,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: C.blue,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginBottom: 4,
              }}
            >
              Executive Summary
            </div>
            {dynamicSummary(score, counts)}
          </div>
        </div>

        {/* Right column - Focus areas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 12,
              color: C.blue,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Top 3 Recommended Focus Areas
          </div>
          {focus.length === 0 ? (
            <div
              style={{
                background: STATUS.ELITE.bg,
                border: `1px solid ${STATUS.ELITE.border}`,
                borderRadius: 12,
                padding: 16,
                color: C.green,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              All metrics are at or above benchmark. Maintain & replicate.
            </div>
          ) : (
            focus.map((f, i) => (
              <div
                key={f.id}
                style={{
                  background: C.white,
                  border: `1px solid ${C.line}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: i === 0 ? C.orange : C.blue,
                    color: C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: C.darkBlue,
                      }}
                    >
                      {f.config.label}
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.mute, fontWeight: 600 }}
                    >
                      {f.config.format(f.value)} → target{" "}
                      {f.config.format(f.config.targetValue)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: C.mute,
                      lineHeight: 1.45,
                      marginTop: 4,
                    }}
                  >
                    {actionForStatus(f.config, f.status)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div
            style={{
              marginTop: "auto",
              fontSize: 10.5,
              color: C.mute,
              fontStyle: "italic",
              fontWeight: 500,
            }}
          >
            This export is formatted for executive presentations and QBR
            discussions.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   SLIDES 2-5
   ──────────────────────────────────────────────────────────────────────── */
function KPISlide({ slide, results }) {
  const cards = slide.kpis.map((id) => results[id]);
  const cols = cards.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SlideHeader title={slide.title} subtitle={slide.subtitle} />
      <div
        style={{
          flex: 1,
          padding: "26px 32px 60px 32px",
          display: "grid",
          gridTemplateColumns: cols,
          gap: 18,
          alignContent: "start",
        }}
      >
        {cards.map((kpi) => (
          <PresentationKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   DASHBOARD TAB
   ──────────────────────────────────────────────────────────────────────── */
function DashboardTab({ results, score, counts, focus, location, period }) {
  const grouped = useMemo(() => {
    const out = {};
    Object.values(results).forEach((r) => {
      const c = r.config.category;
      if (!out[c]) out[c] = [];
      out[c].push(r);
    });
    return out;
  }, [results]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
          gap: 14,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${C.darkBlue} 0%, ${C.blue} 100%)`,
            borderRadius: 16,
            padding: "20px 22px",
            color: C.white,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              opacity: 0.85,
              fontWeight: 700,
            }}
          >
            Operational Health Score
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginTop: 4,
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
              {score.score}
            </div>
            <div style={{ fontSize: 16, opacity: 0.8 }}>/ 100</div>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginTop: 4,
              letterSpacing: 0.2,
            }}
          >
            {score.label}
          </div>
          <div
            style={{
              marginTop: 10,
              height: 5,
              background: "rgba(255,255,255,0.25)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${score.score}%`,
                height: "100%",
                background: C.white,
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        {[
          { k: "AT_RISK", v: counts.AT_RISK, label: "At Risk" },
          { k: "ON_TRACK", v: counts.ON_TRACK, label: "On Track" },
          { k: "ELITE", v: counts.ELITE, label: "Elite" },
        ].map((s) => {
          const st = STATUS[s.k];
          const Icon = st.icon;
          return (
            <div
              key={s.k}
              style={{
                background: C.white,
                border: `1px solid ${C.line}`,
                borderRadius: 16,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: C.mute,
                    fontWeight: 700,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: st.bg,
                    color: st.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={15} strokeWidth={2.4} />
                </div>
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: st.color,
                  lineHeight: 1,
                  marginTop: 8,
                }}
              >
                {s.v}
                <span
                  style={{
                    fontSize: 14,
                    color: C.mute,
                    fontWeight: 600,
                    marginLeft: 4,
                  }}
                >
                  / 10
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Focus Areas */}
      <div>
        <SectionHeader
          title="Top 3 Recommended Focus Areas"
          subtitle="Ranked by status, business impact, and distance from target"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
          {focus.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                background: STATUS.ELITE.bg,
                border: `1px solid ${STATUS.ELITE.border}`,
                borderRadius: 14,
                padding: 18,
                color: C.green,
                fontWeight: 600,
              }}
            >
              All metrics are at or above benchmark. Maintain and replicate.
            </div>
          ) : (
            focus.map((f, i) => (
              <FocusAreaCard key={f.id} kpi={f} rank={i + 1} />
            ))
          )}
          {focus.length < 3 &&
            Array.from({ length: 3 - focus.length }).map((_, i) => (
              <div key={`ph${i}`} />
            ))}
        </div>
      </div>

      {/* KPI groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
  {Object.entries(grouped).map(([category, items]) => (
    <div key={category}>
          <SectionHeader
            title={category}
            subtitle={`${items.length} metrics tracked`}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {items.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      ))}

      {/* Comparison table */}
      <div>
        <SectionHeader
          title="Customer Comparison"
          subtitle="Current value vs target, elite, and peer average"
        />
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
              padding: "12px 18px",
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: C.mute,
              fontWeight: 700,
              background: C.paper,
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <div>Metric</div>
            <div style={{ textAlign: "right" }}>Current</div>
            <div style={{ textAlign: "right" }}>Target</div>
            <div style={{ textAlign: "right" }}>Elite</div>
            <div style={{ textAlign: "right" }}>Peer Avg</div>
            <div style={{ textAlign: "right" }}>Status</div>
          </div>
          {Object.values(results)
            .sort((a, b) => a.config.priority - b.config.priority)
            .map((r) => (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                  padding: "13px 18px",
                  fontSize: 13,
                  borderBottom: `1px solid ${C.line}`,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    color: C.darkBlue,
                    fontWeight: 600,
                  }}
                >
                  {r.config.label}
                  <span
                    style={{
                      fontSize: 10,
                      color: C.mute,
                      marginLeft: 8,
                      fontWeight: 500,
                    }}
                  >
                    {r.config.category}
                  </span>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: 700,
                    color: C.darkBlue,
                  }}
                >
                  {r.config.format(r.value)}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    color: C.mute,
                    fontWeight: 500,
                  }}
                >
                  {r.config.format(r.config.targetValue)}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    color: C.mute,
                    fontWeight: 500,
                  }}
                >
                  {r.config.format(r.config.eliteValue)}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    color: C.mute,
                    fontWeight: 500,
                  }}
                >
                  {r.config.format(r.config.peerAverage)}
                </div>
                <div
                  style={{ textAlign: "right", display: "flex", justifyContent: "flex-end" }}
                >
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: C.darkBlue,
          letterSpacing: -0.2,
          lineHeight: 1.25,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12.5, color: C.mute, marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

function FocusAreaCard({ kpi, rank }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: rank === 1 ? C.orange : C.blue,
            color: C.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {rank}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.darkBlue,
            flex: 1,
          }}
        >
          {kpi.config.label}
        </div>
        <StatusBadge status={kpi.status} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 18,
          fontSize: 12,
          color: C.mute,
          fontWeight: 600,
        }}
      >
        <div>
          Current{" "}
          <span style={{ color: C.darkBlue }}>
            {kpi.config.format(kpi.value)}
          </span>
        </div>
        <div>
          Target{" "}
          <span style={{ color: C.darkBlue }}>
            {kpi.config.format(kpi.config.targetValue)}
          </span>
        </div>
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: C.mute,
          lineHeight: 1.5,
          paddingTop: 8,
          borderTop: `1px solid ${C.line}`,
        }}
      >
        {actionForStatus(kpi.config, kpi.status)}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   DATA SOURCES TAB
   ──────────────────────────────────────────────────────────────────────── */
function DataSourcesTab({ onUpload, dataSource, validation, fileName }) {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const parsed = {};
        const errors = [];
        Object.entries(REQUIRED_SCHEMA).forEach(([sheet, cols]) => {
          if (!wb.SheetNames.includes(sheet)) {
            errors.push(`Missing required sheet: ${sheet}`);
            return;
          }
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: null });
          if (rows.length === 0) {
            errors.push(`Sheet ${sheet} is empty`);
            return;
          }
          const sample = rows[0];
          const missing = cols.filter((c) => !(c in sample));
          if (missing.length) {
            errors.push(
              `Sheet ${sheet} missing columns: ${missing.join(", ")}`
            );
            return;
          }
          parsed[sheet] = rows;
        });
        if (errors.length) {
          onUpload({ ok: false, errors, fileName: file.name });
        } else {
          onUpload({
            ok: true,
            data: parsed,
            errors: [],
            fileName: file.name,
            counts: {
              Appointments: parsed.Appointments.length,
              Clinical: parsed.Clinical.length,
              RevenueCycle: parsed.RevenueCycle.length,
              Operational: parsed.Operational.length,
            },
          });
        }
      } catch (err) {
        onUpload({
          ok: false,
          errors: [`Could not read workbook: ${String(err.message || err)}`],
          fileName: file.name,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();
      Object.entries(REQUIRED_SCHEMA).forEach(([sheet, cols]) => {
        const sample = MOCK_DATA[sheet].slice(0, 25);
        const ws = XLSX.utils.json_to_sheet(sample, { header: cols });
        XLSX.utils.book_append_sheet(wb, ws, sheet);
      });
      XLSX.writeFile(wb, "BenchmarkIQ_Template.xlsx");
    } catch (err) {
      alert(
        "Template download is not available in this environment, but the workbook structure is documented below."
      );
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: 24,
      }}
    >
      <div>
        <SectionHeader
          title="Excel Upload"
          subtitle="Upload one Excel workbook with the required sheet names and column headers. BenchmarkIQ will calculate KPIs from the uploaded data and compare results against configured benchmark standards."
        />

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          style={{
            background: C.white,
            border: `2px dashed ${C.blue}`,
            borderRadius: 16,
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.blueWater)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.white)}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: C.blueWater,
              color: C.blue,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={26} strokeWidth={2.2} />
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.darkBlue,
              marginTop: 14,
            }}
          >
            Drop your workbook or click to browse
          </div>
          <div style={{ fontSize: 12, color: C.mute, marginTop: 4 }}>
            .xlsx files only • required schema below
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Status panel */}
        {validation && validation.ok && (
          <div
            style={{
              marginTop: 16,
              background: STATUS.ELITE.bg,
              border: `1px solid ${STATUS.ELITE.border}`,
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex",
              gap: 12,
            }}
          >
            <CheckCircle2 size={20} color={C.green} />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: C.green,
                  fontSize: 13.5,
                }}
              >
                Workbook validated • {fileName}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.darkBlue,
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {validation.counts &&
                  `Loaded ${validation.counts.Appointments} appointments, ${validation.counts.Clinical} cases, ${validation.counts.RevenueCycle} claims, ${validation.counts.Operational} visits.`}
              </div>
            </div>
          </div>
        )}
        {validation && !validation.ok && (
          <div
            style={{
              marginTop: 16,
              background: STATUS.AT_RISK.bg,
              border: `1px solid ${STATUS.AT_RISK.border}`,
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex",
              gap: 12,
            }}
          >
            <AlertTriangle size={20} color={C.orange} />
            <div>
              <div style={{ fontWeight: 700, color: C.orange, fontSize: 13.5 }}>
                Validation failed
              </div>
              <ul
                style={{
                  margin: "6px 0 0 0",
                  paddingLeft: 18,
                  fontSize: 12,
                  color: C.darkBlue,
                  lineHeight: 1.55,
                }}
              >
                {validation.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <button
            onClick={downloadTemplate}
            style={{
              background: C.blue,
              color: C.white,
              border: "none",
              borderRadius: 999,
              padding: "11px 18px",
              fontWeight: 700,
              fontSize: 12.5,
              letterSpacing: 0.3,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Download size={15} /> Download Sample Template
          </button>
          <div
            style={{
              fontSize: 11.5,
              color: C.mute,
              fontWeight: 600,
              padding: "6px 12px",
              background: C.blueWater,
              borderRadius: 999,
            }}
          >
            Source:{" "}
            <span style={{ color: C.darkBlue }}>
              {dataSource === "uploaded" ? "Uploaded workbook" : "Sample data"}
            </span>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader
          title="Required Workbook Structure"
          subtitle="Sheet names and columns must match exactly"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {Object.entries(REQUIRED_SCHEMA).map(([sheet, cols]) => (
            <div
              key={sheet}
              style={{
                background: C.white,
                border: `1px solid ${C.line}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: C.darkBlue,
                  color: C.white,
                  padding: "10px 16px",
                  fontWeight: 700,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FileSpreadsheet size={15} />
                {sheet}
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {cols.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 11,
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      background: C.blueWater,
                      color: C.darkBlue,
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 14,
            background: C.blueWater,
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            gap: 10,
            color: C.darkBlue,
            fontSize: 12,
            lineHeight: 1.55,
            fontWeight: 500,
          }}
        >
          <Info size={16} color={C.blue} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            Booleans accept <strong>true/false</strong>, <strong>1/0</strong>,
            or <strong>"TRUE"/"FALSE"</strong>. Dates can be ISO strings
            (YYYY-MM-DD) or native Excel dates.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   PRESENTATION EXPORT TAB
   ──────────────────────────────────────────────────────────────────────── */
function PresentationExportTab({
  results,
  score,
  counts,
  focus,
  presentationMode,
  setPresentationMode,
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [exportMsg, setExportMsg] = useState(null);
  const slideRef = useRef(null);

  const slide = SLIDE_DEFINITIONS[slideIdx];

  const renderSlide = () => {
    if (slide.type === "summary") {
      return (
        <SummarySlide
          kpis={results}
          score={score}
          counts={counts}
          focus={focus}
        />
      );
    }
    return <KPISlide slide={slide} results={results} />;
  };

  const tryExport = async (kind) => {
    const node = slideRef.current;

    if (!node) {
      setExportMsg({
        kind,
        text: "No slide found to export.",
      });
      return;
    }

    try {
      setExportMsg({
        kind,
        text: `Exporting ${kind.toUpperCase()}...`,
      });

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: C.white,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const fileName = `BenchmarkIQ_Slide_${slide.id}`;

      if (kind === "png") {
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${fileName}.png`;
        link.click();
      }

      if (kind === "pdf") {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}.pdf`);
      }

      setExportMsg({
        kind,
        text: `${kind.toUpperCase()} export complete.`,
      });

      setTimeout(() => setExportMsg(null), 3000);
    } catch (err) {
      setExportMsg({
        kind,
        text: `Export failed: ${String(err.message || err)}`,
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {!presentationMode && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <SectionHeader
              title="Presentation Export"
              subtitle="Five executive-ready slides built from current KPI results"
            />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => tryExport("png")}
              style={btnSecondary}
              title="Export current slide as PNG"
            >
              <Download size={14} /> PNG
            </button>
            <button onClick={() => tryExport("pdf")} style={btnSecondary}>
              <Download size={14} /> PDF
            </button>
            <button
              onClick={() => setPresentationMode(true)}
              style={btnPrimary}
            >
              <Maximize2 size={14} /> Presentation Mode
            </button>
          </div>
        </div>
      )}

      {/* Slide nav */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          ...(presentationMode ? { display: "none" } : {}),
        }}
      >
        {SLIDE_DEFINITIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSlideIdx(i)}
            style={{
              background: i === slideIdx ? C.darkBlue : C.white,
              color: i === slideIdx ? C.white : C.darkBlue,
              border: `1px solid ${i === slideIdx ? C.darkBlue : C.line}`,
              padding: "9px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.2,
            }}
          >
            {s.id}. {s.title}
          </button>
        ))}
      </div>

      {/* Slide preview */}
      <div
        style={{ position: "relative", width: "100%", maxWidth: presentationMode ? "100%" : 1180, margin: presentationMode ? 0 : "0 auto" }}
      >
        <div ref={slideRef}>{renderSlide()}</div>
        {/* Side arrows */}
        <button
          onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
          disabled={slideIdx === 0}
          style={{
            ...arrowBtn,
            left: presentationMode ? 12 : -50,
            opacity: slideIdx === 0 ? 0.3 : 1,
            cursor: slideIdx === 0 ? "default" : "pointer",
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() =>
            setSlideIdx((i) => Math.min(SLIDE_DEFINITIONS.length - 1, i + 1))
          }
          disabled={slideIdx === SLIDE_DEFINITIONS.length - 1}
          style={{
            ...arrowBtn,
            right: presentationMode ? 12 : -50,
            opacity: slideIdx === SLIDE_DEFINITIONS.length - 1 ? 0.3 : 1,
            cursor:
              slideIdx === SLIDE_DEFINITIONS.length - 1 ? "default" : "pointer",
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slide indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {SLIDE_DEFINITIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSlideIdx(i)}
            style={{
              width: i === slideIdx ? 24 : 8,
              height: 8,
              borderRadius: 999,
              border: "none",
              background: i === slideIdx ? C.blue : C.line,
              cursor: "pointer",
              transition: "width 0.2s",
            }}
          />
        ))}
      </div>

      {presentationMode && (
        <button
          onClick={() => setPresentationMode(false)}
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 200,
            background: C.darkBlue,
            color: C.white,
            border: "none",
            borderRadius: 999,
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(0,15,96,0.25)",
          }}
        >
          <Minimize2 size={14} /> Exit Presentation Mode
        </button>
      )}

      {exportMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: C.darkBlue,
            color: C.white,
            padding: "14px 20px",
            borderRadius: 12,
            fontSize: 12.5,
            maxWidth: 480,
            boxShadow: "0 8px 32px rgba(0,15,96,0.30)",
            zIndex: 300,
            lineHeight: 1.5,
            fontWeight: 500,
            display: "flex",
            gap: 10,
          }}
        >
          <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 3 }}>
              {exportMsg.kind === "pdf" ? "PDF Export" : "PNG Export"}
            </div>
            {exportMsg.text}
          </div>
          <button
            onClick={() => setExportMsg(null)}
            style={{
              background: "transparent",
              border: "none",
              color: C.white,
              cursor: "pointer",
              padding: 0,
              opacity: 0.7,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

const btnPrimary = {
  background: C.blue,
  color: C.white,
  border: "none",
  borderRadius: 999,
  padding: "10px 16px",
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: 0.2,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const btnSecondary = {
  background: C.white,
  color: C.darkBlue,
  border: `1px solid ${C.line}`,
  borderRadius: 999,
  padding: "10px 14px",
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: 0.2,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const arrowBtn = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: C.white,
  border: `1px solid ${C.line}`,
  color: C.darkBlue,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,15,96,0.10)",
  zIndex: 10,
};

/* ────────────────────────────────────────────────────────────────────────
   APP SHELL
   ──────────────────────────────────────────────────────────────────────── */
export default function BenchmarkIQ() {
  const [tab, setTab] = useState("dashboard");
  const [location, setLocation] = useState("ALL");
  const [period, setPeriod] = useState("90");
// Default to engineer-provided sample dataset. Uploaded workbooks switch
  // this back to a raw-row workbook & flow through calculateKPIs() unchanged.
  const [data, setData] = useState(ENGINEER_SAMPLE_DATA);
  const [dataSource, setDataSource] = useState("sample");
  const [validation, setValidation] = useState(null);
  const [fileName, setFileName] = useState("");
  const [presentationMode, setPresentationMode] = useState(false);

  const handleUpload = useCallback((result) => {
    setValidation(result);
    setFileName(result.fileName || "");
    if (result.ok) {
      setData(result.data);
      setDataSource("uploaded");
    }
  }, []);

// Branch on data shape: precalc demo data uses the adapter, raw-row
  // workbooks (uploaded Excel) use the original calculateKPIs() path.
  const results = useMemo(
    () =>
      data && data.__precalc
        ? buildResultsFromPrecalculated(data, location, KPI_CONFIG)
        : calculateKPIs(data, location),
    [data, location]
  );

  // Location list comes from the precalc data when available, otherwise
  // falls back to the static LOCATIONS used by the raw-row path.
  const locations = useMemo(
    () =>
      data && data.__precalc && Array.isArray(data.locations)
        ? data.locations
        : LOCATIONS,
    [data]
  );  
  const score = useMemo(() => calculateHealthScore(results), [results]);
  const counts = useMemo(() => statusCounts(results), [results]);
  const focus = useMemo(() => getTopFocusAreas(results, 3), [results]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: presentationMode ? "#0A1640" : C.paper,
        fontFamily:
          '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: C.darkBlue,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {!presentationMode && (
        <>
          {/* Top header */}
          <header
            style={{
              background: C.white,
              borderBottom: `1px solid ${C.line}`,
              padding: "16px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              position: "sticky",
              top: 0,
              zIndex: 50,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Logomark size={32} />
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: C.darkBlue,
                    letterSpacing: -0.4,
                    lineHeight: 1,
                  }}
                >
                  BenchmarkIQ
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: C.mute,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  Customer KPI Benchmarking Dashboard
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Select
                label="Location"
                value={location}
                onChange={setLocation}
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
              />
              <Select
                label="Period"
                value={period}
                onChange={setPeriod}
                options={TIME_PERIODS.map((p) => ({
                  value: p.id,
                  label: p.label,
                }))}
              />
            </div>
          </header>

          {/* Positioning statement */}
          <div
            style={{
              padding: "18px 28px 0 28px",
              maxWidth: 1280,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                background: C.white,
                border: `1px solid ${C.line}`,
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: C.blueWater,
                  color: C.blue,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Target size={18} strokeWidth={2.4} />
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: C.darkBlue,
                  fontWeight: 500,
                }}
              >
                BenchmarkIQ helps teams identify operational gaps, compare
                performance to benchmark standards, and prioritize the actions
                most likely to improve production, cash flow, and adoption.
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <div
            style={{
              padding: "18px 28px 0 28px",
              maxWidth: 1280,
              margin: "0 auto",
            }}
          >
            <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.line}` }}>
              {[
                { id: "dashboard", label: "Dashboard", Icon: BarChart3 },
                { id: "data", label: "Data Sources", Icon: Database },
                {
                  id: "export",
                  label: "Presentation Export",
                  Icon: Presentation,
                },
              ].map((t) => {
                const active = tab === t.id;
                const Icon = t.Icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: "12px 18px 14px 18px",
                      fontSize: 13.5,
                      fontWeight: active ? 700 : 600,
                      color: active ? C.blue : C.mute,
                      cursor: "pointer",
                      borderBottom: `2px solid ${active ? C.blue : "transparent"}`,
                      marginBottom: -1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      letterSpacing: 0.1,
                    }}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Body */}
      <main
        style={{
          padding: presentationMode ? "32px" : "24px 28px 60px 28px",
          maxWidth: presentationMode ? "100%" : 1280,
          margin: "0 auto",
        }}
      >
        {tab === "dashboard" && !presentationMode && (
          <DashboardTab
            results={results}
            score={score}
            counts={counts}
            focus={focus}
            location={location}
            period={period}
          />
        )}
        {tab === "data" && !presentationMode && (
          <DataSourcesTab
            onUpload={handleUpload}
            dataSource={dataSource}
            validation={validation}
            fileName={fileName}
          />
        )}
        {(tab === "export" || presentationMode) && (
          <PresentationExportTab
            results={results}
            score={score}
            counts={counts}
            focus={focus}
            presentationMode={presentationMode}
            setPresentationMode={setPresentationMode}
          />
        )}
      </main>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          color: C.mute,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          paddingLeft: 2,
        }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: C.white,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "9px 14px",
          fontSize: 13,
          fontWeight: 600,
          color: C.darkBlue,
          cursor: "pointer",
          outline: "none",
          minWidth: 160,
          fontFamily: "inherit",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}