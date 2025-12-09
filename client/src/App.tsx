import { Routes, Route, NavLink } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal flex items-center justify-center text-xs font-bold">
              R
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm tracking-wide">Readr</span>
              <span className="text-xs text-slate-400">
                v2 · Full-stack rewrite
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-teal transition ${
                  isActive ? "text-teal font-medium" : "text-slate-300"
                }`
              }
            >
              Books
            </NavLink>
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                `hover:text-teal transition ${
                  isActive ? "text-teal font-medium" : "text-slate-300"
                }`
              }
            >
              Sessions
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `hover:text-teal transition ${
                  isActive ? "text-teal font-medium" : "text-slate-300"
                }`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<BooksPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function BooksPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">Books</h1>
      <p className="text-sm text-slate-400">
        v2.0 starting point. Recreate the v1.9 Books grid, filters, and search
        in React here.
      </p>
    </section>
  );
}

function SessionsPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">Sessions</h1>
      <p className="text-sm text-slate-400">
        This will become the session history view with streaks, summaries, and
        search.
      </p>
    </section>
  );
}

function SettingsPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">Settings & Profile</h1>
      <p className="text-sm text-slate-400">
        Eventually: goals, badges, shortcuts, backup/import preferences, and
        theme toggles.
      </p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-slate-400">
        This route doesn't exist yet. Try Books, Sessions, or Settings.
      </p>
    </section>
  );
}

export default App;
