import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        <ul>
          <img src="./src/assets/logo_servicio.png" alt="Logo" className="logo servicio social" />
          <li><Link to="/inicioE">Inicio Estudiante</Link></li>
          <li><Link to="/visualizarProyectos">Visualizar Proyectos</Link></li>
          <li><Link to="/misPostulaciones">Mis Postulaciones</Link></li>
          <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
        </ul>
      </nav>

      <header className="top-bar">
        <div className="user-info">
          <span className="notifications">🔔</span>
          <span className="username">{estudianteNombre || 'Cargando...'}</span>
        </div>
      </header>
    </div>
  );
}

export default NavCub;
