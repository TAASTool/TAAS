"use client";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = { HR: "HR", FIN: "Financieel", INKOOP: "Inkoop", ALG: "Algemeen" };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showVersionFor, setShowVersionFor] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "ALG", description: "" });
  const [versionForm, setVersionForm] = useState({ version: "v1.0", changelog: "", steps: [{ order: 1, title: "", instruction: "", expectedResult: "" }] });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/platform/templates");
    const data = await res.json();
    setTemplates(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/platform/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowNew(false); setForm({ name: "", category: "ALG", description: "" }); load(); }
    setSaving(false);
  }

  async function createVersion(templateId: string, e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/platform/templates/${templateId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...versionForm, steps: versionForm.steps.filter(s => s.title && s.instruction) }),
    });
    if (res.ok) { setShowVersionFor(null); load(); }
    setSaving(false);
  }

  function addStep() {
    setVersionForm(prev => ({ ...prev, steps: [...prev.steps, { order: prev.steps.length + 1, title: "", instruction: "", expectedResult: "" }] }));
  }

  function updateStep(index: number, field: string, value: string) {
    setVersionForm(prev => ({ ...prev, steps: prev.steps.map((s, i) => i === index ? { ...s, [field]: value } : s) }));
  }

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-500 text-sm mt-1">Rhoost-beheerde testscript templates</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nieuw template
        </button>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-lg mb-4">Nieuw template</h2>
            <form onSubmit={createTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Naam *</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="HR Instroom" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categorie</label>
                <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beschrijving</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Aanmaken..." : "Aanmaken"}</button>
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVersionFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-4">
            <h2 className="font-semibold text-lg mb-4">Versie toevoegen</h2>
            <form onSubmit={(e) => createVersion(showVersionFor, e)} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Versie *</label>
                  <input className="input" value={versionForm.version} onChange={e => setVersionForm({...versionForm, version: e.target.value})} required placeholder="v1.0" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Changelog</label>
                  <input className="input" value={versionForm.changelog} onChange={e => setVersionForm({...versionForm, changelog: e.target.value})} placeholder="Wijzigingen..." />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Stappen</label>
                  <button type="button" onClick={addStep} className="text-xs text-primary-600 hover:text-primary-700">+ Stap toevoegen</button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {versionForm.steps.map((step, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 w-6">{i + 1}.</span>
                        <input className="input text-sm" placeholder="Stap titel *" value={step.title} onChange={e => updateStep(i, "title", e.target.value)} />
                      </div>
                      <textarea className="input text-sm resize-none" rows={2} placeholder="Instructie *" value={step.instruction} onChange={e => updateStep(i, "instruction", e.target.value)} />
                      <input className="input text-sm" placeholder="Verwacht resultaat" value={step.expectedResult} onChange={e => updateStep(i, "expectedResult", e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Opslaan..." : "Versie opslaan"}</button>
                <button type="button" onClick={() => setShowVersionFor(null)} className="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {templates.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 text-sm">Nog geen templates</div>
        ) : templates.map((t) => {
          const latestVersion = t.versions?.[0];
          return (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-900">{t.name}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{CATEGORY_LABELS[t.category]}</span>
                    {latestVersion && <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{latestVersion.version}</span>}
                  </div>
                  {t.description && <p className="text-sm text-slate-500 mb-1">{t.description}</p>}
                  <div className="text-xs text-slate-400">
                    {t.versions?.length ?? 0} versie{t.versions?.length !== 1 ? "s" : ""} · Aangemaakt {formatDate(t.createdAt)}
                    {latestVersion?.changelog && ` · ${latestVersion.changelog}`}
                  </div>
                </div>
                <button onClick={() => { setShowVersionFor(t.id); setVersionForm({ version: `v${((t.versions?.length ?? 0) + 1)}.0`, changelog: "", steps: [{ order: 1, title: "", instruction: "", expectedResult: "" }] }); }} className="btn-secondary text-sm ml-4">
                  + Versie toevoegen
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
