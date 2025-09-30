import { CacheService, CachePrefixes, CacheTTL } from "../lib/cache";
import { initRedis } from "../lib/cache";

describe("Cache Service", () => {
  beforeAll(async () => {
    await initRedis();
  });

  describe("Basic Operations", () => {
    it("should set and get value", async () => {
      const key = "test-key";
      const value = { test: "data", number: 123 };

      // Set value
      const setResult = await CacheService.set(
        CachePrefixes.USER,
        key,
        value,
        60,
      );
      expect(setResult).toBe(true);

      // Get value
      const getValue = await CacheService.get(CachePrefixes.USER, key);
      expect(getValue).toEqual(value);
    });

    it("should return null for non-existent key", async () => {
      const value = await CacheService.get(CachePrefixes.USER, "non-existent");
      expect(value).toBeNull();
    });

    it("should delete key", async () => {
      const key = "delete-test";
      const value = { data: "test" };

      // Set and verify
      await CacheService.set(CachePrefixes.USER, key, value, 60);
      expect(await CacheService.get(CachePrefixes.USER, key)).toEqual(value);

      // Delete and verify
      const deleteResult = await CacheService.del(CachePrefixes.USER, key);
      expect(deleteResult).toBe(true);
      expect(await CacheService.get(CachePrefixes.USER, key)).toBeNull();
    });

    it("should check if key exists", async () => {
      const key = "exists-test";
      const value = { data: "test" };

      // Initially should not exist
      expect(await CacheService.exists(CachePrefixes.USER, key)).toBe(false);

      // Set and check existence
      await CacheService.set(CachePrefixes.USER, key, value, 60);
      expect(await CacheService.exists(CachePrefixes.USER, key)).toBe(true);
    });
  });

  describe("TTL Operations", () => {
    it("should get TTL of key", async () => {
      const key = "ttl-test";
      const value = { data: "test" };

      await CacheService.set(CachePrefixes.USER, key, value, 300);
      const ttl = await CacheService.getTTL(CachePrefixes.USER, key);

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(300);
    });

    it("should return -1 for non-existent key TTL", async () => {
      const ttl = await CacheService.getTTL(CachePrefixes.USER, "non-existent");
      expect(ttl).toBe(-1);
    });
  });

  describe("Increment Operations", () => {
    it("should increment counter", async () => {
      const key = "counter-test";

      const value1 = await CacheService.incr(CachePrefixes.RATE_LIMIT, key, 60);
      const value2 = await CacheService.incr(CachePrefixes.RATE_LIMIT, key, 60);

      expect(value1).toBe(1);
      expect(value2).toBe(2);
    });

    it("should increment without TTL on subsequent calls", async () => {
      const key = "counter-no-ttl";

      await CacheService.incr(CachePrefixes.RATE_LIMIT, key, 60);
      const value = await CacheService.incr(CachePrefixes.RATE_LIMIT, key);

      expect(value).toBe(2);
    });
  });

  describe("Pattern Operations", () => {
    it("should delete keys by pattern", async () => {
      const prefix = CachePrefixes.TICKET;
      const keys = ["pattern-test-1", "pattern-test-2", "pattern-test-3"];

      // Set multiple keys
      for (const key of keys) {
        await CacheService.set(prefix, key, { data: "test" }, 60);
      }

      // Delete by pattern
      const deletedCount = await CacheService.delPattern(
        prefix,
        "pattern-test-*",
      );
      expect(deletedCount).toBe(3);

      // Verify all keys are deleted
      for (const key of keys) {
        expect(await CacheService.exists(prefix, key)).toBe(false);
      }
    });
  });

  describe("GetOrSet Operations", () => {
    it("should get from cache on first call", async () => {
      const key = "getorset-test";
      let callCount = 0;

      const fallbackFn = async () => {
        callCount++;
        return { data: "from-fallback", callCount };
      };

      // First call should execute fallback
      const result1 = await CacheService.getOrSet(
        CachePrefixes.USER,
        key,
        fallbackFn,
        60,
      );

      expect(result1.data).toBe("from-fallback");
      expect(result1.callCount).toBe(1);
      expect(callCount).toBe(1);

      // Second call should get from cache
      const result2 = await CacheService.getOrSet(
        CachePrefixes.USER,
        key,
        fallbackFn,
        60,
      );

      expect(result2.data).toBe("from-fallback");
      expect(result2.callCount).toBe(1); // Same as first call
      expect(callCount).toBe(1); // Fallback not called again
    });
  });

  describe("Cache Prefixes and TTL", () => {
    it("should use correct prefixes", () => {
      expect(CachePrefixes.USER).toBe("user");
      expect(CachePrefixes.TICKET).toBe("ticket");
      expect(CachePrefixes.DASHBOARD).toBe("dashboard");
    });

    it("should use correct TTL values", () => {
      expect(CacheTTL.USER).toBe(300);
      expect(CacheTTL.TICKET).toBe(600);
      expect(CacheTTL.DASHBOARD).toBe(60);
    });
  });

  describe("Error Handling", () => {
    it("should handle Redis connection errors gracefully", async () => {
      // This test would require mocking Redis to be down
      // For now, we'll just test that the service doesn't crash
      const result = await CacheService.get(CachePrefixes.USER, "test");
      // Should return null if Redis is not available
      expect(result).toBeNull();
    });
  });
});
