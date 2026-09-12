import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor to attach Bearer Token from sessionStorage
api.interceptors.request.use(
  (config) => {
    // Clear legacy localStorage token if present
    if (localStorage.getItem("peoplepulse_token")) {
      localStorage.removeItem("peoplepulse_token");
    }

    const token = sessionStorage.getItem("peoplepulse_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes("/auth/login");

    if (error.response && error.response.status === 401 && !isLoginRequest) {
      // Clear token from sessionStorage
      sessionStorage.removeItem("peoplepulse_token");

      // Notify AuthContext via custom event
      window.dispatchEvent(new CustomEvent("peoplepulse:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
