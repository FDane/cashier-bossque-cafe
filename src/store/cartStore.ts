"use client";
import { create } from "zustand";
import type { CartItem, Product } from "@/types/models";
interface CartState {
  items: CartItem[];
  discountSen: number;
  note: string;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}
export const useCartStore = create<CartState>((set) => ({
  items: [],
  discountSen: 0,
  note: "",
  add: (p) =>
    set((s) => {
      const found = s.items.find((i) => i.productId === p.id);
      if (found)
        return {
          items: s.items.map((i) =>
            i.productId === p.id
              ? {
                  ...i,
                  qty: i.qty + 1,
                  lineTotalSen: (i.qty + 1) * i.unitPriceSen,
                }
              : i,
          ),
        };
      return {
        items: [
          ...s.items,
          {
            productId: p.id,
            name: p.name,
            sku: p.sku,
            qty: 1,
            unitPriceSen: p.priceSen,
            modifiers: [],
            lineTotalSen: p.priceSen,
          },
        ],
      };
    }),
  remove: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.productId !== id) })),
  setQty: (id, qty) =>
    set((s) => ({
      items:
        qty < 1
          ? s.items.filter((i) => i.productId !== id)
          : s.items.map((i) =>
              i.productId === id
                ? { ...i, qty, lineTotalSen: qty * i.unitPriceSen }
                : i,
            ),
    })),
  clear: () => set({ items: [], discountSen: 0, note: "" }),
}));
