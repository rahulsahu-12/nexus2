import axios from "axios";

const instance = axios.create({
  timeout: 15000, // ⛔ NEVER hang forever
});

instance.interceptors.request.use(
  (config) => {
    // ✅ Support BOTH token keys (no refactor needed)
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    // ✅ NEVER send "Bearer undefined"
    if (token && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 FORCE rejection (no hanging promises)
    return Promise.reject(error);
  }
);

export default instance;
