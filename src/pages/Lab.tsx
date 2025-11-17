import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, LabEntry } from "../types";

const newid = () => Math.random().toString(36).slice(2, 10);

export default function Lab() {
  const [state, setState] = useState<AppState>(() => {
    const s = load();
    if (!s.labEntries) s.labEntries = [];
    return s;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // No auto-save - only manual saves

  const navigate = useNavigate();

  const entries = (state.labEntries || []).slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  function createEntry() {
    const now = new Date().toISOString();
    const entry: LabEntry = {
      id: newid(),
      title: "New Experiment",
      status: "draft",
      notes: "",
      images: [],
      videos: [],
      lines: [],
      createdAt: now,
      updatedAt: now,
    };
    const next = { ...state, labEntries: [entry, ...(state.labEntries || [])] };
    setState(next);
    setHasUnsavedChanges(true);
    navigate(`/app/lab/${entry.id}`);
  }

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert("Lab entries saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save lab entries. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Laboratory</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Lab Trials
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Document your concrete experiments, test results, and research findings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Unsaved changes</span>
              </div>
            )}
            <button 
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Lab Entries
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
              onClick={createEntry}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Entry
            </button>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-[320px_1fr] gap-6">
        {/* Left rail */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-4 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-sm font-bold text-white">Lab Entries</h2>
            </div>
            <div className="max-h-[75vh] overflow-auto">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-400">
                    No entries yet. Click <span className="font-semibold text-white">"New Entry"</span> to get started.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map((e) => (
                    <Link
                      key={e.id}
                      to={`/app/lab/${e.id}`}
                      className="block rounded-xl px-4 py-3 hover:bg-white/8 border border-transparent hover:border-white/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-400 group-hover:scale-125 transition-transform duration-200" />
                        <div className="text-sm font-semibold text-white truncate">{e.title || "Untitled"}</div>
                      </div>
                      <div className="text-xs text-gray-400 ml-5">
                        {e.status || "draft"}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Empty state right side */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-8 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">No Entry Selected</h3>
                <p className="text-sm text-gray-400">Select an entry from the list or create a new one to get started.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
