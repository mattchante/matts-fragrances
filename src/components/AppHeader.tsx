import { Plus, Shuffle } from "lucide-react";
export function AppHeader({
  onAdd,
  onPick,
  canPick,
}: {
  onAdd: () => void;
  onPick: () => void;
  canPick: boolean;
}) {
  return (
    <header className="app-header">
      <a className="wordmark" href="#main">
        Matt’s <span>Fragrances</span>
        <span className="wordmark-dot">.</span>
      </a>
      <div className="header-actions">
        <button className="pick-button" onClick={onPick} disabled={!canPick}>
          <Shuffle size={16} />
          <span>Pick for Me</span>
        </button>
        <span className="header-divider" />
        <button
          className="add-button"
          aria-label="Add fragrance"
          onClick={onAdd}
        >
          <Plus size={18} />
          <span>Add fragrance</span>
        </button>
      </div>
    </header>
  );
}
