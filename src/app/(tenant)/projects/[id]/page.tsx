"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { STATUS_COLORS, PHASE_DESCRIPTIONS, formatDate } from "@/lib/utils";

const PHASE_ORDER = ["FAT", "GAT", "PAT"];

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [phaseForm, setPhaseForm] = useState({ name: "FAT", order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    setProject(data);
    setLoading(false);
  }

  async function addPhase(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/projects/${id}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: phaseForm.name, order: PHASE_ORDER.indexOf(phaseForm.name) }),
    });
    if (res.ok) { setShowAddPhase(false); load(); }
    setSaving(false);
  }

  const existingPhaseNames = project?.phases?.map((p: any) => p.name) ?? [];
  const availablePhases = PHASE_ORDER.filter((ph) => !existingPhaseNames.includes(ph));

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;
  if (!project || project.error) return <div className="p-8 text-slate-500">Project niet gevonden</div>;

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/projects" className="hover:text-slate-600">Projecten</Link>
        <span>/</span>
        <span className="text-slate-700">{project.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          {project.description && <p className="text-slate-500 text-sm mt-1">{project.description}</p>}
          <div className="flex items-center gap-3 mt-3">
            <span className={`badge ${STATUS_COLORS[project.status]}`}>{project.status}</span>
            <span className="text-xs text-slate-400">Aangemaakt {formatDate(project.createdAt)}</span>
          </div>
        </div>
        {availablePhases.length > 0 && (
          <button onClick={() => setShowAddPhase(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Fase toevoegen
          </button>
        )}
      </div>

      {showAddPhase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-lg mb-4">Testfase toevoegen</h2>
            <form onSubmit={addPhase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fase</label>
                <select className="input" value={phaseForm.name} onChange={e => setPhaseForm({...phaseForm, name: e.target.value})}>
                  {availablePhases.map(ph => (
                    <option key={ph} value={ph}>{ph} — {PHASE_DESCRIPTIONS[ph]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Toevoegen..." : "Toevoegen"}</button>
                <button type="button" onClick={() => setShowAddPhase(false)} className="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phases */}
      <div className="space-y-4">
        {project.phases.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-slate-400 text-sm">Nog geen testfases. Voeg FAT, GAT of PAT toe.</div>
          </div>
        ) : [...project.phases]
            .sort((a: any, b: any) => PHASE_ORDER.indexOf(a.name) - PHASE_ORDER.indexOf(b.name))
            .map((phase: any) => (
          <div key={phase.id} className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-sm">{phase.name}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{PHASE_DESCRIPTIONS[phase.name]}</h3>
                  <div className="text-xs text-slate-400">{phase.flows?.length ?? 0} flow{phase.flows?.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[phase.status]}`}>{phase.status}</span>
                <Link href={`/projects/${id}/phases/${phase.id}`} className="btn-secondary text-xs">
                  Openen →
                </Link>
              </div>
            </div>
            {phase.flows?.length > 0 && (
              <div className="divide-y divide-slate-50">
                {phase.flows.slice(0, 3).map((flow: any) => {
                  const latestVersion = flow.versions?.[0];
                  return (
                    <div key={flow.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
                        </div>
                        <span className="text-sm text-slate-700">{flow.name}</span>
                        {latestVersion && <span className="text-xs text-slate-400">{latestVersion.version}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{latestVersion?._count?.steps ?? 0} stappen</span>
                        <span>·</span>
                        <span>{latestVersion?._count?.runs ?? 0} runs</span>
                      </div>
                    </div>
                  );
                })}
                {phase.flows.length > 3 && (
                  <div className="px-5 py-2 text-xs text-primary-600">
                    +{phase.flows.length - 3} meer flows
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
