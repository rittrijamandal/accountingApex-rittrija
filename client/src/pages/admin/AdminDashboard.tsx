import { useEffect, useState } from "react";
import { AppShell } from "@/components/apex/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AdminStats {
  totalUsers: number;
  totalWorlds: number;
  publishedWorlds: number;
  inReviewWorlds: number;
  draftWorlds: number;
  totalReviews: number;
  avgScore: number | null;
  roleBreakdown: { name: string; value: number }[];
  statusBreakdown: { name: string; value: number }[];
  scoreDistribution: { score: string; count: number }[];
}

const ROLE_COLORS = ["#6366f1", "#10b981", "#94a3b8"];
const STATUS_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#94a3b8"];

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-3xl bg-white shadow-sm p-6">
      <div className="label-eyebrow">{label}</div>
      <div className="mt-2 font-serif-display text-4xl text-slate-900 leading-none">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = String(profile?.role || "").trim().toLowerCase() === "admin";
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    getSupabase()
      .then(async (sb) => {
        const [
          { data: profiles },
          { data: worlds },
          { data: scores },
        ] = await Promise.all([
          sb.from("profiles").select("id,role"),
          sb.from("worlds").select("id,is_published,payload"),
          sb.from("world_review_scores").select("world_id,score"),
        ]);

        const roleCount: Record<string, number> = { admin: 0, expert: 0, grader: 0 };
        (profiles || []).forEach((u) => { roleCount[u.role] = (roleCount[u.role] || 0) + 1; });

        const published = (worlds || []).filter((w) => w.is_published).length;
        const inReview = (worlds || []).filter((w) => !w.is_published && w.payload?.review?.status === "in_review").length;
        const draft = (worlds || []).length - published - inReview;

        const allScores = (scores || []).map((s) => Number(s.score));
        const avgScore = allScores.length > 0
          ? allScores.reduce((a, b) => a + b, 0) / allScores.length
          : null;

        const scoreDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        allScores.forEach((s) => { if (s >= 1 && s <= 5) scoreDist[Math.round(s)]++; });

        setStats({
          totalUsers: (profiles || []).length,
          totalWorlds: (worlds || []).length,
          publishedWorlds: published,
          inReviewWorlds: inReview,
          draftWorlds: draft,
          totalReviews: (scores || []).length,
          avgScore,
          roleBreakdown: [
            { name: "Expert", value: roleCount.expert || 0 },
            { name: "Grader", value: roleCount.grader || 0 },
            { name: "Admin", value: roleCount.admin || 0 },
          ].filter((r) => r.value > 0),
          statusBreakdown: [
            { name: "Published", value: published },
            { name: "In Review", value: inReview },
            { name: "Draft", value: draft },
          ].filter((s) => s.value > 0),
          scoreDistribution: [1, 2, 3, 4, 5].map((n) => ({
            score: `${n} ★`,
            count: scoreDist[n],
          })),
        });
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
        <div className="label-eyebrow">Operations</div>
        <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">Admin Dashboard</h1>
        {!isAdmin && (
          <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 inline-block">
            View-only — you can see data but only admins can make changes.
          </p>
        )}
      </div>

      {error && (
        <div className="mx-8 mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm">{error}</div>
      )}

      {loading || !stats ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="px-8 pb-12 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Total Worlds" value={stats.totalWorlds} />
            <StatCard label="Published" value={stats.publishedWorlds} />
            <StatCard label="Total Reviews" value={stats.totalReviews} />
            <StatCard
              label="Avg Review Score"
              value={stats.avgScore != null ? `${stats.avgScore.toFixed(1)} / 5` : "—"}
              sub={stats.totalReviews > 0 ? `across ${stats.totalReviews} review${stats.totalReviews !== 1 ? "s" : ""}` : "no reviews yet"}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* World status breakdown */}
            <div className="rounded-3xl bg-white shadow-sm p-6">
              <div className="label-eyebrow mb-1">World Status</div>
              <p className="text-xs text-slate-500 mb-4">Breakdown by review stage</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} world${v !== 1 ? "s" : ""}`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* User role breakdown */}
            <div className="rounded-3xl bg-white shadow-sm p-6">
              <div className="label-eyebrow mb-1">User Roles</div>
              <p className="text-xs text-slate-500 mb-4">Distribution across roles</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.roleBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.roleBreakdown.map((_, i) => (
                      <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} user${v !== 1 ? "s" : ""}`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Score distribution */}
            <div className="rounded-3xl bg-white shadow-sm p-6">
              <div className="label-eyebrow mb-1">Score Distribution</div>
              <p className="text-xs text-slate-500 mb-4">Review scores across all worlds</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.scoreDistribution} barSize={28}>
                  <XAxis dataKey="score" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip formatter={(v: number) => [`${v} review${v !== 1 ? "s" : ""}`, "Count"]} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-white shadow-sm p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                <span className="font-serif-display text-xl text-indigo-700">{stats.inReviewWorlds}</span>
              </div>
              <div>
                <div className="label-eyebrow">In Review</div>
                <div className="text-xs text-slate-500 mt-0.5">worlds awaiting approval</div>
              </div>
            </div>
            <div className="rounded-3xl bg-white shadow-sm p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <span className="font-serif-display text-xl text-amber-700">{stats.draftWorlds}</span>
              </div>
              <div>
                <div className="label-eyebrow">Draft</div>
                <div className="text-xs text-slate-500 mt-0.5">worlds not yet submitted</div>
              </div>
            </div>
            <div className="rounded-3xl bg-white shadow-sm p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <span className="font-serif-display text-xl text-emerald-700">
                  {stats.totalUsers > 0 ? (stats.totalReviews / stats.totalUsers).toFixed(1) : "—"}
                </span>
              </div>
              <div>
                <div className="label-eyebrow">Reviews / User</div>
                <div className="text-xs text-slate-500 mt-0.5">avg engagement rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
