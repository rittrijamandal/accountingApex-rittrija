import { useEffect, useState } from "react";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { ReviewerView } from "./ReviewerView";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
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
import { Search, Loader2, Eye, CheckCircle, ClipboardCheck } from "lucide-react";

interface ScoreRow { score: number; notes: string }

interface ReviewScoreDetail {
  reviewer_id: string;
  reviewer_email: string;
  score: number;
  notes: string;
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

        // Exclude own worlds from the review queue
        const enriched: QueueWorld[] = rows
          .filter((w) => w.creator_id !== userId)
          .map((w) => ({ ...w, creator_email: emails[w.creator_id] || `${w.creator_id.slice(0, 8)}…` }));

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
              `${filtered.length} world${filtered.length !== 1 ? "s" : ""} available to review.`
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
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-slate-50/60">
              <tr className="text-left">
                <th className="px-5 py-3.5 label-eyebrow">World Name</th>
                <th className="px-5 py-3.5 label-eyebrow">Creator</th>
                <th className="px-5 py-3.5 label-eyebrow">Status</th>
                <th className="px-5 py-3.5 label-eyebrow">Reviews</th>
                {isAdmin && <th className="px-5 py-3.5 label-eyebrow">Median</th>}
                <th className="px-5 py-3.5 label-eyebrow">My Score</th>
                <th className="px-5 py-3.5 label-eyebrow text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-5 py-10 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-5 py-10 text-center text-slate-400 italic">
                    No worlds match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const reviewCount = Number(w.payload?.review?.reviewer_count || 0);
                  const actualReviews = scoresByWorld[w.id]?.length ?? reviewCount;
                  const status = deriveStatus(w);
                  const myScore = myScores[w.id];
                  const median = w.payload?.review?.median_score;

                  return (
                    <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900">{w.title || "Untitled world"}</td>
                      <td className="px-5 py-4 text-slate-600">{w.creator_email || w.creator_id.slice(0, 8) + "…"}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {actualReviews}
                      </td>
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
    </AppShell>
  );
}
