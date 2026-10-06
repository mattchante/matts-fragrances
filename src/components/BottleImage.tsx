import { useEffect, useState } from "react";
import type { Fragrance } from "../types";
export function BottleImage({
  fragrance,
  eager = false,
}: {
  fragrance: Fragrance;
  eager?: boolean;
}) {
  // Version bundled photos without rewriting persisted records or custom image URLs.
  const image = /^\/images\/[^/?]+\.webp$/.test(fragrance.image)
    ? `${fragrance.image}?v=20261006`
    : fragrance.image;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [fragrance.image]);
  return failed || !fragrance.image ? (
    <div className="image-fallback">
      <span>{fragrance.brand}</span>
      <p>Photograph unavailable</p>
    </div>
  ) : (
    <img
      key={fragrance.image}
      src={image}
      alt={`${fragrance.brand} ${fragrance.name} bottle`}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
