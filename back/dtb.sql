
-- CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS ServicioSocial;
USE ServicioSocial;

-- TABLA: Campus
CREATE TABLE Campus (
    id_campus INT PRIMARY KEY,
    campus VARCHAR(255)
);

-- TABLA: Carrera
CREATE TABLE Carrera (
    id_carrera INT PRIMARY KEY,
    siglas_carrera VARCHAR(255),
    nombre VARCHAR(255)
);

-- TABLA: Periodo
CREATE TABLE Periodo (
    id_periodo INT PRIMARY KEY,
    periodo VARCHAR(255),
    tipo_periodo VARCHAR(255),
    horas INT
);

-- TABLA: Ods
CREATE TABLE Ods (
    id_ods INT PRIMARY KEY,
    nombre_ods VARCHAR(255)
);

-- TABLA: Administrador
CREATE TABLE Administrador (
    id_administrador INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(255),
    contraseña VARCHAR(255),
    nombre VARCHAR(255)
);

-- TABLA: Estudiante
CREATE TABLE Estudiante (
    id_estudiante INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_carrera INT,
    id_campus INT,
    correo VARCHAR(255),
    contraseña VARCHAR(255),
    nombre VARCHAR(255),
    matricula VARCHAR(10),
    semestre ENUM('1','2','3','4','5','6','7','8','9','10','11','12'),
    doble_titulacion BOOLEAN,
    candidato_graduar BOOLEAN,
    telefono VARCHAR (10),
    FOREIGN KEY (id_carrera) REFERENCES Carrera(id_carrera),
    FOREIGN KEY (id_campus) REFERENCES Campus(id_campus)
);

-- TABLA: Socio
CREATE TABLE Socio (
    id_socio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tipo_socio ENUM('Estudiante "Líder Social"', 'Organización civil/Fundación/Asociación', 'Organismo gubernamental', 'Empresa social'),
    correo VARCHAR(255),
    contraseña VARCHAR(255),
    nombre_osf VARCHAR(255),
    telefono_osf VARCHAR (10),
    redes_sociales VARCHAR(255),
    vision TEXT,
    mision TEXT,
    objetivos VARCHAR(255),
    poblacion_osf ENUM(
        'Comunidades urbano marginadas', 'Comunidades rurales', 'Comunidades indígenas',
        'Primera infancia (0 a 6 años)', 'Niños y niñas de nivel primaria',
        'Niños, niñas y adolescentes', 'Mujeres en situación vulnerable',
        'Adultos mayores', 'Personas con discapacidad',
        'Personas con enfermedades crónicas/terminales',
        'Personas con problemas de adicciones',
        'Personas migrantes o situación de movilidad', 'Otros'
    ),
    num_beneficiarios_osf VARCHAR(255),
    id_ods INT,
    nombre_representante VARCHAR(255),
    puesto_representante VARCHAR(255),
    direccion_horario VARCHAR(255),
    notificaciones BOOLEAN,
    status ENUM('Aceptado', 'No aceptado', 'En revisión'),
    nota TEXT,
    FOREIGN KEY (id_ods) REFERENCES Ods(id_ods)
);

-- TABLA: SOCIO_ESTUDIANTE
CREATE TABLE SOCIO_ESTUDIANTE (
    id_socio INT PRIMARY KEY,
    nombre_socio VARCHAR (255),
    id_carrera INT,
    matricula VARCHAR(10),
    semestre_acreditado ENUM('1','2','3','4','5','6','7','8','9','10','11','12'),
    ine VARCHAR(255),
    logo VARCHAR(255),
    FOREIGN KEY (id_socio) REFERENCES Socio(id_socio) ON DELETE CASCADE,
    FOREIGN KEY (id_carrera) REFERENCES Carrera(id_carrera)
);

