import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { emptyPayload } from "@/lib/emptyPayload";
import { normalizeWorldPayload } from "@/lib/normalizeWorldPayload";
import { importFilesForDataRoom } from "@/lib/dataRoomFileImport";
import { SESSION_PREVIEW_WORLD_ID } from "@/lib/graderSessionPreview";
import { getSupabase } from "@/lib/supabase";
import type { UploadedFile, WorldPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Eye,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

const CUSTOM_TYPE_ID = "__custom__";

const FILE_TYPE_GROUPS = [
  {
    label: "Core Ledgers & Bank",
    options: [
      { id: "chart_of_accounts", label: "Chart of Accounts", csv: true },
      { id: "general_ledger", label: "General Ledger", csv: true },
      { id: "trial_balance", label: "Trial Balance", csv: true },
      { id: "bank_statement", label: "Bank Statement", csv: true },
    ],
  },
  {
    label: "Source Documents",
    options: [
      { id: "invoice", label: "Invoice", csv: false },
      { id: "receipt", label: "Receipt", csv: false },
      { id: "payroll_report", label: "Payroll Report", csv: false },
      { id: "tax_document", label: "Tax Document", csv: false },
    ],
  },
  {
    label: "Rules & Context",
    options: [
      { id: "expense_policy", label: "Expense Policy", csv: false },
      { id: "management_memo", label: "Management Memo", csv: false },
    ],
  },
] as const;

const CSV_SCHEMAS: Record<string, string[]> = {
  chart_of_accounts: ["Code", "Name", "Type"],
  general_ledger: ["Date", "Account", "Description", "Debit", "Credit"],
  trial_balance: ["Account", "Debit", "Credit"],
  bank_statement: ["Date", "Description", "Amount"],
};

const BUSINESS_TYPES = [
  "Agency",
  "Retail",
  "SaaS",
  "Manufacturing",
  "Healthcare",
  "Construction",
  "Non-profit",
  "Other",
];
const ARCHETYPES = [
  "Month-end close",
  "AP",
  "Tax",
  "Payroll",
  "Revenue recognition",
  "Custom",
];
const AMBIGUITY_PRESETS = [
  "Missing Document",
  "Date Mismatch",
  "Policy Violation",
  "Unclear Vendor",
  "Commingled Funds",
];

const CORE_FILE_TYPES = new Set(["chart_of_accounts", "general_ledger", "trial_balance", "bank_statement"]);

const FILEWORLD_TYPE_MAP: Record<string, string> = {
  policy: "expense_policy",
  invoice: "invoice",
  ledger: "general_ledger",
  bank: "bank_statement",
  payroll: "payroll_report",
};
const FILEWORLD_CUSTOM_LABEL: Record<string, string> = {
  workpaper: "Work Paper",
  email: "Email",
  contract: "Contract",
  spreadsheet: "Spreadsheet",
  report: "Report",
};

function uid() {
  return `f_${Math.random().toString(36).slice(2, 9)}`;
}

function worldIdPlaceholder() {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `APEX-${ym}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function getTypeMeta(typeId: string) {
  for (const group of FILE_TYPE_GROUPS) {
    const hit = group.options.find((opt) => opt.id === typeId);
    if (hit) return hit;
  }
  return { id: typeId, label: "Custom", csv: false };
}

function isCsvType(typeId: string, fileName: string) {
  const meta = getTypeMeta(typeId);
  if (meta.csv) return true;
  return /\.csv$/i.test(String(fileName || ""));
}

function schemaFor(typeId: string) {
  return CSV_SCHEMAS[typeId] || ["Column 1", "Column 2", "Column 3"];
}

function emptyGridRow(typeId: string) {
  const row: Record<string, string> = {};
  schemaFor(typeId).forEach((col) => {
    row[col] = "";
  });
  return row;
}

function normalizeUploadedFiles(list: unknown): UploadedFile[] {
  if (!Array.isArray(list)) return [];
  return list.map((f: UploadedFile) => ({
    id: f.id || uid(),
    type: f.type || "invoice",
    customType: f.customType || "",
    displayLabel: f.displayLabel || f.fileName || "",
    notes: f.notes || "",
    extractedText: f.extractedText || "",
    fileName: f.fileName || "",
    mimeType: f.mimeType || "",
    sizeBytes: Number(f.sizeBytes || 0),
    isMisleading: Boolean(f.isMisleading),
    gridRows: Array.isArray(f.gridRows) ? f.gridRows : [],
  }));
}

function mimeFromPath(p: string) {
  const ext = String(p).split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "csv") return "text/csv";
  if (ext === "xlsx" || ext === "xls") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "text/plain";
}

function fileworldFilesToUploadedFiles(files: unknown): UploadedFile[] {
  if (!Array.isArray(files)) return [];
  return files.map((f: { type?: string; path?: string; name?: string; content?: string }) => {
    const fwType = String(f.type || "");
    const mappedType = FILEWORLD_TYPE_MAP[fwType] || CUSTOM_TYPE_ID;
    return {
      id: uid(),
      type: mappedType,
      customType:
        mappedType === CUSTOM_TYPE_ID ? FILEWORLD_CUSTOM_LABEL[fwType] || fwType || "Document" : "",
      displayLabel: f.path || f.name || "",
      notes: "",
      extractedText: typeof f.content === "string" ? f.content : "",
      fileName: String(f.path || "").split("/").pop(),
      mimeType: mimeFromPath(String(f.path || "")),
      sizeBytes: typeof f.content === "string" ? f.content.length : 0,
      isMisleading: Boolean((f as { isMisleading?: boolean }).isMisleading),
      gridRows: [],
    };
  });
}

type ReviewState = {
  status: "draft" | "in_review" | "approved" | "needs_rework";
  threshold: number;
  median_score: number | null;
  combined_notes: string;
  reviewer_count: number;
};

function normalizeReviewState(payloadReview: WorldPayload["review"] | undefined): ReviewState {
  const statusRaw = String(payloadReview?.status || "draft").toLowerCase();
  const allowed: ReviewState["status"][] = ["draft", "in_review", "approved", "needs_rework"];
  const status = (allowed as string[]).includes(statusRaw)
    ? (statusRaw as ReviewState["status"])
    : "draft";
  return {
    status,
    threshold: Number(payloadReview?.threshold ?? 3.5),
    median_score: payloadReview?.median_score == null ? null : Number(payloadReview.median_score),
    combined_notes: String(payloadReview?.combined_notes || ""),
    reviewer_count: Number(payloadReview?.reviewer_count || 0),
  };
}

interface RubricRow {
  n: number;
  type: string;
  label: string;
  notes: string;
}

function makePendingUpload() {
  return {
    type: "invoice",
    customType: "",
    displayLabel: "",
    notes: "",
    extractedText: "",
    fileName: "",
    mimeType: "",
    sizeBytes: 0,
    isMisleading: false,
  };
}

function SectionCard({
  step,
  title,
  children,
  className,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40">
        <div className="label-eyebrow">{step}</div>
        <h2 className="mt-1 font-serif-display text-xl text-slate-900 tracking-tight">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function ExpertWorldEditor() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { userId, profile, loading: authLoading } = useAuth();

  const rawPayloadRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [rowPublished, setRowPublished] = useState(false);

  const [title, setTitle] = useState("");
  const [metaId, setMetaId] = useState("");
  const [businessType, setBusinessType] = useState("Agency");
  const [accountingMethod, setAccountingMethod] = useState("Accrual");
  const [archetype, setArchetype] = useState("Month-end close");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [browseLayout, setBrowseLayout] = useState<"list" | "grid">("list");
  const [taskPrompt, setTaskPrompt] = useState("");
  const [availableAmbiguityTags, setAvailableAmbiguityTags] = useState<string[]>(() => [...AMBIGUITY_PRESETS]);
  const [selectedAmbiguities, setSelectedAmbiguities] = useState<string[]>([]);
  const [customAmbiguityInput, setCustomAmbiguityInput] = useState("");
  const [rubric, setRubric] = useState<RubricRow[]>([{ n: 1, type: "det", label: "", notes: "" }]);
  const [review, setReview] = useState<ReviewState>(() => normalizeReviewState(undefined));
  const [reworkUnlocked, setReworkUnlocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(makePendingUpload);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const isAdmin = profile?.role === "admin";

  const locked = useMemo(() => {
    if (rowPublished) return true;
    if (review.status === "in_review" || review.status === "approved") return true;
    if (review.status === "needs_rework") return !reworkUnlocked;
    return false;
  }, [rowPublished, review.status, reworkUnlocked]);

  useEffect(() => {
    if (authLoading || !userId || !worldId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadErr(null);
      try {
        const sb = await getSupabase();
        const { data: row, error } = await sb.from("worlds").select("*").eq("id", worldId).maybeSingle();
        if (cancelled) return;
        if (error || !row) {
          setLoadErr(error?.message || "World not found or no access.");
          setLoading(false);
          return;
        }
        if (!isAdmin && row.creator_id !== userId) {
          setLoadErr("You can only edit worlds you created.");
          setLoading(false);
          return;
        }

        rawPayloadRef.current = row.payload;
        const raw = row.payload as Record<string, unknown> | null;
        const isFw = Array.isArray(raw?.files);
        const payload = normalizeWorldPayload(raw);

        setRowPublished(row.is_published === true);
        setTitle(row.title || "");
        setMetaId(String(payload.meta?.id || "APEX-DRAFT"));
        setBusinessType(payload.meta?.type || "Agency");
        setAccountingMethod(payload.meta?.method || "Accrual");
        setArchetype(payload.meta?.archetype || "Month-end close");

        const files = isFw ? fileworldFilesToUploadedFiles(raw?.files) : normalizeUploadedFiles(payload.uploadedFiles);
        setUploadedFiles(files);

        setTaskPrompt(
          payload.taskPrompt ||
            (isFw && typeof (raw as { meta?: { taskPrompt?: string } })?.meta?.taskPrompt === "string"
              ? (raw as { meta: { taskPrompt: string } }).meta.taskPrompt
              : "") ||
            "",
        );

        const amb = Array.isArray(payload.ambiguityTypes) ? [...payload.ambiguityTypes] : [];
        setSelectedAmbiguities(amb);
        const pool = [...AMBIGUITY_PRESETS];
        amb.forEach((tag) => {
          if (!pool.includes(tag)) pool.push(tag);
        });
        setAvailableAmbiguityTags(pool);

        const rub = payload.rubric;
        if (Array.isArray(rub) && rub.length) {
          setRubric(
            rub.map((r, i) => ({
              n: r.n ?? i + 1,
              type: r.type || "det",
              label: r.label || "",
              notes: r.text || "",
            })),
          );
        } else {
          setRubric([{ n: 1, type: "det", label: "", notes: "" }]);
        }

        setReview(normalizeReviewState(payload.review));
        setReworkUnlocked(false);
        if (files.length) setSelectedFileId(files[0].id || null);
      } catch (e) {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : "Failed to load world.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, userId, worldId, profile?.role]);

  const collectPayload = useCallback((): WorldPayload => {
    const raw = rawPayloadRef.current;
    const isFw = Array.isArray((raw as { files?: unknown })?.files);
    const basePayload =
      isFw && raw && typeof raw === "object" ? { ...(raw as object) } : normalizeWorldPayload(raw);

    return {
      ...(basePayload as WorldPayload),
      meta: {
        ...((basePayload as WorldPayload).meta || {}),
        id: metaId.trim() || worldIdPlaceholder(),
        name: title.trim() || "Untitled world",
        type: businessType,
        method: accountingMethod,
        archetype,
        totalFiles: uploadedFiles.length,
        coreFiles: uploadedFiles.filter((f) => CORE_FILE_TYPES.has(f.type || "")).length,
        noiseFiles: 0,
        tasks: 1,
      },
      taskPrompt,
      ambiguityTypes: [...selectedAmbiguities],
      misleadingFiles: uploadedFiles
        .filter((f) => f.isMisleading)
        .map((f) => ({
          file: f.displayLabel || f.fileName || "Untitled file",
          why: f.notes || "Marked by expert as red herring",
        })),
      uploadedFiles: uploadedFiles.map((f) => ({
        id: f.id,
        type: f.type,
        customType: f.customType,
        displayLabel: f.displayLabel,
        notes: f.notes,
        extractedText: f.extractedText,
        fileName: f.fileName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        isMisleading: Boolean(f.isMisleading),
        gridRows: Array.isArray(f.gridRows) ? f.gridRows : [],
      })),
      rubric: rubric.map((r, i) => ({
        n: Number(r.n || i + 1),
        type: r.type || "det",
        label: r.label || "",
        text: r.notes || "",
      })),
      review: {
        status: review.status,
        threshold: review.threshold,
        median_score: review.median_score,
        combined_notes: review.combined_notes,
        reviewer_count: review.reviewer_count,
      },
    };
  }, [
    metaId,
    title,
    businessType,
    accountingMethod,
    archetype,
    uploadedFiles,
    taskPrompt,
    selectedAmbiguities,
    rubric,
    review,
  ]);

  const saveWorld = async (mode: "draft" | "publish", reviewOverride?: Partial<ReviewState>) => {
    if (!worldId) return;
    setSaveStatus("Saving…");
    let worldPayload = collectPayload();
    if (reviewOverride && typeof reviewOverride === "object") {
      worldPayload = {
        ...worldPayload,
        review: { ...(worldPayload.review || {}), ...reviewOverride },
      };
    }
    const updates: {
      title: string;
      payload: WorldPayload;
      is_published?: boolean;
    } = {
      title: title.trim() || "Untitled world",
      payload: worldPayload,
    };
    if (reviewOverride?.status && reviewOverride.status !== "draft") updates.is_published = false;
    if (mode === "publish") updates.is_published = true;

    const sb = await getSupabase();
    const { data: updated, error: upErr } = await sb
      .from("worlds")
      .update(updates)
      .eq("id", worldId)
      .select("id,is_published")
      .maybeSingle();

    if (upErr) {
      setSaveStatus(upErr.message);
      return false;
    }
    if (!updated) {
      setSaveStatus("Save did not apply. Check permissions.");
      return false;
    }
    setRowPublished(updated.is_published === true);
    rawPayloadRef.current = worldPayload;
    setSaveStatus(mode === "publish" ? "Published" : "Draft saved");
    setTimeout(() => setSaveStatus(""), 2200);
    return true;
  };

  const toggleAmbiguity = (tag: string) => {
    setSelectedAmbiguities((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomAmbiguity = () => {
    const t = customAmbiguityInput.trim();
    if (!t) return;
    setAvailableAmbiguityTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setSelectedAmbiguities((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setCustomAmbiguityInput("");
  };

  const openSampleViewer = () => {
    const snap = collectPayload();
    const activeWorld = {
      meta: snap.meta || emptyPayload().meta,
      transactions: snap.transactions || [],
      chartOfAccounts: snap.chartOfAccounts || [],
      invoices: snap.invoices || [],
      rubric: snap.rubric || [],
      taskPrompt: snap.taskPrompt,
      ambiguityTypes: snap.ambiguityTypes,
      misleadingFiles: snap.misleadingFiles,
      uploadedFiles: snap.uploadedFiles || [],
    };
    try {
      sessionStorage.setItem("apex_viewer_mode", "expert-world-preview");
      sessionStorage.setItem("apex_viewer_return_href", `/expert/editor/${worldId}`);
      sessionStorage.setItem("apex_active_world", JSON.stringify(activeWorld));
    } catch {
      /* ignore */
    }
    navigate(`/grader/workspace?id=${SESSION_PREVIEW_WORLD_ID}&noRun=1`);
  };

  const submitForReview = async () => {
    if (review.status !== "draft") return;
    const ok = await saveWorld("draft", {
      status: "in_review",
      median_score: null,
      combined_notes: "",
      reviewer_count: 0,
    });
    if (ok) {
      setReview((r) => ({
        ...r,
        status: "in_review",
        median_score: null,
        combined_notes: "",
        reviewer_count: 0,
      }));
    }
  };

  const editAndResubmit = async () => {
    const ok = await saveWorld("draft", {
      status: "draft",
      median_score: null,
      combined_notes: "",
      reviewer_count: 0,
    });
    if (ok) {
      setReworkUnlocked(true);
      setReview((r) => ({
        ...r,
        status: "draft",
        median_score: null,
        combined_notes: "",
        reviewer_count: 0,
      }));
    }
  };

  const saveNewUpload = () => {
    const p = pendingUpload;
    const file: UploadedFile = {
      id: uid(),
      type: p.type,
      customType: p.customType || "",
      displayLabel: p.displayLabel || p.fileName || "Untitled file",
      notes: p.notes || "",
      extractedText: p.extractedText || "",
      fileName: p.fileName || "",
      mimeType: p.mimeType || "",
      sizeBytes: Number(p.sizeBytes || 0),
      isMisleading: Boolean(p.isMisleading),
      gridRows: isCsvType(p.type, p.fileName) ? [emptyGridRow(p.type)] : [],
    };
    setUploadedFiles((prev) => [...prev, file]);
    setSelectedFileId(file.id || null);
    setUploadOpen(false);
    setPendingUpload(makePendingUpload());
  };

  const updateFile = (id: string, patch: Partial<UploadedFile>) => {
    setUploadedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedFileId((cur) => (cur === id ? null : cur));
  };

  const selectedFile = uploadedFiles.find((f) => f.id === selectedFileId) || null;

  const flatTypeOptions = useMemo(() => {
    const out: { id: string; label: string }[] = [];
    FILE_TYPE_GROUPS.forEach((g) => {
      g.options.forEach((o) => out.push({ id: o.id, label: `${g.label.split(" ")[0]} · ${o.label}` }));
    });
    out.push({ id: CUSTOM_TYPE_ID, label: "Custom type…" });
    return out;
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [dragActive, setDragActive] = useState(false);
  const [importNote, setImportNote] = useState("");

  const handleImported = async (files: FileList | File[] | null) => {
    if (!files?.length || locked) return;
    setImportNote("Importing…");
    try {
      const rows = await importFilesForDataRoom(files);
      if (!rows.length) {
        setImportNote("No supported files found.");
        setTimeout(() => setImportNote(""), 3000);
        return;
      }
      setUploadedFiles((prev) => [...prev, ...rows]);
      setImportNote(`Added ${rows.length} document${rows.length === 1 ? "" : "s"}`);
      setSelectedFileId(rows[rows.length - 1]?.id ?? null);
      setTimeout(() => setImportNote(""), 4000);
    } catch (e) {
      setImportNote(e instanceof Error ? e.message : "Import failed");
    }
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    setDragActive(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setDragActive(false);
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setDragActive(false);
    await handleImported(e.dataTransfer.files);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (loadErr) {
    return (
      <AppShell sidebar={false}>
        <div className="p-8 max-w-lg">
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm">{loadErr}</div>
          <Link
            to="/expert"
            className="inline-flex mt-6 text-sm font-semibold text-indigo-700 hover:underline"
          >
            ← Back to Expert Home
          </Link>
        </div>
      </AppShell>
    );
  }

  const reviewBadgeLabel =
    review.status === "in_review"
      ? "In review"
      : review.status === "approved"
        ? "Approved"
        : review.status === "needs_rework"
          ? "Needs rework"
          : rowPublished
            ? "Published"
            : "Draft";

  return (
    <AppShell sidebar={false}>
      <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
        <header className="glass-header sticky top-0 z-20 shrink-0 border-b border-slate-200/60 px-6 py-3 flex flex-wrap items-center gap-3">
          <Link
            to="/expert"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Expert Home
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div className="min-w-0">
            <div className="label-eyebrow">Editing</div>
            <div className="font-serif-display text-lg text-slate-900 truncate">{title || "Untitled world"}</div>
          </div>
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full text-xs uppercase tracking-wider font-semibold"
            onClick={openSampleViewer}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Grader preview
          </Button>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider border",
              rowPublished && review.status === "draft"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-200",
            )}
          >
            {reviewBadgeLabel}
          </span>
          {saveStatus ? (
            <span className="text-xs text-slate-500 max-w-[200px] truncate">{saveStatus}</span>
          ) : null}
        </header>

        <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
          <ScrollArea className="flex-1 min-h-[42vh] lg:min-h-0 lg:w-1/2 lg:max-w-[50%] border-b lg:border-b-0 lg:border-r border-slate-200/80">
            <div className="px-5 md:px-6 py-6 space-y-6 pb-12">
            {review.status === "needs_rework" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
                <div className="font-semibold">Needs rework</div>
                <p className="mt-1 text-amber-900/90">
                  Median: {review.median_score == null ? "—" : Number(review.median_score).toFixed(1)} / 5 — Threshold:{" "}
                  {review.threshold.toFixed(1)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-amber-900/80">{review.combined_notes || "No reviewer notes."}</p>
                {review.status === "needs_rework" && !reworkUnlocked && (
                  <Button type="button" variant="outline" size="sm" className="mt-3 rounded-full" onClick={editAndResubmit}>
                    Edit &amp; resubmit
                  </Button>
                )}
              </div>
            )}

            <SectionCard step="Step 1" title="World setup">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="world-name">World name</Label>
                  <Input
                    id="world-name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={locked}
                    className="rounded-xl"
                    placeholder="Q1 Close — Northwind Services"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="world-id">World ID</Label>
                  <Input
                    id="world-id"
                    value={metaId}
                    onChange={(e) => setMetaId(e.target.value)}
                    disabled={locked}
                    className="rounded-xl font-mono text-xs"
                    placeholder={worldIdPlaceholder()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business type</Label>
                  <Select value={businessType} onValueChange={setBusinessType} disabled={locked}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Accounting method</Label>
                  <Select value={accountingMethod} onValueChange={setAccountingMethod} disabled={locked}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Accrual">Accrual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Archetype</Label>
                  <Select value={archetype} onValueChange={setArchetype} disabled={locked}>
                    <SelectTrigger className="rounded-xl max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ARCHETYPES.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SectionCard>


            <SectionCard step="Step 2" title="Agent rules">
              <div className="space-y-2">
                <Label htmlFor="task-prompt">Task prompt</Label>
                <Textarea
                  id="task-prompt"
                  rows={6}
                  value={taskPrompt}
                  onChange={(e) => setTaskPrompt(e.target.value)}
                  disabled={locked}
                  className="rounded-xl resize-y min-h-[120px]"
                  placeholder="Describe the agent task…"
                />
              </div>
              <div className="mt-6 space-y-3">
                <Label>Ambiguity tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableAmbiguityTags.map((tag) => {
                    const on = selectedAmbiguities.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={locked}
                        onClick={() => toggleAmbiguity(tag)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-xs font-semibold border transition",
                          on
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2 items-center pt-2">
                  <Input
                    value={customAmbiguityInput}
                    onChange={(e) => setCustomAmbiguityInput(e.target.value)}
                    disabled={locked}
                    placeholder="Custom ambiguity tag"
                    className="rounded-full max-w-xs"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAmbiguity())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={locked}
                    onClick={addCustomAmbiguity}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add custom
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard step="Step 3" title="Grading rubric builder">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-6 text-xs text-slate-600 space-y-1">
                <div className="label-eyebrow text-slate-500">Example criterion (reference only)</div>
                <p>
                  <span className="font-semibold text-slate-800">#1 · det</span> — Verify total expense calculation — Check that
                  the agent&apos;s final calculated total matches exactly $4,250.00 based on the provided Q3 receipts.
                </p>
              </div>
              <div className="space-y-4">
                {rubric.map((r, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end rounded-2xl border border-slate-100 p-4 bg-white"
                  >
                    <div className="md:col-span-1 space-y-1">
                      <Label className="text-[10px]">#</Label>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-lg"
                        disabled={locked}
                        value={r.n}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          setRubric((rows) => rows.map((row, j) => (j === i ? { ...row, n } : row)));
                        }}
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-[10px]">Type</Label>
                      <Select
                        value={r.type}
                        disabled={locked}
                        onValueChange={(v) =>
                          setRubric((rows) => rows.map((row, j) => (j === i ? { ...row, type: v } : row)))
                        }
                      >
                        <SelectTrigger className="rounded-lg text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="det">Deterministic (exact)</SelectItem>
                          <SelectItem value="llm">LLM judge (fuzzy)</SelectItem>
                          <SelectItem value="neg">Negative constraint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-[10px]">Label</Label>
                      <Input
                        className="rounded-lg"
                        disabled={locked}
                        value={r.label}
                        onChange={(e) =>
                          setRubric((rows) => rows.map((row, j) => (j === i ? { ...row, label: e.target.value } : row)))
                        }
                      />
                    </div>
                    <div className="md:col-span-4 space-y-1">
                      <Label className="text-[10px]">Specific notes</Label>
                      <Input
                        className="rounded-lg"
                        disabled={locked}
                        value={r.notes}
                        onChange={(e) =>
                          setRubric((rows) => rows.map((row, j) => (j === i ? { ...row, notes: e.target.value } : row)))
                        }
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 rounded-full text-slate-400 hover:text-red-600"
                        disabled={locked || rubric.length <= 1}
                        onClick={() => setRubric((rows) => rows.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={locked}
                  onClick={() =>
                    setRubric((rows) => [...rows, { n: rows.length + 1, type: "det", label: "", notes: "" }])
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add criterion
                </Button>
              </div>
            </SectionCard>

            <SectionCard step="Step 4" title="Submit for review">
              {rowPublished && review.status === "draft" ? (
                <p className="text-sm text-slate-600">
                  This world is published. Unpublish from the database if you need to send it for peer review again.
                </p>
              ) : review.status === "draft" ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    When the world is ready, submit it for inter-annotator review.
                  </p>
                  <Button
                    type="button"
                    className="rounded-full bg-slate-900 hover:bg-indigo-700"
                    disabled={locked}
                    onClick={submitForReview}
                  >
                    Submit for review
                  </Button>
                </div>
              ) : review.status === "in_review" ? (
                <p className="text-sm text-slate-600">
                  This world is in review. {Math.max(0, Math.min(3, review.reviewer_count))} of 3 reviewers have scored.
                </p>
              ) : review.status === "approved" ? (
                <p className="text-sm text-slate-600">Review complete. This world is approved for grading.</p>
              ) : (
                <p className="text-sm text-slate-600">Update the world and resubmit when ready.</p>
              )}
            </SectionCard>
          </div>
        </ScrollArea>

          <div className="flex flex-1 flex-col min-h-[48vh] lg:min-h-0 lg:w-1/2 bg-slate-100/70 border-t lg:border-t-0 lg:border-l border-slate-200/80">
            <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-200/80 bg-white/95">
              <div className="min-w-0">
                <div className="label-eyebrow">Data room</div>
                <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                  Drag in files or ZIP archives — they unpack into separate documents
                </p>
              </div>
              <div className="flex-1" />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".zip,.pdf,.csv,.txt,.tsv,.xlsx,.xls,.json,.md,.html,.xml,.png,.jpg,.jpeg,.webp,.gif"
                disabled={locked}
                onChange={(e) => {
                  void handleImported(e.target.files);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                size="sm"
                className="rounded-full bg-slate-900 hover:bg-indigo-700"
                disabled={locked}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload files
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={locked}
                onClick={() => {
                  setPendingUpload(makePendingUpload());
                  setUploadOpen(true);
                }}
              >
                Add manually
              </Button>
              <div className="flex rounded-full border border-slate-200 bg-white p-0.5">
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition",
                    browseLayout === "list" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900",
                  )}
                  disabled={locked}
                  onClick={() => setBrowseLayout("list")}
                >
                  <List className="h-3.5 w-3.5 inline mr-1" />
                  List
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition",
                    browseLayout === "grid" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900",
                  )}
                  disabled={locked}
                  onClick={() => setBrowseLayout("grid")}
                >
                  <LayoutGrid className="h-3.5 w-3.5 inline mr-1" />
                  Grid
                </button>
              </div>
            </div>

            <div
              className={cn(
                "shrink-0 mx-3 mt-3 rounded-2xl border-2 border-dashed transition-colors",
                dragActive ? "border-indigo-500 bg-indigo-50/90" : "border-slate-300 bg-white/90",
              )}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <div className="px-4 py-8 text-center">
                <Upload className={cn("h-9 w-9 mx-auto mb-2", dragActive ? "text-indigo-600" : "text-slate-400")} />
                <p className="text-sm font-semibold text-slate-800">Drop files or ZIP here</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  ZIP archives unpack into separate documents. CSV and text load automatically; tune previews for PDFs and
                  binaries below.
                </p>
                {importNote ? (
                  <p className="text-xs font-medium text-indigo-600 mt-3" role="status">
                    {importNote}
                  </p>
                ) : null}
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 px-3 pb-2">
              <div className="py-2 space-y-3">
                {uploadedFiles.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-12 text-center text-sm text-slate-500">
                    No documents yet. Use <strong className="text-slate-700">Upload files</strong>, drop a{" "}
                    <strong className="text-slate-700">ZIP</strong>, or <strong className="text-slate-700">Add manually</strong>.
                  </div>
                ) : browseLayout === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadedFiles.map((f) => {
                      const typeLabel =
                        f.type === CUSTOM_TYPE_ID ? f.customType || "Custom" : getTypeMeta(f.type || "").label;
                      const active = f.id === selectedFileId;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          disabled={locked}
                          onClick={() => setSelectedFileId(f.id || null)}
                          className={cn(
                            "text-left rounded-2xl border p-3 transition hover:shadow-sm",
                            active ? "border-indigo-400 bg-white shadow-sm ring-1 ring-indigo-200" : "border-slate-200 bg-white",
                          )}
                        >
                          <div className="font-semibold text-slate-900 truncate text-sm">
                            {f.displayLabel || f.fileName || "Untitled"}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">{typeLabel}</div>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {CORE_FILE_TYPES.has(f.type || "") ? (
                              <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                Core
                              </span>
                            ) : null}
                            {f.isMisleading ? (
                              <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                Noise
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/80">
                        <tr className="text-left">
                          <th className="px-3 py-2.5 label-eyebrow">File name</th>
                          <th className="px-3 py-2.5 label-eyebrow">Type</th>
                          <th className="px-3 py-2.5 label-eyebrow">Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedFiles.map((f) => {
                          const typeLabel =
                            f.type === CUSTOM_TYPE_ID ? f.customType || "Custom" : getTypeMeta(f.type || "").label;
                          const active = f.id === selectedFileId;
                          return (
                            <tr
                              key={f.id}
                              className={cn(
                                "border-t border-slate-100 cursor-pointer hover:bg-slate-50/80",
                                active && "bg-indigo-50/50",
                              )}
                              onClick={() => !locked && setSelectedFileId(f.id || null)}
                            >
                              <td className="px-3 py-2.5 font-medium text-slate-900">
                                {f.displayLabel || f.fileName || "Untitled"}
                              </td>
                              <td className="px-3 py-2.5 text-slate-600 text-xs">{typeLabel}</td>
                              <td className="px-3 py-2.5 text-xs">
                                {CORE_FILE_TYPES.has(f.type || "") ? (
                                  <span className="mr-1 text-indigo-700 font-semibold">CORE</span>
                                ) : null}
                                {f.isMisleading ? <span className="text-rose-700 font-semibold">NOISE</span> : null}
                                {!CORE_FILE_TYPES.has(f.type || "") && !f.isMisleading ? "—" : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </ScrollArea>

            {selectedFile ? (
              <div className="shrink-0 border-t border-slate-200 bg-white max-h-[42vh] overflow-y-auto">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-900 text-sm">Document details</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full h-8"
                      disabled={locked}
                      onClick={() => selectedFile.id && removeFile(selectedFile.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Display label</Label>
                      <Input
                        value={selectedFile.displayLabel || ""}
                        disabled={locked}
                        className="rounded-xl h-9 text-sm"
                        onChange={(e) => selectedFile.id && updateFile(selectedFile.id, { displayLabel: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">File name</Label>
                      <Input
                        value={selectedFile.fileName || ""}
                        disabled={locked}
                        className="rounded-xl h-9 text-sm"
                        onChange={(e) => selectedFile.id && updateFile(selectedFile.id, { fileName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Expert notes</Label>
                      <Input
                        value={selectedFile.notes || ""}
                        disabled={locked}
                        className="rounded-xl h-9 text-sm"
                        onChange={(e) => selectedFile.id && updateFile(selectedFile.id, { notes: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Checkbox
                        id="misleading-dr"
                        checked={Boolean(selectedFile.isMisleading)}
                        disabled={locked}
                        onCheckedChange={(v) =>
                          selectedFile.id && updateFile(selectedFile.id, { isMisleading: Boolean(v) })
                        }
                      />
                      <Label htmlFor="misleading-dr" className="font-normal text-xs text-slate-700 cursor-pointer">
                        Misleading / red herring
                      </Label>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Content preview / extracted text</Label>
                      <Textarea
                        rows={6}
                        value={selectedFile.extractedText || ""}
                        disabled={locked}
                        className="rounded-xl font-mono text-xs min-h-[120px]"
                        onChange={(e) =>
                          selectedFile.id && updateFile(selectedFile.id, { extractedText: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="shrink-0 glass-header border-t border-slate-200/60 px-6 py-4 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full min-w-[120px]"
            disabled={locked}
            onClick={() => saveWorld("draft")}
          >
            Save draft
          </Button>
          <Button
            type="button"
            className="rounded-full min-w-[120px] bg-slate-900 hover:bg-indigo-700"
            disabled={locked}
            onClick={() => saveWorld("publish")}
          >
            Publish
          </Button>
        </footer>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="sm:max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif-display text-xl">Upload document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Document type</Label>
                <Select
                  value={pendingUpload.type}
                  onValueChange={(v) =>
                    setPendingUpload((p) => ({
                      ...p,
                      type: v,
                      customType: v === CUSTOM_TYPE_ID ? p.customType : "",
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {flatTypeOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {pendingUpload.type === CUSTOM_TYPE_ID ? (
                <div className="space-y-2">
                  <Label>Custom type label</Label>
                  <Input
                    className="rounded-xl"
                    value={pendingUpload.customType}
                    onChange={(e) => setPendingUpload((p) => ({ ...p, customType: e.target.value }))}
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Display label</Label>
                <Input
                  className="rounded-xl"
                  value={pendingUpload.displayLabel}
                  onChange={(e) => setPendingUpload((p) => ({ ...p, displayLabel: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>File name (optional)</Label>
                <Input
                  className="rounded-xl"
                  value={pendingUpload.fileName}
                  onChange={(e) => setPendingUpload((p) => ({ ...p, fileName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  className="rounded-xl"
                  value={pendingUpload.notes}
                  onChange={(e) => setPendingUpload((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pu-misleading"
                  checked={pendingUpload.isMisleading}
                  onCheckedChange={(v) => setPendingUpload((p) => ({ ...p, isMisleading: Boolean(v) }))}
                />
                <Label htmlFor="pu-misleading" className="font-normal cursor-pointer">
                  Misleading / noise file
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Pasted content</Label>
                <Textarea
                  rows={6}
                  className="rounded-xl font-mono text-xs"
                  value={pendingUpload.extractedText}
                  onChange={(e) => setPendingUpload((p) => ({ ...p, extractedText: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="button" className="rounded-full bg-slate-900" onClick={saveNewUpload}>
                Add to data room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
