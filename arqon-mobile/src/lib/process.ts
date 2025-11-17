// src/lib/process.ts - Match web app exactly
import type { AppState } from "../types";

/** Canonical default processes — tweak labels freely */
export const DEFAULT_PROCESSES = [
  { key: "UHPC",        label: "UHPC" },
  { key: "GFRC_FACE",   label: "GFRC — Face Coat" },
  { key: "GFRC_BACK",   label: "GFRC — Backer Coat" },
  { key: "MICRO_CEMENT",label: "Microcement" },
  { key: "SCC",         label: "Self-Compacting Concrete (SCC)" },
  { key: "ECC",         label: "Engineered Cementitious Composite (ECC)" },
  { key: "GENERAL",     label: "General Mix" },
] as const;

export type ProcessItem = { key: string; label: string };

export function getProcesses(state?: AppState): ProcessItem[] {
  // Prefer state.settings.processes if it exists and is an array
  const fromState = state?.settings?.processes;
  if (Array.isArray(fromState) && fromState.length) {
    // sanitize: only keep items with string key/label
    return fromState
      .filter((p) => p && typeof p.key === "string" && typeof p.label === "string")
      .map((p) => ({ key: p.key, label: p.label }));
  }
  return [...DEFAULT_PROCESSES];
}

export function getProcessLabel(state: AppState | undefined, key: string): string {
  const list = getProcesses(state);
  const hit = list.find(p => p.key === key);
  return hit?.label ?? key;
}


