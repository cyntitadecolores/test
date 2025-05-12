import React from 'react';
import NavCub from '../componentes/navegacionE';

function VisualizarProyectos() {
  const proyectos = [
    { id: 1, nombre: 'Voces del cambio', img: 'https://via.placeholder.com/150', hrs: 60, status: 'confirmado', modalidad: 'presencial'},
    { id: 2, nombre: 'Topos FC', img: 'https://via.placeholder.com/150', hrs: 120, status:'rechazado', modalidad: 'en linea'},
    { id: 3, nombre: 'Inglés para todos', img: 'https://via.placeholder.com/150', hrs: 200, status:'confirmado', modalidad: 'mixto'},
    { id: 4, nombre: 'EmpowerShe', img: 'https://via.placeholder.com/150', hrs: 60, status:'confirmado', modalidad: 'presencial'},
  ];

  const proyectosConfirmados = proyectos.filter(proyecto => proyecto.status === 'confirmado');

  return (
    <div className="cube">
      <NavCub />
      <div className="contenedor-principal">
        <div>
        <div className="contenido-centro">
        <h1>Catálogo de Proyectos</h1>
        <div className="grid-proyectos">
          {proyectosConfirmados.map(proyecto => (
            <div key={proyecto.id} className="tarjeta-proyecto">
              <img src={proyecto.img} alt={proyecto.nombre} className="imagen-proyecto" />
              <h3 className="nombre-proyecto">{proyecto.nombre}</h3>
              <p className="hrs-proyecto">{proyecto.hrs} horas</p>
              <p className="modalidad-proyecto">{proyecto.modalidad}</p>
              <button className="boton-info">Información</button>
            </div>
          ))}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default VisualizarProyectos;