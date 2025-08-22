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
import { authMiddleware, requireRole } from "./middleware/auth";
import { UserRole } from "@forzani/types";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? ["https://yourdomain.com"] 
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Demasiadas solicitudes, intenta de nuevo más tarde",
    },
  },
});
app.use(limiter);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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
app.use("/api/auth", express.Router()
  .post("/login", ...AuthController.login)
  .post("/refresh", ...AuthController.refreshToken)
  .get("/me", authMiddleware, AuthController.me)
);

app.use("/api/tickets", express.Router()
  .get("/", authMiddleware, ...TicketsController.getTickets)
  .get("/:id", authMiddleware, TicketsController.getTicketById)
  .post("/", authMiddleware, ...TicketsController.createTicket)
  .patch("/:id", authMiddleware, ...TicketsController.updateTicket)
  .delete("/:id", authMiddleware, requireRole([UserRole.ADMIN]), TicketsController.deleteTicket)
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
