import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { firstName as getFirstName } from "@/lib/displayName";
import { ArrowRight, Loader2 } from "lucide-react";

interface LobbyWorld {
  id: string;
  title: string;
  archetype: string;
  businessType: string;
  reviewerCount: number;
  medianScore: number | null;
  taskPrompt: string;
  isStatic?: boolean;
}

export default function GraderLobby() {
  const { loading: authLoading, profile } = useAuth();
  const navigate = useNavigate();
  const firstName = getFirstName(profile);
  const [worlds, setWorlds] = useState<LobbyWorld[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    getSupabase()
      .then((sb) =>
        sb
          .from("worlds")
          .select("id,title,payload")
          .eq("is_published", true)
          .order("updated_at", { ascending: false })
      )
      .then(async ({ data, error: err }) => {
        if (err) { setError(err.message); return; }
        const dbWorlds = (data || []).map((w) => ({
            id: w.id,
            title: w.title || "Untitled world",
            archetype: w.payload?.meta?.archetype || "—",
            businessType: w.payload?.meta?.type || "—",
            reviewerCount: Math.min(3, Number(w.payload?.review?.reviewer_count || 0)),
            medianScore: w.payload?.review?.median_score != null ? Number(w.payload.review.median_score) : null,
            taskPrompt: typeof w.payload?.taskPrompt === "string" ? w.payload.taskPrompt.slice(0, 120) : "",
          }));
        const staticRes = await fetch("/api/static-worlds").then((r) => r.ok ? r.json() : { worlds: [] }).catch(() => ({ worlds: [] }));
        const staticWorlds = (staticRes.worlds || []).map((w: { id: string; title: string; payload?: Record<string, any>; isStatic?: boolean }) => ({
          id: w.id,
          title: w.title || "AcquiCo Data Room",
          archetype: String(w.payload?.meta?.archetype || "Deals Advisory Data Room"),
          businessType: String(w.payload?.meta?.company || "AcquiCo"),
          reviewerCount: 3,
          medianScore: null,
          taskPrompt: String(w.payload?.taskPrompt || w.payload?.meta?.taskPrompt || "").slice(0, 120),
          isStatic: true,
        }));
        const ids = new Set(dbWorlds.map((w) => w.id));
        setWorlds([...staticWorlds.filter((w: LobbyWorld) => !ids.has(w.id)), ...dbWorlds]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading]);

  function launchWorkspace(world: LobbyWorld) {
    navigate(`/grader/workspace?id=${world.id}`);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <AppShell sidebar={false}>
      <div className="px-8 pt-8 pb-2">
        <div className="label-eyebrow">Grader Console</div>
        <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">
          Welcome back, <em className="text-indigo-700">{firstName}</em>
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          {loading ? "Loading…" : `${worlds.length} published benchmark world${worlds.length !== 1 ? "s" : ""} ready for grading.`}
        </p>
      </div>

      <div className="px-8 py-6">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : worlds.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
            <p className="font-serif-display text-2xl text-slate-400 italic">No published worlds yet.</p>
            <p className="text-sm text-slate-400 mt-2">Worlds appear here once an expert publishes them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {worlds.map((w) => (
              <div
                key={w.id}
                className="rounded-3xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col overflow-hidden"
              >
                <div className="px-6 py-5">
                  <div className="label-eyebrow">
                    {w.businessType !== "—" ? `${w.businessType} · ` : ""}{w.archetype}
                  </div>
                  <h3 className="mt-2 font-serif-display text-2xl text-slate-900 tracking-tight leading-tight">
                    {w.title}
                  </h3>
                  {w.taskPrompt && (
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">{w.taskPrompt}…</p>
                  )}
                </div>

                <div className="px-6 pb-5 flex-1 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="label-eyebrow">Reviewers</div>
                    <div className="mt-1 font-mono text-slate-900">{w.reviewerCount} / 3</div>
                  </div>
                  <div>
                    <div className="label-eyebrow">Median Score</div>
                    <div className="mt-1 font-serif-display text-2xl text-slate-900">
                      {w.medianScore != null ? w.medianScore.toFixed(1) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="label-eyebrow">ID</div>
                    <div className="mt-1 font-mono text-slate-400 text-[10px] truncate">{w.id}</div>
                  </div>
                </div>

                <button
                  onClick={() => launchWorkspace(w)}
                  className="m-3 rounded-full bg-slate-900 text-white px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-between hover:bg-indigo-700 transition"
                >
                  Enter Workspace <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
