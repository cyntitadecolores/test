import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacionE';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function MisPostulaciones() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    

    fetch('http://localhost:5004/postulaciones', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener postulaciones");
        return res.json();
      })
      .then(data => setDatos(data))
      .catch(err => console.error(err));
  }, []);

  const actualizarStatus = (idProyecto, nuevoStatus) => {
    const token = localStorage.getItem('token');

    axios.put(`http://localhost:5004/postulaciones_alumnos/${idProyecto}/status`, {
      status: nuevoStatus
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        setDatos(prev =>
          prev.map(post =>
            post.id_proyecto === idProyecto ? { ...post, status: nuevoStatus } : post
          )
        );
      })
      .catch(error => {
      if (error.response && error.response.status === 400) {
        // Aquí mostramos el mensaje del backend
        toast.error(error.response.data.message);
      } else {
        console.error('Error al actualizar el status:', error);
      }
    });
  };

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case 'Aceptado':
        return 'estado aceptado';
      case 'En proceso':
        return 'estado proceso';
      case 'Rechazado':
        return 'estado rechazado';
      default:
        return 'estado';
    }
  };

  return (
    <div className="cube">
      <NavCub />
      <div className="contenedor-principal">
        <div className="contenido-centro">
          <h1>Mis Postulaciones</h1>
          <table className="tabla-postulaciones">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Dirección</th>
                <th>Fecha</th>
                <th>Expectativa</th>
                <th>Razon</th>
                <th>Motivo</th>
                <th>Descarte</th>
                <th>Nota</th>
                <th>Estado</th>
                <th>Aceptar?</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre_proyecto}</td>
                  <td>{item.direccion_escrita}</td>
                  <td>{item.fecha_postulacion}</td>
                  <td>{item.expectativa}</td>
                  <td>{item.razon}</td>
                  <td>{item.motivo}</td>
                  <td>{item.pregunta_descarte}</td>
                  <td>{item.Nota}</td>
                  <td className={obtenerClaseEstado(item.status)}>{item.status}</td>
                  <td>
                    {item.status === 'Aceptadx' ? (
                      <>
                        <button
                          className="aprobar"
                          onClick={() => actualizarStatus(item.id_proyecto, 'Inscrito')}
                        >
                          Aceptar participación
                        </button>
                        <button
                          className="rechazar"
                          onClick={() => actualizarStatus(item.id_proyecto, 'Alumno declinó participación')}
                          style={{ marginLeft: '8px' }}
                        >
                          Declinar participación
                        </button>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MisPostulaciones;
