import { prisma } from "@/lib/prisma";

export async function logAudit(
  tenantId: string,
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  before?: object | null,
  after?: object | null,
) {
  await prisma.auditLog.create({
    data: { tenantId, userId, action, entity, entityId, before, after },
  });
}
