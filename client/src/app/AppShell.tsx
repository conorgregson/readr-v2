import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { AuthPage } from "../features/auth/page";
import { useAuthStore } from "../features/auth/store/auth.store";
import { useBooksStore } from "../features/books/store/books.store";
import { useSessionsStore } from "../features/sessions/store/sessions.store";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "px-3 py-2 rounded-lg text-sm transition",
    isActive
      ? "bg-slate-800 text-slate-50"
      : "text-slate-300 hover:bg-slate-900 hover:text-slate-50",
  ].join(" ");
}

function AuthBootstrapScreen() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div
        className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-5 shadow-xl"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-sm text-slate-300">Restoring your session...</p>
      </div>
    </div>
  );
}

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const restoreAuth = useAuthStore((s) => s.restoreAuth);
  const logout = useAuthStore((s) => s.logout);

  const resetBooks = useBooksStore((s) => s.reset);
  const resetSessions = useSessionsStore((s) => s.reset);

  useEffect(() => {
    void restoreAuth();
  }, [restoreAuth]);

  function handleLogout() {
    resetBooks();
    resetSessions();
    logout();
  }

  if (isBootstrapping) {
    return <AuthBootstrapScreen />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-xs font-bold text-slate-950">
              R
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm tracking-wide">Readr</span>
              <span className="text-xs text-slate-400">v2.3 · Auth</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1" aria-label="Primary">
              <NavLink to="/" end className={navClass}>
                Books
              </NavLink>
              <NavLink to="/sessions" className={navClass}>
                Sessions
              </NavLink>
              <NavLink to="/settings" className={navClass}>
                Settings
              </NavLink>
            </nav>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>{user?.email}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
