import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Otomatis menyematkan Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Tangani 401 Unauthorized (Token Hangus) dan Kembalikan data secara terstandar
api.interceptors.response.use(
  (response) => {
    // Unpack response.data as per standard Laravel response envelopes
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Gunakan redirect soft ke halaman login dengan query params redirect jika perlu
        window.location.href = "/auth/login"; 
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
