import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";
import { z } from "zod";

const rowSchema = z.object({
  fase: z.enum(["FAT", "GAT", "PAT"]),
  flow_naam: z.string().min(1),
  flow_beschrijving: z.string().optional(),
  stap_titel: z.string().min(1),
  stap_instructie: z.string().min(1),
  stap_verwacht_resultaat: z.string().optional(),
});

const bodySchema = z.object({
  projectId: z.string().min(1),
  rows: z.array(z.record(z.string())).min(1),
});

export async function POST(req: NextRequest) {
  const result = await requireTenantAuth(["TENANT_ADMIN", "SCRIPT_WRITER"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });

  const { projectId, rows } = parsed.data;

  // Validate and normalise all rows
  const validRows: z.infer<typeof rowSchema>[] = [];
  for (const row of rows) {
    const r = rowSchema.safeParse({
      fase: row.fase?.toUpperCase(),
      flow_naam: row.flow_naam?.trim(),
      flow_beschrijving: row.flow_beschrijving?.trim() || undefined,
      stap_titel: row.stap_titel?.trim(),
      stap_instructie: row.stap_instructie?.trim(),
      stap_verwacht_resultaat: row.stap_verwacht_resultaat?.trim() || undefined,
    });
    if (!r.success) {
      return NextResponse.json(
        { error: `Ongeldige rij (rij ${row._row ?? "?"}): controleer fase, flow_naam, stap_titel en stap_instructie.` },
        { status: 400 },
      );
    }
    validRows.push(r.data);
  }

  // Load project with its phases
  const project = await prisma.project.findFirst({
    where: { id: projectId, tenantId },
    include: { phases: true },
  });
  if (!project) return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });

  // Group rows by (fase, flow_naam) preserving insertion order
  type FlowGroup = {
    fase: string;
    flowNaam: string;
    flowBeschrijving?: string;
    steps: { titel: string; instructie: string; verwacht?: string }[];
  };

  const flowMap = new Map<string, FlowGroup>();
  for (const row of validRows) {
    const key = `${row.fase}|||${row.flow_naam}`;
    if (!flowMap.has(key)) {
      flowMap.set(key, { fase: row.fase, flowNaam: row.flow_naam, flowBeschrijving: row.flow_beschrijving, steps: [] });
    }
    flowMap.get(key)!.steps.push({
      titel: row.stap_titel,
      instructie: row.stap_instructie,
      verwacht: row.stap_verwacht_resultaat,
    });
  }

  let totalSteps = 0;
  const createdFlows: string[] = [];

  for (const group of flowMap.values()) {
    const phase = project.phases.find((p) => p.name === group.fase);
    if (!phase) {
      return NextResponse.json(
        { error: `Fase "${group.fase}" bestaat niet in dit project. Maak de fase eerst aan via het project.` },
        { status: 422 },
      );
    }

    const duplicate = await prisma.flow.findFirst({
      where: { name: group.flowNaam, phaseId: phase.id, tenantId },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: `Flow "${group.flowNaam}" bestaat al in fase ${group.fase}. Geef de flow een andere naam of verwijder de bestaande eerst.` },
        { status: 409 },
      );
    }

    const flow = await prisma.flow.create({
      data: {
        name: group.flowNaam,
        description: group.flowBeschrijving,
        phaseId: phase.id,
        tenantId,
        versions: { create: { tenantId, version: "v1.0" } },
      },
      include: { versions: true },
    });

    const versionId = flow.versions[0].id;

    for (let i = 0; i < group.steps.length; i++) {
      const step = group.steps[i];
      await prisma.flowStep.create({
        data: {
          flowVersionId: versionId,
          tenantId,
          title: step.titel,
          instruction: step.instructie,
          expectedResult: step.verwacht || null,
          order: i + 1,
        },
      });
      totalSteps++;
    }

    createdFlows.push(`${group.fase} — ${group.flowNaam} (${group.steps.length} stap${group.steps.length !== 1 ? "pen" : ""})`);
  }

  return NextResponse.json({ created: totalSteps, flows: createdFlows }, { status: 201 });
}
