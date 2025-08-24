import { createTransporter } from "../config/email";
import { config } from "../config/index";
import { logger } from "../lib/logger";

export interface NotificationData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface TicketNotificationData {
  ticketId: string;
  ticketTitle: string;
  ticketDescription: string;
  status?: string;
  priority?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  createdByName?: string;
  commentText?: string;
}

export class NotificationsService {
  /**
   * Enviar email de notificación
   */
  static async sendEmail(notification: NotificationData): Promise<boolean> {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: config.email.from,
        to: notification.to,
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${notification.to}`, {
        messageId: info.messageId,
      });
      return true;
    } catch (error) {
      logger.error("Failed to send email notification", {
        error,
        to: notification.to,
      });
      return false;
    }
  }

  /**
   * Notificar cuando se asigna un ticket
   */
  static async notifyTicketAssigned(
    data: TicketNotificationData,
  ): Promise<void> {
    if (!data.assigneeEmail) return;

    const subject = `🎫 Ticket #${data.ticketId} asignado: ${data.ticketTitle}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎫 Nuevo Ticket Asignado</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">Ticket #${data.ticketId}</h3>
          <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #334155;">${data.ticketTitle}</p>
          <p style="margin: 0 0 15px 0; color: #64748b;">${data.ticketDescription}</p>
          <div style="display: flex; gap: 20px; margin-top: 15px;">
            <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px;">${data.priority || "Sin prioridad"}</span>
            <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px;">${data.status || "Abierto"}</span>
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          <strong>Creado por:</strong> ${data.createdByName}<br>
          <strong>Asignado a:</strong> ${data.assigneeName}
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${config.server.nodeEnv === "production" ? "https://yourdomain.com" : "http://localhost:5173"}/tickets/${data.ticketId}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Ticket
          </a>
        </div>
      </div>
    `;

    const text = `
Nuevo Ticket Asignado

Ticket #${data.ticketId}: ${data.ticketTitle}
Descripción: ${data.ticketDescription}
Prioridad: ${data.priority || "Sin prioridad"}
Estado: ${data.status || "Abierto"}
Creado por: ${data.createdByName}
Asignado a: ${data.assigneeName}

Ver ticket: ${config.server.nodeEnv === "production" ? "https://yourdomain.com" : "http://localhost:5173"}/tickets/${data.ticketId}
    `;

    await this.sendEmail({
      to: data.assigneeEmail,
      subject,
      html,
      text,
    });
  }

  /**
   * Notificar cuando se cambia el estado de un ticket
   */
  static async notifyTicketStatusChanged(
    data: TicketNotificationData,
  ): Promise<void> {
    if (!data.assigneeEmail) return;

    const subject = `🔄 Estado del ticket #${data.ticketId} actualizado: ${data.status}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">🔄 Estado del Ticket Actualizado</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">Ticket #${data.ticketId}</h3>
          <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #334155;">${data.ticketTitle}</p>
          <p style="margin: 0 0 15px 0; color: #64748b;">${data.ticketDescription}</p>
          <div style="background: #7c3aed; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold;">
            Nuevo Estado: ${data.status}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          <strong>Asignado a:</strong> ${data.assigneeName}
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${config.server.nodeEnv === "production" ? "https://yourdomain.com" : "http://localhost:5173"}/tickets/${data.ticketId}" 
             style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Ticket
          </a>
        </div>
      </div>
    `;

    const text = `
Estado del Ticket Actualizado

Ticket #${data.ticketId}: ${data.ticketTitle}
Descripción: ${data.ticketDescription}
Nuevo Estado: ${data.status}
Asignado a: ${data.assigneeName}

Ver ticket: ${config.server.nodeEnv === "production" ? "https://yourdomain.com" : "http://localhost:5173"}/tickets/${data.ticketId}
    `;

    await this.sendEmail({
      to: data.assigneeEmail,
      subject,
      html,
      text,
    });
  }

  /**
   * Notificar cuando se agrega un comentario importante
   */
  static async notifyCommentAdded(data: TicketNotificationData): Promise<void> {
    if (!data.assigneeEmail) return;

    const subject = `💬 Nuevo comentario en ticket #${data.ticketId}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">💬 Nuevo Comentario</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">Ticket #${data.ticketId}</h3>
          <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #334155;">${data.ticketTitle}</p>
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; color: #065f46; font-style: italic;">"${data.commentText}"</p>
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          <strong>Asignado a:</strong> ${data.assigneeName}
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${config.server.nodeEnv === "production" ? "https://yourdomain.com" : "http://localhost:5173"}/tickets/${data.ticketId}" 
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Ticket
          </a>
        </div>
      </div>
    `;

    const text = `
Nuevo Comentario

Ticket #${data.ticketId}: ${data.ticketTitle}
Comentario: "${data.commentText}"
Asignado a: ${data.assigneeName}

Ver ticket: ${config.server.nodeEnv === "production" ? "https://yourdomain.com" : "http://localhost:5173"}/tickets/${data.ticketId}
    `;

    await this.sendEmail({
      to: data.assigneeEmail,
      subject,
      html,
      text,
    });
  }
}
