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

app.get('/postulaciones', verifyToken, (req, res) => {
  const idEstudiante = req.user.id;

  const query = `
    SELECT 
      p.id_proyecto,
      pr.nombre_proyecto,
      pr.direccion_escrita,
      p.fecha_postulacion,
      p.status,
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

// Obtener proyectos En revisión
app.get('/proyectos', (req, res) => {
    db.query(`
        SELECT * 
        FROM Proyecto 
        JOIN socio ON Proyecto.id_socio = socio.id_socio 
        JOIN campus ON Proyecto.id_campus = campus.id_campus 
        JOIN ods ON Proyecto.ods_osf = ods.id_ods 
    `, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener proyectos' });
        res.json(results);
    });
});

const PORT = 5004;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});