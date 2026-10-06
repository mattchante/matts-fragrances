import type { Fragrance } from "../types";
import { exitReasons } from "../types";
import { seedFragrances } from "../data/seed";
export const STORAGE_KEY = "matts-fragrances:wardrobe";
const VERSION = 1;
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const optional = (v: unknown, check: (v: unknown) => boolean) =>
  v === undefined || check(v);
const string = (v: unknown) => typeof v === "string";
const bool = (v: unknown) => typeof v === "boolean";
const number = (v: unknown) => typeof v === "number" && Number.isFinite(v);
export function isFragrance(v: unknown): v is Fragrance {
  if (
    !object(v) ||
    !string(v.id) ||
    !v.id ||
    !string(v.brand) ||
    !v.brand ||
    !string(v.name) ||
    !v.name ||
    !string(v.image) ||
    !["owned", "wishlist", "archived"].includes(String(v.status))
  )
    return false;
  if (
    !["concentration", "scentProfile"].every((k) => optional(v[k], string)) ||
    !optional(v.userCreated, bool) ||
    !optional(
      v.rating,
      (x) => number(x) && Number(x) >= 0 && Number(x) <= 10,
    ) ||
    !optional(v.notes, (x) => Array.isArray(x) && x.every(string))
  )
    return false;
  if (v.wishlist !== undefined) {
    if (!object(v.wishlist)) return false;
    const w = v.wishlist;
    if (
      !optional(
        w.priority,
        (x) => number(x) && Number(x) >= 1 && Number(x) <= 5,
      ) ||
      !optional(w.targetPrice, (x) => number(x) && Number(x) >= 0) ||
      !optional(w.sampled, bool) ||
      !optional(w.nextBuy, bool) ||
      !optional(w.reasonWanted, string)
    )
      return false;
  }
  if (v.archive !== undefined) {
    if (
      !object(v.archive) ||
      !optional(v.archive.wouldRebuy, bool) ||
      !optional(v.archive.exitReason, (x) => exitReasons.some((r) => r === x))
    )
      return false;
  }
  return true;
}
export type LoadResult = {
  fragrances: Fragrance[];
  warning?: string;
  writable: boolean;
};
export function loadWardrobe(storage: StorageLike): LoadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null)
      return { fragrances: structuredClone(seedFragrances), writable: true };
    const data: unknown = JSON.parse(raw);
    if (
      !object(data) ||
      data.version !== VERSION ||
      !Array.isArray(data.fragrances) ||
      !data.fragrances.every(isFragrance) ||
      new Set(data.fragrances.map((f) => f.id)).size !== data.fragrances.length
    ) {
      return {
        fragrances: structuredClone(seedFragrances),
        writable: false,
        warning:
          "Saved data could not be read. Your original data is preserved. Export it before resetting in developer tools.",
      };
    }
    return { fragrances: data.fragrances, writable: true };
  } catch {
    return {
      fragrances: structuredClone(seedFragrances),
      writable: false,
      warning:
        "Browser storage is unavailable or unreadable. Changes will last for this visit only.",
    };
  }
}
export function saveWardrobe(
  storage: StorageLike,
  fragrances: Fragrance[],
): boolean {
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: VERSION, fragrances }),
    );
    return true;
  } catch {
    return false;
  }
}
