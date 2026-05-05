import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

interface AuthState {
  loading: boolean;
  profile: Profile | null;
  userId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  loading: true,
  profile: null,
  userId: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const sb = await getSupabase();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) {
          window.location.replace("/login.html");
          return;
        }
        const { data: prof, error } = await sb
          .from("profiles")
          .select("id,email,display_name,role")
          .eq("id", session.user.id)
          .maybeSingle();
        if (cancelled) return;
        if (error || !prof) {
          window.location.replace("/login.html");
          return;
        }
        // All roles (admin / expert / grader) may access the React app
        setProfile(prof as Profile);
        setUserId(session.user.id);
      } catch {
        window.location.replace("/login.html");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => { cancelled = true; };
  }, []);

  async function signOut() {
    try {
      const sb = await getSupabase();
      await sb.auth.signOut({ scope: "local" });
    } catch { /* ignore */ }
    window.location.replace("/login.html");
  }

  return (
    <AuthContext.Provider value={{ loading, profile, userId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
