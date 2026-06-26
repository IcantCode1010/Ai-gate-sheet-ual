import { useState } from "react";
import TopBar from "./components/TopBar";
import ShiftHeader from "./components/ShiftHeader";
import GateSheet from "./components/GateSheet";
import ChatPanel from "./components/ChatPanel";
import ReferenceStrip from "./components/ReferenceStrip";
import ShiftSummaryModal from "./components/ShiftSummaryModal";
import { useSheet } from "./hooks/useSheet";
import { useDarkMode } from "./hooks/useDarkMode";

function exportCSV(sheet) {
  const headers = ["Date", "Shift", "Coordinator", "Row", "A/C", "Gate", "FLT I/B", "Time In", "FLT O/B", "Time Out", "Gate Calls", "Call Time", "Disp Time", "C/W Time"];
  const rows = sheet.entries.map((e, i) => [
    sheet.date,
    sheet.shiftType,
    sheet.coordinatorName,
    i + 1,
    e.ac, e.gate, e.fltIn, e.timeIn, e.fltOut, e.timeOut,
    `"${e.problem.replace(/"/g, '""')}"`,
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

export default function App() {
  const {
    sheet, activeIndex, setActiveIndex,
    updateSheetField, updateEntry, addEntry, removeEntry, newSheet, applyAiFields, addAndApplyFields,
  } = useSheet();

  const [dark, toggleDark] = useDarkMode();
  const [showSummary, setShowSummary] = useState(false);

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
        onSave={() => {/* auto-saves via localStorage in useSheet */}}
        onExportCSV={() => exportCSV(sheet)}
        onNewSheet={handleNewSheet}
        onEndShift={() => setShowSummary(true)}
        dark={dark}
        onToggleDark={toggleDark}
      />

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
    </div>
  );
}
