import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";
import { logger } from "./logger";

// Configurar métricas por defecto
collectDefaultMetrics({
  register,
  prefix: "empresa_tickets_",
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Métricas personalizadas
export const httpRequestDuration = new Histogram({
  name: "empresa_tickets_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new Counter({
  name: "empresa_tickets_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

export const httpRequestErrors = new Counter({
  name: "empresa_tickets_http_errors_total",
  help: "Total number of HTTP errors",
  labelNames: ["method", "route", "status_code", "error_type"],
});

export const databaseQueryDuration = new Histogram({
  name: "empresa_tickets_database_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

export const databaseQueryTotal = new Counter({
  name: "empresa_tickets_database_queries_total",
  help: "Total number of database queries",
  labelNames: ["operation", "table", "status"],
});

export const cacheHitRatio = new Gauge({
  name: "empresa_tickets_cache_hit_ratio",
  help: "Cache hit ratio (0-1)",
  labelNames: ["cache_type"],
});

export const cacheOperations = new Counter({
  name: "empresa_tickets_cache_operations_total",
  help: "Total number of cache operations",
  labelNames: ["operation", "cache_type", "status"],
});

export const activeUsers = new Gauge({
  name: "empresa_tickets_active_users",
  help: "Number of active users",
});

export const ticketMetrics = {
  created: new Counter({
    name: "empresa_tickets_tickets_created_total",
    help: "Total number of tickets created",
    labelNames: ["priority", "status"],
  }),

  updated: new Counter({
    name: "empresa_tickets_tickets_updated_total",
    help: "Total number of tickets updated",
    labelNames: ["priority", "status", "action"],
  }),

  resolved: new Counter({
    name: "empresa_tickets_tickets_resolved_total",
    help: "Total number of tickets resolved",
    labelNames: ["priority", "resolution_time"],
  }),

  byStatus: new Gauge({
    name: "empresa_tickets_tickets_by_status",
    help: "Number of tickets by status",
    labelNames: ["status"],
  }),

  byPriority: new Gauge({
    name: "empresa_tickets_tickets_by_priority",
    help: "Number of tickets by priority",
    labelNames: ["priority"],
  }),
};

export const userMetrics = {
  logins: new Counter({
    name: "empresa_tickets_user_logins_total",
    help: "Total number of user logins",
    labelNames: ["method", "status"],
  }),

  registrations: new Counter({
    name: "empresa_tickets_user_registrations_total",
    help: "Total number of user registrations",
    labelNames: ["status"],
  }),

  active: new Gauge({
    name: "empresa_tickets_active_users_count",
    help: "Number of active users",
  }),
};

export const systemMetrics = {
  memoryUsage: new Gauge({
    name: "empresa_tickets_memory_usage_bytes",
    help: "Memory usage in bytes",
    labelNames: ["type"],
  }),

  cpuUsage: new Gauge({
    name: "empresa_tickets_cpu_usage_percent",
    help: "CPU usage percentage",
  }),

  diskUsage: new Gauge({
    name: "empresa_tickets_disk_usage_bytes",
    help: "Disk usage in bytes",
    labelNames: ["path"],
  }),

  uptime: new Gauge({
    name: "empresa_tickets_uptime_seconds",
    help: "Application uptime in seconds",
  }),
};

// Función para registrar métricas de HTTP
export const recordHttpRequest = (
  method: string,
  route: string,
  statusCode: number,
  duration: number,
) => {
  const labels = { method, route, status_code: statusCode.toString() };

  httpRequestDuration.observe(labels, duration);
  httpRequestTotal.inc(labels);

  if (statusCode >= 400) {
    httpRequestErrors.inc({
      ...labels,
      error_type: statusCode >= 500 ? "server_error" : "client_error",
    });
  }
};

// Función para registrar métricas de base de datos
export const recordDatabaseQuery = (
  operation: string,
  table: string,
  duration: number,
  status: "success" | "error",
) => {
  const labels = { operation, table, status };

  databaseQueryDuration.observe({ operation, table }, duration);
  databaseQueryTotal.inc(labels);
};

// Función para registrar métricas de cache
export const recordCacheOperation = (
  operation: "get" | "set" | "del" | "hit" | "miss",
  cacheType: string,
  status: "success" | "error",
) => {
  cacheOperations.inc({ operation, cache_type: cacheType, status });
};

// Función para actualizar métricas del sistema
export const updateSystemMetrics = () => {
  const memUsage = process.memoryUsage();

  systemMetrics.memoryUsage.set({ type: "rss" }, memUsage.rss);
  systemMetrics.memoryUsage.set({ type: "heapTotal" }, memUsage.heapTotal);
  systemMetrics.memoryUsage.set({ type: "heapUsed" }, memUsage.heapUsed);
  systemMetrics.memoryUsage.set({ type: "external" }, memUsage.external);

  systemMetrics.uptime.set(process.uptime());
};

// Función para obtener métricas en formato Prometheus
export const getMetrics = async (): Promise<string> => {
  try {
    updateSystemMetrics();
    return await register.metrics();
  } catch (error) {
    logger.error("Error getting metrics:", error);
    return "";
  }
};

// Función para limpiar métricas (útil para tests)
export const clearMetrics = () => {
  register.clear();
};

// Middleware para métricas de Express
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    recordHttpRequest(req.method, route, res.statusCode, duration);
  });

  next();
};

// Endpoint para métricas
export const metricsEndpoint = "/metrics";

logger.info("📊 Metrics system initialized");
