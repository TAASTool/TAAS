import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId, user } = result.context;

  const isAdmin = user.roles.includes("TENANT_ADMIN");
  const isFM = user.roles.includes("FUNCTIONAL_MANAGER");
  if (!isAdmin && !isFM) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity") || undefined;
  const entityId = searchParams.get("entityId") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const action = searchParams.get("action") || undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      ...(entity && { entity }),
      ...(entityId && { entityId }),
      ...(userId && { userId }),
      ...(action && { action }),
      ...(from || to ? {
        createdAt: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json(logs);
}
