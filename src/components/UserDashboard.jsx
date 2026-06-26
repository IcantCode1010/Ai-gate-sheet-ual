import { useEffect, useMemo, useState } from "react";
import ShiftSummaryModal from "./ShiftSummaryModal";
import { useDashboardData } from "../hooks/useDashboardData";

function formatDateTime(value) {
  if (!value) return "No updates";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function entryCount(shift) {
  return Array.isArray(shift?.entries) ? shift.entries.length : 0;
}

export default function UserDashboard({ currentUserId, onlineUsers, onClose }) {
  const { users, loading, error, reload } = useDashboardData();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  const onlineById = useMemo(() => {
    return new Map((onlineUsers || []).map(user => [user.userId, user]));
  }, [onlineUsers]);

  useEffect(() => {
    if (!selectedUserId && users.length) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUserId, users]);

  const selectedUser = users.find(user => user.id === selectedUserId) || users[0] || null;
  const latestShift = selectedUser?.latestShift || null;
  const recentShifts = selectedUser?.shifts || [];
  const onlineUser = selectedUser ? onlineById.get(selectedUser.id) : null;

  return (
    <div className="dashboard-page no-print">
      <div className="dashboard-header">
        <div>
          <h1>User Dashboard</h1>
          <p>View team members and inspect saved gate sheets.</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn btn-secondary" onClick={reload} disabled={loading}>
            Refresh
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Back to Sheet
          </button>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-layout">
        <aside className="dashboard-users">
          <div className="dashboard-section-title">
            <span>Users</span>
            <span>{users.length}</span>
          </div>

          {loading && <div className="status-empty">Loading users...</div>}
          {!loading && users.length === 0 && (
            <div className="status-empty">No users found.</div>
          )}

          {users.map(user => {
            const isOnline = onlineById.has(user.id);
            const isSelected = selectedUser?.id === user.id;
            const latest = user.latestShift;

            return (
              <button
                key={user.id}
                className={`dashboard-user-row${isSelected ? " dashboard-user-row-active" : ""}`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <span className={`dashboard-presence-dot${isOnline ? " dashboard-presence-online" : ""}`} />
                <span className="dashboard-user-main">
                  <span className="dashboard-user-name">
                    {user.display_name || "Unnamed user"}
                    {user.id === currentUserId && <span className="history-own-badge">mine</span>}
                  </span>
                  <span className="dashboard-user-meta">
                    {latest ? `${latest.date} / ${entryCount(latest)} calls` : "No sheets yet"}
                  </span>
                </span>
                <span className="dashboard-user-time">{formatDateTime(latest?.updated_at)}</span>
              </button>
            );
          })}
        </aside>

        <main className="dashboard-detail">
          {!selectedUser && !loading && (
            <div className="dashboard-empty-state">
              Select a user to view saved sheets.
            </div>
          )}

          {selectedUser && (
            <>
              <section className="dashboard-user-summary">
                <div>
                  <div className="dashboard-kicker">Selected User</div>
                  <h2>{selectedUser.display_name || "Unnamed user"}</h2>
                  <div className="dashboard-status-line">
                    <span className={`dashboard-presence-dot${onlineUser ? " dashboard-presence-online" : ""}`} />
                    {onlineUser ? "Online now" : "Offline"}
                  </div>
                </div>

                <div className="dashboard-summary-stats">
                  <div className="stat-card">
                    <div className="stat-value">{recentShifts.length}</div>
                    <div className="stat-label">Saved Sheets</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{selectedUser.totalCalls}</div>
                    <div className="stat-label">Total Calls</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{entryCount(latestShift)}</div>
                    <div className="stat-label">Latest Calls</div>
                  </div>
                </div>
              </section>

              <section className="dashboard-latest">
                <div className="dashboard-section-title">
                  <span>Latest Sheet</span>
                  {latestShift && <span>{formatDateTime(latestShift.updated_at)}</span>}
                </div>

                {!latestShift && (
                  <div className="dashboard-empty-state">
                    This user does not have a saved sheet yet.
                  </div>
                )}

                {latestShift && (
                  <div className="dashboard-latest-card">
                    <div className="dashboard-sheet-title">
                      <span>{latestShift.date}</span>
                      {latestShift.shift_type && (
                        <span className="modal-badge">{latestShift.shift_type} Shift</span>
                      )}
                    </div>
                    <div className="dashboard-sheet-meta">
                      <span>Coordinator: {latestShift.coordinator_name || "Not set"}</span>
                      <span>{entryCount(latestShift)} gate call{entryCount(latestShift) === 1 ? "" : "s"}</span>
                    </div>
                    {latestShift.notes && (
                      <p className="dashboard-sheet-notes">{latestShift.notes}</p>
                    )}
                    <button className="btn btn-primary" onClick={() => setSelectedShift(latestShift)}>
                      View Sheet
                    </button>
                  </div>
                )}
              </section>

              <section className="dashboard-history">
                <div className="dashboard-section-title">
                  <span>Recent Sheets</span>
                  <span>{recentShifts.length}</span>
                </div>

                <div className="dashboard-shift-list">
                  {recentShifts.map(shift => (
                    <button
                      key={shift.id}
                      className="dashboard-shift-row"
                      onClick={() => setSelectedShift(shift)}
                    >
                      <span>
                        <strong>{shift.date}</strong>
                        {shift.shift_type && <span className="modal-badge">{shift.shift_type}</span>}
                      </span>
                      <span>{shift.coordinator_name || "No coordinator"}</span>
                      <span>{entryCount(shift)} calls</span>
                      <span>{formatDateTime(shift.updated_at)}</span>
                    </button>
                  ))}
                  {recentShifts.length === 0 && (
                    <div className="dashboard-empty-state">
                      No saved sheets for this user.
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {selectedShift && (
        <ShiftSummaryModal
          sheet={{
            date: selectedShift.date,
            shiftType: selectedShift.shift_type,
            coordinatorName: selectedShift.coordinator_name,
            entries: selectedShift.entries || [],
          }}
          readOnly
          onClose={() => setSelectedShift(null)}
          onExportCSV={() => {}}
        />
      )}
    </div>
  );
}
