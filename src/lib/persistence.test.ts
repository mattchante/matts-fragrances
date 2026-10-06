import test from "node:test";
import assert from "node:assert/strict";
import {
  isFragrance,
  loadWardrobe,
  saveWardrobe,
  STORAGE_KEY,
} from "./persistence";
import { pickOwned } from "./picker";
import { seedFragrances } from "../data/seed";
import type { Fragrance } from "../types";
function memory(raw: string | null = null) {
  return {
    raw,
    getItem() {
      return this.raw;
    },
    setItem(_key: string, value: string) {
      this.raw = value;
    },
  };
}
const fixture: Fragrance = {
  id: "test",
  brand: "Brand",
  name: "Bottle",
  image: "/images/test.webp",
  status: "owned",
};
test("first visit seeds without sharing mutable defaults", () => {
  const loaded = loadWardrobe(memory());
  assert.deepEqual(loaded.fragrances, seedFragrances);
  assert.notEqual(loaded.fragrances, seedFragrances);
  assert.equal(loaded.writable, true);
});
test("all source wardrobe entries have unique IDs and real local images", () => {
  assert.equal(seedFragrances.length, 36);
  assert.equal(new Set(seedFragrances.map((f) => f.id)).size, 36);
  assert.deepEqual(
    ["owned", "wishlist", "archived"].map(
      (s) => seedFragrances.filter((f) => f.status === s).length,
    ),
    [10, 23, 3],
  );
  assert.ok(seedFragrances.every(isFragrance));
  assert.ok(seedFragrances.every((f) => f.image.startsWith("/images/")));
});
test("saved additions and every metadata field survive reload", () => {
  const storage = memory();
  const f: Fragrance = {
    ...fixture,
    userCreated: true,
    rating: 0,
    notes: ["Amber"],
    wishlist: {
      priority: 1,
      targetPrice: 0,
      sampled: false,
      reasonWanted: "Test",
      nextBuy: true,
    },
    archive: { exitReason: "finished", wouldRebuy: false },
  };
  assert.ok(saveWardrobe(storage, [f]));
  assert.deepEqual(loadWardrobe(storage).fragrances, [f]);
  assert.ok(storage.raw?.includes('"version":1'));
});
test("an intentionally empty collection remains empty", () => {
  const storage = memory();
  saveWardrobe(storage, []);
  assert.deepEqual(loadWardrobe(storage).fragrances, []);
});
test("corrupt, unsupported, duplicate and invalid data is preserved without permission to overwrite", () => {
  for (const raw of [
    "broken",
    "null",
    JSON.stringify({ version: 2, fragrances: [fixture] }),
    JSON.stringify({ version: 1, fragrances: [fixture, fixture] }),
    JSON.stringify({ version: 1, fragrances: [{ ...fixture, rating: 11 }] }),
    JSON.stringify({
      version: 1,
      fragrances: [{ ...fixture, wishlist: { sampled: "yes" } }],
    }),
  ]) {
    const storage = memory(raw);
    const result = loadWardrobe(storage);
    assert.equal(result.writable, false);
    assert.ok(result.warning);
    assert.equal(storage.raw, raw);
  }
});
test("optional values are validated and unknown personal values stay unset", () => {
  assert.equal(
    isFragrance({ ...fixture, archive: { exitReason: "lost" } }),
    false,
  );
  assert.equal(isFragrance({ ...fixture, notes: [2] }), false);
  assert.equal(isFragrance({ ...fixture, rating: NaN }), false);
  assert.ok(
    seedFragrances.every(
      (f) =>
        f.rating === undefined &&
        f.wishlist === undefined &&
        f.archive === undefined,
    ),
  );
});
test("blocked storage and quota failures are surfaced safely", () => {
  const blocked = {
    getItem() {
      throw Error("Blocked");
    },
    setItem() {
      throw Error("Quota");
    },
  };
  assert.equal(loadWardrobe(blocked).writable, false);
  assert.equal(saveWardrobe(blocked, [fixture]), false);
  assert.equal(STORAGE_KEY, "matts-fragrances:wardrobe");
});
test("picker only returns owned bottles and skips the previous bottle when possible", () => {
  const list: Fragrance[] = [
    { ...fixture, id: "wish", status: "wishlist" },
    { ...fixture, id: "archive", status: "archived" },
    { ...fixture, id: "one" },
    { ...fixture, id: "two" },
  ];
  assert.equal(pickOwned(list, () => 0)?.id, "one");
  assert.equal(pickOwned(list, () => 0.999)?.id, "two");
  assert.equal(pickOwned(list, () => 0, "one")?.id, "two");
});
test("picker handles no owned fragrances and a single owned fragrance", () => {
  assert.equal(pickOwned([{ ...fixture, status: "wishlist" }]), undefined);
  assert.equal(pickOwned([fixture], () => 0, "test")?.id, "test");
});
