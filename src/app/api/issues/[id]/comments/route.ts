import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId, user } = result.context;
  const { id } = await params;

  const issue = await prisma.issue.findFirst({ where: { id, tenantId } });
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  if (!body.content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const comment = await prisma.issueComment.create({
    data: { issueId: id, tenantId, userId: user.id, content: body.content },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}
