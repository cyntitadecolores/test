import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacionE';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./PaginasE.css";


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
        toast.success(error.response.data.message);
      } else {
        console.error('Error al actualizar el status:', error);
      }
    });
  };

  const empalmes = {
  1: [1, 4, 6],
  2: [2, 4, 5, 6],
  3: [3, 5, 6],
  4: [1, 2, 4, 6, 5],
  5: [2, 3, 4, 6, 6],
  6: [1, 2, 3, 4, 5, 6],
};

// Revisa si un proyecto se empalma con uno inscrito
const seEmpalmaConInscrito = (idPeriodoActual) => {
  const periodosInscritos = datos
    .filter(p => p.status === 'Inscrito')
    .map(p => p.id_periodo);

  return periodosInscritos.some(pIns => empalmes[idPeriodoActual]?.includes(pIns));
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
    <div className="main">
      <NavCub />
          <h1 className="titulo">Mis Postulaciones</h1>
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
    seEmpalmaConInscrito(item.id_periodo) ? (
      <>
        <button
          className="rechazar"
          onClick={() => actualizarStatus(item.id_proyecto, 'Alumno declinó participación')}
        >
          Declinar participación
        </button>
        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          No puedes aceptar porque se empalma con otro proyecto en el que ya estás inscrito.
        </div>
      </>
    ) : (
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
    )
  ) : (
    '—'
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  );
}

export default MisPostulaciones;
