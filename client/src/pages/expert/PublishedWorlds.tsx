import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, Globe } from "lucide-react";

interface PublishedWorld {
  id: string;
  title: string;
  creator_email: string;
  archetype?: string;
  taskPrompt?: string;
  updatedAt: string;
}

export default function PublishedWorlds() {
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<PublishedWorld[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    getSupabase()
      .then(async (sb) => {
        const { data: worldsData, error: wErr } = await sb
          .from("worlds")
          .select("id,title,creator_id,updated_at,payload")
          .eq("is_published", true)
          .order("updated_at", { ascending: false });
        if (wErr) throw wErr;

        const rows = worldsData || [];
        const creatorIds = [...new Set(rows.map((w) => w.creator_id))];
        const emails: Record<string, string> = {};
        if (creatorIds.length > 0) {
          const { data: profs } = await sb
            .from("profiles")
            .select("id,email")
            .in("id", creatorIds);
          (profs || []).forEach((p: { id: string; email: string | null }) => {
            emails[p.id] = p.email || "";
          });
        }

        setWorlds(
          rows.map((w) => ({
            id: w.id,
            title: w.title || "Untitled world",
            creator_email: emails[w.creator_id] || `${w.creator_id.slice(0, 8)}…`,
            archetype: w.payload?.meta?.archetype as string | undefined,
            taskPrompt: w.payload?.taskPrompt as string | undefined,
            updatedAt: w.updated_at,
          }))
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <AppShell sidebar={false}>
      <div className="px-8 pt-8 pb-4">
        <Link
          to="/expert"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Expert Home
        </Link>
        <div className="label-eyebrow">Browse</div>
        <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">Published Worlds</h1>
        <p className="text-sm text-slate-500 mt-2">
          {loading ? "Loading…" : `${worlds.length} approved benchmark world${worlds.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      <div className="px-8 pb-12">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">{error}</div>
        )}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : worlds.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <Globe className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="font-serif-display text-2xl text-slate-400 italic">No published worlds yet.</p>
            <p className="text-sm text-slate-400 mt-2">Worlds approved by admins will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {worlds.map((w) => (
              <div
                key={w.id}
                className="rounded-3xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col overflow-hidden"
              >
                <div className="px-6 py-5 flex-1">
                  <h3 className="font-serif-display text-xl text-slate-900 tracking-tight leading-tight">
                    {w.title}
                  </h3>
                  {w.archetype && (
                    <div className="label-eyebrow mt-1">{w.archetype}</div>
                  )}
                  {w.taskPrompt && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {w.taskPrompt.slice(0, 120)}…
                    </p>
                  )}
                  <div className="mt-3 text-[10px] font-mono text-slate-400">
                    By {w.creator_email} · {new Date(w.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/grader/workspace?id=${w.id}&noRun=1&returnTo=${encodeURIComponent("/expert/worlds")}`)}
                    className="w-full rounded-full bg-emerald-700 text-white px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-emerald-800 transition flex items-center justify-center gap-1.5"
                  >
                    <Globe className="h-3 w-3" /> Enter World
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
