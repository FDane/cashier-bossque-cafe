import { z } from "zod";
export const checkoutSchema = z.object({
  orderId: z.string().optional(),
  idempotencyKey: z.string().min(12),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        name: z.string(),
        sku: z.string(),
        qty: z.number().int().positive(),
        unitPriceSen: z.number().int().nonnegative(),
        modifiers: z.array(
          z.object({
            groupId: z.string(),
            optionId: z.string(),
            name: z.string(),
            priceDeltaSen: z.number().int(),
          }),
        ),
        lineTotalSen: z.number().int(),
        notes: z.string().optional(),
      }),
    )
    .min(1),
  discountSen: z.number().int().nonnegative().default(0),
  discountReason: z.string().optional(),
  payments: z
    .array(
      z.object({
        method: z.enum(["CASH", "ONLINE", "CARD", "QR"]),
        amountSen: z.number().int().positive(),
        reference: z.string().optional(),
        provider: z.string().optional(),
      }),
    )
    .min(1),
  cashReceivedSen: z.number().int().nonnegative().default(0),
  cashierId: z.string().optional(),
  cashierName: z.string().optional(),
  terminalId: z.string(),
  customerId: z.string().optional(),
  notes: z.string().optional(),
  tableOrPickupNo: z.string().optional(),
});
