import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

// Start een fase: maak automatisch TestRuns aan voor alle actieve flows en stuur taken naar testers
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const phase = await prisma.testPhase.findFirst({
    where: { id, tenantId },
    include: {
      flows: {
        where: { status: "ACTIVE" },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              steps: {
                where: { isArchived: false },
                orderBy: { order: "asc" },
                include: { assignees: true },
              },
            },
          },
        },
      },
    },
  });
  if (!phase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Zet fase op ACTIVE
  await prisma.testPhase.updateMany({
    where: { id, tenantId },
    data: { status: "ACTIVE" },
  });

  let createdRuns = 0;
  let createdTasks = 0;

  for (const flow of phase.flows) {
    const version = flow.versions[0];
    if (!version || version.steps.length === 0) continue;

    // Controleer of er al een actieve run is voor deze flow versie
    const existingRun = await prisma.testRun.findFirst({
      where: { flowVersionId: version.id, tenantId, status: { in: ["DRAFT", "IN_PROGRESS"] } },
    });
    if (existingRun) continue;

    // Maak TestRun aan
    const run = await prisma.testRun.create({
      data: {
        flowVersionId: version.id,
        phaseId: id,
        projectId: phase.projectId,
        tenantId,
        name: `${flow.name} — ${new Date().toLocaleDateString("nl-NL")}`,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        steps: {
          create: version.steps.map((s) => ({
            tenantId,
            order: s.order,
            title: s.title,
            instruction: s.instruction,
            expectedResult: s.expectedResult,
          })),
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    createdRuns++;

    // Kopieer FlowStepAssignees → RunStepAssignees
    const runStepByOrder = new Map(run.steps.map((rs) => [rs.order, rs]));
    for (const flowStep of version.steps) {
      if (flowStep.assignees.length === 0) continue;
      const runStep = runStepByOrder.get(flowStep.order);
      if (!runStep) continue;
      await prisma.runStepAssignee.createMany({
        data: flowStep.assignees.map((a) => ({
          runStepId: runStep.id,
          userId: a.userId,
          tenantId,
        })),
        skipDuplicates: true,
      });
    }

    // Maak taken aan voor de eerste stap
    const firstStep = run.steps[0];
    if (firstStep) {
      const firstFlowStep = version.steps.find((s) => s.order === firstStep.order);
      if (firstFlowStep) {
        for (const assignee of firstFlowStep.assignees) {
          const existing = await prisma.task.findFirst({
            where: { runStepId: firstStep.id, userId: assignee.userId, type: "STEP_EXECUTION", status: { not: "DONE" } },
          });
          if (!existing) {
            await prisma.task.create({
              data: {
                tenantId,
                userId: assignee.userId,
                type: "STEP_EXECUTION",
                title: `Voer stap uit: ${firstStep.title}`,
                runStepId: firstStep.id,
                status: "OPEN",
              },
            });
            createdTasks++;
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true, createdRuns, createdTasks });
}
