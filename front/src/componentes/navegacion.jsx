import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        <ul>
          <img src="./src/assets/logo_servicio.png" alt="Logo" className="logo servicio social" />
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/dashBoardA">DashBoard</Link></li>
          <li><Link to="/proyectosPosA">Proyectos Pos</Link></li>
          <li><Link to="/alumnosPosA">Alumnos Pos</Link></li>
          <li><Link to="/sociosAprobadosA">Socios</Link></li>
          <li><Link to="/proyectosAprobadosA">Proyectos</Link></li>
          <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
        </ul>
      </nav>
      <header className="top-bar">
        <div className="user-info">
          <span className="notifications">🔔</span>
          <span className="username">{adminNombre || 'Cargando...'}</span>
        </div>
      </header>
    </div>
  );
}

export default NavCub;
