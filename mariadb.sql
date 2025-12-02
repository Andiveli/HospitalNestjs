-- Opcional: crea esquema propio
-- CREATE DATABASE telemedicina;
-- USE telemedicina;

-- ============
-- Catálogos
-- ============

CREATE TABLE generos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo CHAR(1) NOT NULL
);

CREATE TABLE estados_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE grupos_sanguineos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE estilos_vida (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE paises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE enfermedades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(255)
);

CREATE TABLE tipos_enfermedad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE especialidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255)
);

CREATE TABLE dias_atencion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

CREATE TABLE estados_pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

CREATE TABLE tipo_documento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);

CREATE TABLE estados_cita (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE tipos_centro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE servicios_referidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

CREATE TABLE presentaciones_medicamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

CREATE TABLE unidades_medida (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

CREATE TABLE vias_administracion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE estados_sesion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

CREATE TABLE tipos_mensaje (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion VARCHAR(255)
);

CREATE TABLE permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255)
);

CREATE TABLE roles_sesion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- ============
-- Usuarios / Seguridad
-- ============

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula CHAR(10) UNIQUE NOT NULL,
  primer_nombre VARCHAR(100) NOT NULL,
  segundo_nombre VARCHAR(100),
  primer_apellido VARCHAR(100) NOT NULL,
  segundo_apellido VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL,
  verificado BOOLEAN NOT NULL DEFAULT FALSE,
  image_url VARCHAR(255),
  token VARCHAR(255) UNIQUE,
  token_expiracion TIMESTAMP,
  genero_id INT NOT NULL,
  estado_id INT NOT NULL,
  FOREIGN KEY (genero_id) REFERENCES generos(id),
  FOREIGN KEY (estado_id) REFERENCES estados_usuario(id)
);

CREATE TABLE roles_usuarios (
  rol_id INT,
  usuario_id INT,
  PRIMARY KEY (rol_id, usuario_id),
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE roles_permisos (
  rol_id INT,
  permiso_id INT,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);

-- ============
-- Perfiles clínicos (herencia de usuarios)
-- ============

CREATE TABLE pacientes (
  usuario_id INT PRIMARY KEY,
  fecha_nacimiento DATE NOT NULL,
  pais_id INT NOT NULL,
  lugar_residencia VARCHAR(150),
  numero_celular CHAR(10),
  grupo_sanguineo_id INT NOT NULL,
  estilo_vida_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (pais_id) REFERENCES paises(id),
  FOREIGN KEY (grupo_sanguineo_id) REFERENCES grupos_sanguineos(id),
  FOREIGN KEY (estilo_vida_id) REFERENCES estilos_vida(id)
);

CREATE TABLE medicos (
  usuario_id INT PRIMARY KEY,
  pasaporte VARCHAR(15) UNIQUE,
  licencia_medica VARCHAR(50),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE pacientes_enfermedades (
  paciente_id INT,
  enfermedad_id INT,
  detalle TEXT,
  tipo_enfermedad_id INT NOT NULL,
  PRIMARY KEY (paciente_id, enfermedad_id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (enfermedad_id) REFERENCES enfermedades(id),
  FOREIGN KEY (tipo_enfermedad_id) REFERENCES tipos_enfermedad(id)
);

CREATE TABLE medicos_especialidades (
  medico_id INT,
  especialidad_id INT,
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (medico_id, especialidad_id),
  FOREIGN KEY (medico_id) REFERENCES medicos(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
);

-- ============
-- Agenda y disponibilidad
-- ============

CREATE TABLE horarios_medico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  dia_id INT NOT NULL,
  medico_id INT NOT NULL,
  FOREIGN KEY (dia_id) REFERENCES dias_atencion(id),
  FOREIGN KEY (medico_id) REFERENCES medicos(usuario_id) ON DELETE CASCADE
);

CREATE TABLE excepcion_horario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  motivo VARCHAR(255),
  medico_id INT NOT NULL,
  FOREIGN KEY (medico_id) REFERENCES medicos(usuario_id) ON DELETE CASCADE
);

-- ============
-- Pagos
-- ============

CREATE TABLE pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaccion_id VARCHAR(150) UNIQUE NOT NULL,
  comprobante_pago VARCHAR(255),
  fecha_hora_pago TIMESTAMP NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  autorizado BOOLEAN NOT NULL DEFAULT FALSE,
  estado_id INT NOT NULL,
  medico_id INT NOT NULL,
  FOREIGN KEY (estado_id) REFERENCES estados_pago(id),
  FOREIGN KEY (medico_id) REFERENCES medicos(usuario_id) ON DELETE CASCADE
);

-- ============
-- Historia clínica y documentos
-- ============

CREATE TABLE historias_clinicas (
  paciente_id INT PRIMARY KEY,
  fecha_hora_apertura TIMESTAMP NOT NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(usuario_id) ON DELETE CASCADE
);

CREATE TABLE documentos_hc (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  url VARCHAR(255) NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  fecha_hora_subida TIMESTAMP NOT NULL,
  tipo_id INT NOT NULL,
  historia_id INT NOT NULL,
  FOREIGN KEY (tipo_id) REFERENCES tipo_documento(id),
  FOREIGN KEY (historia_id) REFERENCES historias_clinicas(paciente_id) ON DELETE CASCADE
);

-- ============
-- Citas y atención
-- ============

CREATE TABLE citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha_hora_creacion TIMESTAMP NOT NULL,
  fecha_hora_inicio TIMESTAMP NOT NULL,
  fecha_hora_fin TIMESTAMP NOT NULL,
  telefonica BOOLEAN NOT NULL DEFAULT FALSE,
  estado_id INT NOT NULL,
  paciente_id INT NOT NULL,
  medico_id INT NOT NULL,
  FOREIGN KEY (estado_id) REFERENCES estados_cita(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (medico_id) REFERENCES medicos(usuario_id) ON DELETE CASCADE
);

CREATE TABLE registros_atencion (
  cita_id INT PRIMARY KEY,
  motivo_cita TEXT,
  diagnostico TEXT,
  observaciones TEXT,
  fecha_hora_creacion TIMESTAMP NOT NULL,
  historia_id INT NOT NULL,
  FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE,
  FOREIGN KEY (historia_id) REFERENCES historias_clinicas(paciente_id) ON DELETE CASCADE
);

-- ============
-- Derivaciones y centros
-- ============

CREATE TABLE centros_salud (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion VARCHAR(150),
  telefono VARCHAR(20),
  tipo_id INT NOT NULL,
  FOREIGN KEY (tipo_id) REFERENCES tipos_centro(id)
);

CREATE TABLE derivaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registro_atencion_id INT,
  motivo VARCHAR(255) NOT NULL,
  fecha_hora_creacion TIMESTAMP NOT NULL,
  medico_id INT NOT NULL,
  centro_id INT,
  FOREIGN KEY (registro_atencion_id) REFERENCES registros_atencion(cita_id) ON DELETE CASCADE,
  FOREIGN KEY (medico_id) REFERENCES medicos(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (centro_id) REFERENCES centros_salud(id) ON DELETE SET NULL
);

CREATE TABLE derivaciones_servicios (
  derivacion_id INT,
  servicio_id INT,
  PRIMARY KEY (derivacion_id, servicio_id),
  FOREIGN KEY (derivacion_id) REFERENCES derivaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (servicio_id) REFERENCES servicios_referidos(id)
);

-- ============
-- Medicación y recetas
-- ============

CREATE TABLE medicamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  principio_activo VARCHAR(150) NOT NULL,
  concentracion VARCHAR(100),
  presentacion_id INT NOT NULL,
  FOREIGN KEY (presentacion_id) REFERENCES presentaciones_medicamento(id)
);

