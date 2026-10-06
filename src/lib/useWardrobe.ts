import { useEffect, useState } from "react";
import type { Fragrance } from "../types";
import { seedFragrances } from "../data/seed";
import { loadWardrobe, saveWardrobe } from "./persistence";
export function useWardrobe() {
  const [initial] = useState(() => {
    try {
      return loadWardrobe(window.localStorage);
    } catch {
      return {
        fragrances: structuredClone(seedFragrances),
        writable: false,
        warning: "Browser storage is unavailable.",
      };
    }
  });
  const [fragrances, setFragrances] = useState(initial.fragrances);
  const [warning, setWarning] = useState(initial.warning);
  useEffect(() => {
    if (!initial.writable) return;
    let saved = false;
    try {
      saved = saveWardrobe(window.localStorage, fragrances);
    } catch {
      /* Storage access itself can be blocked. */
    }
    if (!saved)
      setWarning(
        "Changes could not be saved. Keep this tab open; browser storage may be full or blocked.",
      );
  }, [fragrances, initial.writable]);
  const save = (fragrance: Fragrance) =>
    setFragrances((current) =>
      current.some((f) => f.id === fragrance.id)
        ? current.map((f) => (f.id === fragrance.id ? fragrance : f))
        : [...current, fragrance],
    );
  const remove = (id: string) =>
    setFragrances((current) => current.filter((f) => f.id !== id));
  return { fragrances, save, remove, warning };
}
