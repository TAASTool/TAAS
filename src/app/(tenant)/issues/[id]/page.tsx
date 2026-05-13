"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { STATUS_COLORS, IMPACT_COLORS, ISSUE_TYPE_LABELS, ISSUE_IMPACT_LABELS, ISSUE_STATUS_LABELS, formatDateTime } from "@/lib/utils";

export default function IssuePage() {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => { load(); }, [id]);

  async function load() {
    const res = await fetch(`/api/issues/${id}`);
    const data = await res.json();
    setIssue(data);
    if (data && !data.error) {
      setEditForm({
        status: data.status,
        impact: data.impact,
        hasWorkaround: data.hasWorkaround,
        workaroundNote: data.workaroundNote || "",
        businessAccepted: data.businessAccepted,
        businessAcceptNote: data.businessAcceptNote || "",
      });
    }
    setLoading(false);
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/issues/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });
    setComment("");
    load();
    setSaving(false);
  }

  async function updateIssue() {
    setSaving(true);
    await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditMode(false);
    load();
    setSaving(false);
  }

  async function requestRetest() {
    if (!confirm("Hertest aanvragen? De stap wordt teruggezet naar 'In behandeling' en een hertest-taak wordt aangemaakt.")) return;
    await fetch(`/api/issues/${id}/request-retest`, { method: "POST" });
    load();
  }

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;
  if (!issue || issue.error) return <div className="p-8 text-slate-500">Bevinding niet gevonden</div>;

  const project = issue.runStep?.run?.flowVersion?.flow?.phase?.project;
  const phase = issue.runStep?.run?.flowVersion?.flow?.phase;
  const flow = issue.runStep?.run?.flowVersion?.flow;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/issues" className="hover:text-slate-600">Bevindingen</Link>
        <span>/</span>
        <span className="text-slate-700 truncate max-w-xs">{issue.title}</span>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge border text-xs ${IMPACT_COLORS[issue.impact]}`}>{ISSUE_IMPACT_LABELS[issue.impact]}</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{ISSUE_TYPE_LABELS[issue.type]}</span>
              {issue.retestRequired && <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Hertest vereist</span>}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{issue.title}</h1>
            {project && (
              <div className="text-sm text-slate-500 mt-1">
                {project.name} → {phase?.name} → {flow?.name} → Stap: {issue.runStep?.title}
              </div>
            )}
          </div>
          <span className={`badge ${STATUS_COLORS[issue.status]} ml-4`}>{ISSUE_STATUS_LABELS[issue.status]}</span>
        </div>

        <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 mb-4">
          {issue.description}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Door: {issue.createdBy.name}</span>
          <span>{formatDateTime(issue.createdAt)}</span>
        </div>
      </div>

      {/* Edit / status section */}
      {editMode ? (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Bevinding bijwerken</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                <option value="NEW">Nieuw</option>
                <option value="IN_PROGRESS">In behandeling</option>
                <option value="QUESTION">Vraag</option>
                <option value="RESOLVED">Opgelost</option>
                <option value="REJECTED">Afgewezen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Impact</label>
              <select className="input" value={editForm.impact} onChange={e => setEditForm({...editForm, impact: e.target.value})}>
                <option value="CRITICAL">Kritiek</option>
                <option value="HIGH">Hoog</option>
                <option value="MEDIUM">Middel</option>
                <option value="LOW">Laag</option>
              </select>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editForm.hasWorkaround} onChange={e => setEditForm({...editForm, hasWorkaround: e.target.checked})} className="rounded" />
              Workaround aanwezig
            </label>
            {editForm.hasWorkaround && (
              <textarea className="input resize-none" rows={2} placeholder="Beschrijf de workaround..." value={editForm.workaroundNote} onChange={e => setEditForm({...editForm, workaroundNote: e.target.value})} />
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editForm.businessAccepted} onChange={e => setEditForm({...editForm, businessAccepted: e.target.checked})} className="rounded" />
              Business akkoord (restpunt/nazorg)
            </label>
            {editForm.businessAccepted && (
              <textarea className="input resize-none" rows={2} placeholder="Toelichting akkoord..." value={editForm.businessAcceptNote} onChange={e => setEditForm({...editForm, businessAcceptNote: e.target.value})} />
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={updateIssue} disabled={saving} className="btn-primary">{saving ? "Opslaan..." : "Opslaan"}</button>
            <button onClick={() => setEditMode(false)} className="btn-secondary">Annuleren</button>
          </div>
        </div>
      ) : (
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="font-medium text-slate-500">Workaround: </span>
              <span className={issue.hasWorkaround ? "text-green-700" : "text-slate-700"}>{issue.hasWorkaround ? "Ja" : "Nee"}</span>
              {issue.workaroundNote && <p className="text-slate-600 mt-1 text-xs">{issue.workaroundNote}</p>}
            </div>
            <div>
              <span className="font-medium text-slate-500">Business akkoord: </span>
              <span className={issue.businessAccepted ? "text-green-700" : "text-slate-700"}>{issue.businessAccepted ? "Ja" : "Nee"}</span>
              {issue.businessAcceptNote && <p className="text-slate-600 mt-1 text-xs">{issue.businessAcceptNote}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditMode(true)} className="btn-secondary text-sm">Bewerken</button>
            {issue.status === "RESOLVED" && !issue.retestRequired && (
              <button onClick={requestRetest} className="text-sm border border-purple-200 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                Hertest aanvragen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Reacties ({issue.comments?.length ?? 0})</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {issue.comments?.map((c: any) => (
            <div key={c.id} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-slate-900">{c.user.name}</span>
                <span className="text-xs text-slate-400">{formatDateTime(c.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={addComment} className="p-4 border-t border-slate-100">
          <textarea
            className="input resize-none mb-2"
            rows={3}
            placeholder="Reactie toevoegen..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            required
          />
          <button type="submit" disabled={saving || !comment.trim()} className="btn-primary text-sm">
            {saving ? "Verzenden..." : "Reageren"}
          </button>
        </form>
      </div>
    </div>
  );
}
