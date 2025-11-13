#!/bin/bash

# Script para iniciar el entorno de desarrollo local
# Uso: ./start-local.sh

echo "🚀 Iniciando Sistema de Tickets - Entorno Local"
echo "================================================"

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker primero."
    exit 1
fi

# Verificar si pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm no está instalado. Instálalo con: npm install -g pnpm"
    exit 1
fi

echo "✅ Verificaciones previas completadas"

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

# Levantar base de datos
echo "🗄️  Levantando PostgreSQL..."
pnpm run db:up

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
pnpm run db:migrate

# Poblar datos de prueba
echo "🌱 Poblando datos de prueba..."
pnpm run db:seed

echo ""
echo "✅ Configuración completada!"
echo ""
echo "🌐 URLs disponibles:"
echo "   Frontend: http://localhost:5173"
echo "   API:      http://localhost:3001"
echo "   pgAdmin:  http://localhost:5050 (admin@localhost / admin)"
echo ""
echo "🚀 Para iniciar el desarrollo, ejecuta:"
echo "   pnpm run dev"
echo ""
echo "📚 Para más información, consulta LOCAL_DEVELOPMENT.md"
