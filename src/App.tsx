import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Fragrance, FragranceStatus } from "./types";
import { sections } from "./types";
import { useWardrobe } from "./lib/useWardrobe";
import { AppHeader } from "./components/AppHeader";
import { Gallery } from "./components/Gallery";
import { FragranceModal } from "./components/FragranceModal";
import { FragranceForm } from "./components/FragranceForm";
import { PickForMe } from "./components/PickForMe";
type Overlay =
  | { type: "profile"; id: string }
  | { type: "form"; fragrance?: Fragrance; status: FragranceStatus }
  | { type: "picker" }
  | null;
export default function App() {
  const { fragrances, save, remove, warning } = useWardrobe();
  const [status, setStatus] = useState<FragranceStatus>("owned");
  const [overlay, setOverlayState] = useState<Overlay>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const shelfNav = useRef<HTMLElement>(null);
  const setOverlay = (next: Overlay) => {
    if (next && !overlay && document.activeElement instanceof HTMLElement) {
      returnFocus.current = document.activeElement;
    }
    setOverlayState(next);
  };
  useEffect(() => {
    if (!overlay && returnFocus.current) {
      if (returnFocus.current.isConnected) returnFocus.current.focus();
      else
        shelfNav.current
          ?.querySelector<HTMLButtonElement>("[aria-current]")
          ?.focus();
      returnFocus.current = null;
    }
  }, [overlay]);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  const announce = (text: string) => {
    clearTimeout(noticeTimer.current);
    setNotice(text);
    noticeTimer.current = setTimeout(() => setNotice(""), 3600);
  };
  const onSave = (f: Fragrance) => {
    const previous = fragrances.find((x) => x.id === f.id);
    save(f);
    setOverlay(null);
    setStatus(f.status);
    announce(
      previous?.status === "wishlist" && f.status === "owned"
        ? `${f.name} unlocked. Welcome to the Collection.`
        : `${f.name} saved.`,
    );
  };
  const open = (f: Fragrance) => setOverlay({ type: "profile", id: f.id });
  const selected =
    overlay?.type === "profile"
      ? fragrances.find((f) => f.id === overlay.id)
      : undefined;
  const counts = (s: FragranceStatus) =>
    fragrances.filter((f) => f.status === s).length;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to collection
      </a>
      <div className="app-shell">
        <AppHeader
          onAdd={() => setOverlay({ type: "form", status })}
          onPick={() => setOverlay({ type: "picker" })}
          canPick={counts("owned") > 0}
        />
        <main id="main">
          <div className="intro">
            <div>
              <p className="eyebrow">
                <span className="status-dot" /> A personal fragrance wardrobe
              </p>
              <h1>
                A collection.
                <br />
                <span>A little obsession.</span>
              </h1>
            </div>
            <p className="intro-aside">
              Some bottles become signatures.
              <br />
              Others become stories.
              <br />
              <span>These are mine.</span>
            </p>
          </div>
          <nav
            ref={shelfNav}
            className="shelf-nav"
            aria-label="Fragrance shelves"
          >
            {(Object.keys(sections) as FragranceStatus[]).map((s) => (
              <button
                key={s}
                aria-current={status === s ? "page" : undefined}
                onClick={() => setStatus(s)}
                className={status === s ? "active" : ""}
              >
                <span>{sections[s].title}</span>
                <small>
                  {counts(s)} {sections[s].unit}
                </small>
              </button>
            ))}
            <span className="nav-note">Curated, one bottle at a time.</span>
          </nav>
          <div className="section-heading">
            <p>{sections[status].description}</p>
            <span>
              {String(counts(status)).padStart(2, "0")} bottles{" "}
              <ArrowUpRight size={13} />
            </span>
          </div>
          {warning && (
            <p className="storage-warning" role="alert">
              {warning}
            </p>
          )}
          <Gallery
            fragrances={fragrances.filter((f) => f.status === status)}
            status={status}
            onOpen={open}
            onAdd={() => setOverlay({ type: "form", status })}
          />
        </main>
        <footer>
          <span>Matt’s Fragrances</span>
          <span>A shelf of small obsessions.</span>
          <span>Personal collection / V1</span>
        </footer>
      </div>
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <span className="status-dot" />
            {notice}
          </>
        )}
      </div>
      {selected && (
        <FragranceModal
          key={selected.id}
          fragrance={selected}
          onClose={() => setOverlay(null)}
          onEdit={(s) =>
            setOverlay({
              type: "form",
              fragrance: selected,
              status: s ?? selected.status,
            })
          }
          onMove={() => onSave({ ...selected, status: "owned" })}
        />
      )}{" "}
      {overlay?.type === "form" && (
        <FragranceForm
          fragrance={overlay.fragrance}
          defaultStatus={overlay.status}
          onSave={onSave}
          onClose={() => setOverlay(null)}
          onDelete={(id) => {
            remove(id);
            setOverlay(null);
            announce("Fragrance removed.");
          }}
        />
      )}{" "}
      {overlay?.type === "picker" && (
        <PickForMe
          fragrances={fragrances}
          onClose={() => setOverlay(null)}
          onOpen={open}
        />
      )}
    </>
  );
}
