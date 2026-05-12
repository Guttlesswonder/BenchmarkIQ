/* ────────────────────────────────────────────────────────────────────────
 * engineerSampleData.js
 *
 * TEMPORARY hackathon demo dataset.
 *
 * Contains a hardcoded snapshot of pre-calculated per-office KPI values
 * sourced from data team Excel exports (single point-in-time snapshot).
 *
 * Why this file exists:
 *   The app is designed for two production data paths:
 *     1. Live API (planned)
 *     2. Excel workbook upload (in app today, raw-row schema)
 *   For the hackathon demo we want the app to open with realistic numbers
 *   instead of generated mock data, so the default state loads this module.
 *
 * Real vs synthetic KPI values:
 *   Real (from engineer sheets):
 *     - show_rate              (derived as 1 - no_show_rate)
 *     - case_acceptance
 *     - case_completion
 *     - otc_collection
 *     - days_to_claim
 *   Synthetic (deterministic per OID, anchored to office performance signal
 *   so the demo feels coherent):
 *     - confirmation_rate
 *     - hygiene_reappt_rate
 *     - clean_claim
 *     - notes_signed
 *     - ledger_posted
 *
 * To replace with live data:
 *   - Wire the API to produce the same shape as ENGINEER_SAMPLE_DATA, or
 *   - Remove the __precalc branch in App.jsx and let calculateKPIs handle
 *     raw rows from the workbook upload.
 *
 * Safe to delete this entire file once the API ingestion is live.
 * ──────────────────────────────────────────────────────────────────────── */

// 94 offices with full 5/5 real-KPI coverage from the source workbooks.
// Filtered out: Zz-prefixed inactive offices and entries with case-volume
// or appointment-volume below 500 (statistical noise).

