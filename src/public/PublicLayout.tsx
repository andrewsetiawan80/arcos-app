import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import LanguageToggle from "../components/LanguageToggle";
import ScrollToTop from "../components/ScrollToTop";
import { useLanguage } from "../i18n/LanguageContext";
import { PublicThemeProvider, usePublicTheme } from "./PublicThemeContext";
import PublicWordmark from "./PublicWordmark";
import "./public-editorial.css";
function PublicLayoutInner() {
    const [open, setOpen] = useState(false);
    const [resourcesOpen,setResourcesOpen]=useState(false);
    const resourcesButton=useRef<HTMLButtonElement>(null);
    const button = useRef<HTMLButtonElement>(null);
    const location = useLocation();
    const { language } = useLanguage();
    const { isDark, toggleTheme } = usePublicTheme();
    const id = language === "id";
    const links = [{ to: "/collection", label: id ? "Koleksi" : "Collection" }, { to: "/bespoke", label: id ? "Kustom" : "Bespoke" }, { to: "/projects", label: id ? "Proyek" : "Projects" }, { to: "/about", label: id ? "Tentang" : "About" }];
    const resources = [{to:"/process",label:id?"Proses pembuatan":"How we make"},{to:"/surfaces",label:id?"Panduan material":"Material guide"},{to:"/surfaces#specifications",label:id?"Spesifikasi":"Specifications"},{to:"/surfaces#care",label:id?"Perawatan":"Care guide"}];
    const more = [{ to: "/samples", label: id ? "Kotak sampel" : "Sample boxes" }, { to: "/contact", label: id ? "Hubungi kami" : "Contact" }, { to: "/services", label: id ? "Layanan" : "Services" }, { to: "/inspiration", label: id ? "Inspirasi" : "Inspiration" }, { to: "/visualizer", label: "Visualizer" }, { to: "/faq", label: "FAQ" }];
    useEffect(() => { setOpen(false); setResourcesOpen(false); }, [location.pathname,location.hash]);
    useEffect(() => { const close = (e: KeyboardEvent) => { if(e.key === "Escape" && resourcesOpen){setResourcesOpen(false);resourcesButton.current?.focus();} if (e.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
    } }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [open,resourcesOpen]);
    return <div className={`public-editorial ${isDark ? "is-dark" : "is-light"}`}>
    <ScrollToTop /><a className="public-skip" href="#public-content">{id ? "Lewati ke konten" : "Skip to content"}</a>
    <header className="public-header"><div className="editorial-wrap public-header-row">
      <NavLink to="/" aria-label="ARCOS home"><PublicWordmark /></NavLink>
      <nav className="public-desktop-nav" aria-label="Main navigation">{links.map(item => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}<div className="public-resources"><button ref={resourcesButton} aria-expanded={resourcesOpen} aria-controls="public-resources-menu" onClick={()=>setResourcesOpen(!resourcesOpen)}>{id?"Panduan":"Resources"} <span aria-hidden="true">{resourcesOpen?"−":"+"}</span></button>{resourcesOpen&&<div id="public-resources-menu">{resources.map(item=><Link key={item.to} to={item.to} onClick={()=>setResourcesOpen(false)}>{item.label}</Link>)}</div>}</div></nav>
      <div className="public-header-actions"><div className="public-desktop-language"><LanguageToggle /></div><NavLink className="editorial-button public-header-cta" to="/samples">{id ? "Minta sampel" : "Request samples"}</NavLink><button ref={button} className="public-menu-button" aria-expanded={open} aria-controls="public-mobile-nav" onClick={() => setOpen(!open)}>{open ? (id ? "Tutup" : "Close") : "Menu"} <span aria-hidden="true">{open ? "−" : "+"}</span></button></div>
    </div>
    {open && <nav id="public-mobile-nav" className="public-mobile-nav editorial-wrap" aria-label="Mobile navigation">{[...links, ...resources, ...more].map(item => <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}</NavLink>)}<LanguageToggle /></nav>}
    </header>
    <main id="public-content" tabIndex={-1}><div className={location.pathname === "/" ? "public-home-route" : `public-inner-page public-route-${location.pathname.split("/")[1]}`}><Outlet /></div></main>
    <footer className="public-footer"><div className="editorial-wrap"><div className="public-footer-grid"><div><NavLink to="/" aria-label="ARCOS home"><PublicWordmark /></NavLink><p>surfaces, reimagined.</p><p>{id ? "Dirancang dan dibuat di Indonesia." : "Designed and crafted in Indonesia."}</p></div><nav aria-label="Explore">{[...links, ...resources, ...more].map(item => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}</nav><div><p>{id ? "Mari mulai percakapan." : "Let's start a conversation."}</p><a href="mailto:info@arcosworks.com">info@arcosworks.com</a><p>Surabaya, Indonesia</p><a href="https://instagram.com/arcosworks" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div></div><div className="public-footer-bottom"><span>© {new Date().getFullYear()} ARCOS</span><div><button onClick={toggleTheme}>{isDark ? (id ? "Mode terang" : "Light mode") : (id ? "Mode gelap" : "Dark mode")}</button><NavLink to="/login">{id ? "Login staf" : "Staff login"}</NavLink></div></div></div></footer>
  </div>;
}
export default function PublicLayout() { return <PublicThemeProvider><PublicLayoutInner /></PublicThemeProvider>; }
