// back/auth.js

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(403).json({ mensaje: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1]; // extrae el token después de "Bearer"

  if (!token) return res.status(403).json({ mensaje: 'Token mal formateado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // guarda el usuario en la petición
    next(); // continúa con la ruta
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
}

module.exports = verifyToken;