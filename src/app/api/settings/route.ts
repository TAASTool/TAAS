import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function GET() {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;

  const settings = await prisma.tenantSettings.findUnique({ where: { tenantId } });
  return NextResponse.json(settings ?? { onboardingDone: false });
}

export async function PATCH(req: NextRequest) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId, user } = result.context;

  const isAdmin = user.roles.includes("TENANT_ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const settings = await prisma.tenantSettings.upsert({
    where: { tenantId },
    create: { tenantId, ...body },
    update: body,
  });

  return NextResponse.json(settings);
}
