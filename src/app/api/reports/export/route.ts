import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { z } from "zod";
import {
  generateVoortgangsrapport,
  generateOpleververslag,
  generateIssueLogReport,
  generateGoNoGoReport,
} from "@/lib/pdf";

const schema = z.object({
  type: z.enum(["VOORTGANGSRAPPORT", "OPLEVERVERSLAG", "PHASE_REPORT", "FLOW_REPORT", "ISSUE_LOG", "GONOGO_SUMMARY"]),
  entityId: z.string(),
  entityName: z.string().optional(),
});

async function fetchPhase(phaseId: string, tenantId: string) {
  return prisma.testPhase.findFirst({
    where: { id: phaseId, tenantId },
    include: {
      project: { include: { goLiveCriteria: true } },
      flows: {
        orderBy: { createdAt: "asc" },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              runs: {
                orderBy: { createdAt: "asc" },
                include: {
                  steps: {
                    orderBy: { order: "asc" },
                    include: {
                      assignees: { include: { user: { select: { id: true, name: true } } } },
                      issues: {
                        include: {
                          createdBy: { select: { name: true } },
                          comments: {
                            include: { user: { select: { name: true } } },
                            orderBy: { createdAt: "asc" },
                          },
                        },
                        orderBy: { createdAt: "asc" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function POST(req: NextRequest) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId, user } = result.context;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await prisma.tenantSettings.findUnique({ where: { tenantId } });

  let pdfBuffer!: Buffer;
  let filename!: string;

  const settingsData = {
    orgName: settings?.orgName ?? null,
    logoBase64: settings?.logoBase64 ?? null,
  };

  try {
    if (
      parsed.data.type === "VOORTGANGSRAPPORT" ||
      parsed.data.type === "OPLEVERVERSLAG" ||
      parsed.data.type === "PHASE_REPORT" ||
      parsed.data.type === "GONOGO_SUMMARY"
    ) {
      const phase = await fetchPhase(parsed.data.entityId, tenantId);
      if (!phase) return NextResponse.json({ error: "Fase niet gevonden" }, { status: 404 });

      const criteria = (phase.project as any).goLiveCriteria ?? null;

      if (parsed.data.type === "VOORTGANGSRAPPORT" || parsed.data.type === "PHASE_REPORT") {
        pdfBuffer = await generateVoortgangsrapport(phase, settingsData, criteria);
        filename = `voortgangsrapport-${phase.name}-${formatFilename()}.pdf`;
      } else if (parsed.data.type === "OPLEVERVERSLAG") {
        pdfBuffer = await generateOpleververslag(phase, settingsData, criteria);
        filename = `opleververslag-${phase.name}-${formatFilename()}.pdf`;
      } else {
        pdfBuffer = await generateGoNoGoReport(phase);
        filename = `gonogo-${phase.name}-${formatFilename()}.pdf`;
      }
    } else if (parsed.data.type === "ISSUE_LOG") {
      const issues = await prisma.issue.findMany({
        where: { tenantId, runStep: { run: { projectId: parsed.data.entityId } } },
        include: {
          createdBy: { select: { name: true } },
          comments: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
          runStep: {
            include: {
              run: { include: { flowVersion: { include: { flow: true } } } },
            },
          },
        },
        orderBy: [{ impact: "asc" }, { createdAt: "desc" }],
      });

      pdfBuffer = await generateIssueLogReport(issues, parsed.data.entityName || "Project");
      filename = `issue-log-${formatFilename()}.pdf`;
    } else {
      return NextResponse.json({ error: "Rapporttype niet geïmplementeerd" }, { status: 400 });
    }
  } catch (err) {
    logger.error(err, "PDF generation failed");
    const message = err instanceof Error ? err.message : "Onbekende fout bij genereren PDF";
    return NextResponse.json({ error: `PDF genereren mislukt: ${message}` }, { status: 500 });
  }

  await prisma.reportExport.create({
    data: {
      tenantId,
      type: parsed.data.type === "VOORTGANGSRAPPORT" || parsed.data.type === "OPLEVERVERSLAG"
        ? "PHASE_REPORT"
        : parsed.data.type as any,
      entityId: parsed.data.entityId,
      entityName: parsed.data.entityName || "",
      createdById: user.id,
    },
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function formatFilename(): string {
  return new Date().toISOString().slice(0, 10);
}
