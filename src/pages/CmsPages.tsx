import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Page } from "../types";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const newid = () => Math.random().toString(36).slice(2, 10);

export default function CmsPages() {
  const [state, setState] = useState<AppState>(() => {
    const s = load();
    if (!s.pages) s.pages = [];
    return s;
  });

  const navigate = useNavigate();

  function persist(next: AppState) {
    setState(next);
    // No auto-save
  }

  function addPage() {
    const title = prompt("Page title (e.g., About Us):", "About Us");
    if (!title) return;
    const now = new Date().toISOString();
    const p: Page = {
      id: newid(),
      title,
      slug: slugify(title),
      status: "draft",
      description: "",
      coverImageUrl: "",
      tags: [],
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    persist({ ...state, pages: [p, ...(state.pages || [])] });
    navigate(`/app/content/pages/${p.id}`);
  }

  function removePage(id: string) {
    if (!confirm("Delete this page?")) return;
    const next = { ...state, pages: (state.pages || []).filter((p) => p.id !== id) };
    persist(next);
  }

  const pages = (state.pages || []).slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Content Management</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Pages (CMS)
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Manage your website content, create pages, and organize your public site structure.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Site
            </Link>
            <button
              onClick={addPage}
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Page
            </button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h2 className="text-lg font-black text-white">Content Pages</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Title</th>
                  <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Slug</th>
                  <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Status</th>
                  <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Updated</th>
                  <th className="py-4 px-6 border-b border-white/10 w-[1%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-stone-400">
                  No pages yet. Click “+ New Page”.
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 border-b border-white/10">
                    <Link to={`/app/content/pages/${p.id}`} className="hover:underline">
                      {p.title || "Untitled"}
                    </Link>
                  </td>
                  <td className="py-3 px-4 border-b border-white/10">
                    <code className="text-xs">/page/{p.slug}</code>
                  </td>
                  <td className="py-3 px-4 border-b border-white/10">
                    <span
                      className={
                        "text-xs px-2 py-1 rounded-full border " +
                        (p.status === "published"
                          ? "border-emerald-400/30 text-emerald-300"
                          : "border-stone-400/30 text-stone-300")
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-white/10 text-sm text-stone-400">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 px-4 border-b border-white/10">
                    <div className="flex gap-2">
                      <Link
                        to={`/app/content/pages/${p.id}`}
                        className="text-sm rounded-md px-3 py-1.5 border border-white/10 hover:bg-white/10"
                      >
                        Edit
                      </Link>
                      {p.status === "published" && p.slug && (
                        <a
                          href={`/page/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm rounded-md px-3 py-1.5 border border-white/10 hover:bg-white/10"
                        >
                          View ↗
                        </a>
                      )}
                      <button
                        className="text-sm rounded-md px-3 py-1.5 border border-white/10 hover:bg-white/10 text-red-300"
                        onClick={() => removePage(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
