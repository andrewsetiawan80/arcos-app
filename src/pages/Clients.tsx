import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Users, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { useToast } from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

const empty: Omit<Client, 'id' | 'created_at'> = { name: '', company: null, email: null, phone: null, address: null, notes: null };

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const load = async () => {
    const res = await api.getClients();
    if (res.data) setClients(res.data as Client[]);
    else if (res.error) toast(res.error, "error");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ name: c.name, company: c.company, email: c.email, phone: c.phone, address: c.address, notes: c.notes }); setShowForm(true); };
  const close = () => { setShowForm(false); setEditing(null); };

  const save = async () => {
    if (!form.name.trim()) return;
    const res = editing
      ? await api.updateClient(editing.id, form)
      : await api.createClient(form);
    if (res.error) { toast(res.error, "error"); return; }
    toast(editing ? "Client updated" : "Client created", "success");
    close();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    const res = await api.deleteClient(id);
    if (res.error) { toast(res.error, "error"); return; }
    toast("Client deleted", "success");
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
            <Users className="w-6 h-6" /> Clients
          </h1>
          <p className="text-sm text-gray-400 mt-1">{clients.length} total</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all hover-lift">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-11 pr-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none"
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading clients..." />
      ) : (
        <div className="grid gap-3">
          {filtered.map(c => (
            <div key={c.id} className="border border-white/10 bg-[#353535] p-5 hover:border-white/20 transition-all flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-bold text-white truncate">{c.name}</h3>
                {c.company && <p className="text-sm text-gray-400">{c.company}</p>}
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                  {c.email && <span>{c.email}</span>}
                  {c.phone && <span>{c.phone}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(c)} aria-label="Edit client" className="p-2 hover:bg-white/10 rounded transition-colors"><Pencil className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => remove(c.id)} aria-label="Delete client" className="p-2 hover:bg-red-500/20 rounded transition-colors"><Trash2 className="w-4 h-4 text-gray-400" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                {search ? "No clients match your search." : "No clients yet. Add your first one."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={close}>
          <div className="bg-[#2a2a2a] border border-white/10 w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold uppercase">{editing ? 'Edit Client' : 'New Client'}</h2>
              <button onClick={close}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>
            <div className="space-y-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name *" className="w-full px-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none" />
              <input value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company" className="w-full px-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none" />
              <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none" />
              <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none" />
              <input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none" />
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={3} className="w-full px-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none resize-none" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={close} className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={save} className="px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
