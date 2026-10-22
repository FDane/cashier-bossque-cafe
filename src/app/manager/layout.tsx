import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/server";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/manager");
  if (!session.user.isAdmin) redirect("/pos");
  return <>{children}</>;
}