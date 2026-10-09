import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FileText, Plus, Trash2, ExternalLink, Copy, Check, Pencil } from "lucide-react";
import { QuotePDFDownloadButton } from "../components/QuotePDF";
import { useToast } from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";

interface Quote {
  id: string;
  title: string;
  client_name: string | null;
  client_company: string | null;
  status: string;
  total: number;
  share_token: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "border-white/20 text-gray-300 bg-white/5",
  sent: "border-white/40 text-white bg-white/10",
  approved: "border-white bg-white text-[#232323]",
  rejected: "border-red-400/40 text-red-300 bg-red-500/10",
};

export default function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const res = await api.getQuotes();
    if (res.data) setQuotes(res.data as Quote[]);
    else if (res.error) toast(res.error, "error");
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this quote?")) return;
    const res = await api.deleteQuote(id);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    toast("Quote deleted", "success");
    load();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/quote/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
            <FileText className="w-6 h-6" /> Quotes
          </h1>
          <p className="text-sm text-gray-400 mt-1">{quotes.length} total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/app/quotes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-sm font-bold uppercase tracking-wider hover:bg-white/5"
          >
            <Plus className="w-4 h-4" /> Blank quote
          </Link>
          <Link
            to="/app/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all hover-lift"
          >
            <Plus className="w-4 h-4" /> Price a job
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading quotes..." />
      ) : (
        <div className="grid gap-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/app/quotes/${q.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/app/quotes/${q.id}`);
                }
              }}
              className="border border-white/10 bg-[#353535] p-5 hover:border-white/20 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-white text-base">{q.title || "Untitled"}</p>
                  {q.client_name && (
                    <p className="text-sm text-gray-400 mt-1">
                      {q.client_name}
                      {q.client_company ? ` — ${q.client_company}` : ""}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[q.status] || STATUS_COLORS.draft}`}
                    >
                      {q.status}
                    </span>
                    <span className="text-sm text-gray-300 tabular-nums font-medium">{fmtCurrency(q.total)}</span>
                    <span className="text-xs text-gray-500">{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div
                  className="flex flex-wrap gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Link
                    to={`/app/quotes/${q.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-gray-100"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <QuotePDFDownloadButton quoteId={q.id} className="!px-3 !py-2" />
                  <button
                    type="button"
                    onClick={() => copyLink(q.share_token)}
                    aria-label="Copy share link"
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                  >
                    {copied === q.share_token ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <Link
                    to={`/quote/${q.share_token}`}
                    target="_blank"
                    aria-label="Open public view"
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(q.id)}
                    aria-label="Delete quote"
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {quotes.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No quotes yet. Create your first one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
