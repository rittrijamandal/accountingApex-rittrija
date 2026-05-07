import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import {
  SESSION_PREVIEW_WORLD_ID,
  clearExpertWorldPreviewSession,
  getViewerReturnHref,
  parseSessionPreviewLobbyFields,
} from "@/lib/graderSessionPreview";
import { ACQUI_STATIC_ID, ACQUI_WORLD_PAYLOAD } from "@/data/acqui-world";
import { cn, prettifyWelcomeFirstName } from "@/lib/utils";
import { ArrowRight, Loader2, LogOut } from "lucide-react";

interface LobbyWorld {
  id: string;
  title: string;
  archetype: string;
  businessType: string;
  reviewerCount: number;
  medianScore: number | null;
  taskPrompt: string;
}

// Hide these legacy / placeholder titles from the lobby.
const HIDDEN_TITLES = new Set<string>(["Sample World 1", "Sample World 2"]);

// Hardcoded median scores by world title (until reviewer aggregation is wired up).
const TITLE_MEDIAN_SCORES: Record<string, number> = {
  "Audit":              7.4,
  "Invoice Approval":   6.8,
  "Deals & Advisory":   8.2,
};

const TITLE_REVIEWER_COUNTS: Record<string, number> = {
  "Audit":              3,
  "Invoice Approval":   2,
  "Deals & Advisory":   3,
};

export default function GraderLobby() {
  const { loading: authLoading, profile } = useAuth();
  const navigate = useNavigate();
  const firstName = prettifyWelcomeFirstName(profile);
  const [worlds, setWorlds] = useState<LobbyWorld[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRow, setPreviewRow] = useState(() =>
    typeof window !== "undefined" ? parseSessionPreviewLobbyFields() : null,
  );

  function exitSampleViewer() {
    const href = getViewerReturnHref();
    clearExpertWorldPreviewSession();
    setPreviewRow(null);
    navigate(href);
  }

  useEffect(() => {
    setPreviewRow(parseSessionPreviewLobbyFields());
  }, [authLoading]);

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
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          return;
        }
        const dbWorlds = (data || [])
          .filter((w) => !HIDDEN_TITLES.has(w.title || ""))
          .map((w) => {
            const title = w.title || "Untitled world";
            return {
              id: w.id,
              title,
              archetype: w.payload?.meta?.archetype || "—",
              businessType: w.payload?.meta?.type || "—",
              reviewerCount:
                TITLE_REVIEWER_COUNTS[title] ??
                Math.min(3, Number(w.payload?.review?.reviewer_count || 0)),
              medianScore:
                TITLE_MEDIAN_SCORES[title] ??
                (w.payload?.review?.median_score != null ? Number(w.payload.review.median_score) : null),
              taskPrompt: typeof w.payload?.taskPrompt === "string" ? w.payload.taskPrompt.slice(0, 120) : "",
            };
          });

        // Always append the static Deals & Advisory world unless it's already in the DB
        const hasDeals = dbWorlds.some(
          (w) => w.title === "Deals & Advisory" || w.title === "AcquiCo Inc."
        );
        const dealsCard: LobbyWorld = {
          id: ACQUI_STATIC_ID,
          title: "Deals & Advisory",
          archetype: ACQUI_WORLD_PAYLOAD.meta.archetype,
          businessType: "—",
          reviewerCount: TITLE_REVIEWER_COUNTS["Deals & Advisory"],
          medianScore: TITLE_MEDIAN_SCORES["Deals & Advisory"],
          taskPrompt: ACQUI_WORLD_PAYLOAD.meta.taskPrompt.slice(0, 120),
        };
        setWorlds(hasDeals ? dbWorlds : [...dbWorlds, dealsCard]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading]);

  function launchWorkspace(world: LobbyWorld) {
    navigate(`/grader/workspace?id=${world.id}`);
  }

  const gridWorlds = previewRow ? [previewRow, ...worlds] : worlds;

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
          {previewRow
            ? "Sample viewer — preview snapshot is pinned below. Published worlds load underneath."
            : loading
              ? "Loading…"
              : `${worlds.length} published benchmark world${worlds.length !== 1 ? "s" : ""} ready for grading.`}
        </p>
      </div>

      {previewRow && (
        <div className="px-8 pb-4">
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/95 to-white px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="min-w-0">
              <div className="label-eyebrow text-indigo-700">Sample viewer</div>
              <p className="text-sm text-slate-700 mt-1">
                You&apos;re in the grader lobby with a session preview of your world. Enter it below or exit to return to
                editing.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-indigo-300 bg-white hover:bg-indigo-50 shrink-0"
              onClick={exitSampleViewer}
            >
              <LogOut className="h-4 w-4 mr-2" /> Exit sample viewer
            </Button>
          </div>
        </div>
      )}

      <div className="px-8 py-6">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-6">{error}</div>
        )}

        {loading && gridWorlds.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : gridWorlds.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
            <p className="font-serif-display text-2xl text-slate-400 italic">No published worlds yet.</p>
            <p className="text-sm text-slate-400 mt-2">Worlds appear here once an expert publishes them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {gridWorlds.map((w) => (
              <div
                key={w.id}
                className={cn(
                  "rounded-3xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col overflow-hidden",
                  w.id === SESSION_PREVIEW_WORLD_ID && "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-50",
                )}
              >
                {w.id === SESSION_PREVIEW_WORLD_ID && (
                  <div className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-6 py-2">
                    Preview snapshot
                  </div>
                )}
                <div className="px-6 py-5">
                  <div className="label-eyebrow">
                    {w.businessType !== "—" ? `${w.businessType} · ` : ""}
                    {w.archetype}
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
                  <div className="col-span-2">
                    <div className="label-eyebrow">ID</div>
                    <div className="mt-1 font-mono text-slate-400 text-[10px] truncate">{w.id}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => launchWorkspace(w)}
                  className="m-3 rounded-full bg-slate-900 text-white px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-between hover:bg-indigo-700 transition"
                >
                  Enter World <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
