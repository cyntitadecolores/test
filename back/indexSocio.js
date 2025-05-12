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


// Registro de alumno
app.post('/registro/alumno', (req, res) => {
    const { correo, contraseña, nombre, matricula, id_carrera, semestre, id_campus, doble_titulacion, candidato_graduar, telefono } = req.body;

    if (!correo || !contraseña || !nombre || !matricula || !id_carrera || !semestre || telefono === undefined || doble_titulacion === undefined || candidato_graduar === undefined) {
        return res.status(400).json({ message: 'Faltan datos' });
    }
    
    // Validar que el teléfono sea numérico y tenga al menos 10 caracteres
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(telefono)) {
        return res.status(400).json({ message: 'El teléfono debe ser numérico y tener al menos 10 dígitos' });
    }

    // Validar que el correo no exista
    db.query('SELECT * FROM Estudiante WHERE correo = ?', [correo], (err, result) => {
        if (err) {
        return res.status(500).json({ message: 'Error en la base de datos' });
        }

        if (result.length > 0) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Si el correo no existe, validar la contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(contraseña)) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.' });
        }
        bcrypt.hash(contraseña, 10, (err, hash) => {
            if (err) return res.status(500).json({ message: 'Error al encriptar contraseña' });

            db.query(
                'INSERT INTO estudiante (correo, contraseña, nombre, matricula, id_carrera, semestre, doble_titulacion, id_campus, candidato_graduar, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)',
                [correo, hash, nombre, matricula, id_carrera, semestre, doble_titulacion, id_campus, candidato_graduar, telefono],
                (err, result) => {
                    if (err) {
                        console.error('Error al registrar alumno:', err);
                        return res.status(500).json({ message: 'Error al registrar al alumno' });
                    }
                    res.json({ message: 'Alumno registrado exitosamente' });
        
            });
        });
    });
});

// Registro de administrador
app.post('/registro/administrador', (req, res) => {
    const { correo, contraseña, nombre } = req.body;

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
        if (!passwordRegex.test(contraseña)) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.' });
        }

        bcrypt.hash(contraseña, 10, (err, hash) => {
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

app.post('/registro/socio', (req, res) => {
  const {
      correo,
      contraseña,
      nombre,
      tipo_socio, // "Estudiante" o "Entidad"
      telefono_socio,
      redes_sociales,
      notificaciones_socio,
      // Datos para Socio_Estudiante
      id_carrera,
      matricula,
      semestre_acreditado,
      correo_institucional,
      correo_alternativo,
      ine,
      logo,
      // Datos para Socio_Entidad
      nombre_entidad,
      mision,
      vision,
      objetivos,
      objetivo_ods_socio,
      poblacion,
      numero_beneficiarios_socio,
      nombre_responsable,
      puesto_responsable,
      correo_responsable,
      direccion_entidad,
      horario_entidad,
      correo_entidad,
      correo_responsable_general,
      telefono_entidad
  } = req.body;

  if (!correo || !contraseña || !nombre || !tipo_socio) {
      return res.status(400).json({ message: 'Faltan datos obligatorios de Socio' });
  }

  // Primero valida que no exista el correo
  db.query('SELECT * FROM Socio WHERE correo = ?', [correo], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error en la base de datos' });

      if (result.length > 0) {
          return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
      }

      // Encriptar contraseña
      bcrypt.hash(contraseña, 10, (err, hash) => {
          if (err) return res.status(500).json({ message: 'Error al encriptar contraseña' });

          // Insertar en tabla Socio
          const socioQuery = `
              INSERT INTO Socio (correo, contraseña, nombre, status, tipo_socio, telefono_socio, redes_sociales, notificaciones_socio)
              VALUES (?, ?, ?, 'pendiente', ?, ?, ?, ?)
          `;
          const socioValues = [
              correo,
              hash,
              nombre,
              tipo_socio,
              telefono_socio || null,
              redes_sociales || null,
              notificaciones_socio || null
          ];

          db.query(socioQuery, socioValues, (err, result) => {
              if (err) {
                  console.error('Error al registrar socio:', err);
                  return res.status(500).json({ message: 'Error al registrar socio' });
              }

              const id_socio = result.insertId;

              if (tipo_socio === 'Estudiante') {
                  const estudianteQuery = `
                      INSERT INTO Socio_Estudiante (id_socio, id_carrera, matricula, semestre_acreditado, correo_institucional, correo_alternativo, ine, logo)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `;
                  const estudianteValues = [
                      id_socio,
                      id_carrera,
                      matricula,
                      semestre_acreditado,
                      correo_institucional,
                      correo_alternativo,
                      ine,
                      logo
                  ];
                  db.query(estudianteQuery, estudianteValues, (err) => {
                      if (err) {
                          console.error('Error al registrar socio estudiante:', err);
                          return res.status(500).json({ message: 'Error al registrar socio estudiante' });
                      }
                      return res.json({ message: 'Socio estudiante registrado exitosamente' });
                  });

              } else if (tipo_socio === 'Entidad') {
                  const entidadQuery = `
                      INSERT INTO Socio_Entidad (
                          id_socio, nombre_entidad, mision, vision, objetivos, objetivo_ods_socio,
                          poblacion, numero_beneficiarios_socio, nombre_responsable, puesto_responsable,
                          correo_responsable, direccion_entidad, horario_entidad, correo_entidad,
                          correo_responsable_general, telefono_entidad
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `;
                  const entidadValues = [
                      id_socio,
                      nombre_entidad,
                      mision,
                      vision,
                      objetivos,
                      objetivo_ods_socio,
                      poblacion,
                      numero_beneficiarios_socio,
                      nombre_responsable,
                      puesto_responsable,
                      correo_responsable,
                      direccion_entidad,
                      horario_entidad,
                      correo_entidad,
                      correo_responsable_general,
                      telefono_entidad
                  ];
                  db.query(entidadQuery, entidadValues, (err) => {
                      if (err) {
                          console.error('Error al registrar socio entidad:', err);
                          return res.status(500).json({ message: 'Error al registrar socio entidad' });
                      }
                      return res.json({ message: 'Socio entidad registrado exitosamente' });
                  });

              } else {
                  return res.status(400).json({ message: 'Tipo de socio no válido' });
              }
          });
      });
  });
});



// Obtener socios pendientes
app.get('/socio/pendiente', (req, res) => {
    db.query('SELECT id_socio, nombre, correo, status FROM Socio WHERE status = "pendiente"', (err, results) => {
      if (err) {
        console.error('Error al obtener socios pendientes:', err);
        return res.status(500).json({ message: 'Error al obtener socios' });
      }
      res.json(results);
    });
  });
  
  // Actualizar el status de un socio
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

  // Ruta de login
  app.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;
  
    const usuarios = [
      { tabla: 'Estudiante' },
      { tabla: 'Administrador' },
      { tabla: 'Socio' }
    ];
  
    let index = 0;
  
    const buscarUsuario = () => {
      if (index >= usuarios.length) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
  
      const { tabla } = usuarios[index];
  
      db.query(`SELECT * FROM ${tabla} WHERE correo = ?`, [correo], (err, results) => {
        if (err) {
          console.error(`❌ Error buscando en ${tabla}:`, err);
          return res.status(500).json({ message: 'Error del servidor' });
        }
  
        if (results.length === 0) {
          index++;
          buscarUsuario();
        } else {
          const usuario = results[0];
  
          // Si es socio y su status no es "aceptado", rechazar login
          if (tabla === 'Socio' && usuario.status !== 'aceptado') {
            return res.status(403).json({ message: 'Tu cuenta aún no ha sido aceptada' });
          }
  
          bcrypt.compare(contraseña, usuario.contraseña, (err, esValido) => {
            if (err) return res.status(500).json({ message: 'Error al verificar contraseña' });
  
            if (esValido) {
              // Generar JWT
              const token = jwt.sign(
                { id: usuario.id_socio, tipo: tabla.toLowerCase() }, // Datos del usuario a incluir
                process.env.JWT_SECRET, // Llave secreta para firmar el token
                { expiresIn: '1h' } // El token expirará en 1 hora
              );
  
              return res.json({
                message: 'Login exitoso',
                token, // Enviar el token al frontend
                tipo: tabla.toLowerCase(),
                datos: usuario
              });
            } else {
              return res.status(401).json({ message: 'Contraseña incorrecta' });
            }
          });
        }
      });
    };
  
    buscarUsuario();
  });
  

