import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

// Hertoewijs een taak aan een andere medewerker
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN", "FUNCTIONAL_MANAGER"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;
  const body = await req.json();

  if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const task = await prisma.task.findFirst({ where: { id, tenantId } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const targetUser = await prisma.tenantUser.findFirst({ where: { id: body.userId, tenantId } });
  if (!targetUser) return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });

  // Update de taak naar de nieuwe gebruiker
  await prisma.task.update({
    where: { id },
    data: { userId: body.userId, status: "OPEN" },
  });

  // Als dit een STEP_EXECUTION taak is: update ook de RunStepAssignee
  if (task.type === "STEP_EXECUTION" && task.runStepId) {
    // Verwijder de oude assignee uit de runstep (als deze er is)
    await prisma.runStepAssignee.deleteMany({
      where: { runStepId: task.runStepId, userId: task.userId },
    });
    // Voeg de nieuwe assignee toe
    await prisma.runStepAssignee.upsert({
      where: { runStepId_userId: { runStepId: task.runStepId, userId: body.userId } },
      create: { runStepId: task.runStepId, userId: body.userId, tenantId },
      update: {},
    });
  }

  return NextResponse.json({ success: true });
}
