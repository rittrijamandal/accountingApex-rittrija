import { useMemo, useState } from "react";
import { ArrowLeft, Star, Loader2, FileText, FileSpreadsheet, ClipboardList, ListChecks, Database, ChevronRight, Folder, FolderOpen, File } from "lucide-react";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { CsvPreview } from "@/components/apex/CsvPreview";
import { TextPdfPane } from "@/components/apex/TextPdfPane";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { getDataRoomFilesFromPayload, isExtractedTextPlaceholder } from "@/lib/dataRoomFileImport";
import type { QueueWorld, UploadedFile, RubricItem } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  return first.split(",").length - 1 >= 2 || first.split("\t").length - 1 >= 2;
}

function tsvToCsv(text: string): string {
  return text.trim().split(/\r?\n/).filter((l) => l.trim()).map((line) =>
    line.split("\t").map((cell) => {
      const c = cell.replace(/"/g, '""');
      return /[",\n\r]/.test(cell) ? `"${c}"` : cell;
    }).join(",")
  ).join("\n");
}

function fileExt(f: UploadedFile): string {
  const base = (f.fileName || f.displayLabel || "").trim();
  return base.includes(".") ? base.split(".").pop()!.toLowerCase() : "";
}

function fileTypeLabel(f: UploadedFile): string {
  const ext = fileExt(f);
  const mime = (f.mimeType || "").toLowerCase();
  if (["csv", "tsv", "xlsx", "xls"].includes(ext)) return "Spreadsheet";
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) return "Spreadsheet";
  if (ext === "pdf" || mime.includes("pdf")) return "PDF";
  return "Document";
}

function isSpreadsheetFile(f: UploadedFile): boolean {
  return fileTypeLabel(f).toLowerCase() === "spreadsheet" || isProbablyCsv(String(f.extractedText ?? ""));
}

// ─── File tree for fileworld (hierarchical) data rooms ───────────────────────

interface FileTreeNode { [name: string]: FileTreeNodeVal }
interface FileTreeNodeVal { _isDir: boolean; _children?: FileTreeNode; _file?: { idx: number; f: UploadedFile } }

function buildFileTree(files: UploadedFile[]): FileTreeNode {
  const root: FileTreeNode = {};
  files.forEach((f, idx) => {
    const path = (f.displayLabel || f.fileName || `File ${idx + 1}`).replace(/\\/g, "/");
    const parts = path.split("/").filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (!node[seg]) node[seg] = { _isDir: true, _children: {} };
      node = node[seg]._children!;
    }
    node[parts[parts.length - 1]] = { _isDir: false, _file: { idx, f } };
  });
  return root;
}

