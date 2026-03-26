import { useMemo, useState } from "react";
import { useAuthStore } from "./store/auth.store";

type Mode = "login" | "register";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AuthPage() {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoginLoading = useAuthStore((s) => s.isLoginLoading);
  const isRegisterLoading = useAuthStore((s) => s.isRegisterLoading);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const isSubmitting = mode === "login" ? isLoginLoading : isRegisterLoading;

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!email.trim()) return "Email is required.";
    if (!isValidEmail(email.trim())) return "Enter a valid email address.";
    return null;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  }, [password, touched.password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    clearError();

    const trimmedEmail = email.trim();
    const hasEmailError = !trimmedEmail || !isValidEmail(trimmedEmail);
    const hasPasswordError = !password || password.length < 8;

    if (hasEmailError || hasPasswordError) return;

    if (mode === "login") {
      await login({ email, password });
      return;
    }

    await register({ email, password });
  }

  function switchMode(nextMode: Mode) {
    clearError();
    setTouched({
      email: false,
      password: false,
    });
    setMode(nextMode);
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-sm font-bold text-slate-950">
            R
          </div>
          <h1 className="text-xl font-semibold">Welcome to Readr</h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "login"
              ? "Sign in to access your reading data."
              : "Create an account to start tracking your library."}
          </p>
        </div>

        <div className="mb-4 flex rounded-xl bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            disabled={isSubmitting}
            className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
              mode === "login"
                ? "bg-slate-700 text-slate-50"
                : "text-slate-300 hover:text-slate-50"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            disabled={isSubmitting}
            className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
              mode === "register"
                ? "bg-slate-700 text-slate-50"
                : "text-slate-300 hover:text-slate-50"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label
              className="mb-1 block text-sm text-slate-300"
              htmlFor="auth-email"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              disabled={isSubmitting}
              aria-invalid={emailError ? "true" : "false"}
              aria-describedby={emailError ? "auth-email-error" : undefined}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-0 transition focus:border-teal-500 disabled:opacity-60"
              placeholder="you@example.com"
              required
            />
            {emailError ? (
              <p id="auth-email-error" className="mt-1 text-sm text-red-300">
                {emailError}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="mb-1 block text-sm text-slate-300"
              htmlFor="auth-password"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              disabled={isSubmitting}
              aria-invalid={passwordError ? "true" : "false"}
              aria-describedby={
                passwordError ? "auth-password-error" : undefined
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-0 transition focus:border-teal-500 disabled:opacity-60"
              placeholder="At least 8 characters"
              required
            />
            {passwordError ? (
              <p id="auth-password-error" className="mt-1 text-sm text-red-300">
                {passwordError}
              </p>
            ) : null}
          </div>

          {error ? (
            <div
              className="rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
