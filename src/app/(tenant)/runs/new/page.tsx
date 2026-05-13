"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function NewRunForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const versionId = searchParams.get("versionId") || "";
  const flowName = searchParams.get("flowName") || "";
  const [name, setName] = useState(`${flowName} - Run ${new Date().toLocaleDateString("nl-NL")}`);
  const [saving, setSaving] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/flowVersions/${versionId}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const run = await res.json();
      router.push(`/runs/${run.id}`);
    } else {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Testrun starten</h1>
      <p className="text-slate-500 text-sm mb-6">Flow: <strong>{flowName}</strong></p>
      <div className="card p-6">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Run naam *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Aanmaken..." : "Run aanmaken & starten"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewRunPage() {
  return <Suspense fallback={<div className="p-8">Laden...</div>}><NewRunForm /></Suspense>;
}
