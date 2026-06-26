import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import LoginPage from "./components/LoginPage.jsx";
import AcceptInvitePage from "./components/AcceptInvitePage.jsx";
import { useAuth } from "./hooks/useAuth.js";

function Root() {
  const { session, profile, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-box">
          <div className="login-logo">HMC Gate Sheet</div>
          <div style={{ textAlign: "center", opacity: 0.5, marginTop: 16 }}>Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/accept-invite"
          element={<AcceptInvitePage />}
        />
        <Route
          path="/login"
          element={
            session
              ? <Navigate to="/" replace />
              : <LoginPage onLogin={login} />
          }
        />
        <Route
          path="/*"
          element={
            session
              ? <App session={session} profile={profile} onLogout={logout} />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
