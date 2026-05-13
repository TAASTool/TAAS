import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["FUNCTIONAL_MANAGER", "TENANT_ADMIN"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const issue = await prisma.issue.findFirst({
    where: { id, tenantId },
    include: { runStep: true },
  });
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark issue as requiring retest
  await prisma.issue.update({ where: { id }, data: { retestRequired: true, status: "IN_PROGRESS" } });

  // Reset run step to IN_PROGRESS
  await prisma.runStep.updateMany({ where: { id: issue.runStepId }, data: { status: "IN_PROGRESS", doneAt: null } });

  // Create retest tasks for assigned testers
  const assignees = await prisma.runStepAssignee.findMany({
    where: { runStepId: issue.runStepId },
  });

  if (assignees.length > 0) {
    await prisma.task.createMany({
      data: assignees.map((a) => ({
        tenantId,
        userId: a.userId,
        type: "RETEST" as const,
        title: `Hertest vereist: ${issue.title}`,
        description: `Bevinding opgelost, hertest vereist voor stap.`,
        issueId: id,
        runStepId: issue.runStepId,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
