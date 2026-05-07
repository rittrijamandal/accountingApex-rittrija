import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, ClipboardCheck, Hammer, Gauge, LogOut, Shield } from "lucide-react";

const adminHomeNav = [
  { to: "/admin", label: "Admin Dashboard", icon: Shield, exact: true },
];

/** Expert landing — hidden for admins (they use Admin Dashboard + Review Queue + World Builder). */
const expertNav = [
  { to: "/expert",              label: "Expert Home",     icon: LayoutDashboard, exact: true },
  { to: "/expert/review-queue", label: "Review Queue",    icon: ClipboardCheck,  exact: false },
  { to: "/expert/builder",      label: "World Builder",   icon: Hammer,          exact: false },
];

const expertNavNoHome = [
  { to: "/expert/review-queue", label: "Review Queue",    icon: ClipboardCheck,  exact: false },
  { to: "/expert/builder",      label: "World Builder",   icon: Hammer,          exact: false },
];

const graderNav = [
  { to: "/grader", label: "Grader Lobby", icon: Gauge, exact: true },
];

function initials(profile: { display_name?: string; email?: string } | null) {
  if (!profile) return "?";
  const name = profile.display_name || profile.email || "";
  return name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

// ─── Sidebar shell (Admin) ────────────────────────────────────────────────────

function SidebarShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { profile, signOut } = useAuth();
  const role = String(profile?.role || "").toLowerCase();
  const sidebarNav = role === "admin" ? [...adminHomeNav, ...expertNavNoHome] : expertNav;

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <aside className="w-60 shrink-0 m-3 mr-0 bg-white rounded-3xl shadow-sm flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-bold tracking-tight">S</div>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight">Symbal</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-indigo-600 font-semibold">Accounting APEX</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {sidebarNav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <NavLink key={n.to} to={n.to} end={n.exact}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-full text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition",
                  active && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white shadow-sm"
                )}>
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="m-3 p-3 rounded-2xl bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
              {initials(profile)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 truncate">{profile?.display_name || profile?.email || "…"}</div>
              <div className="text-[9px] uppercase tracking-wider text-indigo-600 font-semibold capitalize">{profile?.role || ""}</div>
            </div>
            <button onClick={signOut} title="Sign out" className="text-slate-400 hover:text-slate-700 transition shrink-0">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}

// ─── Topbar shell (Expert / Grader) ──────────────────────────────────────────

function TopbarShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { profile, signOut } = useAuth();
  const isGrader = pathname.startsWith("/grader");
  const role = String(profile?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const backToExpert = role === "expert" || isAdmin;
  const expertBridge = isAdmin ? expertNavNoHome : [{ to: "/expert", label: "Expert Home", icon: LayoutDashboard, exact: true }];
  const nav = isGrader
    ? backToExpert
      ? [...(isAdmin ? adminHomeNav : []), ...expertBridge, ...graderNav]
      : graderNav
    : isAdmin
      ? [...adminHomeNav, ...expertNavNoHome]
      : expertNav;

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50">
      {/* Top bar */}
      <header className="glass-header sticky top-0 z-20 px-6 py-3 flex items-center justify-between border-b border-slate-200/60">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold">S</div>
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-tight leading-none">Symbal</div>
            <div className="text-[8px] uppercase tracking-[0.18em] text-indigo-600 font-semibold leading-none mt-0.5">Accounting APEX</div>
          </div>
        </div>

        {/* Inline nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.exact}
              className={({ isActive }) => cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition",
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}>
              <n.icon className="h-3 w-3" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white rounded-full shadow-sm border border-slate-200 px-3 py-1.5">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[9px] font-semibold flex items-center justify-center shrink-0">
              {initials(profile)}
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[260px]">{profile?.email || "…"}</div>
              <div className="text-[9px] uppercase tracking-wider text-indigo-600 font-semibold leading-none mt-0.5 capitalize">{profile?.role || ""}</div>
            </div>
          </div>
          <button onClick={signOut} title="Sign out"
            className="h-8 w-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function AppShell({
  children,
  sidebar = true,
}: {
  children: React.ReactNode;
  sidebar?: boolean;
}) {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = profile?.role === "admin";
  const adminSidebarShell =
    isAdmin && (pathname.startsWith("/expert") || pathname.startsWith("/admin"));
  const useSidebarLayout = sidebar || adminSidebarShell;

  return useSidebarLayout ? (
    <SidebarShell>{children}</SidebarShell>
  ) : (
    <TopbarShell>{children}</TopbarShell>
  );
}
