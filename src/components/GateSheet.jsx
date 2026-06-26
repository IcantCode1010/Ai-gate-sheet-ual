import EntryRow from "./EntryRow";

export default function GateSheet({ entries, activeIndex, onActivate, onEntryChange, onRemove, onAddEntry }) {
  return (
    <div className="sheet-area">
      <table className="gate-table">
        <thead>
          <tr className="header-row">
            <th className="th-rownum">#</th>
            <th className="th-ac">A/C</th>
            <th className="th-gate">GATE</th>
            <th className="th-flt">FLT. I/B &amp; O/B / TIME</th>
            <th className="th-problem">GATE CALLS</th>
            <th className="th-time">CALL TIME</th>
            <th className="th-time">DISP TIME</th>
            <th className="th-time">C/W TIME</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              index={i}
              isActive={i === activeIndex}
              onActivate={onActivate}
              onChange={onEntryChange}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>

      <div className="add-entry-row">
        <button className="add-entry-btn" onClick={onAddEntry}>
          + Add Entry
        </button>
      </div>
    </div>
  );
}
