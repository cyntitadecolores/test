const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const dotenv = require("dotenv")
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

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
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token
    req.user = verified; // Guarda la información decodificada del token
    next(); // Llama al siguiente middleware o ruta
  } catch (error) {
    res.status(400).json({ message: 'Token inválido' });
  }
};

  
// Obtener todos los usuarios
app.get('/administradores', (req, res) => {
    db.query('SELECT * FROM Administrador', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener administradores' });
        res.json(results);
    });
});

app.get('/socios', (req, res) => {
    db.query('SELECT * FROM Socio', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener socios' });
        res.json(results);
    });
});

app.get('/estudiantes', (req, res) => {
    db.query('SELECT * FROM Estudiante ', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener estudiantes' });
        res.json(results);
    })
    console.log("✅ Conectado a MySQL");
});


app.get("/data", (req, res) => {
    const sql = "SELECT * FROM status_tabla"; 
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener datos:", err);
            res.status(500).json({ error: "Error al obtener datos" });
            return;
        }
        res.json(results); 

    });
});


//Endpoint paginas socio


  // Configuración de Multer para almacenamiento de archivos
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');  // Asegúrate de crear la carpeta 'uploads' en tu servidor
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));  // Usa el timestamp para el nombre del archivo
    }
  });

  const upload = multer({ storage: storage });
  
  app.post("/proyecto", upload.single('imagen'), (req, res) => {
    const {
        id_socio, // Obtener el id_socio
        nombre_proyecto,
        modalidad,
        direccion_escrita,
        cupos_disponibles,
        campus,  // Este es el ID del campus
        ods,  // Este es el ID del ODS
        problema_social,
        vulnerabilidad_atendida,
        edad_poblacion,
        zona_poblacion,
        numero_beneficiarios_proyecto,
        objetivo_proyecto,
        acciones_estudiantado,
        valor_proyecto,
        dias_actividades,
        carreras_proyecto,
        habilidades_alumno,
    } = req.body;
  
    const img_proyecto = req.file ? `/uploads/${req.file.filename}` : null;  // La URL de la imagen cargada
    
    // Verificar si los datos requeridos están presentes
    if (!nombre_proyecto || !modalidad || !direccion_escrita || !cupos_disponibles || !campus || !ods) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }
  
    // Consulta SQL para insertar los datos del proyecto en la base de datos
    const query =
      "INSERT INTO Proyecto (id_socio, status_proyecto, img_proyecto,  nombre_proyecto, modalidad, direccion_escrita, cupos_disponibles, id_campus, id_ods, problema_social, vulnerabilidad_atendida, edad_poblacion, zona_poblacion, numero_beneficiarios_proyecto, objetivo_proyecto, acciones_estudiantado, valor_proyecto, dias_actividades, carreras_proyecto, habilidades_alumno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    const values = [
      id_socio, // Guardar el ID del socio
      'pendiente',
      img_proyecto,
      nombre_proyecto,
      modalidad,
      direccion_escrita,
      cupos_disponibles,
      campus,  // Aquí se inserta el ID del campus
      ods,  // Aquí se inserta el ID del ODS
      problema_social,
      vulnerabilidad_atendida,
      edad_poblacion,
      zona_poblacion,
      numero_beneficiarios_proyecto,
      objetivo_proyecto,
      acciones_estudiantado,
      valor_proyecto,
      dias_actividades,
      carreras_proyecto,
      habilidades_alumno,
    ];
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("❌ Error al registrar el proyecto:", err);
        return res.status(500).json({ message: "Error al registrar el proyecto" });
      }
  
      res.status(200).json({ message: "Proyecto creado exitosamente" });
      });
  });
    

  // Obtener campus
  app.get("/campus", (req, res) => {
    db.query("SELECT * FROM Campus", (err, results) => {
      if (err) {
        console.error("❌ Error al obtener campus:", err);
        return res.status(500).json({ message: "Error al obtener campus" });
      }
      res.json(results);
    });
  });
  
  // Obtener ODS
  app.get("/ods", (req, res) => {
    db.query("SELECT * FROM ODS", (err, results) => {
      if (err) {
        console.error("❌ Error al obtener ODS:", err);
        return res.status(500).json({ message: "Error al obtener ODS" });
      }
      res.json(results);
    });
  });

  // Obtener estudiantes postulados a un proyecto específico
