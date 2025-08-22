#!/bin/bash

echo "🧪 Probando build de Docker..."

# Limpiar contenedores existentes
echo "📦 Limpiando contenedores existentes..."
docker-compose down -v
docker system prune -f

# Verificar que los archivos necesarios existen
echo "🔍 Verificando archivos necesarios..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json no encontrado en la raíz"
    exit 1
fi

if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ pnpm-workspace.yaml no encontrado"
    exit 1
fi

if [ ! -f "apps/api/package.json" ]; then
    echo "❌ apps/api/package.json no encontrado"
    exit 1
fi

if [ ! -f "apps/web/package.json" ]; then
    echo "❌ apps/web/package.json no encontrado"
    exit 1
fi

echo "✅ Todos los archivos necesarios encontrados"

# Intentar construir solo la API primero
echo "🔨 Construyendo API..."
docker build -f infra/docker/Dockerfile.api.simple -t test-api . || {
    echo "❌ Error construyendo API"
    exit 1
}

echo "✅ API construida exitosamente"

# Intentar construir la web
echo "🔨 Construyendo Web..."
docker build -f infra/docker/Dockerfile.web.simple -t test-web . || {
    echo "❌ Error construyendo Web"
    exit 1
}

echo "✅ Web construida exitosamente"

# Si llegamos aquí, todo está bien
echo "🎉 ¡Todos los builds fueron exitosos!"

# Limpiar imágenes de prueba
docker rmi test-api test-web 2>/dev/null || true

echo "✨ Prueba completada"
