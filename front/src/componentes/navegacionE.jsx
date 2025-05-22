import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './navegacion.css';

function NavCub() {
  const navigate = useNavigate();
  const [estudianteNombre, setEstudianteNombre] = useState('');

  useEffect(() => {
    const fetchEstudiante = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Decodificar token manualmente
        const payload = JSON.parse(atob(token.split('.')[1]));
        const estudianteId = payload.id; // 🔁 CORREGIDO

        const res = await axios.get('http://localhost:5004/estudiantes');
        const estudiante = res.data.find(e => Number(e.id_estudiante) === Number(estudianteId));

        if (estudiante) {
          setEstudianteNombre(estudiante.nombre);
        } else {
          setEstudianteNombre('Estudiante');
        }
      } catch (error) {
        console.error('Error al obtener el nombre del estudiante:', error);
      }
    };

    fetchEstudiante();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="nav-bar">
        <img src="./src/assets/logo_servicio.png" alt="Logo" className="logo servicio social" />
        <div className="nav-items">
        <ul>
          <li className="nav-inicio-e">
            <NavLink to="/inicioE" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Inicio
            </NavLink>
          </li>
          
          <li className="nav-visualizar-e">
            <NavLink to="/visualizarProyectos" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Proyectos Disponibles
            </NavLink>
          </li>
          
          <li className="nav-postulaciones-e">
            <NavLink to="/misPostulaciones" className={({ isActive }) => isActive ? 'active-link' : ''}>
              Mis Postulaciones
            </NavLink>
          </li>
        </ul>
        </div>
        <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
      </nav>

      <header className="top-bar">
        <div className="user-info">
          <img src="src/assets/iconoperfil.png" alt="Usuario" className="user-avatar" />
          <span className="username">{estudianteNombre || 'Cargando...'}</span>
        </div>
      </header>
    </div>
  );
}

export default NavCub;
