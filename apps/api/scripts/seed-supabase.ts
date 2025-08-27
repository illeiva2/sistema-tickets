import { PrismaClient, UserRole, TicketStatus, TicketPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Iniciando seed de Supabase...');
  console.log('🔗 Conectando a:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***@'));

  try {
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a Supabase establecida');

    // Limpiar base de datos existente
    console.log('🧹 Limpiando base de datos...');
    
    // Eliminar en orden para evitar problemas de foreign key
    await prisma.comment.deleteMany();
    await prisma.attachment?.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();
    await prisma.auditLog?.deleteMany();
    await prisma.notification?.deleteMany();
    await prisma.notificationPreferences?.deleteMany();

    console.log('✅ Base de datos limpiada');

    // Crear usuarios de ejemplo
    console.log('👥 Creando usuarios...');
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@sistema-tickets.com',
        passwordHash: await bcrypt.hash('Admin123!', 12),
        name: 'Administrador del Sistema',
        role: UserRole.ADMIN,
      },
    });

    const agentUser = await prisma.user.create({
      data: {
        email: 'agente@sistema-tickets.com',
        passwordHash: await bcrypt.hash('Agente123!', 12),
        name: 'Agente de Soporte',
        role: UserRole.AGENT,
      },
    });

    const user1 = await prisma.user.create({
      data: {
        email: 'usuario1@sistema-tickets.com',
        passwordHash: await bcrypt.hash('Usuario123!', 12),
        name: 'Juan Pérez',
        role: UserRole.USER,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'usuario2@sistema-tickets.com',
        passwordHash: await bcrypt.hash('Usuario123!', 12),
        name: 'María García',
        role: UserRole.USER,
      },
    });

    const user3 = await prisma.user.create({
      data: {
        email: 'usuario3@sistema-tickets.com',
        passwordHash: await bcrypt.hash('Usuario123!', 12),
        name: 'Carlos López',
        role: UserRole.USER,
      },
    });

    console.log('✅ Usuarios creados');

    // Crear tickets de ejemplo
    console.log('🎫 Creando tickets...');

    const ticket1 = await prisma.ticket.create({
      data: {
        title: 'Problema con el acceso al sistema',
        description: 'No puedo acceder al sistema desde esta mañana. Aparece un error de autenticación.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        requesterId: user1.id,
        assigneeId: agentUser.id,
      },
    });

    const ticket2 = await prisma.ticket.create({
      data: {
        title: 'Solicitud de nueva funcionalidad',
        description: 'Me gustaría que se agregue la opción de exportar reportes en formato PDF.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.MEDIUM,
        requesterId: user2.id,
        assigneeId: agentUser.id,
      },
    });

    const ticket3 = await prisma.ticket.create({
      data: {
        title: 'Error en la generación de reportes',
        description: 'Los reportes mensuales no se están generando correctamente. Aparecen datos duplicados.',
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.URGENT,
        requesterId: user3.id,
        assigneeId: adminUser.id,
        closedAt: new Date(),
      },
    });

    const ticket4 = await prisma.ticket.create({
      data: {
        title: 'Consulta sobre facturación',
        description: 'Necesito ayuda para entender cómo funciona el sistema de facturación automática.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.LOW,
        requesterId: user1.id,
      },
    });

    const ticket5 = await prisma.ticket.create({
      data: {
        title: 'Problema de rendimiento',
        description: 'El sistema está muy lento últimamente. Tarda mucho en cargar las páginas.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.HIGH,
        requesterId: user2.id,
        assigneeId: adminUser.id,
      },
    });

    console.log('✅ Tickets creados');

    // Crear comentarios de ejemplo
    console.log('💬 Creando comentarios...');

    await prisma.comment.create({
      data: {
        ticketId: ticket1.id,
        authorId: agentUser.id,
        message: 'Hola Juan, estoy revisando tu problema. ¿Podrías confirmar si el error persiste?',
      },
    });

    await prisma.comment.create({
      data: {
        ticketId: ticket1.id,
        authorId: user1.id,
        message: 'Sí, el error persiste. También probé desde otro navegador y es lo mismo.',
      },
    });

    await prisma.comment.create({
      data: {
        ticketId: ticket2.id,
        authorId: agentUser.id,
        message: 'María, he revisado tu solicitud. Es una excelente idea. Comenzaré a trabajar en ello.',
      },
    });

    await prisma.comment.create({
      data: {
        ticketId: ticket3.id,
        authorId: adminUser.id,
        message: 'Carlos, he solucionado el problema de los reportes duplicados. El sistema ya está funcionando correctamente.',
      },
    });

    await prisma.comment.create({
      data: {
        ticketId: ticket3.id,
        authorId: user3.id,
        message: 'Perfecto, muchas gracias. Ya puedo ver que los reportes se generan correctamente.',
      },
    });

    await prisma.comment.create({
      data: {
        ticketId: ticket4.id,
        authorId: agentUser.id,
        message: 'Juan, te envío un manual detallado sobre el sistema de facturación. ¿Te parece si agendamos una llamada para explicarte?',
      },
    });

    await prisma.comment.create({
      data: {
        ticketId: ticket5.id,
        authorId: adminUser.id,
        message: 'María, he identificado el problema de rendimiento. Es un issue con la base de datos. Estoy optimizando las consultas.',
      },
    });

    console.log('✅ Comentarios creados');

    // Crear notificaciones de ejemplo
    console.log('🔔 Creando notificaciones...');

    await prisma.notification.create({
      data: {
        userId: user1.id,
        title: 'Ticket Asignado',
        message: 'Tu ticket "Problema con el acceso al sistema" ha sido asignado a un agente.',
        type: 'TICKET_ASSIGNED',
        read: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user2.id,
        title: 'Ticket en Progreso',
        message: 'Tu ticket "Solicitud de nueva funcionalidad" está siendo trabajado.',
        type: 'TICKET_UPDATED',
        read: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user3.id,
        title: 'Ticket Resuelto',
        message: 'Tu ticket "Error en la generación de reportes" ha sido resuelto.',
        type: 'TICKET_RESOLVED',
        read: false,
      },
    });

    console.log('✅ Notificaciones creadas');

    // Crear preferencias de notificación
    console.log('⚙️ Configurando preferencias de notificación...');

    for (const user of [user1, user2, user3, agentUser, adminUser]) {
      await prisma.notificationPreferences.create({
        data: {
          userId: user.id,
          email: true,
          push: true,
          sms: false,
        },
      });
    }

    console.log('✅ Preferencias de notificación configuradas');

    // Mostrar resumen
    console.log('\n🎉 ¡Seed de Supabase completado exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`👥 Usuarios: 5 (1 Admin, 1 Agente, 3 Usuarios)`);
    console.log(`🎫 Tickets: 5 (1 Abierto, 2 En Progreso, 1 Resuelto, 1 Abierto)`);
    console.log(`💬 Comentarios: 7`);
    console.log(`🔔 Notificaciones: 3`);
    console.log(`⚙️ Preferencias: 5`);

    console.log('\n🔑 Credenciales de acceso:');
    console.log('👑 Admin: admin@sistema-tickets.com / Admin123!');
    console.log('👨‍💼 Agente: agente@sistema-tickets.com / Agente123!');
    console.log('👤 Usuario 1: usuario1@sistema-tickets.com / Usuario123!');
    console.log('👤 Usuario 2: usuario2@sistema-tickets.com / Usuario123!');
    console.log('👤 Usuario 3: usuario3@sistema-tickets.com / Usuario123!');

    console.log('\n🌐 URLs de acceso:');
    console.log(`Frontend: ${process.env.FRONTEND_URL || 'https://tu-frontend.vercel.app'}`);
    console.log(`API: ${process.env.API_URL || 'https://tu-api.vercel.app'}`);

  } catch (error) {
    console.error('❌ Error durante el seed de Supabase:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Seed de Supabase completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el seed de Supabase:', error);
    process.exit(1);
  });
