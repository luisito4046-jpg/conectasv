-- ══════════════════════════════════════════════════════════════
--  ConectaSV — Schema completo + datos de prueba (SEED)
--  Generado: 2026-04-24 | Motor: PostgreSQL
--
--  Credenciales de prueba (usuarios carlos@, elena@, mariana@, etc.):
--    Contraseña: password123
--  Admin: adminluis@admin.com / adminluis@admin.com
-- ══════════════════════════════════════════════════════════════

-- 0. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLAS BASE
CREATE TABLE IF NOT EXISTS users (
    id                SERIAL PRIMARY KEY,
    first_name        VARCHAR(100),
    last_name         VARCHAR(100),
    email             VARCHAR(255) UNIQUE NOT NULL,
    password_hash     VARCHAR(255),
    role              VARCHAR(50)  DEFAULT 'candidate',
    location          VARCHAR(255),
    phone             VARCHAR(50),
    bio               TEXT,
    skills            TEXT,
    cv_url            VARCHAR(300),
    profile_photo_url VARCHAR(300),
    status            VARCHAR(50)  DEFAULT 'active',
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id          SERIAL PRIMARY KEY,
    owner_id    INT          REFERENCES users(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    logo_url    VARCHAR(300),
    industry    VARCHAR(100),
    size        VARCHAR(50),
    website     VARCHAR(300),
    description TEXT,
    location    VARCHAR(255),
    verified    BOOLEAN      DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id           SERIAL PRIMARY KEY,
    company_id   INT          REFERENCES companies(id) ON DELETE CASCADE,
    posted_by    INT          REFERENCES users(id) ON DELETE SET NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    area         VARCHAR(100),
    type         VARCHAR(50),
    level        VARCHAR(50),
    salary_min   NUMERIC(10,2),
    salary_max   NUMERIC(10,2),
    location     VARCHAR(255),
    requirements TEXT,
    contact      VARCHAR(255),
    status       VARCHAR(50)  DEFAULT 'active',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id          SERIAL PRIMARY KEY,
    job_id      INT REFERENCES jobs(id) ON DELETE CASCADE,
    user_id     INT REFERENCES users(id) ON DELETE CASCADE,
    status      VARCHAR(50) DEFAULT 'pending',
    applied_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (job_id, user_id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    id         SERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(id) ON DELETE CASCADE,
    job_id     INT REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS alerts (
    id         SERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(id) ON DELETE CASCADE,
    query      VARCHAR(255),
    location   VARCHAR(255),
    frequency  VARCHAR(50) DEFAULT 'daily',
    active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id         SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    user_id    INT REFERENCES users(id) ON DELETE CASCADE,
    rating     NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_posts (
    id          SERIAL PRIMARY KEY,
    user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category    VARCHAR(100),
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_replies (
    id          SERIAL PRIMARY KEY,
    post_id     INT       NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id     INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT      NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_likes (
    id          SERIAL PRIMARY KEY,
    post_id     INT       NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id     INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_reply_likes (
    id          SERIAL PRIMARY KEY,
    reply_id    INT       NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
    user_id     INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (reply_id, user_id)
);

-- 2. VISTAS
CREATE OR REPLACE VIEW view_jobs_with_company AS
SELECT j.*, c.name AS company_name, c.logo_url AS company_logo, c.industry AS company_industry, c.verified AS company_verified, c.location AS company_location,
(SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.status = 'active';

-- 3. SEED DE DATOS
TRUNCATE TABLE forum_replies, forum_posts, saved_jobs, applications, ratings, alerts, jobs, companies, users RESTART IDENTITY CASCADE;

-- USUARIOS
INSERT INTO users (first_name, last_name, email, password_hash, role, location, phone, bio, skills, cv_url, profile_photo_url, status) VALUES
('Carlos', 'Prueba', 'carlos@conectasv.com', '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy', 'candidate', 'San Salvador, SV', '+503 7000-1000', 'Desarrollador web con experiencia en Node.js y React.', 'JavaScript, Node.js, React, SQL', 'https://example.com/cv/carlos.pdf', 'https://example.com/photos/carlos.jpg', 'active'),
('Elena', 'Rodríguez', 'elena@mail.com', '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy', 'candidate', 'Santa Ana, SV', '+503 7000-2000', 'Analista de datos apasionada por la inteligencia de negocio.', 'Python, SQL, Power BI, Excel', 'https://example.com/cv/elena.pdf', 'https://example.com/photos/elena.jpg', 'active'),
('Roberto', 'Sánchez', 'roberto@mail.com', '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy', 'candidate', 'San Miguel, SV', '+503 7000-3000', 'Estudiante de ingeniería con conocimientos en soporte técnico.', 'Linux, Redes, Soporte Técnico', 'https://example.com/cv/roberto.pdf', 'https://example.com/photos/roberto.jpg', 'active'),
('Andrea', 'López', 'andrea@mail.com', '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy', 'candidate', 'La Libertad, SV', '+503 7000-4000', 'Diseñadora UX/UI enfocada en productos digitales.', 'Figma, UI, UX, Adobe XD', 'https://example.com/cv/andrea.pdf', 'https://example.com/photos/andrea.jpg', 'active'),
('Kevin', 'Martínez', 'kevin@mail.com', '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy', 'candidate', 'Sonsonate, SV', '+503 7000-5000', 'Community manager con experiencia en marketing.', 'Marketing Digital, Redes Sociales', 'https://example.com/cv/kevin.pdf', 'https://example.com/photos/kevin.jpg', 'active'),
('Mariana', 'Cruz', 'mariana@conectasv.com', '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy', 'employer', 'San Salvador, SV', '+503 7000-6000', 'Reclutadora en ConectaTech.', 'Reclutamiento', 'https://example.com/cv/mariana.pdf', 'https://example.com/photos/mariana.jpg', 'active'),
('José', 'Álvarez', 'jose@conectasv.com', '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy', 'employer', 'San Salvador, SV', '+503 7000-7000', 'Fundador de SV Fintech.', 'Fintech', 'https://example.com/cv/jose.pdf', 'https://example.com/photos/jose.jpg', 'active'),
('Patricia', 'García', 'patricia@conectasv.com', '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy', 'employer', 'Santa Ana, SV', '+503 7000-8000', 'Directora de TalentLab.', 'RRHH', 'https://example.com/cv/patricia.pdf', 'https://example.com/photos/patricia.jpg', 'active'),
('Luis', 'Admin', 'adminluis@admin.com', crypt('adminluis@admin.com', gen_salt('bf')), 'admin', 'Ciudad Arce, SV', '+503 7000-9000', 'Administrador del sistema.', NULL, NULL, NULL, 'active');

-- EMPRESAS
INSERT INTO companies (owner_id, name, logo_url, industry, size, website, description, location, verified) VALUES
(6, 'ConectaTech', 'https://example.com/logos/conectatech.png', 'Tecnología', '51-200', 'https://conectatech.com', 'Startup de soluciones web.', 'San Salvador, SV', TRUE),
(7, 'SV Fintech', 'https://example.com/logos/svfintech.png', 'Fintech', '11-50', 'https://svfintech.com', 'Servicios financieros digitales.', 'San Salvador, SV', TRUE),
(8, 'TalentLab', 'https://example.com/logos/talentlab.png', 'Recursos Humanos', '21-100', 'https://talentlab.com', 'Plataforma de empleabilidad.', 'Santa Ana, SV', TRUE);

-- TRABAJOS
INSERT INTO jobs (company_id, posted_by, title, description, area, type, level, salary_min, salary_max, location, requirements, contact, status) VALUES
(1, 6, 'Desarrollador Full Stack', 'Node.js y React.', 'Desarrollo', 'full-time', 'junior', 800, 1200, 'San Salvador, SV', 'JavaScript, SQL.', 'reclutamiento@conectatech.com', 'active'),
(2, 7, 'Analista de Datos', 'Análisis financiero.', 'Data', 'full-time', 'junior', 850, 1100, 'San Salvador, SV', 'SQL, Python.', 'talento@svfintech.com', 'active');

-- ALERTAS
INSERT INTO alerts (user_id, query, location, frequency, active) VALUES
(1, 'Node.js', 'San Salvador, SV', 'daily', TRUE),
(2, 'Data analyst', 'San Salvador, SV', 'weekly', TRUE);

-- FORUM
INSERT INTO forum_posts (user_id, category, title, content) VALUES
(1, 'Tecnología', '¿Entrevista técnica?', 'Consejos para junior en desarrollo de software.'),
(2, 'General', '¿Remoto desde SV?', 'Experiencias con pagos en USD trabajando remoto.');

INSERT INTO forum_replies (post_id, user_id, content) VALUES
(1, 2, 'Practica LeetCode y explica tu código.'),
(2, 1, 'Wise funciona excelente para pagos externos.');

-- SINCRONIZAR SECUENCIAS
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));
SELECT setval('jobs_id_seq', (SELECT MAX(id) FROM jobs));
SELECT setval('alerts_id_seq', (SELECT MAX(id) FROM alerts));
SELECT setval('forum_posts_id_seq', (SELECT MAX(id) FROM forum_posts));
SELECT setval('forum_replies_id_seq', (SELECT MAX(id) FROM forum_replies));




-- ══════════════════════════════════════════════════════════════
--  ConectaSV — Bloque Adicional: Postulaciones y Alertas
-- ══════════════════════════════════════════════════════════════

-- 1. POSTULACIONES (Applications)
-- Vinculamos a los usuarios (1-5) con los trabajos disponibles (1-2)
INSERT INTO applications (job_id, user_id, status, applied_at, updated_at) VALUES
(1, 1, 'pending',  '2026-04-15 09:00:00', '2026-04-15 09:00:00'), -- Carlos a Full Stack
(1, 4, 'accepted', '2026-04-18 12:00:00', '2026-04-22 16:00:00'), -- Andrea a Full Stack
(2, 2, 'reviewed', '2026-04-16 10:30:00', '2026-04-18 14:00:00'), -- Elena a Analista
(2, 5, 'pending',  '2026-04-19 13:15:00', '2026-04-19 13:15:00'); -- Kevin a Analista

-- 2. ALERTAS ADICIONALES (usuarios 3–5; 1–2 ya insertados arriba)
INSERT INTO alerts (user_id, query, location, frequency, active, created_at) VALUES
(3, 'Soporte Técnico', 'Remoto', 'daily', TRUE, '2026-04-03 10:20:00'),
(4, 'UX/UI Designer', 'Santa Ana, SV', 'weekly', FALSE, '2026-04-05 12:00:00'),
(5, 'Marketing Digital', 'San Salvador, SV', 'daily', TRUE, '2026-04-06 14:10:00');

-- 3. EMPLEOS GUARDADOS (Opcional, pero útil para pruebas)
INSERT INTO saved_jobs (user_id, job_id, saved_at) VALUES
(1, 2, '2026-04-20 08:00:00'), -- Carlos guardó Analista de Datos
(3, 1, '2026-04-20 10:00:00'); -- Roberto guardó Full Stack

-- 4. SINCRONIZAR SECUENCIAS
SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications));
SELECT setval('alerts_id_seq', (SELECT MAX(id) FROM alerts));
SELECT setval('saved_jobs_id_seq', (SELECT MAX(id) FROM saved_jobs));