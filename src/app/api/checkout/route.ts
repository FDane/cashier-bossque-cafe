import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { checkoutSchema } from "@/lib/checkout/schema";
import { paths } from "@/lib/firestore/paths";
import { requireSession, jsonError } from "@/lib/auth/server";
import type { CheckoutResult, CheckoutInput } from "@/types/api";
export async function POST(request: Request) {
  try {
    const auth = await requireSession(["ADMIN", "MANAGER", "CASHIER"]);
    const input = checkoutSchema.parse(await request.json()) as CheckoutInput;
    const result = await auth.db.runTransaction(async (tx) => {
      const orderId = input.orderId ?? input.idempotencyKey;
      const orderRef = auth.db.doc(
        `${paths.orders(auth.businessId)}/${orderId}`,
      );
      const existing = await tx.get(orderRef);
      if (existing.exists && existing.data()?.status === "COMPLETED")
        return {
          order: { id: orderId, ...existing.data() } as never,
          alreadyProcessed: true,
        };
      const productDocs = await Promise.all(
        input.items.map((i) =>
          auth.db
            .doc(`${paths.products(auth.businessId)}/${i.productId}`)
            .get(),
        ),
      );
      let subtotal = 0;
      const stockWarnings: string[] = [];
      for (let index = 0; index < input.items.length; index++) {
        const item = input.items[index];
        const product = productDocs[index].data();
        if (!product || product.active === false)
          throw new Error(`Product unavailable: ${item.productId}`);
        const unit =
          (product.priceSen as number) +
          item.modifiers.reduce((n, m) => n + m.priceDeltaSen, 0);
        if (unit !== item.unitPriceSen)
          throw new Error(`Price changed for ${item.name}`);
        subtotal += unit * item.qty;
      }
      const discount = Math.min(input.discountSen ?? 0, subtotal);
      const taxable = subtotal - discount;
      const business = (
        await tx.get(auth.db.doc(paths.business(auth.businessId)))
      ).data() ?? { taxRate: 0 };
      const tax = Math.round((taxable * (business.taxRate ?? 0)) / 100);
      const total = taxable + tax;
      const paid = input.payments.reduce((n, p) => n + p.amountSen, 0);
      const cash = input.payments.find((p) => p.method === "CASH");
      if (paid < total || ((cash?.amountSen ?? 0) < total && cash))
        throw new Error("Payment is insufficient");
      const day = new Date().toISOString().slice(0, 10);
      const counterRef = auth.db.doc(
        `${paths.counters(auth.businessId)}/receipt-${day}-${input.terminalId}`,
      );
      const counter = await tx.get(counterRef);
      const sequence = ((counter.data()?.value ?? 0) as number) + 1;
      tx.set(
        counterRef,
        { value: FieldValue.increment(1), updatedAt: Timestamp.now() },
        { merge: true },
      );
      const orderNumber = `${business.orderPrefix ?? "CAF"}-${day.replaceAll("-", "")}-${sequence.toString().padStart(4, "0")}`;
      const cashReceived = input.cashReceivedSen ?? 0;
      const change = Math.max(0, cashReceived - total);
      const order = {
        idempotencyKey: input.idempotencyKey,
        orderNumber,
        channel: "POS",
        status: "COMPLETED",
        items: input.items,
        subtotalSen: subtotal,
        discountSen: discount,
        discountReason: input.discountReason,
        taxSen: tax,
        totalSen: total,
        payments: input.payments,
        cashReceivedSen: cashReceived,
        changeSen: change,
        cashierId: auth.uid,
        cashierName: auth.user.name,
        terminalId: input.terminalId,
        customerId: input.customerId,
        notes: input.notes,
        tableOrPickupNo: input.tableOrPickupNo,
        createdAt: Timestamp.now(),
        paidAt: Timestamp.now(),
        paymentStatus: "PAID",
      };
      tx.set(orderRef, order);
      const statsRef = auth.db.doc(
        `${paths.dailyStats(auth.businessId)}/${day}`,
      );
      const increments: Record<string, unknown> = {
        totalOrders: FieldValue.increment(1),
        totalItemsSold: FieldValue.increment(
          input.items.reduce((n, i) => n + i.qty, 0),
        ),
        totalRevenueSen: FieldValue.increment(total),
        discountsSen: FieldValue.increment(discount),
        taxSen: FieldValue.increment(tax),
      };
      input.payments.forEach((p) => {
        const key =
          p.method === "CASH"
            ? "cashRevenueSen"
            : p.method === "CARD"
              ? "cardRevenueSen"
              : "onlineRevenueSen";
        increments[key] = FieldValue.increment(p.amountSen);
      });
      tx.set(statsRef, increments, { merge: true });
      for (const item of input.items) {
        const product = productDocs[input.items.indexOf(item)].data()!;
        const inventoryIds: string[] = [];
        if (product.stockTracked && product.trackedInventoryItemId)
          inventoryIds.push(product.trackedInventoryItemId);
        for (const recipe of product.recipe ?? [])
          inventoryIds.push(recipe.inventoryItemId);
        for (const inventoryId of inventoryIds) {
          const ref = auth.db.doc(
              `${paths.inventory()}/${inventoryId}`,
          );
          tx.update(ref, {
            quantity: FieldValue.increment(-item.qty),
            updatedAt: Timestamp.now(),
          });
          tx.create(
            auth.db.doc(
              `${paths.stockMovements(auth.businessId)}/${crypto.randomUUID()}`,
            ),
            {
              inventoryItemId: inventoryId,
              delta: -item.qty,
              reason: "SALE",
              orderId,
              userId: auth.uid,
              cashierId: auth.uid,
              cashierName: auth.user.name,
              createdAt: Timestamp.now(),
            },
          );
        }
      }
      return {
        order: { id: orderId, ...order } as never,
        warning: stockWarnings.length ? "Stock may be negative" : "",
      } satisfies CheckoutResult;
    });
    return Response.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