-- TABLA: Proyecto
CREATE TABLE Proyecto (
    id_proyecto INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_socio INT,
    correo_registro_info VARCHAR(255),
    region_proyecto ENUM('Centro-Occidente', 'CDMX', 'Monterrey', 'Noroeste'),
    id_campus INT,
    crn VARCHAR(255),
    grupo VARCHAR(255),
    clave_materia ENUM('WA1065', 'WA3041', 'WA1066', 'WA1067', 'WA1068', 'WA1058', 'WA3020'),
    id_periodo INT,
    fecha_implementacion VARCHAR(255),
    nombre_osf VARCHAR(255),
    razon_osf VARCHAR(255),
    poblacion_osf ENUM(
        'Comunidades urbano marginadas', 'Comunidades rurales', 'Comunidades indígenas',
        'Primera infancia (0 a 6 años)', 'Niños y niñas de nivel primaria',
        'Niños, niñas y adolescentes', 'Mujeres en situación vulnerable',
        'Adultos mayores', 'Personas con discapacidad',
        'Personas con enfermedades crónicas/terminales',
        'Personas con problemas de adicciones',
        'Personas migrantes o situación de movilidad', 'Otros'
    ),
    num_beneficiarios_osf VARCHAR(255),
    ods_osf INT,
    telefono_osf VARCHAR(255),
    datos_osf VARCHAR(255),
    contacto_coordinador VARCHAR(255),
    redes_sociales VARCHAR(255),
    nombre_proyecto VARCHAR(255),
    nomenclatura_registro VARCHAR(255),
    diagnostico_previo BOOLEAN,
    problema_social VARCHAR(255),
    vulnerabilidad_atendida_1 ENUM(
        'Mujeres', 'Migrantes', 'Discapacidad auditiva', 'Discapacidad motriz',
        'Discapacidad mental', 'Discapacidad visual', 'Personas en situación de pobreza',
        'Pertenecen a un grupo indígena', 'Personas en situación de calle',
        'Personas con enfermedades crónicas/terminales', 'Comunidad LGBTIQ+', 'Medio ambiente',
        'Niños, Niñas y Adolescentes', 'Personas con discapacidad', 'Jóvenes'
    ),
    edad_poblacion_1 ENUM(
        'Edad entre 0 y 5 años', 'Edad entre 6 y 12 años', 'Edad entre 13 y 18 años',
        'Edad entre 19 y 30 años', 'Edad entre 31 y 59 años', 'Edad de 60 años o más', 'No aplica'
    ),
    vulnerabilidad_atendida_2 ENUM(
        'Mujeres', 'Migrantes', 'Discapacidad auditiva', 'Discapacidad motriz',
        'Discapacidad mental', 'Discapacidad visual', 'Personas en situación de pobreza',
        'Pertenecen a un grupo indígena', 'Personas en situación de calle',
        'Personas con enfermedades crónicas/terminales', 'Comunidad LGBTIQ+', 'Medio ambiente',
        'Niños, Niñas y Adolescentes', 'Personas con discapacidad', 'Jóvenes'
    ),
    edad_poblacion_2 ENUM(
        'Edad entre 0 y 5 años', 'Edad entre 6 y 12 años', 'Edad entre 13 y 18 años',
        'Edad entre 19 y 30 años', 'Edad entre 31 y 59 años', 'Edad de 60 años o más', 'No aplica'
    ),
    zona_poblacion ENUM('Rural', 'Urbana'),
    numero_beneficiarios_proyecto VARCHAR(255),
    objetivo_proyecto VARCHAR(255),
    ods_proyecto_1 INT,
    ods_proyecto_2 INT,
    acciones_estudiantado VARCHAR(255),
    producto_servicio_entregar VARCHAR(255),
    entregable_esperado VARCHAR(255),
    medida_impacto VARCHAR(255),
    dias_actividades ENUM('Por acordar con OSF', 'Específico'),
    horario_proyecto VARCHAR(255),
    carreras_proyecto_1 INT,
    carreras_proyecto_2 INT,
    habilidades_alumno VARCHAR(255),
    cupos_proyecto INT,
    modalidad ENUM(
        'CLIN Proyecto Solidario Línea', 'CLIP | Proyecto Solidario Mixto',
        'PSP | Proyecto Solidario Presencial'
    ),
    direccion_escrita VARCHAR(255),
    duracion_experiencia ENUM('5 semanas', '10 semanas', '15 semanas'),
    valor_proyecto ENUM(
        'Compasión', 'Compromiso', 'Tolerancia', 'Participación ciudadana'
    ),
    periodo_repetido BOOLEAN,
    induccion_ss BOOLEAN,
    propuesta_semana_tec BOOLEAN,
    propuesta_inmersion_social BOOLEAN,
    propuesta_bloque BOOLEAN,
    indicaciones_especiales TEXT,
    status_proyecto ENUM('Aprobado', 'No aprobado', 'En revisión'),
    entrevista BOOLEAN,
    pregunta_descarte TEXT,
    enlace_maps VARCHAR(255),
    enlace_whatsApp VARCHAR(255),
    nombre_whatsApp VARCHAR(255),
    status_whatsapp VARCHAR(255),
    alumnos_postulados INT,
    alumnos_aceptados INT,
    alumnos_rechazados INT,
    cupos_disponibles INT,
    datatime_postulacion DATETIME,
    inicio_actividades VARCHAR(255),
    carta_exclusion VARCHAR(255),
    anuncio_canvas TEXT,
    porcentaje_canvas VARCHAR(255),
    status_actividad BOOLEAN,
    Nota TEXT,
    img_proyecto BLOB,
    FOREIGN KEY (id_socio) REFERENCES Socio(id_socio),
    FOREIGN KEY (id_campus) REFERENCES Campus(id_campus),
    FOREIGN KEY (id_periodo) REFERENCES Periodo(id_periodo),
    FOREIGN KEY (ods_osf) REFERENCES Ods(id_ods),
    FOREIGN KEY (ods_proyecto_1) REFERENCES Ods(id_ods),
    FOREIGN KEY (ods_proyecto_2) REFERENCES Ods(id_ods),
    FOREIGN KEY (carreras_proyecto_1) REFERENCES Carrera(id_carrera),
    FOREIGN KEY (carreras_proyecto_2) REFERENCES Carrera(id_carrera)
);



