import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("USER" | "AGENT" | "ADMIN")[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-16 w-16 text-amber-500 mx-auto mb-4">🚫</div>
          <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
