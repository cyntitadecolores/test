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
const verifyToken = require('./auth'); 

// Administradores
app.get('/administradores', (req, res) => {
  db.query('SELECT * FROM Administrador', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener administradores' });
    res.json(results);
  });
});

// Obtener postulaciones alumnos En revisión  --tiene pruebas 5
app.get('/postulaciones_alumnos', (req, res) => {
    db.query('SELECT * FROM Postulacion JOIN Proyecto ON Postulacion.id_proyecto = Proyecto.id_proyecto JOIN estudiante ON postulacion.id_estudiante = estudiante.id_estudiante ', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener postulaciones' });
        res.json(results);
    });
});

// Actualizar el status de una postulacion de alumnos  --tiene pruebas 4
  app.put('/postulaciones_alumnos/:id_proyecto/:id_estudiante/status', (req, res) => {
    const { id_proyecto, id_estudiante } = req.params;
    const { status } = req.body;

    db.query('UPDATE Postulacion SET status = ? WHERE id_proyecto = ? AND id_estudiante = ?', [status, id_proyecto, id_estudiante], (err, result) => {
        if (err) {
            console.error('Error al actualizar el status:', err);
            return res.status(500).json({ message: 'Error al actualizar status' });
        }
        res.json({ message: 'Status actualizado correctamente' });
    });
});

// Editar valores de las postulaciones  -- tiene pruebas 9
app.put('/postulaciones_alumnos/:id_proyecto/:id_estudiante/editar', (req, res) => {
    const { id_proyecto, id_estudiante } = req.params;  
    const { columna, nuevoValor } = req.body;  
    
    if (!columna || nuevoValor === undefined) {
        return res.status(400).json({ message: 'Faltan datos para actualizar' });
    }

    const sql = `UPDATE Postulacion SET \`${columna}\` = ? WHERE id_proyecto = ? AND id_estudiante = ?`;

    db.query(sql, [nuevoValor, id_proyecto, id_estudiante], (err, result) => {
        if (err) {
            console.error('❌ Error al actualizar postulacion:', err);
            return res.status(500).json({ message: 'Error al actualizar la postulacion' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Postulacion no encontrada' });
        }
        res.json({ message: 'Postulacion actualizada exitosamente' });
    });
});

// Obtener proyectos aprobados con el periodo -- tiene pruebas 8 
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
      CAST(p.num_beneficiarios_osf AS UNSIGNED) AS cupo_base,
      ROUND(CAST(p.num_beneficiarios_osf AS UNSIGNED) * 1.1) AS cupo_maximo,
      CASE 
        WHEN (
          SELECT COUNT(*) 
          FROM Postulacion pos 
          WHERE pos.id_proyecto = p.id_proyecto AND pos.status NOT IN ('rechazada', 'cancelada')
        ) >= ROUND(CAST(p.num_beneficiarios_osf AS UNSIGNED) * 1.1)
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

// ya tiene pruebas 7
app.get('/proyectoss/:id', (req, res) => { 
    const { id } = req.params;
    db.query('SELECT * FROM Proyecto p JOIN periodo per ON per.id_periodo = p.id_periodo WHERE p.id_proyecto = ?', [id], (err, results) => {
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

// Obtener postulaciones por id_proyecto -- ya tiene pruebas 10
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



// Obtener proyectos pendientes

app.get('/proyectos', (req, res) => {
    db.query(`
        SELECT * 
        FROM Proyecto 
        JOIN socio ON Proyecto.id_socio = socio.id_socio
        JOIN periodo ON Proyecto.id_periodo = periodo.id_periodo  
        JOIN campus ON Proyecto.id_campus = campus.id_campus 
        JOIN ods ON Proyecto.ods_osf = ods.id_ods 
    `, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener proyectos' });
        res.json(results);
    });
});


// Editar valores del proyecto
app.put('/proyecto/:id/editar', (req, res) => {
    const { id } = req.params;  
    const { columna, nuevoValor } = req.body;  

    // ✅ Aquí puedes loguear lo que recibe el backend
    console.log('Backend recibió:', { columna, nuevoValor });

    if (!columna || nuevoValor === undefined) {
        return res.status(400).json({ message: 'Faltan datos para actualizar' });
    }

    const sql = `UPDATE Proyecto SET \`${columna}\` = ? WHERE id_proyecto = ?`;
    db.query(sql, [nuevoValor, id], (err, result) => {
        if (err) {
            console.error('❌ Error al actualizar proyecto:', err);
            return res.status(500).json({ message: 'Error al actualizar el proyecto' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json({ message: 'Proyecto actualizado exitosamente' });
    });
});


// Actualizar el status de un proyecto
app.put('/proyecto/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    db.query('UPDATE Proyecto SET status_proyecto = ? WHERE id_proyecto = ?', [status, id], (err, result) => {
      if (err) {
        console.error('Error al actualizar el status:', err);
        return res.status(500).json({ message: 'Error al actualizar status' });
      }
      res.json({ message: 'Status actualizado correctamente' });
    });
  });

//obtener socios aprobados -- ya tiene pruebas 10
app.get('/socioaceptados', (req, res) => {
  const query = 'SELECT * FROM Socio WHERE status = "Aceptado"';

  db.query(query, async (err, socios) => {
    if (err) {
      console.error('Error al obtener socios Aceptados:', err);
      return res.status(500).json({ message: 'Error al obtener socios' });
    }

    // Procesar cada socio para verificar si es estudiante o entidad
    const sociosConDetalles = await Promise.all(socios.map(socio => {
      return new Promise((resolve, reject) => {
        const queryEstudiante = 'SELECT * FROM SOCIO_ESTUDIANTE WHERE id_socio = ?';
        db.query(queryEstudiante, [socio.id_socio], (err, estudianteResults) => {
          if (err) {
            console.error('Error al obtener detalles del estudiante:', err);
            return reject(err);
          }

          if (estudianteResults.length > 0) {
            // Es estudiante
            resolve({
              ...socio,
              tipo_socio: 'Estudiante',
              detalles: estudianteResults[0]
            });
          } else {
            // Es entidad
            resolve({
              ...socio,
              tipo_socio: 'Entidad',
              detalles: {
                nombre_entidad: socio.nombre_osf,
                mision: socio.mision,
                vision: socio.vision,
                objetivos: socio.objetivos,
                poblacion: socio.poblacion_osf,
                numero_beneficiarios_socio: socio.num_beneficiarios_osf,
                nombre_responsable: socio.nombre_representante,
                puesto_responsable: socio.puesto_representante,
                correo_responsable: socio.correo,
                objetivo_ods_socio: socio.id_ods
              }
            });
          }
        });
      });
    }));

    res.json(sociosConDetalles);
  });
});

//obtener socio En revisión -- tiene pruebas 10
app.get('/socio/pendiente', (req, res) => {
  db.query('SELECT * FROM socio WHERE status = "En revisión"', (err, results) => {
    if (err) {
      console.error('Error al obtener socios En revisión:', err);
      return res.status(500).json({ message: 'Error al obtener socios' });
    }
    res.json(results);
  });
});

app.get('/socio/:id', (req, res) => {
  const { id } = req.params;

  const querySocio = 'SELECT * FROM Socio WHERE id_socio = ?';
  db.query(querySocio, [id], (err, socioResults) => {
    if (err) return res.status(500).json({ message: 'Error del servidor' });
    if (socioResults.length === 0) return res.status(404).json({ message: 'Socio no encontrado' });

    const socio = socioResults[0];

    // Ahora solo verificamos si el socio existe en la tabla SOCIO_ESTUDIANTE
    const queryEstudiante = 'SELECT * FROM SOCIO_ESTUDIANTE WHERE id_socio = ?';
    db.query(queryEstudiante, [id], (err, estudianteResults) => {
      if (err) return res.status(500).json({ message: 'Error al obtener detalles de estudiante' });

      if (estudianteResults.length > 0) {
        // Si hay resultados, es un estudiante
        return res.json({
          ...socio,
          tipo_socio: 'Estudiante',
          detalles: estudianteResults[0]
        });
      } else {
        // Si no hay resultados, es una entidad
        return res.json({
          ...socio,
          tipo_socio: 'Entidad',
          detalles: {}
        });
      }
    });
  });
});


  
  // Actualizar el status de un socio -- ya tiene pruebas 10
  app.put('/socio/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    db.query('UPDATE Socio SET status = ? WHERE id_socio = ?', [status, id], (err, result) => {
      if (err) {
        console.error('Error al actualizar el status:', err);
        return res.status(500).json({ message: 'Error al actualizar status' });
      }
      res.json({ message: 'Status actualizado correctamente' });
    });
  });


// Registro de administrador -- ya tiene pruebas 10
app.post('/registro/administrador', (req, res) => {
    const { correo, password, nombre } = req.body;

    // Validar que el correo no exista
    db.query('SELECT * FROM Administrador WHERE correo = ?', [correo], (err, result) => {
        if (err) {
        return res.status(500).json({ message: 'Error en la base de datos' });
        }

        if (result.length > 0) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Si el correo no existe, validar la contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.' });
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ message: 'Error al encriptar contraseña' });

            db.query(
                'INSERT INTO Administrador (correo, contraseña, nombre) VALUES (?, ?, ?)',

                [correo, hash, nombre],
                (err, result) => {
                    if (err) {
                        console.error('Error al registrar administrador:', err);
                        return res.status(500).json({ message: 'Error al registrar administrador' });
                    }
                    res.json({ message: 'Administrador registrado exitosamente' });
            });
        });
    });
});

