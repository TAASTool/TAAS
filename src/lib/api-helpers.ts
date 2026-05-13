import { auth } from "../../auth";
import { NextResponse } from "next/server";
import type { SessionUser } from "@/types";

export type ApiContext = {
  user: SessionUser;
  tenantId: string;
};

export async function requireTenantAuth(
  allowedRoles?: string[]
): Promise<{ context: ApiContext } | { error: NextResponse }> {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.userType !== "tenant" || !session.user.tenantId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((r) => session.user.roles.includes(r));
    if (!hasRole) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }
  return {
    context: {
      user: session.user as SessionUser,
      tenantId: session.user.tenantId,
    },
  };
}

export async function requirePlatformAuth(
  allowedRoles?: string[]
): Promise<{ context: { user: SessionUser } } | { error: NextResponse }> {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.userType !== "platform") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((r) => session.user.roles.includes(r));
    if (!hasRole) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }
  return { context: { user: session.user as SessionUser } };
}

export function tenantFilter(tenantId: string) {
  return { tenantId };
}
