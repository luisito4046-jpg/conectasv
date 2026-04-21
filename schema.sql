-- ══════════════════════════════════════════════════════════════
--  ConectaSV v2.2 — Script completo de Base de Datos
--  Base: mi_base2  |  Motor: PostgreSQL
-- dia 14 de abril corroborar
-- ══════════════════════════════════════════════════════════════

-- ── Eliminar tablas si existen (orden inverso por FK) ──────────
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

-- ════════════════════════════════════════════════════════════════
--  TABLA: users
-- ════════════════════════════════════════════════════════════════
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'candidate'
                CHECK (role IN ('candidate','employer','admin')),
  location      VARCHAR(120),
  phone         VARCHAR(30),
  bio           TEXT,
  profile_photo_url VARCHAR(300),
  skills        TEXT,
  cv_url        VARCHAR(300),
  profile_views INT          NOT NULL DEFAULT 0,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','suspended')),
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ════════════════════════════════════════════════════════════════
--  TABLA: companies
-- ════════════════════════════════════════════════════════════════
CREATE TABLE companies (
  id          SERIAL PRIMARY KEY,
  owner_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  logo        VARCHAR(10),
  industry    VARCHAR(100),
  size        VARCHAR(50),
  website     VARCHAR(200),
  description TEXT,
  location    VARCHAR(120),
  verified    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_owner    ON companies(owner_id);
CREATE INDEX idx_companies_verified ON companies(verified);

-- ════════════════════════════════════════════════════════════════
--  TABLA: jobs
-- ════════════════════════════════════════════════════════════════
CREATE TABLE jobs (
  id           SERIAL PRIMARY KEY,
  company_id   INT          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  posted_by    INT          NOT NULL REFERENCES users(id),
  title        VARCHAR(200) NOT NULL,
  area         VARCHAR(100),
  type         VARCHAR(20)  NOT NULL DEFAULT 'full'
               CHECK (type IN ('full','part','remote','contract','freelance')),
  level        VARCHAR(20)  NOT NULL DEFAULT 'mid'
               CHECK (level IN ('entry','junior','mid','senior')),
  salary_min   NUMERIC(10,2),
  salary_max   NUMERIC(10,2),
  currency     VARCHAR(5)   NOT NULL DEFAULT 'USD',
  location     VARCHAR(120),
  remote       BOOLEAN      NOT NULL DEFAULT FALSE,
  requirements TEXT,
  description  TEXT         NOT NULL,
  benefits     TEXT,
  contact      VARCHAR(180),
  status       VARCHAR(20)  NOT NULL DEFAULT 'active'
               CHECK (status IN ('active','paused','closed')),
  featured     BOOLEAN      NOT NULL DEFAULT FALSE,
  views        INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_company  ON jobs(company_id);
CREATE INDEX idx_jobs_status   ON jobs(status);
CREATE INDEX idx_jobs_type     ON jobs(type);
CREATE INDEX idx_jobs_level    ON jobs(level);
CREATE INDEX idx_jobs_remote   ON jobs(remote);
CREATE INDEX idx_jobs_featured ON jobs(featured);
CREATE INDEX idx_jobs_created  ON jobs(created_at DESC);

-- ════════════════════════════════════════════════════════════════
--  TABLA: applications
-- ════════════════════════════════════════════════════════════════
CREATE TABLE applications (
  id            SERIAL PRIMARY KEY,
  job_id        INT         NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id  INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','review','interview','accepted','rejected')),
  cover_letter  TEXT,
  applied_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (job_id, candidate_id)
);

CREATE INDEX idx_applications_job       ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status    ON applications(status);

-- ════════════════════════════════════════════════════════════════
--  TABLA: alerts
-- ════════════════════════════════════════════════════════════════
CREATE TABLE alerts (
  id         SERIAL PRIMARY KEY,
  user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query      VARCHAR(255) NOT NULL,
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_user ON alerts(user_id);

-- ════════════════════════════════════════════════════════════════
--  TABLA: saved_jobs
-- ════════════════════════════════════════════════════════════════
CREATE TABLE saved_jobs (
  user_id  INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id   INT       NOT NULL REFERENCES jobs(id)  ON DELETE CASCADE,
  saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);

-- ════════════════════════════════════════════════════════════════
--  TABLA: ratings
-- ════════════════════════════════════════════════════════════════
CREATE TABLE ratings (
  id         SERIAL PRIMARY KEY,
  user_id    INT     NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  company_id INT     NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, company_id)
);

CREATE INDEX idx_ratings_company ON ratings(company_id);

-- ══════════════════════════════════════════════════════════════
--  DATOS SEMILLA (SEED)
-- ══════════════════════════════════════════════════════════════

-- ── Usuarios ──────────────────────────────────────────────────
-- Contraseña de todos: password123
INSERT INTO users (first_name, last_name, email, password_hash, role, location, phone, bio, skills, profile_views) VALUES
  ('Juan',   'Díaz',    'juan@ejemplo.com',         '$2b$10$JQIk06NBlQdSHZXTSoOMl.CCIhYdkQ0aamiFuv8QWonG7nasIVHBae', 'candidate', 'San Salvador, SV',   '+503 7000-0001', 'Desarrollador Frontend apasionado por la UI.',         '["HTML5","CSS3","JavaScript","React","Bootstrap"]', 128),
  ('María',  'López',   'maria@ejemplo.com',        '$2b$10$JQIk06NBlQdSHZXTSoOMl.CCIhYdkQ0aamiFuv8QWonG7nasIVHBae', 'candidate', 'Guatemala City, GT', '+502 5000-0002', 'Diseñadora UX con 4 años de experiencia.',            '["Figma","Adobe XD","Sketch","User Research"]',      74),
  ('Admin',  'TechNova','rh@technova.sv',           '$2b$10$JQIk06NBlQdSHZXTSoOMl.CCIhYdkQ0aamiFuv8QWonG7nasIVHBae', 'employer',  'San Salvador, SV',   '+503 2200-0001', '', '[]', 0),
  ('HR',     'CreativeHub','jobs@creativehub.io',   '$2b$10$JQIk06NBlQdSHZXTSoOMl.CCIhYdkQ0aamiFuv8QWonG7nasIVHBae', 'employer',  'Remoto',             '+1 555-0200',    '', '[]', 0),
  ('Carlos', 'Pérez',   'cp@correo.com',            '$2b$10$JQIk06NBlQdSHZXTSoOMl.CCIhYdkQ0aamiFuv8QWonG7nasIVHBae', 'candidate', 'San Salvador, SV',   '+503 7000-0005', 'Analista de datos con experiencia en Python y SQL.',  '["Python","SQL","Power BI","Excel"]',                32),
  ('Super',  'Admin',   'admin@conectasv.io',       '$2b$10$JQIk06NBlQdSHZXTSoOMl.CCIhYdkQ0aamiFuv8QWonG7nasIVHBae', 'admin',     'San Salvador, SV',   '',               '', '[]', 0);

-- Contraseña del admin: admin2024
UPDATE users SET password_hash = '$2b$10$zCbbHQvSZjk1jBR5lP8nWeGGtFl/G6OzIOQCv019u01yj2e.cYmjJ2'
WHERE email = 'admin@conectasv.io';

-- Admin adicional: admin@conectasv.com (contraseña propia)
INSERT INTO users (first_name, last_name, email, password_hash, role, location, phone, bio, status)
VALUES ('Super', 'Admin', 'admin@conectasv.com',
        '$2b$10$zCbbHQvSZjk1jBR5lP8nWeGGtFl/G6OzIOQCv019u01yj2e.cYmjJ2',
        'admin', 'San Salvador, SV', '+503 0000-0000', 'Administrador principal de ConectaSV', 'active');

-- Employers adicionales
INSERT INTO users (first_name, last_name, email, password_hash, role, location, phone, bio, skills, profile_views) VALUES
  ('Luis',    'Castillo', 'luis.castillo@empresa.com',  '$2b$10$JQIk06NBlQdSHZXTSoOMl.CCIhYdkQ0aamiFuv8QWonG7nasIVHBae', 'employer', 'San Salvador, SV',   '+503 2300-0007', '', '[]', 0),
  ('Valeria', 'Montes',   'valeria.montes@empresa.com', '$2b$10$JQIk06NBlQdSHZXTSoOMl.CCIhYdkQ0aamiFuv8QWonG7nasIVHBae', 'employer', 'Guatemala City, GT', '+502 2300-0008', '', '[]', 0);

-- ── Empresas ───────────────────────────────────────────────────
INSERT INTO companies (owner_id, name, logo, industry, size, website, description, location, verified) VALUES
  (3, 'TechNova SV',   'TN', 'Tecnología',        '50–200 empleados', 'https://technova.sv',    'Empresa de software SaaS para LATAM.',                    'San Salvador, SV',   TRUE),
  (4, 'CreativeHub',   'CH', 'Diseño & Marketing', '10–50 empleados',  'https://creativehub.io', 'Agencia de diseño digital con clientes globales.',        'Remoto',             TRUE),
  (3, 'GrowthLab',     'GL', 'Marketing',          '10–50 empleados',  'https://growthlab.gt',   'Especialistas en Growth Hacking para startups.',          'Guatemala City, GT', FALSE);

INSERT INTO companies (owner_id, name, logo, industry, size, website, description, location, verified) VALUES
  ((SELECT id FROM users WHERE email = 'luis.castillo@empresa.com'),   'DataSphere SV', 'DS', 'Tecnología',         '10–50 empleados',  'https://datasphere.sv',  'Empresa especializada en análisis de datos.',              'San Salvador, SV',   FALSE),
  ((SELECT id FROM users WHERE email = 'valeria.montes@empresa.com'),  'PixelForge',    'PF', 'Diseño & Marketing', '1–10 empleados',   'https://pixelforge.io',  'Estudio boutique de diseño digital.',                      'Remoto',             TRUE),
  ((SELECT id FROM users WHERE email = 'luis.castillo@empresa.com'),   'CloudBridge',   'CB', 'Infraestructura IT', '50–200 empleados', 'https://cloudbridge.sv', 'Proveedor de soluciones cloud para empresas.',             'San Salvador, SV',   TRUE),
  ((SELECT id FROM users WHERE email = 'valeria.montes@empresa.com'),  'EduTech LATAM', 'ET', 'Educación',          '10–50 empleados',  'https://edutech.lat',    'Plataforma de cursos online de habilidades digitales.',    'Guatemala City, GT', FALSE),
  ((SELECT id FROM users WHERE email = 'luis.castillo@empresa.com'),   'FinSmart',      'FS', 'Finanzas',           '10–50 empleados',  'https://finsmart.sv',    'Startup fintech con soluciones de contabilidad para PYMEs.','San Salvador, SV',  FALSE);

-- ── Empleos ────────────────────────────────────────────────────
INSERT INTO jobs (company_id, posted_by, title, area, type, level, salary_min, salary_max, currency, location, remote, requirements, description, benefits, contact, status, featured, views) VALUES
  (1, 3, 'Desarrollador Full-Stack',          'Tecnología',  'full',     'mid',    1800, 2500, 'USD', 'San Salvador, SV',  FALSE, 'Node.js, React, PostgreSQL, Docker, Git, 3+ años.',          'Buscamos desarrollador para plataforma SaaS usada por +50,000 usuarios en LATAM.',        'Seguro médico, bonos trimestrales, trabajo híbrido.',   'careers@technova.sv',  'active', TRUE,  243),
  (2, 4, 'Diseñadora UX/UI Senior',           'Diseño',      'remote',   'senior', 2000, 3200, 'USD', 'Remoto (LATAM)',     TRUE,  'Figma, Adobe XD, Investigación de usuarios, 5+ años.',       'Diseña experiencias digitales memorables para clientes internacionales.',                 'Horario flexible, equipo internacional, stock options.','rh@creativehub.io',    'active', TRUE,  187),
  (3, 3, 'Analista de Marketing Digital',     'Marketing',   'full',     'junior',  900, 1400, 'USD', 'Guatemala City, GT', FALSE, 'Google Analytics, Meta Ads, SEO básico, Excel.',             'Gestiona campañas digitales y analiza métricas de crecimiento.',                         'Comisiones, formación continua, ambiente dinámico.',   'jobs@growthlab.gt',    'active', FALSE,  98),
  (1, 3, 'Desarrollador Mobile React Native', 'Tecnología',  'contract', 'junior', 1000, 1600, 'USD', 'Remoto',             TRUE,  'React Native, JavaScript ES6+, REST APIs, Git, Expo.',       'Desarrolla apps móviles iOS/Android con integración Firebase.',                           'Horario flexible, proyectos internacionales.',          'dev@technova.sv',      'active', TRUE,  134),
  (2, 4, 'Gerente de Ventas B2B',             'Ventas',      'full',     'senior', 2500, 4000, 'USD', 'Bogotá, CO',         FALSE, 'CRM (Salesforce/HubSpot), negociación, liderazgo, 5+ años.','Lidera un equipo de 8 representantes en la región andina.',                              'Comisiones sin tope, vehículo de empresa, salud familiar.','sales@creativehub.io','active', FALSE, 76),
  (1, 3, 'Contador/a Público',                'Finanzas',    'full',     'mid',    1200, 1800, 'USD', 'San Salvador, SV',   FALSE, 'CPA o Lic. Contaduría, NIIF, Excel avanzado, 3 años.',       'Contabilidad general, estados financieros y apoyo en auditorías.',                       'ISSS, AFP, aguinaldo, capacitaciones.',                 'rrhh@technova.sv',     'active', FALSE,  61);

-- ── Postulaciones ──────────────────────────────────────────────
INSERT INTO applications (job_id, candidate_id, status, cover_letter) VALUES
  (1, 1, 'review',   'Estoy muy interesado en esta posición y tengo experiencia sólida en el stack.'),
  (2, 1, 'pending',  'Me apasiona el diseño UX y creo que puedo aportar mucho al equipo.'),
  (1, 2, 'accepted', 'Tengo experiencia comprobada en los requerimientos del puesto.'),
  (3, 5, 'pending',  'Me interesa el área de marketing digital y tengo nociones de analytics.');

-- ── Alertas ────────────────────────────────────────────────────
INSERT INTO alerts (user_id, query, active) VALUES
  (1, 'Desarrollador Frontend · Remoto', TRUE),
  (1, 'UX Designer · San Salvador',      TRUE),
  (1, 'Marketing Digital · LATAM',       FALSE),
  (2, 'Diseñadora UX · Remoto',          TRUE);

-- ── Empleos guardados ──────────────────────────────────────────
INSERT INTO saved_jobs (user_id, job_id) VALUES
  (1, 1), (1, 4), (2, 2), (5, 3);

-- ── Valoraciones ───────────────────────────────────────────────
INSERT INTO ratings (user_id, company_id, rating, comment) VALUES
  (1, 1, 5, 'Excelente ambiente de trabajo, buenas prestaciones y equipo muy profesional.'),
  (2, 2, 4, 'Empresa muy dinámica, buen salario y flexibilidad de horario.');

-- ══════════════════════════════════════════════════════════════
--  VISTAS
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW view_jobs_with_company AS
SELECT
  j.*,
  c.name     AS company_name,
  c.logo     AS company_logo,
  c.industry AS company_industry,
  c.verified AS company_verified,
  c.location AS company_location,
  (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
FROM jobs j
JOIN companies c ON c.id = j.company_id
WHERE j.status = 'active';

CREATE OR REPLACE VIEW view_system_stats AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'candidate') AS total_candidates,
  (SELECT COUNT(*) FROM users WHERE role = 'employer')  AS total_employers,
  (SELECT COUNT(*) FROM companies)                      AS total_companies,
  (SELECT COUNT(*) FROM companies WHERE verified = TRUE) AS verified_companies,
  (SELECT COUNT(*) FROM jobs WHERE status = 'active')   AS active_jobs,
  (SELECT COUNT(*) FROM applications)                   AS total_applications;

CREATE OR REPLACE VIEW view_company_ratings AS
SELECT
  c.id, c.name, c.logo, c.industry,
  ROUND(AVG(r.rating), 1) AS avg_rating,
  COUNT(r.id)              AS total_ratings
FROM companies c
LEFT JOIN ratings r ON r.company_id = c.id
GROUP BY c.id, c.name, c.logo, c.industry
ORDER BY avg_rating DESC NULLS LAST;