//obtener socios aprobados
app.get('/socio/aprobados', (req, res) => {
    db.query('SELECT id_socio, nombre, correo, tipo_socio FROM Socio WHERE status = "Aceptado"', (err, results) => {
      if (err) {
        console.error('Error al obtener socios Aceptados:', err);
        return res.status(500).json({ message: 'Error al obtener socios' });
      }
      res.json(results);
    });
  });

// Obtener info individual del socio, incluyendo detalles según tipo
app.get('/socio/:id', (req, res) => {
  const { id } = req.params;

  const querySocio = 'SELECT * FROM Socio WHERE id_socio = ?';
  db.query(querySocio, [id], (err, socioResults) => {
    if (err) return res.status(500).json({ message: 'Error del servidor' });
    if (socioResults.length === 0) return res.status(404).json({ message: 'Socio no encontrado' });

    const socio = socioResults[0];

    if (socio.tipo_socio === 'Entidad') {
      const queryEntidad = 'SELECT * FROM Socio_Entidad WHERE id_socio = ?';
      db.query(queryEntidad, [id], (err, entidadResults) => {
        if (err) return res.status(500).json({ message: 'Error al obtener detalles de entidad' });
        res.json({ ...socio, detalles: entidadResults[0] });
      });
    } else if (socio.tipo_socio === 'Estudiante') {
      const queryEstudiante = 'SELECT * FROM Socio_Estudiante WHERE id_socio = ?';
      db.query(queryEstudiante, [id], (err, estudianteResults) => {
        if (err) return res.status(500).json({ message: 'Error al obtener detalles de estudiante' });
        res.json({ ...socio, detalles: estudianteResults[0] });
      });
    } else {
      res.json(socio);
    }
  });
});


  
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

// Obtener proyectos pendientes
app.get('/proyectos', (req, res) => {
    db.query('SELECT * FROM Proyecto JOIN socio ON proyecto.id_socio = socio.id_socio JOIN campus ON proyecto.id_campus = campus.id_campus JOIN ods ON proyecto.id_ods = ods.id_ods WHERE status_proyecto = "pendiente"', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener proyectos' });
        res.json(results);
    });
});

// Obtener postulaciones alumnos pendientes
app.get('/postulaciones_alumnos', (req, res) => {
    db.query('SELECT * FROM Postulacion JOIN Proyecto ON Postulacion.id_proyecto = Proyecto.id_proyecto JOIN estudiante ON postulacion.id_estudiante = estudiante.id_estudiante WHERE postulacion.status = "pendiente"', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener postulaciones' });
        res.json(results);
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

  // Actualizar el status de una postulacion de alumnos
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


// Editar valores del proyecto
  app.put('/proyecto/:id/editar', (req, res) => {
    const { id } = req.params;  
    const { columna, nuevoValor } = req.body;  
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

// Editar valores de las postulaciones
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
    WHERE p.status_proyecto = 'aceptado'
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