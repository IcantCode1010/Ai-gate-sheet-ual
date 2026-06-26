import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function InviteModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  async function handleSend(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/.netlify/functions/send-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");

      setStatus("sent");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ minWidth: 340 }}>
        <div className="modal-header">
          <h2>Invite Team Member</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {status === "sent" ? (
          <div style={{ padding: "12px 0" }}>
            <div style={{ color: "var(--chat-green)", fontWeight: "bold", marginBottom: 8 }}>
              ✓ Invite sent to {email}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              They'll receive an email with a link to create their account.
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => { setStatus("idle"); setEmail(""); }}>
                Invite Another
              </button>
              <button className="btn btn-ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            <div style={{ marginBottom: 12, fontSize: 12, opacity: 0.7 }}>
              They'll get an email with a link to set up their account.
            </div>
            <label className="shift-label" style={{ marginBottom: 12 }}>
              Email address
              <input
                type="email"
                className="shift-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="colleague@airline.com"
                style={{ width: "100%", marginTop: 4 }}
              />
            </label>

            {error && <div className="login-error" style={{ marginBottom: 10 }}>{error}</div>}

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send Invite"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
