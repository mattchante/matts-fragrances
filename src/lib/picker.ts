import type { Fragrance } from "../types";
export function pickOwned(
  fragrances: Fragrance[],
  random = Math.random,
  previousId?: string,
): Fragrance | undefined {
  const owned = fragrances.filter((f) => f.status === "owned");
  const pool =
    owned.length > 1 ? owned.filter((f) => f.id !== previousId) : owned;
  return pool.length
    ? pool[
        Math.min(
          pool.length - 1,
          Math.max(0, Math.floor(random() * pool.length)),
        )
      ]
    : undefined;
}
