import { useRef } from "react";

export default function EntryRow({ entry, index, isActive, onActivate, onChange, onRemove }) {
  const rowRef = useRef(null);

  function field(key) {
    return (
      <input
        className="cell-input"
        value={entry[key]}
        onChange={e => onChange(index, { [key]: e.target.value })}
        onClick={e => { e.stopPropagation(); onActivate(index); }}
      />
    );
  }

  function timeField(key) {
    return (
      <input
        className="cell-input time-input"
        value={entry[key]}
        onChange={e => onChange(index, { [key]: e.target.value })}
        onClick={e => { e.stopPropagation(); onActivate(index); }}
        placeholder="HH:MM"
      />
    );
  }

  return (
    <tr
      ref={rowRef}
      className={`entry-row${isActive ? " active-row" : ""}`}
      onClick={() => onActivate(index)}
    >
      <td className="cell-rownum" title={`Click to select Row ${index + 1}`}>
        <span className="rownum-badge">{index + 1}</span>
      </td>

      <td className="cell-ac">
        <input
          className="cell-input ac-input"
          value={entry.ac}
          onChange={e => onChange(index, { ac: e.target.value })}
          onClick={e => { e.stopPropagation(); onActivate(index); }}
          placeholder="A/C"
        />
      </td>

      <td className="cell-gate">
        <input
          className="cell-input gate-input"
          value={entry.gate}
          onChange={e => onChange(index, { gate: e.target.value })}
          onClick={e => { e.stopPropagation(); onActivate(index); }}
          placeholder="GATE"
        />
      </td>

      <td className="cell-flt">
        <div className="flt-grid">
          <div className="flt-label">FLT I/B</div>
          <div className="flt-label">TIME IN</div>
          {field("fltIn")}
          {timeField("timeIn")}
          <div className="flt-label">FLT O/B</div>
          <div className="flt-label">TIME OUT</div>
          {field("fltOut")}
          {timeField("timeOut")}
        </div>
      </td>

      <td className="cell-problem">
        <textarea
          className="problem-textarea"
          value={entry.problem}
          onChange={e => onChange(index, { problem: e.target.value })}
          onClick={e => { e.stopPropagation(); onActivate(index); }}
          rows={3}
          placeholder="Gate call description..."
        />
      </td>

      <td className="cell-time">{timeField("callTime")}</td>
      <td className="cell-time">{timeField("dispTime")}</td>
      <td className="cell-time cell-last">
        {timeField("cwTime")}
        <button
          className="remove-btn"
          title="Remove row"
          onClick={e => { e.stopPropagation(); onRemove(index); }}
        >✕</button>
      </td>
    </tr>
  );
}
