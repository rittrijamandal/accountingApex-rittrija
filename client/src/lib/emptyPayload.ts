import type { WorldPayload } from "./types";

export function emptyPayload(): WorldPayload {
  return {
    meta: {
      id: "APEX-DRAFT",
      name: "",
      type: "",
      method: "Accrual",
      period: "",
      archetype: "",
      totalFiles: 0,
      coreFiles: 0,
      noiseFiles: 0,
      tier: "Tier 2 — Execution",
      tasks: 1,
    },
    transactions: [],
    chartOfAccounts: [],
    invoices: [],
    rubric: [],
    taskPrompt: "",
    uploadedFiles: [],
  };
}
