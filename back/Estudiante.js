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
    const verified = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = verified; 
    next(); 
  } catch (error) {
    res.status(400).json({ message: 'Token inválido' });
  }
};


// Estudiantes
app.get('/estudiantes', (req, res) => {
  const sql = `
    SELECT E.*, C.nombre AS nombre_carrera, CA.campus AS nombre_campus
    FROM Estudiante E
    LEFT JOIN Carrera C ON E.id_carrera = C.id_carrera
    LEFT JOIN Campus CA ON E.id_campus = CA.id_campus
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener estudiantes' });
    res.json(results);
  });
});

app.get('/postulaciones', verifyToken, (req, res) => {
  const idEstudiante = req.user.id;

  const query = `
    SELECT 
      p.id_proyecto,
      pr.nombre_proyecto,
      pr.direccion_escrita,
      p.fecha_postulacion,
      p.status,
      pr.id_periodo, 
      p.expectativa,
      p.razon,
      p.motivo,
      p.pregunta_descarte,
      p.Nota
    FROM Postulacion p
    JOIN Proyecto pr ON p.id_proyecto = pr.id_proyecto
    WHERE p.id_estudiante = ?
  `;

  db.query(query, [idEstudiante], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener postulaciones:", err);
      return res.status(500).json({ message: 'Error del servidor' });
    }
    res.json(results);
  });
});

app.post('/postular', verifyToken, (req, res) => {
  const idEstudiante = req.user.id;
  const { id_proyecto, expectativa, razon, motivo, preguntaDescarte, nota } = req.body;

  const campos = { expectativa, razon, motivo, preguntaDescarte, nota };
  const errores = [];
  const caracteresProhibidos = /[<>{}$%]/;
  const longitudMin = 50;
  const longitudMax = 500;

  for (const [nombre, valor] of Object.entries(campos)) {
    if (!valor || valor.trim().length < longitudMin) {
      errores.push(`El campo "${nombre}" debe tener al menos ${longitudMin} caracteres.`);
    }
    if (valor.trim().length > longitudMax) {
      errores.push(`El campo "${nombre}" no debe exceder los ${longitudMax} caracteres.`);
    }
    if (caracteresProhibidos.test(valor)) {
      errores.push(`El campo "${nombre}" contiene caracteres no permitidos.`);
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({ mensaje: 'Errores de validación', errores });
  }

  // Verificar si ya existe una postulación de ese estudiante a ese proyecto
  const verificarSQL = `
    SELECT * FROM postulacion 
    WHERE id_estudiante = ? AND id_proyecto = ?
  `;

  db.query(verificarSQL, [idEstudiante, id_proyecto], (err, resultados) => {
    if (err) {
      console.error('Error al verificar postulación:', err);
      return res.status(500).json({ mensaje: 'Error al verificar postulación existente' });
    }

    if (resultados.length > 0) {
      return res.status(400).json({ mensaje: 'Ya te has postulado a este proyecto' });
    }

    // Si no existe, insertar la nueva postulación
    const insertarSQL = `
      INSERT INTO postulacion (
        id_estudiante, id_proyecto, fecha_postulacion, status,
        expectativa, razon, motivo, pregunta_descarte, nota
      ) VALUES (?, ?, NOW(), "En revisión", ?, ?, ?, ?, ?)
    `;

    db.query(insertarSQL, [
      idEstudiante, id_proyecto,
      expectativa, razon, motivo, preguntaDescarte, nota
    ], (err, result) => {
      if (err) {
        console.error('Error al insertar postulación:', err);
        return res.status(500).json({ mensaje: 'Error al postularse' });
      }
      res.json({ mensaje: 'Postulación registrada con éxito' });
    });
  });
});





// Obtener proyectos aprobados
app.get('/proyectos', (req, res) => {
    db.query(`
        SELECT * 
        FROM Proyecto 
        JOIN socio ON Proyecto.id_socio = socio.id_socio 
        JOIN campus ON Proyecto.id_campus = campus.id_campus
        JOIN periodo ON Proyecto.id_periodo = periodo.id_periodo
        JOIN ods ON Proyecto.ods_osf = ods.id_ods
        WHERE status_proyecto  = "Aprobado" AND status_actividad = 1
    `, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener proyectos' });
        res.json(results);
    });
});


app.get('/mis-postulaciones', verifyToken, (req, res) => {
  const idEstudiante = req.user.id;

  const sql = `
    SELECT p.id_proyecto, p.status, pr.id_periodo
    FROM postulacion p
    JOIN proyecto pr ON p.id_proyecto = pr.id_proyecto
    WHERE p.id_estudiante = ?
  `;

  db.query(sql, [idEstudiante], (err, resultados) => {
    if (err) {
      console.error('Error al obtener postulaciones:', err);
      return res.status(500).json({ mensaje: 'Error al obtener postulaciones' });
    }
    res.json(resultados);
  });
});


  app.put('/postulaciones_alumnos/:id_proyecto/status', verifyToken, (req, res) => {
    const { id_proyecto } = req.params;
    const id_estudiante = req.user.id; // sacado del token
    const { status } = req.body;

    if (status === 'Inscrito') {
      // Primero obtenemos el id_periodo del proyecto que quiere aceptar
      db.query(
        'SELECT id_periodo FROM Proyecto WHERE id_proyecto = ?',
        [id_proyecto],
        (err, proyectoResults) => {
          if (err) {
            console.error('Error al obtener proyecto:', err);
            return res.status(500).json({ message: 'Error al obtener proyecto' });
          }
          if (proyectoResults.length === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
          }

          const idPeriodoNuevo = proyectoResults[0].id_periodo;

          // Luego obtenemos los proyectos inscritos del estudiante con sus id_periodo
          db.query(
            `SELECT p.id_periodo FROM Postulacion ps
            JOIN Proyecto p ON ps.id_proyecto = p.id_proyecto
            WHERE ps.id_estudiante = ? AND ps.status = 'Inscrito'`,
            [id_estudiante],
            (err, postulacionesInscritas) => {
              if (err) {
                console.error('Error al obtener postulaciones inscritas:', err);
                return res.status(500).json({ message: 'Error al obtener postulaciones' });
              }

              // Definimos los empalmes
              const empalmes = {
                1: [1,4,6],
                2: [2,4,5,6],
                3: [3,5,6],
                4: [1,2,4,6,5],
                5: [2,3,4,6,6],
                6: [1,2,3,4,5,6],
              };

              // Revisamos conflictos
              for (const post of postulacionesInscritas) {
                const periodosEmpalmes = empalmes[post.id_periodo] || [];
                if (periodosEmpalmes.includes(idPeriodoNuevo)) {
                  return res.status(400).json({
                    message: `No puedes aceptar la postulacion porque tienes un proyecto inscrito en periodo ${post.id_periodo} que empalma con el periodo ${idPeriodoNuevo}`
                  });
                }
              }

              // No hay conflictos, actualizamos el status
              db.query(
                'UPDATE Postulacion SET status = ? WHERE id_proyecto = ? AND id_estudiante = ?',
                [status, id_proyecto, id_estudiante],
                (err, result) => {
                  if (err) {
                    console.error('Error al actualizar el status:', err);
                    return res.status(500).json({ message: 'Error al actualizar status' });
                  }
                  res.json({ message: 'Status actualizado correctamente' });
                }
              );
            }
          );
        }
      );
    } else {
      // Si el status no es 'Inscrito', actualizar directamente
      db.query(
        'UPDATE Postulacion SET status = ? WHERE id_proyecto = ? AND id_estudiante = ?',
        [status, id_proyecto, id_estudiante],
        (err, result) => {
          if (err) {
            console.error('Error al actualizar el status:', err);
            return res.status(500).json({ message: 'Error al actualizar status' });
          }
          res.json({ message: 'Status actualizado correctamente' });
        }
      );
    }
  });



const PORT = 5004;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});