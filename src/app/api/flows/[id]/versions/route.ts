import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN", "SCRIPT_WRITER"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const flow = await prisma.flow.findFirst({
    where: { id, tenantId },
    include: { versions: { orderBy: { createdAt: "desc" }, take: 1, include: { steps: { orderBy: { order: "asc" } } } } },
  });
  if (!flow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const latestVersion = flow.versions[0];
  const versionNumber = latestVersion
    ? `v${(parseFloat(latestVersion.version.replace("v", "")) + 0.1).toFixed(1)}`
    : "v1.0";

  // Deactivate previous versions
  await prisma.flowVersion.updateMany({ where: { flowId: id }, data: { isActive: false } });

  const newVersion = await prisma.flowVersion.create({
    data: {
      flowId: id,
      tenantId,
      version: versionNumber,
      steps: latestVersion
        ? {
            create: latestVersion.steps.map((s) => ({
              tenantId,
              order: s.order,
              title: s.title,
              instruction: s.instruction,
              expectedResult: s.expectedResult,
            })),
          }
        : undefined,
    },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(newVersion, { status: 201 });
}
