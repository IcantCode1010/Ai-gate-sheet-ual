import { mapShiftToReadOnlySheet } from "../utils/readOnlySheet";

function valueOrDash(value) {
  return value || "-";
}

export default function ReadOnlySheetView({ shift, ownerName, onBack }) {
  const sheet = mapShiftToReadOnlySheet(shift);

  return (
    <div className="readonly-sheet-page no-print">
      <div className="readonly-sheet-toolbar">
        <div>
          <div className="dashboard-kicker">Read-Only Sheet</div>
          <h2>{ownerName || "Unknown user"}</h2>
          <div className="readonly-sheet-meta">
            <span>{sheet.date}</span>
            {sheet.shiftType && <span>{sheet.shiftType} Shift</span>}
            <span>Coordinator: {valueOrDash(sheet.coordinatorName)}</span>
            <span>{sheet.entries.length} gate call{sheet.entries.length === 1 ? "" : "s"}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      {sheet.notes && (
        <div className="readonly-sheet-notes">
          <strong>Shift Notes</strong>
          <p>{sheet.notes}</p>
        </div>
      )}

      <div className="readonly-sheet-area">
        <table className="readonly-gate-table">
          <thead>
            <tr>
              <th>#</th>
              <th>A/C</th>
              <th>Gate</th>
              <th>FLT I/B</th>
              <th>Time In</th>
              <th>FLT O/B</th>
              <th>Time Out</th>
              <th>Gate Calls</th>
              <th>Call</th>
              <th>Disp</th>
              <th>C/W</th>
            </tr>
          </thead>
          <tbody>
            {sheet.entries.map((entry, index) => (
              <tr key={entry.id || index}>
                <td>{index + 1}</td>
                <td className="readonly-strong">{valueOrDash(entry.ac)}</td>
                <td className="readonly-strong">{valueOrDash(entry.gate)}</td>
                <td>{valueOrDash(entry.fltIn)}</td>
                <td>{valueOrDash(entry.timeIn)}</td>
                <td>{valueOrDash(entry.fltOut)}</td>
                <td>{valueOrDash(entry.timeOut)}</td>
                <td className="readonly-problem">{valueOrDash(entry.problem)}</td>
                <td>{valueOrDash(entry.callTime)}</td>
                <td>{valueOrDash(entry.dispTime)}</td>
                <td>{valueOrDash(entry.cwTime)}</td>
              </tr>
            ))}
            {sheet.entries.length === 0 && (
              <tr>
                <td colSpan={11} className="readonly-empty">No gate calls saved for this sheet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
