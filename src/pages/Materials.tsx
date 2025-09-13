import React, { useMemo, useState } from "react";
import { load, save } from "../store";
import type { AppState, Material, Currency } from "../types";
import NumberField from "../components/NumberField";

const newid = () => Math.random().toString(36).slice(2, 10);

export default function Materials() {
  const [state, setState] = useState<AppState>(() => load());

  const add = () => {
    const m: Material = {
      id: newid(),
      name: "New Material",
      densityKgM3: undefined,
      pricePerKg: undefined,
      priceCurrency: "IDR",
    };
    const next = { ...state, materials: [m, ...state.materials] };
    setState(next); save(next);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this material?")) return;
    const next = { ...state, materials: state.materials.filter(m => m.id !== id) };
    setState(next); save(next);
  };

  const update = (id: string, patch: Partial<Material>) => {
    const list = state.materials.map(m => m.id === id ? { ...m, ...patch } : m);
    const next = { ...state, materials: list };
    setState(next); save(next);
  };

  const mats = useMemo(() => state.materials, [state.materials]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">Materials</h1>
        <button className="rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black shadow" onClick={add}>
          + Add material
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400">
            <tr>
              <th className="py-3 px-4 border-b border-white/10">Name</th>
              <th className="py-3 px-4 border-b border-white/10">Density (kg/m³)</th>
              <th className="py-3 px-4 border-b border-white/10">Price / kg</th>
              <th className="py-3 px-4 border-b border-white/10">Currency</th>
              <th className="py-3 px-4 border-b border-white/10"></th>
            </tr>
          </thead>
          <tbody>
            {mats.map(m => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="py-3 px-4 border-b border-white/5">
                  <input
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={m.name}
                    onChange={e => update(m.id, { name: e.target.value })}
                  />
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <NumberField
                    className="w-40 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={m.densityKgM3}
                    onChange={(v) => update(m.id, { densityKgM3: v ?? undefined })}
                    step="1"
                  />
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <NumberField
                    className="w-40 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={m.pricePerKg}
                    onChange={(v) => update(m.id, { pricePerKg: v ?? undefined })}
                    step="0.01"
                  />
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <select
                    className="w-32 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={m.priceCurrency || "IDR"}
                    onChange={e => update(m.id, { priceCurrency: e.target.value as Currency })}
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <button className="text-red-300 text-sm hover:underline" onClick={() => remove(m.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!mats.length && (
              <tr><td className="py-6 px-4 text-gray-400" colSpan={5}>No materials. Click “Add material”.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
