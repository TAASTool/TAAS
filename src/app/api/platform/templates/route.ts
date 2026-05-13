import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformAuth } from "@/lib/api-helpers";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  category: z.enum(["HR", "FIN", "INKOOP", "ALG"]),
  description: z.string().optional(),
});

export async function GET() {
  const result = await requirePlatformAuth();
  if ("error" in result) return result.error;

  const templates = await prisma.template.findMany({
    include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const result = await requirePlatformAuth(["SUPER_ADMIN"]);
  if ("error" in result) return result.error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const template = await prisma.template.create({ data: parsed.data });
  return NextResponse.json(template, { status: 201 });
}
