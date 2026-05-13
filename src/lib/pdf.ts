import React from "react";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, padding: 40, color: "#1e293b" },
  header: { marginBottom: 20, borderBottom: 2, borderBottomColor: "#4f46e5", paddingBottom: 10 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#4f46e5", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#64748b" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#1e293b", marginBottom: 8, borderBottom: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { fontFamily: "Helvetica-Bold", width: 120 },
  value: { flex: 1 },
  table: { marginBottom: 12 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f1f5f9", padding: 6, marginBottom: 2 },
  tableRow: { flexDirection: "row", padding: 5, borderBottom: 1, borderBottomColor: "#f1f5f9" },
  tableCell: { flex: 1, paddingRight: 4 },
  tableCellBold: { flex: 1, fontFamily: "Helvetica-Bold", paddingRight: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 8 },
  critical: { backgroundColor: "#fee2e2", color: "#991b1b" },
  high: { backgroundColor: "#ffedd5", color: "#9a3412" },
  medium: { backgroundColor: "#fef9c3", color: "#854d0e" },
  low: { backgroundColor: "#dcfce7", color: "#166534" },
  passedBadge: { backgroundColor: "#dcfce7", color: "#166534" },
  failedBadge: { backgroundColor: "#fee2e2", color: "#991b1b" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", color: "#94a3b8", fontSize: 8 },
  kpiGrid: { flexDirection: "row", marginBottom: 16, gap: 8 },
  kpiCard: { flex: 1, backgroundColor: "#f8fafc", padding: 10, borderRadius: 4, borderLeft: 3, borderLeftColor: "#4f46e5" },
  kpiValue: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#4f46e5", marginBottom: 2 },
  kpiLabel: { fontSize: 8, color: "#64748b" },
});

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("nl-NL").format(new Date(d));
}

const IMPACT_LABELS: Record<string, string> = { CRITICAL: "Kritiek", HIGH: "Hoog", MEDIUM: "Middel", LOW: "Laag" };
const TYPE_LABELS: Record<string, string> = { BUG: "Fout", WISH: "Wens", BLOCKER: "Blokkade" };
const STATUS_LABELS: Record<string, string> = { NEW: "Nieuw", IN_PROGRESS: "In behandeling", QUESTION: "Vraag", RESOLVED: "Opgelost", REJECTED: "Afgewezen" };
const STEP_STATUS_LABELS: Record<string, string> = { PENDING: "Wacht", IN_PROGRESS: "Bezig", PASSED: "Geslaagd", FAILED: "Mislukt", BLOCKED: "Geblokkeerd" };

