import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ TODAS las importaciones juntas al inicio del archivo
import usersRouter from './routes/users.js';
import companiesRouter from './routes/companies.js';
import loginRouter from './routes/login.js';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';
import savedJobsRouter from './routes/savedJobs.js';
import alertsRouter from './routes/alerts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// 2. RUTAS DE LA API (antes de los estáticos)
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/login', loginRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/saved-jobs', savedJobsRouter);
app.use('/api/alerts', alertsRouter);


// 3. ARCHIVOS ESTÁTICOS
const rootPath = path.resolve(__dirname, '..', '..');
const frontendPath = path.join(rootPath, 'Frontend');

app.use('/js',  express.static(path.join(frontendPath, 'js')));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/admin', express.static(path.join(frontendPath, 'admin')));
app.use('/Employee', express.static(path.join(frontendPath, 'Employee')));
app.use('/Candidate', express.static(path.join(frontendPath, 'Candidate')));
app.use(express.static(frontendPath));

// 4. RUTA PRINCIPAL → index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// 5. MIDDLEWARE 404 — siempre al final
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});