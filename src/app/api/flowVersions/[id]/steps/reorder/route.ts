import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

const schema = z.object({ orderedIds: z.array(z.string()) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN", "SCRIPT_WRITER"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const hasRuns = await prisma.testRun.findFirst({ where: { flowVersionId: id } });
  if (hasRuns) return NextResponse.json({ error: "Cannot reorder version with existing runs." }, { status: 409 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await Promise.all(
    parsed.data.orderedIds.map((stepId, index) =>
      prisma.flowStep.updateMany({
        where: { id: stepId, tenantId },
        data: { order: index + 1 },
      })
    )
  );
  return NextResponse.json({ success: true });
}
