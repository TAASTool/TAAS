import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

// Stop een fase: verwijder alle openstaande taken van testers voor alle flows in deze fase
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const phase = await prisma.testPhase.findFirst({ where: { id, tenantId } });
  if (!phase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Haal alle runs op in deze fase
  const runs = await prisma.testRun.findMany({
    where: { phaseId: id, tenantId },
    select: { id: true },
  });
  const runIds = runs.map((r) => r.id);

  const runSteps = await prisma.runStep.findMany({
    where: { runId: { in: runIds } },
    select: { id: true },
  });
  const runStepIds = runSteps.map((s) => s.id);

  // Verwijder alle openstaande STEP_EXECUTION taken (RETEST/QUESTION laten we staan)
  const deleted = await prisma.task.deleteMany({
    where: {
      tenantId,
      type: "STEP_EXECUTION",
      status: { not: "DONE" },
      runStepId: { in: runStepIds },
    },
  });

  // Zet fase op COMPLETED
  await prisma.testPhase.updateMany({
    where: { id, tenantId },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json({ success: true, deletedTasks: deleted.count });
}