-- TABLA: Postulacion
CREATE TABLE Postulacion (
    id_postulacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT,
    id_proyecto INT,
    fecha_postulacion DATETIME,
    status ENUM('Aceptadx', 'No aceptadx', 'Alumno declinó participación', 'Inscrito'),
    expectativa TEXT,
    razon TEXT,
    motivo TEXT,
    pregunta_descarte TEXT,
    Nota TEXT,
    FOREIGN KEY (id_estudiante) REFERENCES Estudiante(id_estudiante) ON DELETE CASCADE,
    FOREIGN KEY (id_proyecto) REFERENCES Proyecto(id_proyecto) ON DELETE CASCADE
);

-- Insert de las carreras
INSERT INTO Carrera (id_carrera, siglas_carrera, nombre) VALUES
(1, NULL, 'Todas las carreras'),
(2, 'ARQ', 'Arquitectura'),
(3, 'LAD', 'Arte Digital'),
(4, 'LDI', 'Diseño'),
(5, 'LUB', NULL),
(6, 'LEC', 'Economía'),
(7, 'LED', 'Derecho'),
(8, 'LRI', 'Relaciones internacionales'),
(9, 'LTP', NULL),
(10, 'LC', 'Comunicación'),
(11, 'LEI', NULL),
(12, 'LLE', NULL),
(13, 'LPE', NULL),
(14, 'LTM', 'Tecnología y Producción Musical'),
(15, 'LAG', NULL),
(16, 'IAL', NULL),
(17, 'IBT', 'Biotecnología'),
(18, 'IDS', NULL),
(19, 'IQ', 'Químico'),
(20, 'IDM', NULL),
(21, 'IFI', NULL),
(22, 'IRS', 'Robótica y Sistemas Digitales'),
(23, 'ITC', 'Tecnologías Computacionales'),
(24, 'ITD', NULL),
(25, 'IC', 'Civil'),
(26, 'IE', NULL),
(27, 'IID', NULL),
(28, 'IIS', 'Industrial y de Sistemas'),
(29, 'IM', 'Mecánico'),
(30, 'IMT', 'Mecatrónica'),
(31, 'IMD', NULL),
(32, 'EBC', NULL),
(33, 'LNB', NULL),
(34, 'LPS', NULL),
(35, 'BGB', 'Negocios Internacionales'),
(36, 'LAE', 'Estrategia y Transformación de Negocios'),
(37, 'LAF', 'Finanzas'),
(38, 'LCPF', 'Contaduría Pública y Finanzas'),
(39, 'LDE', 'Emprendimiento'),
(40, 'LDO', NULL),
(41, 'LEM', 'Mercadotecnia'),
(42, 'LIN', NULL),
(43, 'LIT', 'Inteligencia de Negocios'),
(44, NULL, 'Todas las Ingenierías');

