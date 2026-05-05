import { useEffect, useState } from "react";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { ReviewerView } from "./ReviewerView";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { toReviewStatus, type QueueWorld } from "@/lib/types";
import { Search, Loader2 } from "lucide-react";

interface ScoreRow {
  score: number;
  notes: string;
}

export default function ReviewQueue() {
  const { userId, loading: authLoading } = useAuth();
  const [queue, setQueue] = useState<QueueWorld[]>([]);
  const [myScores, setMyScores] = useState<Record<string, ScoreRow>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !userId) return;
    setLoading(true);
    getSupabase()
      .then(async (sb) => {
        const [{ data: queueData, error: queueErr }, { data: scoresData }] = await Promise.all([
          sb.rpc("get_review_queue_worlds"),
          sb
            .from("world_review_scores")
            .select("world_id,score,notes")
            .eq("reviewer_id", userId),
        ]);
        if (queueErr) throw queueErr;
        setQueue(Array.isArray(queueData) ? (queueData as QueueWorld[]) : []);
        const scoreMap: Record<string, ScoreRow> = {};
        (scoresData || []).forEach((s) => {
          scoreMap[s.world_id] = { score: Number(s.score), notes: s.notes || "" };
        });
        setMyScores(scoreMap);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading, userId]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Show reviewer detail view
  if (activeId) {
    const world = queue.find((w) => w.id === activeId);
    if (!world) {
      setActiveId(null);
      return null;
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

  const filtered = queue.filter((w) =>
    !search ||
    w.title?.toLowerCase().includes(search.toLowerCase()) ||
    w.creator_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell sidebar={false}>
      {/* Header */}
      <div className="px-8 pt-8 pb-5 flex items-end justify-between">
        <div>
          <div className="label-eyebrow">Expert · Peer Review</div>
          <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">Review Queue</h1>
          <p className="text-sm text-slate-500 mt-2">
            {loading ? (
              "Loading…"
            ) : filtered.length > 0 ? (
              `${filtered.length} world${filtered.length !== 1 ? "s" : ""} awaiting your score.`
            ) : (
              <em className="font-serif-display text-slate-400">No worlds waiting for review.</em>
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

      {/* Table */}
      <div className="px-8 pb-8">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">
            {error}
          </div>
        )}
        <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60">
              <tr className="text-left">
                <th className="px-5 py-3.5 label-eyebrow">World Name</th>
                <th className="px-5 py-3.5 label-eyebrow">Creator</th>
                <th className="px-5 py-3.5 label-eyebrow">Status</th>
                <th className="px-5 py-3.5 label-eyebrow">Reviewers</th>
                <th className="px-5 py-3.5 label-eyebrow">My Score</th>
                <th className="px-5 py-3.5 label-eyebrow text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 italic">
                    No worlds are waiting for review.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const reviewCount = Number(w.payload?.review?.reviewer_count || 0);
                  const status = toReviewStatus(w.payload?.review?.status);
                  const myScore = myScores[w.id];
                  return (
                    <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900">{w.title || "Untitled world"}</td>
                      <td className="px-5 py-4 text-slate-600">{w.creator_email || w.creator_id.slice(0, 8) + "…"}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {Math.min(3, reviewCount)} / 3
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {myScore ? `${myScore.score} / 5` : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setActiveId(w.id)}
                          className="rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition"
                        >
                          {myScore ? "Re-review" : "Review"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
