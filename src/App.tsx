// src/App.tsx
import { Routes, Route, Navigate, Link } from "react-router-dom";

// ===== Public =====
import PublicLayout from "./public/PublicLayout";
import PublicHome from "./public/PublicHome";
import PublicCatalog from "./public/PublicCatalog";
import PublicProductDetail from "./public/PublicProductDetail";
import PublicPage from "./public/PublicPage";
import PublicServices from "./public/PublicServices";
import PublicProcess from "./public/PublicProcess";
import PublicProjects from "./public/PublicProjects";
import PublicAbout from "./public/PublicAbout";
import PublicContact from "./public/PublicContact";
import PublicInspiration from "./public/PublicInspiration";
import PublicFAQ from "./public/PublicFAQ";

// ===== Internal =====
import Layout from "./Layout";
import AppDashboard from "./pages/AppDashboard";
import Studio from "./pages/Studio";
import ProductionPlanner from "./pages/ProductionPlanner";
import TilePlanner from "./pages/TilePlanner";
import SlabCalculator from "./pages/SlabCalculator";
import Recipes from "./pages/Recipes";
import RecipeEditor from "./pages/RecipeEditor";
import ProductRecipes from "./pages/ProductRecipes";
import ProductRecipeEditor from "./pages/ProductRecipeEditor";
import Products from "./pages/Products";
import ProductEditor from "./pages/ProductEditor";
import Cost from "./pages/Cost";
import Ideas from "./pages/Ideas";
import Processes from "./pages/Processes";
import DeriveRecipe from "./pages/DeriveRecipe";
import Materials from "./pages/Materials";
import Proposal from "./pages/Proposal";
import CatalogSettings from "./pages/CatalogSettings";

// Lab (R&D)
import Lab from "./pages/Lab";
import LabEntryEditor from "./pages/LabEntryEditor";

// CMS (NEW)
import CmsPages from "./pages/CmsPages";
import CmsPageEditor from "./pages/CmsPageEditor";
import RequireAuth from "./components/RequireAuth";
import StaffLogin from "./pages/StaffLogin";
import { AppStateProvider } from "./utils/createAppStateContext";

// ===== 404s =====
function PublicNotFound() {
  return (
    <div className="bg-[#232323] text-white min-h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-7xl sm:text-8xl font-black uppercase mb-6">404</h1>
        <p className="text-gray-400 mb-8 text-lg">Sorry, the page you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#353535] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#232323] transition-colors border border-white/10"
        >
          Back to Home
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

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
    <Routes>
      {/* ========= PUBLIC ========= */}
      <Route element={<PublicLayout />}>
        <Route index element={<PublicHome />} /> {/* / */}
        <Route path="/catalog" element={<PublicCatalog />} />
        <Route path="/product/:slug" element={<PublicProductDetail />} />
        <Route path="/services" element={<PublicServices />} />
        <Route path="/process" element={<PublicProcess />} />
        <Route path="/projects" element={<PublicProjects />} />
        <Route path="/about" element={<PublicAbout />} />
        <Route path="/inspiration" element={<PublicInspiration />} />
        <Route path="/faq" element={<PublicFAQ />} />
        <Route path="/contact" element={<PublicContact />} />
        <Route path="/page/:slug" element={<PublicPage />} />
      </Route>

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
        <Route path="/app/recipes" element={<Recipes />} />
        <Route path="/app/recipes/:id" element={<RecipeEditor />} />
        <Route path="/app/product-recipes" element={<ProductRecipes />} />
        <Route path="/app/product-recipes/edit/:id" element={<ProductRecipeEditor />} />
        <Route path="/app/derive-recipe" element={<DeriveRecipe />} />

        {/* Sales */}
        <Route path="/app/products" element={<Products />} />
        <Route path="/app/products/edit" element={<ProductEditor />} />
        <Route path="/app/cost" element={<Cost />} />
        <Route path="/app/proposal" element={<Proposal />} />
        <Route path="/app/ideas" element={<Ideas />} />

        {/* Resources / Settings */}
        <Route path="/app/materials" element={<Materials />} />
        <Route path="/app/settings/processes" element={<Processes />} />
        <Route path="/app/settings/catalog" element={<CatalogSettings />} />

        {/* Lab (R&D) */}
        <Route path="/app/lab" element={<Lab />} />
        <Route path="/app/lab/new" element={<LabEntryEditor />} />
        <Route path="/app/lab/:id" element={<LabEntryEditor />} />

        {/* CMS (NEW) */}
        <Route path="/app/content/pages" element={<CmsPages />} />
        <Route path="/app/content/pages/:id" element={<CmsPageEditor />} />

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
      <Route path="*" element={<PublicNotFound />} />
    </Routes>
  );
}
