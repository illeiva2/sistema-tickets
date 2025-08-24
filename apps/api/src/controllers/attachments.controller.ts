import { Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../middleware/validation";
import { AuthenticatedRequest } from "../middleware/auth";
import AttachmentsService from "../services/attachments.service";

const listSchema = z.object({
  params: z.object({ ticketId: z.string().min(1) }),
});

export class AttachmentsController {
  static list = [
    validate(listSchema),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Usuario no autenticado",
            },
          });
        }
        const { ticketId } = req.params as any;
        const data = await AttachmentsService.listByTicket(ticketId);
        res.json({ success: true, data });
      } catch (err) {
        next(err);
      }
    },
  ];

  static upload = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Usuario no autenticado" },
        });
      }
      const { ticketId } = req.params as any;
      const file = req.file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({
          success: false,
          error: { code: "NO_FILE", message: "Archivo requerido" },
        });
      }
      const created = await AttachmentsService.create(ticketId, file);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  };

  static remove = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Usuario no autenticado" },
        });
      }
      const { id } = req.params as any;
      await AttachmentsService.delete(id);
      res.json({ success: true, data: { message: "Adjunto eliminado" } });
    } catch (err) {
      next(err);
    }
  };
}

export default AttachmentsController;
