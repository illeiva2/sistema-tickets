# 🚀 Deploy en Render - Sistema de Tickets

## 📋 Configuración Actual

Este monorepo está configurado para hacer deploy de la **API en Render** mientras que el **frontend se mantiene en Vercel**.

## 🏗️ Estructura del Deploy

### Backend (Render)
- **Servicio**: `sistema-tickets-api`
- **Tipo**: Web Service
- **Plan**: Free
- **Base de datos**: PostgreSQL (Supabase)

### Frontend (Vercel)
- **URLs**: 
  - https://sistema-tickets-web.vercel.app
  - https://sistema-tickets-web-git-main-ivans-projects-73af2e4f.vercel.app

## ⚙️ Configuración de Render

### Variables de Entorno Automáticas
- `DATABASE_URL`: Configurada para usar Supabase
- `SHADOW_DATABASE_URL`: Configurada para usar Supabase

### Variables de Entorno Manuales
- `NODE_ENV`: production
- `PORT`: 10000
- `JWT_SECRET`: Tu secreto JWT
- `FRONTEND_URLS`: URLs del frontend en Vercel
- `UPLOAD_DIR`: uploads
- `MAX_FILE_SIZE`: 10485760 (10MB)
- `LOG_LEVEL`: info

### Variables de Entorno Opcionales (OAuth)
- `GOOGLE_CLIENT_ID`: Para autenticación con Google (opcional)
- `GOOGLE_CLIENT_SECRET`: Para autenticación con Google (opcional)
- `GOOGLE_CALLBACK_URL`: URL de callback para OAuth (opcional)

## 🔧 Pasos para el Deploy

### 1. Conectar el Repositorio
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Crea un nuevo **Web Service**
3. Conecta tu repositorio de GitHub
4. Selecciona la rama `main` o `master`

### 2. Configurar el Build
- **Build Command**: 
  ```bash
  cd apps/api
  npm install -g pnpm
  pnpm install
  pnpm run build
  ```
- **Start Command**: `cd apps/api && npm start`

### 3. Configurar Variables de Entorno
1. Copia las variables del archivo `.env.example`
2. Configura `JWT_SECRET` con un valor seguro
3. Asegúrate de que `FRONTEND_URLS` apunte a tu frontend en Vercel

### 4. Base de Datos
- Se usa la base de datos PostgreSQL de Supabase
- Las variables `DATABASE_URL` y `SHADOW_DATABASE_URL` están configuradas en render.yaml

## 🚨 Consideraciones Importantes

### Monorepo
- El build se ejecuta desde `apps/api`
- Las dependencias se instalan localmente en la carpeta de la API
- El frontend se mantiene separado en Vercel

### OAuth
- La autenticación OAuth con Google es **opcional**
- Si no configuras las variables de OAuth, la aplicación funcionará sin esta funcionalidad
- Puedes configurar OAuth más tarde agregando las variables de entorno

### Archivos
- La carpeta `uploads` se creará automáticamente
- Los archivos se almacenan en el sistema de archivos de Render
- **⚠️ Los archivos se pierden en cada redeploy**

### Base de Datos
- Las migraciones de Prisma se ejecutan automáticamente
- Usa `prisma migrate deploy` en producción
- La base de datos de Supabase es persistente y accesible desde Render

## 🔍 Health Check

El servicio incluye un endpoint de health check:
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0"
}
```

## 📊 Monitoreo

- **Logs**: Disponibles en el dashboard de Render
- **Métricas**: Uso de CPU, memoria y red
- **Health Checks**: Automáticos cada 30 segundos

## 🚀 URLs del Deploy

- **API**: `https://sistema-tickets-api.onrender.com`
- **Health Check**: `https://sistema-tickets-api.onrender.com/health`
- **Base de datos**: PostgreSQL en Supabase

## 🔄 Redeploy

Para hacer redeploy:
1. Push a la rama principal
2. Render detecta cambios automáticamente
3. Ejecuta el build y deploy
4. La base de datos se mantiene intacta

## 📝 Notas Adicionales

- El plan gratuito tiene limitaciones de tiempo de inactividad
- Considera actualizar a un plan pago para producción
- Los archivos subidos se pierden en cada redeploy (considera usar S3 o similar)
- La base de datos es persistente y no se pierde
