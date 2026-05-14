import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

// Admin override: forceer een stap door als PASSED en activeer de volgende stap
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN", "FUNCTIONAL_MANAGER"]);
  if ("error" in result) return result.error;
  const { tenantId, user } = result.context;
  const { id } = await params;
  const body = await req.json();

  const status = (body.status as "PASSED" | "FAILED" | "BLOCKED") ?? "PASSED";

  const step = await prisma.runStep.findFirst({
    where: { id, tenantId },
    include: { assignees: true },
  });
  if (!step) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (["PASSED", "FAILED", "BLOCKED"].includes(step.status)) {
    return NextResponse.json({ error: "Stap is al afgerond" }, { status: 400 });
  }

  // Zet stap op de opgegeven status
  await prisma.runStep.updateMany({
    where: { id, tenantId },
    data: { status, doneById: user.id, doneAt: new Date(), notes: body.notes ?? "Handmatig doorgeklikt door admin" },
  });

  // Sluit alle openstaande STEP_EXECUTION taken voor deze stap
  await prisma.task.updateMany({
    where: { runStepId: id, type: "STEP_EXECUTION", status: { not: "DONE" } },
    data: { status: "DONE" },
  });

  // Maak taken aan voor de volgende stap
  const nextStep = await prisma.runStep.findFirst({
    where: { runId: step.runId, tenantId, order: { gt: step.order }, status: "PENDING" },
    orderBy: { order: "asc" },
    include: { assignees: true },
  });

  if (nextStep) {
    for (const assignee of nextStep.assignees) {
      const existing = await prisma.task.findFirst({
        where: { runStepId: nextStep.id, userId: assignee.userId, type: "STEP_EXECUTION", status: { not: "DONE" } },
      });
      if (!existing) {
        await prisma.task.create({
          data: {
            tenantId,
            userId: assignee.userId,
            type: "STEP_EXECUTION",
            title: `Voer stap uit: ${nextStep.title}`,
            runStepId: nextStep.id,
            status: "OPEN",
          },
        });
      }
    }
  }

  // Controleer of de run klaar is
  const allSteps = await prisma.runStep.findMany({ where: { runId: step.runId } });
  const allDone = allSteps.every((s) => ["PASSED", "FAILED", "BLOCKED"].includes(s.status));
  if (allDone) {
    await prisma.testRun.updateMany({
      where: { id: step.runId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
