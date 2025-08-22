import { PrismaClient, UserRole, TicketStatus, TicketPriority } from "@prisma/client";
import bcrypt from "bcryptjs";
import { logger } from "../lib/logger";

const prisma = new PrismaClient();

async function main() {
  logger.info("🌱 Starting database seeding...");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  logger.info("🗑️  Cleared existing data");

  // Create users
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@forzani.com",
      name: "Administrador",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: "agent1@forzani.com",
      name: "Agente 1",
      passwordHash,
      role: UserRole.AGENT,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: "agent2@forzani.com",
      name: "Agente 2",
      passwordHash,
      role: UserRole.AGENT,
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "user1@forzani.com",
        name: "Usuario 1",
        passwordHash,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: "user2@forzani.com",
        name: "Usuario 2",
        passwordHash,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: "user3@forzani.com",
        name: "Usuario 3",
        passwordHash,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: "user4@forzani.com",
        name: "Usuario 4",
        passwordHash,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: "user5@forzani.com",
        name: "Usuario 5",
        passwordHash,
        role: UserRole.USER,
      },
    }),
  ]);

  logger.info("👥 Created users");

  // Create tickets
  const ticketData = [
    {
      title: "Error al iniciar sesión",
      description: "No puedo acceder a mi cuenta desde ayer. Aparece un error de credenciales inválidas.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      requesterId: users[0].id,
    },
    {
      title: "Problema con la impresora",
      description: "La impresora del departamento de contabilidad no está funcionando correctamente.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      requesterId: users[1].id,
      assigneeId: agent1.id,
    },
    {
      title: "Solicitud de nuevo software",
      description: "Necesitamos instalar Adobe Photoshop en las computadoras del área de diseño.",
      priority: TicketPriority.LOW,
      status: TicketStatus.RESOLVED,
      requesterId: users[2].id,
      assigneeId: agent2.id,
    },
    {
      title: "Internet lento",
      description: "La conexión a internet está muy lenta en todo el edificio.",
      priority: TicketPriority.URGENT,
      status: TicketStatus.CLOSED,
      requesterId: users[3].id,
      assigneeId: agent1.id,
      closedAt: new Date(),
    },
    {
      title: "Problema con el email",
      description: "No puedo enviar correos electrónicos desde Outlook.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      requesterId: users[4].id,
    },
    {
      title: "Actualización de antivirus",
      description: "El antivirus necesita ser actualizado en mi computadora.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      requesterId: users[0].id,
      assigneeId: agent2.id,
    },
    {
      title: "Problema con el proyector",
      description: "El proyector de la sala de conferencias no se conecta correctamente.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      requesterId: users[1].id,
      assigneeId: agent1.id,
    },
    {
      title: "Solicitud de acceso a carpeta",
      description: "Necesito acceso a la carpeta compartida del proyecto X.",
      priority: TicketPriority.LOW,
      status: TicketStatus.CLOSED,
      requesterId: users[2].id,
      assigneeId: agent2.id,
      closedAt: new Date(),
    },
    {
      title: "Error en el sistema de facturación",
      description: "El sistema de facturación no está generando las facturas correctamente.",
      priority: TicketPriority.URGENT,
      status: TicketStatus.OPEN,
      requesterId: users[3].id,
    },
    {
      title: "Problema con el escáner",
      description: "El escáner no está funcionando correctamente.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      requesterId: users[4].id,
      assigneeId: agent1.id,
    },
    {
      title: "Solicitud de nuevo monitor",
      description: "Mi monitor está dañado y necesito un reemplazo.",
      priority: TicketPriority.LOW,
      status: TicketStatus.RESOLVED,
      requesterId: users[0].id,
      assigneeId: agent2.id,
    },
    {
      title: "Problema con el teléfono",
      description: "Mi teléfono de escritorio no tiene tono de marcado.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.CLOSED,
      requesterId: users[1].id,
      assigneeId: agent1.id,
      closedAt: new Date(),
    },
    {
      title: "Error en la base de datos",
      description: "Hay un error al consultar la base de datos de clientes.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      requesterId: users[2].id,
    },
    {
      title: "Problema con el aire acondicionado",
      description: "El aire acondicionado de mi oficina no está funcionando.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      requesterId: users[3].id,
      assigneeId: agent2.id,
    },
    {
      title: "Solicitud de capacitación",
      description: "Necesito capacitación sobre el nuevo sistema de inventarios.",
      priority: TicketPriority.LOW,
      status: TicketStatus.RESOLVED,
      requesterId: users[4].id,
      assigneeId: agent1.id,
    },
  ];

  const tickets = await Promise.all(
    ticketData.map((data) => prisma.ticket.create({ data }))
  );

  logger.info("🎫 Created tickets");

  // Create comments
  const commentData = [
    {
      ticketId: tickets[1].id,
      authorId: agent1.id,
      message: "He revisado el problema. Parece ser un problema de drivers. Voy a actualizarlos.",
    },
    {
      ticketId: tickets[1].id,
      authorId: users[1].id,
      message: "Gracias por la actualización. ¿Cuándo estará listo?",
    },
    {
      ticketId: tickets[2].id,
      authorId: agent2.id,
      message: "Software instalado correctamente. Por favor, reinicia tu computadora.",
    },
    {
      ticketId: tickets[2].id,
      authorId: users[2].id,
      message: "Perfecto, ya funciona. Gracias!",
    },
    {
      ticketId: tickets[3].id,
      authorId: agent1.id,
      message: "Problema resuelto. Se cambió el router principal.",
    },
    {
      ticketId: tickets[5].id,
      authorId: agent2.id,
      message: "Antivirus actualizado. Tu computadora está protegida.",
    },
    {
      ticketId: tickets[6].id,
      authorId: agent1.id,
      message: "Proyector reparado. Ya está funcionando correctamente.",
    },
    {
      ticketId: tickets[7].id,
      authorId: agent2.id,
      message: "Acceso otorgado a la carpeta compartida.",
    },
    {
      ticketId: tickets[9].id,
      authorId: agent1.id,
      message: "Escáner reparado. Ya puedes usarlo normalmente.",
    },
    {
      ticketId: tickets[10].id,
      authorId: agent2.id,
      message: "Monitor reemplazado. El nuevo está funcionando correctamente.",
    },
    {
      ticketId: tickets[11].id,
      authorId: agent1.id,
      message: "Teléfono reemplazado. Ya tienes línea.",
    },
    {
      ticketId: tickets[13].id,
      authorId: agent2.id,
      message: "Aire acondicionado reparado. Ya está funcionando.",
    },
    {
      ticketId: tickets[14].id,
      authorId: agent1.id,
      message: "Capacitación programada para el próximo viernes a las 2 PM.",
    },
  ];

  await Promise.all(
    commentData.map((data) => prisma.comment.create({ data }))
  );

  logger.info("💬 Created comments");

  // Create audit logs
  const auditLogData = [
    {
      entity: "ticket",
      entityId: tickets[0].id,
      action: "created",
      actorId: users[0].id,
      meta: { title: tickets[0].title },
    },
    {
      entity: "ticket",
      entityId: tickets[1].id,
      action: "assigned",
      actorId: agent1.id,
      meta: { assigneeId: agent1.id },
    },
    {
      entity: "ticket",
      entityId: tickets[2].id,
      action: "resolved",
      actorId: agent2.id,
      meta: { status: "RESOLVED" },
    },
  ];

  await Promise.all(
    auditLogData.map((data) => prisma.auditLog.create({ data }))
  );

  logger.info("📝 Created audit logs");

  logger.info("✅ Database seeding completed successfully!");
  logger.info("📋 Credentials:");
  logger.info(`   Admin: admin@forzani.com / password123`);
  logger.info(`   Agent 1: agent1@forzani.com / password123`);
  logger.info(`   Agent 2: agent2@forzani.com / password123`);
  logger.info(`   User 1: user1@forzani.com / password123`);
  logger.info(`   User 2: user2@forzani.com / password123`);
  logger.info(`   User 3: user3@forzani.com / password123`);
  logger.info(`   User 4: user4@forzani.com / password123`);
  logger.info(`   User 5: user5@forzani.com / password123`);
}

main()
  .catch((e) => {
    logger.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
