# 🚀 Guía Rápida - Desarrollo Local

Esta guía te ayudará a configurar y ejecutar el proyecto en tu máquina local.

## 📋 Requisitos Previos

- **Node.js** >= 20.0.0
- **pnpm** >= 6.0.0
- **Docker Desktop** (para la base de datos PostgreSQL)

## 🔧 Configuración Inicial

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar Base de Datos con Docker

Levanta PostgreSQL usando Docker Compose:

```bash
pnpm run db:up
```

Esto iniciará:
- PostgreSQL en puerto **5432**
- pgAdmin en puerto **5050** (opcional, para administrar la BD)

### 3. Configurar Variables de Entorno

Los archivos `.env` ya están configurados para desarrollo local:

- `apps/api/.env` - Configuración de la API
- `apps/web/.env` - Configuración del frontend

Si necesitas recrearlos, puedes usar los archivos de ejemplo:
- `apps/api/.env.local.example`
- `apps/web/.env.local.example`

### 4. Generar Cliente Prisma

```bash
pnpm run db:generate
```

### 5. Ejecutar Migraciones

```bash
pnpm run db:migrate
```

### 6. Poblar Base de Datos (Opcional)

Para tener datos de prueba:

```bash
pnpm run db:seed
```

## 🚀 Ejecutar en Desarrollo

### Opción 1: Ejecutar Todo Junto

```bash
pnpm run dev
```

Esto ejecutará simultáneamente:
- API backend en http://localhost:3001
- Frontend web en http://localhost:5173

### Opción 2: Ejecutar por Separado

**Terminal 1 - API:**
```bash
pnpm run dev:api
```

**Terminal 2 - Frontend:**
```bash
pnpm run dev:web
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **pgAdmin**: http://localhost:5050 (admin@localhost / admin)

## 👤 Credenciales de Prueba

Después de ejecutar `pnpm run db:seed`, puedes usar estas credenciales:

### Administradores
- **admin@empresa.com** / password123

### Agentes
- **agent1@empresa.com** / password123
- **agent2@empresa.com** / password123

### Usuarios
- **user1@empresa.com** / password123
- **user2@empresa.com** / password123

## 📚 Comandos Útiles

```bash
# Desarrollo
pnpm run dev          # Ejecutar todo
pnpm run dev:api      # Solo API
pnpm run dev:web      # Solo frontend

# Base de datos
pnpm run db:up        # Levantar PostgreSQL
pnpm run db:down      # Bajar PostgreSQL
pnpm run db:migrate   # Ejecutar migraciones
pnpm run db:generate  # Generar cliente Prisma
pnpm run db:seed      # Poblar datos de prueba
pnpm run db:studio    # Abrir Prisma Studio

# Build
pnpm run build        # Construir todo
pnpm run build:api    # Solo API
pnpm run build:web   # Solo frontend

# Limpieza
pnpm run clean        # Limpiar builds
```

## 🔍 Solución de Problemas

### Error: Puerto 5432 ya en uso

Si PostgreSQL ya está corriendo en tu máquina:

1. Detén el servicio local de PostgreSQL, o
2. Cambia el puerto en `docker-compose.local.yml` a otro (ej: 5433)

### Error: No se puede conectar a la base de datos

1. Verifica que Docker esté corriendo: `docker ps`
2. Verifica que el contenedor esté activo: `docker-compose -f docker-compose.local.yml ps`
3. Revisa los logs: `docker-compose -f docker-compose.local.yml logs postgres`

### Error: Module not found

1. Limpia node_modules: `rm -rf node_modules apps/*/node_modules packages/*/node_modules`
2. Reinstala: `pnpm install`

### Error: Prisma Client no generado

```bash
pnpm run db:generate
```

## 🎯 Próximos Pasos

Una vez que tengas el entorno local funcionando:

1. **Explorar el código**: Revisa la estructura y funcionalidades
2. **Hacer modificaciones**: Cambia estilos, agrega features, etc.
3. **Probar funcionalidades**: Crea tickets, usuarios, etc.
4. **Desarrollar nuevas features**: Agrega funcionalidades específicas

---

**¡Listo para desarrollar!** 🎉

