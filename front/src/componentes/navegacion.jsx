import React from 'react';
import { Link } from 'react-router-dom';
import './navegacion.css';

function NavCub() {
  return (
    <div className="layout">
      <nav className="nav-bar">
        <ul>
          <img src="./src/assets/logo_servicio.png" alt="Logo" className="logo servicio social" />
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/dashBoardA">DashBoard</Link></li>
          <li><Link to="/proyectosPosA">Proyectso Pos</Link></li>
          <li><Link to="/alumnosPosA">Alumnos Pos</Link></li>
          <li><Link to="/sociosAprobadosA">Socios</Link></li>
          <li><Link to="/proyectosAprobadosA">Proyectos</Link></li>
        </ul>
      </nav>
      <header className="top-bar">
        <div className="user-info">
          <span className="notifications">🔔</span>
          <span className="username">Alejandra Ramírez</span>
        </div>
      </header>
    </div>
  );
}

export default NavCub;