export const ENGINEER_SAMPLE_OFFICES = [
  { oid: 102, name: "Advanced Dental Care Mandarin", kpis: { confirmation_rate: 89.38, show_rate: 98.3, hygiene_reappt_rate: 74.95, case_acceptance: 66.5, case_completion: 44.34, otc_collection: 98.62, days_to_claim: 2.0, clean_claim: 92.68, notes_signed: 97.58, ledger_posted: 97.99 } },
  { oid: 195, name: "Advanced Dental Care Of Bradenton", kpis: { confirmation_rate: 83.12, show_rate: 87.57, hygiene_reappt_rate: 73.39, case_acceptance: 57.97, case_completion: 42.42, otc_collection: 96.12, days_to_claim: 2.39, clean_claim: 91.61, notes_signed: 96.09, ledger_posted: 96.28 } },
  { oid: 174, name: "Advanced Dental Care Of Brandon", kpis: { confirmation_rate: 84.45, show_rate: 92.85, hygiene_reappt_rate: 74.07, case_acceptance: 61.27, case_completion: 44.75, otc_collection: 94.9, days_to_claim: 2.09, clean_claim: 91.74, notes_signed: 95.94, ledger_posted: 96.36 } },
  { oid: 178, name: "Advanced Dental Care Of Clearwater", kpis: { confirmation_rate: 87.34, show_rate: 88.71, hygiene_reappt_rate: 74.56, case_acceptance: 58.6, case_completion: 36.9, otc_collection: 96.99, days_to_claim: 2.49, clean_claim: 90.64, notes_signed: 97.12, ledger_posted: 96.88 } },
  { oid: 194, name: "Advanced Dental Care Of Lakewood Ranch", kpis: { confirmation_rate: 86.17, show_rate: 95.01, hygiene_reappt_rate: 73.0, case_acceptance: 73.96, case_completion: 55.6, otc_collection: 93.41, days_to_claim: 1.93, clean_claim: 93.31, notes_signed: 96.86, ledger_posted: 96.47 } },
  { oid: 196, name: "Advanced Dental Care Of Mount Dora", kpis: { confirmation_rate: 87.83, show_rate: 91.22, hygiene_reappt_rate: 74.88, case_acceptance: 58.19, case_completion: 34.81, otc_collection: 95.88, days_to_claim: 3.17, clean_claim: 91.11, notes_signed: 95.69, ledger_posted: 95.78 } },
  { oid: 184, name: "Advanced Dental Care Of Ocala", kpis: { confirmation_rate: 81.29, show_rate: 95.61, hygiene_reappt_rate: 67.82, case_acceptance: 52.66, case_completion: 25.67, otc_collection: 92.35, days_to_claim: 5.09, clean_claim: 91.6, notes_signed: 95.55, ledger_posted: 95.93 } },
  { oid: 171, name: "Advanced Dental Care Of Ocoee", kpis: { confirmation_rate: 88.88, show_rate: 92.65, hygiene_reappt_rate: 72.92, case_acceptance: 57.44, case_completion: 47.1, otc_collection: 96.7, days_to_claim: 2.03, clean_claim: 92.99, notes_signed: 96.79, ledger_posted: 97.58 } },
  { oid: 121, name: "Advanced Dental Care Of Orange City", kpis: { confirmation_rate: 88.37, show_rate: 94.46, hygiene_reappt_rate: 72.84, case_acceptance: 71.52, case_completion: 29.99, otc_collection: 90.84, days_to_claim: 1.95, clean_claim: 92.07, notes_signed: 97.33, ledger_posted: 96.41 } },
  { oid: 186, name: "Advanced Dental Care Of Orlando", kpis: { confirmation_rate: 84.73, show_rate: 96.8, hygiene_reappt_rate: 70.6, case_acceptance: 51.23, case_completion: 34.59, otc_collection: 96.47, days_to_claim: 2.23, clean_claim: 94.5, notes_signed: 96.95, ledger_posted: 96.71 } },
  { oid: 185, name: "Advanced Dental Care Of Pembroke Pines", kpis: { confirmation_rate: 83.92, show_rate: 97.05, hygiene_reappt_rate: 70.79, case_acceptance: 63.17, case_completion: 33.04, otc_collection: 96.21, days_to_claim: 2.72, clean_claim: 90.74, notes_signed: 97.36, ledger_posted: 96.09 } },
  { oid: 180, name: "Advanced Dental Care Of Quail Meadows", kpis: { confirmation_rate: 87.18, show_rate: 97.78, hygiene_reappt_rate: 73.21, case_acceptance: 73.83, case_completion: 35.76, otc_collection: 95.43, days_to_claim: 1.62, clean_claim: 95.21, notes_signed: 97.47, ledger_posted: 97.33 } },
  { oid: 199, name: "Advanced Dental Care Of Riverview", kpis: { confirmation_rate: 88.59, show_rate: 94.13, hygiene_reappt_rate: 72.91, case_acceptance: 60.61, case_completion: 48.0, otc_collection: 95.07, days_to_claim: 1.82, clean_claim: 93.48, notes_signed: 97.38, ledger_posted: 95.79 } },
  { oid: 177, name: "Advanced Dental Care Of Sarasota", kpis: { confirmation_rate: 87.08, show_rate: 89.07, hygiene_reappt_rate: 70.98, case_acceptance: 67.51, case_completion: 36.59, otc_collection: 96.66, days_to_claim: 2.11, clean_claim: 92.74, notes_signed: 96.39, ledger_posted: 95.9 } },
  { oid: 182, name: "Advanced Dental Care Of Shady Road", kpis: { confirmation_rate: 86.52, show_rate: 92.82, hygiene_reappt_rate: 73.38, case_acceptance: 56.22, case_completion: 33.49, otc_collection: 90.19, days_to_claim: 2.57, clean_claim: 92.68, notes_signed: 96.62, ledger_posted: 96.31 } },
  { oid: 179, name: "Advanced Dental Care Of Tampa", kpis: { confirmation_rate: 82.77, show_rate: 88.92, hygiene_reappt_rate: 70.67, case_acceptance: 64.67, case_completion: 43.51, otc_collection: 91.9, days_to_claim: 2.53, clean_claim: 93.02, notes_signed: 96.98, ledger_posted: 96.62 } },
  { oid: 197, name: "Advanced Dental Care Of Temple Terrace", kpis: { confirmation_rate: 86.03, show_rate: 90.71, hygiene_reappt_rate: 69.83, case_acceptance: 63.27, case_completion: 36.28, otc_collection: 94.49, days_to_claim: 4.05, clean_claim: 92.93, notes_signed: 96.38, ledger_posted: 95.83 } },
  { oid: 202, name: "Argyle Dental Center", kpis: { confirmation_rate: 82.98, show_rate: 95.08, hygiene_reappt_rate: 73.68, case_acceptance: 52.8, case_completion: 36.26, otc_collection: 91.46, days_to_claim: 3.19, clean_claim: 92.49, notes_signed: 96.25, ledger_posted: 94.88 } },
  { oid: 208, name: "DSC Oral Surgery & Dental Implants", kpis: { confirmation_rate: 85.64, show_rate: 94.02, hygiene_reappt_rate: 75.38, case_acceptance: 69.36, case_completion: 24.76, otc_collection: 98.11, days_to_claim: 1.72, clean_claim: 95.12, notes_signed: 96.83, ledger_posted: 97.0 } },
  { oid: 212, name: "Dental Assoc Of FL Cosmetic And Implant Dentist", kpis: { confirmation_rate: 87.07, show_rate: 96.1, hygiene_reappt_rate: 70.45, case_acceptance: 55.78, case_completion: 40.81, otc_collection: 96.22, days_to_claim: 1.86, clean_claim: 93.3, notes_signed: 96.54, ledger_posted: 96.67 } },
  { oid: 162, name: "Dental Associates Of Florida Bartow", kpis: { confirmation_rate: 85.49, show_rate: 95.4, hygiene_reappt_rate: 70.43, case_acceptance: 57.65, case_completion: 36.01, otc_collection: 95.43, days_to_claim: 1.95, clean_claim: 94.85, notes_signed: 96.94, ledger_posted: 95.8 } },
  { oid: 164, name: "Dental Associates Of Florida Brooksville", kpis: { confirmation_rate: 87.15, show_rate: 96.13, hygiene_reappt_rate: 72.61, case_acceptance: 62.58, case_completion: 48.41, otc_collection: 83.74, days_to_claim: 2.47, clean_claim: 93.83, notes_signed: 96.36, ledger_posted: 95.58 } },
  { oid: 107, name: "Dental Associates Of Florida Central Brandon", kpis: { confirmation_rate: 81.18, show_rate: 94.27, hygiene_reappt_rate: 66.48, case_acceptance: 49.7, case_completion: 35.49, otc_collection: 96.0, days_to_claim: 3.24, clean_claim: 90.7, notes_signed: 95.99, ledger_posted: 96.19 } },
  { oid: 165, name: "Dental Associates Of Florida Lakeland", kpis: { confirmation_rate: 84.8, show_rate: 90.75, hygiene_reappt_rate: 74.47, case_acceptance: 55.05, case_completion: 30.53, otc_collection: 96.63, days_to_claim: 2.3, clean_claim: 91.39, notes_signed: 96.09, ledger_posted: 96.23 } },
  { oid: 200, name: "Dental Associates Of Florida Lutz", kpis: { confirmation_rate: 87.51, show_rate: 91.58, hygiene_reappt_rate: 74.69, case_acceptance: 60.67, case_completion: 37.66, otc_collection: 95.2, days_to_claim: 1.96, clean_claim: 91.7, notes_signed: 95.97, ledger_posted: 96.4 } },
  { oid: 169, name: "Dental Associates Of Florida Sun City Center", kpis: { confirmation_rate: 85.65, show_rate: 95.59, hygiene_reappt_rate: 76.65, case_acceptance: 56.11, case_completion: 46.9, otc_collection: 97.48, days_to_claim: 1.34, clean_claim: 93.42, notes_signed: 96.86, ledger_posted: 96.34 } },
  { oid: 170, name: "Dental Associates Of Florida Tampa", kpis: { confirmation_rate: 83.59, show_rate: 89.14, hygiene_reappt_rate: 69.26, case_acceptance: 59.32, case_completion: 28.63, otc_collection: 97.79, days_to_claim: 2.4, clean_claim: 94.0, notes_signed: 96.9, ledger_posted: 96.47 } },
  { oid: 106, name: "Dental Associates Of Florida Winter Haven", kpis: { confirmation_rate: 81.66, show_rate: 91.8, hygiene_reappt_rate: 70.72, case_acceptance: 55.01, case_completion: 27.58, otc_collection: 92.9, days_to_claim: 2.69, clean_claim: 91.66, notes_signed: 96.06, ledger_posted: 96.72 } },
  { oid: 115, name: "Dental Associates Of Hollywood", kpis: { confirmation_rate: 88.96, show_rate: 94.15, hygiene_reappt_rate: 69.81, case_acceptance: 56.71, case_completion: 27.76, otc_collection: 96.96, days_to_claim: 2.36, clean_claim: 93.71, notes_signed: 96.65, ledger_posted: 96.55 } },
  { oid: 160, name: "Dental Associates Of Homestead", kpis: { confirmation_rate: 85.75, show_rate: 86.22, hygiene_reappt_rate: 74.84, case_acceptance: 62.39, case_completion: 47.78, otc_collection: 96.31, days_to_claim: 2.17, clean_claim: 94.25, notes_signed: 96.19, ledger_posted: 96.29 } },
  { oid: 114, name: "Dental Associates Of Kendall", kpis: { confirmation_rate: 84.92, show_rate: 94.99, hygiene_reappt_rate: 74.86, case_acceptance: 77.69, case_completion: 72.39, otc_collection: 97.25, days_to_claim: 5.38, clean_claim: 95.58, notes_signed: 96.52, ledger_posted: 96.32 } },
  { oid: 152, name: "Dental Center At Aventura", kpis: { confirmation_rate: 86.67, show_rate: 92.84, hygiene_reappt_rate: 73.97, case_acceptance: 57.6, case_completion: 33.88, otc_collection: 98.1, days_to_claim: 2.73, clean_claim: 92.55, notes_signed: 96.84, ledger_posted: 96.51 } },
  { oid: 110, name: "Dental Center Of Kendall, PA", kpis: { confirmation_rate: 86.92, show_rate: 90.06, hygiene_reappt_rate: 77.21, case_acceptance: 63.12, case_completion: 53.24, otc_collection: 97.64, days_to_claim: 2.14, clean_claim: 93.94, notes_signed: 97.09, ledger_posted: 96.56 } },
  { oid: 219, name: "Dental Specialty Center - Brandon", kpis: { confirmation_rate: 83.67, show_rate: 83.21, hygiene_reappt_rate: 70.89, case_acceptance: 61.95, case_completion: 11.69, otc_collection: 98.18, days_to_claim: 2.37, clean_claim: 90.79, notes_signed: 94.94, ledger_posted: 96.43 } },
  { oid: 173, name: "Dental Specialty Center Of Cape Coral,PLLC", kpis: { confirmation_rate: 87.66, show_rate: 91.48, hygiene_reappt_rate: 73.77, case_acceptance: 73.62, case_completion: 48.43, otc_collection: 98.79, days_to_claim: 3.07, clean_claim: 94.21, notes_signed: 95.82, ledger_posted: 97.36 } },
  { oid: 147, name: "Dental Specialty Center Of Cutler Bay", kpis: { confirmation_rate: 85.1, show_rate: 84.75, hygiene_reappt_rate: 72.6, case_acceptance: 69.6, case_completion: 33.83, otc_collection: 96.5, days_to_claim: 3.22, clean_claim: 91.14, notes_signed: 96.39, ledger_posted: 95.19 } },
  { oid: 141, name: "Dental Specialty Center Of Fort Myers", kpis: { confirmation_rate: 82.99, show_rate: 82.9, hygiene_reappt_rate: 68.61, case_acceptance: 65.52, case_completion: 45.65, otc_collection: 92.16, days_to_claim: 2.06, clean_claim: 91.31, notes_signed: 95.35, ledger_posted: 96.75 } },
  { oid: 111, name: "Dental Specialty Center Of Kendall", kpis: { confirmation_rate: 87.57, show_rate: 73.3, hygiene_reappt_rate: 72.93, case_acceptance: 60.83, case_completion: 37.82, otc_collection: 98.38, days_to_claim: 2.15, clean_claim: 90.95, notes_signed: 94.82, ledger_posted: 96.47 } },
  { oid: 128, name: "Dental Specialty Center Of Naples", kpis: { confirmation_rate: 84.93, show_rate: 89.71, hygiene_reappt_rate: 71.37, case_acceptance: 61.27, case_completion: 39.85, otc_collection: 98.84, days_to_claim: 5.22, clean_claim: 90.95, notes_signed: 95.6, ledger_posted: 96.77 } },
  { oid: 218, name: "Florida Dental Centers Bradenton", kpis: { confirmation_rate: 86.4, show_rate: 93.45, hygiene_reappt_rate: 70.43, case_acceptance: 49.87, case_completion: 41.11, otc_collection: 95.47, days_to_claim: 2.97, clean_claim: 91.13, notes_signed: 95.54, ledger_posted: 95.25 } },
  { oid: 217, name: "Florida Dental Centers Clearwater", kpis: { confirmation_rate: 85.68, show_rate: 93.43, hygiene_reappt_rate: 73.62, case_acceptance: 51.8, case_completion: 39.5, otc_collection: 94.35, days_to_claim: 2.87, clean_claim: 93.21, notes_signed: 96.63, ledger_posted: 96.27 } },
  { oid: 215, name: "Florida Dental Centers Largo", kpis: { confirmation_rate: 86.14, show_rate: 92.53, hygiene_reappt_rate: 74.07, case_acceptance: 53.55, case_completion: 38.94, otc_collection: 95.24, days_to_claim: 3.28, clean_claim: 90.64, notes_signed: 96.42, ledger_posted: 95.31 } },
  { oid: 214, name: "Florida Dental Centers Pinellas Park", kpis: { confirmation_rate: 81.04, show_rate: 90.83, hygiene_reappt_rate: 68.06, case_acceptance: 51.1, case_completion: 37.59, otc_collection: 92.36, days_to_claim: 3.03, clean_claim: 90.31, notes_signed: 95.7, ledger_posted: 94.56 } },
  { oid: 216, name: "Florida Dental Centers St. Petersburg", kpis: { confirmation_rate: 83.64, show_rate: 87.39, hygiene_reappt_rate: 72.35, case_acceptance: 51.97, case_completion: 40.21, otc_collection: 94.2, days_to_claim: 5.04, clean_claim: 90.79, notes_signed: 95.15, ledger_posted: 94.82 } },
  { oid: 119, name: "Jupiter Dental Group", kpis: { confirmation_rate: 89.91, show_rate: 94.44, hygiene_reappt_rate: 73.19, case_acceptance: 80.8, case_completion: 34.61, otc_collection: 96.4, days_to_claim: 3.11, clean_claim: 92.43, notes_signed: 97.44, ledger_posted: 97.63 } },
  { oid: 154, name: "Main Street Aventura", kpis: { confirmation_rate: 88.61, show_rate: 91.63, hygiene_reappt_rate: 81.22, case_acceptance: 86.31, case_completion: 82.41, otc_collection: 97.88, days_to_claim: 2.48, clean_claim: 95.69, notes_signed: 97.42, ledger_posted: 97.61 } },
  { oid: 144, name: "Main Street Baptist Medical Plaza", kpis: { confirmation_rate: 92.19, show_rate: 89.54, hygiene_reappt_rate: 75.01, case_acceptance: 97.19, case_completion: 97.19, otc_collection: 90.19, days_to_claim: 1.82, clean_claim: 96.06, notes_signed: 97.7, ledger_posted: 97.44 } },
  { oid: 139, name: "Main Street Cape Coral", kpis: { confirmation_rate: 88.4, show_rate: 89.55, hygiene_reappt_rate: 74.53, case_acceptance: 72.85, case_completion: 29.16, otc_collection: 97.85, days_to_claim: 2.33, clean_claim: 93.66, notes_signed: 96.0, ledger_posted: 97.29 } },
  { oid: 124, name: "Main Street Clermont", kpis: { confirmation_rate: 86.87, show_rate: 90.64, hygiene_reappt_rate: 74.58, case_acceptance: 68.76, case_completion: 54.3, otc_collection: 97.51, days_to_claim: 1.71, clean_claim: 93.69, notes_signed: 96.38, ledger_posted: 97.93 } },
  { oid: 136, name: "Main Street Fort Myers", kpis: { confirmation_rate: 86.33, show_rate: 91.8, hygiene_reappt_rate: 78.19, case_acceptance: 63.9, case_completion: 43.19, otc_collection: 98.18, days_to_claim: 2.83, clean_claim: 94.44, notes_signed: 96.73, ledger_posted: 97.21 } },
  { oid: 153, name: "Main Street Homestead", kpis: { confirmation_rate: 87.77, show_rate: 87.64, hygiene_reappt_rate: 79.92, case_acceptance: 82.95, case_completion: 80.93, otc_collection: 96.49, days_to_claim: 1.78, clean_claim: 92.47, notes_signed: 97.64, ledger_posted: 97.88 } },
  { oid: 145, name: "Main Street Kendall", kpis: { confirmation_rate: 89.25, show_rate: 94.82, hygiene_reappt_rate: 80.42, case_acceptance: 75.65, case_completion: 74.02, otc_collection: 99.19, days_to_claim: 3.62, clean_claim: 95.85, notes_signed: 96.84, ledger_posted: 97.21 } },
  { oid: 140, name: "Main Street London Square", kpis: { confirmation_rate: 89.44, show_rate: 89.5, hygiene_reappt_rate: 76.35, case_acceptance: 83.55, case_completion: 33.72, otc_collection: 98.17, days_to_claim: 2.58, clean_claim: 94.54, notes_signed: 96.46, ledger_posted: 96.86 } },
  { oid: 132, name: "Main Street Miami Beach", kpis: { confirmation_rate: 92.55, show_rate: 94.04, hygiene_reappt_rate: 80.06, case_acceptance: 86.6, case_completion: 84.26, otc_collection: 98.18, days_to_claim: 2.6, clean_claim: 94.02, notes_signed: 98.12, ledger_posted: 98.07 } },
  { oid: 129, name: "Main Street Miami Lakes", kpis: { confirmation_rate: 92.31, show_rate: 92.15, hygiene_reappt_rate: 78.76, case_acceptance: 87.18, case_completion: 84.01, otc_collection: 99.23, days_to_claim: 1.58, clean_claim: 93.88, notes_signed: 97.29, ledger_posted: 97.16 } },
  { oid: 135, name: "Main Street Naples", kpis: { confirmation_rate: 87.22, show_rate: 92.31, hygiene_reappt_rate: 78.61, case_acceptance: 79.28, case_completion: 67.89, otc_collection: 96.5, days_to_claim: 2.09, clean_claim: 95.5, notes_signed: 96.42, ledger_posted: 96.98 } },
  { oid: 125, name: "Main Street Orange City", kpis: { confirmation_rate: 88.6, show_rate: 90.66, hygiene_reappt_rate: 70.62, case_acceptance: 60.11, case_completion: 45.26, otc_collection: 98.28, days_to_claim: 2.03, clean_claim: 92.34, notes_signed: 96.37, ledger_posted: 97.32 } },
  { oid: 142, name: "Main Street Orthodontics Of Miami Lakes", kpis: { confirmation_rate: 87.89, show_rate: 90.51, hygiene_reappt_rate: 74.23, case_acceptance: 88.48, case_completion: 88.41, otc_collection: 84.82, days_to_claim: 1.86, clean_claim: 92.92, notes_signed: 97.46, ledger_posted: 96.33 } },
  { oid: 146, name: "Main Street Palmetto Bay", kpis: { confirmation_rate: 82.94, show_rate: 82.59, hygiene_reappt_rate: 70.0, case_acceptance: 77.43, case_completion: 46.35, otc_collection: 99.77, days_to_claim: 3.73, clean_claim: 94.29, notes_signed: 96.29, ledger_posted: 95.89 } },
  { oid: 149, name: "Main Street Plantation", kpis: { confirmation_rate: 84.91, show_rate: 72.54, hygiene_reappt_rate: 67.98, case_acceptance: 79.45, case_completion: 42.84, otc_collection: 96.9, days_to_claim: 5.47, clean_claim: 90.22, notes_signed: 95.3, ledger_posted: 95.96 } },
  { oid: 105, name: "Main Street South Broward", kpis: { confirmation_rate: 84.27, show_rate: 86.56, hygiene_reappt_rate: 76.73, case_acceptance: 74.47, case_completion: 60.54, otc_collection: 95.22, days_to_claim: 3.32, clean_claim: 94.26, notes_signed: 95.46, ledger_posted: 96.87 } },
  { oid: 210, name: "Main Street Waterford Lakes", kpis: { confirmation_rate: 89.34, show_rate: 83.17, hygiene_reappt_rate: 70.98, case_acceptance: 74.37, case_completion: 70.78, otc_collection: 91.88, days_to_claim: 1.45, clean_claim: 93.58, notes_signed: 95.81, ledger_posted: 96.47 } },
  { oid: 148, name: "Main Street Wellington", kpis: { confirmation_rate: 85.15, show_rate: 92.27, hygiene_reappt_rate: 77.0, case_acceptance: 76.89, case_completion: 36.55, otc_collection: 97.63, days_to_claim: 3.96, clean_claim: 93.99, notes_signed: 95.75, ledger_posted: 95.82 } },
  { oid: 213, name: "Main Street Windermere", kpis: { confirmation_rate: 84.09, show_rate: 93.03, hygiene_reappt_rate: 68.02, case_acceptance: 64.12, case_completion: 46.6, otc_collection: 85.6, days_to_claim: 1.95, clean_claim: 92.47, notes_signed: 96.09, ledger_posted: 97.25 } },
  { oid: 126, name: "Main Street Winter Park", kpis: { confirmation_rate: 86.02, show_rate: 82.97, hygiene_reappt_rate: 75.71, case_acceptance: 69.34, case_completion: 54.52, otc_collection: 94.99, days_to_claim: 1.86, clean_claim: 92.7, notes_signed: 95.68, ledger_posted: 97.33 } },
  { oid: 189, name: "Manatee Dental SR64", kpis: { confirmation_rate: 87.79, show_rate: 94.75, hygiene_reappt_rate: 73.13, case_acceptance: 71.35, case_completion: 30.59, otc_collection: 96.68, days_to_claim: 1.63, clean_claim: 94.41, notes_signed: 95.95, ledger_posted: 97.32 } },
  { oid: 159, name: "Miami Beach Dental Center", kpis: { confirmation_rate: 90.67, show_rate: 93.41, hygiene_reappt_rate: 76.82, case_acceptance: 66.14, case_completion: 42.67, otc_collection: 97.15, days_to_claim: 2.68, clean_claim: 93.19, notes_signed: 97.58, ledger_posted: 96.46 } },
  { oid: 109, name: "Miami Center For Cosmetic & Implant Dentistry", kpis: { confirmation_rate: 86.28, show_rate: 84.15, hygiene_reappt_rate: 68.06, case_acceptance: 73.67, case_completion: 44.05, otc_collection: 94.82, days_to_claim: 3.07, clean_claim: 92.3, notes_signed: 96.0, ledger_posted: 95.99 } },
  { oid: 134, name: "Naples Center For Cosmetic Dentistry", kpis: { confirmation_rate: 80.51, show_rate: 95.53, hygiene_reappt_rate: 67.35, case_acceptance: 69.03, case_completion: 57.21, otc_collection: 79.9, days_to_claim: 2.99, clean_claim: 93.33, notes_signed: 97.08, ledger_posted: 96.19 } },
  { oid: 192, name: "Oceans Dental Group", kpis: { confirmation_rate: 84.77, show_rate: 92.6, hygiene_reappt_rate: 75.62, case_acceptance: 69.49, case_completion: 42.57, otc_collection: 94.28, days_to_claim: 1.68, clean_claim: 92.61, notes_signed: 96.99, ledger_posted: 97.1 } },
  { oid: 113, name: "Palm Dental Center", kpis: { confirmation_rate: 89.69, show_rate: 91.92, hygiene_reappt_rate: 71.56, case_acceptance: 64.2, case_completion: 37.26, otc_collection: 94.63, days_to_claim: 2.03, clean_claim: 91.2, notes_signed: 96.76, ledger_posted: 96.83 } },
  { oid: 112, name: "Palmetto Center For Dental Specialties", kpis: { confirmation_rate: 89.24, show_rate: 93.71, hygiene_reappt_rate: 74.49, case_acceptance: 72.12, case_completion: 47.19, otc_collection: 90.28, days_to_claim: 1.85, clean_claim: 91.88, notes_signed: 97.22, ledger_posted: 96.96 } },
  { oid: 161, name: "Plantation Dental Services", kpis: { confirmation_rate: 88.66, show_rate: 84.69, hygiene_reappt_rate: 78.09, case_acceptance: 81.12, case_completion: 49.89, otc_collection: 96.39, days_to_claim: 2.68, clean_claim: 93.48, notes_signed: 97.28, ledger_posted: 96.06 } },
  { oid: 181, name: "Rockledge Dental", kpis: { confirmation_rate: 85.49, show_rate: 90.82, hygiene_reappt_rate: 75.28, case_acceptance: 67.6, case_completion: 54.98, otc_collection: 94.14, days_to_claim: 2.82, clean_claim: 94.13, notes_signed: 95.7, ledger_posted: 95.75 } },
  { oid: 118, name: "Sunrise Dental Group", kpis: { confirmation_rate: 87.21, show_rate: 92.32, hygiene_reappt_rate: 72.91, case_acceptance: 62.04, case_completion: 33.96, otc_collection: 97.9, days_to_claim: 3.34, clean_claim: 90.81, notes_signed: 96.87, ledger_posted: 96.88 } },
  { oid: 193, name: "Superior Dental", kpis: { confirmation_rate: 86.14, show_rate: 80.89, hygiene_reappt_rate: 74.26, case_acceptance: 62.23, case_completion: 53.01, otc_collection: 94.64, days_to_claim: 1.7, clean_claim: 92.73, notes_signed: 96.56, ledger_posted: 97.13 } },
  { oid: 190, name: "Sweetwater Smiles", kpis: { confirmation_rate: 83.65, show_rate: 94.76, hygiene_reappt_rate: 72.99, case_acceptance: 64.98, case_completion: 45.33, otc_collection: 94.88, days_to_claim: 2.15, clean_claim: 91.76, notes_signed: 96.39, ledger_posted: 97.17 } },
  { oid: 203, name: "Tioga Dental At Celebration Pointe", kpis: { confirmation_rate: 83.3, show_rate: 94.09, hygiene_reappt_rate: 73.62, case_acceptance: 64.61, case_completion: 40.24, otc_collection: 96.12, days_to_claim: 2.14, clean_claim: 94.47, notes_signed: 97.68, ledger_posted: 96.61 } },
  { oid: 133, name: "Towncare Dental Associates Of Cape Coral", kpis: { confirmation_rate: 88.07, show_rate: 91.5, hygiene_reappt_rate: 72.66, case_acceptance: 69.61, case_completion: 51.66, otc_collection: 96.86, days_to_claim: 1.27, clean_claim: 95.17, notes_signed: 96.37, ledger_posted: 97.9 } },
  { oid: 122, name: "Towncare Dental Of Altamonte Springs", kpis: { confirmation_rate: 82.97, show_rate: 85.66, hygiene_reappt_rate: 75.02, case_acceptance: 51.12, case_completion: 42.12, otc_collection: 93.64, days_to_claim: 1.98, clean_claim: 92.12, notes_signed: 96.47, ledger_posted: 95.4 } },
  { oid: 138, name: "Towncare Dental Of Bonita Springs", kpis: { confirmation_rate: 81.86, show_rate: 84.22, hygiene_reappt_rate: 71.71, case_acceptance: 61.95, case_completion: 49.71, otc_collection: 88.01, days_to_claim: 2.9, clean_claim: 91.16, notes_signed: 95.28, ledger_posted: 96.02 } },
  { oid: 127, name: "Towncare Dental Of Clermont", kpis: { confirmation_rate: 88.88, show_rate: 92.28, hygiene_reappt_rate: 70.24, case_acceptance: 60.68, case_completion: 33.59, otc_collection: 97.05, days_to_claim: 2.03, clean_claim: 92.87, notes_signed: 95.83, ledger_posted: 95.38 } },
  { oid: 116, name: "Towncare Dental Of Cooper City", kpis: { confirmation_rate: 86.47, show_rate: 95.75, hygiene_reappt_rate: 72.99, case_acceptance: 67.18, case_completion: 40.07, otc_collection: 97.46, days_to_claim: 1.95, clean_claim: 94.35, notes_signed: 96.62, ledger_posted: 97.55 } },
  { oid: 158, name: "Towncare Dental Of Cutler Bay", kpis: { confirmation_rate: 84.21, show_rate: 87.93, hygiene_reappt_rate: 69.82, case_acceptance: 72.28, case_completion: 37.68, otc_collection: 98.34, days_to_claim: 4.86, clean_claim: 91.59, notes_signed: 96.48, ledger_posted: 96.32 } },
  { oid: 123, name: "Towncare Dental Of Forest Hill", kpis: { confirmation_rate: 84.66, show_rate: 92.91, hygiene_reappt_rate: 70.54, case_acceptance: 48.93, case_completion: 34.45, otc_collection: 94.86, days_to_claim: 4.37, clean_claim: 92.8, notes_signed: 95.1, ledger_posted: 96.21 } },
  { oid: 130, name: "Towncare Dental Of Fort Myers", kpis: { confirmation_rate: 81.74, show_rate: 85.0, hygiene_reappt_rate: 67.24, case_acceptance: 56.21, case_completion: 45.68, otc_collection: 92.23, days_to_claim: 1.86, clean_claim: 91.92, notes_signed: 95.64, ledger_posted: 95.09 } },
  { oid: 104, name: "Towncare Dental Of Ft. Lauderdale, PLLC", kpis: { confirmation_rate: 81.8, show_rate: 90.0, hygiene_reappt_rate: 69.87, case_acceptance: 55.91, case_completion: 30.65, otc_collection: 95.07, days_to_claim: 4.18, clean_claim: 91.63, notes_signed: 94.67, ledger_posted: 96.56 } },
  { oid: 156, name: "Towncare Dental Of Hialeah Square", kpis: { confirmation_rate: 87.93, show_rate: 98.98, hygiene_reappt_rate: 82.01, case_acceptance: 61.71, case_completion: 57.41, otc_collection: 95.82, days_to_claim: 0.48, clean_claim: 93.04, notes_signed: 98.28, ledger_posted: 97.81 } },
  { oid: 117, name: "Towncare Dental Of Lauderhill", kpis: { confirmation_rate: 88.59, show_rate: 88.7, hygiene_reappt_rate: 71.67, case_acceptance: 70.06, case_completion: 25.94, otc_collection: 97.35, days_to_claim: 2.29, clean_claim: 92.12, notes_signed: 97.42, ledger_posted: 97.12 } },
  { oid: 201, name: "Towncare Dental Of London Square", kpis: { confirmation_rate: 86.26, show_rate: 93.75, hygiene_reappt_rate: 71.36, case_acceptance: 71.74, case_completion: 45.09, otc_collection: 97.92, days_to_claim: 0.99, clean_claim: 93.17, notes_signed: 98.07, ledger_posted: 96.63 } },
  { oid: 131, name: "Towncare Dental Of Naples", kpis: { confirmation_rate: 84.5, show_rate: 91.65, hygiene_reappt_rate: 65.3, case_acceptance: 51.42, case_completion: 39.59, otc_collection: 92.0, days_to_claim: 4.97, clean_claim: 91.25, notes_signed: 94.55, ledger_posted: 95.03 } },
  { oid: 108, name: "Towncare Dental Of Pinecrest", kpis: { confirmation_rate: 83.46, show_rate: 93.23, hygiene_reappt_rate: 74.52, case_acceptance: 74.16, case_completion: 69.9, otc_collection: 93.17, days_to_claim: 6.74, clean_claim: 91.41, notes_signed: 95.99, ledger_posted: 95.17 } },
  { oid: 150, name: "Towncare Dental Of West Kendall", kpis: { confirmation_rate: 85.23, show_rate: 86.39, hygiene_reappt_rate: 68.79, case_acceptance: 62.02, case_completion: 34.53, otc_collection: 95.01, days_to_claim: 3.24, clean_claim: 91.78, notes_signed: 95.72, ledger_posted: 95.63 } },
  { oid: 166, name: "Walding And Associates", kpis: { confirmation_rate: 88.87, show_rate: 88.78, hygiene_reappt_rate: 72.22, case_acceptance: 64.87, case_completion: 47.64, otc_collection: 95.43, days_to_claim: 1.35, clean_claim: 91.59, notes_signed: 96.43, ledger_posted: 96.63 } },
];

