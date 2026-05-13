import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";
import { generatePhaseReport, generateIssueLogReport, generateGoNoGoReport } from "@/lib/pdf";

const schema = z.object({
  type: z.enum(["PHASE_REPORT", "FLOW_REPORT", "ISSUE_LOG", "GONOGO_SUMMARY"]),
  entityId: z.string(),
  entityName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId, user } = result.context;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  let pdfBuffer: Buffer;
  let filename: string;

  if (parsed.data.type === "PHASE_REPORT" || parsed.data.type === "GONOGO_SUMMARY") {
    const phase = await prisma.testPhase.findFirst({
      where: { id: parsed.data.entityId, tenantId },
      include: {
        project: true,
        flows: {
          include: {
            versions: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                runs: {
                  include: {
                    steps: {
                      include: {
                        issues: {
                          include: { createdBy: { select: { name: true } }, comments: true },
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
    if (!phase) return NextResponse.json({ error: "Phase not found" }, { status: 404 });

    if (parsed.data.type === "GONOGO_SUMMARY") {
      pdfBuffer = await generateGoNoGoReport(phase);
      filename = `gonogo-${phase.name}-${Date.now()}.pdf`;
    } else {
      pdfBuffer = await generatePhaseReport(phase);
      filename = `fase-rapport-${phase.name}-${Date.now()}.pdf`;
    }
  } else if (parsed.data.type === "ISSUE_LOG") {
    const issues = await prisma.issue.findMany({
      where: { tenantId, runStep: { run: { projectId: parsed.data.entityId } } },
      include: {
        createdBy: { select: { name: true } },
        comments: { include: { user: { select: { name: true } } } },
        runStep: { include: { run: { include: { flowVersion: { include: { flow: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    pdfBuffer = await generateIssueLogReport(issues, parsed.data.entityName || "Project");
    filename = `issue-log-${Date.now()}.pdf`;
  } else {
    return NextResponse.json({ error: "Report type not yet implemented" }, { status: 400 });
  }

  // Log the export
  await prisma.reportExport.create({
    data: {
      tenantId,
      type: parsed.data.type,
      entityId: parsed.data.entityId,
      entityName: parsed.data.entityName || "",
      createdById: user.id,
    },
  });

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
