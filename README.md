# Empresa Tickets - Sistema de Gestión de Tickets

Un sistema completo de gestión de tickets (Help Desk) construido con un monorepo Turborepo, incluyendo backend API, frontend web y componentes compartidos.

## 🏗️ Arquitectura

```
empresa-tickets/
├── apps/
│   ├── api/          # Backend API (Node.js + Express + TypeScript)
│   └── web/          # Frontend (React + Vite + TypeScript)
├── packages/
│   ├── config/       # Configuraciones compartidas (ESLint, TypeScript, Prettier)
│   ├── types/        # Tipos TypeScript compartidos
│   └── ui/           # Componentes UI compartidos
├── infra/
│   ├── docker/       # Dockerfiles y docker-compose
│   └── prisma/       # Esquema de base de datos
└── .github/workflows/ # CI/CD
```

## 🚀 Tecnologías

### Backend (API)

- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** con **PostgreSQL**
- **JWT** para autenticación
- **Zod** para validación
- **Pino** para logging
- **Helmet** + **CORS** para seguridad

### Frontend (Web)

- **React 18** + **TypeScript**
- **Vite** como bundler
- **Tailwind CSS** + **shadcn/ui**
- **React Query** para estado remoto
- **React Router** para navegación
- **Recharts** para gráficos

### Infraestructura

- **Docker** + **Docker Compose**
- **PostgreSQL 16**
- **Turborepo** para monorepo
- **pnpm** como package manager

## 📋 Requisitos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** >= 20.0.0 (opcional, para desarrollo con Docker)
- **PostgreSQL** >= 16.0.0 (si no usas Docker)

## 🛠️ Instalación y Desarrollo

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd empresa-tickets
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

#### API (.env en apps/api/)

```bash
cp apps/api/env.example apps/api/.env
```

Editar `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tickets"
JWT_SECRET="tu-secreto-super-seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
LOG_LEVEL="info"
```

#### Web (.env en apps/web/)

```bash
cp apps/web/env.example apps/web/.env
```

Editar `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Configurar base de datos

#### Opción A: Con Docker (Recomendado)

```bash
# Iniciar solo la base de datos
cd infra/docker
docker-compose up db -d

# O iniciar todo el stack
docker-compose up -d
```

#### Opción B: PostgreSQL local

```bash
# Crear base de datos
createdb tickets

# Ejecutar migraciones
pnpm db:migrate
```

### 5. Generar cliente Prisma

```bash
pnpm db:generate
```

### 6. Ejecutar migraciones

```bash
pnpm db:migrate
```

### 7. Poblar base de datos con datos de prueba

```bash
pnpm seed
```

### 8. Iniciar desarrollo

```bash
# Iniciar todo el monorepo
pnpm dev

# O iniciar servicios individuales
pnpm --filter @forzani/api dev
pnpm --filter @forzani/web dev
```

## 🌐 Acceso a la aplicación

### Desarrollo local (sin Docker)

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Con Docker

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 👤 Credenciales de prueba

Después de ejecutar `pnpm seed`, puedes usar estas credenciales:

### Administradores

- **admin@empresa.com** / password123

### Agentes

- **agent1@empresa.com** / password123
- **agent2@empresa.com** / password123

### Usuarios

- **user1@empresa.com** / password123
- **user2@empresa.com** / password123
- **user3@empresa.com** / password123
- **user4@empresa.com** / password123
- **user5@empresa.com** / password123

## 📚 Scripts disponibles

### Scripts del monorepo

```bash
pnpm dev          # Iniciar desarrollo (paralelo)
pnpm build        # Construir todas las apps
pnpm lint         # Lintear todo el código
pnpm test         # Ejecutar tests
pnpm seed         # Poblar base de datos
pnpm db:migrate   # Ejecutar migraciones
pnpm db:generate  # Generar cliente Prisma
pnpm clean        # Limpiar builds
```

### Scripts individuales

```bash
# API
pnpm --filter @forzani/api dev
pnpm --filter @forzani/api build
pnpm --filter @forzani/api test

