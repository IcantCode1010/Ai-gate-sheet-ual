import { useState } from "react";

export default function TopBar({ onSave, onExportCSV, onNewSheet, onEndShift, dark, onToggleDark }) {
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSave() {
    onSave();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  return (
    <div className="top-bar no-print">
      <div className="top-bar-title">
        <span className="app-title">HMC Gate Sheet</span>
        <span className="app-subtitle">AI Gate Call Logger</span>
      </div>

      <div className="top-bar-actions">
        <button className="btn btn-save" onClick={handleSave}>
          {savedFlash ? "✓ Saved" : "Save"}
        </button>
        <button className="btn btn-secondary" onClick={onExportCSV}>
          CSV
        </button>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          Print / PDF
        </button>
        <button className="btn btn-ghost" onClick={onNewSheet}>
          New Sheet
        </button>
        <button className="btn btn-end-shift" onClick={onEndShift}>
          End Shift
        </button>
        <button
          className="btn btn-icon"
          onClick={onToggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? "☀" : "☽"}
        </button>
      </div>
    </div>
  );
}