const PORT = 5003;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});


// Obtener todos los proyectos con búsqueda y filtros --tiene pruebas 10
app.get('/proyectos_admin', (req, res) => {
  const { search = '', periodo, status_proyecto, status_actividad } = req.query;

  let sql = `
    SELECT * FROM Proyecto
    WHERE (
      nombre_proyecto LIKE ? OR
      razon_osf LIKE ? OR
      problema_social LIKE ? OR
      acciones_estudiantado LIKE ? OR
      contacto_coordinador LIKE ?
    )
  `;
  const params = Array(5).fill(`%${search}%`);

  if (periodo) {
    sql += ' AND id_periodo = ?';
    params.push(periodo);
  }

  if (status_proyecto) {
    sql += ' AND status_proyecto = ?';
    params.push(status_proyecto);
  }

  if (status_actividad !== undefined) {
    sql += ' AND status_actividad = ?';
    params.push(status_actividad);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener proyectos:', err);
      return res.status(500).json({ message: 'Error al obtener proyectos' });
    }
    res.json(results);
  });
});


// Actualizar varios campos del proyecto desde una tabla editable -- tiene pruebas 10
app.put('/proyectos_admin/:id', (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  const keys = Object.keys(campos);
  const values = Object.values(campos);

  if (keys.length === 0) {
    return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
  }

  const setString = keys.map(key => `\`${key}\` = ?`).join(', ');
  const sql = `UPDATE Proyecto SET ${setString} WHERE id_proyecto = ?`;

  db.query(sql, [...values, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar el proyecto:', err);
      return res.status(500).json({ message: 'Error al actualizar el proyecto' });
    }
    res.json({ message: 'Proyecto actualizado exitosamente' });
  });
});