# Web
pnpm --filter @forzani/web dev
pnpm --filter @forzani/web build
pnpm --filter @forzani/web test
```

## 🐳 Desarrollo con Docker

### Iniciar todo el stack

```bash
cd infra/docker
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f
```

### Detener servicios

```bash
docker-compose down
```

### Reconstruir imágenes

```bash
docker-compose up -d --build
```

### Puertos de acceso:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Base de datos**: localhost:5432

### Solución de problemas Docker

Si encuentras errores como `invalid file request node_modules/@forzani/config`:

1. **Ejecutar script de prueba**:

```bash
cd infra/docker
chmod +x test-build.sh
./test-build.sh
```

2. **Limpiar contenedores y volúmenes**:

```bash
docker-compose down -v
docker system prune -f
```

3. **Reconstruir desde cero**:

```bash
docker-compose up -d --build --force-recreate
```

4. **Verificar el contexto de build**:
   Los Dockerfiles están configurados para usar el contexto raíz del monorepo, no el de cada aplicación individual.

5. **Si el problema persiste**:

```bash
# Verificar que estás en el directorio correcto
pwd  # Debe mostrar la ruta al directorio raíz del proyecto

# Verificar que los archivos existen
ls -la package.json pnpm-workspace.yaml
ls -la apps/api/package.json apps/web/package.json
ls -la packages/
```

## 🔧 API Endpoints

### Autenticación

```bash
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
```

### Tickets

```bash
GET    /api/tickets
GET    /api/tickets/:id
POST   /api/tickets
PATCH  /api/tickets/:id
DELETE /api/tickets/:id
```

**Nota**: Los endpoints están disponibles en `http://localhost:3001/api/` cuando se ejecuta con Docker.

### Ejemplos de uso con curl

#### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@forzani.com",
    "password": "password123"
  }'
```

#### Obtener tickets

```bash
curl -X GET http://localhost:3001/api/tickets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Crear ticket

```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuevo problema",
    "description": "Descripción del problema",
    "priority": "MEDIUM"
  }'
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests en modo watch
pnpm test:watch

# Tests de la API
pnpm --filter @forzani/api test

# Tests del frontend
pnpm --filter @forzani/web test
```

## 📦 Build para producción

```bash
# Construir todo
pnpm build

# Construir individualmente
pnpm --filter @forzani/api build
pnpm --filter @forzani/web build
```

## 🚀 Despliegue

### Con Docker

```bash
# Construir imágenes de producción
docker build -f infra/docker/Dockerfile.api -t empresa-api .
docker build -f infra/docker/Dockerfile.web -t empresa-web .

# Ejecutar en producción
docker-compose -f infra/docker/docker-compose.prod.yml up -d
```

### Variables de entorno de producción

```env
# API
DATABASE_URL="postgresql://user:pass@host:5432/tickets"
JWT_SECRET="secreto-super-seguro-de-produccion"
NODE_ENV="production"

# Web
VITE_API_URL="https://api.tudominio.com"
```

## 🔒 Seguridad

- **JWT** con refresh tokens
- **Helmet** para headers de seguridad
- **CORS** configurado
- **Rate limiting** implementado
- **Validación** con Zod
- **Logging** estructurado
- **Audit logs** para auditoría

## 📊 Roles y Permisos

### USER

- Crear tickets
- Ver/editar sus propios tickets
- Comentar en sus tickets
- Subir adjuntos a sus tickets

### AGENT

- Todo lo de USER
- Ver todos los tickets
- Autoasignarse/asignar tickets
- Cambiar estados de tickets
- Comentar en cualquier ticket

### ADMIN

- Todo lo de AGENT
- Gestionar usuarios
- Eliminar tickets
- Acceso completo al sistema

## 🎨 Temas y Personalización

El sistema incluye:

- **Tema claro/oscuro**
- **Diseño responsive**
- **Accesibilidad WCAG AA**
- **Componentes reutilizables**

## 📈 Métricas y Analytics

- Tickets por estado
- Tickets por prioridad
- Tiempo promedio de resolución
- Tickets por agente
- Gráficos de tendencias

## 🔄 Flujo de trabajo de tickets

1. **OPEN** → **IN_PROGRESS** (por AGENT/ADMIN)
2. **IN_PROGRESS** → **RESOLVED** (por AGENT/ADMIN)
3. **RESOLVED** → **CLOSED** (por AGENT/ADMIN)
4. **CLOSED** → **OPEN** (reabrir, solo AGENT/ADMIN)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🔮 Roadmap

- [ ] Notificaciones por email
- [ ] Dashboard avanzado
- [ ] API REST completa
- [ ] Mobile app
- [ ] Integración con Slack/Teams
- [ ] Reportes avanzados
- [ ] Workflow personalizable
- [ ] Multi-tenant
- [ ] API GraphQL

---

**Empresa Tickets** - Sistema de gestión de tickets moderno y escalable 🎫
