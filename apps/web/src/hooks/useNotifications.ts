import { useState } from "react";
import api from "../lib/api";
import { toast } from "react-hot-toast";

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testEmailConnection = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/notifications/test-connection");
      if (response.data.success) {
        toast.success("✅ Conexión de email verificada correctamente");
        return true;
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message ||
        "Error al verificar conexión de email";
      toast.error(`❌ ${message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const sendTestEmail = async (
    to: string,
    subject: string,
    message: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/notifications/test-email", {
        to,
        subject,
        message,
      });

      if (response.data.success) {
        toast.success("✅ Email de prueba enviado correctamente");
        return true;
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message ||
        "Error al enviar email de prueba";
      toast.error(`❌ ${message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    testEmailConnection,
    sendTestEmail,
    isLoading,
  };
};
