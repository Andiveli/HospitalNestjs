-- Insertar grupos sanguíneos en la base de datos
-- Compatible con MariaDB/MySQL

-- Limpiar tabla primero (opcional - comentar si no querés perder datos)
-- TRUNCATE TABLE grupos_sanguineos;

-- Insertar grupos sanguíneos basados en tu enum
INSERT INTO grupos_sanguineos (nombre, descripcion) VALUES 
('A+', 'Grupo sanguíneo A positivo'),
('A-', 'Grupo sanguíneo A negativo'),
('B+', 'Grupo sanguíneo B positivo'),
('B-', 'Grupo sanguíneo B negativo'),
('AB+', 'Grupo sanguíneo AB positivo'),
('AB-', 'Grupo sanguíneo AB negativo'),
('O+', 'Grupo sanguíneo O positivo'),
('O-', 'Grupo sanguíneo O negativo');

-- Si tu tabla tiene más campos (id, fecha_creacion, etc.), ajustá así:
INSERT INTO grupos_sanguineos (nombre, descripcion, activo, fecha_creacion) VALUES 
('A+', 'Grupo sanguíneo A positivo', 1, NOW()),
('A-', 'Grupo sanguíneo A negativo', 1, NOW()),
('B+', 'Grupo sanguíneo B positivo', 1, NOW()),
('B-', 'Grupo sanguíneo B negativo', 1, NOW()),
('AB+', 'Grupo sanguíneo AB positivo', 1, NOW()),
('AB-', 'Grupo sanguíneo AB negativo', 1, NOW()),
('O+', 'Grupo sanguíneo O positivo', 1, NOW()),
('O-', 'Grupo sanguíneo O negativo', 1, NOW());

-- Verificar los datos insertados
SELECT * FROM grupos_sanguineos ORDER BY nombre;