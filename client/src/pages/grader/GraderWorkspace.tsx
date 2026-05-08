import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { ACQUI_STATIC_ID, ACQUI_WORLD_PAYLOAD } from "@/data/acqui-world";
import { SESSION_PREVIEW_WORLD_ID, loadSessionPreviewPayload } from "@/lib/graderSessionPreview";
import { isExtractedTextPlaceholder } from "@/lib/dataRoomFileImport";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, List, Grid as GridIcon,
  FileText, FileSpreadsheet, AlertTriangle,
  Info, X, Loader2, Play, CheckCircle2,
  ChevronRight, FolderOpen, Folder, File,
  ClipboardList, ListChecks, Database,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Transaction { date: string; desc: string; amount: number; flag?: string; note?: string }
interface CoaRow      { code: string; name: string; type: string }
interface PolicyRow   { key: string; val: string }
interface InvoiceRow  { id: string; vendor?: string; invNum?: string; date?: string; desc?: string; amount?: string; warn?: string }
interface RubricItem  { n?: number; type?: string; label?: string; text?: string }
interface UploadedFile {
  displayLabel?: string;
  fileName?: string;
  type?: string;
  customType?: string;
  notes?: string;
  extractedText?: string;
  mimeType?: string;
}
interface FileworldFile { path: string; content?: string; type?: string }

interface WorldPayload {
  meta?: Record<string, unknown>;
  // structured-payload world
  transactions?: Transaction[];
  chartOfAccounts?: CoaRow[];
  oldChartOfAccounts?: CoaRow[];
  expensePolicy?: PolicyRow[];
  oldExpensePolicy?: PolicyRow[];
  invoices?: InvoiceRow[] | Record<string, InvoiceRow>;
  rubric?: RubricItem[];
  taskPrompt?: string;
  uploadedFiles?: UploadedFile[];
  misleadingFiles?: Array<string | { file: string; why?: string }>;
  ambiguityTypes?: string[];
  // fileworld (invoice-world / acqui-world style)
  files?: FileworldFile[];
}

interface WorldDetail { id: string; title: string; payload: WorldPayload }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isFilesWorld(p: WorldPayload): p is WorldPayload & { files: FileworldFile[] } {
  return Array.isArray(p.files) && p.files.length > 0;
}

function getInvoiceList(p: WorldPayload): InvoiceRow[] {
  if (Array.isArray(p.invoices)) return p.invoices;
  if (p.invoices && typeof p.invoices === "object")
    return Object.entries(p.invoices).map(([id, inv]) => ({ id, ...inv }));
  return [];
}

// ─── Catalog for structured-payload worlds ────────────────────────────────────

type FileKind = "bank" | "coa" | "policy" | "task" | "invoice" | "uploaded" | "noise" | "fileworld";

interface CatalogFile {
  id: string;
  name: string;
  kind: FileKind;
  typeLabel: string;
  isMisleading: boolean;
  isNoise: boolean;
  invoiceRef?: InvoiceRow;
  uploadedRef?: UploadedFile;
  filePath?: string;          // for fileworld entries
  fileContent?: string;       // for fileworld entries
  fileType?: string;          // for fileworld entries (pdf / csv / policy / etc.)
}

function uploadedFileExtension(uf: UploadedFile): string {
  const base = (uf.fileName || uf.displayLabel || "").trim();
  if (!base.includes(".")) return "";
  return base.split(".").pop()!.toLowerCase();
}

function uploadedCatalogTypeLabel(uf: UploadedFile): string {
  const ext = uploadedFileExtension(uf);
  const map: Record<string, string> = {
    csv: "CSV · Data room",
    tsv: "TSV · Data room",
    xlsx: "XLSX · Data room",
    xls: "XLS · Data room",
    pdf: "PDF · Data room",
    txt: "TXT · Data room",
    md: "Markdown · Data room",
  };
  if (ext && map[ext]) return map[ext];
  const t = (uf.mimeType || "").toLowerCase();
  if (t.includes("pdf")) return "PDF · Data room";
  if (t.includes("csv")) return "CSV · Data room";
  if (t.includes("spreadsheet") || t.includes("excel")) return "XLSX · Data room";
  return `${(uf.customType || uf.type || "doc").toUpperCase()} · File`;
}

function buildCatalog(p: WorldPayload): CatalogFile[] {
  // ── fileworld ──
  if (isFilesWorld(p)) {
    const typeLabels: Record<string, string> = {
      policy: "PDF · Policy", invoice: "PDF · Invoice",
      ledger: "CSV · Ledger", profile: "TXT · Profile",
    };
    return p.files.map((f) => ({
      id: `fw:${f.path}`,
      name: f.path.split("/").pop() || f.path,
      kind: "fileworld" as FileKind,
      typeLabel: typeLabels[f.type || ""] || "TXT · File",
      isMisleading: false,
      isNoise: false,
      filePath: f.path,
      fileContent: f.content || "",
      fileType: f.type || "",
    }));
  }

  // ── structured payload ──
  const files: CatalogFile[] = [];
  if ((p.transactions || []).length > 0)
    files.push({ id: "bank", name: "bank_statement.csv", kind: "bank", typeLabel: "CSV · Banking", isMisleading: false, isNoise: false });
  if ((p.chartOfAccounts || []).length > 0)
    files.push({ id: "coa", name: "chart_of_accounts.xlsx", kind: "coa", typeLabel: "XLSX · Ledger", isMisleading: false, isNoise: false });
  if ((p.expensePolicy || []).length > 0)
    files.push({ id: "policy", name: "expense_policy.pdf", kind: "policy", typeLabel: "PDF · Policy", isMisleading: false, isNoise: false });
  getInvoiceList(p).forEach((inv) =>
    files.push({
      id: `inv:${inv.id}`,
      name: `${inv.invNum || inv.id}.pdf`,
      kind: "invoice",
      typeLabel: "PDF · Invoice",
      isMisleading: Boolean(inv.warn),
      isNoise: false,
      invoiceRef: inv,
    })
  );
  if (p.taskPrompt)
    files.push({ id: "task", name: "task_01.txt", kind: "task", typeLabel: "TXT · Task", isMisleading: false, isNoise: false });
  (p.uploadedFiles || []).forEach((uf, i) =>
    files.push({
      id: `uf:${i}`,
      name: uf.displayLabel || uf.fileName || `file_${i + 1}`,
      kind: "uploaded",
      typeLabel: uploadedCatalogTypeLabel(uf),
      isMisleading: false,
      isNoise: false,
      uploadedRef: uf,
    })
  );
  files.push({ id: "noise", name: "misc_notes.txt", kind: "noise", typeLabel: "TXT · Noise", isMisleading: false, isNoise: true });
  return files;
}

