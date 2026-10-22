"use client";
import { create } from "zustand";
export const useUiStore = create<{
  cartOpen: boolean;
  dark: boolean;
  setCartOpen: (v: boolean) => void;
  toggleDark: () => void;
}>((set) => ({
  cartOpen: false,
  dark: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  toggleDark: () => set((s) => ({ dark: !s.dark })),
}));
