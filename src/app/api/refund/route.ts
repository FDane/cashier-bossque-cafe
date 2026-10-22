import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { paths } from "@/lib/firestore/paths";
import { requireSession, jsonError } from "@/lib/auth/server";
const schema = z.object({
  orderId: z.string(),
  reason: z.string().min(3),
  amountSen: z.number().int().positive(),
});
export async function POST(request: Request) {
  try {
    const a = await requireSession(["ADMIN", "MANAGER"]);
    const input = schema.parse(await request.json());
    const ref = a.db.doc(`${paths.orders(a.businessId)}/${input.orderId}`);
    await a.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.data()?.status !== "COMPLETED")
        throw new Error("Only completed orders can be refunded");
      tx.update(ref, {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
        refundReason: input.reason,
        refundedAmountSen: input.amountSen,
        refundedAt: Timestamp.now(),
      });
      const day = new Date().toISOString().slice(0, 10);
      tx.set(
        a.db.doc(`${paths.dailyStats(a.businessId)}/${day}`),
        { totalRevenueSen: FieldValue.increment(-input.amountSen) },
        { merge: true },
      );
      tx.create(
        a.db.doc(
          `${paths.stockMovements(a.businessId)}/${crypto.randomUUID()}`,
        ),
        {
          reason: "REFUND",
          orderId: input.orderId,
          delta: 0,
          userId: a.uid,
          cashierId: a.uid,
          cashierName: a.user.name,
          createdAt: Timestamp.now(),
        },
      );
    });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
