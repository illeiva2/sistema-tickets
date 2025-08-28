# Usar Node.js 18 LTS
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN cd apps/api && pnpm prisma generate

# Build de la aplicación
RUN cd apps/api && pnpm run build

# Imagen de producción
FROM node:18-alpine AS production

# Instalar dependencias del sistema para producción
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json

# Instalar solo dependencias de producción
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Copiar archivos compilados y necesarios
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
COPY --from=base /app/apps/api/uploads ./apps/api/uploads
COPY --from=base /app/apps/api/thumbnails ./apps/api/thumbnails

# Crear directorio para logs
RUN mkdir -p /app/apps/api/logs

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar ownership de archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["node", "apps/api/dist/index.js"]
