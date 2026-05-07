import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

function goToLogin() {
  // Use the React-internal /login route (NOT /login.html). Vite serves the
  // SPA shell for any path inside the client root, so /login.html ends up
  // serving the same React app and creates an infinite redirect loop.
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

interface AuthState {
  loading: boolean;
  profile: Profile | null;
  userId: string | null;
  authError: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  loading: true,
  profile: null,
  userId: null,
  authError: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [loading, setLoading]     = useState(true);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [userId, setUserId]       = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Skip the auth check on the login page — it manages auth itself.
    // (Re-runs whenever the user navigates AWAY from /login so the profile
    // is loaded after a successful soft sign-in.)
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    // Already loaded for this user — don't re-fetch on every route change.
    if (profile && userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function boot() {
      try {
        const sb = await getSupabase();

        // getUser() makes a verified network call and refreshes an expired JWT,
        // unlike getSession() which returns a potentially stale cached value.
        const { data: { user }, error: userErr } = await sb.auth.getUser();
        if (cancelled) return;

        // No session or explicit auth rejection → go to login.
        const noSession =
          !user ||
          userErr?.status === 401 ||
          (userErr?.message ?? "").toLowerCase().includes("session") ||
          (userErr?.message ?? "").toLowerCase().includes("jwt") ||
          (userErr?.message ?? "").toLowerCase().includes("not authenticated");
        if (noSession) {
          goToLogin();
          return;
        }

        // Any other error (network blip, etc.) → show in-app error; do NOT
        // redirect, which would restart the loop.
        if (userErr) {
          setAuthError(`Auth error: ${userErr.message}. Refresh to retry.`);
          return;
        }

        const { data: prof, error: profErr } = await sb
          .from("profiles")
          .select("id,email,display_name,role")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;

        if (profErr) {
          setAuthError(`Profile fetch failed: ${profErr.message}. Refresh to retry.`);
          return;
        }

        if (!prof) {
          // Profile row missing — go to login so the user can re-authenticate.
          goToLogin();
          return;
        }

        setProfile(prof as Profile);
        setUserId(user.id);
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        // Only redirect for auth-specific failures; show error for the rest.
        if (msg.toLowerCase().includes("jwt") || msg.toLowerCase().includes("auth")) {
          goToLogin();
        } else {
          setAuthError(`Unexpected error: ${msg}. Refresh to retry.`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function signOut() {
    try {
      const sb = await getSupabase();
      await sb.auth.signOut({ scope: "local" });
    } catch { /* ignore */ }
    goToLogin();
  }

  if (authError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", flexDirection: "column", gap: 12, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "32px 40px", maxWidth: 420, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 16px" }}>{authError}</p>
          <button onClick={() => window.location.reload()} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 999, padding: "10px 24px", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: ".05em" }}>
            RETRY
          </button>
          <button onClick={goToLogin} style={{ background: "transparent", color: "#64748b", border: "none", borderRadius: 999, padding: "10px 24px", fontSize: 12, cursor: "pointer", marginLeft: 8 }}>
            Sign in again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ loading, profile, userId, authError, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
