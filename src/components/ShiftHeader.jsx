export default function ShiftHeader({ date, shiftType, coordinatorName, notes, onChange }) {
  return (
    <div className="shift-header">
      <div className="shift-fields">
        <label className="shift-label">
          DATE
          <input
            type="date"
            className="shift-input"
            value={date}
            onChange={e => onChange("date", e.target.value)}
          />
        </label>

        <label className="shift-label">
          SHIFT
          <select
            className="shift-input shift-select"
            value={shiftType}
            onChange={e => onChange("shiftType", e.target.value)}
          >
            <option value="">— Select —</option>
            <option value="Day">Day</option>
            <option value="Night">Night</option>
            <option value="Swing">Swing</option>
          </select>
        </label>

        <label className="shift-label">
          COORDINATOR
          <input
            type="text"
            className="shift-input"
            value={coordinatorName}
            onChange={e => onChange("coordinatorName", e.target.value)}
            placeholder="Name"
          />
        </label>
      </div>

      <div className="shift-notes">
        <label className="shift-label notes-label">
          SHIFT NOTES
          <textarea
            className="shift-notes-input"
            value={notes}
            onChange={e => onChange("notes", e.target.value)}
            rows={2}
            placeholder="Shift-level notes..."
          />
        </label>
      </div>
    </div>
  );
}
