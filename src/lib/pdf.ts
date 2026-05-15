import React from "react";
import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ─── Brand colors ────────────────────────────────────────────────────────────
const C = {
  terracotta: "#C8834A",
  terracottaLight: "#e8a978",
  forestDark: "#2D4438",
  forestMid: "#365C40",
  forestLight: "#7fad8a",
  white: "#ffffff",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate700: "#334155",
  slate900: "#0f172a",
  green700: "#15803d",
  green100: "#dcfce7",
  red700: "#b91c1c",
  red100: "#fee2e2",
  orange700: "#c2410c",
  orange100: "#ffedd5",
  yellow100: "#fef9c3",
  yellow700: "#a16207",
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Pages
  coverPage: {
    fontFamily: "Helvetica",
    fontSize: 9,
    backgroundColor: C.forestDark,
    padding: 0,
    color: C.white,
  },
  contentPage: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 45,
    paddingLeft: 40,
    paddingRight: 40,
    color: C.slate700,
    backgroundColor: C.white,
  },

  // Left accent strip on content pages
  accentStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: C.terracotta,
  },

  // Cover elements
  coverInner: {
    flex: 1,
    paddingHorizontal: 50,
    paddingTop: 60,
    paddingBottom: 0,
    justifyContent: "space-between",
  },
  coverTop: {
    alignItems: "center",
    marginBottom: 40,
  },
  coverLogoWrap: {
    marginBottom: 28,
  },
  coverOrgName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    marginBottom: 8,
    textAlign: "center",
  },
  coverBadge: {
    backgroundColor: C.terracotta,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 28,
    alignSelf: "center",
  },
  coverBadgeText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    letterSpacing: 1.2,
  },
  coverPhaseCode: {
    fontSize: 52,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 2,
  },
  coverPhaseName: {
    fontSize: 14,
    color: C.forestLight,
    textAlign: "center",
    marginBottom: 16,
  },
  coverSeparator: {
    height: 2,
    backgroundColor: C.terracotta,
    width: 80,
    alignSelf: "center",
    marginBottom: 16,
  },
  coverProjectName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textAlign: "center",
    marginBottom: 6,
  },
  coverDate: {
    fontSize: 9,
    color: C.forestLight,
    textAlign: "center",
  },
  coverBottom: {
    backgroundColor: "#1a2e22",
    paddingHorizontal: 50,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coverBottomLeft: {
    fontSize: 9,
    color: C.slate400,
    flex: 1,
  },
  coverBottomBadge: {
    backgroundColor: C.terracotta,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 3,
  },
  coverBottomBadgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    letterSpacing: 0.8,
  },
  coverBottomRight: {
    fontSize: 9,
    color: C.slate400,
    flex: 1,
    textAlign: "right",
  },

  // Section header
  sectionHeader: {
    backgroundColor: C.forestDark,
    color: C.white,
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    marginTop: 14,
  },

  // KPI
  kpiGrid: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.slate100,
    borderLeftWidth: 4,
    borderLeftColor: C.terracotta,
    padding: 12,
    borderRadius: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.terracotta,
    marginBottom: 3,
  },
  kpiLabel: {
    fontSize: 8,
    color: C.slate400,
  },

  // Tables
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.forestMid,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: C.white,
    flex: 1,
    paddingRight: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
  },
  tableRowAlt: {
    backgroundColor: C.slate50,
  },
  tableCell: {
    fontSize: 8,
    flex: 1,
    paddingRight: 4,
    color: C.slate700,
  },
  tableCellBold: {
    fontSize: 8,
    flex: 1,
    paddingRight: 4,
    fontFamily: "Helvetica-Bold",
    color: C.slate700,
  },

  // Progress bar
  progressBarOuter: {
    height: 6,
    backgroundColor: C.slate200,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 3,
  },

  // Badges
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 45,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: C.slate400,
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    paddingTop: 5,
  },

  // Sign-off boxes
  signOffGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  signOffBox: {
    width: "47%",
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 4,
    padding: 12,
  },
  signOffTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.forestDark,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingBottom: 6,
  },
  signOffLine: {
    borderBottomWidth: 1,
    borderBottomColor: C.slate700,
    marginBottom: 3,
    marginTop: 16,
    height: 1,
  },
  signOffLineLabel: {
    fontSize: 7.5,
    color: C.slate400,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

const PHASE_LABELS: Record<string, string> = {
  FAT: "Functionele Acceptatietest",
  GAT: "Gebruikers Acceptatietest",
  PAT: "Productie Acceptatietest",
};

const IMPACT_LABELS: Record<string, string> = {
  CRITICAL: "Kritiek",
  HIGH: "Hoog",
  MEDIUM: "Middel",
  LOW: "Laag",
};
const IMPACT_COLORS: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: C.red100, text: C.red700 },
  HIGH: { bg: C.orange100, text: C.orange700 },
  MEDIUM: { bg: C.yellow100, text: C.yellow700 },
  LOW: { bg: C.green100, text: C.green700 },
};

const TYPE_LABELS: Record<string, string> = {
  BUG: "Fout",
  WISH: "Wens",
  BLOCKER: "Blokkade",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nieuw",
  IN_PROGRESS: "In behandeling",
  QUESTION: "Vraag",
  RESOLVED: "Opgelost",
  REJECTED: "Afgewezen",
  WITHDRAWN: "Ingetrokken",
};

const STEP_STATUS_LABELS: Record<string, string> = {
  PENDING: "Wacht",
  IN_PROGRESS: "Bezig",
  PASSED: "Geslaagd",
  FAILED: "Mislukt",
  BLOCKED: "Geblokkeerd",
};

const STEP_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PASSED: { bg: C.green100, text: C.green700 },
  FAILED: { bg: C.red100, text: C.red700 },
  BLOCKED: { bg: C.orange100, text: C.orange700 },
  IN_PROGRESS: { bg: "#dbeafe", text: "#1d4ed8" },
  PENDING: { bg: C.slate100, text: C.slate500 },
};

function el(type: any, props: any, ...children: any[]): any {
  return React.createElement(type, props, ...children);
}

function Badge(label: string, bg: string, textColor: string) {
  return el(
    View,
    {
      style: {
        ...S.badge,
        backgroundColor: bg,
        display: "flex",
        flexDirection: "row",
      },
    },
    el(Text, { style: { fontSize: 8, fontFamily: "Helvetica-Bold", color: textColor } }, label)
  );
}

function ImpactBadge(impact: string) {
  const c = IMPACT_COLORS[impact] ?? { bg: C.slate100, text: C.slate500 };
  return Badge(IMPACT_LABELS[impact] ?? impact, c.bg, c.text);
}

function StepBadge(status: string) {
  const c = STEP_STATUS_COLORS[status] ?? { bg: C.slate100, text: C.slate500 };
  return Badge(STEP_STATUS_LABELS[status] ?? status, c.bg, c.text);
}

function ProgressBar(pct: number) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = clamped >= 80 ? C.green700 : clamped >= 50 ? C.terracotta : C.red700;
  return el(
    View,
    { style: S.progressBarOuter },
    el(View, {
      style: {
        height: 6,
        width: `${clamped}%`,
        backgroundColor: color,
        borderRadius: 3,
      },
    })
  );
}

function Footer(projectName: string, phaseName: string) {
  return el(
    View,
    { style: S.footer, fixed: true },
    el(Text, {}, `${projectName} | ${phaseName}`),
    el(Text, {}, `Gegenereerd ${formatDate(new Date())}`),
    el(
      Text,
      {
        render: ({ pageNumber, totalPages }: any) =>
          `Pagina ${pageNumber} van ${totalPages}`,
        fixed: true,
      },
      null
    )
  );
}

function SectionHeader(title: string) {
  return el(Text, { style: S.sectionHeader }, title);
}

function TableHeaderRow(cells: { label: string; flex?: number }[]) {
  return el(
    View,
    { style: S.tableHeader },
    ...cells.map((c, i) =>
      el(
        Text,
        {
          key: i,
          style: { ...S.tableHeaderCell, flex: c.flex ?? 1 },
        },
        c.label
      )
    )
  );
}

