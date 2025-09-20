# Cambios Realizados para Desarrollo Local

## Archivos Creados

### Configuración de Entorno
- `.env.local` - Variables de entorno para desarrollo
- `apps/web/.env.local` - Variables de entorno del frontend
- `docker-compose.local.yml` - Configuración de PostgreSQL local
- `init-db.sql` - Script de inicialización de la base de datos

### Scripts y Documentación
- `start-local.sh` - Script de inicio rápido
- `LOCAL_DEVELOPMENT.md` - Documentación completa
- `CHANGES_FOR_LOCAL.md` - Este archivo
- `.gitignore.local` - Archivos a ignorar en desarrollo

## Archivos Modificados

### package.json (raíz)
- Agregados scripts de desarrollo: `dev`, `dev:api`, `dev:web`
- Agregados scripts de base de datos: `db:up`, `db:down`, `db:migrate`, `db:seed`
- Agregado script de configuración completa: `setup:local`
- Agregada dependencia: `concurrently`

### apps/web/src/lib/api.ts
- Cambiado URL por defecto de producción a localhost
- Actualizado comentario explicativo

### apps/web/vite.config.ts
- Agregado proxy para API en desarrollo
- Configuración para redirigir `/api/*` a `http://localhost:3001`

### apps/api/src/config/index.ts
- Modificado para cargar `.env.local` en desarrollo
- Mantiene compatibilidad con producción

## Configuración de Servicios

### PostgreSQL Local
- Puerto: 5432
- Usuario: postgres
- Contraseña: postgres
- Base de datos: empresa_tickets

### pgAdmin (Opcional)
- Puerto: 5050
- Usuario: admin@localhost
- Contraseña: admin

### API Backend
- Puerto: 3001
- URL: http://localhost:3001

### Frontend
- Puerto: 5173
- URL: http://localhost:5173
- Proxy configurado para API

## Comandos Principales

```bash
# Configuración inicial completa
./start-local.sh

# O manualmente:
pnpm install
pnpm run db:up
pnpm run db:migrate
pnpm run db:seed

# Desarrollo
pnpm run dev          # Todo junto
pnpm run dev:api      # Solo API
pnpm run dev:web      # Solo frontend

# Base de datos
pnpm run db:up        # Levantar PostgreSQL
pnpm run db:down      # Bajar PostgreSQL
pnpm run db:studio    # Prisma Studio
```

## Próximos Pasos

1. **Ejecutar configuración inicial**: `./start-local.sh`
2. **Iniciar desarrollo**: `pnpm run dev`
3. **Explorar la aplicación**: http://localhost:5173
4. **Revisar documentación**: `LOCAL_DEVELOPMENT.md`

## Notas Importantes

- Los archivos `.env.local` no se suben a Git (están en `.gitignore.local`)
- La configuración mantiene compatibilidad con producción
- Docker es requerido para la base de datos local
- Los datos se almacenan localmente en PostgreSQL