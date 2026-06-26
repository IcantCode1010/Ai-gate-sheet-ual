import { useState, useMemo } from "react";
import TopBar from "./components/TopBar";
import ShiftHeader from "./components/ShiftHeader";
import GateSheet from "./components/GateSheet";
import ChatPanel from "./components/ChatPanel";
import ReferenceStrip from "./components/ReferenceStrip";
import ShiftSummaryModal from "./components/ShiftSummaryModal";
import StatusBoard from "./components/StatusBoard";
import ShiftHistoryPanel from "./components/ShiftHistoryPanel";
import InviteModal from "./components/InviteModal";
import { useShiftSync } from "./hooks/useShiftSync";
import { useDarkMode } from "./hooks/useDarkMode";
import { usePresence } from "./hooks/usePresence";

function exportCSV(sheet) {
  const headers = ["Date", "Shift", "Coordinator", "Row", "A/C", "Gate", "FLT I/B", "Time In", "FLT O/B", "Time Out", "Gate Calls", "Call Time", "Disp Time", "C/W Time"];
  const rows = sheet.entries.map((e, i) => [
    sheet.date, sheet.shiftType, sheet.coordinatorName, i + 1,
    e.ac, e.gate, e.fltIn, e.timeIn, e.fltOut, e.timeOut,
    `"${(e.problem || "").replace(/"/g, '""')}"`,
    e.callTime, e.dispTime, e.cwTime,
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hmc-gate-sheet-${sheet.date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App({ session, profile, onLogout }) {
  const userId = session?.user?.id;

  const {
    sheet, activeIndex, setActiveIndex,
    updateSheetField, updateEntry, addEntry, removeEntry, newSheet, applyAiFields,
    addAndApplyFields, syncStatus, loadShift,
  } = useShiftSync(userId);

  const [dark, toggleDark] = useDarkMode();
  const [showSummary, setShowSummary] = useState(false);
  const [showStatusBoard, setShowStatusBoard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // Build presence payload for status board
  const lastEntry = sheet.entries.filter(e => e.ac).at(-1);
  const presencePayload = useMemo(() => ({
    userId,
    displayName: profile?.display_name || session?.user?.email || "Unknown",
    shiftType: sheet.shiftType,
    date: sheet.date,
    aircraftCount: sheet.entries.filter(e => e.ac).length,
    lastAc: lastEntry?.ac || "",
    lastGate: lastEntry?.gate || "",
    updatedAt: new Date().toISOString(),
  }), [userId, profile, sheet, lastEntry]);

  const onlineUsers = usePresence(presencePayload);

  function handleNewSheet() {
    if (confirm("Start a new sheet? All current data will be cleared.")) {
      newSheet();
    }
  }

  function handleAddEntry() {
    const nextIndex = sheet.entries.length;
    addEntry();
    setActiveIndex(nextIndex);
  }

  return (
    <div className="app-root">
      <TopBar
        onSave={() => {}}
        onExportCSV={() => exportCSV(sheet)}
        onNewSheet={handleNewSheet}
        onEndShift={() => setShowSummary(true)}
        dark={dark}
        onToggleDark={toggleDark}
        displayName={profile?.display_name}
        onLogout={onLogout}
        onInvite={() => setShowInvite(true)}
        showStatusBoard={showStatusBoard}
        onToggleStatusBoard={() => setShowStatusBoard(s => !s)}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(s => !s)}
        syncStatus={syncStatus}
      />

      <div className="app-body">
        <div className="scroll-area">
          <ShiftHeader
            date={sheet.date}
            shiftType={sheet.shiftType}
            coordinatorName={sheet.coordinatorName}
            notes={sheet.notes}
            onChange={updateSheetField}
          />
          <GateSheet
            entries={sheet.entries}
            activeIndex={activeIndex}
            onActivate={setActiveIndex}
            onEntryChange={updateEntry}
            onRemove={removeEntry}
            onAddEntry={handleAddEntry}
          />
          <ReferenceStrip />
        </div>

        {showStatusBoard && (
          <StatusBoard
            users={onlineUsers}
            currentUserId={userId}
            onClose={() => setShowStatusBoard(false)}
          />
        )}

        {showHistory && (
          <ShiftHistoryPanel
            currentUserId={userId}
            onLoadShift={loadShift}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>

      <ChatPanel
        activeIndex={activeIndex}
        currentEntry={sheet.entries[activeIndex]}
        shiftType={sheet.shiftType}
        coordinatorName={sheet.coordinatorName}
        totalEntries={sheet.entries.length}
        onFieldsFilled={applyAiFields}
        onAddAndFill={(fields) => addAndApplyFields(fields, sheet.entries.length)}
      />

      {showSummary && (
        <ShiftSummaryModal
          sheet={sheet}
          onClose={() => setShowSummary(false)}
          onExportCSV={() => { exportCSV(sheet); setShowSummary(false); }}
        />
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
