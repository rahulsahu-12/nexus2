import api from "./axios";

/* ================= LOGIN ================= */

// LOGIN (FIXED FOR /token)
export const login = async (mobile, password) => {
  const formData = new URLSearchParams();
  formData.append("username", mobile);   // MUST be "username"
  formData.append("password", password); // MUST be "password"

  const res = await api.post("/token", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // save auth
  localStorage.setItem("token", res.data.access_token);
  localStorage.setItem("role", res.data.role);

  return res.data;
};


/* ================= SEND OTP ================= */

export const sendOTP = async (mobile) => {
  const res = await api.post("/auth/send-otp", { mobile });
  return res.data;
};

/* ================= REGISTER ================= */

export const registerStudent = async (data) => {
  const res = await api.post("/register/student", data);
  return res.data;
};

/* ================= RESET PASSWORD ================= */

export const resetPassword = async (data) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};

/* ================= LOGOUT ================= */

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

/* ================= CURRENT USER ================= */
/*
⚠ REMOVED because backend DOES NOT have /me endpoint.
If you add /me later, we will re-enable this.
*/
