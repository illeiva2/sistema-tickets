import axios from "axios";

// URL de la API - localhost para desarrollo, producción para deploy
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Debug: mostrar la URL que se está usando
console.log("🔍 DEBUG - API_URL:", API_URL);
console.log("🔍 DEBUG - VITE_API_URL env:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si es un error 401 (no autorizado), limpiar la sesión
    if (error.response?.status === 401) {
      console.log("🔐 Error 401 detectado, limpiando sesión");
      
      // Limpiar localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Solo redirigir si no estamos en páginas de autenticación
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login") && !currentPath.includes("/register") && !currentPath.includes("/oauth")) {
        console.log("🔄 Redirigiendo a login desde:", currentPath);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
