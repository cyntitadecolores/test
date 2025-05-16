const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const dotenv = require("dotenv")
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs     = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configura el servidor para servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error("❌ Error al conectar a MySQL:", err);
        return;
    }
    console.log("✅ Conectado a MySQL");
});

// Middleware para verificar el JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Obtén el token del encabezado Authorization

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado, no se proporcionó el token' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = verified; 
    next(); 
  } catch (error) {
    res.status(400).json({ message: 'Token inválido' });
  }
};



//Endpoint paginas socio

// -----------------------------------------
// 1. Configuración de Multer
// -----------------------------------------


// Crea la carpeta uploads si no existe
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');  // Asegúrate de crear la carpeta 'uploads' en tu servidor
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Usa el timestamp para el nombre del archivo
  }
});

const upload = multer({ storage: storage });

// -----------------------------------------
// 2. Endpoint POST /proyecto
// -----------------------------------------
app.post('/proyecto', upload.single('imagen'), (req, res) => {
  // ---------- Des-estructuramos el body ----------
  const {
    id_socio, fecha_implementacion, nombre_proyecto, problema_social, vulnerabilidad_atendida_1, edad_poblacion_1,
    vulnerabilidad_atendida_2, edad_poblacion_2, zona_poblacion, numero_beneficiarios_proyecto,
    objetivo_proyecto, ods_proyecto_1, ods_proyecto_2, acciones_estudiantado,
    producto_servicio_entregar, entregable_esperado, medida_impacto, dias_actividades,
    horario_proyecto, carreras_proyecto_1, carreras_proyecto_2, habilidades_alumno,
    cupos_proyecto, modalidad, direccion_escrita, duracion_experiencia, valor_proyecto,
    periodo_repetido, induccion_ss, propuesta_semana_tec, propuesta_inmersion_social,
    propuesta_bloque, entrevista, pregunta_descarte, enlace_maps
  } = req.body;

  // ---------- Imagen ----------
  const img_proyecto = req.file ? `/uploads/${req.file.filename}` : null;

  // ---------- Datos requeridos mínimos ----------
  if (!nombre_proyecto || !problema_social || !objetivo_proyecto) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  // ---------- Armado dinámico de columnas / placeholders ----------
  const columns = [
    'id_socio', 'fecha_implementacion', 'nombre_proyecto', 'problema_social', 'vulnerabilidad_atendida_1', 'edad_poblacion_1',
    'vulnerabilidad_atendida_2', 'edad_poblacion_2', 'zona_poblacion', 'numero_beneficiarios_proyecto',
    'objetivo_proyecto', 'ods_proyecto_1', 'ods_proyecto_2', 'acciones_estudiantado',
    'producto_servicio_entregar', 'entregable_esperado', 'medida_impacto', 'dias_actividades',
    'horario_proyecto', 'carreras_proyecto_1', 'carreras_proyecto_2', 'habilidades_alumno',
    'cupos_proyecto', 'modalidad', 'direccion_escrita', 'duracion_experiencia', 'valor_proyecto',
    'periodo_repetido', 'induccion_ss', 'propuesta_semana_tec', 'propuesta_inmersion_social',
    'propuesta_bloque', 'entrevista', 'pregunta_descarte', 'enlace_maps', "img_proyecto", 'status_proyecto'

  ];

  const placeholders = columns.map(() => '?').join(',');

  const query = `INSERT INTO Proyecto (${columns.join(',')}) VALUES (${placeholders})`;

  // ---------- Valores en el mismo orden ----------
  const values = [
    id_socio, fecha_implementacion, nombre_proyecto,
    problema_social, vulnerabilidad_atendida_1, edad_poblacion_1,
    vulnerabilidad_atendida_2, edad_poblacion_2, zona_poblacion, numero_beneficiarios_proyecto,
    objetivo_proyecto, ods_proyecto_1, ods_proyecto_2, acciones_estudiantado,
    producto_servicio_entregar, entregable_esperado, medida_impacto, dias_actividades,
    horario_proyecto, carreras_proyecto_1, carreras_proyecto_2, habilidades_alumno,
    cupos_proyecto, modalidad, direccion_escrita, duracion_experiencia, valor_proyecto,
    periodo_repetido, induccion_ss, propuesta_semana_tec, propuesta_inmersion_social,
    propuesta_bloque, entrevista, pregunta_descarte, enlace_maps,
    img_proyecto, 'En revisión'      // status inicial
  ];

  // ---------- Ejecución ----------
  db.query(query, values, (err, _result) => {
    if (err) {
      console.error('❌ Error al registrar el proyecto:', err);
      return res.status(500).json({ message: 'Error al registrar el proyecto' });
    }
    return res.status(201).json({ message: 'Proyecto creado exitosamente' });
  });
});


 // GET /socio/:id_socio - Obtener info del socio con solo campos específicos
  app.get('/socio/:id_socio', (req, res) => {
    const { id_socio } = req.params;

    const query = `
      SELECT 
        id_socio,
        correo,
        nombre_osf,
        telefono_osf,
        redes_sociales,
        poblacion_osf,
        num_beneficiarios_osf,
        id_ods
      FROM socio
      WHERE id_socio = ?
    `;

    db.query(query, [id_socio], (err, results) => {
      if (err) {
        console.error('❌ Error al obtener socio:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Socio no encontrado' });
      }
      res.json(results[0]);
    });
  });


  app.get("/campus", (req, res) => {
    db.query("SELECT * FROM Campus", (err, results) => {
      if (err) {
        console.error("❌ Error al obtener campus:", err);
        return res.status(500).json({ message: "Error al obtener campus" });
      }
      res.json(results);  // Retorna los campus como un array de objetos
    });
  });

  app.get("/carreras", (req, res) => {
    db.query("SELECT * FROM Carrera", (err, results) => {
      if (err) {
        console.error("❌ Error al obtener carreras:", err);
        return res.status(500).json({ message: "Error al obtener carreras" });
      }
      res.json(results);  // Retorna las carreras como un array de objetos
    });
  });

  app.get("/ods", (req, res) => {
    db.query("SELECT * FROM Ods", (err, results) => {
      if (err) {
        console.error("❌ Error al obtener ODS:", err);
        return res.status(500).json({ message: "Error al obtener ODS" });
      }
      res.json(results);  // Retorna los ODS como un array de objetos
    });
  });

  app.get("/periodos", (req, res) => {
    db.query("SELECT * FROM Periodo", (err, results) => {
      if (err) {
        console.error("❌ Error al obtener periodos:", err);
        return res.status(500).json({ message: "Error al obtener periodos" });
      }
      res.json(results);  // Retorna los periodos como un array de objetos
    });
  });


  
  // Obtener estudiantes postulados a un proyecto específico
