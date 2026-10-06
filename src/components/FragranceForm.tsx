import { useId, useState, type FormEvent } from "react";
import { Check, Trash2 } from "lucide-react";
import type { Fragrance, FragranceStatus } from "../types";
import { exitReasons, sections } from "../types";
import { Dialog } from "./Dialog";
const optionalNumber = (value: FormDataEntryValue | null) =>
  value === null || value === "" ? undefined : Number(value);
const triState = (value: FormDataEntryValue | null) =>
  value === "yes" ? true : value === "no" ? false : undefined;
export function FragranceForm({
  fragrance,
  defaultStatus,
  onSave,
  onClose,
  onDelete,
}: {
  fragrance?: Fragrance;
  defaultStatus: FragranceStatus;
  onSave: (f: Fragrance) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [status, setStatus] = useState<FragranceStatus>(defaultStatus);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const prefix = useId();
  const booleanField = (name: string, label: string, value?: boolean) => (
    <label htmlFor={prefix + name}>
      {label}
      <select
        id={prefix + name}
        name={name}
        defaultValue={value === undefined ? "" : value ? "yes" : "no"}
      >
        <option value="">Not set</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const image = text("image");
    if (
      image &&
      !/^https:\/\/\S+$/.test(image) &&
      !/^\/images\/[^\s?#]+$/.test(image)
    ) {
      setError("Use an HTTPS image URL or a local /images/ path.");
      return;
    }
    const brand = text("brand"),
      name = text("name");
    if (!brand || !name) {
      setError("Brand and fragrance name are required.");
      return;
    }
    onSave({
      ...fragrance,
      id: fragrance?.id ?? crypto.randomUUID(),
      userCreated: fragrance?.userCreated ?? !fragrance,
      brand,
      name,
      image,
      status,
      concentration: text("concentration") || undefined,
      rating: optionalNumber(data.get("rating")),
      scentProfile: text("scentProfile") || undefined,
      notes: text("notes")
        ? text("notes")
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean)
        : undefined,
      wishlist:
        status === "wishlist"
          ? {
              priority: optionalNumber(data.get("priority")),
              targetPrice: optionalNumber(data.get("targetPrice")),
              sampled: triState(data.get("sampled")),
              nextBuy: triState(data.get("nextBuy")),
              reasonWanted: text("reasonWanted") || undefined,
            }
          : fragrance?.wishlist,
      archive:
        status === "archived"
          ? {
              exitReason: exitReasons.find((r) => r === text("exitReason")),
              wouldRebuy: triState(data.get("wouldRebuy")),
            }
          : fragrance?.archive,
    });
  }
  return (
    <Dialog
      title={fragrance ? "Edit fragrance" : "Add fragrance"}
      onClose={onClose}
      className="form-dialog"
    >
      <div className="form-heading">
        <p className="eyebrow">Your wardrobe, your way</p>
        <h2>{fragrance ? "Refine the details." : "A new addition."}</h2>
        <p>Leave anything you don’t know blank.</p>
      </div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Brand
            <input
              name="brand"
              required
              maxLength={100}
              defaultValue={fragrance?.brand}
            />
          </label>
          <label>
            Fragrance name
            <input
              name="name"
              required
              maxLength={160}
              defaultValue={fragrance?.name}
            />
          </label>
          <label>
            Shelf
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as FragranceStatus)}
            >
              {Object.entries(sections).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Concentration
            <input
              name="concentration"
              maxLength={80}
              placeholder="e.g. Eau de Parfum"
              defaultValue={fragrance?.concentration}
            />
          </label>
          <label className="full-width">
            Bottle image URL
            <input
              name="image"
              placeholder="https://… or /images/…"
              defaultValue={fragrance?.image}
            />
          </label>
          <label>
            Personal rating · out of 10
            <input
              name="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Unrated"
              defaultValue={fragrance?.rating}
            />
          </label>
          <label>
            Scent profile
            <input
              name="scentProfile"
              maxLength={300}
              placeholder="Your description"
              defaultValue={fragrance?.scentProfile}
            />
          </label>
          <label className="full-width">
            Notes · separated by commas
            <input
              name="notes"
              maxLength={600}
              placeholder="e.g. Bergamot, amber, vanilla"
              defaultValue={fragrance?.notes?.join(", ")}
            />
          </label>
        </div>
        {status === "wishlist" && (
          <fieldset>
            <legend>On the horizon</legend>
            <div className="form-grid">
              <label>
                Priority · 1 is highest
                <select
                  name="priority"
                  defaultValue={fragrance?.wishlist?.priority ?? ""}
                >
                  <option value="">Not set</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option value={n} key={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Target price · USD
                <input
                  name="targetPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={fragrance?.wishlist?.targetPrice}
                />
              </label>
              {booleanField("sampled", "Sampled", fragrance?.wishlist?.sampled)}
              {booleanField(
                "nextBuy",
                "Next buy",
                fragrance?.wishlist?.nextBuy,
              )}
              <label className="full-width">
                Why this one?
                <textarea
                  name="reasonWanted"
                  rows={3}
                  maxLength={1200}
                  defaultValue={fragrance?.wishlist?.reasonWanted}
                />
              </label>
            </div>
          </fieldset>
        )}
        {status === "archived" && (
          <fieldset>
            <legend>A bottle remembered</legend>
            <div className="form-grid">
              <label>
                Exit reason
                <select
                  name="exitReason"
                  defaultValue={fragrance?.archive?.exitReason ?? ""}
                >
                  <option value="">Not set</option>
                  {exitReasons.map((r) => (
                    <option key={r} value={r}>
                      {r[0].toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              {booleanField(
                "wouldRebuy",
                "Would buy again",
                fragrance?.archive?.wouldRebuy,
              )}
            </div>
          </fieldset>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button">
            <Check size={16} /> Save fragrance
          </button>
        </div>
      </form>
      {fragrance?.userCreated && (
        <div className="delete-area">
          {confirmDelete ? (
            <>
              <p>
                Delete {fragrance.name} from this browser? This cannot be
                undone.
              </p>
              <button
                className="text-button danger"
                onClick={() => onDelete(fragrance.id)}
              >
                Yes, delete fragrance
              </button>
              <button
                className="text-button"
                onClick={() => setConfirmDelete(false)}
              >
                Keep fragrance
              </button>
            </>
          ) : (
            <button
              className="text-button muted"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} /> Delete fragrance
            </button>
          )}
        </div>
      )}
    </Dialog>
  );
}
