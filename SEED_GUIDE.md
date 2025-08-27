# 🌱 Guía de Seed - Sistema de Tickets

## 📋 **¿Qué es el Seed?**

El **seed** es un proceso que llena tu base de datos con datos de ejemplo para que puedas probar el sistema sin tener que crear todo manualmente.

## 🎯 **¿Qué datos se crean?**

### 👥 **Usuarios (5)**
- **1 Administrador**: `admin@sistema-tickets.com` / `Admin123!`
- **1 Agente**: `agente@sistema-tickets.com` / `Agente123!`
- **3 Usuarios**: `usuario1@sistema-tickets.com` / `Usuario123!`

### 🎫 **Tickets (5)**
- **1 Abierto**: Problema con acceso al sistema
- **2 En Progreso**: Nueva funcionalidad y problema de rendimiento
- **1 Resuelto**: Error en reportes
- **1 Abierto**: Consulta sobre facturación

### 💬 **Comentarios (7)**
- Conversaciones realistas entre usuarios y agentes
- Diferentes estados de tickets

### 🔔 **Notificaciones (3)**
- Notificaciones de tickets asignados, en progreso y resueltos

## 🚀 **Cómo ejecutar el Seed**

### **Opción 1: Seed Local (Desarrollo)**
```bash
cd apps/api
npm run db:seed
```

### **Opción 2: Seed de Producción**
```bash
cd apps/api
npm run db:seed:prod
```

### **Opción 3: Seed en Supabase (Recomendado para producción)**
```bash
cd apps/api
npm run db:seed:supabase
```

## 🗄️ **Seed en Supabase - Paso a Paso**

### **PASO 1: Verificar Variables de Entorno**
1. Asegúrate de que tu archivo `.env` tenga la `DATABASE_URL` correcta
2. La URL debe ser de Supabase, no local

### **PASO 2: Ejecutar el Seed**
```bash
cd apps/api
npm run db:seed:supabase
```

### **PASO 3: Verificar Resultados**
Deberías ver algo como:
```
🌱 Iniciando seed de Supabase...
🔗 Conectando a: //***@db.xxxxx.supabase.co:5432/postgres
✅ Conexión a Supabase establecida
🧹 Limpiando base de datos...
✅ Base de datos limpiada
👥 Creando usuarios...
✅ Usuarios creados
🎫 Creando tickets...
✅ Tickets creados
💬 Creando comentarios...
✅ Comentarios creados
🔔 Creando notificaciones...
✅ Notificaciones creadas
⚙️ Configurando preferencias de notificación...
✅ Preferencias de notificación configuradas

🎉 ¡Seed de Supabase completado exitosamente!

📊 Resumen de datos creados:
👥 Usuarios: 5 (1 Admin, 1 Agente, 3 Usuarios)
🎫 Tickets: 5 (1 Abierto, 2 En Progreso, 1 Resuelto, 1 Abierto)
💬 Comentarios: 7
🔔 Notificaciones: 3
⚙️ Preferencias: 5

🔑 Credenciales de acceso:
👑 Admin: admin@sistema-tickets.com / Admin123!
👨‍💼 Agente: agente@sistema-tickets.com / Agente123!
👤 Usuario 1: usuario1@sistema-tickets.com / Usuario123!
👤 Usuario 2: usuario2@sistema-tickets.com / Usuario123!
👤 Usuario 3: usuario3@sistema-tickets.com / Usuario123!
```

## 🔑 **Credenciales de Acceso**

### **👑 Administrador**
- **Email**: `admin@sistema-tickets.com`
- **Password**: `Admin123!`
- **Rol**: ADMIN
- **Permisos**: Acceso completo al sistema

### **👨‍💼 Agente de Soporte**
- **Email**: `agente@sistema-tickets.com`
- **Password**: `Agente123!`
- **Rol**: AGENT
- **Permisos**: Gestionar tickets, responder comentarios

