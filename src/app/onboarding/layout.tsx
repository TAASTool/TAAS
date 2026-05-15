import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.userType !== "tenant") redirect("/login");
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-700 via-forest-800 to-slate-900 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
