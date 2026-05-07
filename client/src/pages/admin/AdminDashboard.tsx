import { useEffect, useState } from "react";
import { AppShell } from "@/components/apex/AppShell";
import { StatusPill } from "@/components/apex/StatusPill";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { toReviewStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2, MoreHorizontal, Trash2, ExternalLink } from "lucide-react";

interface ProfileRow {
  id: string;
  email: string;
  display_name?: string;
  role: "admin" | "expert" | "grader";
  created_at: string;
}

interface WorldAdminRow {
  id: string;
  title: string;
  creator_id: string;
  creator_email: string;
  is_published: boolean;
  archetype: string;
  review_status: string;
  reviewer_count: number;
  median_score: number | null;
  review_scores: { reviewer_email: string; score: number; notes: string }[];
}

interface AdminData {
  profiles: ProfileRow[];
  worlds: WorldAdminRow[];
  stats: { totalUsers: number; publishedWorlds: number; totalWorlds: number };
}

function initials(email: string) {
  return (email || "?").slice(0, 2).toUpperCase();
}

function ReviewerDots({ scores, count }: { scores: { reviewer_email: string; score: number }[]; count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 3 }).map((_, i) => {
        const r = scores[i];
        return (
          <div
            key={i}
            title={r ? `${r.reviewer_email} · ${r.score}/5` : "Pending"}
            className={cn(
              "h-6 w-6 rounded-full text-[9px] font-bold flex items-center justify-center",
              i < count ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
            )}
          >
            {r ? initials(r.reviewer_email) : i + 1}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [tab, setTab] = useState<"worlds" | "users">("worlds");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    getSupabase()
      .then(async (sb) => {
        const [
          { data: profiles, error: pErr },
          { data: worlds, error: wErr },
          { data: scores, error: sErr },
        ] = await Promise.all([
          sb.from("profiles").select("id,email,display_name,role,created_at").order("created_at", { ascending: false }),
          sb.from("worlds").select("id,title,creator_id,is_published,payload,created_at").order("created_at", { ascending: false }),
          sb.from("world_review_scores").select("world_id,reviewer_id,score,notes"),
        ]);
        if (pErr || wErr || sErr) throw pErr || wErr || sErr;

        const userById = new Map((profiles || []).map((u) => [u.id, u]));
        const scoresByWorld = new Map<string, { reviewer_email: string; score: number; notes: string }[]>();
        (scores || []).forEach((r) => {
          if (!scoresByWorld.has(r.world_id)) scoresByWorld.set(r.world_id, []);
          scoresByWorld.get(r.world_id)!.push({
            reviewer_email: userById.get(r.reviewer_id)?.email || r.reviewer_id.slice(0, 8),
            score: Number(r.score),
            notes: r.notes || "",
          });
        });

        const worldRows: WorldAdminRow[] = (worlds || []).map((w) => {
          const reviewScores = scoresByWorld.get(w.id) || [];
          const reviewCount = Math.min(3, Number(w.payload?.review?.reviewer_count || reviewScores.length));
          const medianScore = w.payload?.review?.median_score != null ? Number(w.payload.review.median_score) : null;
          return {
            id: w.id,
            title: w.title || "Untitled",
            creator_id: w.creator_id,
            creator_email: userById.get(w.creator_id)?.email || w.creator_id.slice(0, 8) + "…",
            is_published: Boolean(w.is_published),
            archetype: w.payload?.meta?.archetype || "—",
            review_status: String(w.payload?.review?.status || "draft"),
            reviewer_count: reviewCount,
            median_score: medianScore,
            review_scores: reviewScores,
          };
        });

        setData({
          profiles: (profiles || []) as ProfileRow[],
          worlds: worldRows,
          stats: {
            totalUsers: (profiles || []).length,
            publishedWorlds: (worlds || []).filter((w) => w.is_published).length,
            totalWorlds: (worlds || []).length,
          },
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading]);

  async function handleRoleChange(userId: string, role: string) {
    if (!isAdmin) return;
    const sb = await getSupabase();
    const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
    if (error) { alert(error.message); return; }
    setData((prev) => prev ? {
      ...prev,
      profiles: prev.profiles.map((u) => u.id === userId ? { ...u, role: role as ProfileRow["role"] } : u),
    } : prev);
  }

  async function handleDeleteWorld(worldId: string) {
    if (!isAdmin) return;
    if (!confirm("Force delete this world? This cannot be undone.")) return;
    const sb = await getSupabase();
    const { error } = await sb.from("worlds").delete().eq("id", worldId);
    if (error) { alert(error.message); return; }
    setData((prev) => prev ? { ...prev, worlds: prev.worlds.filter((w) => w.id !== worldId) } : prev);
  }

  async function handleTogglePublish(worldId: string, current: boolean) {
    if (!isAdmin) return;
    const sb = await getSupabase();
    const { error } = await sb.from("worlds").update({ is_published: !current }).eq("id", worldId);
    if (error) { alert(error.message); return; }
    setData((prev) => prev ? {
      ...prev,
      worlds: prev.worlds.map((w) => w.id === worldId ? { ...w, is_published: !current } : w),
    } : prev);
  }

  const q = search.toLowerCase();
  const filteredWorlds = data?.worlds.filter(
    (w) => !q || w.title.toLowerCase().includes(q) || w.creator_email.toLowerCase().includes(q)
  ) ?? [];
  const filteredUsers = data?.profiles.filter(
    (u) => !q || u.email.toLowerCase().includes(q) || u.role.includes(q)
  ) ?? [];

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
      <div className="px-8 pt-8 pb-4">
        <div className="label-eyebrow">Operations</div>
        <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">Admin Dashboard</h1>
        {!isAdmin && (
          <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 inline-block">
            View-only — you can see data but only admins can make changes.
          </p>
        )}
      </div>

      {/* Stat cards */}
      {data && (
        <div className="px-8 pb-4 grid grid-cols-3 gap-4 max-w-3xl">
          {[
            { label: "Total Users", value: data.stats.totalUsers },
            { label: "Published Worlds", value: data.stats.publishedWorlds },
            { label: "Total Worlds", value: data.stats.totalWorlds },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl bg-white shadow-sm p-6">
              <div className="label-eyebrow">{s.label}</div>
              <div className="mt-2 font-serif-display text-4xl text-slate-900">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs + search */}
      <div className="px-8 pb-4 flex items-center justify-between">
        <div className="inline-flex rounded-full bg-white shadow-sm p-1">
          {(["worlds", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition",
                tab === t ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {t === "worlds" ? "World Directory" : "User Directory"}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === "worlds" ? "Search worlds…" : "Search users…"}
          className="rounded-full bg-white shadow-sm px-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {/* Table */}
      <div className="px-8 pb-12">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : tab === "worlds" ? (
          <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60">
                <tr className="text-left">
                  <th className="px-5 py-3.5 label-eyebrow">World</th>
                  <th className="px-5 py-3.5 label-eyebrow">Creator</th>
                  <th className="px-5 py-3.5 label-eyebrow">Review Status</th>
                  <th className="px-5 py-3.5 label-eyebrow">Reviewers</th>
                  <th className="px-5 py-3.5 label-eyebrow">Median Score</th>
                  {isAdmin && <th className="px-5 py-3.5 label-eyebrow text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredWorlds.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="px-5 py-10 text-center text-slate-400 italic">No worlds found.</td></tr>
                ) : filteredWorlds.map((w) => {
                  const status = w.is_published ? "APPROVED" : toReviewStatus(w.review_status);
                  return (
                    <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{w.title}</div>
                        <div className="text-xs text-slate-400 font-mono">{w.archetype}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs font-mono">{w.creator_email}</td>
                      <td className="px-5 py-4"><StatusPill status={status} /></td>
                      <td className="px-5 py-4">
                        <ReviewerDots scores={w.review_scores} count={w.reviewer_count} />
                      </td>
                      <td className="px-5 py-4">
                        {w.median_score != null ? (
                          <span className={cn(
                            "font-serif-display text-xl",
                            w.median_score >= 4 ? "text-emerald-700" : w.median_score >= 3 ? "text-slate-900" : "text-red-700"
                          )}>
                            {w.median_score.toFixed(1)}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-right relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === w.id ? null : w.id)}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-slate-200 inline-flex items-center gap-1.5 transition"
                          >
                            Actions <MoreHorizontal className="h-3 w-3" />
                          </button>
                          {openMenu === w.id && (
                            <div className="absolute right-4 top-full mt-1 w-48 bg-white rounded-2xl shadow-lg z-20 overflow-hidden p-1">
                              <a
                                href={`/expert-world.html?id=${w.id}&isAdminOverride=true`}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> Edit World
                              </a>
                              <button
                                onClick={() => { handleTogglePublish(w.id, w.is_published); setOpenMenu(null); }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-emerald-50 text-emerald-700 font-semibold"
                              >
                                {w.is_published ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                onClick={() => { handleDeleteWorld(w.id); setOpenMenu(null); }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-red-50 text-red-700 font-semibold flex items-center gap-2"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60">
                <tr className="text-left">
                  <th className="px-5 py-3.5 label-eyebrow">User</th>
                  <th className="px-5 py-3.5 label-eyebrow">First Name</th>
                  <th className="px-5 py-3.5 label-eyebrow">Role</th>
                  <th className="px-5 py-3.5 label-eyebrow">Joined</th>
                  {isAdmin && <th className="px-5 py-3.5 label-eyebrow text-right">Change Role</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 5 : 4} className="px-5 py-10 text-center text-slate-400 italic">No users found.</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {initials(u.email)}
                        </div>
                        <span className="font-mono text-xs text-slate-700">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {u.display_name || <span className="text-slate-300 italic text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                          <option value="admin">Admin</option>
                          <option value="expert">Expert</option>
                          <option value="grader">Grader</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
