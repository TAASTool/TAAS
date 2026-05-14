import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantAuth } from "@/lib/api-helpers";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth();
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, tenantId },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          flows: {
            include: {
              versions: {
                orderBy: { createdAt: "desc" },
                take: 1,
                include: { _count: { select: { steps: true, runs: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // KPIs per fase: open taken, open issues, runStep voortgang
  const runs = await prisma.testRun.findMany({
    where: { tenantId, projectId: id },
    select: { id: true, phaseId: true },
  });
  const runToPhase = new Map(runs.map((r) => [r.id, r.phaseId]));
  const runIds = runs.map((r) => r.id);

  const runSteps = await prisma.runStep.findMany({
    where: { runId: { in: runIds } },
    select: { id: true, runId: true, status: true },
  });
  const rsToPhase = new Map<string, string>();
  const stepStatusByPhase = new Map<string, { total: number; done: number }>();
  for (const rs of runSteps) {
    const phaseId = runToPhase.get(rs.runId);
    if (!phaseId) continue;
    rsToPhase.set(rs.id, phaseId);
    const cur = stepStatusByPhase.get(phaseId) ?? { total: 0, done: 0 };
    cur.total++;
    if (["PASSED", "FAILED", "BLOCKED"].includes(rs.status)) cur.done++;
    stepStatusByPhase.set(phaseId, cur);
  }
  const runStepIds = runSteps.map((r) => r.id);

  const [openTasks, openIssues] = await Promise.all([
    prisma.task.findMany({
      where: { tenantId, status: { not: "DONE" }, runStepId: { in: runStepIds } },
      select: { runStepId: true },
    }),
    prisma.issue.findMany({
      where: { tenantId, status: { notIn: ["RESOLVED", "REJECTED"] }, runStepId: { in: runStepIds } },
      select: { runStepId: true },
    }),
  ]);

  const taskByPhase = new Map<string, number>();
  for (const t of openTasks) {
    const pid = t.runStepId ? rsToPhase.get(t.runStepId) : undefined;
    if (pid) taskByPhase.set(pid, (taskByPhase.get(pid) ?? 0) + 1);
  }
  const issueByPhase = new Map<string, number>();
  for (const i of openIssues) {
    const pid = rsToPhase.get(i.runStepId);
    if (pid) issueByPhase.set(pid, (issueByPhase.get(pid) ?? 0) + 1);
  }

  const enriched = {
    ...project,
    phases: project.phases.map((ph) => {
      const progress = stepStatusByPhase.get(ph.id);
      return {
        ...ph,
        openTaskCount: taskByPhase.get(ph.id) ?? 0,
        openIssueCount: issueByPhase.get(ph.id) ?? 0,
        stepTotal: progress?.total ?? 0,
        stepDone: progress?.done ?? 0,
      };
    }),
  };

  return NextResponse.json(enriched);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireTenantAuth(["TENANT_ADMIN"]);
  if ("error" in result) return result.error;
  const { tenantId } = result.context;
  const { id } = await params;
  const body = await req.json();

  const project = await prisma.project.updateMany({
    where: { id, tenantId },
    data: { name: body.name, description: body.description, status: body.status },
  });
  if (project.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
