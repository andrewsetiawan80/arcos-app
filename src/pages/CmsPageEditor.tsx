import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Page } from "../types";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function CmsPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState<AppState>(() => {
    const s = load();
    if (!s.pages) s.pages = [];
    return s;
  });

  const idx = useMemo(() => (state.pages || []).findIndex((p) => p.id === id), [state.pages, id]);
  const page = idx >= 0 ? (state.pages as Page[])[idx] : undefined;

  function update(patch: Partial<Page>) {
    if (idx < 0) return;
    const copy = { ...state };
    const list = [...(copy.pages || [])];
    const updated = { ...(list[idx] as Page), ...patch, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    copy.pages = list;
    setState(copy);
    // No auto-save
  }

  function publish() {
    update({ status: "published" });
  }
  function unpublish() {
    update({ status: "draft" });
  }
  function remove() {
    if (!page) return;
    if (!confirm("Delete this page?")) return;
    const copy = { ...state, pages: (state.pages || []).filter((p) => p.id !== page.id) };
    setState(copy);
    // No auto-save
    navigate("/app/content/pages");
  }

  if (!page) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link className="text-sm underline" to="/app/content/pages">
          Back to Pages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">Edit Page</h1>
          <div className="text-xs text-stone-400 mt-1">
            ID: <span className="font-mono">{page.id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/app/content/pages"
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10"
          >
            Back
          </Link>
          {page.status === "published" && page.slug && (
            <a
              href={`/page/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10"
            >
              View ↗
            </a>
          )}
          {page.status === "published" ? (
            <button onClick={unpublish} className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10">
              Unpublish
            </button>
          ) : (
            <button onClick={publish} className="rounded-lg px-3 py-2 text-sm font-semibold bg-white text-black">
              Publish
            </button>
          )}
          <button onClick={remove} className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-red-300">
            Delete
          </button>
        </div>
      </div>

      {/* Basics */}
      <section className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0 shadow-lg space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Title</div>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={page.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Public URL slug</div>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={page.slug}
              onChange={(e) => update({ slug: slugify(e.target.value) })}
            />
            <div className="text-xs text-gray-500 mt-1">/page/{page.slug}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Short description</div>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={page.description || ""}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Cover image URL</div>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={page.coverImageUrl || ""}
              onChange={(e) => update({ coverImageUrl: e.target.value })}
            />
          </div>
        </div>

        {page.coverImageUrl ? (
          <div className="rounded-lg overflow-hidden ring-1 ring-white/10">
            <img src={page.coverImageUrl} alt="" className="w-full h-56 object-cover" />
          </div>
        ) : null}
      </section>

      {/* Content */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
        <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Content</div>
        <textarea
          rows={16}
          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm font-mono"
          placeholder="Write content here (Markdown or simple HTML supported)…"
          value={page.content || ""}
          onChange={(e) => update({ content: e.target.value })}
        />
        <div className="text-xs text-stone-400">
          Tips: You can use **Markdown** (e.g., <code># Heading</code>, <code>**bold**</code>) or paste simple HTML.
        </div>
      </section>
    </div>
  );
}
