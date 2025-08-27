# 🚀 Configuración de Producción - Sistema de Tickets

## ✅ Archivos Configurados

### 1. **Configuración de Vercel**
- `apps/api/vercel.json` - Configuración para API
- `apps/web/vercel.json` - Configuración para Frontend

### 2. **Variables de Entorno**
- `apps/api/env.production.example` - Ejemplo de variables para producción

### 3. **Scripts de Despliegue**
- `scripts/deploy.sh` - Script bash para Linux/Mac
- `scripts/deploy.ps1` - Script PowerShell para Windows

### 4. **GitHub Actions**
- `.github/workflows/deploy.yml` - Automatización de CI/CD

### 5. **Configuración de Producción**
- `apps/api/src/config/production.ts` - Config específica para producción

## 🗄️ Supabase (Base de Datos)

### Pasos para Configurar:
1. **Crear cuenta** en [supabase.com](https://supabase.com)
2. **Crear proyecto** nuevo
3. **Anotar credenciales**:
   - Project Reference
   - Database Password
   - Database URL

### Variables Necesarias:
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## 🌐 Vercel (Hosting)

### Pasos para Configurar:
1. **Crear cuenta** en [vercel.com](https://vercel.com)
2. **Instalar CLI**:
   ```bash
   npm i -g vercel
   ```
3. **Login**:
   ```bash
   vercel login
   ```

### Variables Necesarias:
```bash
# API
JWT_SECRET="[SUPER-SECRET-KEY]"
GOOGLE_CLIENT_ID="[GOOGLE-OAUTH-ID]"
GOOGLE_CLIENT_SECRET="[GOOGLE-OAUTH-SECRET]"
GOOGLE_CALLBACK_URL="https://api.[DOMAIN].vercel.app/auth/google/callback"

# Frontend
VITE_API_URL="https://api.[DOMAIN].vercel.app"
```

## 🚀 Comandos de Despliegue

### Usando Scripts:
```bash
# Windows PowerShell
.\scripts\deploy.ps1 both

# Linux/Mac
./scripts/deploy.sh both
```

### Manualmente:
```bash
# API
cd apps/api
npm run build
vercel --prod

# Frontend
cd apps/web
npm run build
vercel --prod
```

## 🔧 Configuración de OAuth Google

### URLs de Callback:
- **Desarrollo**: `http://localhost:3000/auth/google/callback`
- **Staging**: `https://staging.[DOMAIN].vercel.app/auth/google/callback`
- **Producción**: `https://api.[DOMAIN].vercel.app/auth/google/callback`

### Configurar en Google Console:
1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Seleccionar proyecto
3. APIs & Services > Credentials
4. Editar OAuth 2.0 Client ID
5. Agregar URLs de callback

## 📊 Monitoreo y Analytics

### Vercel:
- Métricas de rendimiento
- Logs de función
- Analytics de visitas
- Errores en tiempo real

### Supabase:
- Estado de base de datos
- Logs de consultas
- Métricas de rendimiento
- Alertas de uso

## 🔒 Seguridad

### Implementado:
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet security headers
- ✅ JWT tokens seguros
- ✅ Variables de entorno

### Recomendado:
- 🔐 HTTPS obligatorio
- 🔐 Dominios permitidos restringidos
- 🔐 Monitoreo de logs
- 🔐 Backup automático de DB

## 📱 Dominios

### Estructura Recomendada:
- **API**: `api.tudominio.com` o `api.tudominio.vercel.app`
- **Frontend**: `tudominio.com` o `tudominio.vercel.app`

### Configuración DNS:
1. Agregar dominio en Vercel
2. Configurar registros DNS
3. Esperar propagación (24-48 horas)

## 🆘 Troubleshooting

### Problemas Comunes:

#### 1. **Error de CORS**
```bash
# Verificar dominios en ALLOWED_ORIGINS
# Verificar configuración en Google OAuth
```

#### 2. **Error de Base de Datos**
```bash
# Verificar DATABASE_URL
# Verificar conexión a Supabase
# Verificar migraciones ejecutadas
```

#### 3. **Error de Build**
```bash
# Verificar dependencias
# Verificar TypeScript
# Verificar Node.js version
```

#### 4. **Error de OAuth**
```bash
# Verificar URLs de callback
# Verificar credenciales de Google
# Verificar configuración en Google Console
```

## 📋 Checklist de Despliegue

### Antes del Despliegue:
- [ ] Cuenta en Supabase creada
- [ ] Cuenta en Vercel creada
- [ ] Proyecto en GitHub conectado
- [ ] Variables de entorno configuradas
- [ ] OAuth Google configurado
- [ ] Dominios configurados

### Durante el Despliegue:
- [ ] API desplegada exitosamente
- [ ] Frontend desplegado exitosamente
- [ ] Base de datos migrada
- [ ] Variables de entorno aplicadas
- [ ] URLs de callback actualizadas

### Después del Despliegue:
- [ ] Funcionalidad probada
- [ ] OAuth funcionando
- [ ] Archivos subiéndose
- [ ] Emails enviándose
- [ ] Monitoreo configurado

## 🎯 Próximos Pasos

1. **Crear proyecto en Supabase** ✅
2. **Configurar variables de entorno** ✅
3. **Desplegar API en Vercel** 🔄
4. **Desplegar Frontend en Vercel** 🔄
5. **Configurar dominios personalizados** ⏳
6. **Probar funcionalidad completa** ⏳
7. **Configurar monitoreo y alertas** ⏳

## 📞 Soporte

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Google OAuth**: [developers.google.com](https://developers.google.com)

---

## 🚀 ¡Listo para Desplegar!

Tu proyecto está completamente configurado para producción. Solo necesitas:

1. **Crear las cuentas** en Supabase y Vercel
2. **Configurar las variables** de entorno
3. **Ejecutar el script** de despliegue

¡El sistema estará funcionando en producción en minutos! 🎉
