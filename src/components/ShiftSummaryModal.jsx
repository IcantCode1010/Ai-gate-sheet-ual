function parseMinutes(hhmm) {
  if (!hhmm || !hhmm.includes(":")) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function avgMinutes(deltas) {
  const valid = deltas.filter(d => d !== null && d >= 0);
  if (!valid.length) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function fmtMinutes(mins) {
  if (mins === null) return "—";
  return `${mins} min`;
}

export default function ShiftSummaryModal({ sheet, onClose, onExportCSV }) {
  const { entries, date, shiftType, coordinatorName } = sheet;

  const dispDeltas = entries.map(e => {
    const c = parseMinutes(e.callTime);
    const d = parseMinutes(e.dispTime);
    return c !== null && d !== null ? d - c : null;
  });

  const cwDeltas = entries.map(e => {
    const c = parseMinutes(e.callTime);
    const cw = parseMinutes(e.cwTime);
    return c !== null && cw !== null ? cw - c : null;
  });

  const incomplete = entries
    .map((e, i) => ({ i, e }))
    .filter(({ e }) => !e.ac || !e.gate || !e.problem)
    .map(({ i }) => i + 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>End-of-Shift Summary</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-meta">
          <span>{date}</span>
          {shiftType && <span className="modal-badge">{shiftType} Shift</span>}
          {coordinatorName && <span>Coordinator: <strong>{coordinatorName}</strong></span>}
        </div>

        <div className="modal-stats">
          <div className="stat-card">
            <div className="stat-value">{entries.length}</div>
            <div className="stat-label">Total Gate Calls</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{fmtMinutes(avgMinutes(dispDeltas))}</div>
            <div className="stat-label">Avg Dispatch Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{fmtMinutes(avgMinutes(cwDeltas))}</div>
            <div className="stat-label">Avg C/W Time</div>
          </div>
        </div>

        {incomplete.length > 0 && (
          <div className="modal-warning">
            <strong>Incomplete rows:</strong> Row{incomplete.length > 1 ? "s" : ""}{" "}
            {incomplete.join(", ")} — missing A/C, Gate, or Gate Calls field
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onExportCSV}>
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            Print Sheet
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
