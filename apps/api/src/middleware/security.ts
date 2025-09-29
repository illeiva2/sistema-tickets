import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";
import { config } from "../config";

// Rate limiting más granular
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
    },
  },
  handler: (req: Request, res: Response) => {
    logger.warn({
      message: "Rate limit exceeded for auth endpoint",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
    });
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message:
          "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
      },
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Demasiadas solicitudes. Intenta de nuevo en 15 minutos.",
    },
  },
});

// Validación de tamaño de payload
export const payloadLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const contentLength = parseInt(req.headers["content-length"] || "0");
  const maxSize = config.upload.maxFileSize;

  if (contentLength > maxSize) {
    logger.warn({
      message: "Payload too large",
      contentLength,
      maxSize,
      ip: req.ip,
      url: req.url,
    });

    return res.status(413).json({
      success: false,
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: `El archivo es demasiado grande. Máximo permitido: ${Math.round(maxSize / 1024 / 1024)}MB`,
      },
    });
  }

  next();
};

// Validación de headers de seguridad
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Prevenir clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevenir MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // XSS Protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy básico
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self';",
  );

  next();
};

// Validación básica de entrada (sin express-validator por ahora)
export const validateInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Validación básica de JSON
  if (req.method !== "GET" && req.body && typeof req.body === "object") {
    // Verificar que no hay propiedades sospechosas
    const suspiciousKeys = ["__proto__", "constructor", "prototype"];
    const hasSuspiciousKeys = suspiciousKeys.some((key) => key in req.body);

    if (hasSuspiciousKeys) {
      logger.warn({
        message: "Suspicious input detected",
        ip: req.ip,
        url: req.url,
        body: req.body,
      });

      return res.status(400).json({
        success: false,
        error: {
          code: "SUSPICIOUS_INPUT",
          message: "Entrada sospechosa detectada",
        },
      });
    }
  }

  next();
};

// Validadores básicos
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return (
    password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  );
};

export const validateTicketTitle = (title: string): boolean => {
  return title.trim().length >= 1 && title.trim().length <= 200;
};

export const validateTicketDescription = (description: string): boolean => {
  return description.trim().length >= 1 && description.trim().length <= 5000;
};

// Detección de patrones sospechosos
export const detectSuspiciousActivity = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userAgent = req.get("User-Agent") || "";
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /w3af/i,
  ];

  const isSuspicious = suspiciousPatterns.some((pattern) =>
    pattern.test(userAgent),
  );

  if (isSuspicious) {
    logger.warn({
      message: "Suspicious user agent detected",
      userAgent,
      ip: req.ip,
      url: req.url,
    });

    return res.status(403).json({
      success: false,
      error: {
        code: "SUSPICIOUS_ACTIVITY",
        message: "Actividad sospechosa detectada",
      },
    });
  }

  next();
};

// Middleware para prevenir ataques de fuerza bruta
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const bruteForceProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip;
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt) {
    const timeSinceLastAttempt = now - attempt.lastAttempt;

    // Si han pasado más de 15 minutos, resetear
    if (timeSinceLastAttempt > config.security.lockoutDuration) {
      loginAttempts.delete(ip);
    } else if (attempt.count >= config.security.maxLoginAttempts) {
      logger.warn({
        message: "Brute force attempt blocked",
        ip,
        attempts: attempt.count,
        userAgent: req.get("User-Agent"),
      });

      return res.status(429).json({
        success: false,
        error: {
          code: "TOO_MANY_ATTEMPTS",
          message: `Demasiados intentos de login. Intenta de nuevo en ${Math.ceil((config.security.lockoutDuration - timeSinceLastAttempt) / 60000)} minutos`,
        },
      });
    }
  }

  next();
};

// Función para registrar intento de login fallido
export const recordFailedLogin = (ip: string) => {
  const attempt = loginAttempts.get(ip);
  const now = Date.now();

  if (attempt) {
    attempt.count++;
    attempt.lastAttempt = now;
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  }
};

// Función para limpiar intentos exitosos
export const clearLoginAttempts = (ip: string) => {
  loginAttempts.delete(ip);
};