-- Insert de los periodos
INSERT INTO Periodo (id_periodo, periodo, tipo_periodo, horas) VALUES
(1, 'PMT1 - Periodo 1', 'Regular', 60),
(2, 'PMT2 - Periodo 2', 'Regular', 60),
(3, 'PMT3 - Periodo 3', 'Regular', 60),
(4, 'PMT4 - Periodo 4', 'Regular', 120),
(5, 'PMT5 - Periodo 5', 'Regular', 120),
(6, 'PMT6 - Periodo 6', 'Regular', 180),
(7, 'PMT1 - Periodo 1', 'Intensivo', 60),
(8, 'PMT1 - Periodo 1', 'Intensivo', 100),
(9, 'PMT1 - Periodo 1', 'Intensivo', 200),
(10, 'PMT1 - Periodo 1', 'Intensivo', 60),
(11, 'PMT1 - Periodo 1', 'Intensivo', 100),
(12, 'PMT1 - Periodo 1', 'Intensivo', 200);

-- Insert de las ods
INSERT INTO Ods (id_ods, nombre_ods) VALUES
(1, 'Fin de la pobreza'),
(2, 'Hambre cero'),
(3, 'Salud y bienestar'),
(4, 'Educación de calidad'),
(5, 'Igualdad de género'),
(6, 'Agua limpia y saneamiento'),
(7, 'Energía asequible y no contaminante'),
(8, 'Trabajo decente y crecimiento económico'),
(9, 'Industria, innovación e infraestructura'),
(10, 'Reducción de las desigualdades'),
(11, 'Ciudades y comunidades sostenibles'),
(12, 'Producción y consumo responsable'),
(13, 'Acción por el clima'),
(14, 'Vida submarina'),
(15, 'Vida de ecosistemas terrestres'),
(16, 'Paz, justicia e instituciones sólidas'),
(17, 'Alianzas para lograr los objetivos');

INSERT INTO Campus (id_campus, campus) VALUES
(1, 'Monterrey'),
(2, 'Ciudad de México'),
(3, 'Guadalajara'),
(4, 'Querétaro'),
(5, 'Estado de México'),
(6, 'Santa Fe'),
(7, 'Puebla');

INSERT INTO Administrador (correo, contraseña, nombre) VALUES
('admin1@servicio.com', '$2a$10$PruebaHashBcrypt1', 'Administrador General'),
('admin2@servicio.com', '$2a$10$PruebaHashBcrypt2', 'Coordinador SS');


INSERT INTO Estudiante (id_carrera, id_campus, correo, contraseña, nombre, matricula, semestre, doble_titulacion, candidato_graduar, telefono) VALUES
(23, 1, 'estudiante1@tec.mx', '$2a$10$PruebaHashEstudiante1', 'Juan López', 'A012345678', '6', FALSE, TRUE, '5551234567'),
(37, 2, 'estudiante2@tec.mx', '$2a$10$PruebaHashEstudiante2', 'María Pérez', 'A098765432', '8', TRUE, TRUE, '5569876543');

INSERT INTO Socio (
    tipo_socio, correo, contraseña, nombre_osf, telefono_osf, redes_sociales, vision, mision, objetivos,
    poblacion_osf, num_beneficiarios_osf, id_ods, nombre_representante, puesto_representante,
    direccion_horario, notificaciones, status, nota
) VALUES
('Organización civil/Fundación/Asociación', 'socio@osf.org', '$2a$10$PruebaHashSocio1', 'Fundación Esperanza',
'5551112233', '@fundacionesperanza', 'Mejorar vidas rurales', 'Desarrollo educativo', 'Reducir la desigualdad educativa',
'Niños y niñas de nivel primaria', '30', 4, 'Laura González', 'Directora General',
'Calle Ficticia 123, Monterrey', TRUE, 'Aceptado', 'Organización con más de 10 años de experiencia'),

('Estudiante \"Líder Social\"', 'lider@tec.mx', '$2a$10$PruebaHashSocio2', 'Líder Social Emprendedor',
'5552223344', '@lidertec', 'Empoderamiento juvenil', 'Acción estudiantil', 'Desarrollar liderazgo',
'Niños, niñas y adolescentes', '15', 5, 'Carlos Méndez', 'Estudiante', 'Campus Monterrey', TRUE, 'Aceptado', NULL);

