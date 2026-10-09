import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ExternalLink } from "lucide-react";
import { fetchMixLog, type MixLogEntry } from "../mixlab/core";

const STAFF_BASE = "http://192.168.2.103/staff.html";

function fmtDry(g?: number): string {
  const n = Number(g) || 0;
  return n >= 1000
    ? `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`
    : `${Math.round(n).toLocaleString()} g`;
}

function fmtWhen(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function MixLog() {
  const [entries, setEntries] = useState<MixLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recipeFilter, setRecipeFilter] = useState("");
  const [personFilter, setPersonFilter] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMixLog();
      setEntries(data);
    } catch {
      setEntries([]);
      setError("Could not reach Mix Lab mix log.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recipeNames = useMemo(
    () => [...new Set(entries.map((e) => e.recipeName || "Untitled"))].sort(),
    [entries]
  );

  const rows = useMemo(() => {
    const person = personFilter.trim().toLowerCase();
    return entries.filter((e) => {
      if (recipeFilter && (e.recipeName || "Untitled") !== recipeFilter) return false;
      if (person && !(e.weighedBy || "").toLowerCase().includes(person)) return false;
      return true;
    });
  }, [entries, recipeFilter, personFilter]);

  return (
    <div className="space-y-6 min-w-0">
      <header className="border-b border-white/10 pb-6 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Recipes · floor</p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-black uppercase leading-tight">Mix log</h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Batches from Staff weigh-out. Stored in Arcos DB — same record Mix Lab writes to. Link a{" "}
              <Link to="/app/mix-projects" className="text-white underline-offset-2 hover:underline">
                project
              </Link>{" "}
              for customer trials.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 text-xs font-bold uppercase tracking-wider hover:bg-white/5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <label className="flex flex-col gap-1.5 min-w-[180px]">
          <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Recipe</span>
          <select
            value={recipeFilter}
            onChange={(e) => setRecipeFilter(e.target.value)}
            className="h-11 px-3 bg-[#353535] border border-white/10 text-sm text-white"
          >
            <option value="">All recipes</option>
            {recipeNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 min-w-[180px] flex-1">
          <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Weighed by</span>
          <input
            type="search"
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            placeholder="Anyone"
            className="h-11 px-3 bg-[#353535] border border-white/10 text-sm text-white placeholder:text-gray-500"
          />
        </label>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-gray-300 border border-white/10 bg-white/5">{error}</div>
      )}

      <section className="border border-white/10 bg-[#353535] overflow-hidden">
        {loading && <div className="p-6 text-sm text-gray-400">Loading mix log…</div>}
        {!loading && !rows.length && (
          <div className="p-6 text-sm text-gray-400">
            No mixes logged yet. Print a ticket from Mix Lab Staff to start the log.
          </div>
        )}
        {!loading && rows.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/10">
              {rows.map((e, i) => (
                <div key={e.id || `${e.at}-${i}`} className="p-4 space-y-2">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{e.recipeName || "Untitled"}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{fmtWhen(e.at)}</div>
                    </div>
                    <div className="text-sm font-mono text-gray-300 shrink-0">{fmtDry(e.dryWeight)}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {e.weighedBy || "—"} · {e.source || "staff"}
                    {e.projectId ? ` · project ${e.projectId}` : ""}
                  </div>
                  {e.recipeId && (
                    <a
                      href={`${STAFF_BASE}?r=${encodeURIComponent(e.recipeId)}${e.dryWeight ? `&d=${Math.round(Number(e.dryWeight))}` : ""}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white"
                    >
                      Open ticket <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3 font-bold">When</th>
                    <th className="px-4 py-3 font-bold">Recipe</th>
                    <th className="px-4 py-3 font-bold">Project</th>
                    <th className="px-4 py-3 font-bold">Weighed by</th>
                    <th className="px-4 py-3 font-bold text-right">Dry</th>
                    <th className="px-4 py-3 font-bold text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rows.map((e, i) => (
                    <tr key={e.id || `${e.at}-${i}`} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">{fmtWhen(e.at)}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{e.recipeName || "Untitled"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{e.source || "staff"}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                        {e.projectId ? (
                          <Link to="/app/mix-projects" className="hover:text-white">
                            {e.projectId}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{e.weighedBy || "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-300">{fmtDry(e.dryWeight)}</td>
                      <td className="px-4 py-3 text-right">
                        {e.recipeId ? (
                          <a
                            href={`${STAFF_BASE}?r=${encodeURIComponent(e.recipeId)}${e.dryWeight ? `&d=${Math.round(Number(e.dryWeight))}` : ""}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white"
                          >
                            Ticket <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <div className="text-xs text-gray-500 flex flex-wrap gap-4">
        <Link to="/app/mix-projects" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
          Projects →
        </Link>
        <Link to="/app/studio" className="text-gray-300 hover:text-white underline-offset-2 hover:underline">
          Mix designer →
        </Link>
        <a
          href="http://192.168.2.103/log.html"
          target="_blank"
          rel="noreferrer"
          className="text-gray-300 hover:text-white underline-offset-2 hover:underline"
        >
          Open on Mix Lab →
        </a>
      </div>
    </div>
  );
}