function FileTreeLevel({
  node, depth, activeFileId, onSelect, expanded, onToggle,
}: {
  node: FileTreeNode; depth: number; activeFileId: string | null;
  onSelect: (f: UploadedFile, idx: number) => void;
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
        if (val._isDir) {
          const isOpen = expanded.has(name);
          return (
            <div key={name}>
              <button
                onClick={() => onToggle(name)}
                className="w-full flex items-center gap-1.5 py-1.5 hover:bg-slate-50 text-slate-600 text-xs"
                style={{ paddingLeft: `${12 + depth * 14}px` }}
              >
                {isOpen
                  ? <FolderOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  : <Folder className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                <span className="font-medium truncate">{name}/</span>
              </button>
              {isOpen && val._children && (
                <FileTreeLevel node={val._children} depth={depth + 1} activeFileId={activeFileId} onSelect={onSelect} expanded={expanded} onToggle={onToggle} />
              )}
            </div>
          );
        }
        const { idx, f } = val._file!;
        const id = f.id || `file-${idx}`;
        const isActive = id === activeFileId;
        return (
          <button
            key={id}
            onClick={() => onSelect(f, idx)}
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

// ─── File preview ─────────────────────────────────────────────────────────────

function FilePreview({ file }: { file: UploadedFile }) {
  const raw = String(file.extractedText ?? "").trim();
  if (!raw) return <div className="text-slate-400 italic text-sm p-4">No extracted content for this file.</div>;
  if (isExtractedTextPlaceholder(raw)) {
    return (
      <div className="space-y-2 p-4">
        <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
          Metadata only — full text was not stored. Re-import the file from the Expert editor.
        </p>
        <pre className="whitespace-pre-wrap text-xs font-mono text-slate-600 bg-slate-50 rounded-xl p-4 max-h-[68vh] overflow-auto border border-slate-100">
          {decodeBasicEntities(raw)}
        </pre>
      </div>
    );
  }
  const decoded = decodeBasicEntities(raw);
  const firstLine = decoded.split(/\r?\n/).find((l) => l.trim()) || "";
  const tabCols = firstLine.split("\t").length;
  const commaCols = firstLine.split(",").length;
  const gridSource = tabCols >= 3 && tabCols > commaCols ? tsvToCsv(decoded) : decoded;
  const ext = fileExt(file);
  const mime = (file.mimeType || "").toLowerCase();
  const isSheet = isProbablyCsv(gridSource) || ["csv", "tsv", "xlsx", "xls"].includes(ext) || mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv");
  const isPdf = ext === "pdf" || mime.includes("pdf");
  const title = file.displayLabel || file.fileName || "Document";
  if (isSheet) return <CsvPreview csv={gridSource} />;
  if (isPdf) return <TextPdfPane text={decoded} title={title} />;
  return (
    <pre className="whitespace-pre-wrap text-sm font-mono text-slate-800 bg-slate-50 rounded-xl p-5 leading-relaxed max-h-[68vh] overflow-auto border border-slate-100">
      {decoded}
    </pre>
  );
}

// ─── Rubric list ──────────────────────────────────────────────────────────────

function RubricList({ rubric }: { rubric: RubricItem[] }) {
  if (!rubric || rubric.length === 0) {
    return <div className="text-xs text-slate-400 italic px-3 py-4">No rubric authored for this world.</div>;
  }
  return (
    <div className="space-y-2">
      {rubric.map((r, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex gap-2.5 items-start">
          <div className="h-5 w-5 rounded-md bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{r.n ?? i + 1}</div>
          <div className="flex-1 min-w-0">
            <span className={cn("text-[8px] font-semibold uppercase tracking-wider rounded-full px-1.5 py-0.5 mr-1.5",
              r.type === "llm" ? "bg-indigo-50 text-indigo-700" : r.type === "neg" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
            )}>{r.label || r.type || "det"}</span>
            <span className="text-xs text-slate-800 leading-relaxed">{r.text || r.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  world: QueueWorld;
  existingScore: number;
  existingNotes: string;
  avgScore: number | null;
  onBack: () => void;
  onScoreSubmitted: (score: number, notes: string) => void;
}

export function ReviewerView({ world, existingScore, existingNotes, avgScore, onBack, onScoreSubmitted }: Props) {
  const { userId } = useAuth();
  const [score, setScore] = useState<number>(existingScore);
  const [notes, setNotes] = useState(existingNotes);
  const [submitting, setSubmitting] = useState(false);

  const payload = world.payload || {};
  // Memoized so uid() inside getDataRoomFilesFromPayload doesn't regenerate on every render
  const files = useMemo(() => getDataRoomFilesFromPayload(world.payload), [world.payload]);
  const rubric = Array.isArray(payload.rubric) ? payload.rubric : [];
  const taskPrompt = String(payload.taskPrompt || "");

  // Detect fileworld: any file has "/" in its displayLabel
  const isFileworld = useMemo(() => files.some((f) => (f.displayLabel || "").includes("/")), [files]);
  const fileTree = useMemo(() => isFileworld ? buildFileTree(files) : null, [isFileworld, files]);
  const initialExpanded = useMemo(() => {
    const s = new Set<string>([""]);
    if (isFileworld) {
      files.forEach((f) => {
        const parts = (f.displayLabel || "").split("/");
        if (parts.length > 1) s.add(parts[0]);
      });
    }
    return s;
  }, [isFileworld, files]);
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);
  function toggleFolder(k: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }

  const [sidebarTab, setSidebarTab] = useState<"taskrubric" | "dataroom">("taskrubric");
  const [activeFileId, setActiveFileId] = useState<string | null>(files.length > 0 ? (files[0].id || "file-0") : null);

  const activeFile = files.find((f, i) => (f.id || `file-${i}`) === activeFileId) ?? null;

  async function handleSubmit() {
    if (!score || score < 1 || score > 5) { alert("Select a score from 1 to 5."); return; }
    setSubmitting(true);
    try {
      const sb = await getSupabase();
      const { error } = await sb.from("world_review_scores").upsert(
        { world_id: world.id, reviewer_id: userId, score, notes },
        { onConflict: "world_id,reviewer_id" }
      );
      if (error) { alert(error.message); return; }
      onScoreSubmitted(score, notes);
      onBack();
    } finally {
      setSubmitting(false);
    }
  }

  const det = rubric.filter((r) => (r.type || "det") === "det").length;
  const llm = rubric.filter((r) => r.type === "llm").length;
  const neg = rubric.filter((r) => r.type === "neg").length;

  return (
    <AppShell sidebar={false}>
      {/* Sticky header */}
      <div className="glass-header sticky top-0 z-10 px-5 py-3 flex items-center justify-between gap-4 border-b border-slate-200/60">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to queue
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span className="text-sm font-semibold text-slate-900 truncate">{world.title}</span>
          <StatusPill status={world.payload?.review?.status === "in_review" ? "IN REVIEW" : "DRAFT"} />
        </div>
        <div className="text-xs text-slate-500 shrink-0">
          by {world.creator_email || world.creator_id.slice(0, 8)}
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 min-h-0 gap-3 p-3">

        {/* Left sidebar */}
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
                    sidebarTab === tab.key ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar content */}
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
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No rubric authored for this world.</p>
                )}
              </div>
            ) : files.length === 0 ? (
              <div className="flex items-center justify-center p-6 text-slate-400 text-xs italic text-center">
                No files in this world.
              </div>
            ) : isFileworld && fileTree ? (
              <div className="px-1 pt-1">
                <FileTreeLevel
                  node={fileTree}
                  depth={0}
                  activeFileId={activeFileId}
                  onSelect={(f, idx) => setActiveFileId(f.id || `file-${idx}`)}
                  expanded={expanded}
                  onToggle={toggleFolder}
                />
              </div>
            ) : (
              <ul className="px-2 pt-1 space-y-0.5">
                {files.map((f, i) => {
                  const id = f.id || `file-${i}`;
                  const name = f.displayLabel || f.fileName || `File ${i + 1}`;
                  const isActive = id === activeFileId;
                  const isSheet = isSpreadsheetFile(f);
                  return (
                    <li key={id}>
                      <button
                        onClick={() => setActiveFileId(id)}
                        className={cn("w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition", isActive ? "bg-slate-900 text-white" : "hover:bg-slate-50")}
                      >
                        {isSheet
                          ? <FileSpreadsheet className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-emerald-600")} />
                          : <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-red-500")} />}
                        <div className="min-w-0 flex-1">
                          <div className={cn("text-xs font-medium truncate", isActive ? "text-white" : "text-slate-900")}>{name}</div>
                          <div className={cn("text-[10px]", isActive ? "text-slate-300" : "text-slate-500")}>{fileTypeLabel(f)}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Center content */}
        <section className="flex-1 min-w-0 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
          {sidebarTab === "taskrubric" ? (
            <>
              <div className="px-6 py-3 flex items-center gap-2 border-b border-slate-100 shrink-0">
                <ListChecks className="h-4 w-4 text-indigo-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">Task &amp; Rubric</div>
                  <div className="text-[11px] text-slate-500">
                    {rubric.length > 0 ? `${rubric.length} criteri${rubric.length === 1 ? "on" : "a"}` : "No rubric authored"}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-6">
                <div>
                  <div className="label-eyebrow mb-2">Task</div>
                  <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-5 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                    {taskPrompt || <span className="italic text-slate-400">No task prompt set.</span>}
                  </div>
                </div>
                <div>
                  <div className="label-eyebrow mb-2">Rubric</div>
                  <RubricList rubric={rubric} />
                </div>
              </div>
            </>
          ) : activeFile ? (
            <>
              <div className="px-6 py-3 flex items-center gap-3 border-b border-slate-100 shrink-0">
                {isSpreadsheetFile(activeFile)
                  ? <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                  : <FileText className="h-4 w-4 text-red-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {activeFile.fileName || activeFile.displayLabel || "File"}
                  </div>
                  <div className="text-[11px] text-slate-500">{fileTypeLabel(activeFile)}</div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-5">
                <FilePreview file={activeFile} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">
              Select a file from the sidebar.
            </div>
          )}
        </section>

        {/* Right: review panel */}
        <aside className="w-[260px] shrink-0 rounded-3xl bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="label-eyebrow">Reviewer Panel</div>
            <h3 className="mt-1 font-serif-display text-xl text-slate-900 tracking-tight">Score this world</h3>
            {avgScore != null && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span>Avg score so far: <span className="font-mono font-semibold text-slate-700">{avgScore.toFixed(1)} / 5</span></span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Star rating */}
            <div>
              <div className="label-eyebrow mb-2">Score (1–5)</div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setScore(n)}
                    className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold transition",
                      score >= n ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    <Star className={cn("h-3.5 w-3.5", score >= n ? "fill-white" : "")} />
                  </button>
                ))}
              </div>
              <div className="mt-1.5 text-xs text-slate-500 font-mono">
                {score ? `${score} / 5 selected` : "Not scored yet"}
              </div>
            </div>

            {/* Notes */}
            <div className="flex-1 flex flex-col">
              <div className="label-eyebrow mb-2">Reviewer Notes</div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                placeholder="Is the task clear? Are the rubric criteria objectively gradable? Is the trap convincing?"
                className="flex-1 w-full rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 border-0 resize-none"
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

            <p className="text-[10px] text-slate-400 leading-relaxed">
              You can re-submit at any time to update your score. All reviews are visible to admins.
            </p>
          </div>
        </aside>

      </div>
    </AppShell>
  );
}