INSERT INTO SOCIO_ESTUDIANTE (id_socio, nombre_socio, id_carrera, matricula, semestre_acreditado, ine, logo) VALUES
(2, 'Carlos Méndez', 23, 'A010101010', '6', 'INE123456789', 'logo_carlos.png');


INSERT INTO Proyecto (
    id_socio, correo_registro_info, region_proyecto, id_campus, crn, grupo, clave_materia, id_periodo,
    fecha_implementacion, nombre_osf, razon_osf, poblacion_osf, num_beneficiarios_osf, ods_osf, telefono_osf,
    datos_osf, contacto_coordinador, redes_sociales, nombre_proyecto, nomenclatura_registro, diagnostico_previo,
    problema_social, vulnerabilidad_atendida_1, edad_poblacion_1, vulnerabilidad_atendida_2, edad_poblacion_2,
    zona_poblacion, numero_beneficiarios_proyecto, objetivo_proyecto, ods_proyecto_1, ods_proyecto_2,
    acciones_estudiantado, producto_servicio_entregar, entregable_esperado, medida_impacto, dias_actividades,
    horario_proyecto, carreras_proyecto_1, carreras_proyecto_2, habilidades_alumno, cupos_proyecto, modalidad,
    direccion_escrita, duracion_experiencia, valor_proyecto, periodo_repetido, induccion_ss, propuesta_semana_tec,
    propuesta_inmersion_social, propuesta_bloque, indicaciones_especiales, status_proyecto, entrevista,
    pregunta_descarte, enlace_maps, enlace_whatsApp, nombre_whatsApp, status_whatsapp,
    alumnos_postulados, alumnos_aceptados, alumnos_rechazados, cupos_disponibles, datatime_postulacion,
    inicio_actividades, carta_exclusion, anuncio_canvas, porcentaje_canvas, status_actividad, Nota
) VALUES 
(2, 'socio@osf.org', 'Centro-Occidente', 1, 'CRN123', 'G1', 'WA1065', 1,
'2025-06-01', 'Fundación Esperanza', 'Reducir desigualdad', 'Niños y niñas de nivel primaria', '30', 4, '5551112233',
'info adicional', 'Laura González', '@fundacionesperanza', 'Proyecto Educación Rural', 'EDURUR-MTY', TRUE,
'Falta de acceso a educación en zonas rurales', 'Niños, Niñas y Adolescentes', 'Edad entre 6 y 12 años',
'Personas en situación de pobreza', 'Edad entre 13 y 18 años', 'Rural', '30', 'Apoyar educación básica',
4, 10, 'Talleres educativos', 'Material didáctico', 'Reporte final', 'Número de estudiantes atendidos',
'Por acordar con OSF', 'Lunes a viernes, 9am-1pm', 23, 37, 'Empatía, trabajo en equipo', 5,
'CLIP | Proyecto Solidario Mixto', 'Escuela Rural, Zona Norte', '10 semanas', 'Compromiso', FALSE, TRUE, FALSE, TRUE, FALSE,
'Ninguna', 'Aprobado', TRUE, '¿Te interesa trabajar con niños?', 'https://maps.google.com/q=escuela', 'https://wa.me/5215551112233',
'Laura G. - Fundación Esperanza', 'Activo', 1, 1, 0, 4, NOW(), '2025-06-10', NULL, NULL, NULL, TRUE, NULL);

