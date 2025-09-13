// src/lib/fx.ts
// Robust FX helper with multi-source fallback + manual override.
// Stores rates as: 1 USD = idrPer.USD (IDR), 1 EUR = idrPer.EUR (IDR).

export type FxBundle = {
  base: "IDR";
  idrPer: { USD: number; EUR: number }; // e.g., { USD: 15800, EUR: 17000 }
  fetchedAt: string;                     // ISO timestamp
  source: string;                        // which API provided it (or "manual")
};

const KEY = "cw_fx_idr_usd_eur_v2";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

export function loadFx(): FxBundle | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const fx: FxBundle = JSON.parse(raw);
    if (!fx?.idrPer?.USD || !fx?.idrPer?.EUR) return null;
    if (Date.now() - new Date(fx.fetchedAt).getTime() > TTL_MS) return null;
    return fx;
  } catch {
    return null;
  }
}

export function saveFx(fx: FxBundle) {
  localStorage.setItem(KEY, JSON.stringify(fx));
}

// Manual override (e.g. when API blocked)
export function setManualFx(usdToIdr: number, eurToIdr: number): FxBundle {
  const fx: FxBundle = {
    base: "IDR",
    idrPer: { USD: Number(usdToIdr), EUR: Number(eurToIdr) },
    fetchedAt: new Date().toISOString(),
    source: "manual",
  };
  saveFx(fx);
  return fx;
}

function timeoutFetch(url: string, ms = 7000): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { signal: ctl.signal })
    .finally(() => clearTimeout(t));
}

// ----- Source 1: exchangerate.host -----
async function fetchFromExchangerateHost(): Promise<FxBundle | null> {
  const [rUSD, rEUR] = await Promise.all([
    timeoutFetch("https://api.exchangerate.host/latest?base=USD&symbols=IDR"),
    timeoutFetch("https://api.exchangerate.host/latest?base=EUR&symbols=IDR"),
  ]);
  if (!rUSD.ok || !rEUR.ok) return null;
  const jUSD = await rUSD.json();
  const jEUR = await rEUR.json();
  const usdToIdr = Number(jUSD?.rates?.IDR);
  const eurToIdr = Number(jEUR?.rates?.IDR);
  if (!usdToIdr || !eurToIdr) return null;
  return {
    base: "IDR",
    idrPer: { USD: usdToIdr, EUR: eurToIdr },
    fetchedAt: new Date().toISOString(),
    source: "exchangerate.host",
  };
}

// ----- Source 2: frankfurter.app -----
async function fetchFromFrankfurter(): Promise<FxBundle | null> {
  // Docs: https://www.frankfurter.app/docs/
  const [rUSD, rEUR] = await Promise.all([
    timeoutFetch("https://api.frankfurter.app/latest?from=USD&to=IDR"),
    timeoutFetch("https://api.frankfurter.app/latest?from=EUR&to=IDR"),
  ]);
  if (!rUSD.ok || !rEUR.ok) return null;
  const jUSD = await rUSD.json();
  const jEUR = await rEUR.json();
  const usdToIdr = Number(jUSD?.rates?.IDR);
  const eurToIdr = Number(jEUR?.rates?.IDR);
  if (!usdToIdr || !eurToIdr) return null;
  return {
    base: "IDR",
    idrPer: { USD: usdToIdr, EUR: eurToIdr },
    fetchedAt: new Date().toISOString(),
    source: "frankfurter.app",
  };
}

// ----- Source 3: open.er-api.com -----
async function fetchFromErApi(): Promise<FxBundle | null> {
  const [rUSD, rEUR] = await Promise.all([
    timeoutFetch("https://open.er-api.com/v6/latest/USD"),
    timeoutFetch("https://open.er-api.com/v6/latest/EUR"),
  ]);
  if (!rUSD.ok || !rEUR.ok) return null;
  const jUSD = await rUSD.json();
  const jEUR = await rEUR.json();
  const usdToIdr = Number(jUSD?.rates?.IDR);
  const eurToIdr = Number(jEUR?.rates?.IDR);
  if (!usdToIdr || !eurToIdr) return null;
  return {
    base: "IDR",
    idrPer: { USD: usdToIdr, EUR: eurToIdr },
    fetchedAt: new Date().toISOString(),
    source: "open.er-api.com",
  };
}

// Try sources in order
export async function fetchFx(): Promise<FxBundle> {
  const s1 = await fetchFromExchangerateHost().catch(() => null);
  if (s1) { saveFx(s1); return s1; }
  const s2 = await fetchFromFrankfurter().catch(() => null);
  if (s2) { saveFx(s2); return s2; }
  const s3 = await fetchFromErApi().catch(() => null);
  if (s3) { saveFx(s3); return s3; }
  throw new Error("All FX sources failed");
}

export async function getFx(): Promise<FxBundle> {
  const cached = loadFx();
  if (cached) return cached;
  const fx = await fetchFx();
  saveFx(fx);
  return fx;
}

// Convert currency → IDR using current bundle.
// If fx is null and currency !== IDR, returns NaN to signal "unavailable".
export function idrFrom(
  amount: number,
  currency: "IDR" | "USD" | "EUR",
  fx: FxBundle | null
): number {
  if (!isFinite(amount)) return NaN;
  if (currency === "IDR") return amount;
  if (!fx) return NaN;
  if (currency === "USD") return amount * fx.idrPer.USD;
  if (currency === "EUR") return amount * fx.idrPer.EUR;
  return NaN;
}
