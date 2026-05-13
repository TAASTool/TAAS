import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userType: "platform" | "tenant";
      tenantId: string | null;
      roles: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    userType: "platform" | "tenant";
    tenantId: string | null;
    roles: string[];
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    userType: "platform" | "tenant";
    tenantId: string | null;
    roles: string[];
  }
}

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  userType: "platform" | "tenant";
  tenantId: string | null;
  roles: string[];
};

export function isPlatformUser(user: SessionUser): boolean {
  return user.userType === "platform";
}

export function isSuperAdmin(user: SessionUser): boolean {
  return user.userType === "platform" && user.roles.includes("SUPER_ADMIN");
}

export function isTenantAdmin(user: SessionUser): boolean {
  return user.roles.includes("TENANT_ADMIN");
}

export function isScriptWriter(user: SessionUser): boolean {
  return user.roles.includes("SCRIPT_WRITER") || user.roles.includes("TENANT_ADMIN");
}

export function isTester(user: SessionUser): boolean {
  return (
    user.roles.includes("TESTER") ||
    user.roles.includes("TENANT_ADMIN") ||
    user.roles.includes("SCRIPT_WRITER")
  );
}

export function isFunctionalManager(user: SessionUser): boolean {
  return (
    user.roles.includes("FUNCTIONAL_MANAGER") || user.roles.includes("TENANT_ADMIN")
  );
}
