import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler } from "./lib/errors";
import { requestIdMiddleware } from "./middleware/requestId";
import { initRedis } from "./lib/cache";
import { metricsMiddleware, metricsEndpoint, getMetrics } from "./lib/metrics";
import { AuthController } from "./controllers/auth.controller";
import { TicketsController } from "./controllers/tickets.controller";
import { CommentsController } from "./controllers/comments.controller";
import { UsersController } from "./controllers/users.controller";
import multer from "multer";
import path from "path";
import AttachmentsController from "./controllers/attachments.controller";
import DashboardController from "./controllers/dashboard.controller";
import { NotificationsController } from "./controllers/notifications.controller";
import { authMiddleware, requireRole } from "./middleware/auth";
import passport from "./config/passport";
import { OAuthController } from "./controllers/oauth.controller";
import {
  secureFileServing,
  fileExists,
  authenticateFileAccess,
} from "./middleware/fileServing";
import FileOrganizationController from "./controllers/fileOrganization.controller";
import { UserRole } from "@prisma/client";
import {
  securityHeaders,
  payloadLimiter,
  detectSuspiciousActivity,
  apiLimiter,
  authLimiter,
} from "./middleware/security";

const app = express();

// Security middleware - Configuración avanzada
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:5175",
            "http://192.168.176.1:5173",
            "http://192.168.176.1:5174",
            "http://192.168.176.1:5175",
            "http://192.168.1.127:5173",
            "http://192.168.1.127:5174",
            "http://192.168.1.127:5175",
            "http://172.19.160.1:5173",
            "http://172.19.160.1:5174",
            "http://172.19.160.1:5175",
          ],
    credentials: true,
  }),
);

// Rate limiting (solo en producción)
if (config.server.nodeEnv === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Demasiadas solicitudes, intenta de nuevo más tarde",
      },
    },
  });
  app.use(limiter);
}

// Security headers adicionales
app.use(securityHeaders);

// Detección de actividad sospechosa
app.use(detectSuspiciousActivity);

// Rate limiting general
app.use(apiLimiter);

// Request parsing con límites de seguridad
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      // Verificar que el JSON es válido
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new Error("Invalid JSON");
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Límite de payload
app.use(payloadLimiter);

// Passport middleware
app.use(passport.initialize());

// Validate OAuth configuration
import("./config/oauth")
  .then(({ validateOAuthConfig, oauthConfig }) => {
    try {
      validateOAuthConfig();
      logger.info("✅ OAuth configuration validated successfully");
      logger.info("🔍 OAuth Debug Info:");
      logger.info(
        "  - Client ID:",
        oauthConfig.google.clientID ? "✅ Presente" : "❌ FALTANTE",
      );
      logger.info(
        "  - Client Secret:",
        oauthConfig.google.clientSecret ? "✅ Presente" : "❌ FALTANTE",
      );
      logger.info("  - Callback URL:", oauthConfig.google.callbackURL);
      logger.info("  - Scope:", oauthConfig.google.scope);
    } catch (error) {
      logger.error("❌ OAuth configuration validation failed:", error);
      logger.warn("OAuth features will not work properly");
    }
  })
  .catch((error) => {
    logger.error("❌ Failed to load OAuth configuration:", error);
    logger.warn("OAuth features will not work properly");
  });
// Static uploads
app.use(
  "/uploads",
  authenticateFileAccess,
  secureFileServing,
  fileExists,
  express.static(path.join(process.cwd(), "uploads")),
);
app.use(
  "/thumbnails",
  authenticateFileAccess,
  express.static(path.join(process.cwd(), "thumbnails")),
);

// Ruta para servir archivos con autenticación (para vistas previas)
app.get(
  "/api/files/:fileName",
  authMiddleware,
  AttachmentsController.serveFile,
);

// Ruta para servir thumbnails con autenticación
app.get(
  "/api/thumbnails/:fileName",
  authMiddleware,
  AttachmentsController.serveThumbnail,
);

// Request ID middleware
app.use(requestIdMiddleware);

// Metrics middleware
app.use(metricsMiddleware);

// Health check avanzado
app.get("/health", async (req, res) => {
  try {
    const { HealthChecker } = await import("./lib/health");
    const healthStatus = await HealthChecker.runAllChecks();

    const statusCode =
      healthStatus.status === "unhealthy"
        ? 503
        : healthStatus.status === "degraded"
          ? 200
          : 200;

    res.status(statusCode).json({
      success: healthStatus.status !== "unhealthy",
      data: healthStatus,
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      success: false,
      data: {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
    });
  }
});

// Metrics endpoint para Prometheus
app.get(metricsEndpoint, async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(metrics);
  } catch (error) {
    logger.error("Metrics endpoint failed:", error);
    res.status(500).send("Metrics unavailable");
  }
});

// API Routes
app.use(
  "/api/auth",
  express
    .Router()
    .post("/login", authLimiter, AuthController.login as any)
    .post("/refresh", AuthController.refreshToken as any)
    .get("/me", authMiddleware, AuthController.me as any),
);

