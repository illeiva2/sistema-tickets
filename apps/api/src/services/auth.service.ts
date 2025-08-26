import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/database";
import { config } from "../config";
import { ApiError } from "../lib/errors";
import { logger } from "../lib/logger";

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError("INVALID_CREDENTIALS", "Credenciales inválidas", 401);
    }

    // Verificar si es un usuario de Google OAuth que aún no configuró contraseña
    if (user.googleId && (user as any).mustChangePassword) {
      throw new ApiError(
        "GOOGLE_OAUTH_USER",
        "Este usuario se registró con Google. Por favor, inicia sesión con Google o configura tu contraseña personal primero.",
        401,
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new ApiError("INVALID_CREDENTIALS", "Credenciales inválidas", 401);
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: (user as any).mustChangePassword ?? false,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions,
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: "refresh" },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn } as SignOptions,
    );

    logger.info(`User ${user.email} logged in successfully`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: (user as any).mustChangePassword ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as {
        id: string;
        type: string;
      };

      if (decoded.type !== "refresh") {
        throw new ApiError("INVALID_TOKEN", "Token de refresh inválido", 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new ApiError("USER_NOT_FOUND", "Usuario no encontrado", 404);
      }

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions,
      );

      return {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError("INVALID_TOKEN", "Token de refresh inválido", 401);
      }
      throw error;
    }
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "Usuario no encontrado", 404);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