function TableDataRow(
  cells: { value: string | any; flex?: number; bold?: boolean; color?: string }[],
  isAlt: boolean
) {
  return el(
    View,
    { style: [S.tableRow, isAlt ? S.tableRowAlt : {}] },
    ...cells.map((c, i) => {
      if (typeof c.value !== "string") {
        return el(View, { key: i, style: { flex: c.flex ?? 1, paddingRight: 4 } }, c.value);
      }
      return el(
        Text,
        {
          key: i,
          style: {
            ...(c.bold ? S.tableCellBold : S.tableCell),
            flex: c.flex ?? 1,
            ...(c.color ? { color: c.color } : {}),
          },
        },
        c.value
      );
    })
  );
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

function collectPhaseData(phase: any) {
  const allSteps = phase.flows.flatMap((f: any) =>
    (f.versions[0]?.runs ?? []).flatMap((r: any) => r.steps ?? [])
  );
  const allIssues = allSteps.flatMap((s: any) => s.issues ?? []);
  const passedSteps = allSteps.filter((s: any) => s.status === "PASSED");
  const failedSteps = allSteps.filter((s: any) =>
    ["FAILED", "BLOCKED"].includes(s.status)
  );
  const pendingSteps = allSteps.filter((s: any) =>
    ["PENDING", "IN_PROGRESS"].includes(s.status)
  );
  const openIssues = allIssues.filter(
    (i: any) => !["RESOLVED", "REJECTED", "WITHDRAWN"].includes(i.status)
  );
  const criticalIssues = openIssues.filter((i: any) => i.impact === "CRITICAL");

  const passedPct =
    allSteps.length > 0
      ? Math.round((passedSteps.length / allSteps.length) * 100)
      : 0;

  const flowStats = phase.flows.map((f: any) => {
    const steps = (f.versions[0]?.runs ?? []).flatMap((r: any) => r.steps ?? []);
    const passed = steps.filter((s: any) => s.status === "PASSED").length;
    const failed = steps.filter((s: any) => s.status === "FAILED").length;
    const blocked = steps.filter((s: any) => s.status === "BLOCKED").length;
    const pending = steps.filter(
      (s: any) => s.status === "PENDING" || s.status === "IN_PROGRESS"
    ).length;
    const issues = steps.flatMap((s: any) => s.issues ?? []);
    const total = steps.length;
    const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

    // Determine flow status label
    let statusLabel = "In uitvoering";
    let statusBg = "#dbeafe";
    let statusText = "#1d4ed8";
    if (total > 0 && passed === total) {
      statusLabel = "Geslaagd";
      statusBg = C.green100;
      statusText = C.green700;
    } else if (blocked > 0 || failed > 0) {
      statusLabel = failed > 0 ? "Mislukt" : "Geblokkeerd";
      statusBg = failed > 0 ? C.red100 : C.orange100;
      statusText = failed > 0 ? C.red700 : C.orange700;
    } else if (pending === total) {
      statusLabel = "Wacht";
      statusBg = C.slate100;
      statusText = C.slate500;
    }

    return {
      flow: f,
      steps,
      total,
      passed,
      failed,
      blocked,
      pending,
      issues,
      pct,
      statusLabel,
      statusBg,
      statusText,
    };
  });

  return {
    allSteps,
    allIssues,
    passedSteps,
    failedSteps,
    pendingSteps,
    openIssues,
    criticalIssues,
    passedPct,
    flowStats,
  };
}

// ─── Cover page (shared) ──────────────────────────────────────────────────────

function CoverPage(
  reportType: string,
  phase: any,
  settings: { orgName?: string | null; logoBase64?: string | null }
) {
  const phaseName = PHASE_LABELS[phase.name] ?? phase.name;
  const phaseTitle = phase.title ? `${phase.name} – ${phase.title}` : phase.name;

  return el(
    Page,
    { size: "A4", style: S.coverPage },
    el(
      View,
      { style: S.coverInner },
      el(
        View,
        { style: S.coverTop },
        // Logo or org name
        settings.logoBase64
          ? el(View, { style: S.coverLogoWrap },
              el(Image, {
                src: settings.logoBase64,
                style: { width: 120, height: 40, objectFit: "contain" },
              })
            )
          : settings.orgName
          ? el(Text, { style: S.coverOrgName }, settings.orgName)
          : null,

        // Report type badge
        el(
          View,
          { style: S.coverBadge },
          el(Text, { style: S.coverBadgeText }, reportType)
        ),

        // Phase code (FAT/GAT/PAT)
        el(Text, { style: S.coverPhaseCode }, phase.name),

        // Phase full name
        el(Text, { style: S.coverPhaseName }, phaseName),
        phase.title
          ? el(Text, {
              style: { fontSize: 11, color: C.forestLight, textAlign: "center", marginBottom: 12 },
            }, phase.title)
          : null,

        // Separator
        el(View, { style: S.coverSeparator }),

        // Project name
        el(Text, { style: S.coverProjectName }, phase.project.name),
        el(Text, { style: S.coverDate }, formatDate(new Date()))
      )
    ),
    // Bottom strip
    el(
      View,
      { style: S.coverBottom },
      el(Text, { style: S.coverBottomLeft }, settings.orgName ?? ""),
      el(
        View,
        { style: S.coverBottomBadge },
        el(Text, { style: S.coverBottomBadgeText }, "VERTROUWELIJK")
      ),
      el(Text, { style: S.coverBottomRight }, "TAAS · Rhoost")
    )
  );
}

// ─── 1. generateVoortgangsrapport ─────────────────────────────────────────────

export async function generateVoortgangsrapport(
  phase: any,
  settings: { orgName?: string | null; logoBase64?: string | null },
  criteria?: {
    goLiveDate?: Date | string | null;
    goNoGoDate?: Date | string | null;
    maxCritical?: number | null;
    maxHigh?: number | null;
    maxMedium?: number | null;
    maxLow?: number | null;
  } | null
): Promise<Buffer> {
  const {
    allSteps,
    allIssues,
    openIssues,
    criticalIssues,
    passedSteps,
    passedPct,
    flowStats,
  } = collectPhaseData(phase);

  const projectName = phase.project.name;
  const phaseName = phase.title ? `${phase.name} – ${phase.title}` : phase.name;

  // Status summary
  const statusText =
    criticalIssues.length > 0
      ? `Kritiek: ${criticalIssues.length} kritieke bevinding(en) vereisen onmiddellijke aandacht.`
      : openIssues.length > 5
      ? `Aandacht: ${openIssues.length} openstaande bevindingen, opvolging vereist.`
      : passedPct >= 80
      ? `Op schema: ${passedPct}% geslaagd, uitvoering verloopt conform planning.`
      : `In uitvoering: ${passedPct}% van de teststappen is geslaagd.`;

  const statusBg =
    criticalIssues.length > 0
      ? C.red100
      : openIssues.length > 5
      ? C.orange100
      : C.green100;
  const statusTextColor =
    criticalIssues.length > 0
      ? C.red700
      : openIssues.length > 5
      ? C.orange700
      : C.green700;

  // KPI colors
  const kpiPassedColor = passedPct >= 80 ? C.green700 : passedPct >= 50 ? C.terracotta : C.red700;
  const kpiOpenColor = openIssues.length === 0 ? C.green700 : openIssues.length > 5 ? C.red700 : C.orange700;
  const kpiCriticalColor = criticalIssues.length === 0 ? C.green700 : C.red700;

  // Page 2 – Samenvatting + KPIs
  const page2 = el(
    Page,
    { size: "A4", style: S.contentPage },
    el(View, { style: S.accentStrip }),

    SectionHeader("Samenvatting & KPI's"),

    // KPI cards
    el(
      View,
      { style: S.kpiGrid },
      el(
        View,
        { style: { ...S.kpiCard, borderLeftColor: C.forestMid } },
        el(Text, { style: { ...S.kpiValue, color: C.forestMid } }, String(allSteps.length)),
        el(Text, { style: S.kpiLabel }, "Teststappen totaal")
      ),
      el(
        View,
        { style: { ...S.kpiCard, borderLeftColor: kpiPassedColor } },
        el(Text, { style: { ...S.kpiValue, color: kpiPassedColor } }, `${passedPct}%`),
        el(Text, { style: S.kpiLabel }, "Geslaagd")
      ),
      el(
        View,
        { style: { ...S.kpiCard, borderLeftColor: kpiOpenColor } },
        el(Text, { style: { ...S.kpiValue, color: kpiOpenColor } }, String(openIssues.length)),
        el(Text, { style: S.kpiLabel }, "Open bevindingen")
      ),
      el(
        View,
        { style: { ...S.kpiCard, borderLeftColor: kpiCriticalColor } },
        el(Text, { style: { ...S.kpiValue, color: kpiCriticalColor } }, String(criticalIssues.length)),
        el(Text, { style: S.kpiLabel }, "Kritieke bevindingen")
      )
    ),

    // Overall progress bar
    el(
      View,
      { style: { marginBottom: 14 } },
      el(
        View,
        {
          style: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
          },
        },
        el(Text, { style: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.slate700 } }, "Totale voortgang teststappen"),
        el(Text, { style: { fontSize: 8, color: C.slate500 } }, `${passedSteps.length} van ${allSteps.length} stappen geslaagd`)
      ),
      el(
        View,
        { style: { ...S.progressBarOuter, height: 10, borderRadius: 5 } },
        el(View, {
          style: {
            height: 10,
            width: `${passedPct}%`,
            backgroundColor:
              passedPct >= 80 ? C.green700 : passedPct >= 50 ? C.terracotta : C.red700,
            borderRadius: 5,
          },
        })
      )
    ),

    // Status summary box
    el(
      View,
      {
        style: {
          backgroundColor: statusBg,
          borderRadius: 4,
          padding: 12,
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor: statusTextColor,
        },
      },
      el(
        Text,
        {
          style: {
            fontSize: 9,
            fontFamily: "Helvetica-Bold",
            color: statusTextColor,
            marginBottom: 3,
          },
        },
        criticalIssues.length > 0 ? "Status: KRITIEK" : openIssues.length > 5 ? "Status: AANDACHT VEREIST" : "Status: OP SCHEMA"
      ),
      el(Text, { style: { fontSize: 9, color: statusTextColor } }, statusText)
    ),

    // Issues by impact summary
    SectionHeader("Bevindingen per prioriteit"),
    el(
      View,
      { style: { flexDirection: "row", gap: 8, marginBottom: 10 } },
      ...(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((impact) => {
        const count = allIssues.filter((i: any) => i.impact === impact).length;
        const openCount = openIssues.filter((i: any) => i.impact === impact).length;
        const c = IMPACT_COLORS[impact];
        return el(
          View,
          {
            key: impact,
            style: {
              flex: 1,
              borderWidth: 1,
              borderColor: C.slate200,
              borderLeftWidth: 4,
              borderLeftColor: c.text,
              padding: 8,
              borderRadius: 4,
            },
          },
          el(
            Text,
            { style: { fontSize: 15, fontFamily: "Helvetica-Bold", color: c.text, marginBottom: 2 } },
            String(openCount)
          ),
          el(Text, { style: { fontSize: 7, color: C.slate400 } }, `Open ${IMPACT_LABELS[impact]}`),
          el(
            Text,
            { style: { fontSize: 7, color: C.slate400, marginTop: 2 } },
            `${count} totaal`
          )
        );
      })
    ),

    Footer(projectName, phaseName)
  );

  // Page 3 – Testvoortgang per flow
  const page3 = el(
    Page,
    { size: "A4", style: S.contentPage },
    el(View, { style: S.accentStrip }),

    SectionHeader("Testvoortgang per flow"),

    TableHeaderRow([
      { label: "Flow / Testronde", flex: 3 },
      { label: "Totaal", flex: 1 },
      { label: "Geslaagd", flex: 1 },
      { label: "Mislukt / Geblokkeerd", flex: 1.5 },
      { label: "Wacht", flex: 1 },
      { label: "Status", flex: 1.5 },
    ]),

    ...flowStats.map((fs: any, idx: number) =>
      el(
        View,
        { key: fs.flow.id, style: [S.tableRow, idx % 2 === 1 ? S.tableRowAlt : {}] },
        // Flow name + mini progress bar
        el(
          View,
          { style: { flex: 3, paddingRight: 4 } },
          el(Text, { style: { fontSize: 8, color: C.slate700, marginBottom: 2 } }, fs.flow.name),
          ProgressBar(fs.pct)
        ),
        el(Text, { style: { ...S.tableCell, flex: 1, textAlign: "center" } }, String(fs.total)),
        el(
          Text,
          {
            style: {
              ...S.tableCell,
              flex: 1,
              textAlign: "center",
              color: fs.passed > 0 ? C.green700 : C.slate400,
              fontFamily: "Helvetica-Bold",
            },
          },
          String(fs.passed)
        ),
        el(
          Text,
          {
            style: {
              ...S.tableCell,
              flex: 1.5,
              textAlign: "center",
              color: fs.failed + fs.blocked > 0 ? C.red700 : C.slate400,
              fontFamily: "Helvetica-Bold",
            },
          },
          `${fs.failed} / ${fs.blocked}`
        ),
        el(
          Text,
          {
            style: {
              ...S.tableCell,
              flex: 1,
              textAlign: "center",
              color: C.slate500,
            },
          },
          String(fs.pending)
        ),
        el(
          View,
          { style: { flex: 1.5, alignItems: "flex-start" } },
          Badge(fs.statusLabel, fs.statusBg, fs.statusText)
        )
      )
    ),

    Footer(projectName, phaseName)
  );

  // Page 4 – Open bevindingen
  const sortedOpenIssues = [...openIssues].sort((a: any, b: any) => {
    const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (order[a.impact] ?? 4) - (order[b.impact] ?? 4);
  });

  const page4 =
    sortedOpenIssues.length > 0
      ? el(
          Page,
          { size: "A4", style: S.contentPage },
          el(View, { style: S.accentStrip }),

          SectionHeader(`Open bevindingen (${sortedOpenIssues.length})`),

          TableHeaderRow([
            { label: "Impact", flex: 1.2 },
            { label: "Titel", flex: 3 },
            { label: "Type", flex: 1 },
            { label: "Status", flex: 1.5 },
            { label: "Stap", flex: 2 },
            { label: "Gemeld door", flex: 1.5 },
            { label: "Datum", flex: 1.2 },
          ]),

          ...sortedOpenIssues.map((issue: any, idx: number) => {
            // Find the step this issue belongs to
            const stepTitle =
              allSteps.find((s: any) =>
                (s.issues ?? []).some((i: any) => i.id === issue.id)
              )?.title ?? "—";

            return el(
              View,
              { key: issue.id, style: [S.tableRow, idx % 2 === 1 ? S.tableRowAlt : {}] },
              el(View, { style: { flex: 1.2 } }, ImpactBadge(issue.impact)),
              el(
                Text,
                { style: { ...S.tableCell, flex: 3, fontFamily: "Helvetica-Bold" } },
                issue.title
              ),
              el(Text, { style: { ...S.tableCell, flex: 1 } }, TYPE_LABELS[issue.type] ?? issue.type),
              el(Text, { style: { ...S.tableCell, flex: 1.5 } }, STATUS_LABELS[issue.status] ?? issue.status),
              el(Text, { style: { ...S.tableCell, flex: 2 } }, stepTitle),
              el(Text, { style: { ...S.tableCell, flex: 1.5 } }, issue.createdBy?.name ?? "—"),
              el(Text, { style: { ...S.tableCell, flex: 1.2 } }, formatDate(issue.createdAt))
            );
          }),

          Footer(projectName, phaseName)
        )
      : null;

  // Conditional criteria page
  let criteriaPage = null;
  if (criteria) {
    const criticalOpen = openIssues.filter((i: any) => i.impact === "CRITICAL").length;
    const highOpen = openIssues.filter((i: any) => i.impact === "HIGH").length;
    const mediumOpen = openIssues.filter((i: any) => i.impact === "MEDIUM").length;
    const lowOpen = openIssues.filter((i: any) => i.impact === "LOW").length;

    criteriaPage = el(
      Page,
      { size: "A4", style: S.contentPage },
      el(View, { style: S.accentStrip }),

      SectionHeader("Go-live criteria"),

      el(
        View,
        { style: { flexDirection: "row", gap: 12, marginBottom: 16 } },
        criteria.goLiveDate
          ? el(
              View,
              {
                style: {
                  flex: 1,
                  borderWidth: 1,
                  borderColor: C.slate200,
                  padding: 10,
                  borderRadius: 4,
                },
              },
              el(Text, { style: { fontSize: 7.5, color: C.slate400, marginBottom: 4 } }, "Go-live datum"),
              el(
                Text,
                { style: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.forestDark } },
                formatDate(criteria.goLiveDate)
              )
            )
          : null,
        criteria.goNoGoDate
          ? el(
              View,
              {
                style: {
                  flex: 1,
                  borderWidth: 1,
                  borderColor: C.slate200,
                  padding: 10,
                  borderRadius: 4,
                },
              },
              el(Text, { style: { fontSize: 7.5, color: C.slate400, marginBottom: 4 } }, "Go/No-Go datum"),
              el(
                Text,
                { style: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.forestDark } },
                formatDate(criteria.goNoGoDate)
              )
            )
          : null
      ),

      TableHeaderRow([
        { label: "Impact", flex: 1.5 },
        { label: "Max. toegestaan", flex: 1.5 },
        { label: "Huidig aantal open", flex: 1.5 },
        { label: "Resultaat", flex: 1 },
      ]),

      ...(
        [
          { label: "CRITICAL", max: criteria.maxCritical, current: criticalOpen },
          { label: "HIGH", max: criteria.maxHigh, current: highOpen },
          { label: "MEDIUM", max: criteria.maxMedium, current: mediumOpen },
          { label: "LOW", max: criteria.maxLow, current: lowOpen },
        ] as const
      )
        .filter((row) => row.max !== null && row.max !== undefined)
        .map((row, idx) => {
          const ok = (row.current ?? 0) <= (row.max ?? 999);
          return TableDataRow(
            [
              { value: ImpactBadge(row.label), flex: 1.5 },
              { value: String(row.max ?? "—"), flex: 1.5 },
              {
                value: String(row.current),
                flex: 1.5,
                bold: true,
                color: ok ? C.green700 : C.red700,
              },
              {
                value: ok ? "Akkoord" : "NIET akkoord",
                flex: 1,
                bold: true,
                color: ok ? C.green700 : C.red700,
              },
            ],
            idx % 2 === 1
          );
        }),

      Footer(projectName, phaseName)
    );
  }

  const pages = [
    CoverPage("VOORTGANGSRAPPORT", phase, settings),
    page2,
    page3,
    page4,
    criteriaPage,
  ].filter(Boolean);

  const doc = el(Document, {}, ...pages);
  return renderToBuffer(doc);
}

