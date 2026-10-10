import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
export function usePublicCopy() { const { language } = useLanguage(); return (en: string, id: string) => language === "id" ? id : en; }
export default function PublicPageIntro({ label, title, description, image, caption }: {
    label: string;
    title: string;
    description: string;
    image?: string;
    caption?: string;
}) {
    const copy = usePublicCopy();
    return <header className="public-page-intro editorial-wrap"><div className="public-breadcrumb"><Link to="/">ARCOS</Link><span aria-hidden="true">/</span><span>{label}</span></div><div className="public-page-title"><h1>{title}</h1><p>{description}</p></div>{image && <figure><img src={image} alt={caption || title} fetchPriority="high"/><figcaption>{caption}</figcaption></figure>}<span className="public-origin-line">{copy("Designed and crafted in Indonesia", "Dirancang dan dibuat di Indonesia")}</span></header>;
}
export function PublicEnquiry() { const c = usePublicCopy(); return <section className="editorial-wrap public-enquiry"><p className="editorial-eyebrow">{c("From an idea to a surface", "Dari gagasan menjadi permukaan")}</p><h2>{c("Let's shape your next space.", "Mari wujudkan ruang Anda.")}</h2><Link className="editorial-button" to="/contact">{c("Discuss a project", "Diskusikan proyek")} ↗</Link></section>; }
