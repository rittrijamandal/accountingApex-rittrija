import { useState } from "react";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { QueueWorld } from "@/lib/types";

function esc(s: unknown) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
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
  const files = Array.isArray(payload.uploadedFiles) ? payload.uploadedFiles : [];
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

      <div className="flex-1 flex min-h-0 gap-3 p-3">
        {/* World snapshot (left) */}
        <div className="w-3/4 overflow-y-auto bg-white rounded-3xl shadow-sm p-8 space-y-8">
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
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{esc(val)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Step 2: Data room */}
          <section>
            <h2 className="font-serif-display text-xl text-slate-900 mb-4">Step 2: The data room</h2>
            <div className="rounded-2xl overflow-hidden border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 label-eyebrow text-left">File Name</th>
                    <th className="px-4 py-3 label-eyebrow text-left">Type</th>
                    <th className="px-4 py-3 label-eyebrow text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {files.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-4 text-slate-400 italic text-center">No files attached.</td></tr>
                  ) : (
                    files.map((f, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-800">{esc(f.displayLabel || f.fileName || "Untitled")}</td>
                        <td className="px-4 py-3 text-slate-500">{esc(f.customType || f.type || "—")}</td>
                        <td className="px-4 py-3 text-slate-500">{esc(f.notes || "—")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Step 3: Task prompt */}
          <section>
            <h2 className="font-serif-display text-xl text-slate-900 mb-4">Step 3: Agent task prompt</h2>
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {payload.taskPrompt || <span className="italic text-slate-400">No task prompt set.</span>}
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
                        <td className="px-4 py-3 text-slate-600">{esc(r.type || "det")}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{esc(r.label || "")}</td>
                        <td className="px-4 py-3 text-slate-500">{esc(r.text || "")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Reviewer sidebar (right) */}
        <aside className="w-1/4 bg-white rounded-3xl shadow-sm self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-6 flex flex-col gap-6">
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
