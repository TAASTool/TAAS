"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function FlowBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [newStep, setNewStep] = useState<{ afterStepId?: string; active: boolean }>({ active: false });
  const [newStepForm, setNewStepForm] = useState({ title: "", instruction: "", expectedResult: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const res = await fetch(`/api/flows/${id}`);
    const data = await res.json();
    setFlow(data);
    setLoading(false);
  }

  const activeVersion = flow?.versions?.find((v: any) => v.isActive) ?? flow?.versions?.[0];
  const steps = activeVersion?.steps ?? [];
  const hasRuns = (activeVersion?._count?.runs ?? 0) > 0;

  async function saveStep(stepId: string) {
    setSaving(true);
    await fetch(`/api/flowSteps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingStep(null);
    load();
    setSaving(false);
  }

  async function deleteStep(stepId: string) {
    if (!confirm("Stap verwijderen?")) return;
    await fetch(`/api/flowSteps/${stepId}`, { method: "DELETE" });
    load();
  }

  async function addStep(afterStepId?: string) {
    setSaving(true);
    await fetch(`/api/flowVersions/${activeVersion.id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newStepForm, afterStepId }),
    });
    setNewStep({ active: false });
    setNewStepForm({ title: "", instruction: "", expectedResult: "" });
    load();
    setSaving(false);
  }

  async function createNewVersion() {
    if (!confirm("Nieuwe versie aanmaken? De huidige stappen worden gekopieerd.")) return;
    await fetch(`/api/flows/${id}/versions`, { method: "POST" });
    load();
  }

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;
  if (!flow || flow.error) return <div className="p-8 text-slate-500">Flow niet gevonden</div>;

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/projects" className="hover:text-slate-600">Projecten</Link>
        <span>/</span>
        <Link href={`/projects/${flow.phase.project.id}`} className="hover:text-slate-600">{flow.phase.project.name}</Link>
        <span>/</span>
        <Link href={`/projects/${flow.phase.project.id}/phases/${flow.phase.id}`} className="hover:text-slate-600">{flow.phase.name}</Link>
        <span>/</span>
        <span className="text-slate-700">{flow.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{flow.name}</h1>
            {activeVersion && <span className="text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded">{activeVersion.version}</span>}
          </div>
          {flow.description && <p className="text-slate-500 text-sm">{flow.description}</p>}
          {hasRuns && (
            <div className="flex items-center gap-2 mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Er zijn runs op deze versie — stappen zijn alleen-lezen. Maak een nieuwe versie om te bewerken.
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {hasRuns && (
            <button onClick={createNewVersion} className="btn-secondary text-sm">
              Nieuwe versie
            </button>
          )}
          {activeVersion && (
            <Link
              href={`/runs/new?versionId=${activeVersion.id}&flowName=${encodeURIComponent(flow.name)}`}
              className="btn-primary text-sm"
            >
              Run starten
            </Link>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 max-w-3xl">
        {steps.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 text-sm">Nog geen stappen. Voeg de eerste stap toe.</div>
        ) : steps.map((step: any, index: number) => (
          <div key={step.id}>
            {editingStep === step.id ? (
              <div className="card p-4 border-primary-300 border-2">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Titel</label>
                    <input className="input" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Instructie / Testscript</label>
                    <textarea className="input resize-none" rows={4} value={editForm.instruction} onChange={e => setEditForm({...editForm, instruction: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Verwacht resultaat</label>
                    <textarea className="input resize-none" rows={2} value={editForm.expectedResult || ""} onChange={e => setEditForm({...editForm, expectedResult: e.target.value})} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveStep(step.id)} disabled={saving} className="btn-primary text-sm">{saving ? "Opslaan..." : "Opslaan"}</button>
                    <button onClick={() => setEditingStep(null)} className="btn-secondary text-sm">Annuleren</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card group">
                <div className="flex items-start p-4 gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{step.instruction}</p>
                    {step.expectedResult && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-slate-500">Verwacht: </span>
                        <span className="text-slate-600">{step.expectedResult}</span>
                      </div>
                    )}
                    {step.assignees?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {step.assignees.map((a: any) => (
                          <span key={a.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{a.user.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {!hasRuns && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingStep(step.id); setEditForm({ title: step.title, instruction: step.instruction, expectedResult: step.expectedResult }); }}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                        title="Bewerken"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => deleteStep(step.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Verwijderen"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                {/* Insert step after button */}
                {!hasRuns && (
                  <div className="border-t border-slate-50 px-4 py-2">
                    <button
                      onClick={() => { setNewStep({ afterStepId: step.id, active: true }); setNewStepForm({ title: "", instruction: "", expectedResult: "" }); }}
                      className="text-xs text-slate-400 hover:text-primary-600 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Stap hierna invoegen
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Inline new step form */}
            {newStep.active && newStep.afterStepId === step.id && (
              <div className="card p-4 border-dashed border-2 border-primary-300 mt-3">
                <div className="space-y-3">
                  <input className="input" placeholder="Stap titel *" value={newStepForm.title} onChange={e => setNewStepForm({...newStepForm, title: e.target.value})} autoFocus />
                  <textarea className="input resize-none" rows={3} placeholder="Instructie / testscript *" value={newStepForm.instruction} onChange={e => setNewStepForm({...newStepForm, instruction: e.target.value})} />
                  <input className="input" placeholder="Verwacht resultaat" value={newStepForm.expectedResult} onChange={e => setNewStepForm({...newStepForm, expectedResult: e.target.value})} />
                  <div className="flex gap-2">
                    <button onClick={() => addStep(step.id)} disabled={saving || !newStepForm.title || !newStepForm.instruction} className="btn-primary text-sm">{saving ? "Toevoegen..." : "Toevoegen"}</button>
                    <button onClick={() => setNewStep({ active: false })} className="btn-secondary text-sm">Annuleren</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add first / last step */}
        {!hasRuns && !newStep.active && (
          <button
            onClick={() => { setNewStep({ active: true }); setNewStepForm({ title: "", instruction: "", expectedResult: "" }); }}
            className="w-full card p-3 text-sm text-slate-400 hover:text-primary-600 hover:border-primary-300 transition-colors flex items-center justify-center gap-2 border-dashed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {steps.length === 0 ? "Eerste stap toevoegen" : "Stap aan het einde toevoegen"}
          </button>
        )}

        {newStep.active && !newStep.afterStepId && (
          <div className="card p-4 border-dashed border-2 border-primary-300">
            <div className="space-y-3">
              <input className="input" placeholder="Stap titel *" value={newStepForm.title} onChange={e => setNewStepForm({...newStepForm, title: e.target.value})} autoFocus />
              <textarea className="input resize-none" rows={3} placeholder="Instructie / testscript *" value={newStepForm.instruction} onChange={e => setNewStepForm({...newStepForm, instruction: e.target.value})} />
              <input className="input" placeholder="Verwacht resultaat" value={newStepForm.expectedResult} onChange={e => setNewStepForm({...newStepForm, expectedResult: e.target.value})} />
              <div className="flex gap-2">
                <button onClick={() => addStep()} disabled={saving || !newStepForm.title || !newStepForm.instruction} className="btn-primary text-sm">{saving ? "Toevoegen..." : "Toevoegen"}</button>
                <button onClick={() => setNewStep({ active: false })} className="btn-secondary text-sm">Annuleren</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
