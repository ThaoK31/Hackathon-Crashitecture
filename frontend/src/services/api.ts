import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:3000
  withCredentials: false,
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // you can change storage strategy
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
