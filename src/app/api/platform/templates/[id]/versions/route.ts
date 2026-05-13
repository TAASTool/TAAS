import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAuth } from "@/lib/api-helpers";
import { z } from "zod";

const stepSchema = z.object({
  order: z.number(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  expectedResult: z.string().optional(),
});

const createVersionSchema = z.object({
  version: z.string().min(1),
  changelog: z.string().optional(),
  steps: z.array(stepSchema),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requirePlatformAuth();
  if ("error" in result) return result.error;
  const { id } = await params;

  const versions = await prisma.templateVersion.findMany({
    where: { templateId: id },
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(versions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requirePlatformAuth(["SUPER_ADMIN"]);
  if ("error" in result) return result.error;
  const { id } = await params;

  const body = await req.json();
  const parsed = createVersionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const version = await prisma.templateVersion.create({
    data: {
      templateId: id,
      version: parsed.data.version,
      changelog: parsed.data.changelog,
      steps: { create: parsed.data.steps },
    },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(version, { status: 201 });
}
