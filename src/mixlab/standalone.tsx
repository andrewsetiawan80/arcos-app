import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import MixDesigner from "./MixDesigner";
import "./mixlab.css";
import "./nav.css";

/** Mix Lab site chrome — same links as nav.js */
function MixLabNav() {
  useEffect(() => {
    document.documentElement.dataset.page = "builder";
  }, []);

  const links = [
    { id: "builder", href: "index.html", label: "Recipe builder" },
    { id: "projects", href: "projects.html", label: "Projects" },
    { id: "prices", href: "prices.html", label: "Material prices" },
    { id: "staff", href: "staff.html", label: "Staff" },
    { id: "log", href: "log.html", label: "Mix log" },
  ];

  return (
    <nav className="site-nav no-print" aria-label="Mix Lab">
      <div className="site-nav-inner">
        <a className="site-home" href="index.html">
          <span className="site-mark">Mix Lab</span>
          <span className="site-home-label">Home</span>
        </a>
        <div className="site-links">
          {links.map((l) => (
            <a
              key={l.id}
              className={`site-link${l.id === "builder" ? " active" : ""}`}
              href={l.href}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <MixLabNav />
      <MixDesigner shell="mixlab" />
    </>
  </React.StrictMode>,
);
