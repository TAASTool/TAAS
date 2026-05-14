import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const flow = await prisma.flow.findFirst({
    where: { id, tenantId },
    include: {
      phase: { include: { project: true } },
      versions: {
        orderBy: { createdAt: "desc" },
        include: {
          steps: {
            where: { isArchived: false },
            orderBy: { order: "asc" },
            include: {
              assignees: { include: { user: { select: { id: true, name: true } } } },
            },
          },
          _count: { select: { runs: true } },
        },
      },
    },
  });
  if (!flow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(flow);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN", "SCRIPT_WRITER"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;
  const body = await req.json();

  // Afsluiten: verwijder alle open taken gekoppeld aan runs van deze flow
  if (body.status === "CLOSED") {
    const versions = await prisma.flowVersion.findMany({ where: { flowId: id }, select: { id: true } });
    const versionIds = versions.map((v) => v.id);
    const runs = await prisma.testRun.findMany({ where: { flowVersionId: { in: versionIds } }, select: { id: true } });
    const runIds = runs.map((r) => r.id);
    const runSteps = await prisma.runStep.findMany({ where: { runId: { in: runIds } }, select: { id: true } });
    const runStepIds = runSteps.map((s) => s.id);
    await prisma.task.deleteMany({ where: { runStepId: { in: runStepIds }, status: { not: "DONE" } } });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.status !== undefined) data.status = body.status;

  await prisma.flow.updateMany({ where: { id, tenantId }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN", "SCRIPT_WRITER"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const flow = await prisma.flow.findFirst({ where: { id, tenantId } });
  if (!flow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    const versions = await tx.flowVersion.findMany({ where: { flowId: id }, select: { id: true } });
    const versionIds = versions.map((v) => v.id);

    const runs = await tx.testRun.findMany({ where: { flowVersionId: { in: versionIds } }, select: { id: true } });
    const runIds = runs.map((r) => r.id);

    const runSteps = await tx.runStep.findMany({ where: { runId: { in: runIds } }, select: { id: true } });
    const runStepIds = runSteps.map((s) => s.id);

    const issues = await tx.issue.findMany({ where: { runStepId: { in: runStepIds } }, select: { id: true } });
    const issueIds = issues.map((i) => i.id);

    await tx.task.deleteMany({
      where: { OR: [{ runStepId: { in: runStepIds } }, { issueId: { in: issueIds } }] },
    });
    await tx.issue.deleteMany({ where: { id: { in: issueIds } } });
    await tx.runStepAssignee.deleteMany({ where: { runStepId: { in: runStepIds } } });
    await tx.runStep.deleteMany({ where: { id: { in: runStepIds } } });
    await tx.testRun.deleteMany({ where: { id: { in: runIds } } });
    await tx.flow.deleteMany({ where: { id, tenantId } });
  });

  return NextResponse.json({ success: true });
}