// 🚀 MySQL 8+: la agrupación se resuelve en la propia consulta

/* ===========================================================
   1)  ESTUDIANTES POSTULADOS POR CADA PROYECTO DEL SOCIO
   GET /proyecto/:id_socio/postulados
   -----------------------------------------------------------*/
   app.get('/proyecto/:id_socio/postulados', (req, res) => {
    const { id_socio } = req.params;
  
    const query = `
      SELECT
        P.id_proyecto,
        P.nombre_proyecto,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id_estudiante', E.id_estudiante,
            'estudiante_nombre', E.nombre,
            'estudiante_correo', E.correo,
            'estudiante_carrera', C.nombre,                     -- ⚠️ aquí cambia
            'fecha_postulacion_estudiante', Po.fecha_postulacion,
            'expectativa', Po.expectativa,
            'razon', Po.razon,
            'motivo', Po.motivo
          )
        ) AS alumnos_postulados
      FROM Proyecto      P
      JOIN Postulacion   Po ON P.id_proyecto = Po.id_proyecto
      JOIN Estudiante    E  ON Po.id_estudiante = E.id_estudiante
      JOIN Carrera       C  ON E.id_carrera   = C.id_carrera
      WHERE P.id_socio = ? AND Po.status = 'Inscrito'
      GROUP BY P.id_proyecto, P.nombre_proyecto;
    `;
  
    db.query(query, [id_socio], (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener estudiantes postulados:', err);
        return res.status(500).json({ message: 'Error al obtener estudiantes postulados' });
      }
      res.json(rows);
    });
  });
  
  /* ===========================================================
     2)  ACTUALIZAR STATUS DE UNA POSTULACIÓN
     PUT /postulacion/:id_proyecto/:id_estudiante
     -----------------------------------------------------------*/
  app.put('/postulacion/:id_proyecto/:id_estudiante', (req, res) => {
    const { id_proyecto, id_estudiante } = req.params;
    let   { status } = req.body;                // puede venir “aceptado”, “no aceptado” del front
  
    // Normaliza para encajar con el ENUM real
    if (status === 'aceptado')    status = 'Aceptadx';
    if (status === 'no aceptado') status = 'No aceptadx';
    if (status === 'inscrito')    status = 'Inscrito';
  
    const estadosValidos = ['Inscrito', 'Aceptadx', 'No aceptadx', 'Alumno declinó participación'];
    if (!estadosValidos.includes(status))
      return res.status(400).json({ message: 'Estado no permitido' });
  
    const query = `
      UPDATE Postulacion
         SET status = ?
       WHERE id_proyecto = ? AND id_estudiante = ?
    `;
  
    db.query(query, [status, id_proyecto, id_estudiante], (err, _result) => {
      if (err) {
        console.error('❌ Error al actualizar el status de la postulación:', err);
        return res.status(500).json({ message: 'Error al actualizar el status' });
      }
      res.json({ message: 'Status actualizado correctamente' });
    });
  });
  

