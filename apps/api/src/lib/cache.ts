import Redis from "ioredis";
import { logger } from "./logger";

// Configuración de Redis
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0", 10),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Cliente Redis
let redis: Redis | null = null;

// Inicializar conexión a Redis
export const initRedis = async (): Promise<void> => {
  try {
    redis = new Redis(redisConfig);

    redis.on("connect", () => {
      logger.info("✅ Redis connected successfully");
    });

    redis.on("error", (error) => {
      logger.error("❌ Redis connection error:", error);
    });

    redis.on("close", () => {
      logger.warn("⚠️ Redis connection closed");
    });

    // Test de conexión
    await redis.ping();
    logger.info("🔗 Redis ping successful");
  } catch (error) {
    logger.error("❌ Failed to connect to Redis:", error);
    redis = null;
  }
};

// Obtener cliente Redis
export const getRedis = (): Redis | null => {
  return redis;
};

// Cache service
export class CacheService {
  private static getKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  // Obtener valor del cache
  static async get<T>(prefix: string, key: string): Promise<T | null> {
    if (!redis) {
      logger.warn("Redis not available, skipping cache get");
      return null;
    }

    try {
      const cacheKey = this.getKey(prefix, key);
      const value = await redis.get(cacheKey);

      if (value) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        return JSON.parse(value);
      }

      logger.debug(`Cache MISS: ${cacheKey}`);
      return null;
    } catch (error) {
      logger.error("Cache get error:", error);
      return null;
    }
  }

  // Establecer valor en cache
  static async set(
    prefix: string,
    key: string,
    value: any,
    ttlSeconds: number = 300,
  ): Promise<boolean> {
    if (!redis) {
      logger.warn("Redis not available, skipping cache set");
      return false;
    }

    try {
      const cacheKey = this.getKey(prefix, key);
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(value));
      logger.debug(`Cache SET: ${cacheKey} (TTL: ${ttlSeconds}s)`);
      return true;
    } catch (error) {
      logger.error("Cache set error:", error);
      return false;
    }
  }

  // Eliminar del cache
  static async del(prefix: string, key: string): Promise<boolean> {
    if (!redis) {
      logger.warn("Redis not available, skipping cache delete");
      return false;
    }

    try {
      const cacheKey = this.getKey(prefix, key);
      await redis.del(cacheKey);
      logger.debug(`Cache DEL: ${cacheKey}`);
      return true;
    } catch (error) {
      logger.error("Cache delete error:", error);
      return false;
    }
  }

  // Eliminar múltiples claves por patrón
  static async delPattern(prefix: string, pattern: string): Promise<number> {
    if (!redis) {
      logger.warn("Redis not available, skipping cache pattern delete");
      return 0;
    }

    try {
      const searchPattern = this.getKey(prefix, pattern);
      const keys = await redis.keys(searchPattern);

      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug(
          `Cache DEL PATTERN: ${searchPattern} (${keys.length} keys)`,
        );
      }

      return keys.length;
    } catch (error) {
      logger.error("Cache pattern delete error:", error);
      return 0;
    }
  }

  // Verificar si existe en cache
  static async exists(prefix: string, key: string): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      const cacheKey = this.getKey(prefix, key);
      const exists = await redis.exists(cacheKey);
      return exists === 1;
    } catch (error) {
      logger.error("Cache exists error:", error);
      return false;
    }
  }

  // Obtener TTL de una clave
  static async getTTL(prefix: string, key: string): Promise<number> {
    if (!redis) {
      return -1;
    }

    try {
      const cacheKey = this.getKey(prefix, key);
      return await redis.ttl(cacheKey);
    } catch (error) {
      logger.error("Cache TTL error:", error);
      return -1;
    }
  }

  // Incrementar contador
  static async incr(
    prefix: string,
    key: string,
    ttlSeconds?: number,
  ): Promise<number> {
    if (!redis) {
      return 0;
    }

    try {
      const cacheKey = this.getKey(prefix, key);
      const value = await redis.incr(cacheKey);

      if (ttlSeconds && value === 1) {
        await redis.expire(cacheKey, ttlSeconds);
      }

      return value;
    } catch (error) {
      logger.error("Cache increment error:", error);
      return 0;
    }
  }

  // Cache con función de fallback
  static async getOrSet<T>(
    prefix: string,
    key: string,
    fallbackFn: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T> {
    // Intentar obtener del cache
    const cached = await this.get<T>(prefix, key);
    if (cached !== null) {
      return cached;
    }

    // Si no está en cache, ejecutar función y guardar resultado
    try {
      const result = await fallbackFn();
      await this.set(prefix, key, result, ttlSeconds);
      return result;
    } catch (error) {
      logger.error("Cache getOrSet fallback error:", error);
      throw error;
    }
  }

  // Limpiar todo el cache
  static async flushAll(): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      await redis.flushall();
      logger.info("Cache flushed successfully");
      return true;
    } catch (error) {
      logger.error("Cache flush error:", error);
      return false;
    }
  }

  // Obtener estadísticas del cache
  static async getStats(): Promise<any> {
    if (!redis) {
      return null;
    }

    try {
      const info = await redis.info("memory");
      const keyspace = await redis.info("keyspace");

      return {
        memory: info,
        keyspace: keyspace,
        connected: redis.status === "ready",
      };
    } catch (error) {
      logger.error("Cache stats error:", error);
      return null;
    }
  }
}

// Prefijos para diferentes tipos de cache
export const CachePrefixes = {
  USER: "user",
  TICKET: "ticket",
  DASHBOARD: "dashboard",
  SESSION: "session",
  RATE_LIMIT: "rate_limit",
  HEALTH: "health",
} as const;

// TTL por defecto para diferentes tipos de datos
export const CacheTTL = {
  USER: 300, // 5 minutos
  TICKET: 600, // 10 minutos
  DASHBOARD: 60, // 1 minuto
  SESSION: 1800, // 30 minutos
  RATE_LIMIT: 900, // 15 minutos
  HEALTH: 30, // 30 segundos
} as const;
