import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import { Link } from "react-router-dom";
import './PaginasA.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StatusSocios() {
  //socios que se muestran y socio con detalles
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);

  useEffect(() => {
    //Obtener socios en estado "En revisión"
    axios.get('http://localhost:5003/socio/pendiente')
   .then(response => setSocios(response.data))
    .catch(error => console.error('Error al obtener socios:', error));
  }, []);

  // Cambiar el estado de un socio
  const cambiarStatusConConfirmacion = (id, nuevoStatus) => {
  const toastId = toast(
    ({ closeToast }) => (
      <div>
        <p>¿Estás seguro que quieres cambiar el estado a <strong>{nuevoStatus}</strong>?</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              cambiarStatus(id, nuevoStatus);
            }}
            style={{ marginRight: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
          >
            Aceptar
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    ),
    { autoClose: false }
  );
};

const cambiarStatus = (id, nuevoStatus) => {
  axios.put(`http://localhost:5003/socio/${id}/status`, { status: nuevoStatus })
    .then(() => {
      toast.success('Estado actualizado');
      setTimeout(() => window.location.reload(), 1000); // Espera antes de recargar
    })
    .catch(error => {
      console.error('Error al actualizar status:', error);
      toast.error('Hubo un error al actualizar el estado');
    });
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

  // Cerrar el modal de detalles con null al set
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
    <div className="main">
      <NavCub />
      <Link to="/" className="back-btn">← Volver</Link>
      <h1 className="nontitle">Socios pendientes</h1>
      {/* Mapeo de socio que se muestran */}
      {!socioSeleccionado && (
        <table className="socios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Cambiar Estado</th>
              <th></th>
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
                  <select
  onChange={(e) => {
    const nuevoStatus = e.target.value;
    cambiarStatusConConfirmacion(socio.id_socio, nuevoStatus);
  }}
  defaultValue=""
>


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

      {/* Modal de vista ver mas */}
      {socioSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="nontitle">Detalles del Socio</h2>

            {socioSeleccionado.tipo_socio === 'Estudiante' && socioSeleccionado.detalles && (
              <div className="detalle-estudiante">
                <h3>Información del Estudiante</h3>
                <p><strong>Correo:</strong> {socioSeleccionado.correo}</p>
                <p><strong>Teléfono:</strong> {socioSeleccionado.telefono_osf}</p>
                <p><strong>Status:</strong> <span className={badgeClass(socioSeleccionado.status)}>{socioSeleccionado.status}</span></p>
                <p><strong>Tipo de Socio:</strong> <span>{socioSeleccionado.tipo_socio}</span></p>
                <p><strong>Nombre:</strong> {socioSeleccionado.detalles.nombre_socio}</p>
                <p><strong>Matrícula:</strong> {socioSeleccionado.detalles.matricula}</p>
                <p><strong>Semestre Acreditado:</strong> {socioSeleccionado.detalles.semestre_acreditado}</p>
                <p><strong>INE:</strong> {socioSeleccionado.detalles.ine}</p>
                <p><strong>ID Carrera:</strong> {socioSeleccionado.detalles.id_carrera}</p>
              </div>
            )}

            {socioSeleccionado.tipo_socio === 'Entidad' && socioSeleccionado.detalles && (
              <div className="detalle-estudiante">
                <h3>Información de la entidad</h3>
                <p><strong>Nombre:</strong> {socioSeleccionado.nombre_osf}</p>
            <p><strong>Correo:</strong> {socioSeleccionado.correo}</p>
            <p><strong>Teléfono:</strong> {socioSeleccionado.telefono_osf}</p>
            <p><strong>Redes Sociales:</strong> {socioSeleccionado.redes_sociales}</p>
            <p><strong>Status:</strong> <span className={badgeClass(socioSeleccionado.status)}>{socioSeleccionado.status}</span></p>
            <p><strong>Tipo de Socio:</strong> <span>{socioSeleccionado.tipo_socio}</span></p>
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
              </div>
            )}

            <button className="cerrar-btn" onClick={cerrarInfo}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusSocios;

