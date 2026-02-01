import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import "./auth-glass.css";

export default function AdminLogin({ onSuccess, onBack }) {
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
      alert("Enter credentials");
      return;
    }

    try {
      setLoading(true);

      // 🔑 STAFF LOGIN (ADMIN + TEACHER)
      const res = await api.post("/admin/admin/login", {
        mobile,
        password
      });

      const { access_token, role } = res.data;

      // ✅ store auth
      // store auth FIRST
    localStorage.clear();
    localStorage.setItem("token", access_token);
    localStorage.setItem("role", role);

// 🔒 ensure commit
    setTimeout(() => {
      onSuccess(role);
    }, 0);



      // ✅ role-based redirect
      if (role === "admin") {
        onSuccess("admin");
      } else if (role === "teacher") {
        onSuccess("teacher");
      } else {
        alert("Unauthorized role");
      }

    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="glass-card glass-animate">
        <h1 className="glass-title">Staff Login</h1>

        <input
          ref={mobileRef}
          type="tel"
          placeholder="Mobile"
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
          <span onClick={onBack}>← Back</span>
        </div>
      </div>
    </div>
  );
}
