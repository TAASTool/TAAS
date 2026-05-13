"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { STATUS_COLORS, IMPACT_COLORS, ISSUE_TYPE_LABELS, ISSUE_IMPACT_LABELS, ISSUE_STATUS_LABELS, formatDateTime } from "@/lib/utils";

export default function IssuePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const roles: string[] = (session?.user as any)?.roles ?? [];
  const isFM = roles.includes("FUNCTIONAL_MANAGER") || roles.includes("TENANT_ADMIN");

  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [resolveConfirm, setResolveConfirm] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const res = await fetch(`/api/issues/${id}`);
    const data = await res.json();
    setIssue(data);
    if (data && !data.error) {
      setEditForm({
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

  async function resolveIssue() {
    setSaving(true);
    await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    setResolveConfirm(false);
    load();
    setSaving(false);
  }

  async function rejectIssue() {
    setSaving(true);
    await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    setRejectConfirm(false);
    load();
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;
  if (!issue || issue.error) return <div className="p-8 text-slate-500">Bevinding niet gevonden</div>;

  const project = issue.runStep?.run?.flowVersion?.flow?.phase?.project;
  const phase = issue.runStep?.run?.flowVersion?.flow?.phase;
  const flow = issue.runStep?.run?.flowVersion?.flow;
  const isOpen = !["RESOLVED", "REJECTED"].includes(issue.status);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/issues" className="hover:text-slate-600">Bevindingen</Link>
        <span>/</span>
        <span className="text-slate-700 truncate max-w-xs">{issue.title}</span>
      </div>

      {/* Main issue card */}
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge border text-xs ${IMPACT_COLORS[issue.impact]}`}>{ISSUE_IMPACT_LABELS[issue.impact]}</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{ISSUE_TYPE_LABELS[issue.type]}</span>
              {issue.retestRequired && (
                <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                  Hertest loopt
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{issue.title}</h1>
            {project && (
              <div className="text-sm text-slate-500 mt-1">
                {project.name} → {phase?.name} → {flow?.name} → Stap: {issue.runStep?.title}
              </div>
            )}
          </div>
          <span className={`badge ${STATUS_COLORS[issue.status]} ml-4 shrink-0`}>{ISSUE_STATUS_LABELS[issue.status]}</span>
        </div>

        <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 mb-4">
          {issue.description}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Door: {issue.createdBy.name}</span>
          <span>{formatDateTime(issue.createdAt)}</span>
        </div>
      </div>

      {/* Retest banner */}
      {issue.retestRequired && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div>
            <div className="text-sm font-semibold text-purple-900">Hertest in behandeling</div>
            <div className="text-xs text-purple-600 mt-0.5">
              De bevinding is opgelost. De tester voert momenteel de hertest uit.
            </div>
          </div>
        </div>
      )}

      {/* FM action bar */}
      {isFM && (
        <div className="card p-4 mb-4">
          {/* Resolve confirm */}
          {resolveConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Bevinding markeren als <strong>opgelost</strong>? De tester krijgt automatisch een hertest-taak.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={resolveIssue}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  {saving ? "Bezig..." : "Ja, oplossen en hertest aanmaken"}
                </button>
                <button onClick={() => setResolveConfirm(false)} className="btn-secondary text-sm">
                  Annuleren
                </button>
              </div>
            </div>
          ) : rejectConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Bevinding <strong>afwijzen</strong>? De bevinding wordt gesloten zonder hertest.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={rejectIssue}
                  disabled={saving}
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {saving ? "Bezig..." : "Ja, afwijzen"}
                </button>
                <button onClick={() => setRejectConfirm(false)} className="btn-secondary text-sm">
                  Annuleren
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              {isOpen && !issue.retestRequired && (
                <button
                  onClick={() => setResolveConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Oplossen (hertest aanmaken)
                </button>
              )}
              {isOpen && (
                <button
                  onClick={() => setRejectConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                >
                  Afwijzen
                </button>
              )}
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="btn-secondary text-sm">
                  Bewerken
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit form (metadata only — status is handled via dedicated buttons) */}
      {editMode && (
        <div className="card p-6 mb-4">
          <h3 className="font-semibold text-slate-900 mb-4">Bevinding bewerken</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Impact</label>
            <select className="input w-48" value={editForm.impact} onChange={e => setEditForm({...editForm, impact: e.target.value})}>
              <option value="CRITICAL">Kritiek</option>
              <option value="HIGH">Hoog</option>
              <option value="MEDIUM">Middel</option>
              <option value="LOW">Laag</option>
            </select>
          </div>
          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editForm.hasWorkaround} onChange={e => setEditForm({...editForm, hasWorkaround: e.target.checked})} className="rounded" />
              Workaround aanwezig
            </label>
            {editForm.hasWorkaround && (
              <textarea className="input resize-none" rows={2} placeholder="Beschrijf de workaround..." value={editForm.workaroundNote} onChange={e => setEditForm({...editForm, workaroundNote: e.target.value})} />
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editForm.businessAccepted} onChange={e => setEditForm({...editForm, businessAccepted: e.target.checked})} className="rounded" />
              Business akkoord (restpunt/nazorg)
            </label>
            {editForm.businessAccepted && (
              <textarea className="input resize-none" rows={2} placeholder="Toelichting akkoord..." value={editForm.businessAcceptNote} onChange={e => setEditForm({...editForm, businessAcceptNote: e.target.value})} />
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={updateIssue} disabled={saving} className="btn-primary text-sm">
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            <button onClick={() => setEditMode(false)} className="btn-secondary text-sm">Annuleren</button>
          </div>
        </div>
      )}

      {/* Metadata summary (when not editing) */}
      {!editMode && (
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
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
          {!isFM && (
            <button onClick={() => setEditMode(true)} className="btn-secondary text-sm mt-3">Bewerken</button>
          )}
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
