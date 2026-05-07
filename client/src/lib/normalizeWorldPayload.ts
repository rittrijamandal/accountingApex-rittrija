import { emptyPayload } from "./emptyPayload";
import type { WorldPayload } from "./types";

/** Matches legacy `normalizePayload` from `js/world-payload.js` plus review merge. */
export function normalizeWorldPayload(raw: unknown): WorldPayload {
  const base = emptyPayload();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Record<string, unknown>;
  return {
    ...base,
    meta: { ...base.meta, ...(typeof p.meta === "object" && p.meta ? (p.meta as WorldPayload["meta"]) : {}) },
    transactions: Array.isArray(p.transactions) ? p.transactions : base.transactions,
    chartOfAccounts: Array.isArray(p.chartOfAccounts) ? p.chartOfAccounts : base.chartOfAccounts,
    invoices: p.invoices !== undefined ? p.invoices : base.invoices,
    rubric: Array.isArray(p.rubric) ? (p.rubric as WorldPayload["rubric"]) : base.rubric,
    taskPrompt: typeof p.taskPrompt === "string" ? p.taskPrompt : base.taskPrompt,
    ambiguityTypes: Array.isArray(p.ambiguityTypes) ? (p.ambiguityTypes as string[]) : base.ambiguityTypes,
    misleadingFiles: Array.isArray(p.misleadingFiles)
      ? (p.misleadingFiles as WorldPayload["misleadingFiles"])
      : base.misleadingFiles,
    uploadedFiles: Array.isArray(p.uploadedFiles) ? (p.uploadedFiles as WorldPayload["uploadedFiles"]) : base.uploadedFiles,
    review:
      typeof p.review === "object" && p.review
        ? { ...(base.review || {}), ...(p.review as WorldPayload["review"]) }
        : base.review,
  };
}
