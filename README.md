# ConectaSV v2.2

Plataforma de conexión laboral entre candidatos y empleadores.

## Estructura del Proyecto

- `Backend/` - API REST con Node.js y Express
- `Frontend/` - Interfaz web con HTML/CSS/JS

## Instalación y Configuración

### Backend
Ver [Backend/README.md](Backend/README.md)

### Frontend
Ver [Frontend/README.md](Frontend/README.md)

## Descripción

ConectaSV es una aplicación web que facilita la conexión entre candidatos en búsqueda de empleo y empleadores que ofrecen oportunidades laborales.

### Características
- Registro y autenticación de usuarios
- Gestión de perfiles de candidatos y empleadores
- Publicación y búsqueda de empleos
- Sistema de postulaciones
- Panel de administración

## Tecnologías
- **Backend**: Node.js, Express, PostgreSQL, bcrypt
- **Frontend**: HTML5, CSS3, JavaScript

## Contribución

1. Clona el repositorio
2. Instala dependencias de backend
3. Configura base de datos
4. Inicia backend y frontend
5. Realiza cambios y envía PR
=======
# ConectaSV Backend

Backend API para la aplicación ConectaSV, una plataforma de conexión entre candidatos y empleadores.

## Tecnologías

- **Node.js** con **Express.js**
- **PostgreSQL** como base de datos
- **bcrypt** para hashing de contraseñas
- **CORS** para manejo de cross-origin requests

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno en un archivo `.env`:
   ```
   PORT=3000
   DATABASE_URL=postgresql://usuario:password@localhost:5432/conectasv
   JWT_SECRET=tu_secreto_jwt
   ```

4. Ejecuta el script de base de datos `schema.sql` en PostgreSQL para crear las tablas.

5. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

- `src/`
  - `index.js` - Punto de entrada de la aplicación
  - `db.js` - Configuración de la base de datos
  - `routes/` - Definición de rutas API
    - `users.js` - Rutas de usuarios
    - `companies.js` - Rutas de empresas
    - `jobs.js` - Rutas de empleos
    - `applications.js` - Rutas de postulaciones
    - `login.js` - Ruta de autenticación
  - `services/` - Lógica de negocio (controladores)
    - `usersServices.js`
    - `companiesServices.js`
    - `jobsServices.js`
    - `applicationsServices.js`
    - `loginService.js`

## API Endpoints

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/buscarPorEmail/:email` - Buscar usuario por email
- `GET /api/users/buscarPorNombre/:nombre` - Buscar usuarios por nombre
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Empresas
- `GET /api/companies` - Obtener todas las empresas
- `GET /api/companies/buscarPorDuenio/:owner_id` - Empresas por dueño
- `GET /api/companies/buscarPorNombre/:nombre` - Buscar empresas por nombre
- `POST /api/companies` - Crear nueva empresa
- `PUT /api/companies/:id` - Actualizar empresa
- `DELETE /api/companies/:id` - Eliminar empresa

### Empleos
- `GET /api/jobs` - Obtener todos los empleos
- `GET /api/jobs/:id` - Obtener empleo por ID
- `GET /api/jobs/employer/:employerId` - Empleos por empleador
- `POST /api/jobs` - Crear nuevo empleo
- `PUT /api/jobs/:id` - Actualizar empleo
- `DELETE /api/jobs/:id` - Eliminar empleo

### Postulaciones
- `GET /api/applications/job/:jobId` - Postulaciones por empleo
- `GET /api/applications/candidate/:candidateId` - Postulaciones por candidato
- `POST /api/applications` - Crear postulación
- `PUT /api/applications/:id` - Actualizar estado de postulación
- `DELETE /api/applications/:id` - Eliminar postulación

### Autenticación
- `POST /api/login` - Iniciar sesión

## Base de Datos

El esquema de la base de datos se encuentra en `schema.sql`. Incluye las tablas:
- `users`
- `companies`
- `jobs`
- `applications`

## Desarrollo

Para desarrollo, usa:
```bash
npm run dev
```

Esto iniciará el servidor con nodemon para recarga automática.

## Contribución

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Envía un pull request

## Licencia

ISC