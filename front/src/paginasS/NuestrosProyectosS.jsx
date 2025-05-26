import React, { useState, useCallback } from "react";
import NavCub from "../componentes/navegacionS";
import styles from "./NuestrosProyectosS.module.css";
import ModalProyecto from "./ModalProyecto";
import { jwtDecode } from "jwt-decode";

/******************************
 * Helpers y hooks reutilizables
 ******************************/

// 1) Extraer id_socio desde el JWT almacenado
function useSocioId() {
  const token = localStorage.getItem("jwt") || localStorage.getItem("token");
  if (!token) return null;
  try {
    const d = jwtDecode(token);
    return d.id || d.id_socio || d.userId || null;
  } catch (e) {
    console.error("Error al decodificar JWT", e);
    return null;
  }
}

// 2) Hook para cargar proyectos filtrados
function useProjects(initialFilter = "todos") {
  const id_socio = useSocioId();
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchProjects = useCallback(async (filter) => {
    if (!id_socio) {
      setError("No se pudo obtener el ID del socio.");
      return;
    }
    try {
      const resp = await fetch(
        `http://localhost:5001/proyectos/${id_socio}?status=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Error al cargar proyectos");
      setProyectos(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error de red");
    }
  }, [id_socio, token]);

  // Primera carga + cada vez que statusFilter cambie
  React.useEffect(() => {
    fetchProjects(statusFilter);
  }, [statusFilter, fetchProjects]);

  return {
    proyectos,
    error,
    statusFilter,
    setStatusFilter,
  };
}

/******************************
 * Componentes presentacionales
 ******************************/

const FilterSelect = ({ value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="todos">Todos</option>
    <option value="Aprobado">Aprobados</option>
    <option value="No aprobado">No aprobados</option>
    <option value="En revisión">En revisión</option>
  </select>
);

const ProyectoCard = React.memo(({ proyecto, onClick }) => (
  <div className={styles.proyectoCard} onClick={onClick}>
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
));

/******************************
 * Componente principal         
 ******************************/

export default function NuestrosProyectosS() {
  const {
    proyectos,
    error,
    statusFilter,
    setStatusFilter,
  } = useProjects();

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  // Handlers (nombres originales)
  const handleFilterChange = useCallback((f) => setStatusFilter(f), []);
  const handleCardClick = useCallback((p) => setProyectoSeleccionado(p), []);
  const handleCloseModal = useCallback(() => setProyectoSeleccionado(null), []);

  return (
    <div className="cube">
      <NavCub />
      <h1>Nuestros proyectos</h1>

      {error && <p>{error}</p>}

      <FilterSelect value={statusFilter} onChange={handleFilterChange} />

      <div className={styles.proyectosContainer}>
        {proyectos.length ? (
          proyectos.map((p) => (
            <ProyectoCard
              key={p.id_proyecto}
              proyecto={p}
              onClick={() => handleCardClick(p)}
            />
          ))
        ) : (
          <p>No tienes proyectos registrados.</p>
        )}
      </div>

      {proyectoSeleccionado && (
        <ModalProyecto proyecto={proyectoSeleccionado} onClose={handleCloseModal} />
      )}
    </div>
  );
}