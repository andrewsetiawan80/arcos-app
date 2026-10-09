import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import QuoteDocPreview, { QUOTE_A4 } from "../components/QuoteDocPreview";
import type { QuoteDocData } from "../components/quoteDoc";
import { QUOTE_BRAND } from "../components/quoteDoc";

export default function PublicQuoteView() {
  const { token } = useParams();
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.getSharedQuote(token).then((r) => {
      if (r.error) setError("Quote not found or link has expired.");
      else setQuote(r.data);
    });
  }, [token]);

  const respond = async (action: "approved" | "rejected") => {
    if (!token) return;
    setResponding(true);
    const r = await api.respondToQuote(token, action);
    if (r.data) {
      setQuote({ ...quote, status: action });
      setResponded(true);
    }
    setResponding(false);
  };

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: QUOTE_BRAND.paper, fontFamily: '"DM Sans", system-ui, sans-serif' }}
      >
        <p className="text-[#6F6F6F] text-sm">{error}</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: QUOTE_BRAND.paper, fontFamily: '"DM Sans", system-ui, sans-serif' }}
      >
        <p className="text-[#6F6F6F] text-sm">Loading…</p>
      </div>
    );
  }

  const doc: QuoteDocData = {
    id: quote.id,
    title: quote.title,
    client_name: quote.client_name,
    client_company: quote.client_company,
    client_email: quote.client_email,
    client_phone: quote.client_phone,
    client_address: quote.client_address,
    items: quote.items || [],
    total: Number(quote.total) || 0,
    notes: quote.notes,
    terms: quote.terms,
    ppn_pct: quote.ppn_pct,
    created_at: quote.created_at,
    status: quote.status,
  };

  return (
    <div
      className="min-h-screen py-10 sm:py-16 px-4 sm:px-6"
      style={{ background: QUOTE_BRAND.paper, fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <div className="mx-auto space-y-6 overflow-x-auto" style={{ maxWidth: `${QUOTE_A4.widthMm}mm` }}>
        <QuoteDocPreview data={doc} />

        <div className="space-y-3">
          {quote.status === "sent" && !responded && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => respond("approved")}
                disabled={responding}
                className="flex-1 px-6 py-4 bg-[#232323] text-white text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#353535] transition-colors disabled:opacity-50"
              >
                Approve quote
              </button>
              <button
                type="button"
                onClick={() => respond("rejected")}
                disabled={responding}
                className="flex-1 px-6 py-4 border-2 border-[#232323] text-[#232323] text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#232323] hover:text-white transition-colors disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}
          {(quote.status === "approved" || (responded && quote.status === "approved")) && (
            <div className="px-5 py-4 border border-[#232323]/20 bg-white text-sm text-[#232323]">
              This quote has been approved. Thank you.
            </div>
          )}
          {(quote.status === "rejected" || (responded && quote.status === "rejected")) && (
            <div className="px-5 py-4 border border-[#232323]/20 bg-white text-sm text-[#6F6F6F]">
              This quote has been declined.
            </div>
          )}
          {quote.status === "draft" && (
            <div className="px-5 py-4 border border-[#232323]/10 bg-white text-sm text-[#6F6F6F]">
              This quote is still being prepared.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
