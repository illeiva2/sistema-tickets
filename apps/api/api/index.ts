import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "../src/config";
import { logger } from "../src/lib/logger";
import { errorHandler, notFoundHandler } from "../src/lib/errors";
import { requestIdMiddleware } from "../src/middleware/requestId";
import { AuthController } from "../src/controllers/auth.controller";
import { TicketsController } from "../src/controllers/tickets.controller";
import { CommentsController } from "../src/controllers/comments.controller";
import { UsersController } from "../src/controllers/users.controller";
import multer from "multer";
import AttachmentsController from "../src/controllers/attachments.controller";
import DashboardController from "../src/controllers/dashboard.controller";
import { NotificationsController } from "../src/controllers/notifications.controller";
import { authMiddleware, requireRole } from "../src/middleware/auth";
import passport from "../src/config/passport";
import { OAuthController } from "../src/controllers/oauth.controller";
import FileOrganizationController from "../src/controllers/fileOrganization.controller";
import { UserRole } from "@prisma/client";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.server.nodeEnv === "production"
      ? [
          "https://sistema-tickets-web.vercel.app",
          "https://sistema-tickets-crkm22mse-ivans-projects-73af2e4f.vercel.app"
        ]
      : [
          "http://localhost:5173",
          "http://localhost:3000"
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

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

// Request ID middleware
app.use(requestIdMiddleware);

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
    },
  });
});

// API Routes
app.use(
  "/api/auth",
  express
    .Router()
    .post("/login", AuthController.login as any)
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

  // Archivos básicos
  router.get("/tickets/:ticketId/files", FileOrganizationController.getTicketFiles);
  router.get("/stats", FileOrganizationController.getFileStats);
  router.get("/search", FileOrganizationController.searchFiles);

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

// Export para Vercel
export default app;