// Obtener proyectos aprobados con el periodo
app.get('/proyectos/aprobados', (req, res) => {
  const query = `
    SELECT 
      p.*,
      per.periodo,
      (
        SELECT COUNT(*) 
        FROM Postulacion pos 
        WHERE pos.id_proyecto = p.id_proyecto AND pos.status NOT IN ('rechazada', 'cancelada')
      ) AS postulaciones_activas,
      p.numero_beneficiarios_proyecto AS cupo_base,
      ROUND(p.numero_beneficiarios_proyecto * 1.1) AS cupo_maximo,
      CASE 
        WHEN (
          SELECT COUNT(*) 
          FROM Postulacion pos 
          WHERE pos.id_proyecto = p.id_proyecto AND pos.status NOT IN ('rechazada', 'cancelada')
        ) >= ROUND(p.numero_beneficiarios_proyecto * 1.1)
        THEN 'Lleno'
        ELSE 'Disponible'
      END AS estado_postulacion
    FROM Proyecto p
    JOIN Periodo per ON per.id_periodo = p.id_periodo
    WHERE p.status_proyecto = 'Aprobado'
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener proyectos:', err);
      return res.status(500).json({ message: 'Error al obtener proyectos' });
    }
    res.json(results);
  });
});


app.get('/proyectoss/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Proyecto p JOIN Periodo per ON per.id_periodo = p.id_periodo WHERE p.id_proyecto = ?', [id], (err, results) => {
      if (err) {
        console.error('Error al obtener socio:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Proyecto no encontrado' });
      }
      res.json(results[0]);
    });
  });

  // Obtener postulaciones por id_proyecto
app.get('/proyectos/:id/postulaciones', (req, res) => {
  const idProyecto = req.params.id;
  const sql = `
    SELECT p.*, e.nombre AS nombre_estudiante
    FROM Postulacion p
    JOIN Estudiante e ON p.id_estudiante = e.id_estudiante
    WHERE p.id_proyecto = ?
  `;
  db.query(sql, [idProyecto], (err, results) => {
    if (err) {
      console.error('Error al obtener postulaciones:', err);
      return res.status(500).send('Error del servidor');
    }
    res.json(results);
  });
});


app.get('/proyectos/:id_socio', verifyToken, (req, res) => {
  const idSocio = req.user.id; // Esto es correcto si verifyToken setea req.user.id
  const { status } = req.query;

  let query = `
    SELECT P.*, 
           E.nombre AS estudiante_nombre, 
           E.correo AS estudiante_correo
    FROM Proyecto P
    LEFT JOIN Postulacion Po ON P.id_proyecto = Po.id_proyecto
    LEFT JOIN Estudiante E ON Po.id_estudiante = E.id_estudiante
    WHERE P.id_socio = ?
  `;

  const queryParams = [idSocio];

  if (status && status !== 'todos') {
    query += ' AND P.status_proyecto = ?';
    queryParams.push(status);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error al obtener proyectos:', err);
      return res.status(500).json({ message: 'Error al obtener proyectos' });
    }

    res.json(results);
  });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});