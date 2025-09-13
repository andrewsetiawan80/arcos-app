import type { Currency, FxRates } from "./types";

/** Convert a value priced in `from` to IDR using rates */
export function toIDR(amountPerKg: number|undefined, from: Currency|undefined, fx?: FxRates): number {
  if (!amountPerKg || !from) return 0;
  if (!fx || !fx.rates[from]) return 0;
  return amountPerKg * fx.rates[from];
}

export async function fetchFxIDR(): Promise<FxRates> {
  // We fetch IDR per USD and EUR (and IDR:1). Using exchangerate.host (no key).
  // Docs: https://exchangerate.host/documentation
  // 1) USD->IDR
  const usd = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=IDR").then(r=>r.json());
  // 2) EUR->IDR
  const eur = await fetch("https://api.exchangerate.host/latest?base=EUR&symbols=IDR").then(r=>r.json());

  const usdToIdr = usd?.rates?.IDR ?? 0;
  const eurToIdr = eur?.rates?.IDR ?? 0;

  const fx: FxRates = {
    base: "IDR",
    rates: {
      IDR: 1,
      USD: usdToIdr,
      EUR: eurToIdr,
    },
    fetchedAt: new Date().toISOString(),
  };
  return fx;
}