INSERT INTO Proyecto (
    id_socio, correo_registro_info, region_proyecto, id_campus, crn, grupo, clave_materia, id_periodo,
    fecha_implementacion, nombre_osf, razon_osf, poblacion_osf, num_beneficiarios_osf, ods_osf, telefono_osf,
    datos_osf, contacto_coordinador, redes_sociales, nombre_proyecto, nomenclatura_registro, diagnostico_previo,
    problema_social, vulnerabilidad_atendida_1, edad_poblacion_1, vulnerabilidad_atendida_2, edad_poblacion_2,
    zona_poblacion, numero_beneficiarios_proyecto, objetivo_proyecto, ods_proyecto_1, ods_proyecto_2,
    acciones_estudiantado, producto_servicio_entregar, entregable_esperado, medida_impacto, dias_actividades,
    horario_proyecto, carreras_proyecto_1, carreras_proyecto_2, habilidades_alumno, cupos_proyecto, modalidad,
    direccion_escrita, duracion_experiencia, valor_proyecto, periodo_repetido, induccion_ss, propuesta_semana_tec,
    propuesta_inmersion_social, propuesta_bloque, indicaciones_especiales, status_proyecto, entrevista,
    pregunta_descarte, enlace_maps, enlace_whatsApp, nombre_whatsApp, status_whatsapp,
    alumnos_postulados, alumnos_aceptados, alumnos_rechazados, cupos_disponibles, datatime_postulacion,
    inicio_actividades, carta_exclusion, anuncio_canvas, porcentaje_canvas, status_actividad, Nota
) VALUES 
(1, 'lider@tec.mx', 'CDMX', 2, 'CRN456', 'G2', 'WA1067', 2,
'2025-06-15', 'Líder Social Emprendedor', 'Fomentar liderazgo juvenil', 'Niños, niñas y adolescentes', '15', 5, '5552223344',
'Datos OSF adicionales', 'Carlos Méndez', '@lidertec', 'Liderazgo para Jóvenes', 'LIDJOV-CDMX', TRUE,
'Falta de espacios de liderazgo para jóvenes', 'Jóvenes', 'Edad entre 13 y 18 años',
'Medio ambiente', 'Edad entre 19 y 30 años', 'Urbana', '15', 'Formar jóvenes líderes',
5, 13, 'Charlas motivacionales', 'Guía de liderazgo', 'Evidencia en video', 'Autoevaluación de liderazgo',
'Específico', 'Sábados, 10am-2pm', 23, 36, 'Liderazgo, comunicación', 10,
'PSP | Proyecto Solidario Presencial', 'Centro Juvenil CDMX', '5 semanas', 'Participación ciudadana', FALSE, TRUE, TRUE, FALSE, TRUE,
'Ninguna', 'Aprobado', TRUE, '¿Qué rol te gustaría tener como líder?', 'https://maps.google.com?q=centrojuvenil',
'https://wa.me/5215552223344', 'Carlos M. - Líder Social', 'Activo', 2, 2, 0, 8, NOW(), '2025-06-20', NULL, NULL, NULL, TRUE, NULL);


-- Postulación 1: Juan López (id_estudiante = 1) al proyecto con id_proyecto = 1
INSERT INTO Postulacion (
    id_estudiante, id_proyecto, fecha_postulacion, status,
    expectativa, razon, motivo, pregunta_descarte, Nota
) VALUES (
    1, 1, NOW(), 'Inscrito',
    'Aprender sobre el trabajo comunitario en zonas rurales.',
    'Me interesa ayudar a comunidades marginadas.',
    'He participado como voluntario en otras actividades educativas.',
    'Sí, me interesa trabajar con niños.', NULL
);

-- Postulación 2: María Pérez (id_estudiante = 2) al proyecto con id_proyecto = 2
INSERT INTO Postulacion (
    id_estudiante, id_proyecto, fecha_postulacion, status,
    expectativa, razon, motivo, pregunta_descarte, Nota
) VALUES (
    2, 2, NOW(), 'Aceptadx',
    'Contribuir al desarrollo de la educación en comunidades vulnerables.',
    'Es parte de mis metas profesionales.',
    'Quiero adquirir experiencia trabajando con niños.',
    'Sí, tengo experiencia previa en educación.', NULL
);

-- Postulación 3: Juan López (id_estudiante = 1) al proyecto con id_proyecto = 2
INSERT INTO Postulacion (
    id_estudiante, id_proyecto, fecha_postulacion, status,
    expectativa, razon, motivo, pregunta_descarte, Nota
) VALUES (
    1, 2, NOW(), 'No aceptadx',
    'Me interesa fortalecer mis habilidades como líder.',
    'Creo que puedo aportar desde mi experiencia escolar.',
    'Aunque no tengo experiencia formal, tengo muchas ganas de aprender.',
    'No tengo experiencia liderando grupos.', 'Se requiere mayor experiencia previa en liderazgo.'
);


