import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { api } from "../lib/api";
import { fmtIdr, num, type LabourPreset } from "../lib/jobPricing";

const field =
  "w-full px-3 py-2.5 bg-[#2a2a2a] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none tabular-nums";

export default function JobLabourPresets() {
  const [all, setAll] = useState<LabourPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.getJobLabourPresets().then((r) => {
      if (r.data) setAll(r.data as LabourPreset[]);
      else if (r.error) setMsg(r.error);
      setLoading(false);
    });
  }, []);

  const shop = all.filter((p) => p.scope === "shop");
  const area = all.filter((p) => p.scope === "area");

  const patch = (id: string, key: "hourly_rate_idr" | "amount_idr", raw: string) => {
    setAll((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (raw.trim() === "") return { ...p, [key]: null };
        return { ...p, [key]: num(raw) };
      }),
    );
  };

  const save = async () => {
    setSaving(true);
    setMsg("");
    // Save shop hourly + area per-m2 (API updates hourly_rate_idr and amount_idr)
    const r = await api.saveJobLabourPresets(all);
    setSaving(false);
    if (r.error) {
      setMsg(r.error);
      return;
    }
    if (r.data) setAll(r.data as LabourPreset[]);
    setMsg("Saved");
    setTimeout(() => setMsg(""), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-2">
          <Link
            to="/app/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Jobs
          </Link>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider">Labour presets</h1>
          <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
            Shop hourly rates for custom pieces (× hours on the line). Microcement / area = Rp per m² by complexity.
            Leave empty until you set rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {msg ? <span className="text-xs text-gray-400">{msg}</span> : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <section className="border border-white/10 bg-[#353535] p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                Piece — hourly rate
              </h2>
              <p className="text-xs text-gray-500 mt-1">Tables, sinks, custom objects. Line enters hours.</p>
            </div>
            <div className="space-y-3">
              {shop.map((p) => (
                <div key={p.id} className="grid grid-cols-[1fr_140px] gap-2 items-center">
                  <div>
                    <p className="text-sm font-semibold text-white">{p.label}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">IDR / hour</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    placeholder="Empty"
                    value={p.hourly_rate_idr == null ? "" : p.hourly_rate_idr}
                    onChange={(e) => patch(p.id, "hourly_rate_idr", e.target.value)}
                    className={field}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="border border-white/10 bg-[#353535] p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                Microcement — per m²
              </h2>
              <p className="text-xs text-gray-500 mt-1">Area jobs. Labour Rp per m² × qty m².</p>
            </div>
            <div className="space-y-3">
              {area.map((p) => (
                <div key={p.id} className="grid grid-cols-[1fr_140px] gap-2 items-center">
                  <div>
                    <p className="text-sm font-semibold text-white">{p.label}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">IDR / m²</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    placeholder="Empty"
                    value={p.amount_idr == null ? "" : p.amount_idr}
                    onChange={(e) => patch(p.id, "amount_idr", e.target.value)}
                    className={field}
                  />
                </div>
              ))}
              {!area.length ? (
                <p className="text-xs text-amber-300/80">Area presets missing — redeploy backend migrations.</p>
              ) : null}
            </div>
            <p className="text-[11px] text-gray-500">
              Preview:{" "}
              {area.map((p) => `${p.label} ${p.amount_idr == null ? "—" : fmtIdr(p.amount_idr)}`).join(" · ") ||
                "—"}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
