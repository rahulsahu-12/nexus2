import React, { useEffect, useRef, useState } from "react";
import axios from "../../api/axios";
import "./auth-glass.css";

export default function Login({ onLogin, onRegister, onAdmin }) {
  const mobileRef = useRef(null);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mobileRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    if (!mobile || !password) {
      alert("Enter mobile and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/token", {
        mobile,
        password
      });

      // ✅ CORRECT TOKEN HANDLING
      const accessToken = res.data.access_token;

      if (!accessToken) {
        throw new Error("No access token returned");
      }

      // ✅ Store token in BOTH keys (no refactor needed)
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("role", res.data.role);

      onLogin(res.data.role);
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="glass-card glass-animate">
        <h1 className="glass-title">NEXUS</h1>
        <p className="glass-subtitle">Student Login</p>

        <input
          ref={mobileRef}
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          disabled={loading}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#aaa"
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          className={`glass-btn ${loading ? "loading" : ""}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <div className="spinner" /> : "Login"}
        </button>

        <div className="glass-links">
          <span onClick={onRegister}>New user? Register</span>
          <span onClick={onAdmin}>Login as Admin</span>
        </div>
      </div>
    </div>
  );
}
