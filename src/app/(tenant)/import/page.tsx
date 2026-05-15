"use client";
import { useState, useEffect } from "react";
import { HelpButton } from "@/components/HelpButton";

const TEMPLATE_HEADERS = "fase;flow_naam;flow_beschrijving;stap_titel;stap_instructie;stap_verwacht_resultaat";
const TEMPLATE_ROWS = [
  "FAT;Inloggen;Testen van het inlogproces;Navigeer naar inlogpagina;Ga naar de URL van de applicatie en open de inlogpagina;Inlogpagina is zichtbaar met gebruikersnaam- en wachtwoordveld",
  "FAT;Inloggen;;Vul geldige inloggegevens in;Voer een geldige gebruikersnaam en wachtwoord in;Ingevoerde waarden zijn zichtbaar in de velden",
  "FAT;Inloggen;;Klik op Inloggen;Klik op de knop Inloggen;Dashboard wordt geladen en gebruiker is ingelogd",
  "FAT;Wachtwoord vergeten;Testen van wachtwoordherstel;Klik op Wachtwoord vergeten;Klik op de link Wachtwoord vergeten op de inlogpagina;Formulier voor e-mailadres is zichtbaar",
  "FAT;Wachtwoord vergeten;;Voer e-mailadres in;Voer het geregistreerde e-mailadres in en klik op Versturen;Bevestigingsbericht wordt getoond",
  "GAT;Dashboard controleren;Controleer het dashboard na inloggen;Open het dashboard;Log in met testgebruiker en navigeer naar dashboard;Alle KPI-kaarten zijn zichtbaar en bevatten data",
  "GAT;Dashboard controleren;;Controleer navigatie;Klik op elk menu-item in de sidebar;Elke pagina laadt correct zonder foutmeldingen",
].join("\n");

interface ParsedRow {
  fase: string;
  flow_naam: string;
  flow_beschrijving: string;
  stap_titel: string;
  stap_instructie: string;
  stap_verwacht_resultaat: string;
  _row: number;
}

interface FlowGroup {
  fase: string;
  naam: string;
  beschrijving: string;
  steps: { titel: string; instructie: string; verwacht: string }[];
}

