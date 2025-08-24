# 📧 Configuración del Sistema de Notificaciones

## 🚀 Funcionalidades Implementadas

El sistema de notificaciones por email está completamente implementado y funcionando. Incluye:

### ✅ **Notificaciones Automáticas:**

1. **Ticket Asignado** - Cuando se asigna un ticket a un agente
2. **Estado Cambiado** - Cuando cambia el estado de un ticket
3. **Nuevo Comentario** - Cuando se agrega un comentario a un ticket

### ✅ **Características Técnicas:**

- Emails HTML con diseño profesional
- Versión de texto plano para compatibilidad
- Envío asíncrono (no bloquea la respuesta)
- Manejo de errores y logging
- Templates personalizables

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en `apps/api/` con las siguientes variables:

```bash
# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-contraseña-de-aplicacion"
EMAIL_FROM="noreply@sistema-tickets.com"
```

### 2. Configuración para Gmail

Para usar Gmail como servidor SMTP:

1. **Habilita la verificación en dos pasos** en tu cuenta de Google
2. **Genera una "Contraseña de aplicación":**
   - Ve a [Seguridad de Google](https://myaccount.google.com/security)
   - Verificación en dos pasos > Contraseñas de aplicación
   - Selecciona "Correo" y genera una nueva contraseña
3. **Usa esa contraseña** en `EMAIL_PASSWORD`

### 3. Otros Proveedores

#### Outlook/Hotmail:

```bash
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Yahoo:

```bash
EMAIL_HOST="smtp.mail.yahoo.com"
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### SendGrid:

```bash
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT=587
EMAIL_SECURE=false
```

## 🧪 Pruebas

### 1. Probar Conexión

- Ve a `/notifications` en el frontend
- Haz clic en "Probar Conexión"
- Verifica que la conexión sea exitosa

### 2. Enviar Email de Prueba

- Usa el formulario "Enviar Email de Prueba"
- Ingresa tu email y envía un mensaje de prueba
- Verifica que llegue correctamente

### 3. Probar Notificaciones Automáticas

- Crea un ticket y asígnalo a un agente
- Cambia el estado de un ticket
- Agrega un comentario a un ticket
- Verifica que se envíen los emails automáticamente

## 📁 Archivos Implementados

### Backend:

- `src/config/email.ts` - Configuración de Nodemailer
- `src/services/notifications.service.ts` - Lógica de notificaciones
- `src/controllers/notifications.controller.ts` - Endpoints de prueba
- `src/services/tickets.service.ts` - Integración con tickets
- `src/services/comments.service.ts` - Integración con comentarios

### Frontend:

- `src/hooks/useNotifications.ts` - Hook para notificaciones
- `src/pages/NotificationsPage.tsx` - Página de configuración
- `src/components/Layout.tsx` - Navegación actualizada
- `src/App.tsx` - Rutas actualizadas

## 🔧 Endpoints API

### Notificaciones:

- `GET /api/notifications/test-connection` - Probar conexión SMTP
- `POST /api/notifications/test-email` - Enviar email de prueba

### Integración Automática:

- Las notificaciones se envían automáticamente desde:
  - `PATCH /api/tickets/:id` - Cambios en tickets
  - `POST /api/tickets/:ticketId/comments` - Nuevos comentarios

## 🎨 Templates de Email

Los emails incluyen:

- **Diseño responsive** con HTML y CSS inline
- **Colores temáticos** para cada tipo de notificación
- **Información completa** del ticket
- **Botón de acción** para ver el ticket
- **Versión de texto** para compatibilidad

## 🚨 Solución de Problemas

### Error de Conexión:

- Verifica que las variables de entorno estén correctas
- Asegúrate de que la contraseña de aplicación sea válida
- Verifica que el puerto no esté bloqueado por firewall

### Emails No Llegan:

- Revisa la carpeta de spam
- Verifica los logs del backend
- Confirma que `EMAIL_FROM` sea una dirección válida

### Errores de Autenticación:

- Para Gmail: Usa contraseña de aplicación, no tu contraseña normal
- Verifica que la verificación en dos pasos esté habilitada

## 📊 Monitoreo

El sistema incluye:

- **Logging detallado** de envíos exitosos y fallidos
- **Métricas** de notificaciones enviadas
- **Manejo de errores** sin afectar la funcionalidad principal

## 🔮 Próximos Pasos

Funcionalidades que se pueden agregar:

- **Plantillas personalizables** por empresa
- **Configuración por usuario** (preferencias de notificación)
- **Notificaciones push** en el navegador
- **Webhooks** para integración con otros sistemas
- **Cola de emails** para mejor rendimiento
- **Reportes** de notificaciones enviadas

---

¡El sistema de notificaciones está listo para usar! 🎉
