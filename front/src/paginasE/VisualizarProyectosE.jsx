import React, { useEffect, useState } from 'react';
import NavCub from '../componentes/navegacionE';

function VisualizarProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5004/proyectos')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener proyectos');
        return res.json();
      })
      .then(data => setProyectos(data))
      .catch(err => setError(err.message));
  }, []);


  return (
    <div className="cube">
      <NavCub />
      <div className="contenedor-principal">
        <div>
          <div className="contenido-centro">
            <h1>Catálogo de Proyectos</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="grid-proyectos">
              {proyectos.length === 0 && <p>No hay proyectos disponibles.</p>}
              {proyectos.map(proyecto => (
                <div key={proyecto.id_proyecto} className="tarjeta-proyecto">
                  <img 
                    src={proyecto.imagen || 'https://via.placeholder.com/150'} 
                    alt={proyecto.nombre} 
                    className="imagen-proyecto" 
                  />
                  <h3 className="nombre-proyecto">{proyecto.nombre}</h3>
                  <p className="hrs-proyecto">{proyecto.horas || 'N/A'} horas</p>
                  <p className="modalidad-proyecto">{proyecto.modalidad || 'N/A'}</p>
                  <p className="status-proyecto">Status: {proyecto.status_proyecto}</p>
                  <p className="nombre-socio">Socio: {proyecto.nombre_socio}</p>
                  <p className="nombre-campus">Campus: {proyecto.nombre_campus}</p>
                  <p className="nombre-ods">ODS: {proyecto.nombre_ods}</p>
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