// ─── 2. generateOpleververslag ────────────────────────────────────────────────

export async function generateOpleververslag(
  phase: any,
  settings: { orgName?: string | null; logoBase64?: string | null },
  criteria?: {
    goLiveDate?: Date | string | null;
    goNoGoDate?: Date | string | null;
    maxCritical?: number | null;
    maxHigh?: number | null;
    maxMedium?: number | null;
    maxLow?: number | null;
  } | null
): Promise<Buffer> {
  const {
    allSteps,
    allIssues,
    openIssues,
    criticalIssues,
    passedSteps,
    failedSteps,
    passedPct,
    flowStats,
  } = collectPhaseData(phase);

  const projectName = phase.project.name;
  const phaseName = phase.title ? `${phase.name} – ${phase.title}` : phase.name;
  const phaseLongName = PHASE_LABELS[phase.name] ?? phase.name;

  const resolvedIssues = allIssues.filter((i: any) =>
    ["RESOLVED"].includes(i.status)
  );
  const resolvedPct =
    allIssues.length > 0
      ? Math.round((resolvedIssues.length / allIssues.length) * 100)
      : 100;

  const testers = Array.from(
    new Set(
      allSteps.flatMap((s: any) =>
        (s.assignees ?? []).map((a: any) => a.user?.name).filter(Boolean)
      )
    )
  ) as string[];

  // Go/No-Go verdict
  const isGo =
    criticalIssues.length === 0 &&
    openIssues.filter((i: any) => i.type === "BLOCKER").length === 0;

  // ─── Page 2 – Projectinformatie & Scope ───────────────────────────────────
  const page2 = el(
    Page,
    { size: "A4", style: S.contentPage },
    el(View, { style: S.accentStrip }),

    SectionHeader("Projectinformatie & Scope"),

    el(
      View,
      { style: { flexDirection: "row", gap: 16, marginBottom: 16 } },
      // Left: project details
      el(
        View,
        {
          style: {
            flex: 1,
            borderWidth: 1,
            borderColor: C.slate200,
            padding: 12,
            borderRadius: 4,
          },
        },
        el(
          Text,
          { style: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.forestDark, marginBottom: 10 } },
          "Projectgegevens"
        ),
        ...(
          [
            ["Project", projectName],
            ["Fase", `${phase.name} – ${phaseLongName}`],
            phase.title ? ["Ondertitel", phase.title] : null,
            ["Status", phase.status],
            ["Startdatum", formatDate(phase.startDate)],
            ["Einddatum", formatDate(phase.endDate)],
            settings.orgName ? ["Organisatie", settings.orgName] : null,
          ] as (string[] | null)[]
        )
          .filter(Boolean)
          .map((row, i) =>
            el(
              View,
              {
                key: i,
                style: {
                  flexDirection: "row",
                  marginBottom: 5,
                  paddingBottom: 5,
                  borderBottomWidth: 1,
                  borderBottomColor: C.slate100,
                },
              },
              el(
                Text,
                { style: { width: 80, fontSize: 8, color: C.slate400, fontFamily: "Helvetica-Bold" } },
                row![0]
              ),
              el(Text, { style: { flex: 1, fontSize: 8, color: C.slate700 } }, row![1])
            )
          )
      ),
      // Right: scope
      el(
        View,
        {
          style: {
            flex: 1,
            borderWidth: 1,
            borderColor: C.slate200,
            padding: 12,
            borderRadius: 4,
          },
        },
        el(
          Text,
          { style: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.forestDark, marginBottom: 10 } },
          "Scope & omvang"
        ),
        ...(
          [
            ["Aantal flows", String(phase.flows.length)],
            ["Teststappen totaal", String(allSteps.length)],
            ["Bevindingen totaal", String(allIssues.length)],
            ["Open bevindingen", String(openIssues.length)],
            ["Testers betrokken", String(testers.length)],
          ] as string[][]
        ).map((row, i) =>
          el(
            View,
            {
              key: i,
              style: {
                flexDirection: "row",
                marginBottom: 5,
                paddingBottom: 5,
                borderBottomWidth: 1,
                borderBottomColor: C.slate100,
              },
            },
            el(
              Text,
              { style: { flex: 1, fontSize: 8, color: C.slate400, fontFamily: "Helvetica-Bold" } },
              row[0]
            ),
            el(
              Text,
              { style: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.slate700 } },
              row[1]
            )
          )
        ),
        testers.length > 0
          ? el(
              View,
              { style: { marginTop: 8 } },
              el(
                Text,
                { style: { fontSize: 8, color: C.slate400, fontFamily: "Helvetica-Bold", marginBottom: 4 } },
                "Testers"
              ),
              ...testers.map((t: string, i: number) =>
                el(
                  Text,
                  { key: i, style: { fontSize: 8, color: C.slate700, marginBottom: 2 } },
                  `• ${t}`
                )
              )
            )
          : null
      )
    ),

    // Summary paragraph
    el(
      View,
      {
        style: {
          backgroundColor: C.slate50,
          borderRadius: 4,
          padding: 12,
          borderLeftWidth: 4,
          borderLeftColor: C.forestMid,
        },
      },
      el(
        Text,
        { style: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.forestDark, marginBottom: 6 } },
        "Samenvatting"
      ),
      el(
        Text,
        { style: { fontSize: 8.5, color: C.slate700, lineHeight: 1.6 } },
        `Dit opleververslag beschrijft de testresultaten van de ${phaseLongName} voor project ${projectName}. ` +
          `In totaal zijn ${allSteps.length} teststappen uitgevoerd verdeeld over ${phase.flows.length} testflows. ` +
          `Van de uitgevoerde stappen is ${passedPct}% succesvol geslaagd. ` +
          `Er zijn ${allIssues.length} bevindingen geregistreerd, waarvan ${openIssues.length} nog openstaand. ` +
          (criticalIssues.length > 0
            ? `Er zijn ${criticalIssues.length} kritieke bevindingen die aandacht vereisen. `
            : `Er zijn geen kritieke openstaande bevindingen. `) +
          `Het advies luidt: ${isGo ? "GO — de fase voldoet aan de acceptatiecriteria." : "NO-GO — er zijn openstaande blokkades of kritieke bevindingen."}`
      )
    ),

    Footer(projectName, phaseName)
  );

  // ─── Page 3 – Executive Samenvatting ─────────────────────────────────────
  const page3 = el(
    Page,
    { size: "A4", style: S.contentPage },
    el(View, { style: S.accentStrip }),

    SectionHeader("Executive Samenvatting"),

    // Big KPI cards
    el(
      View,
      { style: { flexDirection: "row", gap: 10, marginBottom: 16 } },
      el(
        View,
        {
          style: {
            flex: 1,
            backgroundColor: passedPct >= 80 ? C.green100 : passedPct >= 50 ? C.orange100 : C.red100,
            borderRadius: 6,
            padding: 16,
            alignItems: "center",
          },
        },
        el(
          Text,
          {
            style: {
              fontSize: 36,
              fontFamily: "Helvetica-Bold",
              color: passedPct >= 80 ? C.green700 : passedPct >= 50 ? C.orange700 : C.red700,
              marginBottom: 4,
            },
          },
          `${passedPct}%`
        ),
        el(
          Text,
          {
            style: {
              fontSize: 9,
              fontFamily: "Helvetica-Bold",
              color: passedPct >= 80 ? C.green700 : passedPct >= 50 ? C.orange700 : C.red700,
            },
          },
          "Stappen geslaagd"
        ),
        el(
          Text,
          { style: { fontSize: 8, color: C.slate500, marginTop: 4 } },
          `${passedSteps.length} van ${allSteps.length}`
        )
      ),
      el(
        View,
        {
          style: {
            flex: 1,
            backgroundColor: resolvedPct >= 80 ? C.green100 : C.orange100,
            borderRadius: 6,
            padding: 16,
            alignItems: "center",
          },
        },
        el(
          Text,
          {
            style: {
              fontSize: 36,
              fontFamily: "Helvetica-Bold",
              color: resolvedPct >= 80 ? C.green700 : C.orange700,
              marginBottom: 4,
            },
          },
          `${resolvedPct}%`
        ),
        el(
          Text,
          {
            style: {
              fontSize: 9,
              fontFamily: "Helvetica-Bold",
              color: resolvedPct >= 80 ? C.green700 : C.orange700,
            },
          },
          "Bevindingen opgelost"
        ),
        el(
          Text,
          { style: { fontSize: 8, color: C.slate500, marginTop: 4 } },
          `${resolvedIssues.length} van ${allIssues.length}`
        )
      ),
      el(
        View,
        {
          style: {
            flex: 1,
            backgroundColor: openIssues.length === 0 ? C.green100 : criticalIssues.length > 0 ? C.red100 : C.orange100,
            borderRadius: 6,
            padding: 16,
            alignItems: "center",
          },
        },
        el(
          Text,
          {
            style: {
              fontSize: 36,
              fontFamily: "Helvetica-Bold",
              color: openIssues.length === 0 ? C.green700 : criticalIssues.length > 0 ? C.red700 : C.orange700,
              marginBottom: 4,
            },
          },
          String(openIssues.length)
        ),
        el(
          Text,
          {
            style: {
              fontSize: 9,
              fontFamily: "Helvetica-Bold",
              color: openIssues.length === 0 ? C.green700 : criticalIssues.length > 0 ? C.red700 : C.orange700,
            },
          },
          "Open bevindingen"
        ),
        el(
          Text,
          { style: { fontSize: 8, color: C.slate500, marginTop: 4 } },
          `${criticalIssues.length} kritiek`
        )
      )
    ),

    // Go/No-Go preview
    el(
      View,
      {
        style: {
          backgroundColor: isGo ? C.green100 : C.red100,
          borderRadius: 6,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
        },
      },
      el(
        Text,
        {
          style: {
            fontSize: 32,
            fontFamily: "Helvetica-Bold",
            color: isGo ? C.green700 : C.red700,
          },
        },
        isGo ? "GO" : "NO-GO"
      ),
      el(
        View,
        { style: { flex: 1 } },
        el(
          Text,
          {
            style: {
              fontSize: 11,
              fontFamily: "Helvetica-Bold",
              color: isGo ? C.green700 : C.red700,
              marginBottom: 4,
            },
          },
          isGo ? "Fase gereed voor acceptatie" : "Fase vereist aanvullende actie"
        ),
        el(
          Text,
          { style: { fontSize: 8.5, color: isGo ? C.green700 : C.red700, lineHeight: 1.5 } },
          isGo
            ? `Alle teststappen zijn doorlopen, er zijn geen open blokkades of kritieke bevindingen. De ${phaseLongName} kan worden geaccepteerd.`
            : `Er zijn ${openIssues.filter((i: any) => i.type === "BLOCKER").length} open blokkade(s) en ${criticalIssues.length} kritieke bevinding(en). De fase voldoet nog niet aan de acceptatiecriteria.`
        )
      )
    ),

    // Failed/blocked summary
    failedSteps.length > 0
      ? el(
          View,
          { style: { marginBottom: 10 } },
          el(
            Text,
            { style: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.slate700, marginBottom: 6 } },
            `Niet-geslaagde stappen (${failedSteps.length})`
          ),
          ...failedSteps.slice(0, 8).map((s: any, i: number) =>
            el(
              View,
              {
                key: i,
                style: {
                  flexDirection: "row",
                  paddingVertical: 4,
                  borderBottomWidth: 1,
                  borderBottomColor: C.slate100,
                  alignItems: "center",
                  gap: 8,
                },
              },
              StepBadge(s.status),
              el(
                Text,
                { style: { flex: 1, fontSize: 8, color: C.slate700 } },
                s.title
              )
            )
          ),
          failedSteps.length > 8
            ? el(
                Text,
                { style: { fontSize: 8, color: C.slate400, marginTop: 4 } },
                `... en ${failedSteps.length - 8} meer`
              )
            : null
        )
      : null,

    Footer(projectName, phaseName)
  );

  // ─── Pages 4+ – Testresultaten per flow ──────────────────────────────────
  const flowPages = flowStats.map((fs: any) => {
    const runs = fs.flow.versions[0]?.runs ?? [];
    return el(
      Page,
      { key: fs.flow.id, size: "A4", style: S.contentPage },
      el(View, { style: S.accentStrip }),

      // Flow header
      el(
        View,
        {
          style: {
            backgroundColor: C.forestMid,
            paddingHorizontal: 10,
            paddingVertical: 8,
            marginBottom: 0,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        },
        el(
          View,
          {},
          el(
            Text,
            { style: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.white } },
            fs.flow.name
          ),
          el(
            Text,
            { style: { fontSize: 8, color: C.forestLight, marginTop: 2 } },
            `${fs.total} stappen · ${fs.passed} geslaagd · ${fs.failed + fs.blocked} mislukt/geblokkeerd · ${fs.issues.length} bevindingen`
          )
        ),
        el(
          View,
          { style: { alignItems: "flex-end" } },
          Badge(fs.statusLabel, fs.statusBg, fs.statusText),
          el(
            View,
            { style: { width: 80, marginTop: 4 } },
            ProgressBar(fs.pct)
          )
        )
      ),

      // Steps table
      TableHeaderRow([
        { label: "Nr.", flex: 0.5 },
        { label: "Teststap", flex: 4 },
        { label: "Tester", flex: 1.5 },
        { label: "Resultaat", flex: 1.5 },
        { label: "Datum", flex: 1.2 },
      ]),

      ...fs.steps.map((step: any, idx: number) => {
        const tester =
          (step.assignees ?? [])
            .map((a: any) => a.user?.name)
            .filter(Boolean)
            .join(", ") || "—";
        const stepIssues = (step.issues ?? []).filter(
          (i: any) => !["RESOLVED", "REJECTED", "WITHDRAWN"].includes(i.status)
        );
        const sc = STEP_STATUS_COLORS[step.status] ?? { bg: C.slate100, text: C.slate500 };

        return el(
          View,
          { key: step.id },
          el(
            View,
            { style: [S.tableRow, idx % 2 === 1 ? S.tableRowAlt : {}] },
            el(
              Text,
              { style: { ...S.tableCell, flex: 0.5, color: C.slate400 } },
              String(step.order ?? idx + 1)
            ),
            el(
              View,
              { style: { flex: 4, paddingRight: 4 } },
              el(Text, { style: { fontSize: 8, color: C.slate700 } }, step.title),
              step.notes
                ? el(
                    Text,
                    { style: { fontSize: 7.5, color: C.slate400, marginTop: 2 } },
                    step.notes
                  )
                : null
            ),
            el(Text, { style: { ...S.tableCell, flex: 1.5 } }, tester),
            el(
              View,
              { style: { flex: 1.5 } },
              Badge(
                STEP_STATUS_LABELS[step.status] ?? step.status,
                sc.bg,
                sc.text
              )
            ),
            el(
              Text,
              { style: { ...S.tableCell, flex: 1.2 } },
              formatDate(step.doneAt)
            )
          ),
          // Sub-rows for open issues
          ...stepIssues.map((issue: any, ii: number) =>
            el(
              View,
              {
                key: issue.id,
                style: {
                  flexDirection: "row",
                  backgroundColor: "#fffbf7",
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  borderLeftWidth: 3,
                  borderLeftColor: C.terracotta,
                  borderBottomWidth: 1,
                  borderBottomColor: C.slate100,
                  gap: 6,
                },
              },
              el(View, { style: { width: 50 } }, ImpactBadge(issue.impact)),
              el(
                Text,
                { style: { fontSize: 7.5, color: C.slate700, fontFamily: "Helvetica-Bold", flex: 3 } },
                issue.title
              ),
              el(
                Text,
                { style: { fontSize: 7.5, color: C.slate500, flex: 1 } },
                TYPE_LABELS[issue.type] ?? issue.type
              ),
              el(
                Text,
                { style: { fontSize: 7.5, color: C.slate500, flex: 1 } },
                STATUS_LABELS[issue.status] ?? issue.status
              )
            )
          )
        );
      }),

      Footer(projectName, phaseName)
    );
  });

  // ─── Issues section ────────────────────────────────────────────────────────
  const issueGroups = [
    {
      label: "Open bevindingen",
      statuses: ["NEW", "IN_PROGRESS", "QUESTION"],
      color: C.red700,
    },
    { label: "Opgeloste bevindingen", statuses: ["RESOLVED"], color: C.green700 },
    { label: "Afgewezen bevindingen", statuses: ["REJECTED", "WITHDRAWN"], color: C.slate500 },
  ];

  const issuePages = issueGroups
    .map((group) => {
      const groupIssues = allIssues.filter((i: any) => group.statuses.includes(i.status));
      if (groupIssues.length === 0) return null;

      const sorted = [...groupIssues].sort((a: any, b: any) => {
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (order[a.impact] ?? 4) - (order[b.impact] ?? 4);
      });

      return el(
        Page,
        { size: "A4", style: S.contentPage },
        el(View, { style: S.accentStrip }),

        el(
          View,
          {
            style: {
              ...S.sectionHeader as any,
              borderLeftWidth: 4,
              borderLeftColor: group.color,
              marginBottom: 10,
            },
          },
          el(Text, {}, `${group.label} (${groupIssues.length})`)
        ),

        TableHeaderRow([
          { label: "Impact", flex: 1.2 },
          { label: "Titel", flex: 3 },
          { label: "Type", flex: 1 },
          { label: "Status", flex: 1.3 },
          { label: "Gemeld door", flex: 1.5 },
          { label: "Datum", flex: 1.2 },
        ]),

        ...sorted.flatMap((issue: any, idx: number) => {
          const isOpen = group.statuses.includes("NEW") || group.statuses.includes("IN_PROGRESS");
          const rows = [
            TableDataRow(
              [
                { value: ImpactBadge(issue.impact), flex: 1.2 },
                { value: issue.title, flex: 3, bold: true },
                { value: TYPE_LABELS[issue.type] ?? issue.type, flex: 1 },
                { value: STATUS_LABELS[issue.status] ?? issue.status, flex: 1.3 },
                { value: issue.createdBy?.name ?? "—", flex: 1.5 },
                { value: formatDate(issue.createdAt), flex: 1.2 },
              ],
              idx % 2 === 1
            ),
          ];

          if (isOpen && issue.description) {
            rows.push(
              el(
                View,
                {
                  key: `${issue.id}-desc`,
                  style: {
                    backgroundColor: "#fffbf7",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: C.slate100,
                    borderLeftWidth: 3,
                    borderLeftColor: C.terracotta,
                  },
                },
                el(
                  Text,
                  { style: { fontSize: 8, color: C.slate700, lineHeight: 1.5 } },
                  issue.description
                ),
                issue.hasWorkaround && issue.workaroundNote
                  ? el(
                      Text,
                      { style: { fontSize: 8, color: C.green700, marginTop: 4, fontFamily: "Helvetica-Bold" } },
                      `Workaround: ${issue.workaroundNote}`
                    )
                  : issue.hasWorkaround
                  ? el(
                      Text,
                      { style: { fontSize: 8, color: C.green700, marginTop: 4 } },
                      "Workaround beschikbaar"
                    )
                  : null
              )
            );
          }

          return rows;
        }),

        Footer(projectName, phaseName)
      );
    })
    .filter(Boolean);

  // ─── Go/No-Go assessment page ─────────────────────────────────────────────
  const criticalOpen = openIssues.filter((i: any) => i.impact === "CRITICAL").length;
  const highOpen = openIssues.filter((i: any) => i.impact === "HIGH").length;
  const highWithoutWorkaround = openIssues.filter(
    (i: any) => i.impact === "HIGH" && !i.hasWorkaround
  ).length;
  const openBlockers = openIssues.filter((i: any) => i.type === "BLOCKER").length;

  const goNoGoPage = el(
    Page,
    { size: "A4", style: S.contentPage },
    el(View, { style: S.accentStrip }),

    SectionHeader("Go/No-Go Beoordeling"),

    // Big verdict
    el(
      View,
      {
        style: {
          backgroundColor: isGo ? C.green100 : C.red100,
          borderRadius: 8,
          padding: 24,
          alignItems: "center",
          marginBottom: 20,
        },
      },
      el(
        Text,
        {
          style: {
            fontSize: 48,
            fontFamily: "Helvetica-Bold",
            color: isGo ? C.green700 : C.red700,
            textAlign: "center",
            marginBottom: 8,
          },
        },
        isGo ? "GO" : "NO-GO"
      ),
      el(
        Text,
        {
          style: {
            fontSize: 12,
            fontFamily: "Helvetica-Bold",
            color: isGo ? C.green700 : C.red700,
            textAlign: "center",
            marginBottom: 6,
          },
        },
        isGo
          ? "Fase is gereed voor acceptatie en go-live"
          : "Fase voldoet NIET aan de acceptatiecriteria"
      ),
      el(
        Text,
        {
          style: {
            fontSize: 9,
            color: isGo ? C.green700 : C.red700,
            textAlign: "center",
            lineHeight: 1.5,
          },
        },
        isGo
          ? `De ${PHASE_LABELS[phase.name] ?? phase.name} voor ${projectName} is succesvol afgerond. Alle acceptatiecriteria zijn behaald.`
          : `Er zijn ${openBlockers} open blokkade(s) en ${criticalOpen} kritieke bevinding(en) die afgehandeld moeten worden voordat de fase geaccepteerd kan worden.`
      )
    ),

    // Criteria checklist
    SectionHeader("Acceptatiecriteria checklist"),

    TableHeaderRow([
      { label: "Criterium", flex: 3 },
      { label: "Uitkomst", flex: 1 },
      { label: "Detail", flex: 2 },
    ]),

    ...(
      [
        {
          label: "Geen open BLOCKER issues",
          ok: openBlockers === 0,
          detail: `${openBlockers} open blokkade(s)`,
        },
        {
          label: "Geen open KRITIEKE issues",
          ok: criticalOpen === 0,
          detail: `${criticalOpen} kritieke issue(s)`,
        },
        {
          label: "Hoge issues hebben workaround",
          ok: highWithoutWorkaround === 0,
          detail: `${highWithoutWorkaround} hoge issue(s) zonder workaround`,
        },
        {
          label: "Minimaal 80% teststappen geslaagd",
          ok: passedPct >= 80,
          detail: `${passedPct}% geslaagd (${passedSteps.length}/${allSteps.length})`,
        },
        ...(criteria
          ? [
              criteria.maxCritical !== null && criteria.maxCritical !== undefined
                ? {
                    label: `Max. ${criteria.maxCritical} kritieke bevindingen`,
                    ok: criticalOpen <= criteria.maxCritical,
                    detail: `${criticalOpen} open (max ${criteria.maxCritical})`,
                  }
                : null,
              criteria.maxHigh !== null && criteria.maxHigh !== undefined
                ? {
                    label: `Max. ${criteria.maxHigh} hoge bevindingen`,
                    ok: highOpen <= criteria.maxHigh,
                    detail: `${highOpen} open (max ${criteria.maxHigh})`,
                  }
                : null,
            ].filter(Boolean)
          : []),
      ] as { label: string; ok: boolean; detail: string }[]
    ).map((row, idx) =>
      TableDataRow(
        [
          { value: row.label, flex: 3 },
          {
            value: row.ok ? "Akkoord" : "NIET akkoord",
            flex: 1,
            bold: true,
            color: row.ok ? C.green700 : C.red700,
          },
          { value: row.detail, flex: 2, color: row.ok ? C.slate500 : C.red700 },
        ],
        idx % 2 === 1
      )
    ),

    Footer(projectName, phaseName)
  );

  // ─── Sign-off page ────────────────────────────────────────────────────────
  const signOffPage = el(
    Page,
    { size: "A4", style: S.contentPage },
    el(View, { style: S.accentStrip }),

    SectionHeader("Akkoord & Handtekening"),

    el(
      Text,
      {
        style: {
          fontSize: 9,
          color: C.slate500,
          marginBottom: 16,
          lineHeight: 1.5,
        },
      },
      `Met ondertekening van dit opleververslag verklaren de ondergetekenden dat de ${PHASE_LABELS[phase.name] ?? phase.name} voor project ${projectName} is beoordeeld en dat het advies "${isGo ? "GO" : "NO-GO"}" wordt geaccordeerd.`
    ),

    el(
      View,
      { style: S.signOffGrid },
      ...(
        [
          "Projectleider",
          "Functioneel Beheerder",
          "Tester Lead",
          "Klant / Opdrachtgever",
        ] as const
      ).map((role, i) =>
        el(
          View,
          { key: i, style: S.signOffBox },
          el(Text, { style: S.signOffTitle }, role),
          ...(["Naam", "Functie", "Datum", "Handtekening"] as const).map((field, j) =>
            el(
              View,
              { key: j, style: { marginBottom: 16 } },
              el(View, { style: S.signOffLine }),
              el(Text, { style: S.signOffLineLabel }, field)
            )
          )
        )
      )
    ),

    // Stamp area
    el(
      View,
      {
        style: {
          marginTop: 24,
          borderWidth: 1,
          borderColor: C.slate200,
          borderStyle: "dashed",
          borderRadius: 4,
          padding: 16,
          alignItems: "center",
        },
      },
      el(
        Text,
        { style: { fontSize: 8.5, color: C.slate400, textAlign: "center" } },
        "Stempel organisatie"
      )
    ),

    Footer(projectName, phaseName)
  );

  const pages = [
    CoverPage("OPLEVERVERSLAG", phase, settings),
    page2,
    page3,
    ...flowPages,
    ...issuePages,
    goNoGoPage,
    signOffPage,
  ].filter(Boolean);

  const doc = el(Document, {}, ...pages);
  return renderToBuffer(doc);
}

