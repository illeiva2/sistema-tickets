import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { join } from "path";

const prisma = new PrismaClient();

// Configuración global para tests
beforeAll(async () => {
  // Configurar base de datos de test
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/empresa_tickets_test";
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret";
  process.env.REDIS_HOST = "localhost";
  process.env.REDIS_PORT = "6379";
  process.env.REDIS_DB = "1"; // Usar DB diferente para tests

  // Ejecutar migraciones
  try {
    execSync("npx prisma migrate deploy", {
      cwd: join(__dirname, "..", ".."),
      stdio: "inherit",
    });
  } catch (error) {
    console.warn("Migration failed, continuing with tests:", error);
  }
});

afterAll(async () => {
  // Limpiar base de datos
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  } catch (error) {
    // Ignorar errores si las tablas no existen
  }

  await prisma.$disconnect();
});

// Helper para crear usuario de test
export const createTestUser = async (overrides: any = {}) => {
  return await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      passwordHash: "$2a$10$test.hash", // Hash de 'password123'
      role: "USER",
      isActive: true,
      emailVerified: true,
      ...overrides,
    },
  });
};

// Helper para crear ticket de test
export const createTestTicket = async (overrides: any = {}) => {
  const user = await createTestUser();
  return await prisma.ticket.create({
    data: {
      title: "Test Ticket",
      description: "Test Description",
      priority: "MEDIUM",
      status: "OPEN",
      requesterId: user.id,
      ...overrides,
    },
  });
};

// Helper para autenticación
export const getAuthToken = (userId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jwt = require("jsonwebtoken");
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
