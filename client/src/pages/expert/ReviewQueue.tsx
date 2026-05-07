import { useEffect, useState } from "react";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { ReviewerView } from "./ReviewerView";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { toReviewStatus, type QueueWorld, type SupabaseWorld, type WorldPayload } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Users, Eye, CheckCircle, ClipboardCheck } from "lucide-react";

interface ScoreRow {
  score: number;
  notes: string;
}

interface ReviewScoreDetail {
  reviewer_id: string;
  reviewer_email: string;
  score: number;
  notes: string;
}

interface ReviewerPick {
  id: string;
  email: string;
  role: string;
}

const REVIEWER_POOL = [
  "Alex Kim",
  "Jordan Lee",
  "Sam Rivera",
  "Taylor Chen",
  "Morgan Patel",
  "Riley Santos",
  "Casey Nguyen",
  "Jamie Ortiz",
];

function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function enrichForDemo(w: SupabaseWorld, creatorEmail: string): QueueWorld {
  const seed = stableHash(w.id);
  const rawCount = w.payload?.review?.reviewer_count;
  const reviewerCount =
    rawCount !== undefined && rawCount !== null
      ? Math.min(3, Number(rawCount))
      : seed % 4;

  const payload: WorldPayload = { ...(w.payload || {}) };
  if (!payload.review) payload.review = {};
  if (rawCount === undefined || rawCount === null) {
    payload.review.reviewer_count = reviewerCount;
    const statuses = ["draft", "in_review", "in_review", "needs_rework"] as const;
    payload.review.status = payload.review.status || statuses[seed % statuses.length];
  }

  return {
    ...w,
    payload,
    creator_email: creatorEmail,
  };
}

function reviewerSummary(worldId: string, count: number): string {
  if (count <= 0) return "Awaiting assignment";
  const seed = stableHash(worldId);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    names.push(REVIEWER_POOL[(seed + i * 13) % REVIEWER_POOL.length]);
  }
  return names.join(" · ");
}