### **👤 Usuarios Regulares**
- **Email**: `usuario1@sistema-tickets.com` / `Usuario123!`
- **Email**: `usuario2@sistema-tickets.com` / `Usuario123!`
- **Email**: `usuario3@sistema-tickets.com` / `Usuario123!`
- **Rol**: USER
- **Permisos**: Crear tickets, ver sus propios tickets

## 🎫 **Tickets de Ejemplo**

### **1. Problema con el acceso al sistema**
- **Estado**: Abierto
- **Prioridad**: Alta
- **Solicitante**: Juan Pérez
- **Asignado**: Agente de Soporte
- **Descripción**: Error de autenticación

### **2. Solicitud de nueva funcionalidad**
- **Estado**: En Progreso
- **Prioridad**: Media
- **Solicitante**: María García
- **Asignado**: Agente de Soporte
- **Descripción**: Exportar reportes en PDF

### **3. Error en la generación de reportes**
- **Estado**: Resuelto
- **Prioridad**: Urgente
- **Solicitante**: Carlos López
- **Asignado**: Administrador
- **Descripción**: Reportes con datos duplicados

### **4. Consulta sobre facturación**
- **Estado**: Abierto
- **Prioridad**: Baja
- **Solicitante**: Juan Pérez
- **Asignado**: Sin asignar
- **Descripción**: Explicación del sistema de facturación

### **5. Problema de rendimiento**
- **Estado**: En Progreso
- **Prioridad**: Alta
- **Solicitante**: María García
- **Asignado**: Administrador
- **Descripción**: Sistema lento, optimización necesaria

## 🔄 **Re-ejecutar el Seed**

### **¿Cuándo re-ejecutar?**
- Después de cambios en el esquema de la base de datos
- Para limpiar datos de prueba
- Para restaurar datos de ejemplo

### **¿Cómo re-ejecutar?**
```bash
cd apps/api
npm run db:seed:supabase
```

**⚠️ IMPORTANTE**: El seed **SIEMPRE** limpia la base de datos antes de crear nuevos datos.

## 🆘 **Solución de Problemas**

### **Error: "Connection refused"**
- Verifica que la `DATABASE_URL` sea correcta
- Asegúrate de que Supabase esté funcionando
- Verifica que la IP esté permitida en Supabase

### **Error: "Table doesn't exist"**
- Ejecuta las migraciones primero: `npm run db:migrate`
- Verifica que el esquema de Prisma esté actualizado

### **Error: "Permission denied"**
- Verifica que el usuario de la base de datos tenga permisos
- Asegúrate de que las políticas de Supabase permitan las operaciones

### **Error: "Duplicate key"**
- El seed limpia automáticamente la base de datos
- Si persiste, verifica que no haya triggers o constraints

## 📊 **Verificar el Seed**

### **1. En Supabase Dashboard**
1. Ve a tu proyecto en Supabase
2. Ve a **Table Editor**
3. Verifica que las tablas tengan datos:
   - `users` → 5 registros
   - `tickets` → 5 registros
   - `comments` → 7 registros
   - `notifications` → 3 registros

### **2. En la Aplicación**
1. Accede al frontend
2. Inicia sesión con cualquier usuario
3. Verifica que puedas ver tickets y comentarios

### **3. Con Prisma Studio**
```bash
cd apps/api
npm run db:studio
```

## 🎯 **Próximos Pasos**

1. ✅ **Ejecutar el seed** en Supabase
2. 🔄 **Probar el login** con los usuarios creados
3. 🎫 **Verificar tickets** y comentarios
4. 🔔 **Probar notificaciones**
5. 🚀 **¡Disfrutar del sistema funcionando!**

---

## 🎉 **¡Listo para Probar!**

Con el seed ejecutado, tu sistema de tickets estará completamente funcional con datos reales de ejemplo. ¡Puedes empezar a probar todas las funcionalidades!
