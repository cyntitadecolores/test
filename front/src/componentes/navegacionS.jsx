import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './navegacion.css';

function NavCub() {
  const navigate = useNavigate();
  const [socioNombre, setSocioNombre] = useState('');

  useEffect(() => {
    const fetchSocio = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const socioId = payload.id;

        const res = await axios.get(`http://localhost:5001/socio/${socioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const socio = res.data;
        setSocioNombre(socio.nombre_osf || socio.nombre_representante || 'Socio');
      } catch (error) {
        console.error('Error al obtener el nombre del socio:', error);
      }
    };

    fetchSocio();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="nav-bar">
        <img src="./src/assets/logo_servicio.png" alt="Logo" className="logo" />
        <div className="nav-items">
          <ul>
            <li className="nav-inicio">
              <NavLink to="/inicioS" className={({ isActive }) => isActive ? 'active-link' : ''}>
                Inicio
              </NavLink>
            </li>
            <li className="nav-dashboard">
              <NavLink to="/postularProyectoS" className={({ isActive }) => isActive ? 'active-link' : ''}>
                Postular Proyecto
              </NavLink>
            </li>
            <li className="nav-proyectos">
              <NavLink to="/nuestrosProyectosS" className={({ isActive }) => isActive ? 'active-link' : ''}>
                Nuestros Proyectos
              </NavLink>
            </li>
          </ul>
        </div>
        <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
      </nav>

      <header className="top-bar">
        <div className="user-info">
          <img src="src/assets/iconoperfil.png" alt="Usuario" className="user-avatar" />
          <span className="username">{socioNombre || 'Cargando...'}</span>
        </div>
      </header>
    </div>
  );
}

export default NavCub;
