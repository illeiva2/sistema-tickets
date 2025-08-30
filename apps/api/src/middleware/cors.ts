import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export interface CorsConfig {
  allowedOrigins: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  maxAge: number;
}

export const createCorsMiddleware = (): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Obtener orígenes permitidos desde variables de entorno
    const frontendUrls = process.env.FRONTEND_URLS?.split(',') || [];
    const allowedOrigins = config.server.nodeEnv === "production"
      ? [
          ...frontendUrls,
          // Fallbacks para Vercel - incluir todos los dominios del proyecto
          "https://sistema-tickets-web.vercel.app",
          "https://sistema-tickets-nu.vercel.app",
          "https://sistema-tickets-web-git-main-ivans-projects-73af2e4f.vercel.app"
        ].filter(Boolean)
      : ["http://localhost:5173", "http://localhost:3000"];

    const origin = req.headers.origin;

    // Permitir requests sin origin (como mobile apps o server-to-server)
    if (!origin) {
      return next();
    }

    // Verificar si el origen está permitido
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Permitir coincidencias exactas
      if (origin === allowedOrigin) return true;
      
      // Permitir subdominios de Vercel del proyecto
      if (config.server.nodeEnv === "production" && 
          origin.includes("vercel.app") && 
          (origin.includes("sistema-tickets") || origin.includes("sistema-tickets-nu"))) {
        return true;
      }
      
      return false;
    });

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Headers CORS estándar
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-Id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

    // Manejar preflight OPTIONS explícitamente
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  };
};

export const corsMiddleware = createCorsMiddleware();
