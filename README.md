# ConectaSV v2.2

Plataforma de conexión laboral entre candidatos y empleadores en El Salvador.

## Estructura

- `Backend/` — API REST (Node.js, Express, PostgreSQL)
- `Frontend/` — SPA Solid.js + Vite; paneles legacy en `Candidate/`, `Employee/`, `admin/`

## Requisitos

- Node.js 18+
- PostgreSQL

## Instalación rápida

### 1. Base de datos

Crea la base (ej. `conectasv`) y ejecuta:

```bash
psql -U postgres -d conectasv -f Backend/schema.sql
```

### 2. Backend

```bash
cd Backend
npm install
```

Configura `Backend/.env`:

```
DB_USER=postgres
DB_HOST=localhost
DB_PASSWORD=tu_password
DB_NAME=conectasv
DB_PORT=5432
PORT=3000
```

```bash
npm run dev
```

### 3. Frontend

**Desarrollo (hot reload en :5173, API en :3000):**

```bash
cd Frontend
npm install
npm run dev
```

Abre http://localhost:5173

**Producción integrada (todo en :3000):**

```bash
cd Frontend
npm run build
cd ../Backend
npm run dev
```

Abre http://localhost:3000

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Candidato | `carlos@conectasv.com` | `password123` |
| Empleador | `mariana@conectasv.com` | `password123` |
| Admin | `adminluis@admin.com` | `adminluis@admin.com` |

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio (Solid) |
| `/jobs` | Explorar empleos |
| `/jobs/:id` | Detalle y postulación |
| `/forum` | Foro |
| `/employer` | Panel empresa (Solid) |
| `/candidate.html` | Panel candidato (legacy) |
| `/employee.html` | Panel empleador completo (legacy) |
| `/admin/admin.html` | Administración |

## API

- `POST /api/login` — Autenticación
- `GET /api/jobs` — Listado de empleos
- `POST /api/jobs` — Publicar vacante (`employer_id`, `company_name`, `contact_email`, …)
- `POST /api/applications` — Postular (`job_id`, `candidate_id`)

Ver `Backend/README.md` para más endpoints.

## Licencia

ISC
