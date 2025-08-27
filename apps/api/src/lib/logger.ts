import pino from "pino";
import { config } from "../config";

// Configuración condicional del logger
const isDevelopment = process.env.NODE_ENV !== "production";

const loggerConfig = isDevelopment
  ? {
      level: config.logging.level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "yyyy-mm-dd HH:MM:ss",
        },
      },
    }
  : {
      level: config.logging.level,
      // En producción (Vercel), usar configuración simple sin transport
      // Vercel captura console.log automáticamente
    };

export const logger = pino(loggerConfig);
