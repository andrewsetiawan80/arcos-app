// src/pages/AppDashboard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Product, Recipe, Material } from "../types";
import { 
  Package, 
  Beaker, 
  Microscope, 
  Calculator, 
  TrendingUp, 
  Users, 
  Settings,
  Database,
  FileText,
  UserCheck,
  Download
} from "lucide-react";
import { useAppState } from "../hooks/useAppState";
import { api } from "../lib/api";

/* ---------- UI Components ---------- */

function Action({ to, label, icon, primary = false }: { to: string; label: string; icon?: React.ReactNode; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all hover-lift ${
        primary
          ? "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10"
          : "bg-[#353535] border border-white/10 text-white hover:bg-[#232323] hover:border-white/20"
      }`}
    >
      <span className="group-hover:scale-110 transition-transform duration-300">{icon}</span>
      {label}
      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="group border border-white/10 bg-[#353535] p-6 hover:bg-[#232323] hover:border-white/20 transition-all hover-lift relative overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold group-hover:text-gray-300 transition-colors">{label}</div>
        {icon && <div className="text-gray-400 group-hover:scale-110 transition-transform duration-300">{icon}</div>}
      </div>
      <div className="relative text-3xl font-black text-white group-hover:scale-105 transition-transform duration-300">{value}</div>
    </div>
  );
}

function Card({
  title,
  action,
  emptyText,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  emptyText?: string;
  children: React.ReactNode;
}) {
  const isEmpty = React.Children.count(children) === 0 || (Array.isArray(children) && children.length === 0);
  return (
    <div className="border border-white/10 bg-[#353535] p-6 hover:border-white/20 transition-all hover-lift">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h3 className="text-lg font-black uppercase text-white">{title}</h3>
        {action}
      </div>
      {isEmpty ? (
        <div className="text-sm text-gray-400 italic py-8 text-center">{emptyText || "Nothing here yet."}</div>
      ) : (
        children
      )}
    </div>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2">{children}</ul>;
}

function ListItem({
  title,
  to,
  meta = [],
}: {
  title: string;
  to: string;
  meta?: string[];
}) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center justify-between gap-3 p-3 bg-[#232323] border border-white/10 hover:bg-[#353535] hover:border-white/20 transition-all hover-lift"
      >
        <div className="truncate font-bold text-sm text-white group-hover:text-gray-100 transition-colors">{title}</div>
        {meta.length > 0 && (
          <div className="shrink-0 flex items-center gap-2">
            {meta.filter(Boolean).map((m, i) => (
              <span key={i} className="whitespace-nowrap px-2 py-1 text-xs uppercase tracking-wider font-bold text-gray-400 border border-white/10 bg-[#353535] group-hover:bg-[#232323] group-hover:border-white/20 transition-all">
                {m}
              </span>
            ))}
          </div>
        )}
        <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </li>
  );
}

function WorkflowCard({
  title,
  description,
  steps,
  action,
}: {
  title: string;
  description: string;
  steps: string[];
  action: { to: string; label: string };
}) {
  return (
    <div className="group border border-white/10 bg-[#353535] p-6 hover:bg-[#232323] hover:border-white/20 transition-all hover-lift relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <h4 className="font-black uppercase mb-3 text-lg text-white relative">{title}</h4>
      <p className="text-sm text-gray-300 mb-6 leading-relaxed relative">{description}</p>
      <div className="space-y-3 mb-6 relative">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10 group-hover:border-white/30 transition-all">
              {i + 1}
            </span>
            <span className="font-bold text-sm text-gray-300 group-hover:text-gray-200 transition-colors">{step}</span>
          </div>
        ))}
      </div>
      <Link
        to={action.to}
        className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-[#232323] border border-white/10 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#353535] hover:border-white/20 transition-all hover-lift"
      >
        {action.label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function currencyIDR(n: number) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `IDR ${Math.round(n).toLocaleString("id-ID")}`;
  }
}

/* ---------- Main Component ---------- */

export default function AppDashboard() {
  const { state, loading } = useAppState();
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    api.getDatabaseStatus().then((status) => {
      if (!cancelled) setDbStatus(status);
    }).catch(() => {
      if (!cancelled) setDbStatus('offline');
    });
    const interval = setInterval(() => {
      api.getDatabaseStatus().then((status) => {
        if (!cancelled) setDbStatus(status);
      }).catch(() => {
        if (!cancelled) setDbStatus('offline');
      });
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    api.getQuotes().then(r => { if (r.data) setQuotes(r.data as any[]); });
    api.getJobs().then(r => { if (r.data) setJobs(r.data as any[]); });
    api.getClients().then(r => { if (r.data) setClients(r.data as any[]); });
  }, []);

  // Safe fallbacks
  const products = (state.products || []) as Product[];
  const recipes = (state.recipes || []) as Recipe[];
  const materials = (state.materials || []) as Material[];

  // Lab entries from state
  const labEntries = state.labEntries || [];
  const proposals = state.proposals || [];

  // Quote analytics
  const quotesByStatus = {
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
  };
  const totalQuoteValue = quotes.reduce((s, q) => s + (parseFloat(q.total) || 0), 0);
  const approvedValue = quotes.filter(q => q.status === 'approved').reduce((s, q) => s + (parseFloat(q.total) || 0), 0);

  // Quick stats
  const stats = [
    { label: "Public Products", value: products.filter((p) => p.public).length, icon: <Package className="w-5 h-5 text-blue-400" /> },
    { label: "Recipes", value: recipes.length, icon: <Beaker className="w-5 h-5 text-green-400" /> },
    { label: "Clients", value: clients.length, icon: <UserCheck className="w-5 h-5 text-cyan-400" /> },
    { label: "Quotes", value: quotes.length, icon: <FileText className="w-5 h-5 text-purple-400" /> },
    { label: "Materials", value: materials.length, icon: <Settings className="w-5 h-5 text-gray-400" /> },
  ];

  // Derived lists
  const recentLab = [...labEntries]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 5);

  const recentRecipes = [...recipes]
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 5);

  const lowStock = materials
    .filter(
      (m) =>
        typeof (m as any).stockKg === "number" &&
        typeof (m as any).reorderPointKg === "number" &&
        (m as any).stockKg <= (m as any).reorderPointKg,
    )
    .slice(0, 5);

  const showLoading =
    loading &&
    products.length === 0 &&
    recipes.length === 0 &&
    labEntries.length === 0 &&
    proposals.length === 0;

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Arcos Dashboard</p>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
              Manage your concrete products, recipes, and lab testing with precision and efficiency.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-end">
            {/* Database status */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-semibold uppercase tracking-wider ${
                dbStatus === 'online'
                  ? 'bg-green-500/15 border-green-500/50 text-green-400'
                  : dbStatus === 'offline'
                  ? 'bg-red-500/15 border-red-500/50 text-red-400'
                  : 'bg-gray-500/15 border-gray-500/50 text-gray-400'
              }`}
              title={dbStatus === 'loading' ? 'Checking…' : `Database is ${dbStatus}`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>Database: {dbStatus === 'loading' ? '…' : dbStatus}</span>
            </div>
            <Action to="/app/products/edit" label="Add Product" icon={<Package className="w-4 h-4" />} primary />
            <Action to="/app/studio" label="Mix designer" icon={<Beaker className="w-4 h-4" />} />
            <Action to="/app/derive-recipe" label="Derive recipe" icon={<Beaker className="w-4 h-4" />} />
            <Action to="/app/lab/new" label="Lab Entry" icon={<Microscope className="w-4 h-4" />} />
            <Action to="/app/planner/tile" label="Calculate" icon={<Calculator className="w-4 h-4" />} />
          </div>
        </div>
      </header>

      {/* Quick Workflows */}
      <section className="border-b border-white/10 pb-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-4">Workflows</p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase leading-tight mb-2">
            Quick Workflows
          </h2>
          <p className="text-gray-300">Streamlined processes for your daily tasks</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <WorkflowCard
            title="Create New Product"
            description="Add a product to your catalog"
            steps={["Add Product", "Configure", "Publish"]}
            action={{ to: "/app/products/edit", label: "Start" }}
          />
          <WorkflowCard
            title="Create Recipe"
            description="Build concrete formulations for your products"
            steps={["Base Recipe", "Assign to Product", "Test & Validate"]}
            action={{ to: "/app/derive-recipe", label: "Create Recipe" }}
          />
          <WorkflowCard
            title="Calculate Project"
            description="Estimate materials and costs"
            steps={["Choose Calculator", "Enter Dimensions", "Get Quote"]}
            action={{ to: "/app/planner/tile", label: "Start" }}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-white/10 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label}>
              <Stat label={s.label} value={s.value} icon={s.icon} />
            </div>
          ))}
        </div>
      </section>

      {/* Visual Analytics */}
      <section className="grid gap-6 lg:grid-cols-2 border-b border-white/10 pb-8">
        {/* Quote Pipeline */}
        <div className="group border border-white/10 bg-[#353535] p-6 hover:border-white/20 transition-all hover-lift">
          <div className="mb-6">
            <h3 className="text-lg font-black uppercase mb-2 text-white">Quote Pipeline</h3>
            <p className="text-sm text-gray-400">Quotes by status and total value</p>
          </div>
          <div className="h-40 flex items-end justify-between gap-3 pb-4">
            {[
              { label: 'Draft', value: quotesByStatus.draft, color: 'from-gray-400 to-gray-500' },
              { label: 'Sent', value: quotesByStatus.sent, color: 'from-blue-400 to-blue-600' },
              { label: 'Approved', value: quotesByStatus.approved, color: 'from-green-400 to-green-600' },
              { label: 'Rejected', value: quotesByStatus.rejected, color: 'from-red-400 to-red-600' },
            ].map((bar, i) => {
              const maxVal = Math.max(quotesByStatus.draft, quotesByStatus.sent, quotesByStatus.approved, quotesByStatus.rejected, 1);
              const pct = Math.max((bar.value / maxVal) * 100, 8);
              return (
                <div key={i} className="flex-1 flex flex-col items-center group/bar">
                  <div
                    className={`w-full rounded-t-lg bg-gradient-to-t ${bar.color} transition-all duration-300 hover:scale-110 cursor-pointer relative`}
                    style={{ height: `${pct}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {bar.value}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 font-medium">{bar.label}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Pipeline</div>
              <div className="text-xl font-black text-white">{currencyIDR(totalQuoteValue)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Won</div>
              <div className="flex items-center gap-1.5 text-lg font-black text-green-400">
                <TrendingUp className="w-4 h-4" />
                {currencyIDR(approvedValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="group border border-white/10 bg-[#353535] p-6 hover:border-white/20 transition-all hover-lift">
          <div className="mb-6">
            <h3 className="text-lg font-black uppercase mb-2 text-white">Overview</h3>
            <p className="text-sm text-gray-400">Current system metrics</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Clients', value: clients.length, color: 'from-cyan-500 to-blue-500' },
              { label: 'Total Quotes', value: quotes.length, color: 'from-purple-500 to-pink-500' },
              { label: 'Products (Published)', value: products.filter(p => p.public).length, color: 'from-green-500 to-emerald-500' },
              { label: 'Recipes', value: recipes.length, color: 'from-orange-500 to-amber-500' },
              { label: 'Lab Entries', value: labEntries.length, color: 'from-blue-500 to-indigo-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#232323] border border-white/10 hover:bg-[#353535] hover:border-white/20 transition-all group/item">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} opacity-80 group-hover/item:opacity-100 transition-opacity`} />
                  <span className="text-sm font-bold text-gray-300 uppercase tracking-wider group-hover/item:text-white transition-colors">{item.label}</span>
                </div>
                <div className="text-xl font-black text-white group-hover/item:scale-110 transition-transform">{item.value}</div>
              </div>
            ))}
          </div>

          {/* CSV Export */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                const rows = [['Metric', 'Value'], ['Clients', clients.length], ['Quotes', quotes.length], ['Approved Quote Value', approvedValue], ['Products', products.length], ['Recipes', recipes.length], ['Materials', materials.length]];
                const csv = rows.map(r => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'arcos-analytics.csv'; a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Left column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Recent Lab Entries"
            emptyText="No lab entries yet. Start documenting experiments."
            action={<Link to="/app/lab" className="text-sm text-gray-400 hover:text-white font-semibold">View all →</Link>}
          >
            <List>
              {recentLab.map((e) => (
                <ListItem
                  key={e.id}
                  title={e.title || e.id}
                  to={`/app/lab/${encodeURIComponent(e.id)}`}
                  meta={[
                    e.status || "draft",
                    e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "",
                  ]}
                />
              ))}
            </List>
          </Card>

          <Card
            title="Recent Recipes"
            emptyText="No recipes yet."
            action={<Link to="/app/recipes" className="text-sm text-gray-400 hover:text-white font-semibold">All recipes →</Link>}
          >
            <List>
              {recentRecipes.map((r) => (
                <ListItem
                  key={r.id}
                  title={r.name}
                  to={`/app/recipes/${encodeURIComponent(r.id)}`}
                  meta={[r.process || "—", r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ""]}
                />
              ))}
            </List>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Card
            title="Recent Quotes"
            emptyText="No quotes yet."
            action={<Link to="/app/quotes" className="text-sm text-gray-400 hover:text-white font-semibold">All quotes →</Link>}
          >
            <List>
              {quotes.slice(0, 5).map((q) => (
                <ListItem
                  key={q.id}
                  title={q.title}
                  to={`/app/quotes/${q.id}`}
                  meta={[q.status, q.client_name || '']}
                />
              ))}
            </List>
          </Card>

          <Card
            title="Jobs"
            emptyText="No jobs yet — price custom client work under Sales → Jobs."
            action={<Link to="/app/jobs" className="text-sm text-gray-400 hover:text-white font-semibold">All jobs →</Link>}
          >
            <List>
              {jobs.slice(0, 5).map((j) => (
                <ListItem
                  key={j.id}
                  title={j.title}
                  to={`/app/jobs/${j.id}`}
                  meta={[
                    j.status,
                    j.client_name || j.client_company || "",
                    j.item_count != null ? `${j.item_count} lines` : "",
                  ].filter(Boolean)}
                />
              ))}
            </List>
          </Card>

          <Card
            title="Low Stock"
            emptyText="All good. No low stock items."
            action={<Link to="/app/materials" className="text-sm text-gray-400 hover:text-white font-semibold">Materials →</Link>}
          >
            <List>
              {lowStock.map((m) => (
                <ListItem
                  key={m.id}
                  title={m.name}
                  to="/app/materials"
                  meta={[
                    typeof (m as any).stockKg === "number" ? `${(m as any).stockKg} kg` : "",
                    typeof (m as any).reorderPointKg === "number" ? `Min ${(m as any).reorderPointKg} kg` : "",
                  ]}
                />
              ))}
            </List>
          </Card>
        </div>
      </section>
    </div>
  );
}
