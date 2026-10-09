import React from "react";
import { fmt, rp, type TicketRow } from "./core";

export type BatchTicketCostLine = {
  name: string;
  grams: number;
  cost: number;
  priced: boolean;
};

export type BatchTicketCost = {
  priced: boolean;
  batch: number;
  perKgDry: number;
  perKgWet: number;
  lines: BatchTicketCostLine[];
};

export type BatchTicketProps = {
  name: string;
  meta: string;
  scaleLabel: string;
  rows: TicketRow[];
  batches: number;
  effectiveWB: number;
  gaugingBit?: string;
  portlandShareLabel: string;
  pozzolanShareLabel: string;
  waterGross: number;
  /** Water to weigh into the bucket (after polymer water). */
  waterToAdd?: number;
  waterFromAcrylic: number;
  isRdp: boolean;
  cost?: BatchTicketCost | null;
  recipeId?: string | null;
  dryWeight?: number;
  showScreenNotes?: boolean;
  densityWetKgM3?: number;
  densityCuredKgM3?: number;
};

function weighAmount(grams: number): { primary: string; unit: string } {
  const n = Number(grams) || 0;
  if (n >= 1000) {
    return { primary: fmt(n / 1000, 2), unit: "kg" };
  }
  return { primary: fmt(n, n >= 100 ? 0 : 1), unit: "g" };
}

/**
 * Screen preview of the batch ticket.
 * Download uses Staff-style A4 PDF (see ticketPdf.ts / Download ticket).
 */
export default function BatchTicket({
  name,
  scaleLabel,
  rows,
  batches,
  effectiveWB,
  gaugingBit = "",
  waterGross,
  waterToAdd,
  waterFromAcrylic,
  isRdp,
  cost,
  showScreenNotes = true,
  densityWetKgM3,
  densityCuredKgM3,
}: BatchTicketProps) {
  const addWater = waterToAdd != null ? waterToAdd : Math.max(0, waterGross - (isRdp ? 0 : waterFromAcrylic));
  const waterAmt = weighAmount(addWater * batches);

  return (
    <section className="card ticket mix-batch-ticket">
      <h2 className="screen-only">Batch ticket</h2>
      <div className="ticket-meta">
        <span>{name || "Untitled mix"}</span>
        <span>{scaleLabel}</span>
      </div>
      <table className="screen-only">
        <thead>
          <tr>
            <th>Material</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if (row[0] === "group") {
              return (
                <tr className="group" key={`g-${i}`}>
                  <td colSpan={2}>{row[1]}</td>
                </tr>
              );
            }
            if (row[0] === "total") {
              const a = weighAmount(Number(row[2]) * batches);
              return (
                <tr className="total" key={`t-${i}`}>
                  <td>{row[1]}</td>
                  <td>
                    <span className="amt-primary">{a.primary}</span>
                    <span className="amt-unit">{a.unit}</span>
                  </td>
                </tr>
              );
            }
            const a = weighAmount(Number(row[1]) * batches);
            return (
              <tr key={`r-${i}`}>
                <td>{row[0]}</td>
                <td>
                  <span className="amt-primary">{a.primary}</span>
                  <span className="amt-unit">{a.unit}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="water-callout screen-only">
        Add water: <b>{waterAmt.primary} {waterAmt.unit}</b>
        {" · "}
        w/b {(effectiveWB * 100).toFixed(1)}%{gaugingBit}
      </div>
      {(densityWetKgM3 != null && densityWetKgM3 > 0) || (densityCuredKgM3 != null && densityCuredKgM3 > 0) ? (
        <div className="water-callout screen-only" style={{ marginTop: 8 }}>
          Density · wet{" "}
          <b>{densityWetKgM3 && densityWetKgM3 > 0 ? `${Math.round(densityWetKgM3)} kg/m³` : "—"}</b>
          {" · "}
          cured{" "}
          <b>{densityCuredKgM3 && densityCuredKgM3 > 0 ? `${Math.round(densityCuredKgM3)} kg/m³` : "—"}</b>
        </div>
      ) : null}
      {cost && (
        <div className="cost-box screen-only">
          {!cost.priced ? (
            <>
              <h3>Material cost</h3>
              <p className="cost-miss">No prices yet. Set them on the Material prices page.</p>
            </>
          ) : (
            <>
              <h3>Material cost</h3>
              <div className="cost-grid">
                <div className="kv">
                  <span>{batches > 1 ? `This run (${batches} batches)` : "This batch"}</span>
                  <b>{rp(cost.batch * batches)}</b>
                </div>
                {batches > 1 && (
                  <div className="kv">
                    <span>Per batch</span>
                    <b>{rp(cost.batch)}</b>
                  </div>
                )}
                <div className="kv">
                  <span>Per kg dry</span>
                  <b>{rp(cost.perKgDry)}</b>
                </div>
                <div className="kv">
                  <span>Per kg wet</span>
                  <b>{rp(cost.perKgWet)}</b>
                </div>
              </div>
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {cost.lines.map((row) => {
                    const grams = row.grams * batches;
                    const gramLabel =
                      grams >= 1000 ? `${fmt(grams / 1000, 2)} kg` : `${fmt(grams, 1)} g`;
                    return (
                      <tr key={row.name} className={!row.priced ? "miss" : undefined}>
                        <td>
                          {row.name} <small>{gramLabel}</small>
                        </td>
                        <td>{row.priced ? rp(row.cost * batches) : "no price"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
      {showScreenNotes && (
        <p className="notes screen-only">
          Use <b>Print / download</b> for the Staff A4 ticket (print or PDF; optional cost page).
        </p>
      )}
    </section>
  );
}
