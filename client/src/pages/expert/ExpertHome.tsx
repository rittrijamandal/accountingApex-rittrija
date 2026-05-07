import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { toDisplayWorld, type DisplayWorld } from "@/lib/types";
import { Hammer, ClipboardCheck, ArrowRight, Loader2, Trash2, Eye } from "lucide-react";

export default function ExpertHome() {
  const { profile, userId, loading: authLoading } = useAuth();
  const { pathname } = useLocation();
  const isBuilderRoute = pathname === '/expert/builder';
  const [worlds, setWorlds] = useState<DisplayWorld[]>([]);
  const [loadingWorlds, setLoadingWorlds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // On the /expert/builder route the table is always visible
  const [showTable, setShowTable] = useState(false);
  const [emailById, setEmailById] = useState<Map<string, string>>(new Map());

  const displayName = (profile?.display_name || profile?.email?.split("@")[0] || "there").split(" ")[0];

  useEffect(() => {
    if (authLoading || !userId) return;
    setLoadingWorlds(true);
    (async () => {
      try {
        const sb = await getSupabase();
        const { data, error: err } = await sb
          .from("worlds")
          .select("id,title,is_published,created_at,updated_at,creator_id,payload")
          .order("updated_at", { ascending: false });
        if (err) { setError(err.message); return; }
        const rows = (data || []).map(toDisplayWorld);
        // put the current user's worlds first
        rows.sort((a, b) => {
          const aMine = a.creatorId === userId ? 0 : 1;
          const bMine = b.creatorId === userId ? 0 : 1;
          if (aMine !== bMine) return aMine - bMine;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        setWorlds(rows);
        if (profile?.role === "admin") {
          const { data: profiles } = await sb.from("profiles").select("id,email");
          const map = new Map((profiles || []).map((p: { id: string; email: string }) => [p.id, p.email] as [string, string]));
          setEmailById(map);
        }
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoadingWorlds(false);
      }
    })();
  }, [authLoading, userId, profile?.role]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this world? This cannot be undone.")) return;
    const sb = await getSupabase();
    const { error: delErr } = await sb.from("worlds").delete().eq("id", id);
    if (delErr) { alert(delErr.message); return; }
    setWorlds((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleNewWorld() {
    const sb = await getSupabase();
    const { emptyPayload } = await import("../../lib/emptyPayload");
    const pl = emptyPayload();
    pl.meta!.name = "New business";
    pl.meta!.period = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    const { data, error: insErr } = await sb
      .from("worlds")
      .insert({ title: "Untitled world", creator_id: userId, is_published: false, payload: pl })
      .select("id")
      .single();
    if (insErr) { alert(insErr.message); return; }
    window.location.href = `/expert-world.html?id=${data.id}`;
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
      <div className="px-8 pt-8 pb-2">
        <div className="label-eyebrow">Expert Workspace</div>
        <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">
          Welcome back, <em className="text-indigo-700">{displayName}</em>
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Author benchmark worlds or review submissions from your peers.
        </p>
      </div>

      {/* Workflow cards */}
      <div className="px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
          {[
            {
              action: "create",
              icon: Hammer,
              eyebrow: "Authoring",
              title: "Create a World",
              desc: "Define a business scenario, upload the data room, write the agent task prompt, and design the grading rubric.",
              cta: "Start authoring",
            },
            {
              to: "/expert/review-queue",
              icon: ClipboardCheck,
              eyebrow: "Peer Review",
              title: "Review Worlds",
              desc: "Score worlds submitted by other experts. Three independent reviewers must score each world before approval.",
              cta: "Open review queue",
            },
          ].map((c) => {
            const inner = (
              <div className="group rounded-3xl bg-white p-10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <c.icon className="h-6 w-6 text-indigo-700" />
                </div>
                <div className="mt-7 label-eyebrow">{c.eyebrow}</div>
                <div className="mt-2 font-serif-display text-3xl text-slate-900 tracking-tight">{c.title}</div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{c.desc}</p>
                <div className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-slate-900 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider group-hover:bg-indigo-700 transition">
                  {c.cta} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            );
            if (c.action === "create") {
              return (
                <button
                  key="create"
                  type="button"
                  onClick={() => isBuilderRoute ? handleNewWorld() : setShowTable(true)}
                  className="text-left"
                >
                  {inner}
                </button>
              );
            }
            return (
              <Link key={c.to} to={c.to!}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Worlds table (always shown on /expert/builder, otherwise revealed by clicking Create a World) */}
      {(showTable || isBuilderRoute) && (
        <div className="px-8 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif-display text-2xl text-slate-900">My Worlds</h2>
            <button
              type="button"
              onClick={handleNewWorld}
              className="rounded-full bg-slate-900 text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition"
            >
              + New world
            </button>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">
              {error}
            </div>
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
                    const isAdmin = profile?.role === "admin";
                    const canEdit = isOwner || isAdmin;
                    return (
                      <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {canEdit ? (
                            <a
                              href={`/expert-world.html?id=${w.id}`}
                              className="text-indigo-700 hover:underline"
                            >
                              {w.name}
                            </a>
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
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {isOwner ? "YOURS" : isAdmin ? (emailById.get(w.creatorId) || w.creatorId.slice(0, 8) + "…") : "—"}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              try {
                                sessionStorage.setItem("apex_viewer_mode", "expert-world-preview");
                                sessionStorage.setItem("apex_viewer_return_href", "/expert");
                                sessionStorage.setItem("apex_active_world", JSON.stringify({ meta: w.payload?.meta, ...w.payload }));
                              } catch { /* ignore */ }
                              window.open("/viewer.html", "_blank");
                            }}
                            title="Sample viewer"
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {canEdit && (
                            <button
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
      )}
    </AppShell>
  );
}
