import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { fmt, rp, ticketDeepLink, type TicketRow } from "./core";

export type TicketPdfCostLine = {
  name: string;
  grams: number;
  cost: number;
  priced: boolean;
};

export type TicketPdfCost = {
  priced: boolean;
  batch: number;
  perKgDry: number;
  perKgWet: number;
  lines: TicketPdfCostLine[];
};

export type TicketPdfOptions = {
  name: string;
  meta: string;
  rows: TicketRow[];
  batches?: number;
  /** e.g. "28.6%" */
  wbLabel: string;
  portlandLabel: string;
  pozzolanLabel: string;
  waterGrossG: number;
  waterFromAcrylicG?: number;
  isRdp?: boolean;
  recipeId?: string | null;
  dryWeight?: number;
  weighedBy?: string;
  /** Include second page with material cost breakdown. */
  includeCost?: boolean;
  cost?: TicketPdfCost | null;
};

function fileSlug(name: string): string {
  return (
    String(name || "batch")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "batch"
  );
}

/** Arcos wordmark right-aligned. */
function drawArcosLogo(doc: jsPDF, xRight: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const text = "arcos";
  const w = doc.getTextWidth(text);
  const x = xRight - w;
  doc.setFillColor(17);
  doc.rect(x, y - 5.2, 7.2, 0.85, "F");
  doc.setTextColor(17);
  doc.text(text, x, y);
  return w;
}

async function qrPng(url: string, size = 180): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    });
  } catch {
    return "";
  }
}

