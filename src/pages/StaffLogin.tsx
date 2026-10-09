import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../state/auth";
import { refreshStore } from "../store";
import ArcosLogo from "../components/ArcosLogo";
import { SupergraphicStrip } from "../components/brand/Supergraphic";

export default function StaffLogin() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const redirectTo = location.state?.from?.pathname || "/app/dashboard";
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState("admin@arcos.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(email.trim(), password.trim());
      if (!result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }
      await refreshStore();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  const field =
    "mt-2 w-full border border-white/10 bg-[#232323] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20";

  return (
    <div className="min-h-screen bg-[#232323] text-white flex flex-col">
      <header className="border-b border-white/10">
        <div className="h-14 sm:h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
            <ArcosLogo size="medium" variant="light" />
          </Link>
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.2em] font-semibold text-gray-500 hover:text-white transition-colors"
          >
            Public site
          </Link>
        </div>
        <SupergraphicStrip variant="on-black" height={3} className="opacity-40" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Operations</p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase leading-tight tracking-tight">
              Staff Login
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed max-w-md">
              Sign in to the Arcos console — mixes, jobs, catalog, and lab.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-white/10 bg-[#353535] p-6 sm:p-8 space-y-6"
          >
            <div className="space-y-4">
              <label className="block text-left">
                <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={field}
                  placeholder="you@arcos.com"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="block text-left">
                <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={field}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            {error && (
              <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center sm:text-left text-xs text-gray-500">
            Need access?{" "}
            <a href="mailto:hello@arcos.com" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
              hello@arcos.com
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 uppercase tracking-wider">
          <ArcosLogo size="small" variant="light" />
          <span>Concrete management system</span>
        </div>
      </footer>
    </div>
  );
}
