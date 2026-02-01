import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import "./auth-glass.css";

export default function Register({ onBack }) {
  const firstInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [timer, setTimer] = useState(0);

  const [form, setForm] = useState({
    mobile: "",
    otp: "",
    name: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "",
    branch: "",
    year: ""   // will store NUMBER
  });

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "branch") {
      setForm({ ...form, branch: value, year: "" });
    } else if (name === "year") {
      setForm({ ...form, year: Number(value) }); // 🔥 FORCE NUMBER
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const yearOptions = () => {
    if (!form.branch) return [];
    if (form.branch === "BTECH") return [1, 2, 3, 4];
    return [1, 2, 3];
  };

  const getPasswordStrength = (pwd) => {
    if (pwd.length < 6) return "Weak";
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd)) return "Strong";
    return "Medium";
  };

  const sendOtp = async () => {
    if (!form.mobile) return alert("Enter mobile number");
    try {
      setLoading(true);
      const res = await api.post("/auth/send-otp", { mobile: form.mobile });
      if (res.data.otp) setDevOtp(res.data.otp);
      setTimer(30);
      alert("OTP generated");
    } catch {
      alert("Failed to generate OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!form.otp) return alert("Enter OTP");
    try {
      setLoading(true);
      await api.post("/auth/verify-otp", {
        mobile: form.mobile,
        otp: form.otp
      });
      setStep(2);
    } catch {
      alert("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    if (!form.year) {
      return alert("Please select year");
    }

    try {
      setLoading(true);

      const payload = {
        mobile: form.mobile,
        password: form.password,
        name: form.name,
        dob: form.dob,
        gender: form.gender,
        branch: form.branch,
        year: form.year   // ✅ already a NUMBER
      };

      const res = await api.post("/auth/register", payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert("Account created successfully");
      window.location.reload();
    } catch {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="glass-card glass-animate">
        <h1 className="glass-title">Create Account</h1>
        <p className="glass-subtitle">
          {step === 1 ? "Verify your mobile number" : "Complete your profile"}
        </p>

        {step === 1 && (
          <>
            <input
              ref={firstInputRef}
              name="mobile"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={handleChange}
            />

            <button
              className="glass-btn"
              onClick={sendOtp}
              disabled={loading || timer > 0}
            >
              {timer > 0 ? `Resend in ${timer}s` : "Send OTP"}
            </button>

            {devOtp && (
              <p style={{ color: "#aaa", fontSize: "14px" }}>
                OTP (demo): <strong>{devOtp}</strong>
              </p>
            )}

            <input
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
            />

            <button className="glass-btn" onClick={verifyOtp} disabled={loading}>
              Verify & Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              ref={firstInputRef}
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />

            {/* PASSWORD WITH SEENER */}
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                value={form.password}
                onChange={handleChange}
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

            {form.password && (
              <p style={{ fontSize: "13px", color: "#aaa" }}>
                Strength: {getPasswordStrength(form.password)}
              </p>
            )}

            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <input type="date" name="dob" value={form.dob} onChange={handleChange} />

            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <select name="branch" value={form.branch} onChange={handleChange}>
              <option value="">Select Branch</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
              <option value="BSC">BSC</option>
              <option value="BTECH">BTECH</option>
            </select>

            <select
              name="year"
              value={form.year}
              onChange={handleChange}
              disabled={!form.branch}
            >
              <option value="">Select Year</option>
              {yearOptions().map((y) => (
                <option key={y} value={y}>
                  {y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : "4th"} Year
                </option>
              ))}
            </select>

            <button
              className={`glass-btn ${loading ? "loading" : ""}`}
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : "Create Account"}
            </button>
          </>
        )}

        <div className="glass-links">
          <span onClick={onBack}>← Back to Login</span>
        </div>
      </div>
    </div>
  );
}
