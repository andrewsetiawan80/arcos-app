import {
  QUOTE_BRAND,
  fmtIdr,
  fmtQuoteRef,
  quoteGrandTotal,
  quoteLineSubtotal,
  quoteMetaLine,
  quotePpnAmount,
  quotePpnPct,
  quotePreparedForLines,
  quoteSubtotal,
  quoteTerms,
  type QuoteDocData,
} from "./quoteDoc";

/** A4 page — same geometry as Quote PDF (`Page size="A4"`). */
export const QUOTE_A4 = {
  widthMm: 210,
  heightMm: 297,
  /** Matches react-pdf page padding ≈ 36–40pt */
  padY: "12.5mm",
  padX: "14mm",
} as const;

type Props = {
  data: QuoteDocData;
  className?: string;
};

/**
 * On-screen A4 quote sheet. Layout mirrors QuotePDF so editor preview ≈ download.
 */
export default function QuoteDocPreview({ data, className = "" }: Props) {
  const items = Array.isArray(data.items) ? data.items : [];
  const ppnPct = quotePpnPct(data);
  const subtotal = quoteSubtotal(items);
  const ppnAmount = quotePpnAmount(items, ppnPct);
  const total = quoteGrandTotal(items, ppnPct);
  const C = QUOTE_BRAND;

  return (
    <article
      className={`quote-a4 bg-white text-[#232323] shadow-sm border border-black/10 box-border ${className}`}
      style={{
        fontFamily: '"DM Sans", Helvetica, Arial, sans-serif',
        width: `${QUOTE_A4.widthMm}mm`,
        minHeight: `${QUOTE_A4.heightMm}mm`,
        padding: `${QUOTE_A4.padY} ${QUOTE_A4.padX}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header className="flex items-start justify-between gap-4 border-b-2 border-[#232323] pb-4 mb-5">
        <div>
          <div className="w-8 h-[3px] bg-[#232323] mb-1.5" />
          <div className="text-[28px] font-black tracking-wide lowercase leading-none">arcos</div>
          <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[#6F6F6F] font-semibold">
            {C.tagline}
          </p>
        </div>
        <span className="text-[14px] font-bold uppercase tracking-[0.22em] text-[#232323] pt-1">Quote</span>
      </header>

      <h1 className="text-[22px] font-bold tracking-tight leading-tight text-[#232323] mb-1.5">
        {data.title || "Untitled quote"}
      </h1>
      <p className="text-[9px] text-[#6F6F6F] tracking-wide mb-4">{quoteMetaLine(data)}</p>

      <div className="grid grid-cols-2 gap-6 border-b border-[#E0E0E0] pb-4 mb-5">
        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#AFAFAF] mb-1.5">From</p>
          {C.fromBlock.map((line, i) => (
            <p
              key={line}
              className={
                i === 0
                  ? "text-[9px] font-semibold text-[#232323] leading-snug"
                  : "text-[8px] text-[#6F6F6F] leading-snug"
              }
            >
              {line}
            </p>
          ))}
        </div>
        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#AFAFAF] mb-1.5">
            Prepared for
          </p>
          {quotePreparedForLines(data).map((line, i) => (
            <p
              key={`${i}-${line}`}
              className={
                i === 0
                  ? "text-[9px] font-semibold text-[#232323] leading-snug"
                  : "text-[8px] text-[#6F6F6F] leading-snug whitespace-pre-wrap"
              }
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="border border-[#E0E0E0]">
        <div
          className="grid gap-0 px-2 py-2 bg-[#232323] text-white text-[7px] font-bold uppercase tracking-wider"
          style={{ gridTemplateColumns: "42% 12% 12% 17% 17%" }}
        >
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-center">Unit</span>
          <span className="text-right">Unit price</span>
          <span className="text-right">Amount</span>
        </div>
        {items.length === 0 ? (
          <p className="px-2 py-5 text-[9px] text-[#AFAFAF]">No line items yet.</p>
        ) : (
          items.map((it, i) => (
            <div
              key={i}
              className="grid gap-0 px-2 py-2 border-t border-[#E0E0E0] text-[9px] tabular-nums"
              style={{ gridTemplateColumns: "42% 12% 12% 17% 17%" }}
            >
              <span className="leading-snug pr-1">{it.description || "—"}</span>
              <span className="text-right">{it.qty}</span>
              <span className="text-center">{it.unit || "—"}</span>
              <span className="text-right">{fmtIdr(it.unit_price)}</span>
              <span className="text-right font-medium">{fmtIdr(quoteLineSubtotal(it))}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t-2 border-[#232323] space-y-1">
        <div className="flex justify-end gap-4 text-[9px] tabular-nums text-[#6F6F6F]">
          <span>Subtotal</span>
          <span className="min-w-[7rem] text-right">{fmtIdr(subtotal)}</span>
        </div>
        <div className="flex justify-end gap-4 text-[9px] tabular-nums text-[#6F6F6F]">
          <span>PPN {ppnPct}%</span>
          <span className="min-w-[7rem] text-right">{fmtIdr(ppnAmount)}</span>
        </div>
        <div className="flex justify-end items-baseline gap-4 pt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
          <span className="min-w-[7rem] text-right text-[16px] font-bold tabular-nums">{fmtIdr(total)}</span>
        </div>
      </div>

      {data.notes ? (
        <div className="mt-4 pt-3 border-t border-[#E0E0E0]">
          <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#AFAFAF] mb-1.5">Notes</p>
          <p className="text-[9px] text-[#6F6F6F] whitespace-pre-wrap leading-relaxed">{data.notes}</p>
        </div>
      ) : null}

      <div className="mt-4 pt-3 border-t border-[#E0E0E0]">
        <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#AFAFAF] mb-1.5">
          Terms &amp; conditions
        </p>
        <p className="text-[8px] text-[#6F6F6F] whitespace-pre-wrap leading-relaxed">{quoteTerms(data)}</p>
      </div>

      <div className="mt-auto pt-4 border-t border-[#E0E0E0] space-y-1.5">
        <div className="flex justify-between gap-4 text-[7px] text-[#AFAFAF] tracking-wide">
          <span>{C.footer}</span>
          <span className="shrink-0">{fmtQuoteRef(data.id, data.created_at)}</span>
        </div>
        <p className="text-[7px] text-[#AFAFAF] leading-relaxed">{C.footerElectronic}</p>
      </div>
    </article>
  );
}
