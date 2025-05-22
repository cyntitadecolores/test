// src/components/navegacionS.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './navegacion.css';

function NavCub() {
  const navigate = useNavigate();
  const [socioNombre, setSocioNombre] = useState('');

  /* ───────── Obtener nombre del socio ───────── */
  useEffect(() => {
    const fetchSocio = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1. Decodificar el payload del JWT
        const payload   = JSON.parse(atob(token.split('.')[1]));
        const socioId   = payload.id;           // asegúrate de que tu backend guarda el id aquí

        // 2. Pedir la lista de socios  (ajusta la URL/puerto si es distinto)
        const res   = await axios.get(
          `http://localhost:5001/socio/${socioId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const socio = res.data;              // el endpoint devuelve un solo objeto
        // 3. Actualizar estado
        if (socio) {
          // elige el campo que mejor describa al socio (nombre_representante, nombre_osf, etc.)
          setSocioNombre(socio.nombre_osf || socio.nombre_representante || 'Socio');
        } else {
          setSocioNombre('Socio');
        }
      } catch (error) {
        console.error('Error al obtener el nombre del socio:', error);
      }
    };

    fetchSocio();
  }, []);

  /* ───────── Logout ───────── */
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  /* ───────── Render ───────── */
  return (
    <div className="layout">
      <nav className="nav-bar">
        <ul>
          <img src="./src/assets/logo_servicio.png" alt="Logo" className="logo servicio social" />
          <li><Link to="/inicioS">Inicio Socio</Link></li>
          <li><Link to="/postularProyectoS">Postular Proyecto</Link></li>
          <li><Link to="/nuestrosProyectosS">Nuestros proyectos</Link></li>
        </ul>
        <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
      </nav>

      <header className="top-bar">
        <div className="user-info">
          <span className="notifications">🔔</span>
          {/* Mostrar nombre o spinner mientras carga */}
          <span className="username">{socioNombre || 'Cargando...'}</span>
        </div>
      </header>
    </div>
  );
}

export default NavCub;