// 🚀 MySQL 8+: la agrupación se resuelve en la propia consulta

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
      'estudiante_carrera', C.nombre_carrera,
      'fecha_postulacion_estudiante', Po.fecha_postulacion_estudiante,
      'expectativa', Po.expectativa,
      'razon', Po.razon,
      'motivo', Po.motivo
    )
  ) AS alumnos_postulados
FROM Proyecto P
JOIN Postulacion Po ON P.id_proyecto = Po.id_proyecto
JOIN Estudiante E ON Po.id_estudiante = E.id_estudiante
JOIN carrera C ON E.id_carrera = C.id_carrera
WHERE P.id_socio = ? AND Po.status = 'pendiente'
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


// app.get('/proyecto/:id_socio/postulados', (req, res) => {
//   const { id_socio } = req.params;

//   const query = `
//     SELECT
//       P.id_proyecto,
//       P.nombre_proyecto,
//       JSON_ARRAYAGG(
//         JSON_OBJECT(
//           'id_estudiante',     E.id_estudiante,
//           'estudiante_nombre', E.nombre,
//           'estudiante_correo', E.correo
//         )
//       ) AS alumnos_postulados
//     FROM Proyecto P
//     JOIN Postulacion Po ON P.id_proyecto = Po.id_proyecto
//     JOIN Estudiante  E  ON Po.id_estudiante = E.id_estudiante
//     WHERE P.id_socio = ? AND Po.status = 'pendiente'
//     GROUP BY P.id_proyecto, P.nombre_proyecto;
//   `;

//   db.query(query, [id_socio], (err, rows) => {
//     if (err) {
//       console.error('❌ Error al obtener estudiantes postulados:', err);
//       return res.status(500).json({ message: 'Error al obtener estudiantes postulados' });
//     }
//     // rows ya tiene la estructura [{ id_proyecto, nombre_proyecto, alumnos_postulados: [...] }, ...]
//     res.json(rows);
//   });
// });


app.put('/postulacion/:id_proyecto/:id_estudiante', (req, res) => {
  const { id_proyecto, id_estudiante } = req.params;
  const { status } = req.body;

  // Verificar que los parámetros sean válidos
  if (!id_proyecto || !id_estudiante) {
    return res.status(400).json({ message: 'Faltan parámetros para actualizar la postulación' });
  }

  // ✓ Whitelist de estados válidos
  const estadosValidos = ['pendiente', 'aceptado', 'rechazado'];
  if (!estadosValidos.includes(status)) {
    return res.status(400).json({ message: 'Estado no permitido' });
  }

  const query = `
    UPDATE Postulacion
       SET status = ?
     WHERE id_proyecto = ? AND id_estudiante = ?;
  `;

  db.query(query, [status, id_proyecto, id_estudiante], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar el status de la postulación:', err);
      return res.status(500).json({ message: 'Error al actualizar el status' });
    }
    res.json({ message: 'Status actualizado correctamente' });
  });
});


app.get('/proyectos/:id_socio', (req, res) => {
  const { id_socio } = req.params;
  const { status } = req.query; // Obtiene el status de la consulta (opcional)

  let query = `
    SELECT P.*, 
           E.nombre AS estudiante_nombre, 
           E.correo AS estudiante_correo
    FROM Proyecto P
    LEFT JOIN Postulacion Po ON P.id_proyecto = Po.id_proyecto
    LEFT JOIN Estudiante E ON Po.id_estudiante = E.id_estudiante
    WHERE P.id_socio = ?
  `;

  const queryParams = [id_socio];

  // Si el status es "todos", no agregues el filtro por estado
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