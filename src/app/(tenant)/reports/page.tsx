"use client";
import { useState, useEffect } from "react";

export default function ReportsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => {
        setProjects(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, []);

  async function generateReport(type: string, entityId: string, entityName: string) {
    setGenerating(`${type}-${entityId}`);
    const res = await fetch("/api/reports/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, entityId, entityName }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type.toLowerCase()}-${entityId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setGenerating(null);
  }

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Rapportages</h1>
        <p className="text-slate-500 text-sm mt-1">Genereer audit-proof PDF rapportages</p>
      </div>

      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 text-sm">Geen projecten beschikbaar</div>
        ) : projects.map((project) => (
          <div key={project.id} className="card">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">{project.name}</h2>
            </div>

            {/* Project-level reports */}
            <div className="p-4 flex flex-wrap gap-2 border-b border-slate-50">
              <span className="text-xs font-medium text-slate-500 self-center mr-2">Project:</span>
              <button
                onClick={() => generateReport("ISSUE_LOG", project.id, project.name)}
                disabled={generating === `ISSUE_LOG-${project.id}`}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                {generating === `ISSUE_LOG-${project.id}` ? "Genereren..." : "Issue Log PDF"}
              </button>
            </div>

            {/* Phase-level reports */}
            {project.phases?.map((phase: any) => (
              <div key={phase.id} className="px-4 py-3 flex flex-wrap items-center gap-2 border-b border-slate-50 last:border-b-0">
                <span className="text-xs font-medium text-slate-500 w-16">{phase.name}:</span>
                <button
                  onClick={() => generateReport("PHASE_REPORT", phase.id, `${project.name} ${phase.name}`)}
                  disabled={generating === `PHASE_REPORT-${phase.id}`}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {generating === `PHASE_REPORT-${phase.id}` ? "Genereren..." : "Fase Rapport"}
                </button>
                <button
                  onClick={() => generateReport("GONOGO_SUMMARY", phase.id, `${project.name} ${phase.name}`)}
                  disabled={generating === `GONOGO_SUMMARY-${phase.id}`}
                  className="text-xs border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {generating === `GONOGO_SUMMARY-${phase.id}` ? "Genereren..." : "Go/No-Go Samenvatting"}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-8 card p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          <strong>Audit-proof:</strong> Alle rapportages bevatten run metadata, uitvoerder + tijdstip per stap, bevindingen-log met statushistorie, en een akkoordpagina voor Go/No-Go.
        </p>
      </div>
    </div>
  );
}
