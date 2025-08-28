# 🗄️ Configuración de Supabase con Render

## 📋 Configuración Actual

Este proyecto usa **Supabase** como base de datos PostgreSQL, desplegado en **Render** como servicio web.

## 🔗 URLs de Conexión

### Base de Datos Principal
```
postgresql://postgres:7uffg9a9MwDFN3aU@db.ebuzyebupwpbfcgyfozl.supabase.co:5432/postgres?sslmode=require
```

### Parámetros Importantes
- **Host**: `db.ebuzyebupwpbfcgyfozl.supabase.co`
- **Puerto**: `5432`
- **Base de datos**: `postgres`
- **Usuario**: `postgres`
- **SSL**: `sslmode=require` ⚠️ **OBLIGATORIO**

## 🚨 Requisitos SSL

Supabase **requiere obligatoriamente** conexiones SSL. Sin el parámetro `?sslmode=require`, la conexión fallará con errores como:

```
Can't reach database server at db.ebuzyebupwpbfcgyfozl.supabase.co:5432
```

## ⚙️ Configuración en Render

### Variables de Entorno
```yaml
envVars:
  - key: DATABASE_URL
    value: "postgresql://postgres:7uffg9a9MwDFN3aU@db.ebuzyebupwpbfcgyfozl.supabase.co:5432/postgres?sslmode=require"
  - key: SHADOW_DATABASE_URL
    value: "postgresql://postgres:7uffg9a9MwDFN3aU@db.ebuzyebupwpbfcgyfozl.supabase.co:5432/postgres?sslmode=require"
```

### Configuración de Prisma
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🔍 Debug y Testing

### Endpoint de Health Check
```
GET https://sistema-tickets-api.onrender.com/health
```

### Endpoint de Test de Base de Datos
```
GET https://sistema-tickets-api.onrender.com/debug/db-connection
```

**Response exitoso:**
```json
{
  "success": true,
  "message": "✅ Database connection successful",
  "database": "Supabase PostgreSQL",
  "ssl": "enabled"
}
```

**Response con error:**
```json
{
  "success": false,
  "message": "❌ Database connection failed",
  "error": "Error details here",
  "database": "Supabase PostgreSQL",
  "ssl": "enabled"
}
```

## 🚨 Problemas Comunes y Soluciones

### 1. Error de Conexión SSL
**Síntoma**: `Can't reach database server`
**Solución**: Agregar `?sslmode=require` a la URL

### 2. Error de Autenticación
**Síntoma**: `authentication failed`
**Solución**: Verificar usuario y contraseña en Supabase

### 3. Error de Puerto Bloqueado
**Síntoma**: `connection refused`
**Solución**: Verificar que el puerto 5432 esté abierto en Supabase

### 4. Error de IP Bloqueada
**Síntoma**: `no pg_hba.conf entry`
**Solución**: Verificar configuración de IPs permitidas en Supabase

## 🔧 Configuración en Supabase

### 1. Database Settings
- **Connection string**: Copiar la URL completa con SSL
- **SSL mode**: `require`
- **Connection pooling**: Opcional para mejor performance

### 2. Network Access
- **IP restrictions**: Permitir conexiones desde Render
- **Region**: Verificar que coincida con Render

### 3. Security
- **Row Level Security (RLS)**: Configurar según necesidades
- **Policies**: Definir acceso a tablas

## 📊 Monitoreo

### Logs de Render
- **Build logs**: Verificar que las variables se inyecten
- **Runtime logs**: Verificar conexiones a la base de datos

### Logs de Supabase
- **Database logs**: Verificar conexiones entrantes
- **Query logs**: Monitorear performance

## 🚀 Optimizaciones

### 1. Connection Pooling
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling
  connectionLimit: 10,
  idleTimeoutMillis: 30000,
});
```

### 2. Query Optimization
- Usar índices apropiados
- Implementar paginación
- Cachear queries frecuentes

### 3. SSL Configuration
```typescript
// Para conexiones directas con pg
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  }
});
```

## 📝 Notas Importantes

- **SSL es obligatorio** para Supabase
- **Las credenciales están en el código** (no recomendado para producción)
- **Considerar usar variables de entorno** para las credenciales
- **Backup regular** de la base de datos
- **Monitoreo de uso** para evitar límites del plan gratuito

## 🔗 Enlaces Útiles

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL SSL Configuration](https://www.postgresql.org/docs/current/ssl-tcp.html)
- [Prisma Database Connection](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Render Environment Variables](https://render.com/docs/environment-variables)
