import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Shuffle } from "lucide-react";
import type { Fragrance } from "../types";
import { pickOwned } from "../lib/picker";
import { BottleImage } from "./BottleImage";
import { Dialog } from "./Dialog";
export function PickForMe({
  fragrances,
  onClose,
  onOpen,
}: {
  fragrances: Fragrance[];
  onClose: () => void;
  onOpen: (f: Fragrance) => void;
}) {
  const [result, setResult] = useState<Fragrance>();
  const [selecting, setSelecting] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  function pick() {
    clearTimeout(timer.current);
    setSelecting(true);
    timer.current = setTimeout(
      () => {
        setResult(pickOwned(fragrances, Math.random, result?.id));
        setSelecting(false);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 850,
    );
  }
  useEffect(() => {
    pick();
    return () => clearTimeout(timer.current);
  }, []); // One selection on opening; timer cleaned on unmount.
  return (
    <Dialog title="Pick for Me" onClose={onClose} className="picker-dialog">
      <p className="eyebrow">A little serendipity</p>
      <h2>
        {selecting
          ? "Finding your bottle…"
          : result
            ? "This one, today."
            : "Your shelf is waiting."}
      </h2>
      <div className={`picker-stage ${selecting ? "selecting" : "revealed"}`}>
        {selecting ? (
          <Shuffle size={40} strokeWidth={1} />
        ) : result ? (
          <BottleImage fragrance={result} eager />
        ) : (
          <p>Add an owned fragrance to make your first pick.</p>
        )}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {!selecting && result && (
          <>
            <p className="brand">{result.brand}</p>
            <h3>{result.name}</h3>
            <p className="muted small">
              Selected at random from your Collection.
            </p>
          </>
        )}
      </div>
      <div className="picker-actions">
        <button
          className="button secondary"
          onClick={pick}
          disabled={selecting || !fragrances.some((f) => f.status === "owned")}
        >
          <Shuffle size={15} /> Pick again
        </button>
        {result && !selecting && (
          <button className="button" onClick={() => onOpen(result)}>
            View fragrance <ArrowUpRight size={16} />
          </button>
        )}
      </div>
    </Dialog>
  );
}
