import { useState } from "react";

const SYNC_COLORS = { synced: "#2a7a2a", syncing: "#a07000", offline: "#cc2222" };
const SYNC_LABELS = { synced: "Saved", syncing: "Saving...", offline: "Offline" };

export default function TopBar({
  onSave, onExportCSV, onNewSheet, onEndShift, dark, onToggleDark,
  displayName, onLogout, onInvite,
  showStatusBoard, onToggleStatusBoard,
  showHistory, onToggleHistory,
  showDashboard, onToggleDashboard, onShowSheet,
  syncStatus = "synced",
}) {
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSave() {
    onSave?.();
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
        <nav className="top-bar-nav" aria-label="Main navigation">
          <button
            className={`btn btn-nav${!showDashboard ? " btn-active" : ""}`}
            onClick={onShowSheet}
            title="Gate sheet"
          >
            Sheet
          </button>
          <button
            className={`btn btn-nav nav-dashboard${showDashboard ? " btn-active" : ""}`}
            onClick={onToggleDashboard}
            title="User dashboard"
          >
            Dashboard
          </button>
          <button
            className={`btn btn-nav${showStatusBoard ? " btn-active" : ""}`}
            onClick={onToggleStatusBoard}
            title="Live status board"
          >
            Status
          </button>
          <button
            className={`btn btn-nav${showHistory ? " btn-active" : ""}`}
            onClick={onToggleHistory}
            title="Shift history"
          >
            History
          </button>
          <button className="btn btn-nav" onClick={onInvite} title="Invite team member">
            Invite
          </button>
        </nav>

        {!showDashboard && (
          <div className="top-bar-sheet-actions" aria-label="Sheet actions">
            <span
              className="sync-dot"
              title={SYNC_LABELS[syncStatus]}
              style={{ background: SYNC_COLORS[syncStatus] }}
            />
            <>
              <button className="btn btn-save" onClick={handleSave}>
                {savedFlash ? "Saved" : "Save"}
              </button>
              <button className="btn btn-secondary" onClick={onExportCSV}>CSV</button>
              <button className="btn btn-secondary" onClick={() => window.print()}>Print / PDF</button>
              <button className="btn btn-ghost" onClick={onNewSheet}>New Sheet</button>
              <button className="btn btn-end-shift" onClick={onEndShift}>End Shift</button>
            </>
          </div>
        )}

        <div className="top-bar-account">
          {displayName && (
            <span className="top-bar-user" title="Logged in as">{displayName}</span>
          )}
          <button
            className="btn btn-icon"
            onClick={onToggleDark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "Light" : "Dark"}
          </button>
          {onLogout && (
            <button className="btn btn-ghost" onClick={onLogout} style={{ fontSize: 11 }}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
