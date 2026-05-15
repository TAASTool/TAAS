import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;

  const { searchParams } = new URL(req.url);
  const moduleKeys = searchParams.getAll("module");

  // Get active templates; if module filter given, filter by linked modules (or show all if no links exist)
  const where: Record<string, unknown> = { isActive: true };

  if (moduleKeys.length > 0) {
    const linked = await prisma.templateModuleLink.findMany({
      where: { moduleKey: { in: moduleKeys } },
      select: { templateId: true },
    });
    if (linked.length > 0) {
      where.id = { in: [...new Set(linked.map((l) => l.templateId))] };
    }
    // If no module links configured yet, show all templates (fallback)
  }

  const templates = await prisma.template.findMany({
    where,
    include: {
      versions: { where: { isActive: true }, include: { _count: { select: { steps: true } } }, take: 1 },
      moduleLinks: { select: { moduleKey: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(templates);
}
