import React, { useState, useEffect } from 'react';
import NavCub from '../componentes/navegacionS';
import styles from './NuestrosProyectosS.module.css';
import { jwtDecode } from 'jwt-decode';
import ModalProyecto from './ModalProyecto';


function NuestrosProyectosS() {
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null); // Para almacenar el proyecto seleccionado
  const [statusFilter, setStatusFilter] = useState('todos'); // Para almacenar el filtro de status

  // Obtener el ID del socio del localStorage
  const getIdSocio = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.id;
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
      }
    }
    return null;
  };

  // Cargar los proyectos cuando el componente se monta
  useEffect(() => {
    const fetchProyectos = async () => {
      const id_socio = getIdSocio();  // Obtén el id del socio

      if (!id_socio) {
        setError("No se pudo obtener el ID del socio.");
        return;
      }

      try {
        const token = localStorage.getItem('token');
const response = await fetch(`http://localhost:5001/proyectos/${id_socio}?status=${statusFilter}`, {
  headers: {
    'Authorization': `Bearer ${token}`, // <-- Aquí se envía correctamente
  },
});
        
        const data = await response.json();

        if (response.ok) {
          setProyectos(data); // Establece los proyectos en el estado
        } else {
          setError(data.message || "Error al cargar los proyectos");
        }
      } catch (error) {
        console.error("Error al obtener los proyectos:", error);
        setError("Error de red");
      }
    };

    fetchProyectos();
  }, [statusFilter]);  // Ejecutar cada vez que cambie el filtro

  const handleCardClick = (proyecto) => {
    setProyectoSeleccionado(proyecto); // Establece el proyecto seleccionado
  };

  const handleCloseModal = () => {
    setProyectoSeleccionado(null); // Cierra el modal
  };

  // Cambiar el filtro de status
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  return (
    <div className="cube">
      <NavCub />
      <h1>Nuestros proyectos</h1>

      {error && <p>{error}</p>}

      {/* Filtro por status */}
      <select onChange={handleFilterChange} value={statusFilter}>
        <option value="todos">Todos</option>
        <option value="pendiente">Pendientes</option>
        <option value="aceptado">Aceptados</option>
      </select>

      <div className={styles.proyectosContainer}>
        {proyectos.length > 0 ? (
          proyectos.map((proyecto) => (
            <div
              key={proyecto.id_proyecto}
              className={styles.proyectoCard}
              onClick={() => handleCardClick(proyecto)}  // Abre el modal al hacer clic en la card
            >
              {proyecto.img_proyecto && (
                <img
                  src={`http://localhost:5001${proyecto.img_proyecto}`}
                  alt={proyecto.nombre_proyecto}
                  className={styles.proyectoImage}
                />
              )}
              <h2>{proyecto.nombre_proyecto}</h2>
              <p>{proyecto.descripcion}</p>
              <p>Modalidad: {proyecto.modalidad}</p>
              <p>Status: {proyecto.status_proyecto}</p>
            </div>
          ))
        ) : (
          <p>No tienes proyectos registrados.</p>
        )}
      </div>

      {proyectoSeleccionado && (
        <ModalProyecto
          proyecto={proyectoSeleccionado}
          onClose={handleCloseModal}  // Cierra el modal
        />
      )}
    </div>
  );
}

export default NuestrosProyectosS;