app.use(
  "/api/dashboard",
  express
    .Router()
    .get("/stats", authMiddleware, DashboardController.stats as any)
    .get("/agent-stats", authMiddleware, DashboardController.agentStats as any)
    .get("/user-stats", authMiddleware, DashboardController.userStats as any),
);

app.use(
  "/api/tickets",
  express
    .Router()
    .get("/", authMiddleware, TicketsController.getTickets as any)
    .get("/:id", authMiddleware, TicketsController.getTicketById as any)
    .post("/", authMiddleware, TicketsController.createTicket as any)
    .patch("/:id", authMiddleware, TicketsController.updateTicket as any)
    .post("/:id/close", authMiddleware, TicketsController.closeTicket as any)
    .post("/:id/reopen", authMiddleware, TicketsController.reopenTicket as any)
    .delete(
      "/:id",
      authMiddleware,
      requireRole([UserRole.ADMIN]),
      TicketsController.deleteTicket as any,
    )
    .get("/:ticketId/comments", authMiddleware, CommentsController.list as any)
    .post(
      "/:ticketId/comments",
      authMiddleware,
      CommentsController.create as any,
    ),
);

app.use(
  "/api/users",
  express
    .Router()
    .get("/", authMiddleware, UsersController.listUsers as any)
    .get("/agents", authMiddleware, UsersController.listAgents as any)
    .get("/:id", authMiddleware, UsersController.getUserById as any)
    .post("/", authMiddleware, UsersController.createUser as any)
    .patch("/:id", authMiddleware, UsersController.updateUser as any)
    .patch(
      "/:id/password",
      authMiddleware,
      UsersController.changePassword as any,
    )
    .delete("/:id", authMiddleware, UsersController.deleteUser as any)
    .get("/:id/stats", authMiddleware, UsersController.getUserStats as any),
);

app.use(
  "/api/notifications",
  express
    .Router()
    .get(
      "/debug-config",
      authMiddleware,
      NotificationsController.debugConfig as any,
    )
    .get(
      "/test-connection",
      authMiddleware,
      NotificationsController.testConnection as any,
    )
    .post(
      "/test-email",
      authMiddleware,
      NotificationsController.sendTestEmail as any,
    )
    .get(
      "/user",
      authMiddleware,
      NotificationsController.getUserNotifications as any,
    )
    .patch(
      "/:id/read",
      authMiddleware,
      NotificationsController.markAsRead as any,
    )
    .patch(
      "/mark-all-read",
      authMiddleware,
      NotificationsController.markAllAsRead as any,
    )
    .get(
      "/preferences",
      authMiddleware,
      NotificationsController.getUserPreferences as any,
    )
    .patch(
      "/preferences",
      authMiddleware,
      NotificationsController.updateUserPreferences as any,
    ),
);

// Rutas de organización de archivos
app.use("/api/file-organization", authMiddleware, (req, res, next) => {
  const router = express.Router();

  // Categorías
  router.post("/categories", FileOrganizationController.createCategory);
  router.get("/categories", FileOrganizationController.getCategories);
  router.get(
    "/categories/hierarchy",
    FileOrganizationController.getCategoriesHierarchy,
  );
  router.put(
    "/categories/:categoryId",
    FileOrganizationController.updateCategory,
  );
  router.delete(
    "/categories/:categoryId",
    FileOrganizationController.deleteCategory,
  );

  // Etiquetas
  router.post("/tags", FileOrganizationController.createTag);
  router.get("/tags", FileOrganizationController.getTags);
  router.put("/tags/:tagId", FileOrganizationController.updateTag);
  router.delete("/tags/:tagId", FileOrganizationController.deleteTag);

  // Organización
  router.post(
    "/files/:attachmentId/organize",
    FileOrganizationController.organizeFile,
  );
  router.get(
    "/categories/:categoryId/files",
    FileOrganizationController.getFilesByCategory,
  );
  router.get("/tags/:tagName/files", FileOrganizationController.getFilesByTag);
  router.get("/search", FileOrganizationController.searchFiles);
  router.get("/stats", FileOrganizationController.getOrganizationStats);

  router(req, res, next);
});

// OAuth routes
app.get("/api/auth/google", OAuthController.initiateGoogleAuth);
app.get("/api/auth/google/callback", OAuthController.googleCallback);
app.post("/api/auth/refresh", OAuthController.refreshToken);
app.post("/api/auth/logout", OAuthController.logout);

// Attachments routes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
app.use(
  "/api/attachments",
  express
    .Router()
    .get("/:ticketId", authMiddleware, AttachmentsController.list)
    .post(
      "/:ticketId",
      authMiddleware,
      upload.single("file"),
      AttachmentsController.upload,
    )
    .delete("/:id", authMiddleware, AttachmentsController.remove)
    .get("/:id/info", authMiddleware, AttachmentsController.getInfo)
    .get("/:id/exists", authMiddleware, AttachmentsController.checkExists)
    .get(
      "/validation/config",
      authMiddleware,
      AttachmentsController.getValidationConfig,
    ),
);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.server.port;

// Inicializar Redis y luego el servidor
const startServer = async () => {
  try {
    // Inicializar Redis
    await initRedis();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${config.server.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`💾 Redis cache initialized`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});
