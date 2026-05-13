"use client";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/platform/tenants");
    const data = await res.json();
    setTenants(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/platform/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowNew(false);
      setForm({ name: "", slug: "" });
      load();
    } else {
      const data = await res.json();
      setError(data.error?.fieldErrors?.slug?.[0] || "Er is een fout opgetreden");
    }
    setSaving(false);
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Klanten</h1>
          <p className="text-slate-500 text-sm mt-1">{tenants.length} klant{tenants.length !== 1 ? "en" : ""}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Klant toevoegen
        </button>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-lg mb-4">Klant toevoegen</h2>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Naam *</label>
                <input className="input" value={form.name} onChange={e => { setForm({...form, name: e.target.value, slug: autoSlug(e.target.value)}); }} required placeholder="Gemeente Amsterdam" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL-identifier) *</label>
                <input className="input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required placeholder="gemeente-amsterdam" pattern="[a-z0-9-]+" />
                <p className="text-xs text-slate-400 mt-1">Alleen kleine letters, cijfers en koppeltekens</p>
              </div>
              {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Toevoegen..." : "Toevoegen"}</button>
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="divide-y divide-slate-100">
          {tenants.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">Nog geen klanten</div>
          ) : tenants.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-400">/{t.slug} · Aangemaakt {formatDate(t.createdAt)}</div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{t._count?.users ?? 0} gebruikers</span>
                <span>{t._count?.projects ?? 0} projecten</span>
                <span className={`badge ${t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {t.isActive ? "Actief" : "Inactief"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
