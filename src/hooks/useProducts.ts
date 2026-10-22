"use client";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { paths } from "@/lib/firestore/paths";
import type { Product } from "@/types/models";
export const useProducts = (businessId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, paths.products(businessId)),
          where("active", "==", true),
        ),
        (s) => {
          setProducts(
            s.docs.map((d) => ({ id: d.id, ...d.data() }) as Product),
          );
          setLoading(false);
        },
        () => setLoading(false),
      ),
    [businessId],
  );
  return { products, loading };
};
