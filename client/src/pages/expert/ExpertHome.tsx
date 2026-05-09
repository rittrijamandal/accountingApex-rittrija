import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { toDisplayWorld, type DisplayWorld } from "@/lib/types";
import { SESSION_PREVIEW_WORLD_ID } from "@/lib/graderSessionPreview";
import { prettifyWelcomeFirstName } from "@/lib/utils";
import { Hammer, ClipboardCheck, Globe, Plus, ArrowRight, Loader2, Pencil, Trash2, Eye } from "lucide-react";

export default function ExpertHome() {
  const { profile, userId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const displayName = prettifyWelcomeFirstName(profile);
  const [worlds, setWorlds] = useState<DisplayWorld[]>([]);
  const [loadingWorlds, setLoadingWorlds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !userId) return;
    setLoadingWorlds(true);
    getSupabase()
      .then((sb) =>
        sb
          .from("worlds")
          .select("id,title,is_published,created_at,updated_at,creator_id,payload")
          .eq("creator_id", userId)
          .order("updated_at", { ascending: false })
      )
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return; }
        setWorlds((data || []).map(toDisplayWorld));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingWorlds(false));
  }, [authLoading, userId]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this world? This cannot be undone.")) return;
    const sb = await getSupabase();
    const { error: delErr } = await sb.from("worlds").delete().eq("id", id);
    if (delErr) { alert(delErr.message); return; }
    setWorlds((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleNewWorld() {
    const sb = await getSupabase();
    const { emptyPayload } = await import("@/lib/emptyPayload");
    const pl = emptyPayload();
    pl.meta!.name = "New business";
    pl.meta!.period = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    const { data, error: insErr } = await sb
      .from("worlds")
      .insert({ title: "Untitled world", creator_id: userId, is_published: false, payload: pl })
      .select("id")
      .single();
    if (insErr) { alert(insErr.message); return; }
    navigate(`/expert/editor/${data.id}`, { replace: true });
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
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-eyebrow">Expert Dashboard</div>
          <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">
            Welcome back, <em className="text-indigo-700">{displayName}</em>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Author benchmark worlds, review submissions from peers, or explore published worlds.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewWorld}
          className="rounded-full bg-slate-900 text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" /> New world
        </button>
      </div>

      {/* Quick nav */}
      <div className="px-8 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/expert/review-queue")}
          className="group rounded-2xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition p-5 flex items-center gap-4 text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-5 w-5 text-indigo-700" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Review Queue</div>
            <div className="text-xs text-slate-500">Score worlds from other experts</div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 ml-auto shrink-0 group-hover:translate-x-0.5 transition" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/expert/worlds")}
          className="group rounded-2xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition p-5 flex items-center gap-4 text-left"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Globe className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Published Worlds</div>
            <div className="text-xs text-slate-500">Browse all approved benchmark worlds</div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 ml-auto shrink-0 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* My worlds */}
      <div className="px-8 pb-12">
        <div className="label-eyebrow mb-4">My Worlds</div>
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">{error}</div>
        )}
        {loadingWorlds ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : worlds.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Hammer className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-serif-display text-2xl text-slate-400 italic">No worlds yet.</p>
            <p className="text-sm text-slate-400 mt-2 mb-6">Create your first benchmark world to get started.</p>
            <button
              type="button"
              onClick={handleNewWorld}
              className="rounded-full bg-slate-900 text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition"
            >
              Create your first world
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {worlds.map((w) => (
              <div
                key={w.id}
                className="rounded-3xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col overflow-hidden"
              >
                <div className="px-6 py-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-serif-display text-xl text-slate-900 tracking-tight leading-tight">
                      {w.name}
                    </h3>
                    <StatusPill status={w.status} />
                  </div>
                  {w.payload?.meta?.archetype && (
                    <div className="label-eyebrow mt-1">{String(w.payload.meta.archetype)}</div>
                  )}
                  {w.payload?.taskPrompt && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {String(w.payload.taskPrompt).slice(0, 120)}…
                    </p>
                  )}
                  <div className="mt-3 text-[10px] font-mono text-slate-400">
                    Updated {new Date(w.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/expert/editor/${w.id}`)}
                    className="flex-1 rounded-full bg-slate-900 text-white px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        sessionStorage.setItem("apex_viewer_mode", "expert-world-preview");
                        sessionStorage.setItem("apex_viewer_return_href", "/expert");
                        sessionStorage.setItem(
                          "apex_active_world",
                          JSON.stringify({ meta: w.payload?.meta, ...w.payload })
                        );
                      } catch { /* ignore */ }
                      navigate(`/grader/workspace?id=${SESSION_PREVIEW_WORLD_ID}&noRun=1`);
                    }}
                    title="Preview as user"
                    className="rounded-full border border-slate-200 px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(w.id)}
                    title="Delete"
                    className="rounded-full border border-red-200 px-3 py-2.5 text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