export default function ReviewQueue() {
  const { userId, profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [queue, setQueue] = useState<QueueWorld[]>([]);
  const [myScores, setMyScores] = useState<Record<string, ScoreRow>>({});
  const [emailById, setEmailById] = useState<Record<string, string>>({});
  /** Admin: all scores per world */
  const [scoresByWorld, setScoresByWorld] = useState<Record<string, ReviewScoreDetail[]>>({});
  const [reviewerCandidates, setReviewerCandidates] = useState<ReviewerPick[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [reviewsWorldId, setReviewsWorldId] = useState<string | null>(null);
  const [assignWorldId, setAssignWorldId] = useState<string | null>(null);
  const [assignSelected, setAssignSelected] = useState<string[]>([]);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId || loading) return;
    if (queue.length > 0 && !queue.some((w) => w.id === activeId)) setActiveId(null);
  }, [activeId, queue, loading]);

  useEffect(() => {
    if (authLoading || !userId) return;
    setLoading(true);
    getSupabase()
      .then(async (sb) => {
        const { data: worldsData, error: worldsErr } = await sb
          .from("worlds")
          .select("id,title,is_published,created_at,updated_at,creator_id,payload")
          .order("updated_at", { ascending: false });
        if (worldsErr) throw worldsErr;

        const rows = worldsData || [];
        const creatorIds = [...new Set(rows.map((w) => w.creator_id))];
        const emails: Record<string, string> = {};
        if (creatorIds.length > 0) {
          const { data: profs, error: profErr } = await sb.from("profiles").select("id,email").in("id", creatorIds);
          if (profErr) throw profErr;
          (profs || []).forEach((p: { id: string; email: string | null }) => {
            emails[p.id] = p.email || "";
          });
        }

        if (isAdmin) {
          const { data: allProfs } = await sb.from("profiles").select("id,email,role").order("email");
          (allProfs || []).forEach((p: { id: string; email: string | null }) => {
            if (p.email) emails[p.id] = p.email;
          });
          setEmailById(emails);

          const { data: allScores, error: scoresErr } = await sb
            .from("world_review_scores")
            .select("world_id, reviewer_id, score, notes");
          if (scoresErr) throw scoresErr;

          const byWorld: Record<string, ReviewScoreDetail[]> = {};
          (allScores || []).forEach((r: { world_id: string; reviewer_id: string; score: number; notes: string | null }) => {
            if (!byWorld[r.world_id]) byWorld[r.world_id] = [];
            byWorld[r.world_id].push({
              reviewer_id: r.reviewer_id,
              reviewer_email: emails[r.reviewer_id] || `${r.reviewer_id.slice(0, 8)}…`,
              score: Number(r.score),
              notes: r.notes || "",
            });
          });
          setScoresByWorld(byWorld);

          const { data: candidates } = await sb
            .from("profiles")
            .select("id,email,role")
            .in("role", ["expert", "grader"])
            .order("email");
          setReviewerCandidates((candidates || []) as ReviewerPick[]);
        }

        const enriched: QueueWorld[] = rows.map((w) =>
          enrichForDemo(w as SupabaseWorld, emails[w.creator_id] || `${w.creator_id.slice(0, 8)}…`)
        );

        const { data: scoresData } = await sb
          .from("world_review_scores")
          .select("world_id,score,notes")
          .eq("reviewer_id", userId);

        setQueue(enriched);
        const scoreMap: Record<string, ScoreRow> = {};
        (scoresData || []).forEach((s) => {
          scoreMap[s.world_id] = { score: Number(s.score), notes: s.notes || "" };
        });
        setMyScores(scoreMap);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading, userId, isAdmin]);

  function openAssign(worldId: string) {
    const w = queue.find((x) => x.id === worldId);
    const existing = (w?.payload?.review?.assigned_reviewer_ids || []).slice(0, 3);
    setAssignSelected(existing);
    setAssignWorldId(worldId);
  }

  async function saveAssignments() {
    if (!assignWorldId) return;
    const w = queue.find((x) => x.id === assignWorldId);
    if (!w) return;
    setActionBusy(`assign:${assignWorldId}`);
    try {
      const sb = await getSupabase();
      const ids = assignSelected.slice(0, 3);
      const payload: WorldPayload = {
        ...w.payload,
        review: {
          ...w.payload?.review,
          assigned_reviewer_ids: ids,
        },
      };
      const { error: uErr } = await sb.from("worlds").update({ payload }).eq("id", assignWorldId);
      if (uErr) throw uErr;
      setQueue((prev) =>
        prev.map((row) => (row.id === assignWorldId ? { ...row, payload } : row))
      );
      setAssignWorldId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setActionBusy(null);
    }
  }

  async function approveWorld(worldId: string) {
    const w = queue.find((x) => x.id === worldId);
    if (!w) return;
    if (!confirm("Approve and publish this world?")) return;
    setActionBusy(`approve:${worldId}`);
    try {
      const sb = await getSupabase();
      const payload: WorldPayload = {
        ...w.payload,
        review: {
          ...w.payload?.review,
          status: "approved",
        },
      };
      const { error: uErr } = await sb
        .from("worlds")
        .update({ is_published: true, payload })
        .eq("id", worldId);
      if (uErr) throw uErr;
      setQueue((prev) =>
        prev.map((row) =>
          row.id === worldId ? { ...row, is_published: true, payload } : row
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setActionBusy(null);
    }
  }

  function toggleAssignId(id: string) {
    setAssignSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (activeId) {
    const world = queue.find((w) => w.id === activeId);
    if (!world) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      );
    }
    const existing = myScores[activeId] || { score: 0, notes: "" };
    return (
      <ReviewerView
        world={world}
        existingScore={existing.score}
        existingNotes={existing.notes}
        onBack={() => setActiveId(null)}
      />
    );
  }

  const filtered = queue.filter(
    (w) =>
      !search ||
      w.title?.toLowerCase().includes(search.toLowerCase()) ||
      w.creator_email?.toLowerCase().includes(search.toLowerCase())
  );

  const reviewsWorld = reviewsWorldId ? queue.find((w) => w.id === reviewsWorldId) : null;
  const reviewsList = reviewsWorldId ? scoresByWorld[reviewsWorldId] || [] : [];

  const assignWorld = assignWorldId ? queue.find((w) => w.id === assignWorldId) : null;
  const assignChoices = reviewerCandidates.filter((c) => c.id !== assignWorld?.creator_id);

  return (
    <AppShell sidebar={false}>
      <div className="px-8 pt-8 pb-5 flex items-end justify-between">
        <div>
          <div className="label-eyebrow">{isAdmin ? "Admin · Review operations" : "Expert · Peer Review"}</div>
          <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">Review Queue</h1>
          <p className="text-sm text-slate-500 mt-2">
            {loading ? (
              "Loading…"
            ) : filtered.length > 0 ? (
              `${filtered.length} world${filtered.length !== 1 ? "s" : ""} in the queue.`
            ) : (
              <em className="font-serif-display text-slate-400">No worlds to show.</em>
            )}
          </p>
          {isAdmin && (
            <p className="text-xs text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Assign up to three reviewers (experts or graders), read submitted scores, and approve worlds to publish them.
              Reviewers still submit scores from their own accounts; assignments are tracked on the world record.
            </p>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full bg-white shadow-sm pl-10 pr-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            placeholder="Search worlds…"
          />
        </div>
      </div>

      <div className="px-8 pb-8">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">{error}</div>
        )}
        <div className="rounded-3xl bg-white shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead className="bg-slate-50/60">
              <tr className="text-left">
                <th className="px-5 py-3.5 label-eyebrow">World Name</th>
                <th className="px-5 py-3.5 label-eyebrow">Creator</th>
                <th className="px-5 py-3.5 label-eyebrow">Status</th>
                <th className="px-5 py-3.5 label-eyebrow">{isAdmin ? "Progress" : "Reviewers"}</th>
                {isAdmin && <th className="px-5 py-3.5 label-eyebrow">Assigned</th>}
                {isAdmin && <th className="px-5 py-3.5 label-eyebrow">Median</th>}
                <th className="px-5 py-3.5 label-eyebrow">{isAdmin ? "Your score" : "My Score"}</th>
                <th className="px-5 py-3.5 label-eyebrow text-right">{isAdmin ? "Actions" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 6} className="px-5 py-10 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 6} className="px-5 py-10 text-center text-slate-400 italic">
                    No worlds match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const reviewCount = Number(w.payload?.review?.reviewer_count || 0);
                  const status = toReviewStatus(w.payload?.review?.status);
                  const myScore = myScores[w.id];
                  const summary = reviewerSummary(w.id, Math.min(3, reviewCount));
                  const assignedIds = w.payload?.review?.assigned_reviewer_ids || [];
                  const assignedStr =
                    assignedIds.length > 0
                      ? assignedIds
                          .map((id) => emailById[id] || `${String(id).slice(0, 8)}…`)
                          .join(" · ")
                      : "—";
                  const median = w.payload?.review?.median_score;

                  return (
                    <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900">{w.title || "Untitled world"}</td>
                      <td className="px-5 py-4 text-slate-600">{w.creator_email || w.creator_id.slice(0, 8) + "…"}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-mono text-xs">
                          {Math.min(3, reviewCount)} / 3
                        </div>
                        {!isAdmin && (
                          <div className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] leading-snug" title={summary}>
                            {summary}
                          </div>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-slate-600 text-xs max-w-[220px] leading-snug" title={assignedStr}>
                          {assignedStr}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-5 py-4 text-slate-700 font-mono text-xs">
                          {median != null ? Number(median).toFixed(1) : "—"}
                        </td>
                      )}
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {myScore ? `${myScore.score} / 5` : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isAdmin ? (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] uppercase tracking-wider"
                              onClick={() => setReviewsWorldId(w.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" /> Reviews
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] uppercase tracking-wider"
                              disabled={!!actionBusy}
                              onClick={() => openAssign(w.id)}
                            >
                              <Users className="h-3 w-3 mr-1" /> Assign
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] uppercase tracking-wider text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                              disabled={!!actionBusy || w.is_published}
                              onClick={() => approveWorld(w.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-[10px] uppercase tracking-wider bg-slate-900 hover:bg-indigo-700"
                              onClick={() => setActiveId(w.id)}
                            >
                              <ClipboardCheck className="h-3 w-3 mr-1" /> Review
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveId(w.id)}
                            className="rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition"
                          >
                            {myScore ? "Re-review" : "Review"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!reviewsWorldId} onOpenChange={(o) => !o && setReviewsWorldId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif-display">Reviewer scores</DialogTitle>
            <DialogDescription>
              {reviewsWorld?.title || "World"} — all submitted scores ({reviewsList.length}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {reviewsList.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No scores submitted yet.</p>
            ) : (
              reviewsList.map((r) => (
                <div key={r.reviewer_id} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-xs font-mono text-slate-700 break-all">{r.reviewer_email}</div>
                    <div className="font-serif-display text-lg text-indigo-700 shrink-0">{r.score.toFixed(1)} / 5</div>
                  </div>
                  {r.notes ? (
                    <p className="mt-2 text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{r.notes}</p>
                  ) : (
                    <p className="mt-2 text-[10px] text-slate-400 italic">No notes</p>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setReviewsWorldId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignWorldId} onOpenChange={(o) => !o && setAssignWorldId(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif-display">Assign reviewers</DialogTitle>
            <DialogDescription>
              Pick up to three experts or graders for{" "}
              <span className="font-semibold text-slate-800">{assignWorld?.title || "this world"}</span>. This is
              recorded on the world for operations tracking; reviewers still submit scores when they open the queue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {assignChoices.map((c) => {
              const checked = assignSelected.includes(c.id);
              const disabled = !checked && assignSelected.length >= 3;
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition ${
                    checked ? "border-indigo-300 bg-indigo-50/50" : "border-slate-100 hover:bg-slate-50"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleAssignId(c.id)}
                    className="rounded border-slate-300"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono text-slate-800 truncate">{c.email}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">{c.role}</div>
                  </div>
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500">
            Selected {assignSelected.length} / 3
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setAssignWorldId(null)}>
              Cancel
            </Button>
            <Button disabled={!!actionBusy} onClick={() => void saveAssignments()}>
              Save assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
