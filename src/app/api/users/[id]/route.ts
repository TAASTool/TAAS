import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;
  const body = await req.json();

  await prisma.tenantUser.updateMany({
    where: { id, tenantId },
    data: { roles: body.roles, isActive: body.isActive, name: body.name },
  });
  return NextResponse.json({ success: true });
}
