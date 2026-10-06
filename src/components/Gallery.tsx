import { ArrowUpRight, LockKeyhole, Star } from "lucide-react";
import type { Fragrance, FragranceStatus } from "../types";
import { sections } from "../types";
import { BottleImage } from "./BottleImage";
export function Gallery({
  fragrances,
  status,
  onOpen,
  onAdd,
}: {
  fragrances: Fragrance[];
  status: FragranceStatus;
  onOpen: (f: Fragrance) => void;
  onAdd: () => void;
}) {
  return (
    <section
      aria-label={sections[status].title}
      className="gallery"
      key={status}
    >
      {fragrances.length ? (
        <div className="fragrance-grid">
          {fragrances.map((f, i) => (
            <button
              key={f.id}
              className={`fragrance-card ${status}`}
              onClick={() => onOpen(f)}
            >
              <div className="bottle-stage">
                <span className="shelf-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {status === "wishlist" && (
                  <span className="lock-label">
                    <LockKeyhole size={12} /> Locked
                  </span>
                )}
                <BottleImage fragrance={f} eager={i < 4} />
                <span className="card-open">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <div className="card-caption">
                <p className="brand">{f.brand}</p>
                <h3>{f.name}</h3>
                <div className="card-meta">
                  <span>
                    {status === "archived" && f.archive?.exitReason
                      ? f.archive.exitReason
                      : f.concentration || "Fragrance"}
                  </span>
                  {f.rating !== undefined && (
                    <span className="rating">
                      <Star size={12} /> {f.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="eyebrow">A little room on the shelf</p>
          <h3>
            {status === "wishlist"
              ? "Something to look forward to."
              : status === "archived"
                ? "Every bottle has a story."
                : "Your collection starts here."}
          </h3>
          <p>
            {status === "archived"
              ? "Previously owned bottles will find a home here."
              : "Add a fragrance to make this shelf your own."}
          </p>
          <button className="button" onClick={onAdd}>
            Add fragrance
          </button>
        </div>
      )}
    </section>
  );
}
