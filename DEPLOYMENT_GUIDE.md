# 🚀 Guía de Deployment en Servidor Local

## 📋 Requisitos Previos

### Hardware Mínimo

- **CPU**: 2 cores (recomendado 4+)
- **RAM**: 4GB (recomendado 8GB+)
- **Disco**: 20GB libres (recomendado 50GB+)
- **Red**: Conexión estable a internet

### Software Requerido

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git curl

# Verificar instalación
docker --version
docker compose version
```

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/sistema-tickets.git
cd sistema-tickets
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp infra/docker/env.production.example infra/docker/.env

# Editar variables (IMPORTANTE: Cambiar contraseñas)
nano infra/docker/.env
```

**Variables críticas a cambiar:**

- `DB_PASSWORD`: Contraseña segura para PostgreSQL
- `JWT_SECRET`: Clave secreta de al menos 32 caracteres
- `GRAFANA_PASSWORD`: Contraseña para Grafana

### 3. Configurar Configuraciones de Base de Datos

```bash
# Crear configuración PostgreSQL optimizada
cat > infra/docker/postgresql.conf << 'EOF'
# Configuración optimizada para servidor local
shared_preload_libraries = 'pg_stat_statements'
max_connections = 100
shared_buffers = 128MB
effective_cache_size = 512MB
maintenance_work_mem = 32MB
checkpoint_completion_target = 0.9
wal_buffers = 8MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
log_statement = 'all'
log_min_duration_statement = 1000
EOF

# Crear configuración Redis optimizada
cat > infra/docker/redis.conf << 'EOF'
# Configuración Redis para servidor local
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
tcp-keepalive 300
timeout 0
EOF
```

## 🚀 Proceso de Deployment

### Opción 1: Deployment Automático (Recomendado)

```bash
# Hacer ejecutable el script
chmod +x scripts/deploy.sh

# Ejecutar deployment
./scripts/deploy.sh
```

### Opción 2: Deployment Manual

#### Paso 1: Construir Imágenes

```bash
# Construir todas las imágenes
docker compose -f infra/docker/docker-compose.local.yml build
```

#### Paso 2: Iniciar Base de Datos

```bash
# Iniciar solo base de datos y Redis
docker compose -f infra/docker/docker-compose.local.yml up -d db redis

# Esperar a que estén listos
sleep 15
```

#### Paso 3: Configurar Base de Datos

```bash
# Ejecutar migraciones
cd apps/api
pnpm db:migrate
pnpm db:seed
cd ../..
```

#### Paso 4: Iniciar Aplicación

```bash
# Iniciar todos los servicios
docker compose -f infra/docker/docker-compose.local.yml up -d
```

#### Paso 5: Verificar Deployment

```bash
# Verificar estado de contenedores
docker compose -f infra/docker/docker-compose.local.yml ps

# Verificar logs
docker compose -f infra/docker/docker-compose.local.yml logs -f
```

## 🌐 Acceso a la Aplicación

### URLs de Acceso

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin123)

### Verificación de Salud

```bash
# Verificar API
curl http://localhost:3001/health

# Verificar Frontend
curl http://localhost:3000

# Verificar métricas
curl http://localhost:3001/metrics
```

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker compose -f infra/docker/docker-compose.local.yml logs -f

# Servicio específico
docker compose -f infra/docker/docker-compose.local.yml logs -f api
```

### Monitoreo de Recursos

```bash
# Uso de recursos
docker stats

# Espacio en disco
docker system df
```

## 🔧 Mantenimiento

### Backup de Base de Datos

```bash
# Crear backup
docker exec empresa-db-local pg_dump -U postgres empresa_tickets > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i empresa-db-local psql -U postgres empresa_tickets < backup_file.sql
```

### Actualización de la Aplicación

```bash
# Detener servicios
docker compose -f infra/docker/docker-compose.local.yml down

# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker compose -f infra/docker/docker-compose.local.yml build
docker compose -f infra/docker/docker-compose.local.yml up -d
```

### Limpieza de Recursos

```bash
# Limpiar contenedores parados
docker container prune -f

# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f
```

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. Puerto en Uso

```bash
# Verificar qué proceso usa el puerto
sudo netstat -tulpn | grep :3001

# Matar proceso
sudo kill -9 PID
```

#### 2. Base de Datos No Conecta

```bash
# Verificar logs de base de datos
docker compose -f infra/docker/docker-compose.local.yml logs db

# Reiniciar base de datos
docker compose -f infra/docker/docker-compose.local.yml restart db
```

#### 3. Memoria Insuficiente

```bash
# Verificar uso de memoria
free -h

# Limpiar memoria
sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches
```

#### 4. Permisos de Archivos

```bash
# Corregir permisos
sudo chown -R $USER:$USER .
chmod +x scripts/deploy.sh
```

## 📈 Optimizaciones de Rendimiento

### Configuración de Sistema

```bash
# Aumentar límites de archivos
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimizar kernel para Docker
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Configuración de Docker

```bash
# Configurar Docker daemon
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    }
  }
}
```

## 🔒 Consideraciones de Seguridad

### 1. Firewall

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw allow 5432
sudo ufw allow 6379
sudo ufw allow 9090
sudo ufw allow 3002
```

### 2. Variables de Entorno Seguras

- Cambiar todas las contraseñas por defecto
- Usar JWT secrets de al menos 32 caracteres
- Configurar HTTPS en producción
- Restringir acceso a puertos de monitoreo

### 3. Backup Automático

```bash
# Crear script de backup automático
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec empresa-db-local pg_dump -U postgres empresa_tickets > /backups/backup_$DATE.sql
find /backups -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x backup.sh

# Agregar a crontab para backup diario
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## 📞 Soporte

### Comandos de Diagnóstico

```bash
# Estado general
docker compose -f infra/docker/docker-compose.local.yml ps

# Recursos del sistema
docker stats --no-stream

# Logs de errores
docker compose -f infra/docker/docker-compose.local.yml logs --tail=100 | grep -i error

# Espacio en disco
df -h
du -sh /var/lib/docker
```

### Información del Sistema

```bash
# Información completa
docker system info
docker version
uname -a
free -h
df -h
```

¡Deployment completado! 🎉
