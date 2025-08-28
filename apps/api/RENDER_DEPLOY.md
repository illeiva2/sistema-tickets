# 🚀 Despliegue en Render.com

## **Configuración para Render**

### **1. Ir a Render.com**
- Visita [render.com](https://render.com)
- Login con tu cuenta GitHub
- Click en "New +"

### **2. Crear Web Service**
- Selecciona "Web Service"
- Conecta tu repositorio: `illeiva2/sistema-tickets`
- Render detectará automáticamente que es Node.js

### **3. Configuración automática**
- **Name:** `sistema-tickets-api`
- **Environment:** `Node`
- **Build Command:** `cd apps/api && npm install && npm run build`
- **Start Command:** `cd apps/api && npm start`
- **Plan:** `Free`

### **4. Variables de entorno**
Render configurará automáticamente:
- ✅ `NODE_ENV=production`
- ✅ `PORT=10000`
- ✅ `FRONTEND_URLS` (para CORS)
- ✅ `JWT_SECRET` (generado automáticamente)
- ✅ Otras variables necesarias

### **5. Base de datos PostgreSQL**
- Crear servicio "PostgreSQL"
- Render lo conectará automáticamente
- URL se configurará en `DATABASE_URL`

## **Ventajas de Render vs Railway**

### **✅ Render (RECOMENDADO):**
- Plan gratuito generoso para APIs
- PostgreSQL gratuito incluido
- Auto-deploy desde GitHub
- Configuración mínima
- Detección automática de Node.js

### **❌ Railway (Plan limitado):**
- Solo bases de datos en plan gratuito
- No puede desplegar APIs
- Requiere upgrade de plan

## **URLs esperadas**

- **API Base:** `https://sistema-tickets-api.onrender.com`
- **Health Check:** `https://sistema-tickets-api.onrender.com/health`
- **Auth:** `https://sistema-tickets-api.onrender.com/api/auth`
- **Tickets:** `https://sistema-tickets-api.onrender.com/api/tickets`

## **Verificación del despliegue**

### **1. Health Check:**
```bash
curl https://sistema-tickets-api.onrender.com/health
```

### **2. Test CORS:**
```bash
curl -i -X OPTIONS https://sistema-tickets-api.onrender.com/api/auth/login \
  -H "Origin: https://sistema-tickets-web.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

## **Comandos útiles**

### **Ver logs:**
- Render Dashboard → Tu servicio → Logs

### **Variables de entorno:**
- Render Dashboard → Tu servicio → Environment

### **Base de datos:**
- Render Dashboard → PostgreSQL → Connect

## **Solución de problemas**

### **Build falla:**
- Verificar `package.json` en `apps/api/`
- Verificar que `npm run build` funcione localmente
- Revisar logs en Render Dashboard

### **App no inicia:**
- Verificar `npm start` localmente
- Comprobar variables de entorno
- Revisar logs de inicio

### **CORS no funciona:**
- Verificar `FRONTEND_URLS` en variables
- Comprobar que la app esté corriendo
- Revisar middleware CORS
