import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import './PaginasA.css';

function StatusSocios() {
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5003/socio/pendiente')
      .then(response => setSocios(response.data))
      .catch(error => console.error('Error al obtener socios:', error));
  }, []);

  const cambiarStatus = (id, nuevoStatus) => {
    axios.put(`http://localhost:5003/socio/${id}/status`, { status: nuevoStatus })
      .then(() => {
        alert('Status actualizado');
        window.location.reload();
      })
      .catch(error => console.error('Error al actualizar status:', error));
  };

  const handleVerMas = (id) => {
    axios.get(`http://localhost:5003/socio/${id}`)
      .then(response => {
        setSocioSeleccionado(response.data);
        console.log("Socio seleccionado:", response.data);
      })
      .catch(error => console.error('Error al obtener info del socio:', error));
  };

  const cerrarInfo = () => setSocioSeleccionado(null);

  const badgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'aprobado': return 'badge aprobado';
      case 'aceptado': return 'badge aceptado';
      case 'en proceso': return 'badge en-proceso';
      case 'rechazado':
      case 'no aceptado': return 'badge rechazado';
      default: return 'badge pendiente';
    }
  };

  return (
    <div className="cube">
      <NavCub />
      <h1>Socios pendientes</h1>

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
                <td>{socio.nombre}</td>
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

      {socioSeleccionado && (
  <div className="modal">
    <div className="modal-content">
      <h2>Detalles del Socio</h2>

      {/* Información general de la tabla Socio */}
      <p><strong>Nombre:</strong> {socioSeleccionado.nombre}</p>
      <p><strong>Correo:</strong> {socioSeleccionado.correo}</p>
      <p><strong>Teléfono:</strong> {socioSeleccionado.telefono_socio}</p>
      <p><strong>Redes Sociales:</strong> {socioSeleccionado.redes_sociales}</p>
      <p><strong>Status:</strong> <span className={badgeClass(socioSeleccionado.status)}>{socioSeleccionado.status}</span></p>
      <p><strong>Tipo de Socio:</strong> <span className="badge aprobado">{socioSeleccionado.tipo_socio}</span></p>

      {/* Detalles si es Entidad */}
      {socioSeleccionado.tipo_socio === 'Entidad' && socioSeleccionado.detalles && (
        <div className="detalle-entidad">
          <h3>Información de la Entidad</h3>
          <p><strong>Nombre de la Entidad:</strong> {socioSeleccionado.detalles.nombre_entidad}</p>
          <p><strong>Misión:</strong> {socioSeleccionado.detalles.mision}</p>
          <p><strong>Visión:</strong> {socioSeleccionado.detalles.vision}</p>
          <p><strong>Objetivos:</strong> {socioSeleccionado.detalles.objetivos}</p>
          <p><strong>Población:</strong> {socioSeleccionado.detalles.poblacion}</p>
          <p><strong>Número de Beneficiarios:</strong> {socioSeleccionado.detalles.numero_beneficiarios_socio}</p>
          <p><strong>Responsable:</strong> {socioSeleccionado.detalles.nombre_responsable} ({socioSeleccionado.detalles.puesto_responsable})</p>
          <p><strong>Correo del Responsable:</strong> {socioSeleccionado.detalles.correo_responsable}</p>
          <p><strong>Dirección:</strong> {socioSeleccionado.detalles.direccion_entidad}</p>
          <p><strong>Horario:</strong> {socioSeleccionado.detalles.horario_entidad}</p>
          <p><strong>Teléfono:</strong> {socioSeleccionado.detalles.telefono_entidad}</p>
        </div>
      )}

      {/* Detalles si es Estudiante */}
      {socioSeleccionado.tipo_socio === 'Estudiante' && socioSeleccionado.detalles && (
        <div className="detalle-estudiante">
          <h3>Información del Estudiante</h3>
          <p><strong>Matrícula:</strong> {socioSeleccionado.detalles.matricula}</p>
          <p><strong>Semestre Acreditado:</strong> {socioSeleccionado.detalles.semestre_acreditado}</p>
          <p><strong>Correo Institucional:</strong> {socioSeleccionado.detalles.correo_institucional}</p>
          <p><strong>Correo Alternativo:</strong> {socioSeleccionado.detalles.correo_alternativo}</p>
          <p><strong>INE:</strong> {socioSeleccionado.detalles.ine}</p>
          {socioSeleccionado.detalles.logo && (
            <img
              src={`ruta/del/logo/${socioSeleccionado.detalles.logo}`}
              alt="Logo estudiante"
              style={{ maxWidth: "100px" }}
            />
          )}
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
