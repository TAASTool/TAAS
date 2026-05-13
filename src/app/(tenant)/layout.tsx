import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TenantSidebar } from "@/components/layout/Sidebar";

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.userType !== "tenant") redirect("/login");

  const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId! } });

  return (
    <div className="flex min-h-screen">
      <TenantSidebar
        roles={session.user.roles}
        userName={session.user.name || ""}
        tenantName={tenant?.name}
      />
      <main className="ml-60 flex-1 min-h-screen bg-slate-50">
        {children}
      </main>
    </div>
  );
}
