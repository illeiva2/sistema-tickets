import { prisma } from "./database";
import { logger } from "./logger";
import { config } from "../config";
import fs from "fs";
import os from "os";

interface HealthCheck {
  name: string;
  status: "ok" | "warning" | "error";
  message: string;
  details?: any;
}

export class HealthChecker {
  static async checkDatabase(): Promise<HealthCheck> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        name: "database",
        status: "ok",
        message: "Database connection successful",
        details: {
          provider: "postgresql",
          url: config.database.url.replace(/\/\/.*@/, "//***:***@"), // Ocultar credenciales
        },
      };
    } catch (error) {
      logger.error("Database health check failed:", error);
      return {
        name: "database",
        status: "error",
        message: "Database connection failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  static async checkDiskSpace(): Promise<HealthCheck> {
    try {
      const freeSpace = os.freemem();
      const totalSpace = os.totalmem();
      const usedSpace = totalSpace - freeSpace;
      const usagePercentage = (usedSpace / totalSpace) * 100;

      if (usagePercentage > 90) {
        return {
          name: "disk",
          status: "error",
          message: "Disk space critically low",
          details: {
            usagePercentage: Math.round(usagePercentage),
            freeSpace:
              Math.round((freeSpace / 1024 / 1024 / 1024) * 100) / 100 + " GB",
            totalSpace:
              Math.round((totalSpace / 1024 / 1024 / 1024) * 100) / 100 + " GB",
          },
        };
      } else if (usagePercentage > 80) {
        return {
          name: "disk",
          status: "warning",
          message: "Disk space running low",
          details: {
            usagePercentage: Math.round(usagePercentage),
            freeSpace:
              Math.round((freeSpace / 1024 / 1024 / 1024) * 100) / 100 + " GB",
          },
        };
      }

      return {
        name: "disk",
        status: "ok",
        message: "Disk space healthy",
        details: {
          usagePercentage: Math.round(usagePercentage),
          freeSpace:
            Math.round((freeSpace / 1024 / 1024 / 1024) * 100) / 100 + " GB",
        },
      };
    } catch (error) {
      logger.error("Disk space health check failed:", error);
      return {
        name: "disk",
        status: "error",
        message: "Disk space check failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  static async checkMemory(): Promise<HealthCheck> {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const usagePercentage = (usedMemory / totalMemory) * 100;

      if (usagePercentage > 95) {
        return {
          name: "memory",
          status: "error",
          message: "Memory usage critically high",
          details: {
            usagePercentage: Math.round(usagePercentage),
            usedMemory:
              Math.round((usedMemory / 1024 / 1024 / 1024) * 100) / 100 + " GB",
            totalMemory:
              Math.round((totalMemory / 1024 / 1024 / 1024) * 100) / 100 +
              " GB",
          },
        };
      } else if (usagePercentage > 85) {
        return {
          name: "memory",
          status: "warning",
          message: "Memory usage high",
          details: {
            usagePercentage: Math.round(usagePercentage),
            usedMemory:
              Math.round((usedMemory / 1024 / 1024 / 1024) * 100) / 100 + " GB",
          },
        };
      }

      return {
        name: "memory",
        status: "ok",
        message: "Memory usage healthy",
        details: {
          usagePercentage: Math.round(usagePercentage),
          usedMemory:
            Math.round((usedMemory / 1024 / 1024 / 1024) * 100) / 100 + " GB",
          totalMemory:
            Math.round((totalMemory / 1024 / 1024 / 1024) * 100) / 100 + " GB",
        },
      };
    } catch (error) {
      logger.error("Memory health check failed:", error);
      return {
        name: "memory",
        status: "error",
        message: "Memory check failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  static async checkUploadsDirectory(): Promise<HealthCheck> {
    try {
      const uploadDir = config.upload.dir;

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const stats = fs.statSync(uploadDir);
      if (!stats.isDirectory()) {
        return {
          name: "uploads",
          status: "error",
          message: "Uploads directory is not a directory",
        };
      }

      // Verificar permisos de escritura
      try {
        const testFile = `${uploadDir}/.health-check-${Date.now()}`;
        fs.writeFileSync(testFile, "test");
        fs.unlinkSync(testFile);
      } catch (error) {
        return {
          name: "uploads",
          status: "error",
          message: "Uploads directory is not writable",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }

      return {
        name: "uploads",
        status: "ok",
        message: "Uploads directory is accessible and writable",
        details: { path: uploadDir },
      };
    } catch (error) {
      logger.error("Uploads directory health check failed:", error);
      return {
        name: "uploads",
        status: "error",
        message: "Uploads directory check failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  static async checkApplication(): Promise<HealthCheck> {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      return {
        name: "application",
        status: "ok",
        message: "Application is running",
        details: {
          uptime: Math.round(uptime),
          pid: process.pid,
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: {
            rss:
              Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100 + " MB",
            heapTotal:
              Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100 +
              " MB",
            heapUsed:
              Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100 +
              " MB",
            external:
              Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100 +
              " MB",
          },
          cpuUsage: {
            user: cpuUsage.user,
            system: cpuUsage.system,
          },
        },
      };
    } catch (error) {
      logger.error("Application health check failed:", error);
      return {
        name: "application",
        status: "error",
        message: "Application check failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  static async runAllChecks(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    checks: HealthCheck[];
  }> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkDiskSpace(),
      this.checkMemory(),
      this.checkUploadsDirectory(),
      this.checkApplication(),
    ]);

    const hasErrors = checks.some((check) => check.status === "error");
    const hasWarnings = checks.some((check) => check.status === "warning");

    let status: "healthy" | "degraded" | "unhealthy";
    if (hasErrors) {
      status = "unhealthy";
    } else if (hasWarnings) {
      status = "degraded";
    } else {
      status = "healthy";
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
