import { z } from "zod";
import { TicketPriority, TicketStatus } from "@forzani/types";

export const createTicketSchema = z.object({
  title: z.string().min(1, "Título requerido").max(200, "Título muy largo"),
  description: z.string().min(1, "Descripción requerida").max(5000, "Descripción muy larga"),
  priority: z.nativeEnum(TicketPriority, {
    errorMap: () => ({ message: "Prioridad inválida" }),
  }),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1, "Título requerido").max(200, "Título muy largo").optional(),
  description: z.string().min(1, "Descripción requerida").max(5000, "Descripción muy larga").optional(),
  status: z.nativeEnum(TicketStatus, {
    errorMap: () => ({ message: "Estado inválido" }),
  }).optional(),
  priority: z.nativeEnum(TicketPriority, {
    errorMap: () => ({ message: "Prioridad inválida" }),
  }).optional(),
  assigneeId: z.string().uuid("ID de asignado inválido").optional(),
});

export const ticketFiltersSchema = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  requesterId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "priority", "status"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export type CreateTicketRequest = z.infer<typeof createTicketSchema>;
export type UpdateTicketRequest = z.infer<typeof updateTicketSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
