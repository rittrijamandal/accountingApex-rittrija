import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/apex/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { Loader2, Search } from "lucide-react";

interface ProfileRow {
  id: string;
  email: string;
  display_name?: string;
  role: "admin" | "expert" | "grader";
  created_at: string;
}

function initials(email: string) {
  return (email || "?").slice(0, 2).toUpperCase();
}

export default function UserDirectory() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    getSupabase()
      .then((sb) => sb.from("profiles").select("id,email,display_name,role,created_at").order("created_at", { ascending: false }))
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return; }
        setUsers((data || []) as ProfileRow[]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading]);

  async function handleRoleChange(userId: string, role: string) {
    if (!isAdmin) return;
    const sb = await getSupabase();
    const { error: err } = await sb.from("profiles").update({ role }).eq("id", userId);
    if (err) { alert(err.message); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: role as ProfileRow["role"] } : u));
  }

  const filtered = users.filter(
    (u) => !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.role.includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <AppShell sidebar={false}>
      <div className="px-8 pt-8 pb-5 flex items-end justify-between">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            <Link to="/admin" className="text-indigo-600 hover:underline font-medium">← Admin dashboard</Link>
          </div>
          <div className="label-eyebrow">Admin · Operations</div>
          <h1 className="mt-2 font-serif-display text-4xl text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-sm text-slate-500 mt-2">
            {loading ? "Loading…" : `${filtered.length} user${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full bg-white shadow-sm pl-10 pr-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            placeholder="Search users…"
          />
        </div>
      </div>

      <div className="px-8 pb-12">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm mb-4">{error}</div>
        )}
        <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60">
              <tr className="text-left">
                <th className="px-5 py-3.5 label-eyebrow">User</th>
                <th className="px-5 py-3.5 label-eyebrow">Name</th>
                <th className="px-5 py-3.5 label-eyebrow">Role</th>
                <th className="px-5 py-3.5 label-eyebrow">Joined</th>
                {isAdmin && <th className="px-5 py-3.5 label-eyebrow text-right">Change Role</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-5 py-10 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-5 py-10 text-center text-slate-400 italic">
                    No users found.
                  </td>
                </tr>
              ) : filtered.map((u) => (
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
      </div>
    </AppShell>
  );
}
