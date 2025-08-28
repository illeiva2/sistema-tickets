# 🚂 Despliegue en Railway

## **Configuración para Railway**

### **1. Instalar Railway CLI**
```bash
npm install -g @railway/cli
```

### **2. Login en Railway**
```bash
railway login
```

### **3. Crear nuevo proyecto**
```bash
railway init
```

### **4. Conectar con GitHub**
```bash
railway link
```

### **5. Configurar variables de entorno**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DATABASE_URL="tu-url-de-postgresql"
railway variables set JWT_SECRET="tu-secret-key"
railway variables set FRONTEND_URLS="https://tu-frontend.vercel.app"
# ... otras variables
```

### **6. Desplegar**
```bash
railway up
```

## **Variables de Entorno Requeridas**

### **Obligatorias:**
- `DATABASE_URL` - URL de PostgreSQL en Railway
- `JWT_SECRET` - Clave secreta para JWT
- `FRONTEND_URLS` - URLs del frontend para CORS

### **Opcionales:**
- `GOOGLE_CLIENT_ID` - Para OAuth Google
- `GOOGLE_CLIENT_SECRET` - Para OAuth Google
- `EMAIL_HOST` - Para envío de emails
- `EMAIL_USER` - Usuario de email
- `EMAIL_PASSWORD` - Contraseña de email

## **Base de Datos PostgreSQL**

### **1. Crear servicio PostgreSQL en Railway**
- Ir a Railway Dashboard
- Crear nuevo servicio
- Seleccionar "PostgreSQL"
- Copiar la URL de conexión

### **2. Ejecutar migraciones**
```bash
railway run -- pnpm prisma migrate deploy
```

### **3. Generar Prisma Client**
```bash
railway run -- pnpm prisma generate
```

## **Comandos Útiles**

### **Ver logs:**
```bash
railway logs
```

### **Ejecutar comandos:**
```bash
railway run -- pnpm prisma studio
railway run -- pnpm db:seed
```

### **Ver variables:**
```bash
railway variables
```

### **Abrir en navegador:**
```bash
railway open
```

## **URLs de la API**

- **Health Check:** `https://tu-api.railway.app/health`
- **API Base:** `https://tu-api.railway.app/api`
- **Auth:** `https://tu-api.railway.app/api/auth`
- **Tickets:** `https://tu-api.railway.app/api/tickets`

## **Monitoreo**

Railway proporciona:
- Logs en tiempo real
- Métricas de uso
- Alertas automáticas
- Escalado automático

## **Solución de Problemas**

### **Build falla:**
- Verificar Dockerfile
- Revisar dependencias en package.json
- Verificar variables de entorno

### **App no inicia:**
- Revisar logs: `railway logs`
- Verificar PORT y NODE_ENV
- Comprobar DATABASE_URL

### **CORS no funciona:**
- Verificar FRONTEND_URLS
- Comprobar que la app esté corriendo
- Revisar middleware CORS
