import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { resolveAppRole, roleHomeHref } from "@/lib/role";
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

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const appRole = resolveAppRole(null, profile);
  return <Navigate to={roleHomeHref(appRole)} replace />;
}
