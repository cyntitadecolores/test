import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import "./PaginasA.css";

function ProyectosAprobados() {
  const [proyectos, setProyectos] = useState([]);
  const [filteredText, setFilteredText] = useState('');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [mostrarTablaPostulaciones, setMostrarTablaPostulaciones] = useState(false);


  useEffect(() => {
    axios.get('http://localhost:5001/proyectos/aprobados')
      .then(response => setProyectos(response.data))
      .catch(error => console.error('Error al obtener proyectos:', error));
  }, []);

  const proyectosFiltrados = proyectos.filter(proyecto =>
    Object.values(proyecto).some(valor =>
      valor && valor.toString().toLowerCase().includes(filteredText.toLowerCase())
    )
  );

  const handleVerMas = (id) => {
  axios.get(`http://localhost:5001/proyectoss/${id}`)
    .then(response => {
      setProyectoSeleccionado(response.data); // ✅ ahora es un objeto, no un array
      console.log("Proyecto seleccionado:", response.data);
    })
    .catch(error => console.error('Error al obtener info del proyecto:', error));
};

const handleVerPostulaciones = (id_proyecto) => {
  axios.get(`http://localhost:5001/proyectos/${id_proyecto}/postulaciones`)
    .then(response => {
      setPostulaciones(response.data);
      setMostrarTablaPostulaciones(true);
    })
    .catch(error => console.error('Error al obtener postulaciones:', error));
};


  const cerrarInfo = () => setProyectoSeleccionado(null);

  return (
    <div className="cube">
      <NavCub />
      <h1 className="titulo">Proyectos que han sido aceptados</h1>

      {!proyectoSeleccionado && (
        <div className="tabla-container">
          <label>Buscar: </label>
          <input
            type="text"
            value={filteredText}
            onChange={(e) => setFilteredText(e.target.value)}
            placeholder="Texto de demostración"
          />
          <table className="tabla-proyectos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Clave</th>
                <th>Periodo</th>
                <th>Postulación</th>
                <th>Ver más</th>
              </tr>
            </thead>
            <tbody>
              {proyectosFiltrados.map((proyecto) => (
                <tr key={proyecto.id_proyecto}>
                  <td>{proyecto.nombre_proyecto}</td>
                  <td>{proyecto.crn}</td>
                  <td>{proyecto.clave_materia}</td>
                  <td>{proyecto.periodo}</td>
                  <td>
  {proyecto.estado_postulacion === 'Disponible' ? (
    <span
      className="disponible-link"
      onClick={() => handleVerPostulaciones(proyecto.id_proyecto)}
      style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
    >
      Disponible ({proyecto.postulaciones_activas}/{proyecto.cupo_maximo})
    </span>
  ) : 'Lleno'}
</td>

                  <td>
                    <button className="ver-mas-link" onClick={() => handleVerMas(proyecto.id_proyecto)}>
                      Ver más
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {proyectoSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalles del Proyecto</h2>
            <p><strong>ID:</strong> {proyectoSeleccionado.id_proyecto}</p>
            <p><strong>Nombre:</strong> {proyectoSeleccionado.nombre_proyecto}</p>
            <p><strong>Clave:</strong> {proyectoSeleccionado.clave_materia}</p>
            <p><strong>Periodo:</strong> {proyectoSeleccionado.id_periodo}</p>
            <button className="cerrar-btn" onClick={cerrarInfo}>Cerrar proyecto</button>
          </div>
        </div>
      )}

      {mostrarTablaPostulaciones && (
  <div className="tabla-container">
     <h2>Postulaciones del Proyecto</h2>
      <p><strong>Proyecto:</strong> {mostrarTablaPostulaciones.nombre_proyecto}</p>
    <table className="tabla-proyectos">
      <thead>
        <tr>
          <th>ID Estudiante</th>
          <th>Nombre Estudiante</th>
          <th>Fecha Postulación</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {postulaciones.map((post) => (
          <tr key={post.id_estudiante}>
            <td>{post.id_estudiante}</td>
            <td>{post.nombre_estudiante}</td>
            <td>{new Date(post.fecha_postulacion_estudiante).toLocaleDateString()}</td>
            <td>{post.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <button className="cerrar-btn" onClick={() => setMostrarTablaPostulaciones(false)}>Cerrar tabla</button>
  </div>
)}

    </div>
  );
}

export default ProyectosAprobados;
