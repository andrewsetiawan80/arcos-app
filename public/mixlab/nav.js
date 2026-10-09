(function () {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const onArcos = location.hostname === "192.168.2.189" || location.pathname.indexOf("/mixlab") === 0;
  const mixLab = "http://192.168.2.103/";
  const page = document.documentElement.dataset.page
    || (path === "staff.html" ? "staff"
      : path === "prices.html" ? "prices"
      : path === "log.html" ? "log"
      : path === "projects.html" ? "projects"
      : "builder");

  const links = onArcos
    ? [
        { id: "builder", href: mixLab, label: "Recipe builder" },
        { id: "projects", href: mixLab + "projects.html", label: "Projects" },
        { id: "prices", href: "prices.html", label: "Material prices" },
        { id: "staff", href: "staff.html", label: "Staff" },
        { id: "log", href: "log.html", label: "Mix log" },
      ]
    : [
        { id: "builder", href: "index.html", label: "Recipe builder" },
        { id: "projects", href: "projects.html", label: "Projects" },
        { id: "prices", href: "prices.html", label: "Material prices" },
        { id: "staff", href: "staff.html", label: "Staff" },
        { id: "log", href: "log.html", label: "Mix log" },
      ];

  const homeHref = onArcos ? mixLab : "index.html";

  const nav = document.createElement("nav");
  nav.className = "site-nav no-print";
  nav.setAttribute("aria-label", "Mix Lab");
  nav.innerHTML =
    '<div class="site-nav-inner">' +
      '<a class="site-home" href="' + homeHref + '">' +
        '<span class="site-mark">Mix Lab</span>' +
        '<span class="site-home-label">Home</span>' +
      '</a>' +
      '<div class="site-links">' +
        links.map(function (l) {
          return '<a class="site-link' + (l.id === page ? " active" : "") + '" href="' + l.href + '">' + l.label + "</a>";
        }).join("") +
      "</div>" +
    "</div>";

  document.body.insertBefore(nav, document.body.firstChild);
})();
