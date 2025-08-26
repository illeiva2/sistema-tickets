import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@forzani/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@forzani/ui";
import { Input } from "@forzani/ui";
import { CheckCircle, Eye, EyeOff, Lock, Shield } from "lucide-react";
import PasswordGenerator from "../components/PasswordGenerator";
import { toast } from "react-hot-toast";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordGenerated = (password: string) => {
    setFormData((prev) => ({
      ...prev,
      newPassword: password,
      confirmPassword: password,
    }));
  };

  const getPasswordStrength = () => {
    const { newPassword } = formData;
    if (!newPassword) return { score: 0, label: "", color: "" };

    let score = 0;
    if (newPassword.length >= 8) score += 2;
    if (newPassword.length >= 6) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) return { score, label: "Débil", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Media", color: "bg-yellow-500" };
    if (score <= 5) return { score, label: "Buena", color: "bg-blue-500" };
    return { score, label: "Excelente", color: "bg-green-500" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      // Aquí iría la llamada a la API para cambiar contraseña
      // Por ahora simulamos el proceso
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Contraseña cambiada exitosamente");
      navigate("/");
    } catch (error) {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Lock className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Cambiar Contraseña</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Actualiza tu contraseña para mantener tu cuenta segura. Te
          recomendamos usar una contraseña fuerte y única.
        </p>
      </div>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario de cambio de contraseña */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contraseña actual */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    placeholder="Ingresa tu contraseña actual"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="Ingresa tu nueva contraseña"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Indicador de fortaleza */}
                {formData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fortaleza:</span>
                      <span className="font-medium">{strength.label}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.score / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirma tu nueva contraseña"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {/* Validación de coincidencia */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm">
                    {formData.newPassword === formData.confirmPassword ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-red-500" />
                    )}
                    <span
                      className={
                        formData.newPassword === formData.confirmPassword
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {formData.newPassword === formData.confirmPassword
                        ? "Las contraseñas coinciden"
                        : "Las contraseñas no coinciden"}
                    </span>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    formData.newPassword !== formData.confirmPassword
                  }
                  className="flex-1"
                >
                  {isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información de seguridad */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Shield className="h-5 w-5" />
                ¿Por qué cambiar mi contraseña?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">🔐</span>
                    Seguridad mejorada
                  </h4>
                  <p className="text-sm text-gray-600">
                    Una contraseña fuerte protege tu cuenta contra accesos no
                    autorizados.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">🔄</span>
                    Actualización regular
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cambiar tu contraseña periódicamente es una buena práctica
                    de seguridad.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    Acceso inmediato
                  </h4>
                  <p className="text-sm text-gray-600">
                    Tu nueva contraseña estará activa inmediatamente después del
                    cambio.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    Consejo
                  </h4>
                  <p className="text-sm text-gray-600">
                    Usa el generador de contraseñas para crear una contraseña
                    segura y única.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generador de contraseñas */}
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowGenerator(!showGenerator)}
            className="mx-auto"
          >
            {showGenerator ? "Ocultar" : "Mostrar"} Generador de Contraseñas
          </Button>
        </div>

        {showGenerator && (
          <div className="mt-8">
            <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
          </div>
        )}
      </form>
    </div>
  );
};

export default ChangePasswordPage;
