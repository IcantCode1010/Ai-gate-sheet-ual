import { REFERENCE } from "../data/reference";

export default function ReferenceStrip() {
  return (
    <div className="reference-strip no-print">
      {Object.entries(REFERENCE).map(([section, items]) => (
        <div key={section} className="ref-column">
          <div className="ref-section-title">{section}</div>
          {items.map((item, i) => (
            <div key={i} className="ref-row">
              <span className="ref-label">{item.label}</span>
              <span className="ref-value">{item.value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
