import React, { useEffect, useState } from 'react';
import NavCub from '../componentes/navegacionE';

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
      <th>Estado</th>
      <th>Expectativa</th>
      <th>Razon</th>
      <th>Motivo</th>
      <th>Descarte</th>
      <th>Nota</th>
    </tr>
  </thead>
  <tbody>
    {datos.map((item, index) => (
      <tr key={index}>
        <td>{item.nombre_proyecto}</td>
        <td>{item.direccion}</td>
        <td>{item.fecha_postulacion}</td>
        <td>{item.status}</td>
        <td>{item.expectativa}</td>
        <td>{item.razon}</td>
        <td>{item.motivo}</td>
        <td>{item.pregunta_descarte}</td>
        <td>{item.Nota}</td>
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
