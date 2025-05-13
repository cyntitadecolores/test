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

app.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;
  
  // Array de tablas a verificar
  const usuarios = ['Estudiante', 'Administrador', 'Socio'];

  let index = 0;
  
  // Función para realizar la búsqueda del usuario
  const buscarUsuario = () => {
    if (index >= usuarios.length) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    
    const tabla = usuarios[index];
    
    db.query(`SELECT * FROM ${tabla} WHERE correo = ?`, [correo], (err, results) => {
      if (err) {
        console.error(`❌ Error buscando en ${tabla}:`, err);
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (results.length === 0) {
        index++;
        buscarUsuario(); // Buscar en la siguiente tabla
      } else {
        const usuario = results[0];

        // Si es socio y su status no es "aceptado", rechazar login
        if (tabla === 'Socio' && usuario.status !== 'aceptado') {
          return res.status(403).json({ message: 'Tu cuenta aún no ha sido aceptada' });
        }

        // Comparar la contraseña
        bcrypt.compare(contraseña, usuario.contraseña, (err, esValido) => {
          if (err) return res.status(500).json({ message: 'Error al verificar contraseña' });

          if (esValido) {
            // Generar JWT
            const token = jwt.sign(
              { id: usuario.id_socio || usuario.id_estudiante || usuario.id_administrador, tipo: tabla.toLowerCase() }, // Cambié para que también funcione con Estudiante y Administrador
              process.env.JWT_SECRET,
              { expiresIn: '1h' }
            );

            return res.json({
              message: 'Login exitoso',
              token,
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

  buscarUsuario(); // Iniciar búsqueda
});

  
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});