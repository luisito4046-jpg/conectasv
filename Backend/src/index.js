import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// TODAS las importaciones juntas al inicio del archivo
import usersRouter from './routes/users.routes.js';
import uploadRouter from './routes/upload.routes.js';  // rutas de archivos separadas
import companiesRouter from './routes/companies.routes.js';
import loginRouter from './routes/login.routes.js';
import jobsRouter from './routes/jobs.routes.js';
import applicationsRouter from './routes/applications.routes.js';
import savedJobsRouter from './routes/savedJobs.routes.js';
import alertsRouter from './routes/alerts.routes.js';
import forumRouter from './routes/forum.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// 2. RUTAS DE LA API (antes de los estáticos)
app.use('/api/users', usersRouter);
app.use('/api/users', uploadRouter);   // PATCH /:id/avatar — subida de foto de perfil
app.use('/api/companies', companiesRouter);
app.use('/api/login', loginRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/saved-jobs', savedJobsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/forum', forumRouter);


// 3. ARCHIVOS ESTÁTICOS
const rootPath = path.resolve(__dirname, '..', '..');
const frontendPath = path.join(rootPath, 'Frontend');

app.use('/js',  express.static(path.join(frontendPath, 'js')));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/admin', express.static(path.join(frontendPath, 'admin')));
app.use('/Employee', express.static(path.join(frontendPath, 'Employee')));
app.use('/Candidate', express.static(path.join(frontendPath, 'Candidate')));
app.use(express.static(frontendPath));

// 4. RUTAS PRINCIPALES
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/candidate.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'Candidate', 'candidate.html'));
});

app.get('/employee.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'Employee', 'employee.html'));
});

// 5. MIDDLEWARE 404 — siempre al final
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});