# Despliegue en Vercel

Este documento describe cómo desplegar la aplicación web del sistema de tickets en Vercel.

## Configuración

La aplicación web está configurada para funcionar como una aplicación independiente en Vercel, sin dependencias de workspace del monorepo.

### Archivos de configuración

- `vercel.json`: Configuración principal de Vercel
- `apps/web/package-vercel-simple.json`: Dependencias simplificadas para Vercel
- `apps/web/tsconfig.vercel.json`: Configuración de TypeScript para Vercel
- `apps/web/vite.config.ts`: Configuración de Vite

### Estructura de archivos

Los componentes UI y tipos se han copiado localmente a:
- `apps/web/src/components/ui/`: Componentes UI reutilizables
- `apps/web/src/types/`: Tipos TypeScript

## Proceso de build

1. Vercel ejecuta desde el directorio raíz del monorepo
2. El `buildCommand` cambia al directorio `apps/web`
3. Copia `package-vercel-simple.json` a `package.json`
4. Instala las dependencias con `pnpm install`
5. Ejecuta el build con `pnpm run build`
6. El output se genera en `apps/web/dist/`

## Variables de entorno

Asegúrate de configurar las siguientes variables de entorno en Vercel:

- `VITE_API_URL`: URL de la API backend
- `VITE_SUPABASE_URL`: URL de Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

## Solución de problemas

### Error de pnpm-lock.yaml

Si encuentras errores relacionados con `pnpm-lock.yaml`, asegúrate de que:
- El `package-vercel-simple.json` no tenga referencias de workspace
- Todas las dependencias estén listadas explícitamente

### Errores de TypeScript

Si hay errores de TypeScript:
- Verifica que `tsconfig.vercel.json` apunte a los directorios correctos
- Asegúrate de que los componentes UI estén disponibles en `src/components/ui/`

### Errores de build

Si el build falla:
- Revisa que todas las dependencias estén instaladas
- Verifica que los archivos de configuración estén correctos
- Comprueba que no haya referencias a paquetes de workspace

### Error de validación de vercel.json

Si Vercel muestra errores de validación:
- Asegúrate de que solo uses propiedades válidas
- No uses `rootDirectory` (no es una propiedad válida)
- Verifica que la sintaxis JSON sea correcta

## Desarrollo local

Para probar la configuración localmente:

```bash
# Desde el directorio raíz
cd apps/web
cp package-vercel-simple.json package.json
pnpm install
pnpm run build

# O desde el directorio raíz (simulando Vercel)
cd apps/web && cp package-vercel-simple.json package.json && pnpm install && pnpm run build
```

## Notas importantes

- La aplicación web se despliega independientemente de la API
- Los componentes UI se han copiado localmente para evitar dependencias de workspace
- El build se optimiza para producción con Vite
- Se incluyen sourcemaps para debugging
- Vercel ejecuta desde el directorio raíz, no desde `apps/web`