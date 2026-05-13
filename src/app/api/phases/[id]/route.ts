import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const phase = await prisma.testPhase.findFirst({
    where: { id, tenantId },
    include: {
      project: true,
      flows: {
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            include: {
              steps: { orderBy: { order: "asc" } },
              runs: { orderBy: { createdAt: "desc" }, take: 3 },
              _count: { select: { steps: true, runs: true } },
            },
          },
        },
      },
    },
  });
  if (!phase) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(phase);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;
  const body = await req.json();

  await prisma.testPhase.updateMany({
    where: { id, tenantId },
    data: { status: body.status },
  });
  return NextResponse.json({ success: true });
}
