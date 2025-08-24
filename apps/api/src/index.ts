import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler } from "./lib/errors";
import { requestIdMiddleware } from "./middleware/requestId";
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
// Using literal role strings to avoid enum import issues in some environments

const app = express();

// Security middleware
app.use(helmet());
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

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
    },
  });
});

// API Routes
app.use(
  "/api/auth",
  express
    .Router()
    .post("/login", ...AuthController.login)
    .post("/refresh", ...AuthController.refreshToken)
    .get("/me", authMiddleware, AuthController.me),
);

app.use(
  "/api/dashboard",
  express.Router().get("/stats", authMiddleware, DashboardController.stats),
);

app.use(
  "/api/tickets",
  express
    .Router()
    .get("/", authMiddleware, ...TicketsController.getTickets)
    .get("/:id", authMiddleware, TicketsController.getTicketById)
    .post("/", authMiddleware, ...TicketsController.createTicket)
    .patch("/:id", authMiddleware, ...TicketsController.updateTicket)
    .delete(
      "/:id",
      authMiddleware,
      requireRole(["ADMIN" as any]),
      TicketsController.deleteTicket,
    )
    .get("/:ticketId/comments", authMiddleware, ...CommentsController.list)
    .post("/:ticketId/comments", authMiddleware, ...CommentsController.create),
);

app.use(
  "/api/users",
  express.Router().get("/agents", authMiddleware, UsersController.listAgents),
);

app.use(
  "/api/notifications",
  express
    .Router()
    .get("/debug-config", authMiddleware, NotificationsController.debugConfig)
    .get(
      "/test-connection",
      authMiddleware,
      NotificationsController.testConnection,
    )
    .post("/test-email", authMiddleware, NotificationsController.sendTestEmail),
);

// Attachments routes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
app.use(
  "/api/attachments",
  express
    .Router()
    .get("/:ticketId", authMiddleware, ...AttachmentsController.list)
    .post(
      "/:ticketId",
      authMiddleware,
      upload.single("file"),
      AttachmentsController.upload,
    )
    .delete("/:id", authMiddleware, AttachmentsController.remove),
);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.server.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});
