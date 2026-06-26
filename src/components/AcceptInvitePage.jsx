import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AcceptInvitePage({ onProfileCreated }) {
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts access_token in the URL hash after invite click
    const hash = window.location.hash;
    if (hash.includes("type=invite") || hash.includes("access_token")) {
      setTokenReady(true);
    } else {
      setError("Invalid or expired invite link.");
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: pwErr } = await supabase.auth.updateUser({ password });
      if (pwErr) throw pwErr;

      const { data: { user } } = await supabase.auth.getUser();
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, display_name: displayName });
      if (profileErr) throw profileErr;

      onProfileCreated?.();
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!tokenReady) {
    return (
      <div className="login-page">
        <div className="login-box">
          <div className="login-logo">HMC Gate Sheet</div>
          <div className="login-error" style={{ marginTop: 16 }}>{error || "Checking invite…"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">HMC Gate Sheet</div>
        <div className="login-subtitle">Set up your account</div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Your Name
            <input
              type="text"
              className="login-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              autoFocus
              placeholder="e.g. Ellis"
            />
          </label>

          <label className="login-label">
            Set Password
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
