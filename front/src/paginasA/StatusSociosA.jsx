import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import './PaginasA.css';

function StatusSocios() {
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);

  useEffect(() => {
    // Obtener socios en estado "En revisión"
    axios.get('http://localhost:5003/socio/pendiente')
      .then(response => setSocios(response.data))
      .catch(error => console.error('Error al obtener socios:', error));
  }, []);

  // Cambiar el estado de un socio
  const cambiarStatus = (id, nuevoStatus) => {
    axios.put(`http://localhost:5003/socio/${id}/status`, { status: nuevoStatus })
      .then(() => {
        alert('Status actualizado');
        window.location.reload();
      })
      .catch(error => console.error('Error al actualizar status:', error));
  };

  // Obtener más detalles de un socio al hacer clic en "Ver más"
  const handleVerMas = (id) => {
    console.log("ID del socio:", id);
    axios.get(`http://localhost:5003/socio/${id}`)
      .then(response => {
        setSocioSeleccionado(response.data);
        console.log("Socio seleccionado:", response.data);
      })
      .catch(error => console.error('Error al obtener info del socio:', error));
  };

  // Cerrar el modal de detalles
  const cerrarInfo = () => setSocioSeleccionado(null);

  // Asignar clase CSS según el estado
  const badgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'aprobado': return 'badge aprobado';
      case 'aceptado': return 'badge aceptado';
      case 'en revisión': return 'badge en-proceso';
      case 'rechazado':
      case 'no aceptado': return 'badge rechazado';
      default: return 'badge pendiente';
    }
  };

  return (
    <div className="cube">
      <NavCub />
      <h1>Socios pendientes</h1>

      {/* Tabla de socios */}
      {!socioSeleccionado && (
        <table className="socios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Cambiar Estado</th>
              <th>Ver más</th>
            </tr>
          </thead>
          <tbody>
            {socios.map((socio, index) => (
              <tr key={socio.id_socio}>
                <td>000{index + 1}</td>
                <td>{socio.nombre_osf}</td>
                <td>{socio.correo}</td>
                <td><span className={badgeClass(socio.status)}>{socio.status}</span></td>
                <td>
                  <select onChange={(e) => cambiarStatus(socio.id_socio, e.target.value)} defaultValue="">
                    <option value="" disabled>Selecciona</option>
                    <option value="aceptado">Aceptado</option>
                    <option value="no aceptado">No Aceptado</option>
                  </select>
                </td>
                <td>
                  <button className="ver-mas-link" onClick={() => handleVerMas(socio.id_socio)}>Ver más</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal con detalles del socio */}
      {socioSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalles del Socio</h2>

            <p><strong>Nombre:</strong> {socioSeleccionado.nombre_osf}</p>
            <p><strong>Correo:</strong> {socioSeleccionado.correo}</p>
            <p><strong>Teléfono:</strong> {socioSeleccionado.telefono_osf}</p>
            <p><strong>Redes Sociales:</strong> {socioSeleccionado.redes_sociales}</p>
            <p><strong>Status:</strong> <span className={badgeClass(socioSeleccionado.status)}>{socioSeleccionado.status}</span></p>
            <p><strong>Tipo de Socio:</strong> <span className="badge aprobado">{socioSeleccionado.tipo_socio}</span></p>
            <p><strong>Visión:</strong> {socioSeleccionado.vision}</p>
            <p><strong>Misión:</strong> {socioSeleccionado.mision}</p>
            <p><strong>Objetivos:</strong> {socioSeleccionado.objetivos}</p>
            <p><strong>Población:</strong> {socioSeleccionado.poblacion_osf}</p>
            <p><strong>Número de Beneficiarios:</strong> {socioSeleccionado.num_beneficiarios_osf}</p>
            <p><strong>Nombre del Representante:</strong> {socioSeleccionado.nombre_representante}</p>
            <p><strong>Puesto del Representante:</strong> {socioSeleccionado.puesto_representante}</p>
            <p><strong>Dirección y Horario:</strong> {socioSeleccionado.direccion_horario}</p>
            <p><strong>Notificaciones:</strong> {socioSeleccionado.notificaciones ? 'Sí' : 'No'}</p>
            <p><strong>Nota:</strong> {socioSeleccionado.nota || 'N/A'}</p>

            {socioSeleccionado.tipo_socio === 'Estudiante' && socioSeleccionado.detalles && (
              <div className="detalle-estudiante">
                <h3>Información del Estudiante</h3>
                <p><strong>Nombre:</strong> {socioSeleccionado.detalles.nombre_socio}</p>
                <p><strong>Matrícula:</strong> {socioSeleccionado.detalles.matricula}</p>
                <p><strong>Semestre Acreditado:</strong> {socioSeleccionado.detalles.semestre_acreditado}</p>
                <p><strong>INE:</strong> {socioSeleccionado.detalles.ine}</p>
                <p><strong>ID Carrera:</strong> {socioSeleccionado.detalles.id_carrera}</p>
              </div>
            )}

            <button className="cerrar-btn" onClick={cerrarInfo}>Cerrar socio</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusSocios;

