import path from "path";
import fs from "fs/promises";
import { prisma } from "../lib/database";
import { ApiError } from "../lib/errors";

export class AttachmentsService {
  static async listByTicket(ticketId: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket)
      throw new ApiError("TICKET_NOT_FOUND", "Ticket no encontrado", 404);
    const attachments = await prisma.attachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
    });
    return attachments;
  }

  static async create(ticketId: string, file: Express.Multer.File) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket)
      throw new ApiError("TICKET_NOT_FOUND", "Ticket no encontrado", 404);

    const uploadsDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const uniqueName = `${Date.now()}-${Math.random().toString(16).slice(2)}-${file.originalname}`;
    const targetPath = path.join(uploadsDir, uniqueName);
    await fs.writeFile(targetPath, file.buffer);

    const storageUrl = `/uploads/${uniqueName}`;

    const created = await prisma.attachment.create({
      data: {
        ticketId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageUrl,
      },
    });

    return created;
  }

  static async delete(id: string) {
    const att = await prisma.attachment.findUnique({ where: { id } });
    if (!att)
      throw new ApiError("ATTACHMENT_NOT_FOUND", "Adjunto no encontrado", 404);
    // Remove file first (best-effort)
    try {
      const filePath = path.join(
        process.cwd(),
        att.storageUrl.replace(/^\/uploads\//, "uploads/"),
      );
      await fs.unlink(filePath);
    } catch (_e) {
      void 0; // best-effort remove
    }
    await prisma.attachment.delete({ where: { id } });
  }
}

export default AttachmentsService;
