import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../lib/api";
import { refreshStore } from "../store";

export default function StaffLogin() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirectTo = location.state?.from?.pathname || "/app/dashboard";

  const [email, setEmail] = useState("admin@arcos.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await api.login(email.trim(), password.trim());
      if (result.error) {
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

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Staff Login</h1>
          <p className="text-sm text-gray-400">
            Access the Arcos operations console. Need help? Contact
            {' '}
            <a href="mailto:hello@arcos.com" className="text-white underline">hello@arcos.com</a>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-left text-sm font-medium text-gray-200">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm focus:border-white/30 focus:outline-none"
                placeholder="admin@arcos.com"
                autoComplete="username"
                required
              />
            </label>
            <label className="block text-left text-sm font-medium text-gray-200">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm focus:border-white/30 focus:outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white text-black py-3 font-semibold uppercase tracking-wide hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Back to{' '}
          <Link className="underline hover:text-white" to="/">
            public site
          </Link>
        </p>
      </div>
    </div>
  );
}



