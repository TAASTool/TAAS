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

  // KPIs per project: open taken en open issues (via testRun.projectId)
  const projectIds = projects.map((p) => p.id);

  const runs = await prisma.testRun.findMany({
    where: { tenantId, projectId: { in: projectIds } },
    select: { id: true, projectId: true },
  });
  const runIds = runs.map((r) => r.id);
  const runToProject = new Map(runs.map((r) => [r.id, r.projectId]));

  const runSteps = await prisma.runStep.findMany({
    where: { runId: { in: runIds } },
    select: { id: true, runId: true },
  });
  const rsToProject = new Map<string, string>();
  for (const rs of runSteps) {
    const pid = runToProject.get(rs.runId);
    if (pid) rsToProject.set(rs.id, pid);
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

  const taskCountByProject = new Map<string, number>();
  for (const t of openTasks) {
    const pid = t.runStepId ? rsToProject.get(t.runStepId) : undefined;
    if (pid) taskCountByProject.set(pid, (taskCountByProject.get(pid) ?? 0) + 1);
  }
  const issueCountByProject = new Map<string, number>();
  for (const i of openIssues) {
    const pid = rsToProject.get(i.runStepId);
    if (pid) issueCountByProject.set(pid, (issueCountByProject.get(pid) ?? 0) + 1);
  }

  const enriched = projects.map((p) => ({
    ...p,
    openTaskCount: taskCountByProject.get(p.id) ?? 0,
    openIssueCount: issueCountByProject.get(p.id) ?? 0,
  }));

  return NextResponse.json(enriched);
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