/**
 * Compute per-KPI averages across all offices. Used for the "All Locations"
 * view so the aggregate represents real arithmetic across the dataset.
 */
function avgKpisAcrossOffices(offices) {
  if (!offices || offices.length === 0) return {};
  const keys = Object.keys(offices[0].kpis);
  const out = {};
  keys.forEach((k) => {
    out[k] = offices.reduce((s, o) => s + o.kpis[k], 0) / offices.length;
  });
  return out;
}

/**
 * Default demo dataset the app loads on first render.
 *
 * The __precalc flag tells App.jsx to use buildResultsFromPrecalculated()
 * instead of the raw-row calculateKPIs() path. Uploaded Excel workbooks
 * still flow through the original raw-row path unchanged.
 */
export const ENGINEER_SAMPLE_DATA = {
  __precalc: true,
  offices: ENGINEER_SAMPLE_OFFICES,
  // Location list derived from the offices, with "All Locations" prepended
  locations: [
    { id: "ALL", name: "All Locations" },
    ...ENGINEER_SAMPLE_OFFICES.map((o) => ({
      id: String(o.oid),
      name: o.name,
    })),
  ],
};

/**
 * Adapter: converts pre-calculated per-office KPIs into the same `results`
 * shape calculateKPIs() returns, so KPICard / focus areas / slides / health
 * score consume it without any modification.
 *
 * KPI_CONFIG is passed in to keep this module decoupled from App.jsx
 * internals (single source of truth still lives there).
 */
export function buildResultsFromPrecalculated(data, locationId, KPI_CONFIG) {
  const offices = data && data.offices ? data.offices : [];
  let kpiValues;
  if (!locationId || locationId === "ALL") {
    kpiValues = avgKpisAcrossOffices(offices);
  } else {
    const match = offices.find((o) => String(o.oid) === String(locationId));
    kpiValues = match ? match.kpis : avgKpisAcrossOffices(offices);
  }

  const results = {};
  Object.entries(kpiValues).forEach(([id, v]) => {
    const cfg = KPI_CONFIG[id];
    if (!cfg) return;
    const status = cfg.getStatus(v);
    // Same deterministic trend signal calculateKPIs uses, so trend chips
    // render with stable values across both paths.
    const seed =
      (id.length * 7 +
        (locationId || "ALL").length * 13 +
        Math.floor(v * 10)) %
      17;
    const delta = (seed - 8) / 8;
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
