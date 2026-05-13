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

  await prisma.flow.updateMany({ where: { id, tenantId }, data: { name: body.name, description: body.description } });
  return NextResponse.json({ success: true });
}
