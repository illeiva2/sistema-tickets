#!/bin/bash

# Script de deployment optimizado para el sistema de tickets
set -e

echo "🚀 Iniciando deployment del sistema de tickets..."

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
    log "Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no está instalado"
    fi
    
    if ! command -v pnpm &> /dev/null; then
        error "pnpm no está instalado"
    fi
    
    success "Dependencias verificadas"
}

# Limpiar recursos anteriores
cleanup() {
    log "Limpiando recursos anteriores..."
    
    # Detener contenedores
    docker-compose -f infra/docker/docker-compose.optimized.yml down --remove-orphans || true
    
    # Limpiar imágenes no utilizadas
    docker image prune -f || true
    
    success "Limpieza completada"
}

# Construir imágenes
build_images() {
    log "Construyendo imágenes Docker..."
    
    # Construir con cache
    docker-compose -f infra/docker/docker-compose.optimized.yml build --parallel
    
    success "Imágenes construidas"
}

# Ejecutar tests
run_tests() {
    log "Ejecutando tests..."
    
    # Tests de API
    cd apps/api
    pnpm test --coverage || warning "Algunos tests fallaron"
    cd ../..
    
    # Tests de Web
    cd apps/web
    pnpm test --coverage || warning "Algunos tests fallaron"
    cd ../..
    
    success "Tests completados"
}

# Configurar base de datos
setup_database() {
    log "Configurando base de datos..."
    
    # Iniciar solo la base de datos
    docker-compose -f infra/docker/docker-compose.optimized.yml up -d db redis
    
    # Esperar a que esté lista
    log "Esperando a que la base de datos esté lista..."
    sleep 10
    
    # Ejecutar migraciones
    cd apps/api
    pnpm db:migrate || error "Falló la migración de la base de datos"
    pnpm db:seed || warning "Falló el seeding de la base de datos"
    cd ../..
    
    success "Base de datos configurada"
}

# Iniciar servicios
start_services() {
    log "Iniciando servicios..."
    
    # Iniciar todos los servicios
    docker-compose -f infra/docker/docker-compose.optimized.yml up -d
    
    # Esperar a que estén listos
    log "Esperando a que los servicios estén listos..."
    sleep 30
    
    success "Servicios iniciados"
}

# Verificar salud de los servicios
health_check() {
    log "Verificando salud de los servicios..."
    
    # Verificar API
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        success "API está funcionando"
    else
        error "API no está respondiendo"
    fi
    
    # Verificar Web
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "Web está funcionando"
    else
        error "Web no está respondiendo"
    fi
    
    # Verificar Prometheus
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        success "Prometheus está funcionando"
    else
        warning "Prometheus no está respondiendo"
    fi
    
    # Verificar Grafana
    if curl -f http://localhost:3001/login > /dev/null 2>&1; then
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
    echo "📈 Grafana: http://localhost:3001 (admin/admin)"
    echo "🗄️  Base de datos: localhost:5432"
    echo "💾 Redis: localhost:6379"
    echo ""
    echo "📋 Comandos útiles:"
    echo "  Ver logs: docker-compose -f infra/docker/docker-compose.optimized.yml logs -f"
    echo "  Detener: docker-compose -f infra/docker/docker-compose.optimized.yml down"
    echo "  Reiniciar: docker-compose -f infra/docker/docker-compose.optimized.yml restart"
    echo ""
}

# Función principal
main() {
    log "Iniciando deployment del sistema de tickets..."
    
    check_dependencies
    cleanup
    build_images
    run_tests
    setup_database
    start_services
    health_check
    show_access_info
    
    success "Deployment completado exitosamente! 🎉"
}

# Manejo de errores
trap 'error "Deployment falló en la línea $LINENO"' ERR

# Ejecutar función principal
main "$@"
