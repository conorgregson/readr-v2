import { NavLink, Outlet } from "react-router-dom";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "px-3 py-2 rounded-lg text-sm transition",
    isActive
      ? "bg-slate-800 text-slate-50"
      : "text-slate-300 hover:bg-slate-900 hover:text-slate-50",
  ].join(" ");
}

export function AppShell() {
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
              <span className="text-xs text-slate-400">v2.1 · React</span>
            </div>
          </div>

          <nav className="flex items-center gap-1">
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
