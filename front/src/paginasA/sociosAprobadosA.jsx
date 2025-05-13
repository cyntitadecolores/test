import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import "./PaginasA.css";

function SociosAprobados() {
  const [socios, setSocios] = useState([]);
  const [filteredText, setFilteredText] = useState('');
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5003/socioaceptados')
      .then(response => setSocios(response.data))
      .catch(error => console.error('Error al obtener socios:', error));
  }, []);

  const sociosFiltrados = socios.filter(socio =>
    Object.values(socio).some(valor =>
      valor && valor.toString().toLowerCase().includes(filteredText.toLowerCase())
    )
  );

  const handleVerMas = (id) => {
    axios.get(`http://localhost:5003/socio/${id}`)
      .then(response => {
        setSocioSeleccionado(response.data);
        console.log("Socio seleccionado:", response.data);
      })
      .catch(error => console.error('Error al obtener info del socio:', error));
  };

  const cerrarInfo = () => setSocioSeleccionado(null);

  return (
    <div className="cube">
      <NavCub />
      <h1 className="titulo">Socios que han sido aprobados</h1>

      {!socioSeleccionado && (
        <div className="tabla-container">
          <label>Buscar: </label>
          <input
            type="text"
            value={filteredText}
            onChange={(e) => setFilteredText(e.target.value)}
            placeholder="Buscar socio..."
          />
          <table className="tabla-proyectos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Tipo de Socio</th>
                <th>Ver más</th>
              </tr>
            </thead>
            <tbody>
              {sociosFiltrados.map((socio) => (
                <tr key={socio.id_socio}>
                  <td>{socio.nombre}</td>
                  <td>{socio.correo}</td>
                  <td><span className="badge aprobado">{socio.tipo_socio}</span></td>
                  <td>
                    <button className="ver-mas-link" onClick={() => handleVerMas(socio.id_socio)}>
                      Ver más
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {socioSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalles del Socio</h2>
            <p><strong>Nombre OSF:</strong> {socioSeleccionado.nombre_osf}</p>
            <p><strong>Correo:</strong> {socioSeleccionado.correo}</p>
            <p><strong>Teléfono:</strong> {socioSeleccionado.telefono_osf}</p>
            <p><strong>Tipo de Socio:</strong> <span className="badge aprobado">{socioSeleccionado.tipo_socio}</span></p>
            <p><strong>Redes Sociales:</strong> {socioSeleccionado.redes_sociales}</p>

            {socioSeleccionado.tipo_socio === 'Entidad' && socioSeleccionado.detalles && (
              <div className="detalle-entidad">
                <h3>Información de la Entidad</h3>
                <p><strong>Nombre Entidad:</strong> {socioSeleccionado.detalles.nombre_entidad}</p>
                <p><strong>Misión:</strong> {socioSeleccionado.detalles.mision}</p>
                <p><strong>Visión:</strong> {socioSeleccionado.detalles.vision}</p>
                <p><strong>Objetivos:</strong> {socioSeleccionado.detalles.objetivos}</p>
                <p><strong>ODS:</strong> {socioSeleccionado.detalles.objetivo_ods_socio}</p>
                <p><strong>Población:</strong> {socioSeleccionado.detalles.poblacion}</p>
                <p><strong>Número de Beneficiarios:</strong> {socioSeleccionado.detalles.numero_beneficiarios_socio}</p>
                <p><strong>Responsable:</strong> {socioSeleccionado.detalles.nombre_responsable} ({socioSeleccionado.detalles.puesto_responsable})</p>
                <p><strong>Correo Responsable:</strong> {socioSeleccionado.detalles.correo_responsable}</p>
              </div>
            )}

            {socioSeleccionado.tipo_socio === 'Estudiante' && socioSeleccionado.detalles && (
              <div className="detalle-estudiante">
                <h3>Información del Estudiante</h3>
                <p><strong>Nombre:</strong> {socioSeleccionado.detalles.nombre_socio}</p>
                <p><strong>Matrícula:</strong> {socioSeleccionado.detalles.matricula}</p>
                <p><strong>Semestre Acreditado:</strong> {socioSeleccionado.detalles.semestre_acreditado}</p>
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

export default SociosAprobados;
