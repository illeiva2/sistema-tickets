import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks";
import toast from "react-hot-toast";

const OAuthHandler: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userParam = searchParams.get("user");

    if (accessToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        if (refreshToken) {
          // Usuario existente con refresh token
          handleOAuthCallback(accessToken, refreshToken, user);
        } else {
          // Usuario nuevo sin refresh token
          console.log("🆕 Usuario nuevo detectado, redirigiendo a registro");
          const encodedUser = encodeURIComponent(JSON.stringify(user));
          navigate(`/register?user=${encodedUser}&token=${accessToken}`);
        }
      } catch (error) {
        console.error("Error procesando parámetros de OAuth:", error);
        toast.error("Error procesando la autenticación de Google");
        navigate("/login");
      }
    }
  }, [searchParams, navigate, handleOAuthCallback]);

  // Mostrar loading mientras se procesa
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Procesando autenticación de Google...</p>
      </div>
    </div>
  );
};

export default OAuthHandler;