# 🚀 Deploy en Vercel - Frontend del Sistema de Tickets

## 📋 Configuración Actual

Este monorepo está configurado para hacer deploy del **frontend en Vercel** mientras que el **backend se mantiene en Render**.

## 🏗️ Estructura del Deploy

### Frontend (Vercel)
- **Framework**: Vite + React
- **Build Tool**: TypeScript + Vite
- **Package Manager**: pnpm
- **Output**: `apps/web/dist`

### Backend (Render)
- **API**: `https://sistema-tickets-api.onrender.com`
- **Base de datos**: PostgreSQL (Render)

## ⚙️ Configuración de Vercel

### Archivos de Configuración
- **`vercel.json`** (raíz): Configuración principal del monorepo
- **`apps/web/vercel.json`**: Configuración específica del frontend
- **`apps/web/.vercelignore`**: Archivos a excluir del deploy

### Variables de Entorno
```env
VITE_API_URL=https://sistema-tickets-api.onrender.com
VITE_NODE_ENV=production
```

## 🔧 Configuración del Build

### Build Command
```bash
cd apps/web && pnpm install && pnpm run build
```

### Install Command
```bash
cd apps/web && pnpm install
```

### Output Directory
```
apps/web/dist
```

## 🚨 Consideraciones del Monorepo

### Dependencias del Workspace
- **`@forzani/types`**: Tipos compartidos
- **`@forzani/ui`**: Componentes de UI compartidos
- **`@forzani/config`**: Configuraciones de ESLint, Prettier, etc.

### Solución para Vercel
- Se usa `package-vercel.json` que excluye dependencias del workspace
- Las dependencias se instalan localmente en `apps/web`
- El build se ejecuta desde la carpeta del frontend

## 📱 URLs del Deploy

### Frontend
- **Producción**: `https://sistema-tickets-web.vercel.app`
- **Preview**: `https://sistema-tickets-web-git-main-ivans-projects-73af2e4f.vercel.app`

### Backend
- **API**: `https://sistema-tickets-api.onrender.com`
- **Health Check**: `https://sistema-tickets-api.onrender.com/health`

## 🔄 Flujo de Deploy

### 1. Push a GitHub
- Los cambios se envían a la rama `main`
- Vercel detecta automáticamente los cambios

### 2. Build en Vercel
- Se clona el repositorio completo
- Se ejecuta `pnpm install` en `apps/web`
- Se ejecuta `pnpm run build`
- Se genera el output en `apps/web/dist`

### 3. Deploy
- Los archivos se sirven desde Vercel
- Las rutas se manejan con SPA routing
- Se configuran headers CORS automáticamente

## 🚨 Solución de Problemas Comunes

### Error: "Not found" en dependencias del workspace
**Solución**: Usar `package-vercel.json` que excluye `@forzani/*`

### Error: Build falla por TypeScript
**Solución**: Verificar que `tsconfig.json` esté configurado correctamente

### Error: CORS en desarrollo
**Solución**: Configurar `VITE_API_URL` en `.env.local`

## 📊 Monitoreo

### Vercel Dashboard
- **Builds**: Estado de cada deploy
- **Analytics**: Métricas de rendimiento
- **Functions**: Serverless functions (si se usan)

### Logs
- **Build logs**: Errores durante el build
- **Runtime logs**: Errores en producción
- **Function logs**: Logs de serverless functions

## 🔍 Verificación del Deploy

### 1. Build Exitoso
- ✅ Build completado sin errores
- ✅ Output generado en `apps/web/dist`

### 2. Frontend Funcionando
- ✅ Página principal carga correctamente
- ✅ Navegación entre rutas funciona
- ✅ Componentes se renderizan

### 3. Conexión con Backend
- ✅ API calls funcionan
- ✅ Autenticación funciona
- ✅ Datos se cargan correctamente

## 🚀 Optimizaciones

### Performance
- **Code splitting**: Automático con Vite
- **Tree shaking**: Eliminación de código no usado
- **Minificación**: CSS y JS optimizados

### SEO
- **Meta tags**: Configurados en `index.html`
- **Sitemap**: Generado automáticamente
- **Robots.txt**: Configurado para Vercel

## 📝 Notas Adicionales

- **Hot reload**: Disponible en desarrollo local
- **Environment variables**: Prefijo `VITE_` para variables del cliente
- **Build cache**: Vercel cachea dependencias entre builds
- **Preview deployments**: Automáticos para cada PR

## 🔗 Enlaces Útiles

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
