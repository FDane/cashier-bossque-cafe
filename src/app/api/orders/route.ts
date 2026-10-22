import { Timestamp } from "firebase-admin/firestore";
import { paths } from "@/lib/firestore/paths";
import { requireSession, jsonError } from "@/lib/auth/server";
export async function POST(request: Request) {
  try {
    const a = await requireSession(["ADMIN", "MANAGER", "CASHIER"]);
    const body = await request.json();
    if (!Array.isArray(body.items) || !body.items.length)
      throw new Error("Items required");
    const id = crypto.randomUUID();
    await a.db
      .doc(`${paths.orders(a.businessId)}/${id}`)
      .set({
        idempotencyKey: id,
        channel: "POS",
        status: "PENDING",
        paymentStatus: "UNPAID",
        ...body, cashierId: a.uid, cashierName: a.user.name,
        createdAt: Timestamp.now(),
      });
    return Response.json({ id });
  } catch (e) {
    return jsonError(e);
  }
}
