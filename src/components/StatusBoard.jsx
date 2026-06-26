export default function StatusBoard({ users, currentUserId, onClose }) {
  const others = users.filter(u => u.userId !== currentUserId);
  const me = users.find(u => u.userId === currentUserId);

  function Card({ user, isMe }) {
    return (
      <div className={`status-card${isMe ? " status-card-me" : ""}`}>
        <div className="status-card-header">
          <span className="status-name">{user.displayName || "Unknown"}</span>
          {isMe && <span className="status-you-badge">YOU</span>}
          {user.shiftType && (
            <span className="modal-badge" style={{ fontSize: 10 }}>{user.shiftType}</span>
          )}
          <span className="status-online-dot" title="Online" />
        </div>
        <div className="status-card-body">
          <div className="status-stat">
            <span className="status-stat-val">{user.aircraftCount ?? 0}</span>
            <span className="status-stat-label">Aircraft</span>
          </div>
          {user.lastAc && (
            <div className="status-stat">
              <span className="status-stat-val">{user.lastAc}</span>
              <span className="status-stat-label">Last A/C</span>
            </div>
          )}
          {user.lastGate && (
            <div className="status-stat">
              <span className="status-stat-val">{user.lastGate}</span>
              <span className="status-stat-label">Gate</span>
            </div>
          )}
        </div>
        {user.date && (
          <div className="status-date">{user.date}</div>
        )}
      </div>
    );
  }

  return (
    <div className="status-board no-print">
      <div className="status-board-header">
        <span className="status-board-title">Live Status</span>
        <span className="status-board-count">{users.length} online</span>
        <button className="modal-close" onClick={onClose} style={{ marginLeft: "auto" }}>✕</button>
      </div>

      <div className="status-board-body">
        {me && <Card user={me} isMe />}
        {others.length === 0 && (
          <div className="status-empty">No other users online</div>
        )}
        {others.map((u, i) => <Card key={u.userId || i} user={u} isMe={false} />)}
      </div>
    </div>
  );
}
