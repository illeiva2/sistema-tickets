#!/bin/bash

# 🚀 Script de Despliegue Automático - Sistema de Tickets
# Uso: ./scripts/deploy.sh [api|web|both]

set -e

echo "🚀 Iniciando despliegue del Sistema de Tickets..."

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

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "Debes ejecutar este script desde la raíz del proyecto"
fi

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI no está instalado. Instálalo con: npm i -g vercel"
fi

# Función para desplegar API
deploy_api() {
    log "🔧 Desplegando API..."
    
    cd apps/api
    
    # Verificar que exista vercel.json
    if [ ! -f "vercel.json" ]; then
        error "vercel.json no encontrado en apps/api/"
    fi
    
    # Build del proyecto
    log "📦 Construyendo API..."
    npm run build
    
    # Desplegar en Vercel
    log "🚀 Desplegando en Vercel..."
    vercel --prod --yes
    
    success "✅ API desplegada exitosamente"
    cd ../..
}

# Función para desplegar Frontend
deploy_web() {
    log "🌐 Desplegando Frontend..."
    
    cd apps/web
    
    # Verificar que exista vercel.json
    if [ ! -f "vercel.json" ]; then
        error "vercel.json no encontrado en apps/web/"
    fi
    
    # Build del proyecto
    log "📦 Construyendo Frontend..."
    npm run build
    
    # Desplegar en Vercel
    log "🚀 Desplegando en Vercel..."
    vercel --prod --yes
    
    success "✅ Frontend desplegado exitosamente"
    cd ../..
}

# Función para desplegar ambos
deploy_both() {
    log "🔄 Desplegando API y Frontend..."
    
    deploy_api
    deploy_web
    
    success "✅ Despliegue completo exitoso"
}

# Función para verificar estado
check_status() {
    log "📊 Verificando estado del despliegue..."
    
    # Verificar API
    if [ -d "apps/api/.vercel" ]; then
        log "✅ API configurada para Vercel"
    else
        warning "⚠️  API no configurada para Vercel"
    fi
    
    # Verificar Frontend
    if [ -d "apps/web/.vercel" ]; then
        log "✅ Frontend configurado para Vercel"
    else
        warning "⚠️  Frontend no configurado para Vercel"
    fi
    
    # Verificar variables de entorno
    log "🔍 Verificando variables de entorno..."
    
    cd apps/api
    if vercel env ls &> /dev/null; then
        success "✅ Variables de entorno configuradas en API"
    else
        warning "⚠️  Variables de entorno no configuradas en API"
    fi
    cd ../..
}

# Función para mostrar ayuda
show_help() {
    echo "🚀 Script de Despliegue - Sistema de Tickets"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos:"
    echo "  api     - Desplegar solo la API"
    echo "  web     - Desplegar solo el Frontend"
    echo "  both    - Desplegar API y Frontend"
    echo "  status  - Verificar estado del despliegue"
    echo "  help    - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 api      # Desplegar solo API"
    echo "  $0 both     # Desplegar todo"
    echo "  $0 status   # Verificar estado"
}

# Función principal
main() {
    case "${1:-help}" in
        "api")
            deploy_api
            ;;
        "web")
            deploy_web
            ;;
        "both")
            deploy_both
            ;;
        "status")
            check_status
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal
main "$@"
