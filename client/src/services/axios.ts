import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({ baseURL: (import.meta as any).env.VITE_API_URL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;