import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Webhook, Plus, Trash2, X } from "lucide-react";

interface Hook { id: string; name: string; url: string; events: string[]; active: boolean; }

const ALL_EVENTS = ['contact.new', 'quote.created', 'quote.approved', 'quote.rejected'];

export default function WebhookSettings() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(ALL_EVENTS);

  const load = async () => {
    const res = await api.getWebhooks();
    if (res.data) setHooks(res.data as Hook[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name || !url) return;
    await api.createWebhook({ name, url, events });
    setShowForm(false); setName(''); setUrl(''); setEvents(ALL_EVENTS);
    load();
  };

  const toggle = async (h: Hook) => {
    await api.updateWebhook(h.id, { active: !h.active });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    await api.deleteWebhook(id);
    load();
  };

  const toggleEvent = (ev: string) => {
    setEvents(events.includes(ev) ? events.filter(e => e !== ev) : [...events, ev]);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
            <Webhook className="w-6 h-6" /> Webhooks
          </h1>
          <p className="text-sm text-gray-400 mt-1">Send notifications to external services (n8n, WhatsApp, Telegram)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all hover-lift">
          <Plus className="w-4 h-4" /> Add Webhook
        </button>
      </div>

      <div className="grid gap-3">
        {hooks.map(h => (
          <div key={h.id} className="border border-white/10 bg-[#353535] p-5 hover:border-white/20 transition-all flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-white">{h.name}</h3>
              <p className="text-xs text-gray-500 mt-1 font-mono truncate max-w-md">{h.url}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {h.events.map(ev => (
                  <span key={ev} className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 rounded">{ev}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggle(h)} className={`px-3 py-1 text-xs font-bold uppercase rounded ${h.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                {h.active ? 'Active' : 'Off'}
              </button>
              <button onClick={() => remove(h.id)} className="p-2 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4 text-gray-400" /></button>
            </div>
          </div>
        ))}
        {hooks.length === 0 && <p className="text-gray-500 text-center py-12">No webhooks configured.</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="bg-[#2a2a2a] border border-white/10 w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold uppercase">New Webhook</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>
            <div className="space-y-4">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (e.g. n8n WhatsApp)" className="w-full px-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none" />
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (e.g. https://n8n.example.com/webhook/...)" className="w-full px-4 py-3 bg-[#353535] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Events</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_EVENTS.map(ev => (
                    <button key={ev} onClick={() => toggleEvent(ev)} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${events.includes(ev) ? 'bg-white/10 text-white' : 'bg-transparent text-gray-500 border border-white/10'}`}>
                      {ev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-400">Cancel</button>
              <button onClick={save} className="px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
