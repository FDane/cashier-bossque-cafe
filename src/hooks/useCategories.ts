"use client";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { paths } from "@/lib/firestore/paths";
import type { Category } from "@/types/models";
export const useCategories = (b: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(
    () =>
      onSnapshot(collection(db, paths.categories(b)), (s) =>
        setCategories(
          s.docs.map((d) => ({ id: d.id, ...d.data() }) as Category),
        ),
      ),
    [b],
  );
  return categories;
};
