"use client";
import { useEffect } from "react";
export const useBarcodeWedge = (onScan: (value: string) => void) => {
  useEffect(() => {
    let buffer = "",
      started = 0;
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(el.tagName)) return;
      if (e.key === "Enter" && buffer.length > 3) {
        onScan(buffer);
        buffer = "";
        return;
      }
      if (e.key.length === 1) {
        if (!started) started = Date.now();
        buffer += e.key;
        if (Date.now() - started > 250) {
          buffer = "";
          started = Date.now();
        }
      }
    };
    addEventListener("keydown", handler);
    return () => removeEventListener("keydown", handler);
  }, [onScan]);
};
