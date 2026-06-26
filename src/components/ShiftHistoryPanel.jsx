import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ShiftSummaryModal from "./ShiftSummaryModal";

export default function ShiftHistoryPanel({ currentUserId, onLoadShift, onClose }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("shifts")
        .select("id, user_id, date, shift_type, coordinator_name, entries, updated_at")
        .order("date", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(100);
      setShifts(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="history-panel no-print">
      <div className="status-board-header">
        <span className="status-board-title">Shift History</span>
        <button className="modal-close" onClick={onClose} style={{ marginLeft: "auto" }}>✕</button>
      </div>

      <div className="history-body">
        {loading && <div className="status-empty">Loading…</div>}
        {!loading && shifts.length === 0 && (
          <div className="status-empty">No past shifts saved yet.</div>
        )}
        {shifts.map(s => {
          const entryCount = Array.isArray(s.entries) ? s.entries.length : 0;
          const isOwn = s.user_id === currentUserId;
          const isToday = s.date === today;
          return (
            <div
              key={s.id}
              className="history-row"
              onClick={() => setSelected(s)}
            >
              <div className="history-row-left">
                <span className="history-date">{s.date}</span>
                {s.shift_type && (
                  <span className="modal-badge" style={{ fontSize: 10 }}>{s.shift_type}</span>
                )}
                {isOwn && <span className="history-own-badge">mine</span>}
              </div>
              <div className="history-row-right">
                <span className="history-meta">
                  {s.coordinator_name || "—"} · {entryCount} call{entryCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <ShiftSummaryModal
          sheet={{
            date: selected.date,
            shiftType: selected.shift_type,
            coordinatorName: selected.coordinator_name,
            entries: selected.entries || [],
          }}
          readOnly
          canResume={selected.user_id === currentUserId && selected.date === today}
          onClose={() => setSelected(null)}
          onExportCSV={() => {}}
          onResume={() => { onLoadShift(selected.id); onClose(); }}
        />
      )}
    </div>
  );
}
