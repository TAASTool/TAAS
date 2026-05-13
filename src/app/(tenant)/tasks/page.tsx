"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { STATUS_COLORS, TASK_TYPE_LABELS, IMPACT_COLORS, ISSUE_IMPACT_LABELS, formatDateTime } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function updateTask(taskId: string, status: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const TYPE_ICONS: Record<string, string> = {
    STEP_EXECUTION: "🧪",
    RETEST: "🔄",
    QUESTION: "❓",
  };

  if (loading) return <div className="p-8 text-slate-500">Laden...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mijn Taken</h1>
        <p className="text-slate-500 text-sm mt-1">{tasks.length} openstaande taak{tasks.length !== 1 ? "en" : ""}</p>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 text-sm">Geen openstaande taken. Goed bezig!</div>
        ) : tasks.map((task) => {
          const run = task.runStep?.run;
          const project = run?.flowVersion?.flow?.phase?.project;
          return (
            <div key={task.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{TYPE_ICONS[task.type]}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{TASK_TYPE_LABELS[task.type]}</span>
                      <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                    </div>
                    <h3 className="font-medium text-slate-900">{task.title}</h3>
                    {task.description && <p className="text-sm text-slate-500 mt-0.5">{task.description}</p>}
                    {project && (
                      <div className="text-xs text-slate-400 mt-1">{project.name} — {run?.name}</div>
                    )}
                    {task.issue && (
                      <Link href={`/issues/${task.issue.id}`} className="text-xs text-primary-600 hover:underline mt-1 block">
                        Bevinding: {task.issue.title}
                        {task.issue.impact && <span className={`ml-2 badge border text-xs ${IMPACT_COLORS[task.issue.impact]}`}>{ISSUE_IMPACT_LABELS[task.issue.impact]}</span>}
                      </Link>
                    )}
                    <div className="text-xs text-slate-400 mt-1">{formatDateTime(task.createdAt)}</div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {task.type === "STEP_EXECUTION" && task.runStep && (
                    <Link href={`/runs/${task.runStep.run?.id}`} className="btn-secondary text-xs">
                      Naar run
                    </Link>
                  )}
                  {task.type === "RETEST" && task.runStep && (
                    <Link href={`/runs/${task.runStep.run?.id}`} className="btn-secondary text-xs">
                      Hertest uitvoeren
                    </Link>
                  )}
                  {task.type === "QUESTION" && task.issue && (
                    <Link href={`/issues/${task.issue.id}`} className="btn-secondary text-xs">
                      Bekijk bevinding
                    </Link>
                  )}
                  {task.status !== "DONE" && (
                    <button
                      onClick={() => updateTask(task.id, "DONE")}
                      className="text-xs text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Afronden
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
