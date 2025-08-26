# 🔐 Configuración de OAuth con Google

Este documento explica cómo configurar la autenticación OAuth con Google para el sistema de tickets.

## 📋 **Prerrequisitos**

- Cuenta de Google (personal o Google Workspace)
- Acceso a Google Cloud Console
- Base de datos PostgreSQL configurada
- Servidor Node.js funcionando

## 🚀 **PASO 1: Configurar Google Cloud Console**

### **1.1 Crear Proyecto**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ (si no está habilitada)

### **1.2 Configurar OAuth 2.0**

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth 2.0 Client IDs**
3. Selecciona **Web application**
4. Configura las URIs de redirección:
   - **Authorized redirect URIs**: `http://localhost:3001/api/auth/google/callback`
   - **Authorized JavaScript origins**: `http://localhost:5173`

### **1.3 Obtener Credenciales**

1. Copia el **Client ID** y **Client Secret**
2. Guárdalos de forma segura

## ⚙️ **PASO 2: Configurar Variables de Entorno**

### **2.1 Crear Archivo .env**

Copia `env.oauth.example` a `.env` en la carpeta `apps/api/`:

```bash
cp apps/api/env.oauth.example apps/api/.env
```

### **2.2 Configurar Variables**

Edita el archivo `.env` con tus credenciales:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=tu_session_secret_super_seguro

# Frontend URL for OAuth redirect
FRONTEND_URL=http://localhost:5173/oauth/callback

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tickets"

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

## 🗄️ **PASO 3: Configurar Base de Datos**

### **3.1 Ejecutar Migración**

La migración para el campo `googleId` se ejecuta automáticamente:

```bash
cd apps/api
npx prisma db push
```

### **3.2 Verificar Schema**

Confirma que el campo `googleId` esté en el modelo `User`:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         UserRole @default(USER)
  googleId     String?  @unique  // ← Este campo debe estar presente
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  // ... resto del modelo
}
```

## 🔧 **PASO 4: Configurar Frontend**

### **4.1 Verificar Rutas**

El frontend ya incluye:

- Botón "Continuar con Google" en la página de login
- Página de callback OAuth en `/oauth/callback`
- Integración con el hook de autenticación

### **4.2 Configurar URLs**

Asegúrate de que las URLs en el frontend coincidan con tu configuración:

- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:5173`

## 🧪 **PASO 5: Probar OAuth**

### **5.1 Iniciar Servicios**

```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

### **5.2 Probar Flujo**

1. Ve a `http://localhost:5173/login`
2. Haz clic en "Continuar con Google"
3. Completa la autenticación con Google
4. Deberías ser redirigido de vuelta al dashboard

## 🔒 **PASO 6: Configuración de Producción**

### **6.1 URLs de Producción**

Actualiza las URLs en `.env`:

```env
GOOGLE_CALLBACK_URL=https://tu-dominio.com/api/auth/google/callback
FRONTEND_URL=https://tu-dominio.com/oauth/callback
```

### **6.2 Seguridad**

- Usa `JWT_SECRET` fuertes y únicos
- Habilita HTTPS en producción
- Configura CORS apropiadamente
- Usa variables de entorno seguras

### **6.3 Google Cloud Console**

1. Actualiza las URIs de redirección en Google Cloud Console
2. Agrega tu dominio de producción
3. Configura restricciones de dominio si es necesario

## 🚨 **Solución de Problemas**

### **Error: "Invalid redirect_uri"**

- Verifica que la URI de redirección en Google Cloud Console coincida exactamente
- Asegúrate de que no haya espacios o caracteres extra

### **Error: "Client ID not found"**

- Verifica que `GOOGLE_CLIENT_ID` esté correctamente configurado
- Confirma que el proyecto esté habilitado en Google Cloud Console

### **Error: "Database connection failed"**

- Verifica la conexión a PostgreSQL
- Confirma que el schema esté actualizado

### **Error: "JWT verification failed"**

- Verifica que `JWT_SECRET` esté configurado
- Confirma que los tokens no hayan expirado

## 📚 **Recursos Adicionales**

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Documentation](http://www.passportjs.org/)
- [JWT.io](https://jwt.io/) - Para debuggear tokens JWT

## 🔄 **Mantenimiento**

### **Renovar Credenciales**

- Los tokens de acceso expiran automáticamente
- Los refresh tokens se renuevan automáticamente
- Las credenciales de Google no expiran (pero puedes rotarlas)

### **Monitoreo**

- Revisa los logs del servidor para errores de OAuth
- Monitorea el uso de la API de Google
- Verifica la validez de los tokens JWT

---

## ✅ **Verificación Final**

Para confirmar que OAuth está funcionando:

1. ✅ **Backend**: Las rutas `/api/auth/google/*` responden
2. ✅ **Base de datos**: Campo `googleId` está presente
3. ✅ **Frontend**: Botón de Google aparece en login
4. ✅ **Flujo completo**: Login → Google → Callback → Dashboard
5. ✅ **Tokens**: JWT se generan y validan correctamente

¡OAuth con Google está configurado y funcionando! 🎉
