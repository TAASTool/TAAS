import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["IMPLEMENTATION", "OPTIMIZATION", "RELEASE"]).default("IMPLEMENTATION"),
});

export async function GET() {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;

  const projects = await prisma.project.findMany({
    where: { tenantId },
    include: {
      phases: { orderBy: { order: "asc" } },
      _count: { select: { phases: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const result = await requireTenantAuth(["TENANT_ADMIN"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const project = await prisma.project.create({
    data: { ...parsed.data, tenantId },
  });
  return NextResponse.json(project, { status: 201 });
}
