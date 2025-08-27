import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
} from "@forzani/ui";

import { Shield, Key, ArrowRight, CheckCircle } from "lucide-react";

const SetupPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user?.id) {
        setError("Usuario no válido");
        return;
      }
      await api.post("/api/auth/set-password", {
        userId: user.id,
        newPassword: password,
      });
      // refrescar bandera en local
      const updatedUser = { ...user, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || "Error al establecer contraseña",
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password)
      return { level: "weak", color: "text-gray-400", bgColor: "bg-gray-100" };

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2)
      return { level: "Débil", color: "text-red-600", bgColor: "bg-red-50" };
    if (score <= 4)
      return {
        level: "Regular",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    if (score <= 5)
      return {
        level: "Buena",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    return { level: "Fuerte", color: "text-green-600", bgColor: "bg-green-50" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurar tu contraseña
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Para completar tu registro, necesitamos que definas una contraseña
            segura para tu cuenta.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario principal */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Establecer contraseña
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña
                  </label>
                  <Input
                    type="password"
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                  {password && (
                    <div
                      className={`mt-2 px-3 py-2 rounded-md text-sm ${strength.bgColor}`}
                    >
                      <span className={`font-medium ${strength.color}`}>
                        Fortaleza: {strength.level}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                                  <div className="flex gap-3">
                    <Button
                    type="submit"
                    disabled={
                      loading || !password || !confirm || password !== confirm
                    }
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Guardar contraseña
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Información de seguridad */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                ¿Por qué necesito una contraseña?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">🔐</span>
                    Acceso múltiple
                  </h4>
                  <p className="text-sm text-gray-600">
                    Podrás acceder tanto con Google como con tu email y
                    contraseña personal.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    Acceso rápido
                  </h4>
                  <p className="text-sm text-gray-600">
                    Inicia sesión rápidamente sin esperar la redirección de
                    Google.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    Seguridad adicional
                  </h4>
                  <p className="text-sm text-gray-600">
                    Una contraseña fuerte protege tu cuenta en caso de que
                    Google no esté disponible.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">🔑</span>
                    Control total
                  </h4>
                  <p className="text-sm text-gray-600">
                    Tienes control completo sobre tu método de autenticación.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
};

export default SetupPasswordPage;
