# Configuración para Desarrollo Local

Este documento explica cómo configurar y ejecutar el sistema de tickets en un entorno de desarrollo local.

## Requisitos Previos

- Node.js >= 20.0.0
- pnpm >= 6.0.0
- Docker y Docker Compose
- Git

## Configuración Inicial

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar Base de Datos Local

Levantar PostgreSQL con Docker:

```bash
pnpm run db:up
```

Esto iniciará:
- PostgreSQL en puerto 5432
- pgAdmin en puerto 5050 (opcional, para administrar la BD)

### 3. Ejecutar Migraciones

```bash
pnpm run db:migrate
```

### 4. Poblar Base de Datos (Opcional)

```bash
pnpm run db:seed
```

### 5. Configuración Completa Automática

Para una configuración completa de una vez:

```bash
pnpm run setup:local
```

## Ejecutar en Desarrollo

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

## URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001
- **pgAdmin**: http://localhost:5050 (admin@localhost / admin)

## Variables de Entorno

### API (.env.local)
```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/empresa_tickets"
JWT_SECRET="dev-secret-key-change-in-production"
PORT=3001
```

### Frontend (apps/web/.env.local)
```env
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE="Sistema de Tickets - Desarrollo"
```

## Comandos Útiles

```bash
# Gestión de Base de Datos
pnpm run db:up          # Levantar PostgreSQL
pnpm run db:down        # Bajar PostgreSQL
pnpm run db:migrate     # Ejecutar migraciones
pnpm run db:seed        # Poblar datos de prueba
pnpm run db:studio      # Abrir Prisma Studio

# Desarrollo
pnpm run dev            # Ejecutar todo
pnpm run dev:api        # Solo API
pnpm run dev:web        # Solo frontend

# Producción
pnpm run build          # Construir API
pnpm run start          # Ejecutar API en producción
```

## Estructura del Proyecto

```
/
├── apps/
│   ├── api/                 # Backend API (Express + Prisma)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── prisma/
│   └── web/                 # Frontend (React + Vite)
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   └── ...
├── packages/                # Paquetes compartidos
├── docker-compose.local.yml # Configuración Docker local
└── .env.local              # Variables de entorno local
```

## Solución de Problemas

### Error de Conexión a Base de Datos
1. Verificar que PostgreSQL esté corriendo: `pnpm run db:up`
2. Verificar que las migraciones estén aplicadas: `pnpm run db:migrate`
3. Verificar la URL de conexión en `.env.local`

### Error de CORS
- El frontend está configurado para usar proxy en desarrollo
- Verificar que `VITE_API_URL` esté configurado correctamente

### Puerto en Uso
- API: Cambiar `PORT` en `.env.local`
- Frontend: Cambiar en `vite.config.ts`
- PostgreSQL: Cambiar en `docker-compose.local.yml`

## Próximos Pasos

Una vez que tengas el entorno local funcionando, puedes:

1. **Explorar el código**: Revisar la estructura y funcionalidades
2. **Hacer modificaciones**: Cambiar estilos, agregar features, etc.
3. **Probar funcionalidades**: Crear tickets, usuarios, etc.
4. **Desarrollar nuevas features**: Agregar funcionalidades específicas

## Notas Importantes

- Los datos se almacenan localmente en PostgreSQL
- Los archivos subidos se guardan en la carpeta `uploads/`
- Los logs se muestran en la consola en modo desarrollo
- OAuth de Google es opcional en desarrollo (requiere configuración adicional)