// ─── 3. generateIssueLogReport ────────────────────────────────────────────────

export async function generateIssueLogReport(
  issues: any[],
  projectName: string
): Promise<Buffer> {
  const openCount = issues.filter(
    (i) => !["RESOLVED", "REJECTED", "WITHDRAWN"].includes(i.status)
  ).length;

  const sorted = [...issues].sort((a, b) => {
    const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (order[a.impact] ?? 4) - (order[b.impact] ?? 4);
  });

  // Summary KPIs
  const criticalCount = issues.filter((i) => i.impact === "CRITICAL").length;
  const highCount = issues.filter((i) => i.impact === "HIGH").length;
  const mediumCount = issues.filter((i) => i.impact === "MEDIUM").length;
  const lowCount = issues.filter((i) => i.impact === "LOW").length;

  const doc = el(
    Document,
    {},
    el(
      Page,
      { size: "A4", style: S.contentPage },
      el(View, { style: S.accentStrip }),

      // Header block
      el(
        View,
        {
          style: {
            backgroundColor: C.forestDark,
            marginHorizontal: -40,
            marginTop: -40,
            paddingHorizontal: 44,
            paddingVertical: 18,
            marginBottom: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          },
        },
        el(
          View,
          {},
          el(
            Text,
            { style: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 4 } },
            "Issue Log"
          ),
          el(
            Text,
            { style: { fontSize: 10, color: C.forestLight } },
            projectName
          )
        ),
        el(
          View,
          { style: { alignItems: "flex-end" } },
          el(Text, { style: { fontSize: 8, color: C.slate400 } }, `${issues.length} bevindingen totaal`),
          el(
            Text,
            { style: { fontSize: 8, color: C.terracottaLight, marginTop: 2 } },
            `${openCount} openstaand`
          ),
          el(Text, { style: { fontSize: 8, color: C.slate400, marginTop: 2 } }, `Gegenereerd ${formatDate(new Date())}`)
        )
      ),

      // KPI grid
      el(
        View,
        { style: S.kpiGrid },
        el(
          View,
          { style: { ...S.kpiCard, borderLeftColor: IMPACT_COLORS.CRITICAL.text } },
          el(
            Text,
            { style: { ...S.kpiValue, color: IMPACT_COLORS.CRITICAL.text } },
            String(criticalCount)
          ),
          el(Text, { style: S.kpiLabel }, "Kritiek")
        ),
        el(
          View,
          { style: { ...S.kpiCard, borderLeftColor: IMPACT_COLORS.HIGH.text } },
          el(
            Text,
            { style: { ...S.kpiValue, color: IMPACT_COLORS.HIGH.text } },
            String(highCount)
          ),
          el(Text, { style: S.kpiLabel }, "Hoog")
        ),
        el(
          View,
          { style: { ...S.kpiCard, borderLeftColor: IMPACT_COLORS.MEDIUM.text } },
          el(
            Text,
            { style: { ...S.kpiValue, color: IMPACT_COLORS.MEDIUM.text } },
            String(mediumCount)
          ),
          el(Text, { style: S.kpiLabel }, "Middel")
        ),
        el(
          View,
          { style: { ...S.kpiCard, borderLeftColor: IMPACT_COLORS.LOW.text } },
          el(
            Text,
            { style: { ...S.kpiValue, color: IMPACT_COLORS.LOW.text } },
            String(lowCount)
          ),
          el(Text, { style: S.kpiLabel }, "Laag")
        ),
        el(
          View,
          { style: { ...S.kpiCard, borderLeftColor: C.slate400 } },
          el(
            Text,
            { style: { ...S.kpiValue, color: openCount > 0 ? C.orange700 : C.green700 } },
            String(openCount)
          ),
          el(Text, { style: S.kpiLabel }, "Open")
        )
      ),

      // Table
      TableHeaderRow([
        { label: "Impact", flex: 1.2 },
        { label: "Titel", flex: 3 },
        { label: "Type", flex: 1 },
        { label: "Status", flex: 1.3 },
        { label: "Workaround", flex: 1 },
        { label: "Gemeld door", flex: 1.5 },
        { label: "Aangemaakt", flex: 1.2 },
      ]),

      ...sorted.flatMap((issue, idx) => {
        const rows: any[] = [
          TableDataRow(
            [
              { value: ImpactBadge(issue.impact), flex: 1.2 },
              { value: issue.title, flex: 3, bold: true },
              { value: TYPE_LABELS[issue.type] ?? issue.type, flex: 1 },
              { value: STATUS_LABELS[issue.status] ?? issue.status, flex: 1.3 },
              {
                value: issue.hasWorkaround ? "Ja" : "Nee",
                flex: 1,
                color: issue.hasWorkaround ? C.green700 : C.slate400,
              },
              { value: issue.createdBy?.name ?? "—", flex: 1.5 },
              { value: formatDate(issue.createdAt), flex: 1.2 },
            ],
            idx % 2 === 1
          ),
        ];

        if (issue.description) {
          rows.push(
            el(
              View,
              {
                key: `${issue.id}-desc`,
                style: {
                  backgroundColor: "#fffbf7",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderBottomWidth: 1,
                  borderBottomColor: C.slate100,
                  borderLeftWidth: 3,
                  borderLeftColor: C.terracotta,
                },
              },
              el(
                Text,
                { style: { fontSize: 7.5, color: C.slate700, lineHeight: 1.5 } },
                issue.description
              )
            )
          );
        }

        return rows;
      }),

      // Footer
      el(
        View,
        { style: S.footer, fixed: true },
        el(Text, {}, `Issue Log | ${projectName}`),
        el(Text, {}, `Gegenereerd ${formatDate(new Date())}`),
        el(
          Text,
          {
            render: ({ pageNumber, totalPages }: any) =>
              `Pagina ${pageNumber} van ${totalPages}`,
            fixed: true,
          },
          null
        )
      )
    )
  );

  return renderToBuffer(doc);
}

