import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

const schema = z.object({
  sourceFlowVersionId: z.string(),
  name: z.string().min(2),
  includeIssues: z.boolean().default(false),
  issueStatuses: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN", "SCRIPT_WRITER"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const phase = await prisma.testPhase.findFirst({ where: { id, tenantId } });
  if (!phase) return NextResponse.json({ error: "Phase not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const sourceVersion = await prisma.flowVersion.findFirst({
    where: { id: parsed.data.sourceFlowVersionId, tenantId },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!sourceVersion) return NextResponse.json({ error: "Source version not found" }, { status: 404 });

  const flow = await prisma.flow.create({
    data: {
      name: parsed.data.name,
      phaseId: id,
      tenantId,
      sourceFlowVersionId: sourceVersion.id,
      versions: {
        create: {
          tenantId,
          version: "v1.0",
          steps: {
            create: sourceVersion.steps.map((s) => ({
              tenantId,
              order: s.order,
              title: s.title,
              instruction: s.instruction,
              expectedResult: s.expectedResult,
            })),
          },
        },
      },
    },
    include: { versions: { include: { steps: { orderBy: { order: "asc" } } } } },
  });
  return NextResponse.json(flow, { status: 201 });
}
