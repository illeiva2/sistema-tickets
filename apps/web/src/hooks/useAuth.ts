import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "AGENT" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar si hay un usuario logueado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          // Verificar si el token es válido
          const response = await api.get("/api/auth/me");
          setUser(response.data.data.user);
        } catch (error) {
          // Token inválido, limpiar localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      console.log("Attempting login with:", credentials.email);
      console.log("API URL:", api.defaults.baseURL);
      console.log("Request payload:", credentials);

      const response = await api.post("/api/auth/login", credentials);
      console.log("Login response:", response.data);
      const { accessToken, refreshToken, user: userData } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      toast.success("Inicio de sesión exitoso");
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      console.error(
        "Error response:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);

      const message =
        error.response?.data?.error?.message || "Error al iniciar sesión";
      toast.error(message);
      // No lanzar el error para evitar que se reinicie la página
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/api/auth/me");
      const userData = response.data.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    refreshUser,
  };
};
