import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import usersRouter from './routes/users.routes.js';
import uploadRouter from './routes/upload.routes.js';
import companiesRouter from './routes/companies.routes.js';
import loginRouter from './routes/login.routes.js';
import jobsRouter from './routes/jobs.routes.js';
import applicationsRouter from './routes/applications.routes.js';
import savedJobsRouter from './routes/savedJobs.routes.js';
import alertsRouter from './routes/alerts.routes.js';
import forumRouter from './routes/forum.routes.js';
import ratingsRouter from './routes/ratings.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/users', uploadRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/login', loginRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/saved-jobs', savedJobsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/forum', forumRouter);
app.use('/api/ratings', ratingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'ConectaSV API' });
});

const rootPath = path.resolve(__dirname, '..', '..');
const frontendPath = path.join(rootPath, 'Frontend');
const frontendDist = path.join(frontendPath, 'dist');
const useSolidBuild = fs.existsSync(path.join(frontendDist, 'index.html'));

// Paneles legacy (servidos como fallback si no existe build)
if (!useSolidBuild) {
  app.use('/recursos', express.static(path.join(frontendPath, 'recursos')));
  app.use('/admin', express.static(path.join(frontendPath, 'admin')));
  app.use('/Employee', express.static(path.join(frontendPath, 'Employee')));
  app.use('/Candidate', express.static(path.join(frontendPath, 'Candidate')));
}

if (useSolidBuild) {
  app.use(express.static(frontendDist));
} else {
  app.use('/js', express.static(path.join(frontendPath, 'js')));
  app.use('/css', express.static(path.join(frontendPath, 'css')));
  app.use(express.static(frontendPath));
}

function sendCandidatePanel(res) {
  const lower = path.join(frontendPath, 'Candidate', 'candidate.html');
  const upper = path.join(frontendPath, 'Candidate', 'candidate.HTML');
  const file = fs.existsSync(lower) ? lower : upper;
  res.sendFile(file);
}

app.get('/candidate.html', (req, res) => {
  if (useSolidBuild) return res.redirect('/candidate');
  sendCandidatePanel(res);
});

app.get('/employee.html', (req, res) => {
  if (useSolidBuild) return res.redirect('/employer');
  res.sendFile(path.join(frontendPath, 'Employee', 'employee.html'));
});

app.get('/admin/admin.html', (req, res) => {
  if (useSolidBuild) return res.redirect('/admin');
  res.sendFile(path.join(frontendPath, 'admin', 'admin.html'));
});

app.get('/recursos/recursos.html', (req, res) => {
  if (useSolidBuild) return res.redirect('/recursos');
  res.sendFile(path.join(frontendPath, 'recursos', 'recursos.html'));
});

if (useSolidBuild) {
  // Fallback SPA: cualquier GET que no sea API ni archivo estático
  app.get(/^(?!\/api).+/, (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (/\.[a-zA-Z0-9]+$/.test(req.path)) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(useSolidBuild ? 'Frontend: Solid.js (dist/)' : 'Frontend: legacy estático');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Puerto ${PORT} ya está en uso.`);
    console.error('   Cierra el otro proceso (Ctrl+C en esa terminal) o ejecuta:');
    console.error(`   $env:PORT=3001; npm run dev\n`);
  } else {
    console.error('Error al iniciar el servidor:', err.message);
  }
  process.exit(1);
});
