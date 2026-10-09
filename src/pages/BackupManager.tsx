import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Database, Plus, RotateCcw, Trash2 } from "lucide-react";

interface Backup { name: string; size: number; created: string; }

export default function BackupManager() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const load = async () => {
    const res = await api.getBackups();
    if (res.data) setBackups(res.data as Backup[]);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setCreating(true);
    await api.createBackup();
    await load();
    setCreating(false);
  };

  const restore = async (name: string) => {
    if (!confirm(`Restore database from ${name}? This will overwrite current data.`)) return;
    setRestoring(name);
    await api.restoreBackup(name);
    setRestoring(null);
    alert('Database restored successfully.');
  };

  const remove = async (name: string) => {
    if (!confirm(`Delete backup ${name}?`)) return;
    await api.deleteBackup(name);
    load();
  };

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
            <Database className="w-6 h-6" /> Backup Manager
          </h1>
          <p className="text-sm text-gray-400 mt-1">{backups.length} backups</p>
        </div>
        <button onClick={create} disabled={creating} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all disabled:opacity-50">
          <Plus className="w-4 h-4" /> {creating ? 'Creating...' : 'Create Backup'}
        </button>
      </div>

      <div className="grid gap-3">
        {backups.map(b => (
          <div key={b.name} className="border border-white/10 bg-[#353535] p-5 hover:border-white/20 transition-all flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm">{b.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{fmtSize(b.size)} &middot; {new Date(b.created).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => restore(b.name)} disabled={restoring === b.name} className="p-2 hover:bg-blue-500/20 rounded transition-colors" title="Restore">
                <RotateCcw className={`w-4 h-4 text-gray-400 ${restoring === b.name ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => remove(b.name)} className="p-2 hover:bg-red-500/20 rounded transition-colors" title="Delete">
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
        {backups.length === 0 && <p className="text-gray-500 text-center py-12">No backups yet. Create one to get started.</p>}
      </div>
    </div>
  );
}
