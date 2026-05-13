import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const impact = url.searchParams.get("impact");
  const projectId = url.searchParams.get("projectId");

  const where: Record<string, unknown> = { tenantId };
  if (status) where.status = status;
  if (type) where.type = type;
  if (impact) where.impact = impact;

  if (projectId) {
    where.runStep = {
      run: { projectId },
    };
  }

  const issues = await prisma.issue.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true } },
      runStep: {
        include: {
          run: {
            include: {
              flowVersion: { include: { flow: { include: { phase: { include: { project: true } } } } } },
            },
          },
        },
      },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(issues);
}
