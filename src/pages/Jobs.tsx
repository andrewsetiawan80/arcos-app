import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { fmtIdr } from "../lib/jobPricing";

type JobRow = {
  id: string;
  title: string;
  client_name?: string | null;
  client_company?: string | null;
  status: string;
  sell_total?: number;
  item_count?: number;
  quote_id?: string | null;
  updated_at?: string;
  created_at?: string;
};

const STATUS: Record<string, string> = {
  draft: "border-white/20 text-gray-300 bg-white/5",
  quoted: "border-white/40 text-white bg-white/10",
  won: "border-white bg-white text-[#232323]",
  lost: "border-red-400/40 text-red-300 bg-red-500/10",
};

export default function Jobs() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const res = await api.getJobs();
    if (res.data) setJobs(res.data as JobRow[]);
    else if (res.error) toast(res.error, "error");
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this job? Priced lines will be removed (linked quote is kept).")) return;
    const res = await api.deleteJob(id);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    toast("Job deleted", "success");
    void load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
            <Briefcase className="w-6 h-6" /> Jobs
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Client projects with calculated prices (cost + margin). Not catalog products. Generate a quote when ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/app/jobs/labour-presets"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-sm font-bold uppercase tracking-wider hover:bg-white/5"
          >
            Labour presets
          </Link>
          <Link
            to="/app/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" /> New job
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading jobs..." />
      ) : (
        <div className="grid gap-3">
          {jobs.map((j) => (
            <div key={j.id} className="border border-white/10 bg-[#353535] p-5 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/app/jobs/${j.id}`} className="font-bold text-white hover:underline text-base">
                    {j.title}
                  </Link>
                  {(j.client_name || j.client_company) && (
                    <p className="text-sm text-gray-400 mt-1">
                      {j.client_name}
                      {j.client_company ? ` — ${j.client_company}` : ""}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${STATUS[j.status] || STATUS.draft}`}
                    >
                      {j.status}
                    </span>
                    <span className="text-sm text-gray-300 tabular-nums font-medium">
                      {fmtIdr(Number(j.sell_total) || 0)}
                    </span>
                    <span className="text-xs text-gray-500">{j.item_count || 0} items</span>
                    {j.quote_id ? (
                      <Link to={`/app/quotes/${j.quote_id}`} className="text-xs text-gray-400 hover:text-white underline">
                        Open quote
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    to={`/app/jobs/${j.id}`}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-gray-100"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => void remove(j.id)}
                    aria-label="Delete job"
                    className="p-2 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-16 border border-dashed border-white/10">
              <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm mb-4">No jobs yet. Start from a client visit or project.</p>
              <Link
                to="/app/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" /> New job
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
