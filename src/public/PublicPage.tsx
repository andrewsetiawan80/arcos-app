import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { load } from "../store";
import type { AppState, Page } from "../types";

function mdToHtml(src: string): string {
  // extremely tiny markdown support for headers, bold, italics, paragraphs & line breaks
  let s = src;

  // Escape basic HTML if the user hasn't included tags; if they include tags, we assume they meant HTML.
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(s);

  if (!looksLikeHtml) {
    // headings
    s = s.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
    s = s.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
    s = s.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
    s = s.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    s = s.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    s = s.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    // inline
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // paragraphs
    s = s
      .split(/\n{2,}/)
      .map((blk) => `<p>${blk.replace(/\n/g, "<br/>")}</p>`)
      .join("\n");
  }

  return s;
}

export default function PublicPage() {
  const { slug } = useParams();
  const state: AppState = load();

  const page: Page | undefined = (state.pages || []).find((p) => p.slug === slug && p.status === "published");

  if (!page) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-2">404</h1>
        <p className="text-stone-400 mb-6">This page was not found or isn’t published yet.</p>
        <Link to="/" className="rounded-lg px-4 py-2 border border-white/10 hover:bg-white/10">Back to Home</Link>
      </div>
    );
  }

  const html = mdToHtml(page.content || "");

  return (
    <div className="bg-[#232323] text-white">
      {/* Cover */}
      {page.coverImageUrl ? (
        <div className="w-full aspect-[21/7] overflow-hidden border-b border-white/10">
          <img src={page.coverImageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : null}

      <section className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-4">Page</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-tight">{page.title}</h1>
          {page.description && <p className="mt-4 text-gray-300 text-lg leading-relaxed">{page.description}</p>}
        </div>

        <article
          className="prose prose-invert max-w-none prose-h1:text-white prose-h1:font-black prose-h1:uppercase prose-h2:text-white prose-h2:font-bold prose-h2:uppercase prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-white prose-a:underline prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white uppercase tracking-wider font-bold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
