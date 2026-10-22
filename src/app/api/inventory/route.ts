import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { requireAdminSession, jsonError } from "@/lib/auth/server";

const inventorySchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  quantity: z.number().finite().min(0).max(1e9),
  reorderLevel: z.number().finite().min(0).max(1e9),
  cost: z.number().finite().min(0).max(1e9),
  price: z.number().finite().min(0).max(1e9),
  supplier: z.string().trim().max(200),
  unit: z.string().trim().min(1).max(40),
  sku: z.string().trim().max(100),
});

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) throw new Error("FORBIDDEN");
    const parsed = inventorySchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Check the required fields and enter valid non-negative amounts." }, { status: 400 });
    const item = await session.db.collection("inventory").add({
      ...parsed.data,
      businessId: session.businessId,
      updatedBy: session.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return Response.json({ id: item.id }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET() {
  try {
    const session = await requireAdminSession();
    const snapshot = await session.db.collection("inventory")
      .where("businessId", "==", session.businessId)
      .orderBy("name")
      .get();
    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });
    return Response.json({ items });
  } catch (error) {
    return jsonError(error);
  }
}