# ConectaSV v2.2

ConectaSV es una plataforma de conexión laboral diseñada para facilitar el encuentro entre candidatos y empleadores.

## Estructura del Proyecto

- `Backend/` - API REST construida con Node.js, Express y PostgreSQL.
- `Frontend/` - Interfaz de usuario en HTML5, CSS3 y JavaScript.
- `Frontend/admin/` - Panel administrativo para gestión de la plataforma.
- `Frontend/Candidate/` - Panel privado de candidatos.
- `Frontend/Employee/` - Panel de empleadores.

## Funcionalidades Principales

### Autenticación y usuarios
- Registro y login de usuarios.
- Roles de usuario: `candidate`, `employer`, `admin`.
- Gestión de perfiles de candidatos y empleadores.
- Sesiones de usuario almacenadas en `sessionStorage` en el frontend.

### Empleos y búsqueda
- CRUD completo de empleos desde el backend.
- Búsqueda avanzada por título, empresa, ubicación, tipo, salario, experiencia y área.
- Filtros de tipo de empleo, experiencia, ubicación y área en la interfaz de candidato.
- Listado de empleos destacados en la página principal.
- Detalle de empleo con información adicional y botón de postulación.

### Candidatos
- Visualización de empleos disponibles en el panel de candidato.
- Filtrado dinámico de ofertas laborales.
- Postulación a empleos desde la interfaz de candidato.
- Guardado de empleos favoritos.
- Visualización de historial de postulaciones.
- Gestión de alertas de búsqueda de empleo.

### Empleadores
- Publicación y edición de empleos.
- Gestión de las empresas propias.
- Visualización de postulaciones recibidas para sus empleos.
- Panel de empleador con métricas y accesos directos.

### Administración
- Panel de administración para gestionar:
  - Usuarios
  - Empresas
  - Empleos
  - Postulaciones
  - Alertas y contenido relacionado
- CRUD completo para recursos principales desde el admin.
- Control de estados de empleo y verificación de empresas.

### Otras características
- Guardado de empleos por usuario.
- Sistema de postulaciones con estados y validación de duplicados.
- API REST organizada y modular.
- Mejora de UX con toasts, modales y navegaciones internas.

## Tecnologías
- **Backend**: Node.js, Express, PostgreSQL, bcrypt, cors.
- **Frontend**: HTML5, CSS3, JavaScript puro.
- **Base de datos**: PostgreSQL.

## Instalación y configuración

### Backend
1. Ingresa a `Backend/`.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura tu conexión PostgreSQL en `Backend/src/config/db.js`.
4. Crea la base de datos y ejecuta el script `Backend/schema.sql`.
5. Inicia la API:
   ```bash
   npm run dev
   ```

### Frontend
1. Abre `Frontend/index.html` en el navegador para la página pública.
2. Usa `Frontend/admin/admin.html` para el panel administrativo.
3. Usa `Frontend/Candidate/candidate.HTML` para el panel de candidato.
4. Usa `Frontend/Employee/employee.html` para el panel de empleador.

## Endpoints principales

- `GET /api/jobs` - Lista todos los empleos.
- `GET /api/jobs/:id` - Obtiene detalle de un empleo.
- `POST /api/applications` - Crea una postulación.
- `GET /api/applications/candidate/:candidateId` - Lista postulaciones de un candidato.
- `GET /api/saved-jobs/:userId` - Lista empleos guardados.
- `POST /api/saved-jobs` - Guarda un empleo.
- `DELETE /api/saved-jobs/:userId/:jobId` - Elimina un empleo guardado.
- `POST /api/users` - Crea usuarios.
- `GET /api/users` - Lista usuarios.
- `POST /api/alerts` - Crea alertas de búsqueda.

## Usuario administrador de ejemplo
- Email: `admin@conectasv.com`
- Contraseña: la que hayas configurado en la base de datos.

## Contribuciones

1. Clona el repositorio.
2. Instala dependencias en `Backend/`.
3. Configura la base de datos PostgreSQL.
4. Inicia el backend.
5. Abre los archivos HTML en el navegador y prueba las rutas.

## Licencia

ISC
