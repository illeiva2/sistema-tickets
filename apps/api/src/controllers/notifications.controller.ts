import { Request, Response } from "express";
import { NotificationsService } from "../services/notifications.service";
import { verifyEmailConnection } from "../config/email";
import { ApiError } from "../lib/errors";
import { config } from "../config";

export class NotificationsController {
  /**
   * Debug: Mostrar configuración de email
   */
  static async debugConfig(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          host: config.email.host,
          port: config.email.port,
          secure: config.email.secure,
          user: config.email.user,
          password: config.email.password
            ? `${config.email.password.substring(0, 4)}...`
            : "undefined",
          from: config.email.from,
        },
      });
    } catch (error) {
      throw new ApiError(
        "DEBUG_FAILED",
        "Error al obtener configuración de debug",
        500,
      );
    }
  }

  /**
   * Probar conexión de email
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const isConnected = await verifyEmailConnection();

      if (isConnected) {
        res.json({
          success: true,
          message: "Conexión de email verificada correctamente",
        });
      } else {
        throw new ApiError(
          "EMAIL_CONNECTION_FAILED",
          "No se pudo conectar al servicio de email",
          500,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "EMAIL_TEST_FAILED",
        "Error al probar la conexión de email",
        500,
      );
    }
  }

  /**
   * Enviar email de prueba
   */
  static async sendTestEmail(req: Request, res: Response) {
    try {
      const { to, subject, message } = req.body;

      if (!to || !subject || !message) {
        throw new ApiError(
          "MISSING_FIELDS",
          "Faltan campos requeridos: to, subject, message",
          400,
        );
      }

      const success = await NotificationsService.sendEmail({
        to,
        subject,
        html: `<p>${message}</p>`,
        text: message,
      });

      if (success) {
        res.json({
          success: true,
          message: "Email de prueba enviado correctamente",
        });
      } else {
        throw new ApiError(
          "EMAIL_SEND_FAILED",
          "No se pudo enviar el email de prueba",
          500,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "EMAIL_TEST_FAILED",
        "Error al enviar email de prueba",
        500,
      );
    }
  }
}