export async function generatePhaseReport(phase: any): Promise<Buffer> {
  const allIssues = phase.flows.flatMap((f: any) =>
    f.versions[0]?.runs.flatMap((r: any) => r.steps.flatMap((s: any) => s.issues)) ?? []
  );
  const openBlockers = allIssues.filter((i: any) => i.type === "BLOCKER" && !["RESOLVED", "REJECTED"].includes(i.status));
  const openCritical = allIssues.filter((i: any) => i.impact === "CRITICAL" && !["RESOLVED", "REJECTED"].includes(i.status));
  const totalRuns = phase.flows.reduce((acc: number, f: any) => acc + (f.versions[0]?.runs.length ?? 0), 0);
  const completedRuns = phase.flows.reduce((acc: number, f: any) =>
    acc + (f.versions[0]?.runs.filter((r: any) => ["COMPLETED", "ACCEPTED"].includes(r.status)).length ?? 0), 0);

  const doc = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, `${phase.project.name} — ${phase.name} Rapport`),
        React.createElement(Text, { style: styles.subtitle }, `Gegenereerd op ${formatDate(new Date())} | Project: ${phase.project.name}`)
      ),
      // KPIs
      React.createElement(View, { style: styles.kpiGrid },
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiValue }, String(phase.flows.length)),
          React.createElement(Text, { style: styles.kpiLabel }, "Flows")
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiValue }, `${completedRuns}/${totalRuns}`),
          React.createElement(Text, { style: styles.kpiLabel }, "Runs voltooid")
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: styles.kpiValue }, String(allIssues.length)),
          React.createElement(Text, { style: styles.kpiLabel }, "Bevindingen totaal")
        ),
        React.createElement(View, { style: styles.kpiCard },
          React.createElement(Text, { style: { ...styles.kpiValue, color: openBlockers.length > 0 ? "#dc2626" : "#16a34a" } }, String(openBlockers.length)),
          React.createElement(Text, { style: styles.kpiLabel }, "Open blokkades")
        )
      ),
      // Acceptance check
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Acceptatiecheck"),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Open Blokkades:"),
          React.createElement(Text, { style: { ...styles.value, color: openBlockers.length > 0 ? "#dc2626" : "#16a34a" } },
            openBlockers.length > 0 ? `NIET AKKOORD — ${openBlockers.length} open blokkade(s)` : "Akkoord — geen open blokkades")
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Kritieke issues:"),
          React.createElement(Text, { style: { ...styles.value, color: openCritical.length > 0 ? "#dc2626" : "#16a34a" } },
            openCritical.length > 0 ? `Let op — ${openCritical.length} kritieke issue(s) open` : "Akkoord")
        )
      ),
      // Flows overview
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Flows overzicht"),
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Flow"),
          React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Versie"),
          React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Runs"),
          React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Bevindingen")
        ),
        ...phase.flows.map((flow: any) => {
          const v = flow.versions[0];
          const issues = v?.runs.flatMap((r: any) => r.steps.flatMap((s: any) => s.issues)) ?? [];
          return React.createElement(View, { key: flow.id, style: styles.tableRow },
            React.createElement(Text, { style: styles.tableCell }, flow.name),
            React.createElement(Text, { style: styles.tableCell }, v?.version ?? "—"),
            React.createElement(Text, { style: styles.tableCell }, String(v?.runs.length ?? 0)),
            React.createElement(Text, { style: styles.tableCell }, String(issues.length))
          );
        })
      ),
      // Footer
      React.createElement(View, { style: styles.footer, fixed: true },
        React.createElement(Text, {}, `TAAS — Rhoost Test Tool | ${phase.project.name} | ${phase.name} | Pagina `)
      )
    )
  );

  return renderToBuffer(doc);
}

export async function generateIssueLogReport(issues: any[], projectName: string): Promise<Buffer> {
  const doc = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, `Issue Log — ${projectName}`),
        React.createElement(Text, { style: styles.subtitle }, `Gegenereerd op ${formatDate(new Date())} | ${issues.length} bevindingen`)
      ),
      // Table header
      React.createElement(View, { style: styles.tableHeader },
        React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold", flex: 2 }] }, "Titel"),
        React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Type"),
        React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Impact"),
        React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Status"),
        React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Workaround"),
        React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Aangemaakt")
      ),
      ...issues.map((issue) =>
        React.createElement(View, { key: issue.id, style: styles.tableRow },
          React.createElement(Text, { style: { ...styles.tableCell, flex: 2 } }, issue.title),
          React.createElement(Text, { style: styles.tableCell }, TYPE_LABELS[issue.type] || issue.type),
          React.createElement(Text, { style: styles.tableCell }, IMPACT_LABELS[issue.impact] || issue.impact),
          React.createElement(Text, { style: styles.tableCell }, STATUS_LABELS[issue.status] || issue.status),
          React.createElement(Text, { style: styles.tableCell }, issue.hasWorkaround ? "Ja" : "Nee"),
          React.createElement(Text, { style: styles.tableCell }, formatDate(issue.createdAt))
        )
      ),
      React.createElement(View, { style: styles.footer, fixed: true },
        React.createElement(Text, {}, `TAAS — Rhoost Test Tool | Issue Log | ${projectName}`)
      )
    )
  );

  return renderToBuffer(doc);
}

