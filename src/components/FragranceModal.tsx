import { Archive, ArrowRight, LockKeyhole, Pencil, Star } from "lucide-react";
import type { Fragrance, FragranceStatus } from "../types";
import { sections } from "../types";
import { BottleImage } from "./BottleImage";
import { Dialog } from "./Dialog";
const yesNo = (value?: boolean) =>
  value === undefined ? "Not set" : value ? "Yes" : "No";
export function FragranceModal({
  fragrance: f,
  onClose,
  onEdit,
  onMove,
}: {
  fragrance: Fragrance;
  onClose: () => void;
  onEdit: (status?: FragranceStatus) => void;
  onMove: () => void;
}) {
  return (
    <Dialog
      title={`${f.brand} ${f.name}`}
      onClose={onClose}
      className="profile-dialog"
    >
      <div className={`profile-image ${f.status}`}>
        <BottleImage fragrance={f} eager />
        <span className="profile-image-caption">
          Matt’s Fragrances / {sections[f.status].title}
        </span>
      </div>
      <div className="profile-content">
        <p className="eyebrow profile-state">
          {f.status === "wishlist" ? (
            <LockKeyhole size={13} />
          ) : f.status === "archived" ? (
            <Archive size={13} />
          ) : (
            <span className="status-dot" />
          )}
          {sections[f.status].title}
        </p>
        <p className="brand">{f.brand}</p>
        <h2>{f.name}</h2>
        {f.concentration && <p className="concentration">{f.concentration}</p>}
        <button
          className="profile-rating"
          onClick={() => onEdit()}
          aria-label="Edit personal rating"
        >
          <Star size={19} />
          {f.rating === undefined ? (
            <span>
              Add your rating <small>One personal score. Entirely yours.</small>
            </span>
          ) : (
            <span>
              {f.rating.toFixed(1)} <em>/ 10</em>
              <small>Your overall rating</small>
            </span>
          )}
        </button>
        <div className="profile-section">
          <h3>Scent profile</h3>
          <p>{f.scentProfile || "Still to be explored."}</p>
          {f.notes?.length ? (
            <p className="notes">{f.notes.join(" · ")}</p>
          ) : (
            <p className="muted small">No notes added yet.</p>
          )}
        </div>
        {f.status === "wishlist" && (
          <div className="profile-section">
            <h3>On the horizon</h3>
            <dl>
              <div>
                <dt>Priority</dt>
                <dd>
                  {f.wishlist?.priority === undefined
                    ? "Not set"
                    : `${f.wishlist.priority} / 5`}
                </dd>
              </div>
              <div>
                <dt>Target price</dt>
                <dd>
                  {f.wishlist?.targetPrice === undefined
                    ? "Not set"
                    : new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(f.wishlist.targetPrice)}
                </dd>
              </div>
              <div>
                <dt>Sampled</dt>
                <dd>{yesNo(f.wishlist?.sampled)}</dd>
              </div>
              <div>
                <dt>Next buy</dt>
                <dd>{yesNo(f.wishlist?.nextBuy)}</dd>
              </div>
            </dl>
            {f.wishlist?.reasonWanted && (
              <p className="reason">{f.wishlist.reasonWanted}</p>
            )}
          </div>
        )}
        {f.status === "archived" && (
          <div className="profile-section">
            <h3>A bottle remembered</h3>
            <dl>
              <div>
                <dt>Exit reason</dt>
                <dd className="capitalize">
                  {f.archive?.exitReason || "Not set"}
                </dd>
              </div>
              <div>
                <dt>Would buy again</dt>
                <dd>{yesNo(f.archive?.wouldRebuy)}</dd>
              </div>
            </dl>
          </div>
        )}
        <div className="profile-actions">
          {f.status === "wishlist" ? (
            <button className="button" onClick={onMove}>
              Add to Collection <ArrowRight size={16} />
            </button>
          ) : f.status === "owned" ? (
            <button
              className="button secondary"
              onClick={() => onEdit("archived")}
            >
              <Archive size={16} /> Move to Archive
            </button>
          ) : (
            <button className="button secondary" onClick={onMove}>
              Return to Collection <ArrowRight size={16} />
            </button>
          )}
          <button className="text-button" onClick={() => onEdit()}>
            <Pencil size={14} /> Edit details
          </button>
        </div>
      </div>
    </Dialog>
  );
}
