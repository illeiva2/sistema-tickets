import { Response, NextFunction } from "express";
import { prisma } from "../lib/database";
import { AuthenticatedRequest } from "../middleware/auth";

export class DashboardController {
  static stats = async (
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

      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        urgentTickets,
        totalUsers,
        activeAgents,
        recentActivity,
      ] = await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: "OPEN" as any } }),
        prisma.ticket.count({ where: { status: "IN_PROGRESS" as any } }),
        prisma.ticket.count({ where: { status: "RESOLVED" as any } }),
        prisma.ticket.count({ where: { status: "CLOSED" as any } }),
        prisma.ticket.count({ where: { priority: "URGENT" as any } }),
        prisma.user.count(),
        prisma.user.count({ where: { role: "AGENT" as any } }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

      const mappedActivity = recentActivity.map((a) => ({
        id: a.id,
        type: a.action.includes("comment")
          ? ("comment_added" as const)
          : a.action.includes("resolved")
            ? ("ticket_resolved" as const)
            : a.action.includes("updated")
              ? ("ticket_updated" as const)
              : ("ticket_created" as const),
        description: a.action,
        timestamp: a.createdAt.toISOString(),
        ticketId: a.entity === "ticket" ? a.entityId : undefined,
        userId: a.actorId,
      }));

      res.json({
        success: true,
        data: {
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          urgentTickets,
          totalUsers,
          activeAgents,
          recentActivity: mappedActivity,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

export default DashboardController;
