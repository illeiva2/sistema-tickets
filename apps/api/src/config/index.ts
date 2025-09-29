import dotenv from "dotenv";

dotenv.config();

// Función para validar variables de entorno críticas
const validateRequiredEnv = (
  key: string,
  value: string | undefined,
  defaultValue?: string,
): string => {
  if (!value && !defaultValue) {
    throw new Error(
      `❌ CRITICAL: Environment variable ${key} is required but not set`,
    );
  }
  return value || defaultValue!;
};

// Validar variables críticas en producción
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  const requiredVars = ["JWT_SECRET", "DATABASE_URL"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `❌ CRITICAL: Missing required environment variables in production: ${missingVars.join(", ")}`,
    );
  }
}

export const config = {
  database: {
    url: validateRequiredEnv(
      "DATABASE_URL",
      process.env.DATABASE_URL,
      "postgresql://postgres:postgres@localhost:5432/empresa_tickets",
    ),
  },
  jwt: {
    secret: validateRequiredEnv(
      "JWT_SECRET",
      process.env.JWT_SECRET,
      isProduction ? undefined : "dev-secret-change-in-production",
    ),
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  server: {
    port: parseInt(process.env.PORT || "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },
  upload: {
    dir: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    from: process.env.EMAIL_FROM || "noreply@sistema-tickets.com",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
  security: {
    // Configuración de seguridad adicional
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || "900000", 10), // 15 minutos
  },
} as const;
