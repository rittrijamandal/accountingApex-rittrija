import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

function rolePath(role: string | undefined) {
  const r = String(role || "").trim().toLowerCase();
  if (r === "admin")  return "/admin";
  if (r === "expert") return "/expert";
  if (r === "grader") return "/grader";
  // Unknown role → fall back to grader (least-privileged) rather than /expert
  return "/grader";
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [busy, setBusy]         = useState(false);
  const [checking, setChecking] = useState(true);

  // If already signed in, hop straight to the role home.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sb = await getSupabase();
        const { data: { user } } = await sb.auth.getUser();
        if (cancelled || !user) { setChecking(false); return; }
        const { data: prof } = await sb
          .from("profiles")
          .select("id,email,role")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (prof) {
          const role = (prof as { role?: string }).role;
          // Helpful for debugging "wrong destination after login" issues.
          console.info("[Login] auto-redirect: signed in as", (prof as { email?: string }).email, "role=", role);
          navigate(rolePath(role), { replace: true });
          return;
        }
      } catch { /* fall through to login form */ }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const sb = await getSupabase();
      const { error: signInErr } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (signInErr) throw signInErr;
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error("Sign-in succeeded but no user returned.");
      const { data: prof, error: profErr } = await sb
        .from("profiles")
        .select("id,email,role")
        .eq("id", user.id)
        .maybeSingle();
      if (profErr) throw profErr;
      if (!prof) throw new Error("Profile missing. Run the SQL migration and try again.");
      const role = (prof as { role?: string }).role;
      console.info("[Login] sign-in success:", (prof as { email?: string }).email, "role=", role, "→", rolePath(role));
      navigate(rolePath(role), { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-sm font-bold">S</div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">Symbal</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-indigo-600 font-semibold leading-none mt-1">Accounting APEX</div>
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold text-center mb-6">
          Sign in with email
        </p>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-slate-900 text-white py-3 text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] uppercase tracking-wider text-slate-500">
          Don't have an account? <a href="/signup.html" className="text-indigo-600 font-semibold hover:underline">Create one</a>
        </div>
      </div>
    </div>
  );
}
