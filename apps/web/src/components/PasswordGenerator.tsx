import React, { useState, useCallback } from "react";
import { Button, Input, Slider } from "@forzani/ui";
import { Copy, RefreshCw, Check, Eye, EyeOff } from "lucide-react";

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
  className?: string;
}

interface ComplexityLevel {
  level: "weak" | "fair" | "good" | "strong" | "excellent";
  color: string;
  width: string;
  label: string;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onPasswordGenerated,
  className = "",
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = useCallback(() => {
    const chars = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    };

    let availableChars = "";
    Object.entries(options).forEach(([key, enabled]) => {
      if (enabled) {
        availableChars += chars[key as keyof typeof chars];
      }
    });

    if (availableChars.length === 0) {
      availableChars = chars.lowercase;
    }

    let generatedPassword = "";
    for (let i = 0; i < length; i++) {
      generatedPassword += availableChars.charAt(
        Math.floor(Math.random() * availableChars.length),
      );
    }

    setPassword(generatedPassword);
    onPasswordGenerated(generatedPassword);
  }, [length, options, onPasswordGenerated]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy password:", err);
    }
  };

  const calculateComplexity = (): ComplexityLevel => {
    if (!password)
      return {
        level: "weak",
        color: "bg-gray-200",
        width: "w-0",
        label: "Sin contraseña",
      };

    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length >= 20) score += 1;
    if (new Set(password).size > password.length * 0.7) score += 1;

    if (score <= 2)
      return {
        level: "weak",
        color: "bg-red-500",
        width: "w-1/5",
        label: "Débil",
      };
    if (score <= 4)
      return {
        level: "fair",
        color: "bg-orange-500",
        width: "w-2/5",
        label: "Regular",
      };
    if (score <= 6)
      return {
        level: "good",
        color: "bg-yellow-500",
        width: "w-3/5",
        label: "Buena",
      };
    if (score <= 8)
      return {
        level: "strong",
        color: "bg-blue-500",
        width: "w-4/5",
        label: "Fuerte",
      };
    return {
      level: "excellent",
      color: "bg-green-500",
      width: "w-full",
      label: "Excelente",
    };
  };

  const complexity = calculateComplexity();

  return (
    <div className={`bg-white rounded-lg border p-6 space-y-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Generador de Contraseñas
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={generatePassword}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Generar
          </Button>
        </div>

        {/* Password Display */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña aparecerá aquí"
            className="pr-20 text-lg font-mono"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="h-8 w-8 p-0"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              disabled={!password}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Complexity Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Fortaleza de la contraseña:</span>
            <span
              className={`font-medium ${
                complexity.level === "weak"
                  ? "text-red-600"
                  : complexity.level === "fair"
                    ? "text-orange-600"
                    : complexity.level === "good"
                      ? "text-yellow-600"
                      : complexity.level === "strong"
                        ? "text-blue-600"
                        : "text-green-600"
              }`}
            >
              {complexity.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${complexity.color}`}
              style={{ width: complexity.width }}
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Longitud: {length}
          </span>
          <span className="text-sm text-gray-500">{length} caracteres</span>
        </div>
        <Slider
          value={[length]}
          onValueChange={(value) => setLength(value[0])}
          min={8}
          max={32}
          step={1}
          className="w-full"
        />

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(options).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {key === "uppercase"
                  ? "Mayúsculas"
                  : key === "lowercase"
                    ? "Minúsculas"
                    : key === "numbers"
                      ? "Números"
                      : "Símbolos"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Consejos de seguridad:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Usa al menos 12 caracteres</li>
          <li>• Combina mayúsculas, minúsculas, números y símbolos</li>
          <li>• Evita información personal (fechas, nombres)</li>
          <li>• No reutilices contraseñas en otros sitios</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordGenerator;
