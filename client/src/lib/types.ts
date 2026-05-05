export type ReviewStatus = "DRAFT" | "IN REVIEW" | "NEEDS REWORK" | "APPROVED" | "REJECTED";

/** Shape returned by the Supabase `worlds` table */
export interface SupabaseWorld {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  creator_id: string;
  payload: WorldPayload | null;
}

/** Shape returned by `rpc('get_review_queue_worlds')` */
export interface QueueWorld extends SupabaseWorld {
  creator_email: string;
}

export interface WorldPayload {
  meta?: {
    id?: string;
    name?: string;
    type?: string;
    method?: string;
    period?: string;
    archetype?: string;
    totalFiles?: number;
    coreFiles?: number;
    noiseFiles?: number;
    tier?: string;
    tasks?: number;
  };
  review?: {
    status?: string;
    reviewer_count?: number;
  };
  taskPrompt?: string;
  rubric?: RubricItem[];
  uploadedFiles?: UploadedFile[];
  transactions?: unknown[];
  chartOfAccounts?: unknown[];
  invoices?: unknown;
}

export interface RubricItem {
  n?: number;
  type?: string;
  label?: string;
  text?: string;
}

export interface UploadedFile {
  displayLabel?: string;
  fileName?: string;
  type?: string;
  customType?: string;
  notes?: string;
}

export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  role: "admin" | "expert" | "grader";
}

/** Display-ready world row used inside the UI */
export interface DisplayWorld {
  id: string;
  name: string;
  creatorId: string;
  creatorEmail?: string;
  status: ReviewStatus;
  reviewersDone: number;
  reviewersTotal: number;
  isPublished: boolean;
  updatedAt: string;
  payload: WorldPayload | null;
}

export function toReviewStatus(raw: string | undefined): ReviewStatus {
  const s = String(raw || "draft").toLowerCase();
  if (s === "in_review") return "IN REVIEW";
  if (s === "approved") return "APPROVED";
  if (s === "needs_rework") return "NEEDS REWORK";
  if (s === "rejected") return "REJECTED";
  return "DRAFT";
}

export function toDisplayWorld(w: SupabaseWorld | QueueWorld): DisplayWorld {
  const review = w.payload?.review;
  const status = w.is_published ? "APPROVED" : toReviewStatus(review?.status);
  return {
    id: w.id,
    name: w.title || "Untitled world",
    creatorId: w.creator_id,
    creatorEmail: (w as QueueWorld).creator_email,
    status,
    reviewersDone: Math.min(3, Number(review?.reviewer_count || 0)),
    reviewersTotal: 3,
    isPublished: Boolean(w.is_published),
    updatedAt: w.updated_at,
    payload: w.payload,
  };
}
