import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './navegacion.css';

function NavCub() {
  const navigate = useNavigate();
  const [adminNombre, setAdminNombre] = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const adminId = payload.id;

        const res = await axios.get('http://localhost:5003/administradores');
        const admin = res.data.find(a => a.id_administrador === adminId);
        if (admin) {
          setAdminNombre(admin.nombre);
        } else {
          setAdminNombre('Administrador');
        }
      } catch (error) {
        console.error('Error al obtener el nombre del administrador:', error);
      }
    };

    fetchAdmin();
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
            <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>Inicio</NavLink>
          </li>
          <li className="nav-dashboard">
            <NavLink to="/dashBoardA" className={({ isActive }) => isActive ? 'active-link' : ''}>Dashboard</NavLink>
          </li>
          <li className="nav-proyectos">
            <NavLink to="/proyectosPosA" className={({ isActive }) => isActive ? 'active-link' : ''}>Proyectos Postulados</NavLink>
          </li>
          <li className="nav-alumnos">
            <NavLink to="/alumnosPosA" className={({ isActive }) => isActive ? 'active-link' : ''}>Alumnos Postulados</NavLink>
          </li>
          <li className="nav-socios">
            <NavLink to="/sociosAprobadosA" className={({ isActive }) => isActive ? 'active-link' : ''}>Socios</NavLink>
          </li>
          <li className="nav-aprobados">
            <NavLink to="/proyectosAprobadosA" className={({ isActive }) => isActive ? 'active-link' : ''}>Proyectos Aceptados</NavLink>
          </li>
        </ul>
        </div>
        <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
      </nav>

      <header className="top-bar">
        <div className="user-info">
          <img src="src/assets/iconoperfil.png" alt="Usuario" className="user-avatar" />
          <span className="username">{adminNombre || 'Cargando...'}</span>
        </div>
      </header>
    </div>
  );
}

export default NavCub;