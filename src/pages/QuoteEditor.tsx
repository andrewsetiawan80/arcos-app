import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Plus, Trash2, Save, ArrowLeft, UserPlus, X } from "lucide-react";
import { QuotePDFDownloadButton } from "../components/QuotePDF";
import QuoteDocPreview, { QUOTE_A4 } from "../components/QuoteDocPreview";
import {
  DEFAULT_PPN_PCT,
  DEFAULT_QUOTE_TERMS,
  fmtIdr,
  quoteGrandTotal,
  type QuoteDocData,
} from "../components/quoteDoc";

interface Item {
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
}

const field =
  "w-full px-3 py-2.5 bg-[#2a2a2a] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none";

function toNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function QuoteEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const isNew = !id || id === "new";

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(DEFAULT_QUOTE_TERMS);
  const [ppnPct, setPpnPct] = useState(DEFAULT_PPN_PCT);
  const [status, setStatus] = useState("draft");
  const [items, setItems] = useState<Item[]>([{ description: "", qty: 1, unit: "pcs", unit_price: 0 }]);
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [createdAt, setCreatedAt] = useState<string | undefined>();
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [clientBusy, setClientBusy] = useState(false);
  const [clientMsg, setClientMsg] = useState("");
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editClient, setEditClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const loadClients = async () => {
    const r = await api.getClients();
    if (r.data) setClients(r.data as any[]);
  };

  useEffect(() => {
    void loadClients();
  }, []);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    api.getQuote(id!).then((r) => {
      if (cancelled) return;
      if (r.error || !r.data) {
        setLoadError(r.error || "Could not load quote");
        setLoading(false);
        return;
      }
      const q = r.data as any;
      setTitle(q.title || "");
      setClientId(q.client_id || "");
      setNotes(q.notes || "");
      setTerms(q.terms != null && String(q.terms).trim() ? q.terms : DEFAULT_QUOTE_TERMS);
      setPpnPct(q.ppn_pct == null ? DEFAULT_PPN_PCT : toNum(q.ppn_pct, DEFAULT_PPN_PCT));
      setStatus(q.status || "draft");
      setCreatedAt(q.created_at);
      if (Array.isArray(q.items) && q.items.length) {
        setItems(
          q.items.map((i: any) => ({
            description: i.description || "",
            qty: toNum(i.qty, 1),
            unit: i.unit || "pcs",
            unit_price: toNum(i.unit_price),
          })),
        );
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const a4Px = (QUOTE_A4.widthMm / 25.4) * 96;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width || el.clientWidth;
      setPreviewScale(Math.min(1, w / a4Px));
    });
    ro.observe(el);
    setPreviewScale(Math.min(1, el.clientWidth / a4Px));
    return () => ro.disconnect();
  }, [loading]);

  const selectedClient = clients.find((c) => String(c.id) === String(clientId));
  const grand = quoteGrandTotal(items, ppnPct);

  useEffect(() => {
    if (!selectedClient) {
      setEditClientOpen(false);
      return;
    }
    setEditClient({
      name: selectedClient.name || "",
      company: selectedClient.company || "",
      email: selectedClient.email || "",
      phone: selectedClient.phone || "",
      address: selectedClient.address || "",
      notes: selectedClient.notes || "",
    });
  }, [selectedClient?.id]);

  const previewData: QuoteDocData = useMemo(
    () => ({
      id: isNew ? undefined : id,
      title: title || "Untitled quote",
      client_name: selectedClient?.name ?? null,
      client_company: selectedClient?.company ?? null,
      client_email: selectedClient?.email ?? null,
      client_phone: selectedClient?.phone ?? null,
      client_address: selectedClient?.address ?? null,
      items,
      total: grand,
      notes: notes || null,
      terms: terms || null,
      ppn_pct: ppnPct,
      created_at: createdAt || new Date().toISOString(),
      status,
    }),
    [isNew, id, title, selectedClient, items, grand, notes, terms, ppnPct, createdAt, status],
  );

  const addItem = () => setItems([...items, { description: "", qty: 1, unit: "pcs", unit_price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, fieldKey: keyof Item, val: any) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [fieldKey]: val };
    setItems(copy);
  };

  const createClient = async () => {
    if (!newClient.name.trim()) {
      setClientMsg("Name is required");
      return;
    }
    setClientBusy(true);
    setClientMsg("");
    const r = await api.createClient({
      name: newClient.name.trim(),
      company: newClient.company.trim() || null,
      email: newClient.email.trim() || null,
      phone: newClient.phone.trim() || null,
      address: newClient.address.trim() || null,
      notes: newClient.notes.trim() || null,
    });
    setClientBusy(false);
    if (r.error || !r.data) {
      setClientMsg(r.error || "Could not create client");
      return;
    }
    const c = r.data as any;
    await loadClients();
    setClientId(String(c.id));
    setShowNewClient(false);
    setNewClient({ name: "", company: "", email: "", phone: "", address: "", notes: "" });
    setClientMsg("Client added");
    setTimeout(() => setClientMsg(""), 2500);
  };

  const saveClientDetails = async () => {
    if (!clientId || !editClient.name.trim()) {
      setClientMsg("Name is required");
      return;
    }
    setClientBusy(true);
    setClientMsg("");
    const r = await api.updateClient(clientId, {
      name: editClient.name.trim(),
      company: editClient.company.trim() || null,
      email: editClient.email.trim() || null,
      phone: editClient.phone.trim() || null,
      address: editClient.address.trim() || null,
      notes: editClient.notes.trim() || null,
    });
    setClientBusy(false);
    if (r.error) {
      setClientMsg(r.error);
      return;
    }
    await loadClients();
    setEditClientOpen(false);
    setClientMsg("Client updated");
    setTimeout(() => setClientMsg(""), 2500);
  };

  const save = async () => {
    if (!title.trim()) {
      setSaveMsg("Title is required");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    const payload = {
      title: title.trim(),
      client_id: clientId || null,
      notes,
      terms,
      ppn_pct: ppnPct,
      status,
      items,
    };
    if (isNew) {
      const r = await api.createQuote(payload);
      setSaving(false);
      if (r.error || !r.data) {
        setSaveMsg(r.error || "Save failed");
        return;
      }
      nav(`/app/quotes/${(r.data as any).id}`, { replace: true });
      return;
    }
    const r = await api.updateQuote(id!, payload);
    setSaving(false);
    if (r.error) {
      setSaveMsg(r.error);
      return;
    }
    setSaveMsg("Saved");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  if (loading) {
    return <p className="text-sm text-gray-400 py-12">Loading quote…</p>;
  }

  if (loadError) {
    return (
      <div className="space-y-4 py-8">
        <p className="text-sm text-red-300">{loadError}</p>
        <Link to="/app/quotes" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white">
          ← Back to quotes
        </Link>
      </div>
    );
  }

  const a4Px = (QUOTE_A4.widthMm / 25.4) * 96;
  const a4HPx = (QUOTE_A4.heightMm / 25.4) * 96;

  return (
    <div className="w-full min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-2 min-w-0">
          <Link
            to="/app/quotes"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quotes
          </Link>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider leading-tight">
            {isNew ? "New quote" : "Edit quote"}
          </h1>
          <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
            Edit lines, PPN, and terms. A4 preview matches the PDF download.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {saveMsg ? <span className="text-xs text-gray-400 mr-1">{saveMsg}</span> : null}
          <QuotePDFDownloadButton quote={previewData} />
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !title.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-100 disabled:opacity-50 min-h-11"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      <div className="grid xl:grid-cols-2 gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <section className="border border-white/10 bg-[#353535] p-4 sm:p-5 space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Details</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quote title *  e.g. Meja bulat Ø100 — Pak Teja"
              className={field}
            />

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 block">Client</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={`${field} flex-1 min-w-0`}
                >
                  <option value="">No client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` (${c.company})` : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewClient((v) => !v);
                    setClientMsg("");
                  }}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0 min-h-[42px] ${
                    showNewClient
                      ? "border border-white/20 text-gray-300 hover:bg-white/5"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {showNewClient ? (
                    <>
                      <X className="w-4 h-4" /> Cancel
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> New client
                    </>
                  )}
                </button>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
                  {["draft", "sent", "approved", "rejected"].map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {showNewClient && (
                <div className="border border-white/15 bg-[#2a2a2a] p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Create &amp; assign client</p>
                  <input
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Name *"
                    className={field}
                    autoFocus
                  />
                  <input
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    placeholder="Company"
                    className={field}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="Email"
                      className={field}
                    />
                    <input
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="Phone"
                      className={field}
                    />
                  </div>
                  <textarea
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    placeholder="Address (street, city, postcode…)"
                    rows={3}
                    className={`${field} resize-none`}
                  />
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    placeholder="Internal notes (optional)"
                    rows={2}
                    className={`${field} resize-none`}
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={clientBusy || !newClient.name.trim()}
                      onClick={() => void createClient()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {clientBusy ? "Saving…" : "Add client"}
                    </button>
                    {clientMsg ? <span className="text-xs text-gray-400">{clientMsg}</span> : null}
                  </div>
                </div>
              )}

              {clientId && selectedClient && !showNewClient && (
                <div className="border border-white/10 bg-[#2a2a2a] p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 text-sm text-gray-300 space-y-0.5">
                      <p className="font-semibold text-white truncate">{selectedClient.name}</p>
                      {selectedClient.company ? <p className="text-xs text-gray-400">{selectedClient.company}</p> : null}
                      {(selectedClient.phone || selectedClient.email) && (
                        <p className="text-xs text-gray-500">
                          {[selectedClient.phone, selectedClient.email].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {selectedClient.address ? (
                        <p className="text-xs text-gray-500 whitespace-pre-wrap">{selectedClient.address}</p>
                      ) : (
                        <p className="text-xs text-amber-300/80">No address on file</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditClientOpen((v) => !v)}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white shrink-0"
                    >
                      {editClientOpen ? "Close" : "Edit details"}
                    </button>
                  </div>
                  {editClientOpen && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <input
                        value={editClient.name}
                        onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                        placeholder="Name *"
                        className={field}
                      />
                      <input
                        value={editClient.company}
                        onChange={(e) => setEditClient({ ...editClient, company: e.target.value })}
                        placeholder="Company"
                        className={field}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editClient.email}
                          onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                          placeholder="Email"
                          className={field}
                        />
                        <input
                          value={editClient.phone}
                          onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                          placeholder="Phone"
                          className={field}
                        />
                      </div>
                      <textarea
                        value={editClient.address}
                        onChange={(e) => setEditClient({ ...editClient, address: e.target.value })}
                        placeholder="Address (street, city, postcode…)"
                        rows={3}
                        className={`${field} resize-none`}
                      />
                      <textarea
                        value={editClient.notes}
                        onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })}
                        placeholder="Internal notes (optional)"
                        rows={2}
                        className={`${field} resize-none`}
                      />
                      <button
                        type="button"
                        disabled={clientBusy || !editClient.name.trim()}
                        onClick={() => void saveClientDetails()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                      >
                        {clientBusy ? "Saving…" : "Save client"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!showNewClient && clientMsg ? <p className="text-xs text-gray-400">{clientMsg}</p> : null}
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">PPN %</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={ppnPct}
                onChange={(e) => setPpnPct(toNum(e.target.value, 0))}
                className={`${field} max-w-[140px] tabular-nums`}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Project-specific notes (scope, finish, delivery…)"
                rows={3}
                className={`${field} resize-none`}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                Terms &amp; conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={7}
                className={`${field} resize-none text-xs leading-relaxed`}
              />
            </div>
          </section>

          <section className="border border-white/10 bg-[#353535] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Line items</h2>
              <span className="text-sm font-bold tabular-nums text-white">{fmtIdr(grand)}</span>
            </div>

            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="border border-white/10 bg-[#2a2a2a] p-3 space-y-2">
                  <input
                    value={it.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="Description — e.g. UHPC round table Ø100 cm"
                    className={field}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Qty</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={it.qty}
                        onChange={(e) => updateItem(i, "qty", toNum(e.target.value))}
                        className={`${field} text-right tabular-nums`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Unit</label>
                      <input
                        value={it.unit}
                        onChange={(e) => updateItem(i, "unit", e.target.value)}
                        className={`${field} text-center`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Price</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={it.unit_price}
                        onChange={(e) => updateItem(i, "unit_price", toNum(e.target.value))}
                        className={`${field} text-right tabular-nums`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-500 tabular-nums">{fmtIdr(it.qty * it.unit_price)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white min-h-10"
            >
              <Plus className="w-4 h-4" /> Add item
            </button>
          </section>
        </div>

        <div className="min-w-0 xl:sticky xl:top-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Client preview · A4</p>
            <span className="text-[10px] text-gray-600 tabular-nums">
              {QUOTE_A4.widthMm}×{QUOTE_A4.heightMm} mm
            </span>
          </div>
          <div ref={previewWrapRef} className="bg-[#1a1a1a] p-3 sm:p-4 border border-white/10 overflow-x-auto">
            <div
              style={{
                width: a4Px * previewScale,
                height: a4HPx * previewScale,
                position: "relative",
              }}
            >
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  width: a4Px,
                }}
              >
                <QuoteDocPreview data={previewData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
