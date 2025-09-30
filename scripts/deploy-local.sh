#!/bin/bash

# Script de deployment para servidor local
set -e

echo "🚀 Iniciando deployment del sistema de tickets en servidor local..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar dependencias
check_dependencies() {
    log "Verificando dependencias del sistema..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado. Instalar con: sudo apt install docker.io"
    fi
    
    # Verificar Docker Compose
    if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
        error "Docker Compose no está disponible. Instalar con: sudo apt install docker-compose-plugin"
    fi
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        error "Git no está instalado. Instalar con: sudo apt install git"
    fi
    
    # Verificar espacio en disco
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    if [ "$AVAILABLE_SPACE" -lt 5000000 ]; then
        warning "Espacio en disco bajo. Se recomiendan al menos 5GB libres."
    fi
    
    # Verificar memoria
    TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    if [ "$TOTAL_MEM" -lt 4000 ]; then
        warning "Memoria RAM baja. Se recomiendan al menos 4GB."
    fi
    
    success "Dependencias verificadas"
}

# Configurar variables de entorno
setup_environment() {
    log "Configurando variables de entorno..."
    
    # Crear archivo .env si no existe
    if [ ! -f "infra/docker/.env" ]; then
        if [ -f "infra/docker/env.production.example" ]; then
            cp infra/docker/env.production.example infra/docker/.env
            warning "Archivo .env creado desde ejemplo. REVISAR Y CAMBIAR CONTRASEÑAS."
        else
            error "Archivo de ejemplo de variables de entorno no encontrado"
        fi
    fi
    
    # Generar contraseñas seguras si no están configuradas
    if ! grep -q "DB_PASSWORD=" infra/docker/.env || grep -q "CHANGE_ME" infra/docker/.env; then
        DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" infra/docker/.env
        log "Contraseña de base de datos generada: $DB_PASS"
    fi
    
    if ! grep -q "JWT_SECRET=" infra/docker/.env || grep -q "CHANGE_ME" infra/docker/.env; then
        JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/")
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" infra/docker/.env
        log "JWT Secret generado"
    fi
    
    success "Variables de entorno configuradas"
}

# Crear configuraciones optimizadas
create_configs() {
    log "Creando configuraciones optimizadas..."
    
    # Configuración PostgreSQL
    cat > infra/docker/postgresql.conf << 'EOF'
# Configuración PostgreSQL optimizada para servidor local
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
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
EOF

    # Configuración Redis
    cat > infra/docker/redis.conf << 'EOF'
# Configuración Redis optimizada para servidor local
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
tcp-keepalive 300
timeout 0
tcp-backlog 511
databases 16
EOF

    success "Configuraciones creadas"
}

# Limpiar recursos anteriores
cleanup() {
    log "Limpiando recursos anteriores..."
    
    # Detener contenedores existentes
    docker compose -f infra/docker/docker-compose.local.yml down --remove-orphans 2>/dev/null || true
    
    # Limpiar imágenes no utilizadas
    docker image prune -f 2>/dev/null || true
    
    # Limpiar volúmenes huérfanos
    docker volume prune -f 2>/dev/null || true
    
    success "Limpieza completada"
}

# Construir imágenes
build_images() {
    log "Construyendo imágenes Docker..."
    
    # Construir con cache y paralelización
    docker compose -f infra/docker/docker-compose.local.yml build --parallel --no-cache
    
    success "Imágenes construidas"
}

# Configurar base de datos
setup_database() {
    log "Configurando base de datos..."
    
    # Iniciar solo base de datos y Redis
    docker compose -f infra/docker/docker-compose.local.yml up -d db redis
    
    # Esperar a que estén listos
    log "Esperando a que la base de datos esté lista..."
    sleep 15
    
    # Verificar conexión a base de datos
    for i in {1..30}; do
        if docker exec empresa-db-local pg_isready -U postgres -d empresa_tickets >/dev/null 2>&1; then
            success "Base de datos lista"
            break
        fi
        if [ $i -eq 30 ]; then
            error "Base de datos no respondió en 30 intentos"
        fi
        sleep 2
    done
    
    # Ejecutar migraciones
    log "Ejecutando migraciones de base de datos..."
    cd apps/api
    
    # Verificar si pnpm está disponible
    if command -v pnpm &> /dev/null; then
        pnpm db:migrate || error "Falló la migración de la base de datos"
        pnpm db:seed || warning "Falló el seeding de la base de datos"
    else
        # Usar npm como fallback
        npm run db:migrate || error "Falló la migración de la base de datos"
        npm run db:seed || warning "Falló el seeding de la base de datos"
    fi
    
    cd ../..
    success "Base de datos configurada"
}

# Iniciar servicios
start_services() {
    log "Iniciando servicios de aplicación..."
    
    # Iniciar todos los servicios
    docker compose -f infra/docker/docker-compose.local.yml up -d
    
    # Esperar a que estén listos
    log "Esperando a que los servicios estén listos..."
    sleep 30
    
    success "Servicios iniciados"
}

# Verificar salud de los servicios
health_check() {
    log "Verificando salud de los servicios..."
    
    # Verificar API
    for i in {1..10}; do
        if curl -f http://localhost:3001/health >/dev/null 2>&1; then
            success "API está funcionando"
            break
        fi
        if [ $i -eq 10 ]; then
            error "API no está respondiendo después de 10 intentos"
        fi
        sleep 3
    done
    
    # Verificar Web
    for i in {1..10}; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            success "Web está funcionando"
            break
        fi
        if [ $i -eq 10 ]; then
            warning "Web no está respondiendo"
        fi
        sleep 3
    done
    
    # Verificar Prometheus
    if curl -f http://localhost:9090/-/healthy >/dev/null 2>&1; then
        success "Prometheus está funcionando"
    else
        warning "Prometheus no está respondiendo"
    fi
    
    # Verificar Grafana
    if curl -f http://localhost:3002/login >/dev/null 2>&1; then
        success "Grafana está funcionando"
    else
        warning "Grafana no está respondiendo"
    fi
}

# Mostrar información de acceso
show_access_info() {
    log "Información de acceso:"
    echo ""
    echo "🌐 Aplicación Web: http://localhost:3000"
    echo "🔧 API: http://localhost:3001"
    echo "📊 Prometheus: http://localhost:9090"
    echo "📈 Grafana: http://localhost:3002"
    echo "🗄️  Base de datos: localhost:5432"
    echo "💾 Redis: localhost:6379"
    echo ""
    echo "📋 Comandos útiles:"
    echo "  Ver logs: docker compose -f infra/docker/docker-compose.local.yml logs -f"
    echo "  Detener: docker compose -f infra/docker/docker-compose.local.yml down"
    echo "  Reiniciar: docker compose -f infra/docker/docker-compose.local.yml restart"
    echo "  Estado: docker compose -f infra/docker/docker-compose.local.yml ps"
    echo ""
    echo "🔐 Credenciales por defecto:"
    echo "  Grafana: admin/admin123"
    echo "  Base de datos: postgres/[password del .env]"
    echo ""
}

# Función principal
main() {
    log "Iniciando deployment del sistema de tickets en servidor local..."
    
    check_dependencies
    setup_environment
    create_configs
    cleanup
    build_images
    setup_database
    start_services
    health_check
    show_access_info
    
    success "Deployment completado exitosamente! 🎉"
    echo ""
    echo "📖 Para más información, consulta DEPLOYMENT_GUIDE.md"
}

# Manejo de errores
trap 'error "Deployment falló en la línea $LINENO"' ERR

# Ejecutar función principal
main "$@"
