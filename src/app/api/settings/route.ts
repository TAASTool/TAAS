import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

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
  const schema = z.object({
    orgName: z.string().max(200).optional(),
    logoBase64: z.string().max(500_000).nullable().optional(),
    emailDomain: z.string().max(100).nullable().optional(),
    onboardingDone: z.boolean().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });

  const settings = await prisma.tenantSettings.upsert({
    where: { tenantId },
    create: { tenantId, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json(settings);
}