// ─── 4. generateGoNoGoReport ──────────────────────────────────────────────────

export async function generateGoNoGoReport(phase: any): Promise<Buffer> {
  const {
    allSteps,
    allIssues,
    openIssues,
    criticalIssues,
    passedSteps,
    failedSteps,
    passedPct,
  } = collectPhaseData(phase);

  const projectName = phase.project.name;
  const phaseName = phase.title ? `${phase.name} – ${phase.title}` : phase.name;

  const openBlockers = openIssues.filter((i: any) => i.type === "BLOCKER");
  const highWithoutWorkaround = openIssues.filter(
    (i: any) => i.impact === "HIGH" && !i.hasWorkaround
  );
  const isGo =
    openBlockers.length === 0 && criticalIssues.length === 0 && highWithoutWorkaround.length === 0;

  const resolvedIssues = allIssues.filter((i: any) => i.status === "RESOLVED");

  const doc = el(
    Document,
    {},
    el(
      Page,
      { size: "A4", style: S.contentPage },
      el(View, { style: S.accentStrip }),

      // Header block
      el(
        View,
        {
          style: {
            backgroundColor: C.forestDark,
            marginHorizontal: -40,
            marginTop: -40,
            paddingHorizontal: 44,
            paddingVertical: 18,
            marginBottom: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          },
        },
        el(
          View,
          {},
          el(
            Text,
            { style: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 4 } },
            "Go/No-Go Samenvatting"
          ),
          el(
            Text,
            { style: { fontSize: 10, color: C.forestLight } },
            `${projectName} | ${phaseName}`
          )
        ),
        el(
          Text,
          { style: { fontSize: 8, color: C.slate400 } },
          `Gegenereerd ${formatDate(new Date())}`
        )
      ),

      // GO/NO-GO verdict
      el(
        View,
        {
          style: {
            backgroundColor: isGo ? C.green100 : C.red100,
            borderRadius: 8,
            padding: 24,
            alignItems: "center",
            marginBottom: 20,
            borderWidth: 2,
            borderColor: isGo ? C.green700 : C.red700,
          },
        },
        el(
          Text,
          {
            style: {
              fontSize: 52,
              fontFamily: "Helvetica-Bold",
              color: isGo ? C.green700 : C.red700,
              textAlign: "center",
              marginBottom: 8,
              letterSpacing: 3,
            },
          },
          isGo ? "GO" : "NO-GO"
        ),
        el(
          Text,
          {
            style: {
              fontSize: 12,
              fontFamily: "Helvetica-Bold",
              color: isGo ? C.green700 : C.red700,
              textAlign: "center",
              marginBottom: 6,
            },
          },
          isGo
            ? "Fase kan worden geaccepteerd"
            : "Fase voldoet niet aan acceptatiecriteria"
        ),
        el(
          Text,
          {
            style: {
              fontSize: 9,
              color: isGo ? C.green700 : C.red700,
              textAlign: "center",
              lineHeight: 1.5,
            },
          },
          isGo
            ? `Er zijn geen open blokkades of kritieke bevindingen. De ${PHASE_LABELS[phase.name] ?? phase.name} voor ${projectName} voldoet aan alle acceptatiecriteria.`
            : `${openBlockers.length} blokkade(s), ${criticalIssues.length} kritieke issue(s) en ${highWithoutWorkaround.length} hoge issue(s) zonder workaround vereisen afhandeling.`
        )
      ),

      // KPI row
      el(
        View,
        { style: { ...S.kpiGrid, marginBottom: 16 } },
        el(
          View,
          { style: { ...S.kpiCard, borderLeftColor: passedPct >= 80 ? C.green700 : C.orange700 } },
          el(
            Text,
            { style: { ...S.kpiValue, color: passedPct >= 80 ? C.green700 : C.orange700 } },
            `${passedPct}%`
          ),
          el(Text, { style: S.kpiLabel }, "Stappen geslaagd"),
          el(
            Text,
            { style: { fontSize: 7.5, color: C.slate400, marginTop: 2 } },
            `${passedSteps.length} / ${allSteps.length}`
          )
        ),
        el(
          View,
          { style: { ...S.kpiCard, borderLeftColor: openBlockers.length > 0 ? C.red700 : C.green700 } },
          el(
            Text,
            { style: { ...S.kpiValue, color: openBlockers.length > 0 ? C.red700 : C.green700 } },
            String(openBlockers.length)
          ),
          el(Text, { style: S.kpiLabel }, "Open blokkades")
        ),
        el(
          View,
          { style: { ...S.kpiCard, borderLeftColor: criticalIssues.length > 0 ? C.red700 : C.green700 } },
          el(
            Text,
            { style: { ...S.kpiValue, color: criticalIssues.length > 0 ? C.red700 : C.green700 } },
            String(criticalIssues.length)
          ),
          el(Text, { style: S.kpiLabel }, "Kritieke issues")
        ),
        el(
          View,
          {
            style: {
              ...S.kpiCard,
              borderLeftColor:
                allIssues.length > 0
                  ? Math.round((resolvedIssues.length / allIssues.length) * 100) >= 80
                    ? C.green700
                    : C.orange700
                  : C.green700,
            },
          },
          el(
            Text,
            {
              style: {
                ...S.kpiValue,
                color:
                  allIssues.length > 0
                    ? Math.round((resolvedIssues.length / allIssues.length) * 100) >= 80
                      ? C.green700
                      : C.orange700
                    : C.green700,
              },
            },
            allIssues.length > 0
              ? `${Math.round((resolvedIssues.length / allIssues.length) * 100)}%`
              : "n.v.t."
          ),
          el(Text, { style: S.kpiLabel }, "Opgelost")
        )
      ),

      // Criteria checklist
      SectionHeader("Acceptatiecriteria"),

      TableHeaderRow([
        { label: "Criterium", flex: 3 },
        { label: "Resultaat", flex: 1.2 },
        { label: "Details", flex: 2.5 },
      ]),

      ...(
        [
          {
            label: "Geen open BLOCKER issues",
            ok: openBlockers.length === 0,
            detail: `${openBlockers.length} open blokkade(s)`,
          },
          {
            label: "Geen open KRITIEKE issues",
            ok: criticalIssues.length === 0,
            detail: `${criticalIssues.length} kritieke issue(s)`,
          },
          {
            label: "HOGE issues hebben workaround",
            ok: highWithoutWorkaround.length === 0,
            detail: `${highWithoutWorkaround.length} hoge issue(s) zonder workaround`,
          },
          {
            label: "Minimaal 80% teststappen geslaagd",
            ok: passedPct >= 80,
            detail: `${passedPct}% geslaagd`,
          },
          {
            label: "Geen mislukte stappen zonder verklaring",
            ok: failedSteps.length === 0,
            detail: `${failedSteps.length} mislukte/geblokkeerde stap(pen)`,
          },
        ] as const
      ).map((row, idx) =>
        TableDataRow(
          [
            { value: row.label, flex: 3 },
            {
              value: row.ok ? "Akkoord" : "NIET akkoord",
              flex: 1.2,
              bold: true,
              color: row.ok ? C.green700 : C.red700,
            },
            { value: row.detail, flex: 2.5, color: row.ok ? C.slate400 : C.red700 },
          ],
          idx % 2 === 1
        )
      ),

      // Sign-off section
      SectionHeader("Akkoord & Handtekening"),

      el(
        View,
        { style: { flexDirection: "row", gap: 20, marginTop: 12 } },
        el(
          View,
          { style: { flex: 1 } },
          el(View, { style: S.signOffLine }),
          el(Text, { style: S.signOffLineLabel }, "Naam"),
          el(View, { style: { ...S.signOffLine, marginTop: 28 } }),
          el(Text, { style: S.signOffLineLabel }, "Functie")
        ),
        el(
          View,
          { style: { flex: 1 } },
          el(View, { style: S.signOffLine }),
          el(Text, { style: S.signOffLineLabel }, "Datum"),
          el(View, { style: { ...S.signOffLine, marginTop: 28 } }),
          el(Text, { style: S.signOffLineLabel }, "Handtekening")
        )
      ),

      // Footer
      el(
        View,
        { style: S.footer, fixed: true },
        el(Text, {}, `Go/No-Go | ${projectName} | ${phaseName}`),
        el(Text, {}, `Gegenereerd ${formatDate(new Date())}`),
        el(
          Text,
          {
            render: ({ pageNumber, totalPages }: any) =>
              `Pagina ${pageNumber} van ${totalPages}`,
            fixed: true,
          },
          null
        )
      )
    )
  );

  return renderToBuffer(doc);
}

// ─── Legacy alias (keep existing export name working) ─────────────────────────
export function generatePhaseReport(
  phase: any,
  settings?: { orgName?: string | null; logoBase64?: string | null },
  criteria?: any
): Promise<Buffer> {
  return generateVoortgangsrapport(phase, settings ?? {}, criteria);
}
