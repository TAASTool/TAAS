"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { STATUS_COLORS, PHASE_DESCRIPTIONS, formatDate } from "@/lib/utils";

export default function PhasePage() {
  const { id, phaseId } = useParams<{ id: string; phaseId: string }>();
  const [phase, setPhase] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewFlow, setShowNewFlow] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [importForm, setImportForm] = useState({ name: "", templateVersionId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
    fetch("/api/platform/templates")
      .then(r => r.json())
      .then(d => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [phaseId]);

  async function load() {
    const res = await fetch(`/api/phases/${phaseId}`);
    const data = await res.json();
    setPhase(data);
    setLoading(false);
  }

  async function createFlow(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/phases/${phaseId}/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowNewFlow(false); setForm({ name: "", description: "" }); load(); }
    setSaving(false);
  }

  async function importTemplate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/phases/${phaseId}/flows/import-template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(importForm),
    });
    if (res.ok) { setShowImport(false); setImportForm({ name: "", templateVersionId: "" }); load(); }
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;
  if (!phase || phase.error) return <div className="p-8 text-slate-500">Fase niet gevonden</div>;

  const allTemplateVersions = templates.flatMap((t: any) =>
    (t.versions || []).map((v: any) => ({ ...v, templateName: t.name, category: t.category }))
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/projects" className="hover:text-slate-600">Projecten</Link>
        <span>/</span>
        <Link href={`/projects/${id}`} className="hover:text-slate-600">{phase.project.name}</Link>
        <span>/</span>
        <span className="text-slate-700">{phase.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{phase.name}</h1>
            <span className={`badge ${STATUS_COLORS[phase.status]}`}>{phase.status}</span>
          </div>
          <p className="text-slate-500 text-sm">{PHASE_DESCRIPTIONS[phase.name]}</p>
        </div>
        <div className="flex gap-2">
          {allTemplateVersions.length > 0 && (
            <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2 text-sm">
              Template importeren
            </button>
          )}
          <button onClick={() => setShowNewFlow(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nieuwe flow
          </button>
        </div>
      </div>

      {/* New Flow Modal */}
      {showNewFlow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-lg mb-4">Nieuwe flow aanmaken</h2>
            <form onSubmit={createFlow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Naam *</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="HR Instroom" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beschrijving</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Aanmaken..." : "Aanmaken"}</button>
                <button type="button" onClick={() => setShowNewFlow(false)} className="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Template Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-lg mb-4">Template importeren als flow</h2>
            <form onSubmit={importTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Flow naam *</label>
                <input className="input" value={importForm.name} onChange={e => setImportForm({...importForm, name: e.target.value})} required placeholder="HR Instroom FAT" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Template versie *</label>
                <select className="input" value={importForm.templateVersionId} onChange={e => setImportForm({...importForm, templateVersionId: e.target.value})} required>
                  <option value="">Selecteer template...</option>
                  {allTemplateVersions.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.templateName} — {v.version} ({v.category})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Importeren..." : "Importeren"}</button>
                <button type="button" onClick={() => setShowImport(false)} className="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flows */}
      <div className="grid gap-4">
        {phase.flows.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-slate-400 text-sm">Nog geen flows in deze fase.</div>
          </div>
        ) : phase.flows.map((flow: any) => {
          const latestVersion = flow.versions?.[0];
          return (
            <div key={flow.id} className="card">
              <div className="flex items-center justify-between p-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-900">{flow.name}</h3>
                    {latestVersion && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{latestVersion.version}</span>}
                    {flow.sourceTemplateVersionId && (
                      <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">Van template</span>
                    )}
                  </div>
                  {flow.description && <p className="text-sm text-slate-500 mb-2">{flow.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{latestVersion?._count?.steps ?? 0} stappen</span>
                    <span>{latestVersion?._count?.runs ?? 0} runs</span>
                    <span>Bijgewerkt {formatDate(flow.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {latestVersion && (
                    <Link href={`/runs/new?versionId=${latestVersion.id}&flowName=${encodeURIComponent(flow.name)}`} className="btn-secondary text-sm">
                      Run starten
                    </Link>
                  )}
                  <Link href={`/flows/${flow.id}`} className="btn-primary text-sm">
                    Flow bewerken
                  </Link>
                </div>
              </div>
              {latestVersion?.runs && latestVersion.runs.length > 0 && (
                <div className="border-t border-slate-100 px-5 py-3 flex gap-4">
                  {latestVersion.runs.slice(0, 3).map((run: any) => (
                    <Link key={run.id} href={`/runs/${run.id}`} className="flex items-center gap-2 text-xs hover:text-primary-600">
                      <span className={`badge ${STATUS_COLORS[run.status]}`}>{run.status.replace("_", " ")}</span>
                      <span className="text-slate-500">{run.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