async function buildBatchTicketPdf(opts: TicketPdfOptions): Promise<jsPDF> {
  const batches = Math.max(1, Math.round(opts.batches || 1));
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 14;
  const right = pageW - 14;
  let y = 14;

  const qrUrl = opts.recipeId
    ? await qrPng(ticketDeepLink(opts.recipeId, opts.dryWeight || 1000), 180)
    : "";

  doc.setDrawColor(17);
  doc.setLineWidth(0.6);
  doc.line(left, y, right, y);
  y += 8;

  // Left: doc label · Right: Arcos logo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(85);
  doc.text("BATCH TICKET", left, y - 0.5);
  drawArcosLogo(doc, right, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17);
  const titleLines = doc.splitTextToSize(opts.name || "Untitled mix", right - left);
  doc.text(titleLines, left, y);
  y += titleLines.length * 7 + 1;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51);
  const metaLines = doc.splitTextToSize(opts.meta || "", right - left);
  doc.text(metaLines, left, y);
  y += metaLines.length * 4.5 + 2;

  doc.setDrawColor(17);
  doc.setLineWidth(0.3);
  doc.line(left, y, right, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(85);
  doc.text("MATERIAL", left, y);
  doc.text("g", right, y, { align: "right" });
  y += 2;
  doc.setDrawColor(17);
  doc.line(left, y, right, y);
  y += 5;

  const grams = (g: number) => (Number(g) || 0) * batches;

  opts.rows.forEach((row) => {
    if (y > pageH - 48) {
      doc.addPage();
      y = 16;
    }
    if (row[0] === "group") {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(51);
      doc.text(String(row[1]).toUpperCase(), left, y);
      y += 5;
      return;
    }
    if (row[0] === "total") {
      doc.setDrawColor(17);
      doc.setLineWidth(0.5);
      doc.line(left, y - 2, right, y - 2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17);
      doc.text(String(row[1]), left, y + 2);
      doc.text(fmt(grams(Number(row[2])), 0), right, y + 2, { align: "right" });
      y += 8;
      return;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(17);
    doc.text(String(row[0]), left, y);
    doc.setFont("courier", "normal");
    doc.text(fmt(grams(Number(row[1])), 0), right, y, { align: "right" });
    doc.setDrawColor(232);
    doc.setLineWidth(0.2);
    doc.line(left, y + 1.8, right, y + 1.8);
    y += 6;
  });

  y += 4;
  if (y > pageH - 55) {
    doc.addPage();
    y = 16;
  }
  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.rect(left, y, right - left, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(17);
  doc.text(`Total water/binder ratio: ${opts.wbLabel} of binder`, left + 3, y + 7.5);
  y += 18;

  doc.setFontSize(9);
  doc.setTextColor(85);
  doc.text(
    `Portland ${opts.portlandLabel}   Pozzolan ${opts.pozzolanLabel}   Design water ${fmt(opts.waterGrossG * batches, 0)} g`,
    left,
    y,
  );
  y += 8;
  if (!opts.isRdp && (opts.waterFromAcrylicG || 0) > 1e-9) {
    doc.text(
      `Already in liquid polymer — do not add separately: ${fmt((opts.waterFromAcrylicG || 0) * batches, 0)} g`,
      left,
      y,
    );
    y += 8;
  }

  if (y > pageH - 42) {
    doc.addPage();
    y = 16;
  }
  doc.setDrawColor(17);
  doc.setLineWidth(0.3);
  doc.line(left, y, right, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(85);
  const signRight = qrUrl ? right - 28 : right;
  const mid = (left + signRight) / 2;
  doc.text("Weighed by", left, y);
  doc.text("Checked / date", mid + 4, y);
  y += 14;
  doc.setDrawColor(17);
  doc.line(left, y, mid - 4, y);
  doc.line(mid + 4, y, signRight, y);
  if (opts.weighedBy) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17);
    doc.text(opts.weighedBy, left, y - 2);
  }
  if (qrUrl) {
    doc.addImage(qrUrl, "PNG", right - 24, y - 18, 24, 24);
  }

  if (opts.includeCost && opts.cost) {
    doc.addPage();
    y = 14;
    doc.setDrawColor(17);
    doc.setLineWidth(0.6);
    doc.line(left, y, right, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(85);
    doc.text("MATERIAL COST", left, y - 0.5);
    drawArcosLogo(doc, right, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(17);
    const costTitle = doc.splitTextToSize(opts.name || "Untitled mix", right - left);
    doc.text(costTitle, left, y);
    y += costTitle.length * 7 + 4;

    if (!opts.cost.priced) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(85);
      doc.text("No material prices set yet. Add them on the Material prices page.", left, y);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51);
      const runLabel = batches > 1 ? `This run (${batches} batches)` : "This batch";
      doc.text(`${runLabel}: ${rp(opts.cost.batch * batches)}`, left, y);
      y += 5;
      if (batches > 1) {
        doc.text(`Per batch: ${rp(opts.cost.batch)}`, left, y);
        y += 5;
      }
      doc.text(`Per kg dry: ${rp(opts.cost.perKgDry)}`, left, y);
      y += 5;
      doc.text(`Per kg wet: ${rp(opts.cost.perKgWet)}`, left, y);
      y += 8;

      doc.setDrawColor(17);
      doc.setLineWidth(0.3);
      doc.line(left, y, right, y);
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(85);
      doc.text("MATERIAL", left, y);
      doc.text("QTY", right - 42, y, { align: "right" });
      doc.text("COST", right, y, { align: "right" });
      y += 2;
      doc.setDrawColor(17);
      doc.line(left, y, right, y);
      y += 5;

      opts.cost.lines.forEach((row) => {
        if (y > pageH - 20) {
          doc.addPage();
          y = 16;
        }
        const g = row.grams * batches;
        const qty = g >= 1000 ? `${fmt(g / 1000, 2)} kg` : `${fmt(g, 1)} g`;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(17);
        doc.text(row.name, left, y);
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.text(qty, right - 42, y, { align: "right" });
        doc.text(row.priced ? rp(row.cost * batches) : "—", right, y, { align: "right" });
        doc.setDrawColor(232);
        doc.setLineWidth(0.2);
        doc.line(left, y + 1.8, right, y + 1.8);
        y += 6;
      });

      y += 2;
      doc.setDrawColor(17);
      doc.setLineWidth(0.5);
      doc.line(left, y, right, y);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17);
      doc.text("Total", left, y);
      doc.text(rp(opts.cost.batch * batches), right, y, { align: "right" });
    }
  }

  return doc;
}

export async function downloadBatchTicketPdf(opts: TicketPdfOptions): Promise<void> {
  const doc = await buildBatchTicketPdf(opts);
  const dry = Math.round(opts.dryWeight || 1000);
  const suffix = opts.includeCost ? "ticket-cost" : "print";
  doc.save(`${fileSlug(opts.name)}-${dry}g-${suffix}.pdf`);
}

/** Open the same A4 ticket in the system print dialog (no download). */
export async function printBatchTicketPdf(opts: TicketPdfOptions): Promise<void> {
  const doc = await buildBatchTicketPdf(opts);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const existing = document.getElementById("mix-ticket-pdf-frame");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "mix-ticket-pdf-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const cleanup = () => {
    try {
      URL.revokeObjectURL(url);
      iframe.remove();
    } catch {
      /* ignore */
    }
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(cleanup, 1500);
    }
  };
  iframe.src = url;
}
