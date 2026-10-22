import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/server";
import InventoryForm from "@/components/inventory/InventoryForm";

export default async function InventoryPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/inventory");
  if (!session.user.isAdmin) redirect("/pos");
  return <main className="page-shell"><p className="eyebrow">ADMIN / INVENTORY</p><h1 className="text-3xl font-bold mt-2">Add inventory</h1><p className="text-sm text-gray-500 mt-3 mb-7">Create a stock item for this business. Prices and costs are entered in RM.</p><InventoryForm/></main>;
}