export async function generateGoNoGoReport(phase: any): Promise<Buffer> {
  const allIssues = phase.flows.flatMap((f: any) =>
    f.versions[0]?.runs.flatMap((r: any) => r.steps.flatMap((s: any) => s.issues)) ?? []
  );
  const openBlockers = allIssues.filter((i: any) => i.type === "BLOCKER" && !["RESOLVED", "REJECTED"].includes(i.status));
  const openCritical = allIssues.filter((i: any) => i.impact === "CRITICAL" && !["RESOLVED", "REJECTED"].includes(i.status));
  const openHigh = allIssues.filter((i: any) => i.impact === "HIGH" && !["RESOLVED", "REJECTED"].includes(i.status));
  const highWithoutWorkaround = openHigh.filter((i: any) => !i.hasWorkaround);
  const isGo = openBlockers.length === 0 && openCritical.length === 0 && highWithoutWorkaround.length === 0;

  const doc = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, `Go/No-Go Samenvatting — ${phase.name}`),
        React.createElement(Text, { style: styles.subtitle }, `${phase.project.name} | Gegenereerd op ${formatDate(new Date())}`)
      ),
      // GO/NO-GO verdict
      React.createElement(View, { style: { ...styles.section, padding: 16, backgroundColor: isGo ? "#dcfce7" : "#fee2e2", borderRadius: 8, marginBottom: 20 } },
        React.createElement(Text, { style: { fontSize: 24, fontFamily: "Helvetica-Bold", color: isGo ? "#166534" : "#991b1b", textAlign: "center" } },
          isGo ? "GO" : "NO-GO"
        ),
        React.createElement(Text, { style: { textAlign: "center", color: isGo ? "#166534" : "#991b1b", marginTop: 4 } },
          isGo
            ? "Geen blokkerende bevindingen. Fase kan worden geaccepteerd."
            : `${openBlockers.length} blokkade(s) en/of ${openCritical.length} kritieke issue(s) vereisen aandacht.`
        )
      ),
      // Acceptance rules check
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Acceptatiecriteria"),
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Regel"),
          React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Uitkomst"),
          React.createElement(Text, { style: [styles.tableCell, { fontFamily: "Helvetica-Bold" }] }, "Details")
        ),
        React.createElement(View, { style: styles.tableRow },
          React.createElement(Text, { style: styles.tableCell }, "Geen open BLOCKER issues"),
          React.createElement(Text, { style: { ...styles.tableCell, color: openBlockers.length === 0 ? "#166534" : "#991b1b", fontFamily: "Helvetica-Bold" } },
            openBlockers.length === 0 ? "Akkoord" : "NIET akkoord"),
          React.createElement(Text, { style: styles.tableCell }, `${openBlockers.length} open blokkade(s)`)
        ),
        React.createElement(View, { style: styles.tableRow },
          React.createElement(Text, { style: styles.tableCell }, "Geen open KRITIEK issues"),
          React.createElement(Text, { style: { ...styles.tableCell, color: openCritical.length === 0 ? "#166534" : "#991b1b", fontFamily: "Helvetica-Bold" } },
            openCritical.length === 0 ? "Akkoord" : "NIET akkoord"),
          React.createElement(Text, { style: styles.tableCell }, `${openCritical.length} kritieke issue(s)`)
        ),
        React.createElement(View, { style: styles.tableRow },
          React.createElement(Text, { style: styles.tableCell }, "HOGE issues hebben workaround"),
          React.createElement(Text, { style: { ...styles.tableCell, color: highWithoutWorkaround.length === 0 ? "#166534" : "#dc2626", fontFamily: "Helvetica-Bold" } },
            highWithoutWorkaround.length === 0 ? "Akkoord" : "Aandacht"),
          React.createElement(Text, { style: styles.tableCell }, `${highWithoutWorkaround.length} hoge issue(s) zonder workaround`)
        )
      ),
      // Sign-off section
      React.createElement(View, { style: { ...styles.section, marginTop: 40 } },
        React.createElement(Text, { style: styles.sectionTitle }, "Akkoord & Handtekening"),
        React.createElement(View, { style: { flexDirection: "row", marginTop: 20, gap: 40 } },
          React.createElement(View, { style: { flex: 1 } },
            React.createElement(Text, { style: { borderBottom: 1, borderBottomColor: "#000", marginBottom: 4, paddingBottom: 20 } }, ""),
            React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, "Naam"),
            React.createElement(Text, { style: { marginTop: 8, borderBottom: 1, borderBottomColor: "#000", marginBottom: 4, paddingBottom: 20 } }, ""),
            React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, "Functie")
          ),
          React.createElement(View, { style: { flex: 1 } },
            React.createElement(Text, { style: { borderBottom: 1, borderBottomColor: "#000", marginBottom: 4, paddingBottom: 20 } }, ""),
            React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, "Datum"),
            React.createElement(Text, { style: { marginTop: 8, borderBottom: 1, borderBottomColor: "#000", marginBottom: 4, paddingBottom: 20 } }, ""),
            React.createElement(Text, { style: { fontSize: 8, color: "#64748b" } }, "Handtekening")
          )
        )
      ),
      React.createElement(View, { style: styles.footer, fixed: true },
        React.createElement(Text, {}, `TAAS — Rhoost Test Tool | Go/No-Go | ${phase.project.name} | ${phase.name}`)
      )
    )
  );

  return renderToBuffer(doc);
}
