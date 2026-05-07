import { useState } from "react";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { CsvPreview } from "@/components/apex/CsvPreview";
import { TextPdfPane } from "@/components/apex/TextPdfPane";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { getDataRoomFilesFromPayload, isExtractedTextPlaceholder } from "@/lib/dataRoomFileImport";
import type { QueueWorld, UploadedFile } from "@/lib/types";

/** Undo common HTML entities so PDF/CSV extracts read naturally (React still escapes on render). */
function decodeBasicEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isProbablyCsv(text: string): boolean {
  const t = text.trim();
  if (t.length < 8 || t.startsWith("[")) return false;
  const lines = t.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return false;
  const first = lines[0];
  const commas = first.split(",").length - 1;
  const tabs = first.split("\t").length - 1;
  return commas >= 2 || tabs >= 2;
}

/** Convert TSV to comma-separated lines so CsvPreview can parse (quoted cells safe). */
function tsvToCsv(text: string): string {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return text;
  return lines
    .map((line) =>
      line.split("\t").map((cell) => {
        const c = cell.replace(/"/g, '""');
        return /[",\n\r]/.test(cell) ? `"${c}"` : cell;
      }).join(","),
    )
    .join("\n");
}

type PreviewKind = "pdf" | "spreadsheet" | "text";

function fileExtension(file: UploadedFile): string {
  const base = (file.fileName || file.displayLabel || "").trim();
  if (!base.includes(".")) return "";
  return base.split(".").pop()!.toLowerCase();
}

function resolvePreviewKind(file: UploadedFile, gridSource: string): PreviewKind {
  const ext = fileExtension(file);
  const mime = (file.mimeType || "").toLowerCase();
  if (isProbablyCsv(gridSource)) return "spreadsheet";
  if (["csv", "tsv", "xlsx", "xls"].includes(ext)) return "spreadsheet";
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) return "spreadsheet";
  if (ext === "pdf" || mime.includes("pdf")) return "pdf";
  return "text";
}

function DataRoomFilePreview({ file }: { file: UploadedFile }) {
  const raw = String(file.extractedText ?? "").trim();
  if (!raw) {
    return <span className="text-slate-400 italic text-sm">No extracted content for this file.</span>;
  }
  if (isExtractedTextPlaceholder(raw)) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
          Metadata only — full text was not stored on this world. Re-import the file or ZIP from the Expert editor to
          populate extracts for reviewers.
        </p>
        <pre className="whitespace-pre-wrap text-xs font-mono text-slate-600 bg-slate-50 rounded-xl p-4 max-h-[min(70vh,280px)] overflow-auto border border-slate-100">
          {decodeBasicEntities(raw)}
        </pre>
      </div>
    );
  }
  const decoded = decodeBasicEntities(raw);
  const firstLine = decoded.split(/\r?\n/).find((l) => l.trim()) || "";
  const tabCols = firstLine.split("\t").length;
  const commaCols = firstLine.split(",").length;
  const gridSource =
    tabCols >= 3 && tabCols > commaCols ? tsvToCsv(decoded) : decoded;

  const kind = resolvePreviewKind(file, gridSource);
  const title = file.displayLabel || file.fileName || "Document";

  if (kind === "spreadsheet") {
    return <CsvPreview csv={gridSource} />;
  }
  if (kind === "pdf") {
    return <TextPdfPane text={decoded} title={title} />;
  }
  return (
    <pre className="whitespace-pre-wrap text-sm font-mono text-slate-800 bg-slate-50 rounded-xl p-4 leading-relaxed max-h-[min(75vh,560px)] overflow-auto border border-slate-100">
      {decoded}
    </pre>
  );
}

function formatFileTypeLabel(f: UploadedFile): string {
  if (f.type === "__custom__" || f.customType) return f.customType || "Custom";
  const id = f.type || "";
  const pretty: Record<string, string> = {
    chart_of_accounts: "Chart of Accounts",
    general_ledger: "General Ledger",
    trial_balance: "Trial Balance",
    bank_statement: "Bank Statement",
    invoice: "Invoice",
    receipt: "Receipt",
    payroll_report: "Payroll Report",
    tax_document: "Tax Document",
    expense_policy: "Expense Policy",
    management_memo: "Management Memo",
  };
  return pretty[id] || id.replace(/_/g, " ") || "—";
}

function reviewStatusLabel(reviewCount: number) {
  return `${Math.max(0, Math.min(3, reviewCount))} / 3 Reviewed`;
}

interface Props {
  world: QueueWorld;
  existingScore: number;
  existingNotes: string;
  onBack: () => void;
}

