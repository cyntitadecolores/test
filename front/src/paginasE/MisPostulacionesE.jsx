import React from 'react';
import NavCub from '../componentes/navegacionE';

const datos = [
  {
    id: '00001',
    nombre: 'Voces del cambio',
    direccion: '089 Kutch Green Apt. 448',
    fecha: '14 Feb 2019',
    horas: '60 Hrs',
    estado: 'Aceptado',
  },
  {
    id: '00002',
    nombre: 'Topos FC',
    direccion: '979 Immanuel Ferry Suite 526',
    fecha: '14 Feb 2019',
    horas: '120 Hrs',
    estado: 'En proceso',
  },
  {
    id: '00003',
    nombre: 'Inglés para todos',
    direccion: '8587 Frida Ports',
    fecha: '14 Feb 2019',
    horas: '60 Hrs',
    estado: 'Rechazado',
  },
];

function MisPostulaciones() {
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
        <div>
        <div className="contenido-centro">
          <h1>Mis Postulaciones</h1>
          <table className="tabla-postulaciones">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Fecha</th>
                <th>Horas de ss</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>{item.direccion}</td>
                  <td>{item.fecha}</td>
                  <td>{item.horas}</td>
                  <td>
                    <span className={obtenerClaseEstado(item.estado)}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}

export default MisPostulaciones;