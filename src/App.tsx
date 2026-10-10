// src/App.tsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";

// ===== Static (critical path) =====
import PublicLayout from "./public/PublicLayout";
import PublicHome from "./public/PublicHome";
import Layout from "./Layout";
import RequireAuth from "./components/RequireAuth";
import StaffLogin from "./pages/StaffLogin";
import { AppStateProvider } from "./utils/createAppStateContext";

/** Lazy import that reloads once if a deploy deleted the old hashed chunk. */
function lazyPage<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      const key = "arcos-lazy-reload";
      try {
        const last = Number(sessionStorage.getItem(key) || 0);
        if (Date.now() - last > 12_000) {
          sessionStorage.setItem(key, String(Date.now()));
          const url = new URL(window.location.href);
          url.searchParams.set("_v", String(Date.now()));
          window.location.replace(url.toString());
          return await new Promise(() => {
            /* wait for navigation */
          });
        }
      } catch {
        /* ignore */
      }
      throw err;
    }
  });
}

// ===== Public (lazy) =====
const PublicBespoke = lazyPage(() => import("./public/PublicBespoke"));
const PublicSamples = lazyPage(() => import("./public/PublicSamples"));
const PublicCollection = lazyPage(() => import("./public/PublicCollection"));
const PublicSpecification = lazyPage(() => import("./public/PublicSpecification"));
const PublicProductDetail = lazyPage(() => import("./public/PublicProductDetail"));
const PublicPage = lazyPage(() => import("./public/PublicPage"));
const PublicServices = lazyPage(() => import("./public/PublicServices"));
const PublicProcess = lazyPage(() => import("./public/PublicProcess"));
const PublicProjects = lazyPage(() => import("./public/PublicProjects"));
const PublicAbout = lazyPage(() => import("./public/PublicAbout"));
const PublicContact = lazyPage(() => import("./public/PublicContact"));
const PublicInspiration = lazyPage(() => import("./public/PublicInspiration"));
const PublicFAQ = lazyPage(() => import("./public/PublicFAQ"));
const PublicSurfaces = lazyPage(() => import("./public/PublicSurfaces"));
const PublicBrandExample = lazyPage(() => import("./public/PublicBrandExample"));
const PublicQuoteView = lazyPage(() => import("./public/PublicQuoteView"));
const PublicProjectPortal = lazyPage(() => import("./public/PublicProjectPortal"));
const PublicVisualizer = lazyPage(() => import("./public/PublicVisualizer"));

// ===== Internal (lazy) =====
const AppDashboard = lazyPage(() => import("./pages/AppDashboard"));
const Studio = lazyPage(() => import("./pages/Studio"));
const MixLog = lazyPage(() => import("./pages/MixLog"));
const MixProjects = lazyPage(() => import("./pages/MixProjects"));
const ProductionPlanner = lazyPage(() => import("./pages/ProductionPlanner"));
const TilePlanner = lazyPage(() => import("./pages/TilePlanner"));
const SlabCalculator = lazyPage(() => import("./pages/SlabCalculator"));
const Recipes = lazyPage(() => import("./pages/Recipes"));
const RecipeEditor = lazyPage(() => import("./pages/RecipeEditor"));
const ProductRecipes = lazyPage(() => import("./pages/ProductRecipes"));
const ProductRecipeEditor = lazyPage(() => import("./pages/ProductRecipeEditor"));
const Products = lazyPage(() => import("./pages/Products"));
const ProductEditor = lazyPage(() => import("./pages/ProductEditor"));
const Cost = lazyPage(() => import("./pages/Cost"));
const Ideas = lazyPage(() => import("./pages/Ideas"));
const Processes = lazyPage(() => import("./pages/Processes"));
const DeriveRecipe = lazyPage(() => import("./pages/DeriveRecipe"));
const Materials = lazyPage(() => import("./pages/Materials"));
const CatalogSettings = lazyPage(() => import("./pages/CatalogSettings"));
const Lab = lazyPage(() => import("./pages/Lab"));
const LabEntryEditor = lazyPage(() => import("./pages/LabEntryEditor"));
const CmsPages = lazyPage(() => import("./pages/CmsPages"));
const CmsPageEditor = lazyPage(() => import("./pages/CmsPageEditor"));
const Clients = lazyPage(() => import("./pages/Clients"));
const Quotes = lazyPage(() => import("./pages/Quotes"));
const QuoteEditor = lazyPage(() => import("./pages/QuoteEditor"));
const Jobs = lazyPage(() => import("./pages/Jobs"));
const JobEditor = lazyPage(() => import("./pages/JobEditor"));
const JobLabourPresets = lazyPage(() => import("./pages/JobLabourPresets"));
const BackupManager = lazyPage(() => import("./pages/BackupManager"));
const WebhookSettings = lazyPage(() => import("./pages/WebhookSettings"));
const MailSettings = lazyPage(() => import("./pages/MailSettings"));

function PageFallback() {
  // Quiet placeholder — avoid pulse/"Loading…" flash between lazy routes
  return <div className="min-h-[40vh]" aria-hidden />;
}

// ===== 404s =====
function PublicNotFound() { return <div className="editorial-wrap public-story"><p className="editorial-eyebrow">404 / ARCOS</p><h1>A different direction.</h1><p>This page is unavailable. Explore our surfaces or return home.</p><Link className="editorial-text-link" to="/">Back to home ↗</Link></div>; }