CREATE TABLE recetas_medicas (
  registro_atencion_id INT PRIMARY KEY,
  fecha_hora_creacion TIMESTAMP NOT NULL,
  medico_id INT NOT NULL,
  observaciones TEXT,
  FOREIGN KEY (registro_atencion_id) REFERENCES registros_atencion(cita_id) ON DELETE CASCADE,
  FOREIGN KEY (medico_id) REFERENCES medicos(usuario_id) ON DELETE CASCADE
);

CREATE TABLE recetas_medicamentos (
  receta_id INT,
  medicamento_id INT,
  duracion VARCHAR(100) NOT NULL,
  frecuencia VARCHAR(100) NOT NULL,
  cantidad INT NOT NULL,
  via_administracion_id INT NOT NULL,
  unidad_medida_id INT NOT NULL,
  indicaciones VARCHAR(255),
  PRIMARY KEY (receta_id, medicamento_id),
  FOREIGN KEY (receta_id) REFERENCES recetas_medicas(registro_atencion_id) ON DELETE CASCADE,
  FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id),
  FOREIGN KEY (via_administracion_id) REFERENCES vias_administracion(id),
  FOREIGN KEY (unidad_medida_id) REFERENCES unidades_medida(id)
);

-- ============
-- Sesiones y chat
-- ============

CREATE TABLE sesiones_consulta (
  cita_id INT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  fecha_hora_inicio TIMESTAMP NOT NULL,
  fecha_hora_fin TIMESTAMP NOT NULL,
  grabacion_url VARCHAR(255),
  estado_id INT NOT NULL,
  FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE,
  FOREIGN KEY (estado_id) REFERENCES estados_sesion(id)
);

CREATE TABLE participantes_sesion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150),
  token_acceso VARCHAR(255) NOT NULL,
  fecha_hora_union TIMESTAMP NOT NULL,
  fecha_hora_salida TIMESTAMP,
  rol_id INT NOT NULL,
  usuario_id INT,
  sesion_id INT,
  FOREIGN KEY (rol_id) REFERENCES roles_sesion(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (sesion_id) REFERENCES sesiones_consulta(cita_id) ON DELETE CASCADE
);

CREATE TABLE mensajes_chat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contenido_texto TEXT,
  contenido_url VARCHAR(255),
  fecha_hora_envio TIMESTAMP NOT NULL,
  eliminado BOOLEAN DEFAULT FALSE,
  tipo_mensaje_id INT NOT NULL,
  sesion_id INT NOT NULL,
  participante_id INT,
  FOREIGN KEY (tipo_mensaje_id) REFERENCES tipos_mensaje(id),
  FOREIGN KEY (sesion_id) REFERENCES sesiones_consulta(cita_id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES participantes_sesion(id) ON DELETE SET NULL
);

-- ============
-- INDICE UNICO PARA MEDICO
-- ============

CREATE UNIQUE INDEX idx_unica_especialidad_principal 
ON medicos_especialidades (medico_id) 
WHERE principal = 1;
