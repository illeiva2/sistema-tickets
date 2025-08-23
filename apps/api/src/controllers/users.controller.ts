import { Response, NextFunction } from "express";
import { prisma } from "../lib/database";
import { AuthenticatedRequest } from "../middleware/auth";

export class UsersController {
  static listAgents = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const agents = await prisma.user.findMany({
        where: { role: "AGENT" as any },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      });
      res.json({ success: true, data: agents });
    } catch (err) {
      next(err);
    }
  };
}

export default UsersController;
