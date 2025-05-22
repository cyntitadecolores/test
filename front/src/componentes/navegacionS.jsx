import React from 'react';
import { NavLink } from 'react-router-dom';
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
        <img src="./src/assets/logo_servicio.png" alt="Logo" className="logo servicio social" />
        <div className="nav-items">
        <ul>
          <li className="nav-inicio-s">
            <NavLink to="/inicioS" className={({ isActive }) => isActive ? 'active-link' : ''}>Inicio</NavLink>
          </li>
          
          <li className="nav-postular-s">
            <NavLink to="/postularProyectoS" className={({ isActive }) => isActive ? 'active-link' : ''}>Postular Proyecto</NavLink>
          </li>
          
          <li className="nav-proyectos-s">
            <NavLink to="/nuestrosProyectosS" className={({ isActive }) => isActive ? 'active-link' : ''}>Nuestros Proyectos</NavLink>
          </li>
        </ul>
        </div>
        <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
      </nav>
      <header className="top-bar">
        <div className="user-info">
          <img src="src/assets/iconoperfil.png" alt="Usuario" className="user-avatar" />
          <span className="username">Alejandra Ramírez</span>
        </div>
      </header>
    </div>
  );
}

export default NavCub;
