import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { ReviewerView } from "./ReviewerView";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toReviewStatus, type QueueWorld, type SupabaseWorld } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Eye, CheckCircle, ClipboardCheck, UserPlus } from "lucide-react";

interface ScoreRow { score: number; notes: string }

interface ReviewScoreDetail {
  reviewer_id: string;
  reviewer_email: string;
  score: number;
  notes: string;
}

interface ExpertOption {
  id: string;
  email: string;
}

function deriveStatus(w: SupabaseWorld) {
  return w.is_published ? "APPROVED" : toReviewStatus(w.payload?.review?.status);
}

export default function ReviewQueue() {
  const { userId, profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [queue, setQueue] = useState<QueueWorld[]>([]);
  const [myScores, setMyScores] = useState<Record<string, ScoreRow>>({});
  const [scoresByWorld, setScoresByWorld] = useState<Record<string, ReviewScoreDetail[]>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reviewsWorldId, setReviewsWorldId] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [expertPool, setExpertPool] = useState<ExpertOption[]>([]);
  const [assignWorldId, setAssignWorldId] = useState<string | null>(null);
  const [assignSlotIds, setAssignSlotIds] = useState<[string, string, string]>(["", "", ""]);
  const [assignBusy, setAssignBusy] = useState(false);
  const [idToEmail, setIdToEmail] = useState<Record<string, string>>({});

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
          const { data: allProfs } = await sb.from("profiles").select("id,email").order("email");
          (allProfs || []).forEach((p: { id: string; email: string | null }) => {
            if (p.email) emails[p.id] = p.email;
          });
          const { data: experts } = await sb
            .from("profiles")
            .select("id,email")
            .eq("role", "expert")
            .order("email");
          setExpertPool(
            (experts || [])
              .filter((p: { email: string | null }) => p.email)
              .map((p: { id: string; email: string }) => ({ id: p.id, email: p.email })),
          );
        } else {
          setExpertPool([]);
        }

        {
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
        }

        // Experts: exclude own worlds. Admins: see every world (including drafts) for assignment & moderation.
        const enriched: QueueWorld[] = rows
          .filter((w) => isAdmin || w.creator_id !== userId)
          .map((w) => ({ ...w, creator_email: emails[w.creator_id] || `${w.creator_id.slice(0, 8)}…` }));

        const { data: scoresData } = await sb
          .from("world_review_scores")
          .select("world_id,score,notes")
          .eq("reviewer_id", userId);

        setQueue(enriched);
        setIdToEmail(emails);
        const scoreMap: Record<string, ScoreRow> = {};
        (scoresData || []).forEach((s) => {
          scoreMap[s.world_id] = { score: Number(s.score), notes: s.notes || "" };
        });
        setMyScores(scoreMap);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading, userId, isAdmin]);

  async function unpublishWorld(worldId: string) {
    const w = queue.find((x) => x.id === worldId);
    if (!w) return;
    if (!confirm("Retract this world? It will be unpublished and return to in-review status.")) return;
    setActionBusy(`unpublish:${worldId}`);
    try {
      const sb = await getSupabase();
      const payload = { ...w.payload, review: { ...w.payload?.review, status: "in_review" } };
      const { error: uErr } = await sb
        .from("worlds")
        .update({ is_published: false, payload })
        .eq("id", worldId);
      if (uErr) throw uErr;
      setQueue((prev) =>
        prev.map((row) => (row.id === worldId ? { ...row, is_published: false, payload } : row))
      );
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
      const payload = { ...w.payload, review: { ...w.payload?.review, status: "approved" } };
      const { error: uErr } = await sb
        .from("worlds")
        .update({ is_published: true, payload })
        .eq("id", worldId);
      if (uErr) throw uErr;
      setQueue((prev) =>
        prev.map((row) => (row.id === worldId ? { ...row, is_published: true, payload } : row))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setActionBusy(null);
    }
  }

  function openAssignDialog(w: QueueWorld) {
    const cur = w.payload?.review?.assigned_reviewer_ids ?? [];
    setAssignSlotIds([cur[0] ?? "", cur[1] ?? "", cur[2] ?? ""]);
    setAssignWorldId(w.id);
  }

  function assignedEmailsLine(w: QueueWorld): string | null {
    const ids = w.payload?.review?.assigned_reviewer_ids ?? [];
    if (!ids.length) return null;
    return ids.map((id) => idToEmail[id] || `${id.slice(0, 8)}…`).join(" · ");
  }

  async function saveReviewerAssignments() {
    if (!assignWorldId) return;
    const w = queue.find((x) => x.id === assignWorldId);
    if (!w) return;
    const picked = assignSlotIds.filter(Boolean);
    const unique = [...new Set(picked)];
    const wasDraft = deriveStatus(w) === "DRAFT";
    setAssignBusy(true);
    try {
      const sb = await getSupabase();
      const nextReview = {
        ...w.payload?.review,
        assigned_reviewer_ids: unique,
        ...(unique.length && wasDraft ? { status: "in_review" as const } : {}),
      };
      const payload = { ...w.payload, review: nextReview };
      const { error: uErr } = await sb.from("worlds").update({ payload }).eq("id", assignWorldId);
      if (uErr) throw uErr;
      setQueue((prev) =>
        prev.map((row) => (row.id === assignWorldId ? { ...row, payload } : row)),
      );
      setAssignWorldId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setAssignBusy(false);
    }
  }

  const assignWorld = assignWorldId ? queue.find((x) => x.id === assignWorldId) : null;

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
    const worldScores = scoresByWorld[activeId] || [];
    const avgScore = worldScores.length > 0
      ? worldScores.reduce((sum, r) => sum + r.score, 0) / worldScores.length
      : null;
    return (
      <ReviewerView
        world={world}
        existingScore={existing.score}
        existingNotes={existing.notes}
        avgScore={avgScore}
        onBack={() => setActiveId(null)}
        onScoreSubmitted={(score, notes) => {
          setMyScores((prev) => ({ ...prev, [activeId]: { score, notes } }));
          setScoresByWorld((prev) => {
            const existing = prev[activeId] || [];
            const idx = existing.findIndex((r) => r.reviewer_id === userId);
            const entry = { reviewer_id: userId!, reviewer_email: "", score, notes };
            return {
              ...prev,
              [activeId]: idx >= 0
                ? existing.map((r, i) => (i === idx ? entry : r))
                : [...existing, entry],
            };
          });
        }}
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
              `${filtered.length} world${filtered.length !== 1 ? "s" : ""}${isAdmin ? " (all creators, including drafts)" : " available to review"}.`
            ) : (
              <em className="font-serif-display text-slate-400">No worlds to show.</em>
            )}
          </p>
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
          <table className={cn("w-full text-sm", isAdmin ? "min-w-[960px]" : "min-w-[760px]")}>
            <thead className="bg-slate-50/60">
              <tr className="text-left">
                <th className="px-5 py-3.5 label-eyebrow">World Name</th>
                <th className="px-5 py-3.5 label-eyebrow">Creator</th>
                <th className="px-5 py-3.5 label-eyebrow">Status</th>
                {isAdmin && (
                  <th className="px-5 py-3.5 label-eyebrow">Assigned experts</th>
                )}
                <th className="px-5 py-3.5 label-eyebrow">Reviews</th>
                <th className="px-5 py-3.5 label-eyebrow">Avg Score</th>
                <th className="px-5 py-3.5 label-eyebrow">My Score</th>
                <th className="px-5 py-3.5 label-eyebrow text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-5 py-10 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-5 py-10 text-center text-slate-400 italic">
                    No worlds match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const reviewCount = Number(w.payload?.review?.reviewer_count || 0);
                  const actualReviews = scoresByWorld[w.id]?.length ?? reviewCount;
                  const status = deriveStatus(w);
                  const myScore = myScores[w.id];
                  const worldScores = scoresByWorld[w.id] || [];
                  const avgScore = worldScores.length > 0
                    ? worldScores.reduce((sum, r) => sum + r.score, 0) / worldScores.length
                    : null;
                  const assignedLine = assignedEmailsLine(w);

                  return (
                    <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900">{w.title || "Untitled world"}</td>
                      <td className="px-5 py-4 text-slate-600">{w.creator_email || w.creator_id.slice(0, 8) + "…"}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={status} />
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 align-top">
                          <div className="text-xs text-slate-600 max-w-[200px] leading-snug" title={assignedLine || undefined}>
                            {assignedLine || <span className="text-slate-400">—</span>}
                          </div>
                          {!w.is_published && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 h-7 text-[10px] uppercase tracking-wider"
                              onClick={() => openAssignDialog(w)}
                            >
                              <UserPlus className="h-3 w-3 mr-1" /> Assign
                            </Button>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {actualReviews}
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-mono text-xs">
                        {avgScore != null ? `${avgScore.toFixed(1)} / 5` : <span className="text-slate-400">—</span>}
                      </td>
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
                            {w.is_published ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] uppercase tracking-wider text-red-700 border-red-200 hover:bg-red-50"
                                disabled={!!actionBusy}
                                onClick={() => unpublishWorld(w.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" /> Retract
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] uppercase tracking-wider text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                                disabled={!!actionBusy}
                                onClick={() => approveWorld(w.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" /> Approve
                              </Button>
                            )}
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

      {/* Admin: reviewer scores dialog */}
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
            <Button variant="secondary" onClick={() => setReviewsWorldId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assignWorldId}
        onOpenChange={(open) => {
          if (!open) {
            setAssignWorldId(null);
            setAssignSlotIds(["", "", ""]);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif-display">Assign reviewers</DialogTitle>
            <DialogDescription>
              Choose up to three experts for <span className="font-medium text-slate-800">{assignWorld?.title || "this world"}</span>.
              Draft worlds move to <strong>in review</strong> when you save with at least one reviewer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {([0, 1, 2] as const).map((i) => (
              <div key={i}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Reviewer {i + 1}
                </span>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={assignSlotIds[i]}
                  onChange={(e) => {
                    const next: [string, string, string] = [...assignSlotIds];
                    next[i] = e.target.value;
                    setAssignSlotIds(next);
                  }}
                >
                  <option value="">— None —</option>
                  {expertPool.map((e) => (
                    <option key={e.id} value={e.id}>{e.email}</option>
                  ))}
                </select>
              </div>
            ))}
            {expertPool.length === 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                No users with the Expert role. Promote users to Expert in{" "}
                <Link to="/admin/users" className="text-indigo-700 underline font-medium">User Directory</Link> first.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setAssignWorldId(null);
                setAssignSlotIds(["", "", ""]);
              }}
            >
              Cancel
            </Button>
            <Button type="button" disabled={assignBusy} onClick={() => void saveReviewerAssignments()}>
              {assignBusy ? "Saving…" : "Save assignments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
