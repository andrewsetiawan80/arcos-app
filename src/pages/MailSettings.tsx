import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Mail, Save } from "lucide-react";

export default function MailSettings() {
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    const res = await api.getMailSettings();
    if (res.data) {
      const d = res.data as any;
      setSmtpHost(d.smtpHost || "");
      setSmtpPort(String(d.smtpPort ?? 587));
      setSmtpUser(d.smtpUser || "");
      setSmtpPass(d.smtpPass || "");
      setContactEmail(d.contactEmail || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const res = await api.saveMailSettings({
      smtpHost: smtpHost.trim() || undefined,
      smtpPort: parseInt(smtpPort, 10) || 587,
      smtpUser: smtpUser.trim() || undefined,
      smtpPass: smtpPass && smtpPass !== "••••••••" ? smtpPass : undefined,
      contactEmail: contactEmail.trim() || undefined,
    });
    setSaving(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Mail settings saved." });
      setSmtpPass(""); // Clear password field after save
      load(); // Reload to get masked password
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400 text-sm">Loading mail settings...</div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
            <Mail className="w-6 h-6" /> Mail Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            SMTP configuration for contact form emails. Leave password blank to keep existing.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all hover-lift disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white">SMTP Host</label>
          <input
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white">SMTP Port</label>
          <input
            type="number"
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
            placeholder="587"
            className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-white">SMTP User</label>
          <input
            type="email"
            value={smtpUser}
            onChange={(e) => setSmtpUser(e.target.value)}
            placeholder="your-email@gmail.com"
            className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-white">SMTP Password</label>
          <input
            type="password"
            value={smtpPass}
            onChange={(e) => setSmtpPass(e.target.value)}
            placeholder="Leave blank to keep existing"
            className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
          />
          <p className="text-xs text-gray-500">Use an app password for Gmail (not your regular password).</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-white">Contact Form Recipient</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="info@arcosworks.com"
            className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
          />
          <p className="text-xs text-gray-500">Email address where contact form submissions are sent.</p>
        </div>
      </div>
    </div>
  );
}
