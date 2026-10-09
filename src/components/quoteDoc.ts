/** Shared Arcos quote document presentation helpers (PDF, public page, editor preview). */

export const QUOTE_BRAND = {
  black: "#232323",
  gray: "#353535",
  white: "#ffffff",
  muted: "#6F6F6F",
  soft: "#AFAFAF",
  line: "#E0E0E0",
  paper: "#f0f0f0",
  fromBlock: [
    "ARCOS",
    "Architectural Concrete Solutions",
    "Surabaya, Indonesia",
  ] as const,
  tagline: "Architectural Concrete Solutions",
  footer: "ARCOS · Architectural Concrete Solutions · Surabaya",
  footerElectronic:
    "This document was prepared electronically by ARCOS and is valid without a wet-ink signature. Approval via the share link or written confirmation constitutes acceptance of the quoted terms.",
};

export const DEFAULT_PPN_PCT = 11;

export const DEFAULT_QUOTE_TERMS = `1. Prices in IDR. PPN charged as stated.
2. Quote valid for 14 days from the date above unless otherwise noted.
3. Production lead time depends on quantity and current shop schedule.
4. 50% deposit to confirm order; balance before delivery / installation.
5. Custom pieces are made to order; deposit is non-refundable once production starts.
6. Colour and texture may vary slightly due to natural materials.`;

export type QuoteDocItem = {
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
};

export type QuoteDocData = {
  id?: string;
  title: string;
  client_name?: string | null;
  client_company?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  client_address?: string | null;
  items: QuoteDocItem[];
  /** Grand total (subtotal + PPN) — kept for list compatibility */
  total: number;
  notes?: string | null;
  terms?: string | null;
  ppn_pct?: number;
  created_at?: string;
  status?: string;
};

export function fmtIdr(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

export function fmtQuoteDate(iso?: string | null): string {
  if (!iso) {
    return new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function fmtQuoteRef(id?: string | null, createdAt?: string | null): string {
  const year = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();
  if (!id) return `Q-${year}`;
  const compact = String(id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
  return compact ? `Q-${year}-${compact}` : `Q-${year}`;
}

export function quotePreparedFor(
  data: Pick<QuoteDocData, "client_name" | "client_company">,
): string {
  const name = (data.client_name || "").trim();
  const company = (data.client_company || "").trim();
  if (name && company) return `${name} — ${company}`;
  return name || company || "—";
}

/** Multi-line client block for quote “Prepared for” (name, company, contact, address). */
export function quotePreparedForLines(
  data: Pick<
    QuoteDocData,
    "client_name" | "client_company" | "client_email" | "client_phone" | "client_address"
  >,
): string[] {
  const lines: string[] = [];
  const name = (data.client_name || "").trim();
  const company = (data.client_company || "").trim();
  if (name) lines.push(name);
  if (company) lines.push(company);
  const contact = [(data.client_phone || "").trim(), (data.client_email || "").trim()].filter(Boolean);
  if (contact.length) lines.push(contact.join(" · "));
  const address = (data.client_address || "").trim();
  if (address) {
    for (const part of address.split(/\n+/)) {
      const t = part.trim();
      if (t) lines.push(t);
    }
  }
  return lines.length ? lines : ["—"];
}

export function quoteLineSubtotal(item: QuoteDocItem): number {
  return (Number(item.qty) || 0) * (Number(item.unit_price) || 0);
}

export function quoteSubtotal(items: QuoteDocItem[]): number {
  return (items || []).reduce((s, it) => s + quoteLineSubtotal(it), 0);
}

export function quotePpnPct(data: Pick<QuoteDocData, "ppn_pct">): number {
  if (data.ppn_pct == null || data.ppn_pct === ("" as any)) return DEFAULT_PPN_PCT;
  const n = Number(data.ppn_pct);
  return Number.isFinite(n) ? Math.max(0, n) : DEFAULT_PPN_PCT;
}

/** Empty/missing terms fall back to the standard Arcos quote terms. */
export function quoteTerms(data: Pick<QuoteDocData, "terms">): string {
  const t = data.terms != null ? String(data.terms).trim() : "";
  return t || DEFAULT_QUOTE_TERMS;
}

export function quotePpnAmount(items: QuoteDocItem[], ppnPct: number): number {
  return (quoteSubtotal(items) * Math.max(0, ppnPct)) / 100;
}

export function quoteGrandTotal(items: QuoteDocItem[], ppnPct: number): number {
  return quoteSubtotal(items) + quotePpnAmount(items, ppnPct);
}

export function quoteMetaLine(data: QuoteDocData): string {
  const parts = [fmtQuoteRef(data.id, data.created_at), fmtQuoteDate(data.created_at)];
  if (data.status) parts.push(String(data.status).toUpperCase());
  return parts.join(" · ");
}
