import PublicPageIntro from "./PublicPageIntro";
import { useParams, Link } from "react-router-dom";
import usePublicData from "./usePublicData";
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
    const state: AppState = usePublicData();
    const page: Page | undefined = (state.pages || []).find((p) => p.slug === slug && p.status === "published");
    if (!page)
        return <><PublicPageIntro label="Journal" title="Page unavailable." description="This page is not published or could not be found."/><div className="editorial-wrap public-story"><Link className="editorial-text-link" to="/">Back to home ↗</Link></div></>;
    return <><PublicPageIntro label="Journal" title={page.title} description={page.description || ""} image={page.coverImageUrl || undefined}/><section className="editorial-wrap public-story"><article className="prose" dangerouslySetInnerHTML={{ __html: mdToHtml(page.content || "") }}/><Link className="editorial-text-link" to="/">Back to home ↗</Link></section></>;
}
