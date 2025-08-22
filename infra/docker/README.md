# Docker Setup - Forzani Tickets

Este directorio contiene toda la configuración de Docker para el monorepo Forzani Tickets.

## 🚀 Inicio Rápido

```bash
# Desde la raíz del proyecto
cd infra/docker

# Ejecutar todo el stack
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📁 Archivos

- `docker-compose.yml` - Configuración principal de servicios
- `Dockerfile.api` - Dockerfile original para la API
- `Dockerfile.api.simple` - Dockerfile simplificado para la API (recomendado)
- `Dockerfile.web` - Dockerfile original para la web
- `Dockerfile.web.simple` - Dockerfile simplificado para la web (recomendado)
- `nginx.conf` - Configuración de Nginx para el frontend
- `test-build.sh` - Script de prueba para verificar builds

## 🔧 Servicios

### Base de Datos (PostgreSQL)

- **Puerto**: 5432
- **Base de datos**: forzani_tickets
- **Usuario**: postgres
- **Contraseña**: postgres

### API Backend

- **Puerto**: 3001
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Frontend Web

- **Puerto**: 3000
- **URL**: http://localhost:3000
- **Proxy API**: /api/\* → http://api:3001/

## 🛠️ Solución de Problemas

### Error: "invalid file request node_modules/@forzani/config"

Este error indica que Docker no puede encontrar los paquetes compartidos del monorepo.

#### Solución 1: Script de Prueba

```bash
cd infra/docker
chmod +x test-build.sh
./test-build.sh
```

#### Solución 2: Limpieza Completa

```bash
# Detener y limpiar todo
docker-compose down -v
docker system prune -f
docker volume prune -f

# Reconstruir desde cero
docker-compose up -d --build --force-recreate
```

#### Solución 3: Verificación Manual

```bash
# Verificar que estás en el directorio correcto
pwd  # Debe mostrar la ruta al directorio raíz del proyecto

# Verificar archivos esenciales
ls -la package.json pnpm-workspace.yaml
ls -la apps/api/package.json apps/web/package.json
ls -la packages/
```

### Error: "Build context not found"

Asegúrate de ejecutar los comandos desde el directorio `infra/docker` y que el contexto de build apunte correctamente a la raíz del proyecto.

### Error: "Package not found"

Verifica que todos los paquetes compartidos estén correctamente definidos en `packages/` y que sus `package.json` existan.

## 🔄 Desarrollo

### Modo Desarrollo

```bash
# Los servicios se ejecutan en modo desarrollo
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f api
docker-compose logs -f web
```

### Modo Producción

```bash
# Usar las versiones simplificadas de Dockerfile
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoreo

### Health Checks

```bash
# API
curl http://localhost:3001/health

# Web (a través de Nginx)
curl http://localhost:3000/health
```

### Logs

```bash
# Todos los servicios
docker-compose logs

# Servicio específico
docker-compose logs api
docker-compose logs web
docker-compose logs db

# Seguir logs en tiempo real
docker-compose logs -f
```

## 🔒 Seguridad

- Los contenedores se ejecutan con usuarios no-root
- Headers de seguridad configurados en Nginx
- Variables de entorno separadas por ambiente
- Volúmenes persistentes para datos críticos

## 📝 Notas Importantes

1. **Contexto de Build**: Los Dockerfiles usan el contexto raíz del monorepo (`../../`)
2. **Dependencias**: Se instalan usando `pnpm install` en la raíz
3. **Workspaces**: Los paquetes compartidos se manejan automáticamente
4. **Puertos**: API en 3001, Web en 3000, DB en 5432
5. **Volúmenes**: Datos de PostgreSQL y uploads se persisten

## 🆘 Soporte

Si encuentras problemas:

1. Ejecuta el script de prueba: `./test-build.sh`
2. Verifica los logs: `docker-compose logs`
3. Limpia y reconstruye: `docker-compose down -v && docker-compose up -d --build`
4. Revisa la documentación principal del proyecto
