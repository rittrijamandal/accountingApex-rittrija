import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { toDisplayWorld, type DisplayWorld } from "@/lib/types";
import { ArrowLeft, Loader2, Trash2, Eye } from "lucide-react";

export default function WorldBuilder() {
  const { userId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
          .order("updated_at", { ascending: false })
      )
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          return;
        }
        const rows = (data || []).map(toDisplayWorld);
        rows.sort((a, b) => {
          const aMine = a.creatorId === userId ? 0 : 1;
          const bMine = b.creatorId === userId ? 0 : 1;
          if (aMine !== bMine) return aMine - bMine;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        setWorlds(rows);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingWorlds(false));
  }, [authLoading, userId]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this world? This cannot be undone.")) return;
    const sb = await getSupabase();
    const { error: delErr } = await sb.from("worlds").delete().eq("id", id);
    if (delErr) {
      alert(delErr.message);
      return;
    }
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
    if (insErr) {
      alert(insErr.message);
      return;
    }
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
      <div className="px-8 pt-8 pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/expert"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Expert Home
          </Link>
          <div className="label-eyebrow">Authoring</div>
          <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">World Builder</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Create and edit benchmark worlds. Open any row to edit in split view — use the data room to upload files or ZIP
            archives (they unpack into documents). Save when you are done.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewWorld}
          className="rounded-full bg-slate-900 text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition"
        >
          + New world
        </button>
      </div>

      <div className="px-8 pb-12">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">{error}</div>
        )}

        <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60">
              <tr className="text-left">
                <th className="px-5 py-3.5 label-eyebrow">Title</th>
                <th className="px-5 py-3.5 label-eyebrow">Status</th>
                <th className="px-5 py-3.5 label-eyebrow">Updated</th>
                <th className="px-5 py-3.5 label-eyebrow">Owner</th>
                <th className="px-5 py-3.5 label-eyebrow text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingWorlds ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  </td>
                </tr>
              ) : worlds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic">
                    No worlds yet — create one to open the editor.
                  </td>
                </tr>
              ) : (
                worlds.map((w) => {
                  const isOwner = w.creatorId === userId;
                  const canEdit = isOwner;
                  return (
                    <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {canEdit ? (
                          <Link to={`/expert/editor/${w.id}`} className="text-indigo-700 hover:underline">
                            {w.name}
                          </Link>
                        ) : (
                          w.name
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={w.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                        {new Date(w.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{isOwner ? "YOURS" : "—"}</td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              sessionStorage.setItem("apex_viewer_mode", "expert-world-preview");
                              sessionStorage.setItem("apex_viewer_return_href", "/expert/builder");
                              sessionStorage.setItem(
                                "apex_active_world",
                                JSON.stringify({ meta: w.payload?.meta, ...w.payload })
                              );
                            } catch {
                              /* ignore */
                            }
                            navigate("/grader");
                          }}
                          title="Open grader lobby preview"
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleDelete(w.id)}
                            title="Delete world"
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
    </AppShell>
  );
}
