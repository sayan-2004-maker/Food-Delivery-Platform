import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

const Login = ({ url, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await axios.post(`${url}/api/user/admin/login`, { email, password }, { timeout: 15000 });
      if (!data.success) {
        setError(data.message || "Unable to sign in");
        return;
      }
      onLogin(data.token);
    } catch (requestError) {
      setError(requestError.response?.data?.message ||
        (requestError.code === "ECONNABORTED"
          ? "The backend is taking too long to respond. Check the backend and database connection."
          : requestError.message || "Unable to sign in"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <span className="admin-login-mark">F</span>
        <p className="admin-eyebrow">FOODYRA MANAGEMENT</p>
        <h1>Welcome back</h1>
        <p className="admin-login-help">There is no default admin login. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env, then use those values here.</p>
        <label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      </form>
    </main>
  );
};

export default Login;