export function ReviewerView({ world, existingScore, existingNotes, onBack }: Props) {
  const { userId } = useAuth();
  const [score, setScore] = useState<number>(existingScore);
  const [notes, setNotes] = useState(existingNotes);
  const [submitting, setSubmitting] = useState(false);

  const payload = world.payload || {};
  const files = getDataRoomFilesFromPayload(world.payload);
  const rubric = Array.isArray(payload.rubric) ? payload.rubric : [];
  const reviewCount = Number(payload.review?.reviewer_count || 0);

  async function handleSubmit() {
    if (!score || score < 1 || score > 5) {
      alert("Select a score from 1 to 5.");
      return;
    }
    setSubmitting(true);
    try {
      const sb = await getSupabase();
      const { error } = await sb.from("world_review_scores").upsert(
        { world_id: world.id, reviewer_id: userId, score, notes },
        { onConflict: "world_id,reviewer_id" }
      );
      if (error) { alert(error.message); return; }
      onBack();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell sidebar={false}>
      {/* Sticky header */}
      <div className="glass-header sticky top-0 z-10 px-6 py-3 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to queue
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="text-xs text-slate-500">
            Review · {world.creator_email || world.creator_id.slice(0, 8)} ›
          </div>
          <div className="text-sm font-semibold text-slate-900">{world.title}</div>
          <StatusPill status={world.payload?.review?.status === "in_review" ? "IN REVIEW" : "DRAFT"} />
        </div>
        <div className="text-xs text-slate-500">Read-only world view</div>
      </div>

      <div className="flex-1 flex min-h-0 gap-4 p-3 max-w-[1920px] mx-auto w-full">
        {/* World snapshot (left) */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-white rounded-3xl shadow-sm p-6 md:p-8 space-y-8">
          {/* Step 1: World setup */}
          <section>
            <h2 className="font-serif-display text-xl text-slate-900 mb-4">Step 1: World setup</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["World Name", world.title],
                ["World ID", payload.meta?.id || "—"],
                ["Business Type", payload.meta?.type || "—"],
                ["Accounting Method", payload.meta?.method || "—"],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="label-eyebrow mb-1">{label}</div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 break-words">{String(val ?? "—")}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Step 2: Data room — accordion rows (expand for PDF / spreadsheet / text) */}
          <section className="min-w-0">
            <h2 className="font-serif-display text-xl text-slate-900 mb-4">Step 2: The data room</h2>
            <p className="text-xs text-slate-500 mb-4 max-w-2xl leading-relaxed">
              Expand a file to open the PDF-style viewer, spreadsheet grid, or full text. Multiple files can stay open at
              once.
            </p>
            {files.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center text-slate-400 text-sm italic">
                No files in this world payload (check uploaded documents or legacy fileworld format).
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {files.map((f, i) => {
                  const name = f.displayLabel || f.fileName || "Untitled";
                  const len = f.extractedText ? String(f.extractedText).length : 0;
                  return (
                    <AccordionItem
                      key={f.id || `file-${i}`}
                      value={f.id || `file-${i}`}
                      className="border border-slate-200 rounded-2xl bg-white px-3 shadow-sm overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 py-4 hover:no-underline rounded-xl text-left [&[data-state=open]]:bg-slate-50/80">
                        <div className="flex flex-col items-start gap-1 pr-2 min-w-0">
                          <span className="text-sm font-semibold text-slate-900 break-all">{name}</span>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>
                              <span className="text-slate-400 uppercase tracking-wider mr-1">Doc type</span>
                              {formatFileTypeLabel(f)}
                            </span>
                            {len > 0 && (
                              <span className="font-mono text-slate-400">{len.toLocaleString()} chars</span>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-4 pt-0">
                        {f.notes ? (
                          <div className="mb-3 text-xs text-slate-600 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                            <span className="text-slate-400 uppercase tracking-wider mr-2">Notes</span>
                            {f.notes}
                          </div>
                        ) : null}
                        <div className="min-w-0 border border-slate-100 rounded-xl bg-slate-50/40 p-3">
                          <DataRoomFilePreview file={f} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </section>

          {/* Step 3: Task prompt */}
          <section>
            <h2 className="font-serif-display text-xl text-slate-900 mb-4">Step 3: Agent task prompt</h2>
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {payload.taskPrompt ? (
                String(payload.taskPrompt)
              ) : (
                <span className="italic text-slate-400">No task prompt set.</span>
              )}
            </div>
          </section>

          {/* Step 4: Rubric */}
          <section>
            <h2 className="font-serif-display text-xl text-slate-900 mb-4">Step 4: Grading rubric</h2>
            <div className="rounded-2xl overflow-hidden border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 label-eyebrow text-left w-8">#</th>
                    <th className="px-4 py-3 label-eyebrow text-left">Type</th>
                    <th className="px-4 py-3 label-eyebrow text-left">Label</th>
                    <th className="px-4 py-3 label-eyebrow text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rubric.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-4 text-slate-400 italic text-center">No rubric criteria.</td></tr>
                  ) : (
                    rubric.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{Number(r.n || i + 1)}</td>
                        <td className="px-4 py-3 text-slate-600">{String(r.type || "det")}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{String(r.label || "")}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-pre-wrap">{String(r.text || "")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Reviewer sidebar (right) */}
        <aside className="w-full md:w-[300px] shrink-0 bg-white rounded-3xl shadow-sm self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-6 flex flex-col gap-6">
          <div>
            <div className="label-eyebrow">Reviewer Panel</div>
            <h3 className="mt-2 font-serif-display text-2xl text-slate-900 tracking-tight">Score this world</h3>
            <p className="text-xs text-slate-500 mt-1">{reviewStatusLabel(reviewCount)}</p>
          </div>

          {/* Star rating */}
          <div>
            <div className="label-eyebrow mb-2">Score (1–5)</div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScore(n)}
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition",
                    score >= n
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  <Star className={cn("h-4 w-4", score >= n ? "fill-white" : "")} />
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono">
              {score ? `${score}/5` : "Not scored"}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="label-eyebrow mb-2">Reviewer Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              placeholder="Was the trap convincing? Are the rubric criteria objectively gradable?"
              className="w-full rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 border-0"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!score || submitting}
            className="w-full rounded-full bg-slate-900 text-white py-3 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Score
          </button>

          <div className="border-t border-slate-100 pt-4 text-xs text-slate-500">
            Other reviewers' scores stay hidden until all 3 reviews are complete.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
