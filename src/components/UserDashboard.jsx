import { useEffect, useMemo, useState } from "react";
import ReadOnlySheetView from "./ReadOnlySheetView";
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
  const [search, setSearch] = useState("");

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
  const filteredUsers = users.filter(user => {
    const name = user.display_name || "";
    return name.toLowerCase().includes(search.trim().toLowerCase());
  });
  const totalOnline = users.filter(user => onlineById.has(user.id)).length;
  const usersWithSheets = users.filter(user => user.latestShift).length;

  if (selectedShift) {
    return (
      <ReadOnlySheetView
        shift={selectedShift}
        ownerName={selectedUser?.display_name || "Unknown user"}
        onBack={() => setSelectedShift(null)}
      />
    );
  }

  return (
    <div className="dashboard-page no-print">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-kicker">Operations Console</div>
          <h1>User Dashboard</h1>
          <p>Monitor team activity and inspect saved gate sheets.</p>
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
          <div className="dashboard-rail-header">
            <div>
              <div className="dashboard-section-title">Team</div>
              <div className="dashboard-rail-subtitle">
                {totalOnline} online / {users.length} total
              </div>
            </div>
            <span className="dashboard-count-pill">{usersWithSheets} active</span>
          </div>

          <div className="dashboard-search-wrap">
            <input
              className="dashboard-search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search users"
            />
          </div>

          {loading && <div className="status-empty">Loading users...</div>}
          {!loading && users.length === 0 && (
            <div className="status-empty">No users found.</div>
          )}

          {!loading && users.length > 0 && filteredUsers.length === 0 && (
            <div className="status-empty">No matching users.</div>
          )}

          <div className="dashboard-user-list">
          {filteredUsers.map(user => {
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
          </div>
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
                <div className="dashboard-selected-user">
                  <div className="dashboard-kicker">Selected User</div>
                  <h2>{selectedUser.display_name || "Unnamed user"}</h2>
                  <div className="dashboard-status-row">
                    <span className={`dashboard-presence-dot${onlineUser ? " dashboard-presence-online" : ""}`} />
                    <span>{onlineUser ? "Online now" : "Offline"}</span>
                    {latestShift && <span>Last update {formatDateTime(latestShift.updated_at)}</span>}
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

              <section className="dashboard-latest dashboard-console-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <div className="dashboard-kicker">Latest Sheet</div>
                    <h3>{latestShift ? latestShift.date : "No sheet saved"}</h3>
                  </div>
                  {latestShift && (
                    <button className="btn btn-primary" onClick={() => setSelectedShift(latestShift)}>
                      View Sheet
                    </button>
                  )}
                </div>

                {!latestShift && (
                  <div className="dashboard-empty-state">
                    This user does not have a saved sheet yet.
                  </div>
                )}

                {latestShift && (
                  <div className="dashboard-latest-card">
                    <div className="dashboard-sheet-title">
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
                  </div>
                )}
              </section>

              <section className="dashboard-history dashboard-console-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <div className="dashboard-kicker">Recent Sheets</div>
                    <h3>{recentShifts.length} saved record{recentShifts.length === 1 ? "" : "s"}</h3>
                  </div>
                </div>

                <div className="dashboard-shift-list">
                  {recentShifts.length > 0 && (
                    <div className="dashboard-shift-head">
                      <span>Date</span>
                      <span>Shift</span>
                      <span>Coordinator</span>
                      <span>Calls</span>
                      <span>Last Updated</span>
                    </div>
                  )}
                  {recentShifts.map(shift => (
                    <button
                      key={shift.id}
                      className="dashboard-shift-row"
                      onClick={() => setSelectedShift(shift)}
                    >
                      <span>
                        <strong>{shift.date}</strong>
                      </span>
                      <span>{shift.shift_type || "-"}</span>
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
    </div>
  );
}