export default function ImportPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; flows: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setProjects(list);
        if (list.length > 0) setSelectedProject(list[0].id);
      });
  }, []);

  function downloadTemplate() {
    const bom = "﻿";
    const instructieRegel = "# Uitleg: elke rij is één teststap. Rijen met dezelfde fase+flow_naam worden samengevoegd tot één flow.";
    const content = [bom + instructieRegel, TEMPLATE_HEADERS, TEMPLATE_ROWS].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-sjabloon-flows.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function splitCSVLine(line: string, sep: string): string[] {
    const result: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { cell += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (line.slice(i, i + sep.length) === sep) { result.push(cell); cell = ""; i += sep.length - 1; }
        else { cell += ch; }
      }
    }
    result.push(cell);
    return result;
  }

  function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = (e.target?.result as string) || "";
      try {
        const text = raw.replace(/^﻿/, "");
        const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
        if (lines.length < 2) { setParseError("Bestand bevat geen gegevensrijen. Controleer het formaat."); setRows([]); return; }

        const sep = lines[0].includes(";") ? ";" : ",";
        const headers = splitCSVLine(lines[0], sep).map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));

        const required = ["fase", "flow_naam", "stap_titel", "stap_instructie"];
        const missing = required.filter((r) => !headers.includes(r));
        if (missing.length > 0) {
          setParseError(`Verplichte kolommen ontbreken: ${missing.join(", ")}. Gebruik het sjabloon als basis.`);
          setRows([]);
          return;
        }

        const parsed: ParsedRow[] = lines.slice(1)
          .map((line, idx) => {
            const vals = splitCSVLine(line, sep).map((v) => v.trim().replace(/^"|"$/g, ""));
            const obj: any = { _row: idx + 2 };
            headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
            return obj as ParsedRow;
          })
          .filter((r) => r.fase || r.flow_naam || r.stap_titel);

        if (parsed.length === 0) { setParseError("Geen geldige rijen gevonden in het bestand."); setRows([]); return; }
        setRows(parsed);
        setParseError(null);
      } catch {
        setParseError("Kon bestand niet verwerken. Controleer of het formaat klopt.");
        setRows([]);
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  const VALID_FASES = ["FAT", "GAT", "PAT"];
  const validationErrors: string[] = [];
  for (const row of rows) {
    if (!VALID_FASES.includes(row.fase?.toUpperCase())) {
      validationErrors.push(`Rij ${row._row}: Ongeldige fase "${row.fase}" — gebruik FAT, GAT of PAT`);
    }
    if (!row.flow_naam?.trim()) validationErrors.push(`Rij ${row._row}: Kolom flow_naam is verplicht`);
    if (!row.stap_titel?.trim()) validationErrors.push(`Rij ${row._row}: Kolom stap_titel is verplicht`);
    if (!row.stap_instructie?.trim()) validationErrors.push(`Rij ${row._row}: Kolom stap_instructie is verplicht`);
  }

  const groups = rows.reduce((acc, row) => {
    const key = `${row.fase?.toUpperCase()}|||${row.flow_naam}`;
    if (!acc[key]) {
      acc[key] = { fase: row.fase?.toUpperCase(), naam: row.flow_naam, beschrijving: row.flow_beschrijving || "", steps: [] };
    }
    acc[key].steps.push({ titel: row.stap_titel, instructie: row.stap_instructie, verwacht: row.stap_verwacht_resultaat || "" });
    return acc;
  }, {} as Record<string, FlowGroup>);

  const groupList = Object.values(groups);

  async function doImport() {
    if (!selectedProject || rows.length === 0 || validationErrors.length > 0) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/import/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject, rows }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Import mislukt. Probeer het opnieuw.");
      } else {
        const data = await res.json();
        setResult(data);
        setRows([]);
        setFileName(null);
      }
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Importeren</h1>
        <p className="text-slate-500 text-sm mt-1">Importeer flows en teststappen in bulk via een CSV-bestand</p>
      </div>

      {/* Stap 1: Sjabloon */}
      <div className="card p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center shrink-0">1</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-900 mb-1">Download het importsjabloon</h2>
            <p className="text-sm text-slate-500 mb-3">
              Het sjabloon is een CSV-bestand dat je kunt openen in Excel. Elke rij is één teststap. Meerdere rijen met dezelfde <strong>fase</strong> + <strong>flow_naam</strong> worden samengevoegd tot één flow.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 mb-3 overflow-x-auto">
              <code className="text-xs text-slate-600 whitespace-nowrap">
                fase ; flow_naam ; flow_beschrijving ; stap_titel ; stap_instructie ; stap_verwacht_resultaat
              </code>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs text-slate-500">
              <div className="space-y-1">
                <p><span className="font-semibold text-slate-700">fase</span> — FAT, GAT of PAT <span className="text-red-500">*</span></p>
                <p><span className="font-semibold text-slate-700">flow_naam</span> — Naam van de flow <span className="text-red-500">*</span></p>
                <p><span className="font-semibold text-slate-700">flow_beschrijving</span> — Omschrijving (optioneel)</p>
              </div>
              <div className="space-y-1">
                <p><span className="font-semibold text-slate-700">stap_titel</span> — Titel van de stap <span className="text-red-500">*</span></p>
                <p><span className="font-semibold text-slate-700">stap_instructie</span> — Wat de tester moet doen <span className="text-red-500">*</span></p>
                <p><span className="font-semibold text-slate-700">stap_verwacht_resultaat</span> — Verwacht resultaat (optioneel)</p>
              </div>
            </div>
            <button onClick={downloadTemplate} className="btn-primary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Sjabloon downloaden (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Stap 2: Project selecteren */}
      <div className="card p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center shrink-0">2</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-900 mb-1">Selecteer het doelproject</h2>
            <p className="text-sm text-slate-500 mb-3">
              De flows worden aangemaakt in de bijbehorende fase van dit project. De fases (FAT/GAT/PAT) moeten al bestaan in het project.
            </p>
            <select className="input w-full sm:w-80" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              {projects.length === 0 && <option value="">Geen projecten beschikbaar</option>}
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stap 3: Bestand uploaden */}
      <div className="card p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center shrink-0">3</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-900 mb-1">Upload het ingevulde bestand</h2>
            <p className="text-sm text-slate-500 mb-3">
              Upload het ingevulde CSV-bestand. Werkt met bestanden opgeslagen vanuit Excel als CSV (puntkomma of komma als scheidingsteken worden beide herkend).
            </p>
            <label className="flex items-center gap-4 cursor-pointer border-2 border-dashed border-slate-200 hover:border-primary-300 rounded-xl p-5 transition-colors group">
              <svg className="w-8 h-8 text-slate-300 group-hover:text-primary-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-700 group-hover:text-primary-700">
                  {fileName ? fileName : "Klik om een bestand te kiezen"}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">CSV of TXT — max 5 MB</div>
              </div>
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
              />
            </label>
            {parseError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {parseError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stap 4: Voorvertoning */}
      {rows.length > 0 && (
        <div className="card p-5 mb-4">
          <div className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center shrink-0 ${validationErrors.length > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>4</div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-900 mb-1">
                Voorvertoning
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {rows.length} stap{rows.length !== 1 ? "pen" : ""} in {groupList.length} flow{groupList.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {validationErrors.length > 0 ? (
                <div className="space-y-1.5 mt-2">
                  <p className="text-sm text-red-700 font-medium">Los de volgende fouten op voor je kunt importeren:</p>
                  {validationErrors.map((e, i) => (
                    <div key={i} className="text-sm text-red-600 bg-red-50 rounded px-3 py-1.5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      {e}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mt-3">
                  {groupList.map((group, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded shrink-0">{group.fase}</span>
                        <span className="font-medium text-slate-900 text-sm">{group.naam}</span>
                        {group.beschrijving && <span className="text-xs text-slate-400 truncate hidden sm:block">— {group.beschrijving}</span>}
                        <span className="ml-auto text-xs text-slate-400 shrink-0">{group.steps.length} stap{group.steps.length !== 1 ? "pen" : ""}</span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        {group.steps.map((step, j) => (
                          <div key={j} className="px-4 py-2 text-sm flex gap-3 items-start">
                            <span className="text-slate-400 shrink-0 w-5 text-right tabular-nums">{j + 1}.</span>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-800">{step.titel}</div>
                              <div className="text-xs text-slate-500 truncate">{step.instructie}</div>
                              {step.verwacht && <div className="text-xs text-blue-600 truncate">→ {step.verwacht}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Importeer-knop */}
      {rows.length > 0 && validationErrors.length === 0 && !result && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={doImport}
            disabled={importing || !selectedProject}
            className="btn-primary flex items-center gap-2"
          >
            {importing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
            {importing ? "Importeren..." : `${groupList.length} flow${groupList.length !== 1 ? "s" : ""} importeren (${rows.length} stappen)`}
          </button>
          <button onClick={() => { setRows([]); setFileName(null); setError(null); }} className="btn-secondary">
            Annuleren
          </button>
        </div>
      )}

      {/* Foutmelding */}
      {error && (
        <div className="card p-4 border-red-200 bg-red-50 text-sm text-red-700 flex items-start gap-3 mt-4">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong>Fout bij importeren:</strong> {error}
          </div>
        </div>
      )}

      {/* Succesbericht */}
      {result && (
        <div className="card p-5 border-green-200 bg-green-50 mt-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-semibold text-green-800 mb-1">Import geslaagd!</div>
              <div className="text-sm text-green-700">
                {result.created} stap{result.created !== 1 ? "pen" : ""} geïmporteerd in {result.flows.length} flow{result.flows.length !== 1 ? "s" : ""}.
              </div>
              {result.flows.length > 0 && (
                <ul className="mt-2 text-sm text-green-600 space-y-0.5">
                  {result.flows.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => setResult(null)} className="mt-3 text-sm text-green-700 underline hover:no-underline">
                Nog een import uitvoeren
              </button>
            </div>
          </div>
        </div>
      )}

      <HelpButton pageKey="import" />
    </div>
  );
}
