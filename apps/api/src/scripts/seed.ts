import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Verificar si ya existe un usuario admin
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: 'admin@empresa.com'
    }
  });

  if (existingAdmin) {
    console.log('✅ Usuario admin ya existe');
    return;
  }

  // Crear hash de la contraseña
  const passwordHash = await bcrypt.hash('password123', 10);

  // Crear usuario admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@empresa.com',
      passwordHash: passwordHash,
      name: 'Administrador',
      role: 'ADMIN'
    }
  });

  console.log('✅ Usuario admin creado:', adminUser.email);

  // Crear algunos usuarios de prueba
  const testUsers = [
    {
      email: 'agente@empresa.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Agente de Soporte',
      role: 'AGENT'
    },
    {
      email: 'usuario@empresa.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Usuario Regular',
      role: 'USER'
    }
  ];

  for (const userData of testUsers) {
    const existingUser = await prisma.user.findFirst({
      where: { email: userData.email }
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: userData
      });
      console.log('✅ Usuario creado:', user.email);
    } else {
      console.log('✅ Usuario ya existe:', userData.email);
    }
  }

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
