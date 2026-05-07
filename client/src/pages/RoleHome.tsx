import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

/**
 * Renders a redirect to the right home page based on the signed-in user's role.
 * Used for both `/` and the catch-all route so users always land on the page
 * that matches their actual role rather than a hardcoded default.
 */
export default function RoleHome() {
  const { loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const role = String(profile?.role || "").trim().toLowerCase();
  if (role === "admin")  return <Navigate to="/admin" replace />;
  if (role === "expert") return <Navigate to="/expert" replace />;
  if (role === "grader") return <Navigate to="/grader" replace />;

  // No profile loaded yet (or unknown role) → send to login.
  return <Navigate to="/login" replace />;
}
