import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";
import {
  QUOTE_BRAND,
  fmtIdr,
  fmtQuoteDate,
  fmtQuoteRef,
  quoteGrandTotal,
  quoteLineSubtotal,
  quoteMetaLine,
  quotePpnAmount,
  quotePpnPct,
  quotePreparedFor,
  quotePreparedForLines,
  quoteSubtotal,
  quoteTerms,
  type QuoteDocData,
} from "./quoteDoc";

export type { QuoteDocData };

function fileNameFor(data: QuoteDocData) {
  return `ARCOS-Quote-${(data.title || "quote").replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;
}

async function resolveQuoteData(quoteId?: string, quote?: QuoteDocData): Promise<QuoteDocData> {
  if (quote) return quote;
  if (!quoteId) throw new Error("No quote data");
  const res = await api.getQuote(quoteId);
  if (res.error || !res.data) throw new Error(res.error || "Failed to fetch quote");
  const q = res.data as any;
  return {
    id: q.id,
    title: q.title,
    client_name: q.client_name,
    client_company: q.client_company,
    client_email: q.client_email,
    client_phone: q.client_phone,
    client_address: q.client_address,
    items: q.items || [],
    total: Number(q.total) || 0,
    notes: q.notes,
    terms: q.terms,
    ppn_pct: q.ppn_pct,
    created_at: q.created_at,
    status: q.status,
  };
}

async function buildQuotePdfBlob(data: QuoteDocData): Promise<Blob> {
  const { Document, Page, Text, View, StyleSheet, pdf } = await import("@react-pdf/renderer");
  const C = QUOTE_BRAND;

  const styles = StyleSheet.create({
    page: {
      backgroundColor: C.white,
      paddingTop: 36,
      paddingBottom: 48,
      paddingHorizontal: 40,
      fontFamily: "Helvetica",
      color: C.black,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingBottom: 14,
      borderBottomWidth: 2,
      borderBottomColor: C.black,
      marginBottom: 22,
    },
    logoBar: { width: 32, height: 3, backgroundColor: C.black, marginBottom: 6 },
    logo: { fontSize: 28, fontFamily: "Helvetica-Bold", letterSpacing: 0.6 },
    tagline: { fontSize: 9, color: C.muted, letterSpacing: 1.4, marginTop: 5, textTransform: "uppercase" },
    docLabel: {
      fontSize: 14,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 2.2,
      color: C.black,
      marginTop: 4,
    },
    title: {
      fontSize: 22,
      fontFamily: "Helvetica-Bold",
      marginBottom: 6,
      lineHeight: 1.2,
    },
    meta: { fontSize: 9, color: C.muted, marginBottom: 18, letterSpacing: 0.3 },
    parties: {
      flexDirection: "row",
      gap: 24,
      marginBottom: 22,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: C.line,
    },
    partyCol: { flex: 1 },
    partyLabel: {
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 1.4,
      color: C.soft,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    partyLine: { fontSize: 9, color: C.black, marginBottom: 2, lineHeight: 1.35 },
    partyMuted: { fontSize: 8, color: C.muted, marginBottom: 2, lineHeight: 1.35 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: C.black,
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: C.line,
    },
    th: { color: C.white, fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 0.8 },
    td: { fontSize: 9, color: C.black },
    colDesc: { width: "42%" },
    colQty: { width: "12%", textAlign: "right" },
    colUnit: { width: "12%", textAlign: "center" },
    colPrice: { width: "17%", textAlign: "right" },
    colTotal: { width: "17%", textAlign: "right" },
    totalRow: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 2,
      borderTopColor: C.black,
      alignItems: "flex-end",
    },
    totalLine: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "baseline",
      gap: 16,
      marginBottom: 4,
      width: "100%",
    },
    totalMuted: { fontSize: 9, color: C.muted },
    totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
    totalValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
    notes: {
      marginTop: 18,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: C.line,
    },
    notesLabel: {
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 1.4,
      color: C.soft,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    notesBody: { fontSize: 9, color: C.muted, lineHeight: 1.45 },
    termsBody: { fontSize: 8, color: C.muted, lineHeight: 1.4 },
    footer: {
      position: "absolute",
      bottom: 22,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: C.line,
      paddingTop: 8,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    footerMeta: { fontSize: 7, color: C.soft },
    footerElectronic: { fontSize: 6.5, color: C.soft, lineHeight: 1.35 },
  });

  const items = Array.isArray(data.items) ? data.items : [];
  const ppnPct = quotePpnPct(data);
  const subtotal = quoteSubtotal(items);
  const ppnAmount = quotePpnAmount(items, ppnPct);
  const total = quoteGrandTotal(items, ppnPct);

  const doc = (
    <Document title={data.title || "Quote"} author="ARCOS">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <View style={styles.logoBar} />
            <Text style={styles.logo}>arcos</Text>
            <Text style={styles.tagline}>{C.tagline}</Text>
          </View>
          <Text style={styles.docLabel}>QUOTE</Text>
        </View>

        <Text style={styles.title}>{data.title || "Untitled quote"}</Text>
        <Text style={styles.meta}>{quoteMetaLine(data)}</Text>

        <View style={styles.parties}>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>From</Text>
            {C.fromBlock.map((line) => (
              <Text key={line} style={line === "ARCOS" ? styles.partyLine : styles.partyMuted}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>Prepared for</Text>
            {quotePreparedForLines(data).map((line, i) => (
              <Text key={`${i}-${line}`} style={i === 0 ? styles.partyLine : styles.partyMuted}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.th]}>Description</Text>
            <Text style={[styles.colQty, styles.th]}>Qty</Text>
            <Text style={[styles.colUnit, styles.th]}>Unit</Text>
            <Text style={[styles.colPrice, styles.th]}>Unit price</Text>
            <Text style={[styles.colTotal, styles.th]}>Amount</Text>
          </View>
          {items.map((it, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={[styles.colDesc, styles.td]}>{it.description || "—"}</Text>
              <Text style={[styles.colQty, styles.td]}>{it.qty}</Text>
              <Text style={[styles.colUnit, styles.td]}>{it.unit || "—"}</Text>
              <Text style={[styles.colPrice, styles.td]}>{fmtIdr(it.unit_price)}</Text>
              <Text style={[styles.colTotal, styles.td]}>{fmtIdr(quoteLineSubtotal(it))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <View style={styles.totalLine}>
            <Text style={styles.totalMuted}>Subtotal</Text>
            <Text style={styles.totalMuted}>{fmtIdr(subtotal)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalMuted}>{`PPN ${ppnPct}%`}</Text>
            <Text style={styles.totalMuted}>{fmtIdr(ppnAmount)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{fmtIdr(total)}</Text>
          </View>
        </View>

        {data.notes ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesBody}>{data.notes}</Text>
          </View>
        ) : null}

        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Terms & conditions</Text>
          <Text style={styles.termsBody}>{quoteTerms(data)}</Text>
        </View>

        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text style={styles.footerMeta}>{C.footer}</Text>
            <Text style={styles.footerMeta}>{fmtQuoteRef(data.id, data.created_at)}</Text>
          </View>
          <Text style={styles.footerElectronic}>{C.footerElectronic}</Text>
        </View>
      </Page>
    </Document>
  );

  return pdf(doc).toBlob();
}

/**
 * Lazily generates an Arcos Quote PDF and opens an in-app preview.
 * Download is optional from the preview dialog.
 */
export function QuotePDFDownloadButton({
  quoteId,
  quote,
  className = "",
}: {
  quoteId?: string;
  quote?: QuoteDocData;
  className?: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("ARCOS-Quote.pdf");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const closePreview = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleOpenPreview = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const data = await resolveQuoteData(quoteId, quote);
      const blob = await buildQuotePdfBlob(data);
      const url = URL.createObjectURL(blob);
      setPreviewName(fileNameFor(data));
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = previewName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenPreview}
        disabled={isGenerating}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 ${className}`}
      >
        {isGenerating ? "Generating…" : "PDF"}
      </button>

      {previewUrl &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex flex-col bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Quote PDF preview"
            onClick={closePreview}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#232323] border-b border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-gray-300 truncate min-w-0">
                PDF preview · {previewName}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-100"
                >
                  Download
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border border-white/20 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Open tab
                </a>
                <button
                  type="button"
                  onClick={closePreview}
                  className="px-4 py-2 border border-white/20 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-3 sm:p-6" onClick={(e) => e.stopPropagation()}>
              <iframe
                title="Quote PDF preview"
                src={previewUrl}
                className="w-full h-full rounded-sm bg-white border border-white/10"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export { fmtIdr, fmtQuoteDate, fmtQuoteRef, quoteMetaLine, quotePreparedFor };
