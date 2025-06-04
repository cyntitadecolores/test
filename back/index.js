const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

// Middleware para verificar el JWT
const verifyToken = require('./auth'); 

const app = express();
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) console.error('Error al conectar a la base de datos:', err);
  else console.log('Conectado a la base de datos');
});



// Obtener lista de campus -- ya tiene pruebas 10
app.get('/campus', (req, res) => {
  db.query('SELECT id_campus, campus FROM Campus', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener campus' });
    res.json(results);
  });
});

// Obtener lista de carreras -- tiene pruebas 10
app.get('/carreras', (req, res) => {
  db.query('SELECT id_carrera, siglas_carrera, nombre FROM Carrera', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener carreras' });
    res.json(results);
  });
});

// Obtener lista de ODS -- tiene pruebas 10
app.get('/ods', (req, res) => {
  db.query('SELECT id_ods, nombre_ods FROM Ods', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener ODS' });
    res.json(results);
  });
});

// -- ya tiene pruebas 10
app.get('/poblaciones', (req, res) => {
  const sql = `SHOW COLUMNS FROM Socio LIKE 'poblacion_osf'`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener poblaciones:', err);
      return res.status(500).json({ error: 'Error al obtener poblaciones' });
    }

    // Extraer valores del tipo ENUM
    const enumStr = results[0].Type;
    const matches = enumStr.match(/enum\((.+)\)/i);

    if (!matches) {
      return res.status(500).json({ error: 'No se encontraron valores ENUM' });
    }

    const values = matches[1]
      .split(',')
      .map(val => val.trim().replace(/^'(.*)'$/, '$1'));

    res.json(values);
  });
});



