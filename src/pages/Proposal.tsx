import React, { useMemo, useState } from "react";
import { load } from "../store";
import type { AppState, Product, ProductVariant } from "../types";
import NumberField from "../components/NumberField";

type UnitMode = "sqm" | "tiles";
type PriceBasis = "sqm" | "tile";

type LineItem = {
  id: string;
  productId: string;
  variantId?: string;
  mode: UnitMode;
  qty?: number;                 // m² if mode = 'sqm', tiles if 'tiles'
  priceBasis: PriceBasis;       // whether the unit price is per m² or per tile
  unitPriceIDR?: number;        // manual override, else we try to read from product/variant
  note?: string;
};

const newid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);

function mm2ToM2(w_mm?: number, h_mm?: number): number | undefined {
  if (!w_mm || !h_mm) return undefined;
  return (w_mm / 1000) * (h_mm / 1000);
}

export default function Proposal() {
  const [state] = useState<AppState>(() => load());

  // Quote header fields
  const [clientName, setClientName] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [quoteNo, setQuoteNo] = useState<string>(() => `CW-${new Date().getFullYear()}-${Math.floor(Math.random()*9000+1000)}`);
  const [validDays, setValidDays] = useState<number>(14);
  const [taxPct, setTaxPct] = useState<number>(11); // VAT/PPN (example)
  const [shippingIDR, setShippingIDR] = useState<number>(0);
  const [footerNote, setFooterNote] = useState<string>("Prices in IDR. Production lead time depends on quantity and current schedule.");

  const products = state.products;
  const prodsById: Record<string, Product> = useMemo(() => {
    const m: Record<string, Product> = {};
    products.forEach(p => m[p.id] = p);
    return m;
  }, [products]);

  // Items
  const [items, setItems] = useState<LineItem[]>(() => [
    {
      id: newid(),
      productId: products[0]?.id || "",
      variantId: products[0]?.variants?.[0]?.id,
      mode: "sqm",
      qty: undefined,
      priceBasis: "sqm",
      unitPriceIDR: undefined,
      note: "",
    }
  ]);

  function addItem() {
    const first = products[0];
    setItems(prev => [
      ...prev,
      {
        id: newid(),
        productId: first?.id || "",
        variantId: first?.variants?.[0]?.id,
        mode: "sqm",
        qty: undefined,
        priceBasis: "sqm",
        unitPriceIDR: undefined,
        note: "",
      }
    ]);
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateItem<T extends keyof LineItem>(id: string, key: T, value: LineItem[T]) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: value } : i));
  }

  // Pricing helpers — very tolerant: read from variant or product if present, else fall back to manual unitPrice
  function getTileArea_m2(prod?: Product, variant?: ProductVariant): number | undefined {
    return prod?.tileArea_m2 ?? mm2ToM2(prod?.size?.w_mm, prod?.size?.h_mm);
  }

  function getDefaultUnitPriceIDR(item: LineItem): number | undefined {
    const product = prodsById[item.productId];
    const variant = product?.variants?.find(v => v.id === item.variantId);

    // You can store these on product/variant in your editor:
    //   pricePerSqmIDR, pricePerTileIDR
    const perSqm = (variant as any)?.pricePerSqmIDR ?? (product as any)?.pricePerSqmIDR;
    const perTile = (variant as any)?.pricePerTileIDR ?? (product as any)?.pricePerTileIDR;

    if (item.priceBasis === "sqm") return perSqm;
    return perTile;
  }

  function lineComputed(item: LineItem) {
    const product = prodsById[item.productId];
    const variant = product?.variants?.find(v => v.id === item.variantId);
    const tileArea = getTileArea_m2(product, variant);

    const unitPrice = item.unitPriceIDR ?? getDefaultUnitPriceIDR(item);
    if (!unitPrice || !item.qty) {
      return { unitPrice, displayQty: 0, lineTotal: 0, tileArea };
    }

    if (item.priceBasis === "sqm") {
      // If price is per m²:
      const qtySqm = item.mode === "sqm"
        ? item.qty
        : (tileArea ? item.qty * tileArea : 0);
      const total = qtySqm * unitPrice;
      return { unitPrice, displayQty: qtySqm, lineTotal: total, tileArea };
    } else {
      // If price is per tile:
      const qtyTiles = item.mode === "tiles"
        ? item.qty
        : (tileArea ? Math.ceil(item.qty / tileArea) : 0);
      const total = qtyTiles * unitPrice;
      return { unitPrice, displayQty: qtyTiles, lineTotal: total, tileArea };
    }
  }

  const computed = items.map(lineComputed);
  const subTotal = computed.reduce((a, c) => a + (c.lineTotal || 0), 0);
  const taxAmt = subTotal * (isFinite(taxPct) ? (taxPct || 0) / 100 : 0);
  const grandTotal = subTotal + taxAmt + (shippingIDR || 0);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative print:hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Sales & Proposals</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Project Calculator
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Create professional client proposals with product pricing, quantities, and project calculations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Quotation
            </button>
          </div>
        </div>
      </header>

      {/* Quote meta */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Client / Company</div>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. PT. Example"
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Project name</div>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. Lobby Feature Wall"
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Quote no.</div>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={quoteNo}
              onChange={e => setQuoteNo(e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Valid for (days)</div>
            <NumberField
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={validDays}
              onChange={setValidDays}
              step="1"
            />
          </div>
        </div>
      </section>

      {/* Line items */}
      <section className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">
            Items
          </div>
          <button
            onClick={addItem}
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
          >
            + Add item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="py-2 px-3 border-b border-white/10">Product</th>
                <th className="py-2 px-3 border-b border-white/10">Variant</th>
                <th className="py-2 px-3 border-b border-white/10">Measure</th>
                <th className="py-2 px-3 border-b border-white/10">Qty</th>
                <th className="py-2 px-3 border-b border-white/10">Price basis</th>
                <th className="py-2 px-3 border-b border-white/10">Unit price (IDR)</th>
                <th className="py-2 px-3 border-b border-white/10">Computed qty</th>
                <th className="py-2 px-3 border-b border-white/10">Line total (IDR)</th>
                <th className="py-2 px-3 border-b border-white/10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const product = prodsById[it.productId];
                const variants = product?.variants || [];
                const variant = variants.find(v => v.id === it.variantId);
                const c = computed[idx];

                const tileArea = c.tileArea;
                const hint =
                  it.mode === "tiles" && tileArea
                    ? `~ ${(tileArea * (it.qty || 0)).toFixed(2)} m²`
                    : it.mode === "sqm" && tileArea
                      ? `~ ${Math.ceil((it.qty || 0) / tileArea)} tiles`
                      : "";

                return (
                  <tr key={it.id} className="align-top hover:bg-white/5">
                    <td className="py-3 px-3 border-b border-white/5 min-w-[220px]">
                      <select
                        className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                        value={it.productId}
                        onChange={e => {
                          const pid = e.target.value;
                          const p = prodsById[pid];
                          updateItem(it.id, "productId", pid);
                          updateItem(it.id, "variantId", p?.variants?.[0]?.id);
                        }}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 border-b border-white/5 min-w-[160px]">
                      <select
                        className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                        value={it.variantId}
                        onChange={e => updateItem(it.id, "variantId", e.target.value)}
                      >
                        {variants.map(v => (
                          <option key={v.id} value={v.id}>{v.name || v.id}</option>
                        ))}
                      </select>
                      {tileArea !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          Tile area: {tileArea.toFixed(4)} m²
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 border-b border-white/5">
                      <div className="flex gap-3 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="radio" checked={it.mode === "sqm"} onChange={() => updateItem(it.id, "mode", "sqm")} />
                          m²
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" checked={it.mode === "tiles"} onChange={() => updateItem(it.id, "mode", "tiles")} />
                          tiles
                        </label>
                      </div>
                    </td>
                    <td className="py-3 px-3 border-b border-white/5 min-w-[140px]">
                      <NumberField
                        className="w-36 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                        value={it.qty}
                        onChange={(v) => updateItem(it.id, "qty", v)}
                        step={it.mode === "sqm" ? "0.01" : "1"}
                      />
                      {!!hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
                    </td>
                    <td className="py-3 px-3 border-b border-white/5">
                      <div className="flex gap-3 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="radio" checked={it.priceBasis === "sqm"} onChange={() => updateItem(it.id, "priceBasis", "sqm")} />
                          per m²
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" checked={it.priceBasis === "tile"} onChange={() => updateItem(it.id, "priceBasis", "tile")} />
                          per tile
                        </label>
                      </div>
                    </td>
                    <td className="py-3 px-3 border-b border-white/5 min-w-[180px]">
                      <NumberField
                        className="w-40 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                        value={it.unitPriceIDR ?? getDefaultUnitPriceIDR(it)}
                        onChange={(v) => updateItem(it.id, "unitPriceIDR", v)}
                        step="1000"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {(it.unitPriceIDR ?? getDefaultUnitPriceIDR(it)) ? "" : "Set a unit price"}
                      </div>
                    </td>
                    <td className="py-3 px-3 border-b border-white/5">
                      <div className="text-sm">
                        {it.priceBasis === "sqm" ? `${c.displayQty?.toFixed(2)} m²` : `${c.displayQty?.toFixed(0)} tiles`}
                      </div>
                    </td>
                    <td className="py-3 px-3 border-b border-white/5">
                      {c.lineTotal.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-3 border-b border-white/5">
                      <button
                        onClick={() => removeItem(it.id)}
                        className="text-red-300 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="text-xs text-gray-400 mb-1">Footer note (visible on quote)</div>
            <textarea
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              rows={3}
              value={footerNote}
              onChange={e => setFooterNote(e.target.value)}
            />
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-black/30 space-y-2">
            <div className="flex justify-between text-sm">
              <div>Subtotal</div>
              <div>IDR {subTotal.toLocaleString("id-ID")}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                Tax
                <NumberField className="w-16 rounded bg-black/20 border border-white/10 px-2 py-1 text-xs"
                  value={taxPct} onChange={setTaxPct} step="1" />
                %
              </div>
              <div>IDR {taxAmt.toLocaleString("id-ID")}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>Shipping</div>
              <NumberField className="w-28 rounded bg-black/20 border border-white/10 px-2 py-1 text-xs"
                value={shippingIDR} onChange={setShippingIDR} step="1000" />
            </div>
            <div className="border-t border-white/10 my-2" />
            <div className="flex justify-between font-semibold">
              <div>Total</div>
              <div>IDR {grandTotal.toLocaleString("id-ID")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Printable Quotation ---------- */}
      <section className="hidden print:block bg-white text-black p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-semibold">CRETEWERKZ — Quotation</div>
            <div className="text-sm mt-1">Date: {todayISO()}</div>
            <div className="text-sm">Valid for: {validDays} days</div>
          </div>
          <div className="text-right text-sm">
            <div><strong>Client:</strong> {clientName || "—"}</div>
            <div><strong>Project:</strong> {projectName || "—"}</div>
            <div><strong>Quote no.:</strong> {quoteNo}</div>
          </div>
        </div>

        <table className="w-full text-sm border border-black/20 mt-6">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left p-2 border-b border-black/20">Product</th>
              <th className="text-left p-2 border-b border-black/20">Variant</th>
              <th className="text-left p-2 border-b border-black/20">Measure</th>
              <th className="text-left p-2 border-b border-black/20">Qty</th>
              <th className="text-left p-2 border-b border-black/20">Unit price</th>
              <th className="text-left p-2 border-b border-black/20">Line total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const p = prodsById[it.productId];
              const v = p?.variants?.find(x => x.id === it.variantId);
              const c = computed[idx];
              return (
                <tr key={it.id} className="align-top">
                  <td className="p-2 border-b border-black/10">{p?.title || "—"}</td>
                  <td className="p-2 border-b border-black/10">{v?.name || "—"}</td>
                  <td className="p-2 border-b border-black/10">{it.priceBasis === "sqm" ? "per m²" : "per tile"}</td>
                  <td className="p-2 border-b border-black/10">
                    {it.priceBasis === "sqm" ? `${c.displayQty?.toFixed(2)} m²` : `${c.displayQty?.toFixed(0)} tiles`}
                  </td>
                  <td className="p-2 border-b border-black/10">IDR {(c.unitPrice || 0).toLocaleString("id-ID")}</td>
                  <td className="p-2 border-b border-black/10">IDR {c.lineTotal.toLocaleString("id-ID")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
          <div className="border border-black/20 rounded p-3 whitespace-pre-wrap">
            <strong>Notes</strong>
            <div className="mt-2">{footerNote}</div>
          </div>
          <div className="border border-black/20 rounded p-3">
            <div className="flex justify-between"><div>Subtotal</div><div>IDR {subTotal.toLocaleString("id-ID")}</div></div>
            <div className="flex justify-between"><div>Tax ({taxPct}%)</div><div>IDR {taxAmt.toLocaleString("id-ID")}</div></div>
            <div className="flex justify-between"><div>Shipping</div><div>IDR {shippingIDR.toLocaleString("id-ID")}</div></div>
            <div className="border-t border-black/20 my-2" />
            <div className="flex justify-between font-semibold text-base">
              <div>Total</div><div>IDR {grandTotal.toLocaleString("id-ID")}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-black/60">
          Generated by Cretewerkz Mix App — {new Date().toLocaleString()}
        </div>
      </section>
    </div>
  );
}
