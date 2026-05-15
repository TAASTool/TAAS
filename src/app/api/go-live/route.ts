import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

const schema = z.object({
  projectId: z.string(),
  goLiveDate: z.string().nullable().optional(),
  goNoGoDate: z.string().nullable().optional(),
  maxCritical: z.number().int().min(0).nullable().optional(),
  maxHigh: z.number().int().min(0).nullable().optional(),
  maxMedium: z.number().int().min(0).nullable().optional(),
  maxLow: z.number().int().min(0).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const criteria = await prisma.goLiveCriteria.findUnique({ where: { projectId } });

  // Real-time issue counts per impact
  const openIssues = await prisma.issue.groupBy({
    by: ["impact"],
    where: {
      tenantId,
      runStep: { run: { projectId } },
      status: { notIn: ["RESOLVED", "REJECTED", "WITHDRAWN"] },
    },
    _count: true,
  });

  const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const g of openIssues) counts[g.impact] = g._count;

  return NextResponse.json({ criteria, counts });
}

export async function PUT(req: NextRequest) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId, user } = result.context;

  const isAdmin = user.roles.includes("TENANT_ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { projectId, ...data } = parsed.data;

  const project = await prisma.project.findFirst({ where: { id: projectId, tenantId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const criteria = await prisma.goLiveCriteria.upsert({
    where: { projectId },
    create: {
      tenantId,
      projectId,
      createdById: user.id,
      goLiveDate: data.goLiveDate ? new Date(data.goLiveDate) : null,
      goNoGoDate: data.goNoGoDate ? new Date(data.goNoGoDate) : null,
      maxCritical: data.maxCritical ?? null,
      maxHigh: data.maxHigh ?? null,
      maxMedium: data.maxMedium ?? null,
      maxLow: data.maxLow ?? null,
    },
    update: {
      goLiveDate: data.goLiveDate ? new Date(data.goLiveDate) : null,
      goNoGoDate: data.goNoGoDate ? new Date(data.goNoGoDate) : null,
      maxCritical: data.maxCritical ?? null,
      maxHigh: data.maxHigh ?? null,
      maxMedium: data.maxMedium ?? null,
      maxLow: data.maxLow ?? null,
    },
  });

  return NextResponse.json(criteria);
}