// ─── CSV Grid ─────────────────────────────────────────────────────────────────

function CsvGrid({ csv }: { csv: string }) {
  const lines = csv.trim().split("\n").filter((l) => l.trim());
  if (!lines.length) return <div className="text-slate-400 italic p-4 text-sm">Empty file.</div>;

  const parse = (line: string) => {
    const cells: string[] = []; let cur = ""; let inQ = false;
    for (const ch of line + ",") {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { cells.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    return cells;
  };
  const colLetter = (n: number) => { let s = ""; let r = n; while (r >= 0) { s = String.fromCharCode(65 + (r % 26)) + s; r = Math.floor(r / 26) - 1; } return s; };
  const header = parse(lines[0]);

  return (
    <div className="overflow-auto rounded-xl border border-slate-100">
      <table className="text-xs w-full border-collapse font-mono">
        <thead>
          <tr className="bg-slate-100">
            <th className="w-8 px-2 py-1 border border-slate-200 text-right text-[10px] text-slate-400" />
            {header.map((_, i) => (
              <th key={i} className="px-3 py-1 text-indigo-600 font-semibold uppercase tracking-wider border border-slate-200 text-[10px]">{colLetter(i)}</th>
            ))}
          </tr>
          <tr className="bg-indigo-50/40">
            <td className="px-2 py-1.5 text-slate-400 text-[10px] text-right border border-slate-200">1</td>
            {header.map((h, i) => (
              <th key={i} className="px-3 py-1.5 text-slate-700 font-semibold border border-slate-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.slice(1).map((line, ri) => {
            const cells = parse(line);
            return (
              <tr key={ri} className="hover:bg-slate-50">
                <td className="px-2 py-1 text-slate-400 text-[10px] text-right border border-slate-200">{ri + 2}</td>
                {cells.map((c, ci) => {
                  const num = parseFloat(c.replace(/[^0-9.-]/g, ""));
                  const isAmt = ci > 0 && !isNaN(num) && c !== "" && /[$\d(]/.test(c);
                  return (
                    <td key={ci} className={cn(
                      "px-3 py-1 border border-slate-200",
                      isAmt && num < 0 && "text-red-600",
                      isAmt && num > 0 && "text-emerald-700"
                    )}>{c}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── PDF Viewer (generates PDF blob with jsPDF then embeds in iframe) ─────────

function PdfViewer({ text, title }: { text: string; title?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function build() {
      try {
        const mod = await import("https://esm.sh/jspdf@2.5.1" as string);
        const jsPDF = (mod as unknown as { jsPDF?: unknown; default?: { jsPDF?: unknown } }).jsPDF
          || (mod as unknown as { default?: { jsPDF?: unknown } }).default?.jsPDF
          || (mod as unknown as { default?: unknown }).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = new (jsPDF as any)({ unit: "mm", format: "a4" });
        const pageW: number = doc.internal.pageSize.getWidth();
        const pageH: number = doc.internal.pageSize.getHeight();
        const margin = 14;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        let y = 18;
        for (const rawLine of (text || "").split("\n")) {
          const wrapped: string[] = doc.splitTextToSize(rawLine.length ? rawLine : " ", pageW - margin * 2);
          for (const line of wrapped) {
            if (y > pageH - 12) { doc.addPage(); y = 18; }
            doc.text(line, margin, y);
            y += 4.8;
          }
        }
        if (cancelled) return;
        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        const url = URL.createObjectURL(doc.output("blob"));
        prevUrl.current = url;
        setSrc(url);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    }
    build();
    return () => { cancelled = true; };
  }, [text]);

  if (err) return <pre className="text-xs text-slate-500 p-4 font-mono">PDF preview unavailable: {err}\n\n{text?.slice(0, 2000)}</pre>;
  if (!src) return (
    <div className="flex items-center gap-2 text-slate-400 text-sm p-4">
      <Loader2 className="h-4 w-4 animate-spin" /> Rendering PDF…
    </div>
  );
  return <iframe src={src} title={title || "PDF"} className="w-full h-[calc(100vh-220px)] min-h-[500px] rounded-xl border-0 bg-white" />;
}

// ─── File Viewer ──────────────────────────────────────────────────────────────

function FileViewer({ file, payload }: { file: CatalogFile; payload: WorldPayload }) {
  // ── fileworld file with real content ──
  if (file.kind === "fileworld") {
    const name = file.name || "";
    const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
    const content = file.fileContent || "";

    if (ext === "csv" || file.fileType === "ledger") {
      return (
        <div>
          <div className="label-eyebrow mb-3">{name}</div>
          <CsvGrid csv={content} />
        </div>
      );
    }
    if (ext === "pdf" || file.fileType === "policy" || file.fileType === "invoice") {
      return (
        <div>
          <div className="label-eyebrow mb-3">{name}</div>
          <PdfViewer text={content} title={name} />
        </div>
      );
    }
    // Plain text / TXT / profile
    return (
      <div>
        <div className="label-eyebrow mb-3">{name}</div>
        <pre className="whitespace-pre-wrap text-xs font-mono text-slate-800 bg-slate-50 rounded-xl p-5 leading-relaxed max-h-[68vh] overflow-auto">{content}</pre>
      </div>
    );
  }

  // ── structured-payload bank ──
  if (file.kind === "bank") {
    const rows = payload.transactions || [];
    const csv = ["date,description,amount,flag,notes",
      ...rows.map((t) => `${t.date},"${t.desc}",${Number(t.amount).toFixed(2)},${t.flag || ""},${t.note || ""}`)
    ].join("\n");
    return (
      <div>
        <div className="label-eyebrow mb-3">bank_statement.csv</div>
        <CsvGrid csv={csv} />
      </div>
    );
  }

  // ── COA ──
  if (file.kind === "coa") {
    const rows = payload.chartOfAccounts || [];
    const csv = ["code,name,type", ...rows.map((r) => `${r.code},"${r.name}",${r.type}`)].join("\n");
    return (
      <div>
        <div className="label-eyebrow mb-3">chart_of_accounts.xlsx</div>
        <CsvGrid csv={csv} />
      </div>
    );
  }

  // ── Expense Policy ──
  if (file.kind === "policy") {
    const policyText = (payload.expensePolicy || []).map((r) => `${r.key}: ${r.val}`).join("\n\n");
    return (
      <div>
        <div className="label-eyebrow mb-3">expense_policy.pdf</div>
        <PdfViewer text={policyText} title="expense_policy.pdf" />
      </div>
    );
  }

  // ── Task prompt + rubric ──
  if (file.kind === "task") {
    const prompt = payload.taskPrompt || "";
    return (
      <div>
        <div className="label-eyebrow mb-3">task_01.txt</div>
        <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-6 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono mb-6">
          {prompt}
        </div>
        {(payload.rubric || []).length > 0 && (
          <>
            <div className="label-eyebrow mb-3">Rubric</div>
            <div className="space-y-2">
              {(payload.rubric || []).map((r, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-white px-4 py-3 flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-lg bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{r.n ?? i + 1}</div>
                  <div className="flex-1">
                    <span className={cn("text-[9px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 mr-2",
                      r.type === "llm" ? "bg-indigo-50 text-indigo-700" : r.type === "neg" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                    )}>{r.label || r.type || "det"}</span>
                    <span className="text-sm text-slate-800">{r.text || r.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Invoice ──
  if (file.kind === "invoice" && file.invoiceRef) {
    const inv = file.invoiceRef;
    const invText = [
      `INVOICE`,
      ``,
      `Vendor:      ${inv.vendor || ""}`,
      `Invoice #:   ${inv.invNum || inv.id}`,
      `Date:        ${inv.date || ""}`,
      `Description: ${inv.desc || ""}`,
      `Amount:      ${inv.amount || ""}`,
      inv.warn ? `\nWARNING: ${inv.warn}` : "",
    ].filter((l) => l !== undefined).join("\n");
    return (
      <div>
        {inv.warn && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 text-red-700 text-sm mb-4">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {inv.warn}
          </div>
        )}
        <div className="label-eyebrow mb-3">{inv.invNum || inv.id}.pdf</div>
        <PdfViewer text={invText} title={`${inv.invNum || inv.id}.pdf`} />
      </div>
    );
  }

  // ── Uploaded file (session preview / data room): body lives in extractedText ──
  if (file.kind === "uploaded" && file.uploadedRef) {
    const uf = file.uploadedRef;
    const extracted = (uf.extractedText ?? "").trim();
    const notes = (uf.notes ?? "").trim();
    const fallback = `File: ${uf.displayLabel || uf.fileName || "uploaded file"}\nType: ${uf.customType || uf.type || "—"}\n\n(No extracted text — open this world in the Expert editor and paste or import content if needed.)`;
    const primaryBody = extracted || notes || fallback;
    const ext = uploadedFileExtension(uf);
    const mime = (uf.mimeType || "").toLowerCase();
    const placeholder = isExtractedTextPlaceholder(primaryBody);
    const isPdf = ext === "pdf" || mime.includes("pdf");
    const isCsvExt = ext === "csv" || mime.includes("csv");
    const isSpreadsheetExt =
      ext === "xlsx" ||
      ext === "xls" ||
      mime.includes("spreadsheet") ||
      mime.includes("excel");
    const showExpertNotes = Boolean(extracted && notes && notes !== extracted);

    const title = uf.displayLabel || uf.fileName || "uploaded file";

    const showDataGrid =
      isCsvExt ||
      ext === "tsv" ||
      (isSpreadsheetExt && !placeholder);

    if (showDataGrid) {
      const gridSource = extracted || notes || primaryBody;
      return (
        <div className="space-y-4">
          <div className="label-eyebrow mb-3">{title}</div>
          {showExpertNotes && (
            <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
              <div className="label-eyebrow mb-1">Expert Notes</div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{notes}</p>
            </div>
          )}
          <CsvGrid csv={gridSource} />
        </div>
      );
    }
    if (isPdf) {
      return (
        <div className="space-y-4">
          <div className="label-eyebrow mb-3">{title}</div>
          {showExpertNotes && (
            <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
              <div className="label-eyebrow mb-1">Expert Notes</div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{notes}</p>
            </div>
          )}
          {placeholder ? (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 leading-relaxed">
                This PDF has no readable extracted text in the saved preview (older imports kept only a stub, or the file may be image-only).
                Re-import the ZIP or PDF in the Expert editor to pull text from the PDF, or paste text manually there.
              </div>
              <pre className="whitespace-pre-wrap text-xs font-mono text-slate-800 bg-slate-50 rounded-xl p-5 leading-relaxed max-h-[68vh] overflow-auto border border-slate-100">
                {primaryBody}
              </pre>
            </>
          ) : (
            <PdfViewer text={primaryBody} title={title} />
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="label-eyebrow">{title}</div>
        {isSpreadsheetExt && placeholder && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 leading-relaxed">
            This spreadsheet has no extracted rows in the saved world (older imports stored only file metadata).
            Re-import the ZIP or XLSX in the Expert editor so cells are parsed into the preview.
          </div>
        )}
        {showExpertNotes && (
          <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
            <div className="label-eyebrow mb-1">Expert Notes</div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{notes}</p>
          </div>
        )}
        <pre className="whitespace-pre-wrap text-xs font-mono text-slate-800 bg-slate-50 rounded-xl p-5 leading-relaxed max-h-[68vh] overflow-auto border border-slate-100">
          {primaryBody}
        </pre>
      </div>
    );
  }

  // ── Noise ──
  if (file.kind === "noise") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-slate-300" />
        </div>
        <div className="font-serif-display text-2xl text-slate-400 italic">Noise file</div>
        <p className="text-sm text-slate-400 mt-2">This file contains no structured accounting data.</p>
      </div>
    );
  }

  return <div className="text-slate-400 italic p-4 text-sm">Select a file to view its contents.</div>;
}

// ─── Filetree (for fileworld folder-tree navigation) ─────────────────────────

interface TreeNode { [name: string]: TreeNodeVal }
interface TreeNodeVal { _isDir: boolean; _children?: TreeNode; _file?: CatalogFile }

function buildTree(files: CatalogFile[]): TreeNode {
  const root: TreeNode = {};
  for (const f of files) {
    const path = f.filePath || f.name;
    const parts = path.split("/");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (!node[seg]) node[seg] = { _isDir: true, _children: {} };
      node = node[seg]._children!;
    }
    node[parts[parts.length - 1]] = { _isDir: false, _file: f };
  }
  return root;
}

function TreeLevel({
  node, depth, activeId, onSelect, expanded, onToggle,
}: {
  node: TreeNode; depth: number; activeId: string | null;
  onSelect: (f: CatalogFile) => void;
  expanded: Set<string>; onToggle: (k: string) => void;
}) {
  const entries = Object.entries(node).sort(([, a], [, b]) => {
    if (a._isDir && !b._isDir) return -1;
    if (!a._isDir && b._isDir) return 1;
    return 0;
  });
  return (
    <>
      {entries.map(([name, val]) => {
        const fullPath = depth === 0 ? name : name; // key for expansion
        if (val._isDir) {
          const isOpen = expanded.has(fullPath);
          return (
            <div key={name}>
              <button
                onClick={() => onToggle(fullPath)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 text-slate-600 text-xs"
                style={{ paddingLeft: `${12 + depth * 14}px` }}
              >
                {isOpen ? <FolderOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" /> : <Folder className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                <span className="font-medium truncate">{name}/</span>
              </button>
              {isOpen && val._children && (
                <TreeLevel node={val._children} depth={depth + 1} activeId={activeId} onSelect={onSelect} expanded={expanded} onToggle={onToggle} />
              )}
            </div>
          );
        }
        const f = val._file!;
        const isActive = f.id === activeId;
        return (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            className={cn("w-full flex items-center gap-1.5 py-2 pr-3 text-xs rounded-xl transition", isActive ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700")}
            style={{ paddingLeft: `${12 + (depth + 1) * 14}px` }}
          >
            <File className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-white" : "text-slate-400")} />
            <span className="truncate font-medium">{name}</span>
          </button>
        );
      })}
    </>
  );
}

// ─── packWorldForPrompt ───────────────────────────────────────────────────────

function packWorldForPrompt(p: WorldPayload): string {
  if (isFilesWorld(p)) {
    const files = p.files.map((f) => `== ${f.path} ==\n${f.content || ""}`).join("\n\n");
    const rubric = (p.rubric || []).map((r, i) => `${r.n ?? i + 1}. [${r.type}] ${r.text || r.label}`).join("\n");
    const task = (p.meta?.taskPrompt as string) || p.taskPrompt || `You are working in the data room. Review the files and complete the task.`;
    return `TASK:\n${task}\n\nFILES:\n${files}\n\nRUBRIC:\n${rubric}`;
  }
  const invoices = getInvoiceList(p);
  const rows = (p.transactions || []).map((t) => `${t.date},${t.desc},${Number(t.amount).toFixed(2)}`).join("\n");
  const bank = `date,description,amount\n${rows}`;
  const coa = (p.chartOfAccounts || []).map((a) => `${a.code} | ${a.name} | ${a.type}`).join("\n");
  const pol = (p.expensePolicy || []).map((x) => `${x.key}: ${x.val}`).join("\n");
  const invBlock = invoices.map((i) => `== ${i.invNum || i.id}.pdf ==\nVendor: ${i.vendor || ""}\nAmount: ${i.amount || ""}${i.warn ? `\nNOTE: ${i.warn}` : ""}`).join("\n\n");
  const rubric = (p.rubric || []).map((r, i) => `${r.n ?? i + 1}. [${r.type}] ${r.text || r.label}`).join("\n");
  const task = p.taskPrompt || `You are working as a bookkeeper. Categorize each transaction.`;
  return `TASK:\n${task}\n\nFILES:\n== bank_statement.csv ==\n${bank}\n\n== chart_of_accounts.xlsx ==\n${coa}\n\n== expense_policy.pdf ==\n${pol}\n\n${invBlock}\n\nRUBRIC:\n${rubric}`;
}

/** Exact phrase (case-insensitive, normalized spaces) triggers a mock run with no network call. */
function isFakeApiKeyPhrase(input: string): boolean {
  return input.trim().toLowerCase().replace(/\s+/g, " ") === "fake api key";
}

function buildMockAgentOutput(w: WorldDetail): string {
  const rubric = w.payload.rubric || [];
  const fileCount = isFilesWorld(w.payload) ? w.payload.files.length : 0;
  const lines = [
    "[MOCK AGENT RUN — no API call was made]",
    "",
    `World: ${w.title}`,
    isFilesWorld(w.payload)
      ? `Data room: ${fileCount} files (simulated review complete).`
      : "Structured benchmark payload processed (simulated).",
    "",
    "Sample answer (UI preview only):",
    "• Acknowledged the published task instructions.",
    `• This rubric has ${rubric.length} criteria — use the Task & Rubric panel to score each item.`,
    "• For a real LLM run, enter your Anthropic or OpenAI API key below (stored only in this browser).",
    "",
    "---",
    "End of mock output.",
  ];
  return lines.join("\n");
}

// ─── Rubric panel ─────────────────────────────────────────────────────────────

function RubricList({ rubric, compact = false }: { rubric: RubricItem[]; compact?: boolean }) {
  if (!rubric || rubric.length === 0) {
    return <div className="text-xs text-slate-400 italic px-3 py-4">No rubric authored for this world.</div>;
  }
  return (
    <div className={cn("space-y-2", compact ? "px-2" : "")}>
      {rubric.map((r, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex gap-2.5 items-start">
          <div className="h-5 w-5 rounded-md bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{r.n ?? i + 1}</div>
          <div className="flex-1 min-w-0">
            <span className={cn("text-[8px] font-semibold uppercase tracking-wider rounded-full px-1.5 py-0.5 mr-1.5",
              r.type === "llm" ? "bg-indigo-50 text-indigo-700" : r.type === "neg" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
            )}>{r.label || r.type || "det"}</span>
            <span className={cn("text-slate-800", compact ? "text-[11px] leading-snug" : "text-xs leading-relaxed")}>{r.text || r.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GraderWorkspace() {
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const worldId = searchParams.get("id");

  const [world, setWorld] = useState<WorldDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [catalog, setCatalog]         = useState<CatalogFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [view, setView]               = useState<"list" | "grid">("list");
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [sidebarTab, setSidebarTab]   = useState<"taskrubric" | "dataroom">("dataroom");

  // Folder expansion for fileworld tree
  const [expanded, setExpanded] = useState<Set<string>>(new Set([""]));
  function toggleFolder(k: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  // Agent
  const [agentRunning, setAgentRunning]   = useState(false);
  const [agentOutput, setAgentOutput]     = useState<string | null>(null);
  const [agentError, setAgentError]       = useState<string | null>(null);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState("");

  useEffect(() => {
    if (authLoading || !worldId) return;
    setLoading(true);

    // Session preview from Expert "Sample viewer" — same payload as viewer.html used to load
    if (worldId === SESSION_PREVIEW_WORLD_ID) {
      setLoading(true);
      setFetchError(null);
      const payload = loadSessionPreviewPayload();
      if (!payload) {
        setFetchError("Preview data missing. Go back to the editor and open Sample viewer again.");
        setLoading(false);
        return;
      }
      const meta = payload.meta as { name?: string } | undefined;
      const title = String(meta?.name || "").trim() || "World preview";
      const w: WorldDetail = {
        id: SESSION_PREVIEW_WORLD_ID,
        title,
        payload: payload as WorldPayload,
      };
      setWorld(w);
      const cat = buildCatalog(w.payload);
      setCatalog(cat);
      if (cat.length > 0) setActiveFileId(cat[0].id);
      if (isFilesWorld(w.payload)) {
        const topFolders = new Set<string>([""]);
        w.payload.files.forEach((f) => {
          const top = f.path.split("/")[0];
          if (f.path.includes("/")) topFolders.add(top);
        });
        setExpanded(topFolders);
      }
      setLoading(false);
      return;
    }

    // Serve the static Deals & Advisory (AcquiCo) world locally without a DB round-trip
    if (worldId === ACQUI_STATIC_ID) {
      const w: WorldDetail = { id: ACQUI_STATIC_ID, title: "Deals & Advisory", payload: ACQUI_WORLD_PAYLOAD };
      setWorld(w);
      const cat = buildCatalog(w.payload);
      setCatalog(cat);
      if (cat.length > 0) setActiveFileId(cat[0].id);
      if (isFilesWorld(w.payload)) {
        const topFolders = new Set<string>([""]);
        w.payload.files.forEach((f) => { const top = f.path.split("/")[0]; if (f.path.includes("/")) topFolders.add(top); });
        setExpanded(topFolders);
      }
      setLoading(false);
      return;
    }

    getSupabase()
      .then((sb) => sb.from("worlds").select("id,title,payload").eq("id", worldId).single())
      .then(({ data, error: err }) => {
        if (err || !data) { setFetchError(err?.message || "World not found."); return; }
        const w: WorldDetail = { id: data.id, title: data.title || "Untitled", payload: data.payload || {} };
        setWorld(w);
        const cat = buildCatalog(w.payload);
        setCatalog(cat);
        if (cat.length > 0) setActiveFileId(cat[0].id);
        // Pre-expand all top-level folders for fileworld
        if (isFilesWorld(w.payload)) {
          const topFolders = new Set<string>([""]);
          w.payload.files.forEach((f) => { const top = f.path.split("/")[0]; if (f.path.includes("/")) topFolders.add(top); });
          setExpanded(topFolders);
        }
      })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading, worldId]);

  async function executeAgentRun(apiKey: string) {
    if (!world) return;
    const mock = isFakeApiKeyPhrase(apiKey);
    const provider = localStorage.getItem("apex_ai_provider") || "anthropic";
    const storedModel = localStorage.getItem(`apex_ai_model_${provider}`) || "";
    const VALID_MODEL_RE = /^[a-z0-9][\w.-]{2,60}$/i;
    if (storedModel && !VALID_MODEL_RE.test(storedModel)) {
      localStorage.removeItem(`apex_ai_model_${provider}`);
    }
    const model = (storedModel && VALID_MODEL_RE.test(storedModel))
      ? storedModel
      : (provider === "openai" ? "gpt-4.1" : "claude-sonnet-4-20250514");
    setAgentRunning(true);
    setAgentOutput(null);
    setAgentError(null);
    setAgentPanelOpen(true);
    try {
      if (mock) {
        await new Promise((r) => setTimeout(r, 900 + Math.floor(Math.random() * 400)));
        setAgentOutput(buildMockAgentOutput(world));
        return;
      }
      const userPrompt = packWorldForPrompt(world.payload);
      const system = isFilesWorld(world.payload)
        ? "You are an external diligence agent being evaluated. Return ONLY your final answer as plain text. Do not call tools."
        : "You are an external bookkeeping agent being evaluated. Return ONLY your final categorization output as plain text. Do not call tools.";
      const outputInstructions = isFilesWorld(world.payload)
        ? "OUTPUT: Answer each task directly. Cite source file paths for each factual claim. End with a concise risk and quality-of-evidence summary."
        : "OUTPUT: For each transaction give date, description, amount, account code, account name, flags, notes. End with a one-paragraph summary.";
      const res = await fetch("/api/test-grader", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "x-ai-provider": provider },
        body: JSON.stringify({ model, max_tokens: 2500, system, messages: [{ role: "user", content: `${userPrompt}\n\n${outputInstructions}` }] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || data?.error || `API error ${res.status}`);
      const text = String(data.content?.find((b: { type: string; text?: string }) => b.type === "text")?.text || "").trim();
      setAgentOutput(text || "(empty response)");
    } catch (e: unknown) {
      setAgentError(e instanceof Error ? e.message : String(e));
    } finally {
      setAgentRunning(false);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  function confirmApiKeyAndRun() {
    const raw = apiKeyDraft.trim();
    if (!raw) return;
    const fake = isFakeApiKeyPhrase(raw);
    if (!fake) {
      const provider = localStorage.getItem("apex_ai_provider") || "anthropic";
      localStorage.setItem(`apex_api_key_${provider}`, raw);
      localStorage.setItem("apex_api_key", raw);
    }
    setApiKeyModalOpen(false);
    setApiKeyDraft("");
    void executeAgentRun(raw);
  }

  async function runAgent() {
    if (!world) return;
    const provider = localStorage.getItem("apex_ai_provider") || "anthropic";
    const key = localStorage.getItem(`apex_api_key_${provider}`) || localStorage.getItem("apex_api_key") || "";
    if (!key) {
      setApiKeyDraft("");
      setApiKeyModalOpen(true);
      return;
    }
    await executeAgentRun(key);
  }

  const activeFile = catalog.find((f) => f.id === activeFileId) ?? null;
  const payload = world?.payload ?? {};
  const isFileworld = world ? isFilesWorld(world.payload) : false;

  // Split catalog into task files vs data-room files
  function isTaskFile(f: CatalogFile): boolean {
    if (f.kind === "task") return true;
    if (f.kind === "fileworld") {
      const p = (f.filePath || f.name || "").toLowerCase();
      const base = p.split("/").pop() || "";
      return /^task[s_.\b]?/i.test(base) || base === "task.txt" || base === "tasks.txt";
    }
    return false;
  }
  const taskFiles    = catalog.filter(isTaskFile);
  const dataRoomFiles = catalog.filter((f) => !isTaskFile(f));
  const taskRoomCatalog = dataRoomFiles;
  const rubric = (payload.rubric || []) as RubricItem[];

  // Drawer data
  const mis = Array.isArray(payload.misleadingFiles) ? payload.misleadingFiles : [];
  const misEntries = mis.map((m) => typeof m === "object" && m ? m as { file: string; why?: string } : { file: String(m), why: undefined });
  const baseName = activeFile?.name.replace(/\.[^.]+$/, "").toLowerCase() || "";
  const isMis = misEntries.some((m) => m.file.toLowerCase().includes(baseName) || baseName.includes(m.file.toLowerCase().slice(0, 8)));
  const misHit = misEntries.filter((m) => m.file.toLowerCase().includes(baseName));
  const ambiguity = Array.isArray(payload.ambiguityTypes) ? payload.ambiguityTypes.filter(Boolean) : [];

  let expertNotes = "Per-file notes are authored in the Expert editor. Use the task prompt and rubric for the full agent brief.";
  if (activeFile?.kind === "uploaded" && activeFile.uploadedRef?.notes) expertNotes = activeFile.uploadedRef.notes;
  if (activeFile?.kind === "invoice" && activeFile.invoiceRef?.warn) expertNotes = `⚠ ${activeFile.invoiceRef.warn}`;

  let rawSnippet = "";
  if (activeFile?.kind === "fileworld") rawSnippet = (activeFile.fileContent || "").slice(0, 4000);
  else if (activeFile?.kind === "bank") rawSnippet = ["date,description,amount", ...(payload.transactions || []).map((t) => `${t.date},${t.desc},${Number(t.amount).toFixed(2)}`)].join("\n").slice(0, 4000);
  else if (activeFile?.kind === "coa") rawSnippet = (payload.chartOfAccounts || []).map((r) => `${r.code}\t${r.name}\t${r.type}`).join("\n").slice(0, 4000);
  else if (activeFile?.kind === "policy") rawSnippet = (payload.expensePolicy || []).map((p) => `${p.key}: ${p.val}`).join("\n").slice(0, 4000);
  else if (activeFile?.kind === "task") rawSnippet = String(payload.taskPrompt || "").slice(0, 4000);
  else if (activeFile?.kind === "invoice" && activeFile.invoiceRef) {
    const inv = activeFile.invoiceRef;
    rawSnippet = [`Vendor: ${inv.vendor}`, `Invoice #: ${inv.invNum || inv.id}`, `Date: ${inv.date}`, `Desc: ${inv.desc}`, `Amount: ${inv.amount}`, inv.warn ? `WARNING: ${inv.warn}` : ""].filter(Boolean).join("\n");
  } else if (activeFile?.kind === "uploaded" && activeFile.uploadedRef) {
    const u = activeFile.uploadedRef;
    rawSnippet = (u.extractedText || u.notes || "").slice(0, 4000);
  }

  // ── loading / error guards ──
  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  }
  if (fetchError || !world) {
    return (
      <AppShell sidebar={false}>
        <div className="p-8">
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">{fetchError || "World not found."}</div>
          <button onClick={() => navigate("/grader")} className="rounded-full bg-slate-900 text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition">
            Back to Lobby
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell sidebar={false}>
      <Dialog open={apiKeyModalOpen} onOpenChange={(open) => { setApiKeyModalOpen(open); if (!open) setApiKeyDraft(""); }}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl gap-0">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-serif-display text-2xl text-slate-900">API key</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Keys stay in your browser only (localStorage). Type{" "}
              <span className="font-mono text-slate-700 font-semibold">fake api key</span> to preview the Run Agent UI without calling a real model.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apex-api-key" className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Anthropic / OpenAI key
              </Label>
              <Input
                id="apex-api-key"
                type="password"
                autoComplete="off"
                placeholder="sk-… or fake api key"
                value={apiKeyDraft}
                onChange={(e) => setApiKeyDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") confirmApiKeyAndRun(); }}
                className="rounded-2xl border-slate-200 bg-slate-50 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="mt-8 gap-2 sm:gap-2 flex-col sm:flex-row">
            <button
              type="button"
              onClick={() => setApiKeyModalOpen(false)}
              className="rounded-full border border-slate-200 py-2.5 px-5 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmApiKeyAndRun}
              className="rounded-full bg-slate-900 text-white py-2.5 px-5 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition"
            >
              Run
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── sticky header ── */}
      <div className="glass-header sticky top-0 z-10 px-5 py-3 flex items-center justify-between gap-4 border-b border-slate-200/60">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate("/grader")} className="rounded-full px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 shrink-0 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Lobby
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span className="text-sm font-semibold text-slate-900 truncate">{world.title}</span>
          {world.id === SESSION_PREVIEW_WORLD_ID && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 shrink-0 border border-indigo-200">
              Sample preview
            </span>
          )}
          {payload.meta?.archetype ? (
            <span className="label-eyebrow shrink-0 hidden sm:inline">{String(payload.meta.archetype)}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={runAgent} disabled={agentRunning} className="rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition flex items-center gap-1.5 disabled:opacity-50">
            {agentRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {agentRunning ? "Running…" : "Run Agent"}
          </button>
          <button onClick={() => setDrawerOpen(true)} className="rounded-full bg-white shadow-sm border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 flex items-center gap-1.5 transition">
            <Info className="h-3.5 w-3.5" /> Info
          </button>
        </div>
      </div>

      {/* ── main layout ── */}
      <div className="flex flex-1 min-h-0 gap-3 p-3 relative">

        {/* ── left sidebar with Task / Rubric / Dataroom tabs ── */}
        <aside className="w-[260px] min-w-[220px] rounded-3xl bg-white shadow-sm flex flex-col overflow-hidden">
          {/* Tab strip */}
          <div className="px-2 pt-2 pb-1 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-1 bg-slate-50 rounded-2xl p-1">
              {([
                { key: "taskrubric", label: "Task & Rubric", icon: ClipboardList },
                { key: "dataroom",   label: "Data Room",     icon: Database },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSidebarTab(tab.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition",
                    sidebarTab === tab.key
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* View-mode toggle (only on dataroom tab and structured worlds) */}
          {sidebarTab === "dataroom" && !isFileworld && (
            <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
              <div className="label-eyebrow">Files</div>
              <div className="flex rounded-full bg-slate-100 p-0.5">
                <button onClick={() => setView("list")} className={cn("p-1.5 rounded-full transition", view === "list" ? "bg-slate-900 text-white" : "text-slate-600")}><List className="h-3 w-3" /></button>
                <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-full transition", view === "grid" ? "bg-slate-900 text-white" : "text-slate-600")}><GridIcon className="h-3 w-3" /></button>
              </div>
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto pb-2">
            {sidebarTab === "taskrubric" ? (
              <div className="px-4 py-4">
                <div className="label-eyebrow mb-2">Rubric overview</div>
                {rubric.length > 0 ? (
                  <>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 mb-3">
                      <div className="label-eyebrow mb-1">Total criteria</div>
                      <div className="font-serif-display text-3xl text-slate-900 leading-none">{rubric.length}</div>
                    </div>
                    {(() => {
                      const det = rubric.filter((r) => (r.type || "det") === "det").length;
                      const llm = rubric.filter((r) => r.type === "llm").length;
                      const neg = rubric.filter((r) => r.type === "neg").length;
                      return (
                        <div className="space-y-1.5 text-[11px]">
                          {det > 0 && (
                            <div className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-3 py-2">
                              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-600">Deterministic</span>
                              <span className="font-mono text-slate-900">{det}</span>
                            </div>
                          )}
                          {llm > 0 && (
                            <div className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-3 py-2">
                              <span className="font-semibold uppercase tracking-wider text-[9px] text-indigo-700">LLM Judge</span>
                              <span className="font-mono text-slate-900">{llm}</span>
                            </div>
                          )}
                          {neg > 0 && (
                            <div className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-3 py-2">
                              <span className="font-semibold uppercase tracking-wider text-[9px] text-red-700">Negative</span>
                              <span className="font-mono text-slate-900">{neg}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No rubric authored for this world.</p>
                )}
              </div>
            ) : taskRoomCatalog.length === 0 ? (
              <div className="flex items-center justify-center p-6 text-slate-400 text-xs italic text-center">
                No files found.
              </div>
            ) : sidebarTab === "dataroom" && isFileworld ? (
              <div className="px-1 pt-1">
                <TreeLevel
                  node={buildTree(taskRoomCatalog)}
                  depth={0}
                  activeId={activeFileId}
                  onSelect={(f) => { setActiveFileId(f.id); setDrawerOpen(false); }}
                  expanded={expanded}
                  onToggle={toggleFolder}
                />
              </div>
            ) : sidebarTab === "dataroom" && view === "grid" ? (
              <div className="p-2 grid grid-cols-2 gap-1.5">
                {taskRoomCatalog.map((f) => (
                  <button key={f.id} onClick={() => setActiveFileId(f.id)}
                    className={cn("rounded-2xl p-3 flex flex-col items-center text-center transition", activeFileId === f.id ? "bg-slate-900" : "bg-slate-50 hover:bg-slate-100")}>
                    <FileText className={cn("h-5 w-5", activeFileId === f.id ? "text-white" : "text-slate-400")} />
                    <div className={cn("mt-1 text-[10px] font-medium truncate w-full", activeFileId === f.id ? "text-white" : "text-slate-900")}>{f.name}</div>
                  </button>
                ))}
              </div>
            ) : (
              <ul className="px-2 pt-1 space-y-0.5">
                {taskRoomCatalog.map((f) => (
                  <li key={f.id}>
                    <button onClick={() => { setActiveFileId(f.id); setDrawerOpen(false); }}
                      className={cn("w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition", activeFileId === f.id ? "bg-slate-900 text-white" : "hover:bg-slate-50")}>
                      {f.typeLabel.includes("CSV") || f.typeLabel.includes("XLS")
                        ? <FileSpreadsheet className={cn("h-4 w-4 shrink-0", activeFileId === f.id ? "text-white" : "text-emerald-600")} />
                        : <FileText className={cn("h-4 w-4 shrink-0", activeFileId === f.id ? "text-white" : "text-red-500")} />}
                      <div className="min-w-0 flex-1">
                        <div className={cn("text-xs font-medium truncate", activeFileId === f.id ? "text-white" : "text-slate-900")}>{f.name}</div>
                        <div className={cn("text-[10px]", activeFileId === f.id ? "text-slate-300" : "text-slate-500")}>{f.typeLabel}</div>
                      </div>
                      {f.isMisleading && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                      {f.isNoise && <span className="text-[9px] text-slate-400 uppercase tracking-wider shrink-0">noise</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* ── center column ── */}
        <section className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
          {agentPanelOpen ? (
            // ── Split layout when agent has been run: agent output + task & rubric ──
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
              {/* Left: agent output */}
              <div className="rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col min-h-0" ref={outputRef}>
                <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {agentRunning ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
                      : agentOutput ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      : agentError ? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      : <Play className="h-4 w-4 text-slate-400 shrink-0" />}
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {agentRunning ? "Agent running…" : agentOutput ? "Agent output" : agentError ? "Agent error" : "Agent ready"}
                    </span>
                  </div>
                  <button onClick={() => setAgentPanelOpen(false)} title="Close" className="rounded-full hover:bg-slate-100 p-1.5 text-slate-400 shrink-0"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 overflow-auto p-5">
                  {agentRunning && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Calling AI model…</span>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 space-y-2">
                        <div className="label-eyebrow">Status</div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          The agent has been given the task prompt, every file in the data room, and the rubric. It is producing its answer now.
                        </p>
                      </div>
                    </div>
                  )}
                  {agentError && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{agentError}</div>}
                  {agentOutput && (
                    <pre className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-mono bg-slate-50 rounded-2xl p-5">{agentOutput}</pre>
                  )}
                </div>
              </div>

              {/* Right: task + rubric reference */}
              <div className="rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="px-6 py-3 flex items-center gap-2 border-b border-slate-100 shrink-0">
                  <ClipboardList className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-900">Task &amp; Rubric</span>
                </div>
                <div className="flex-1 overflow-auto p-5 space-y-5">
                  <div>
                    <div className="label-eyebrow mb-2">Task</div>
                    <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                      {String(payload.meta?.taskPrompt || payload.taskPrompt || "(no task prompt authored)")}
                    </div>
                  </div>
                  <div>
                    <div className="label-eyebrow mb-2">Rubric</div>
                    <RubricList rubric={rubric} />
                    {rubric.length > 0 && (
                      <p className="text-[11px] text-slate-400 mt-3">Score each criterion by comparing against the agent output on the left.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : sidebarTab === "taskrubric" ? (
            // ── Task & Rubric tab: task prompt above rubric items ──
            <div className="flex-1 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="px-6 py-3 flex items-center gap-2 border-b border-slate-100 shrink-0">
                <ClipboardList className="h-4 w-4 text-indigo-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">Task &amp; Rubric</div>
                  <div className="text-[11px] text-slate-500">
                    {rubric.length > 0
                      ? `${rubric.length} criteri${rubric.length === 1 ? "on" : "a"} · run the agent to evaluate`
                      : "No rubric criteria authored"}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-6">
                <div>
                  <div className="label-eyebrow mb-2">Task</div>
                  <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-5 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                    {String(payload.meta?.taskPrompt || payload.taskPrompt || "(no task prompt authored)")}
                  </div>
                </div>
                <div>
                  <div className="label-eyebrow mb-2">Rubric</div>
                  <RubricList rubric={rubric} />
                  {rubric.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-3">Run the agent (top right) then score each criterion against its output.</p>
                  )}
                </div>
              </div>
            </div>
          ) : activeFile ? (
            // ── Default single-file viewer ──
            <div className="flex-1 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="px-6 py-3 flex items-center gap-3 border-b border-slate-100 shrink-0">
                {activeFile.typeLabel.includes("CSV") || activeFile.typeLabel.includes("XLS")
                  ? <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                  : <FileText className="h-4 w-4 text-red-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{activeFile.name}</div>
                  <div className="text-[11px] text-slate-500">{activeFile.typeLabel}</div>
                </div>
                {activeFile.isMisleading && (
                  <div className="rounded-full bg-red-50 text-red-700 text-xs px-3 py-1 flex items-center gap-1.5 shrink-0">
                    <AlertTriangle className="h-3.5 w-3.5" /> Misleading
                  </div>
                )}
                {activeFile.isNoise && (
                  <div className="rounded-full bg-slate-100 text-slate-500 text-xs px-3 py-1 shrink-0">Noise file</div>
                )}
              </div>
              <div className="flex-1 overflow-auto p-5">
                <FileViewer file={activeFile} payload={payload} />
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-3xl bg-white shadow-sm flex items-center justify-center text-slate-400 italic text-sm">
              Select a file from the sidebar.
            </div>
          )}
        </section>

        {/* ── right slide-out drawer ── */}
        {drawerOpen && activeFile && (
          <>
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-30" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute top-0 right-0 bottom-0 w-[340px] bg-white z-40 shadow-2xl flex flex-col overflow-hidden rounded-l-3xl">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                <div className="label-eyebrow">File Details</div>
                <button onClick={() => setDrawerOpen(false)} className="rounded-full hover:bg-slate-100 p-1.5 text-slate-500"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {isMis && (
                  <div className="rounded-2xl bg-red-50 p-4">
                    <div className="flex items-center gap-2 text-red-700 font-semibold text-xs uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4" /> Misleading / Trap File
                    </div>
                    {misHit.map((m, i) => <p key={i} className="mt-1.5 text-xs text-red-700">{m.why || "Flagged as misleading in world payload."}</p>)}
                  </div>
                )}
                <div>
                  <div className="label-eyebrow mb-1">File name</div>
                  <div className="text-sm font-semibold text-slate-900">{activeFile.name}</div>
                  <div className="text-xs text-slate-500">{activeFile.typeLabel}</div>
                </div>
                <div>
                  <div className="label-eyebrow mb-1.5">Expert notes</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{expertNotes}</p>
                </div>
                {ambiguity.length > 0 && (
                  <div>
                    <div className="label-eyebrow mb-1.5">Ambiguity types</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ambiguity.map((a) => <span key={a} className="rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">{a}</span>)}
                    </div>
                  </div>
                )}
                {rawSnippet && (
                  <div>
                    <div className="label-eyebrow mb-1.5">Raw extract</div>
                    <pre className="text-[10px] font-mono text-slate-700 bg-slate-50 rounded-xl p-3 max-h-64 overflow-auto whitespace-pre-wrap">{rawSnippet}</pre>
                  </div>
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </AppShell>
  );
}
