// src/pages/Processes.tsx
import React, { useEffect, useMemo, useState } from "react";
import { load, save } from "../store";
import type { AppState } from "../types";
import { getProcesses, DEFAULT_PROCESSES, type ProcessItem } from "../lib/process";

const newid = () => Math.random().toString(36).slice(2, 10);

export default function Processes() {
  const [state, setState] = useState<AppState>(() => load());

  // Local working copy (so you can cancel changes if you want later)
  const initialList = useMemo<ProcessItem[]>(
    () => getProcesses(state),
    [state]
  );
  const [items, setItems] = useState<ProcessItem[]>(initialList);

  // If state changes elsewhere (e.g., in another tab), refresh the editor
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cw_app_state") {
        const fresh = load();
        setState(fresh);
        setItems(getProcesses(fresh));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function pushDefault() {
    // Merge defaults that are missing
    const existingKeys = new Set(items.map(i => i.key));
    const merged = [
      ...items,
      ...DEFAULT_PROCESSES.filter(d => !existingKeys.has(d.key))
    ];
    setItems(merged);
  }

  function addBlank() {
    const base = { key: `CUSTOM_${newid().toUpperCase()}`, label: "New Process" };
    setItems(prev => [...prev, base]);
  }

  function updateAt(idx: number, patch: Partial<ProcessItem>) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  function removeAt(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setItems(prev => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  function saveAll() {
    const next: AppState = {
      ...state,
      settings: {
        ...(state.settings || {}),
        processes: items.map(i => ({ key: i.key.trim(), label: i.label.trim() })),
      },
    };
    setState(next);
    save(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">Processes</h1>
        <div className="flex gap-2">
          <button
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
            onClick={pushDefault}
            title="Merge any missing defaults (UHPC, GFRC Face/Back, etc.)"
          >
            Merge defaults
          </button>
          <button
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
            onClick={addBlank}
          >
            + Add process
          </button>
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black shadow"
            onClick={saveAll}
          >
            Save
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">Order</th>
              <th className="py-3 px-4 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">Key</th>
              <th className="py-3 px-4 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">Label</th>
              <th className="py-3 px-4 border-b border-white/10"></th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((it, idx) => (
              <tr key={it.key + ":" + idx} className="hover:bg-white/5">
                <td className="py-3 px-4 border-b border-white/5">
                  <div className="flex gap-2">
                    <button
                      className="rounded px-2 py-1 text-xs border border-white/10 bg-black/30 hover:bg-white/10"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="rounded px-2 py-1 text-xs border border-white/10 bg-black/30 hover:bg-white/10"
                      onClick={() => move(idx, +1)}
                      disabled={idx === items.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <input
                    className="w-56 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm font-mono"
                    value={it.key}
                    onChange={(e) => updateAt(idx, { key: e.target.value })}
                    placeholder="KEY"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Used by Recipes & Products (must be unique).
                  </div>
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <input
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={it.label}
                    onChange={(e) => updateAt(idx, { label: e.target.value })}
                    placeholder="Readable label"
                  />
                </td>
                <td className="py-3 px-4 border-b border-white/5 text-right">
                  <button
                    className="rounded-lg px-3 py-2 text-sm border border-red-500/40 text-red-200 bg-red-500/10 hover:bg-red-500/20"
                    onClick={() => removeAt(idx)}
                    title="Delete process"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!items?.length && (
              <tr>
                <td className="py-4 px-4 text-gray-400" colSpan={4}>
                  No processes yet. Click <span className="font-semibold">Merge defaults</span> or <span className="font-semibold">Add process</span>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 p-4 text-xs text-gray-400">
        Tip: Processes appear as “Process / Category” in <span className="text-gray-200">Recipes</span> and <span className="text-gray-200">Production Planner</span>.
        Keep keys stable; rename labels anytime.
      </section>
    </div>
  );
}