function AppNotFound() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <Link to="/login" className="text-sm underline text-stone-300">Go to staff login</Link>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
    <Routes>
      {/* ========= PUBLIC ========= */}
      <Route element={<PublicLayout />}>
        <Route index element={<PublicHome />} /> {/* / */}
        <Route path="/bespoke" element={<PublicBespoke />} />
        <Route path="/samples" element={<PublicSamples />} />
        <Route path="/collection" element={<PublicCollection />} />
        <Route path="/specification/:slug" element={<PublicSpecification />} />
        <Route path="/product/:slug" element={<PublicProductDetail />} />
        <Route path="/services" element={<PublicServices />} />
        <Route path="/surfaces" element={<PublicSurfaces />} />
        <Route path="/surfaces/uhpc" element={<Navigate to="/surfaces#uhpc" replace />} />
        <Route path="/surfaces/uhpc-solis" element={<Navigate to="/surfaces#uhpc" replace />} />
        <Route path="/surfaces/gfrc" element={<Navigate to="/surfaces#gfrc" replace />} />
        <Route path="/surfaces/gfrc-aeris" element={<Navigate to="/surfaces#gfrc" replace />} />
        <Route path="/surfaces/microcement" element={<Navigate to="/surfaces#microcement" replace />} />
        <Route path="/process" element={<PublicProcess />} />
        <Route path="/projects" element={<PublicProjects />} />
        <Route path="/projects/:projectId" element={<PublicProjects />} />
        <Route path="/catalog" element={<Navigate to="/collection" replace />} />
        <Route path="/about" element={<PublicAbout />} />
        <Route path="/brand-example" element={<PublicBrandExample />} />
        <Route path="/inspiration" element={<PublicInspiration />} />
        <Route path="/faq" element={<PublicFAQ />} />
        <Route path="/contact" element={<PublicContact />} />
        <Route path="/visualizer" element={<PublicVisualizer />} />
        <Route path="/page/:slug" element={<PublicPage />} />
        <Route path="*" element={<PublicNotFound />} />
      </Route>

      {/* Public share views (no layout) */}
      <Route path="/quote/:token" element={<PublicQuoteView />} />
      <Route path="/project/:token" element={<PublicProjectPortal />} />

      <Route path="/login" element={<StaffLogin />} />

      {/* ========= INTERNAL ========= */}
      <Route element={<RequireAuth><AppStateProvider key="app-state"><Layout /></AppStateProvider></RequireAuth>}>
        {/* App landing → Dashboard */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<AppDashboard />} />

        {/* Planning */}
        <Route path="/app/planner/production" element={<ProductionPlanner />} />
        <Route path="/app/planner/tile" element={<TilePlanner />} />
        <Route path="/app/planner/slab" element={<SlabCalculator />} />

        {/* Engineering */}
        <Route path="/app/studio" element={<Studio />} />
        <Route path="/app/mix-log" element={<MixLog />} />
        <Route path="/app/mix-projects" element={<MixProjects />} />
        <Route path="/app/recipes" element={<Recipes />} />
        <Route path="/app/recipes/:id" element={<RecipeEditor />} />
        <Route path="/app/product-recipes" element={<ProductRecipes />} />
        <Route path="/app/product-recipes/edit/:id" element={<ProductRecipeEditor />} />
        <Route path="/app/derive-recipe" element={<DeriveRecipe />} />

        {/* Sales */}
        <Route path="/app/products" element={<Products />} />
        <Route path="/app/products/edit" element={<ProductEditor />} />
        <Route path="/app/cost" element={<Cost />} />
        <Route path="/app/proposal" element={<Navigate to="/app/quotes" replace />} />
        <Route path="/app/ideas" element={<Ideas />} />

        {/* Resources / Settings */}
        <Route path="/app/materials" element={<Materials />} />
        <Route path="/app/settings/processes" element={<Processes />} />
        <Route path="/app/settings/catalog" element={<CatalogSettings />} />

        {/* Lab (R&D) */}
        <Route path="/app/lab" element={<Lab />} />
        <Route path="/app/lab/new" element={<LabEntryEditor />} />
        <Route path="/app/lab/:id" element={<LabEntryEditor />} />

        {/* Clients & Quotes */}
        <Route path="/app/clients" element={<Clients />} />
        <Route path="/app/jobs" element={<Jobs />} />
        <Route path="/app/jobs/new" element={<JobEditor />} />
        <Route path="/app/jobs/labour-presets" element={<JobLabourPresets />} />
        <Route path="/app/jobs/:id" element={<JobEditor />} />
        <Route path="/app/quotes" element={<Quotes />} />
        <Route path="/app/quotes/new" element={<QuoteEditor />} />
        <Route path="/app/quotes/:id" element={<QuoteEditor />} />

        {/* CMS (NEW) */}
        <Route path="/app/content/pages" element={<CmsPages />} />
        <Route path="/app/content/pages/:id" element={<CmsPageEditor />} />

        {/* System */}
        <Route path="/app/backups" element={<BackupManager />} />
        <Route path="/app/webhooks" element={<WebhookSettings />} />
        <Route path="/app/settings/mail" element={<MailSettings />} />

        {/* Internal 404 */}
        <Route path="/app/*" element={<AppNotFound />} />
      </Route>

      {/* ========= LEGACY REDIRECTS ========= */}
      <Route path="/products" element={<Navigate to="/app/products" replace />} />
      <Route path="/products/edit" element={<Navigate to="/app/products/edit" replace />} />
      <Route path="/planner/tile" element={<Navigate to="/app/planner/tile" replace />} />
      <Route path="/planner/slab" element={<Navigate to="/app/planner/slab" replace />} />
      <Route path="/planner/production" element={<Navigate to="/app/planner/production" replace />} />
      <Route path="/recipes" element={<Navigate to="/app/recipes" replace />} />
      <Route path="/recipes/:id" element={<Navigate to="/app/recipes/:id" replace />} />

      {/* ========= FINAL CATCH-ALL (PUBLIC 404) ========= */}

    </Routes>
    </Suspense>
  );
}
