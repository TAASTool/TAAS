import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "QUESTION", "RESOLVED", "REJECTED"]).optional(),
  impact: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  hasWorkaround: z.boolean().optional(),
  workaroundNote: z.string().optional(),
  businessAccepted: z.boolean().optional(),
  businessAcceptNote: z.string().optional(),
  retestRequired: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const issue = await prisma.issue.findFirst({
    where: { id, tenantId },
    include: {
      createdBy: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      attachments: true,
      runStep: {
        include: {
          run: {
            include: {
              flowVersion: { include: { flow: { include: { phase: { include: { project: true } } } } } },
            },
          },
        },
      },
    },
  });
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(issue);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.issue.updateMany({ where: { id, tenantId }, data: parsed.data });
  return NextResponse.json({ success: true });
}
