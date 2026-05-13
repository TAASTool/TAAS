import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "PASSED", "FAILED", "BLOCKED"]).optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId, user } = result.context;
  const { id } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status && ["PASSED", "FAILED", "BLOCKED"].includes(parsed.data.status)) {
    updateData.doneById = user.id;
    updateData.doneAt = new Date();
  }

  await prisma.runStep.updateMany({ where: { id, tenantId }, data: updateData });

  // Auto-update run status
  const step = await prisma.runStep.findFirst({ where: { id } });
  if (step) {
    const allSteps = await prisma.runStep.findMany({ where: { runId: step.runId } });
    const allDone = allSteps.every((s) => ["PASSED", "FAILED", "BLOCKED"].includes(s.status));
    if (allDone) {
      await prisma.testRun.updateMany({
        where: { id: step.runId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    } else if (parsed.data.status === "IN_PROGRESS") {
      await prisma.testRun.updateMany({
        where: { id: step.runId, status: "DRAFT" },
        data: { status: "IN_PROGRESS", startedAt: new Date(), startedById: user.id },
      });
    }
  }

  return NextResponse.json({ success: true });
}
