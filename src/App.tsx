import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Studio from "./pages/Studio";
import ProductionPlanner from "./pages/ProductionPlanner";
import TilePlanner from "./pages/TilePlanner";
import SlabCalculator from "./pages/SlabCalculator";
import Recipes from "./pages/Recipes";
import RecipeEditor from "./pages/RecipeEditor";
import Products from "./pages/Products";
import ProductEditor from "./pages/ProductEditor";
import Cost from "./pages/Cost";
import Ideas from "./pages/Ideas";
import Processes from "./pages/Processes";
import DeriveRecipe from "./pages/DeriveRecipe";
import Materials from "./pages/Materials";
import Proposal from "./pages/Proposal"; // 👈 add this

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/studio" replace />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/planner/production" element={<ProductionPlanner />} />
        <Route path="/planner/tile" element={<TilePlanner />} />
        <Route path="/planner/slab" element={<SlabCalculator />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<RecipeEditor />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/edit" element={<ProductEditor />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/cost" element={<Cost />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/settings/processes" element={<Processes />} />
        <Route path="/derive-recipe" element={<DeriveRecipe />} />
        <Route path="/proposal" element={<Proposal />} /> {/* 👈 new route */}
      </Route>
    </Routes>
  );
}