// Endpoint para registro de estudiante y socio -- ya tiene pruebas 25
app.post('/signup', async (req, res) => {
  const { tipo, perfilSocio, ...data } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(data.contraseña, 10);

    if (tipo === 'estudiante') {
      const sql = `INSERT INTO Estudiante 
        (id_carrera, id_campus, correo, contraseña, nombre, matricula, semestre, doble_titulacion, candidato_graduar, telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        parseInt(data.id_carrera),
        parseInt(data.id_campus),
        data.correo,
        hashedPassword,
        data.nombre,
        data.matricula,
        data.semestre,
        data.doble_titulacion ? 1 : 0,
        data.candidato_graduar ? 1 : 0,
        data.telefono
      ];
      db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al registrar estudiante' });
        return res.json({ mensaje: 'Estudiante registrado exitosamente' });
      });

    } else if (tipo === 'socio' && perfilSocio === 'lider') {
      // Paso 1: Insertar socio base
      const sqlSocio = `
        INSERT INTO Socio (correo, contraseña, redes_sociales, telefono_osf, notificaciones, tipo_socio, status)
        VALUES (?, ?, ?, ?, ?, ?)`;

      const valuesSocio = [
        data.correo,
        hashedPassword,
        data.redes_sociales || '',
        data.telefono_osf,
        data.notificaciones ? 1 : 0,
        data.tipo_socio,
        'En revisión'
      ];

      db.query(sqlSocio, valuesSocio, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al registrar socio base' });

        const id_socio = result.insertId;

        const sqlEstudiante = `
          INSERT INTO SOCIO_ESTUDIANTE 
          (id_socio, nombre_socio, id_carrera, matricula, semestre_acreditado, ine, logo) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const valuesEstudiante = [
          id_socio,
          data.nombre_socio,
          parseInt(data.id_carrera),
          data.matricula,
          data.semestre,
          data.ine,
          data.logo
        ];

        db.query(sqlEstudiante, valuesEstudiante, (err2, result2) => {
          if (err2) return res.status(500).json({ error: 'Error al registrar socio estudiante' });
          return res.json({ mensaje: 'Socio estudiante registrado exitosamente' });
        });
      });

    } else if (tipo === 'socio') {
      const sqlSocio = `INSERT INTO Socio 
        (correo, contraseña, nombre_osf, telefono_osf, redes_sociales, vision, mision, objetivos, poblacion_osf, num_beneficiarios_osf, 
        id_ods, nombre_representante, puesto_representante, direccion_horario, notificaciones, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const valuesSocio = [
        data.correo,
        hashedPassword,
        data.nombre_osf,
        data.telefono_osf,
        data.redes_sociales,
        data.vision,
        data.mision,
        data.objetivos,
        data.poblacion_osf,
        data.num_beneficiarios_osf,
        data.id_ods,
        data.nombre_representante,
        data.puesto_representante,
        data.direccion_horario,
        data.notificaciones ? 1 : 0,
        'En revisión'
      ];

      db.query(sqlSocio, valuesSocio, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al registrar socio' });
        return res.json({ mensaje: 'Socio registrado exitosamente' });
      });

    } else {
      return res.status(400).json({ error: 'Tipo de usuario no válido' });
    }
  } catch (error) {
    console.error('Error en /signup:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para registro de administradores -- ya tiene pruebas 15
app.post('/signup/administrador', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  try {
    // Validar que los campos necesarios estén presentes
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ error: 'Faltan datos para el registro del administrador' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar el administrador en la base de datos
    const sql = 'INSERT INTO Administrador (correo, contraseña, nombre) VALUES (?, ?, ?)';
    const values = [correo, hashedPassword, nombre];

    db.query(sql, values, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al registrar administrador' });
      }
      return res.json({ mensaje: 'Administrador registrado exitosamente' });
    });

  } catch (error) {
    console.error('Error en /signup/administrador:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Endpoint Login -- ya tiene pruebas 15

app.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;

  const tablas = [
    { nombre: 'Estudiante', campoId: 'id_estudiante', rol: 'estudiante' },
    { nombre: 'Administrador', campoId: 'id_administrador', rol: 'administrador' },
    { nombre: 'Socio', campoId: 'id_socio', rol: 'socio' }
  ];

  const intentarLogin = (index = 0) => {
    if (index >= tablas.length) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const { nombre, campoId, rol } = tablas[index];
    const sql = `SELECT ${campoId}, correo, contraseña${rol === 'socio' ? ', status' : ''} FROM ${nombre} WHERE correo = ?`;

    db.query(sql, [correo], async (err, results) => {
      if (err) {
        console.error(`Error al buscar en ${nombre}:`, err);
        return res.status(500).json({ error: 'Error del servidor' });
      }

      if (results.length === 0) {
        return intentarLogin(index + 1); // Intenta con la siguiente tabla
      }

      const usuario = results[0];
      const contraseñaCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);

      if (!contraseñaCorrecta) {
        return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      }

      // Construir payload para JWT
      const payload = {
        id: usuario[campoId],
        tipo: rol,
      };

      if (rol === 'socio') {
        payload.status = usuario.status;
      }

      // Generar JWT
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Respuesta incluye status solo si es socio
      const responseData = {
        mensaje: 'Inicio de sesión exitoso',
        rol,
        token,
      };

      if (rol === 'socio') {
        responseData.status = usuario.status;
      }

      return res.json(responseData);
    });
  };

  intentarLogin();
});

// Obtener los datos de todos los usuarios

// Estudiantes -- ya tiene pruebas 15
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

// Administradores
app.get('/administradores', (req, res) => {
  db.query('SELECT * FROM Administrador', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener administradores' });
    res.json(results);
  });
});

// Socios OSF (organizaciones)
app.get('/socios-osf', (req, res) => {
  const sql = `
    SELECT S.*, O.nombre_ods 
    FROM Socio S
    LEFT JOIN Ods O ON S.id_ods = O.id_ods
    WHERE NOT EXISTS (SELECT 1 FROM SOCIO_ESTUDIANTE SE WHERE SE.id_socio = S.id_socio)
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener socios OSF' });
    res.json(results);
  });
});

// Socios Estudiantes (líderes sociales)
app.get('/socios-estudiantes', (req, res) => {
  const sql = `
    SELECT SE.*, S.correo, C.nombre AS nombre_carrera
    FROM SOCIO_ESTUDIANTE SE
    JOIN Socio S ON SE.id_socio = S.id_socio
    LEFT JOIN Carrera C ON SE.id_carrera = C.id_carrera
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener socios estudiantes' });
    res.json(results);
  });
});


 
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});