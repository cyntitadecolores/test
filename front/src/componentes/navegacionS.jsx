import React from 'react';
import { Link } from 'react-router-dom';
import './navegacion.css';
import { useNavigate } from 'react-router-dom';


function NavCub() {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };  

  return (
    <div className="layout">
      <nav className="nav-bar">
        <ul>
          <img src="./src/assets/logo_servicio.png" alt="Logo" className="logo servicio social" />
          <li><Link to="/inicioS">Inicio Socio</Link></li>
          <li><Link to="/postularProyectoS">Postular Proyecto</Link></li>
          <li><Link to="/nuestrosProyectosS">Nuetros proyectos</Link></li>
        </ul>
        <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
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
