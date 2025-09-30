import request from "supertest";
import { app } from "../index";
import { createTestUser } from "./setup";

describe("Auth API", () => {
  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      await createTestUser({
        email: "admin@empresa.com",
        passwordHash:
          "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "admin@empresa.com",
        password: "password",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data.user.email).toBe("admin@empresa.com");
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "admin@empresa.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("should reject empty credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should apply rate limiting", async () => {
      // Hacer múltiples requests rápidos
      const promises = Array(10)
        .fill(null)
        .map(() =>
          request(app).post("/api/auth/login").send({
            email: "admin@empresa.com",
            password: "wrongpassword",
          }),
        );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter((r) => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/auth/register", () => {
    it("should register new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data.user.email).toBe("newuser@example.com");
    });

    it("should reject duplicate email", async () => {
      await createTestUser({ email: "duplicate@example.com" });

      const response = await request(app).post("/api/auth/register").send({
        name: "Duplicate User",
        email: "duplicate@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate password strength", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Weak Password User",
        email: "weak@example.com",
        password: "123", // Contraseña débil
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh valid token", async () => {
      const user = await createTestUser();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jwt = require("jsonwebtoken");
      const refreshToken = jwt.sign(
        { userId: user.id, type: "refresh" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
    });

    it("should reject invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
