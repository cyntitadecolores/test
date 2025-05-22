import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ModalPostulacion from './ModalPostulacion';
import styles from './InicioSo.module.css';
import NavCub from '../componentes/navegacionS';

function InicioSo() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const navigate = useNavigate();
  const [inscritos,setInscritos] = useState([]);

  const token = localStorage.getItem('jwt');

  const getIdSocio = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("ID socio extraído del token:", decoded.id || decoded.id_socio || decoded.userId);
        return decoded.id || decoded.id_socio || decoded.userId;
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
      }
    }
    return null;
  };
  

  // Obtener las postulaciones
  useEffect(() => {
    const controller = new AbortController();
    const fetchPostulaciones = async () => {
      const id_socio = getIdSocio();
      if (!id_socio) return setError('No se encontró tu sesión. Inicia de nuevo.');
  
      try {
        const resp = await fetch(`http://localhost:5001/proyecto/${id_socio}/postulados`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        const data = await resp.json();
        console.log('Datos de postulaciones:', data); // Verifica los datos aquí
        resp.ok ? setPostulaciones(data) : setError(data.message || 'Error al cargar postulaciones');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError('Error de red');
        }
      }
    };
    const fetchInscritos = async () => {
      const id = getIdSocio();
      if (!id) return;

      const r = await fetch(
        `http://localhost:5001/proyecto/${id}/inscritos`,
        { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
      );
      const d = await r.json();
      r.ok ? setInscritos(d) : console.error(d);
    };
  
    fetchPostulaciones();
    fetchInscritos();
    
  }, [token]);
  

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  // Abre el modal con la información de la postulación
  const handleRespuestaClick = (postulacion) => {
    setModalData({
      ...postulacion.alumnos_postulados[0], // los datos del estudiante
      id_proyecto: postulacion.id_proyecto  // Añadir id_proyecto
    }); 
  };
  
  // Aceptar estudiante
  const handleAccept = async (id_proyecto, id_estudiante) => {
    try {
      console.log("id_proyecto:", id_proyecto, "id_estudiante:", id_estudiante);  // Verifica si los valores están bien
      const resp = await fetch(
        `http://localhost:5001/postulacion/${id_proyecto}/${id_estudiante}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          },
          body: JSON.stringify({ status: 'aceptado' })
        }
      );
      const data = await resp.json();
      if (!resp.ok) return alert(data.message || 'Error al aceptar');

      // Actualizar estado local
      setPostulaciones(prev =>
        prev
          .map(p =>
            p.id_proyecto === id_proyecto
              ? { ...p, alumnos_postulados: p.alumnos_postulados.filter(est => est.id_estudiante !== id_estudiante) }
              : p
          )
          .filter(p => p.alumnos_postulados.length) // Elimina proyectos vacíos
      );
      alert('Estudiante aceptado');
      setModalData(null); // Cierra el modal después de aceptar
    } catch (err) {
      console.error(err);
      alert('Error de red');
    }
  };

  // Rechazar estudiante
  const handleReject = async (id_proyecto, id_estudiante) => {
    try {
      const resp = await fetch(
        `http://localhost:5001/postulacion/${id_proyecto}/${id_estudiante}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          },
          body: JSON.stringify({ status: 'no aceptado' })
        }
      );
      const data = await resp.json();
      if (!resp.ok) return alert(data.message || 'Error al rechazar');

      // Actualizar estado local
      setPostulaciones(prev =>
        prev
          .map(p =>
            p.id_proyecto === id_proyecto
              ? { ...p, alumnos_postulados: p.alumnos_postulados.filter(est => est.id_estudiante !== id_estudiante) }
              : p
          )
          .filter(p => p.alumnos_postulados.length) // Elimina proyectos vacíos
      );
      alert('Estudiante no aceptado');
      setModalData(null); // Cierra el mo dal
    } catch (err) {
      console.error(err);
      alert('Error de red');
    }
  };

  return (
    <div className={styles.cube}>
      <NavCub onLogout={handleLogout} />
      <h1>Personas Postuladas</h1>
      {postulaciones.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Carrera</th>
              <th>Fecha</th>
              <th>Respuestas</th>
            </tr>
          </thead>
          <tbody>
            {postulaciones.map((postulacion) => (
              postulacion.alumnos_postulados.map((est) => (
                <tr key={est.id_estudiante}>
                  <td>{postulacion.nombre_proyecto}</td>
                  <td>{est.estudiante_nombre}</td>
                  <td>{est.estudiante_correo}</td>
                  <td>{est.estudiante_carrera}</td>
                  <td>{new Date(est.fecha_postulacion_estudiante).toLocaleDateString('es-MX')}</td>
                  <td>
                    <button
                      onClick={() => handleRespuestaClick(postulacion)}
                      className={styles.respuestaButton}
                    >
                      Respuesta
                    </button>
                  </td>
                </tr>
              ))
            ))}
          </tbody>

        </table>
      ) : (
        <p>No tienes proyectos con estudiantes postulados.</p>
      )}

      <h2>Alumnos aceptados / inscritos</h2>
{inscritos.length ? (
  <table className={styles.table}>
    <thead>
      <tr>
        <th>Proyecto</th>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Carrera</th>
        <th>Fecha</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {inscritos.map(p =>
        p.alumnos.map(al => (
          <tr key={al.id_estudiante}>
            <td>{p.nombre_proyecto}</td>
            <td>{al.estudiante_nombre}</td>
            <td>{al.estudiante_correo}</td>
            <td>{al.estudiante_carrera}</td>
            <td>{new Date(al.fecha_postulacion_estudiante).toLocaleDateString('es-MX')}</td>
            <td>{al.status}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
) : (
  <p>Aún no tienes alumnos aceptados o inscritos.</p>
)}

      {/* Mostrar el modal si hay datos seleccionados */}
      {modalData && (
      <ModalPostulacion 
        data={modalData} 
        onClose={() => setModalData(null)} 
        onAccept={handleAccept} 
        onReject={handleReject}
      />
    )}

    </div>
  );
}

export default InicioSo;

