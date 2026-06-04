-- Actualiza contraseña de usuarios de prueba a: password123
-- Ejecutar si ya tienes la BD creada y no quieres volver a correr schema.sql

UPDATE users
SET password_hash = '$2b$10$NERP9ZZqstuCbM760vwSyeUXpS2.jrOEHOqzaU5FvpnPD.hN4c7Dy'
WHERE email IN (
  'carlos@conectasv.com',
  'elena@mail.com',
  'roberto@mail.com',
  'andrea@mail.com',
  'kevin@mail.com',
  'mariana@conectasv.com',
  'jose@conectasv.com',
  'patricia@conectasv.com'
);
