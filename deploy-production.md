# 🚀 Guía de Despliegue en Producción

## 📋 Prerrequisitos

1. **Cuenta en Supabase** (https://supabase.com)
2. **Cuenta en Vercel** (https://vercel.com)
3. **Proyecto en GitHub** conectado
4. **CLI de Vercel** instalado

## 🗄️ 1. Configurar Supabase

### Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota el `Project Reference` y `Database Password`

### Configurar Base de Datos
```bash
# Instalar CLI de Supabase
npm install -g supabase

# Login
supabase login

# Enlazar proyecto
supabase link --project-ref [YOUR-PROJECT-REF]

# Ejecutar migraciones
cd apps/api
supabase db push
```

### Variables de Entorno en Supabase
- `DATABASE_URL`: URL de conexión PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `GOOGLE_CLIENT_ID`: ID de cliente OAuth Google
- `GOOGLE_CLIENT_SECRET`: Secreto de cliente OAuth Google

## 🌐 2. Configurar Vercel

### Instalar CLI
```bash
npm i -g vercel
```

### Desplegar API
```bash
cd apps/api
vercel --prod
```

### Desplegar Frontend
```bash
cd apps/web
vercel --prod
```

### Configurar Variables de Entorno en Vercel
```bash
# API
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

# Frontend
vercel env add VITE_API_URL
```

## 🔧 3. Configuración de Dominios

### API
- Dominio: `api.[tu-dominio].vercel.app`
- Configurar en Google OAuth Console

### Frontend
- Dominio: `[tu-dominio].vercel.app`
- Configurar CORS en API

## 📁 4. Estructura de Archivos

```
sistema-tickets/
├── apps/
│   ├── api/
│   │   ├── vercel.json          # Config Vercel API
│   │   ├── env.production.example
│   │   └── prisma/
│   │       └── schema.prisma    # Schema Supabase
│   └── web/
│       ├── vercel.json          # Config Vercel Frontend
│       └── src/
│           └── lib/
│               └── api.ts       # URL API producción
└── deploy-production.md          # Esta guía
```

## 🚀 5. Comandos de Despliegue

### Despliegue Inicial
```bash
# 1. Configurar Supabase
cd apps/api
supabase db push

# 2. Desplegar API
vercel --prod

# 3. Desplegar Frontend
cd ../web
vercel --prod
```

### Despliegues Futuros
```bash
# Los despliegues se harán automáticamente al hacer push a main
git push origin main
```

## 🔒 6. Seguridad

### Variables Sensibles
- ✅ Usar variables de entorno de Vercel
- ✅ No committear archivos `.env`
- ✅ Usar secretos de Supabase

### CORS
- ✅ Configurar dominios permitidos
- ✅ Restringir acceso a API

### Rate Limiting
- ✅ Habilitado en producción
- ✅ Configurar límites apropiados

## 📊 7. Monitoreo

### Vercel Analytics
- Métricas de rendimiento
- Errores en tiempo real
- Logs de función

### Supabase Dashboard
- Estado de base de datos
- Logs de consultas
- Métricas de rendimiento

## 🆘 8. Troubleshooting

### Problemas Comunes
1. **Error de conexión DB**: Verificar `DATABASE_URL`
2. **Error CORS**: Verificar dominios permitidos
3. **Error OAuth**: Verificar URLs de callback
4. **Error de build**: Verificar dependencias

### Logs
```bash
# Ver logs de Vercel
vercel logs

# Ver logs de Supabase
supabase logs
```

## 📞 9. Soporte

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Documentación**: [docs.vercel.com](https://docs.vercel.com)

---

## 🎯 Próximos Pasos

1. ✅ Crear proyecto en Supabase
2. ✅ Configurar variables de entorno
3. ✅ Desplegar API en Vercel
4. ✅ Desplegar Frontend en Vercel
5. ✅ Configurar dominios personalizados
6. ✅ Probar funcionalidad completa
7. ✅ Configurar monitoreo y alertas
