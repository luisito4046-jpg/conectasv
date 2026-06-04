# ConectaSV — Frontend (Solid.js)

Frontend principal en **Solid.js + Vite**. Los paneles avanzados de candidato y empleador siguen en HTML legacy servidos por Express.

## Desarrollo

```bash
# Terminal 1 — Backend
cd ../Backend
npm run dev

# Terminal 2 — Frontend
npm run dev
```

Abre http://localhost:5173 (proxy de `/api` y rutas legacy hacia `:3000`).

## Producción

```bash
npm run build
cd ../Backend
npm run dev
```

Abre http://localhost:3000 — Express sirve `dist/`.

## Rutas SPA

| Ruta | Vista |
|------|-------|
| `/` | Inicio |
| `/jobs` | Explorar empleos |
| `/jobs/:id` | Detalle de empleo |
| `/forum` | Foro |
| `/employer` | Publicar y gestionar vacantes |

## Legacy (mismo servidor :3000)

| Ruta | Vista |
|------|-------|
| `/candidate.html` | Panel candidato |
| `/employee.html` | Panel empleador |
| `/admin/admin.html` | Admin |
| `/recursos/recursos.html` | Recursos |

## Estructura

```
src/
  components/   Navbar, modales, JobCard…
  pages/        Home, Jobs, Forum, Employer…
  stores/       auth, ui
  lib/          api, utils
```

Backup del frontend vanilla: `index.legacy.html`.
