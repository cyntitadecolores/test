import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacionE';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./PaginasE.css";


function VisualizarProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [mostrarRequiere, setMostrarRequiere] = useState(false);
  const [mostrarMasInfo, setMostrarMasInfo] = useState(false);
  const [mostrarPostularme, setMostrarPostularme] = useState(false);

const [expectativa, setExpectativa] = useState('');
const [razon, setRazon] = useState('');
const [motivo, setMotivo] = useState('');
const [preguntaDescarte, setPreguntaDescarte] = useState('');
const [nota, setNota] = useState('');
const [idProyectoPostulacion, setIdProyectoPostulacion] = useState(null);
const [errores, setErrores] = useState([]);
const [postulaciones, setPostulaciones] = useState([]);



const handleSubmitPostulacion = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  const campos = {
    expectativa, razon, motivo, preguntaDescarte, nota
  };

  const erroresLocales = [];
  const caracteresProhibidos = /[<>{}$%]/;

  for (const [nombre, valor] of Object.entries(campos)) {
    if (!valor || valor.trim().length < 50) {
      erroresLocales.push(`El campo "${nombre}" debe tener al menos 50 caracteres.`);
    }
    if (valor.trim().length > 500) {
      erroresLocales.push(`El campo "${nombre}" no debe exceder los 500 caracteres.`);
    }
    if (caracteresProhibidos.test(valor)) {
      erroresLocales.push(`El campo "${nombre}" contiene caracteres no permitidos.`);
    }
  }

  if (erroresLocales.length > 0) {
    setErrores(erroresLocales);
    return;
  }

  setErrores([]); // limpia errores antes del fetch

  try {
    const response = await fetch('http://localhost:5004/postular', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        id_proyecto: idProyectoPostulacion,
        expectativa,
        razon,
        motivo,
        preguntaDescarte,
        nota
      })
    });

    const result = await response.json();
    if (response.ok) {

      toast.success('Postulación registrada con éxito');
      setMostrarPostularme(false);
    } else {
      // puede incluir errores del backend
      if (result.errores) {
        setErrores(result.errores);
      } else {
        toast.error('Error: ' + result.mensaje);
      }
    }
  } catch (error) {
    console.error('Error al postularme:', error);
    toast.error('Error al postularme');
  }
};

  
  const requiere = () => {
  setMostrarRequiere(true);
  setMostrarMasInfo(false); // oculta la otra sección si está abierta
};

const masinfo = () => {
  setMostrarMasInfo(true);
  setMostrarRequiere(false); // oculta la otra sección si está abierta
};



  useEffect(() => {
    fetch('http://localhost:5004/proyectos')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener proyectos');
        return res.json();
      })
      .then(data => setProyectos(data))
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
  const token = localStorage.getItem('token');

  fetch('http://localhost:5004/mis-postulaciones', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => setPostulaciones(data))
    .catch(err => console.error('Error al obtener postulaciones:', err));
}, []);


const tieneEmpalmeInscrito = (periodoNuevo) => {
  const empalmes = {
    1: [1,4,6],
    2: [2,4,5,6],
    3: [3,5,6],
    4: [1,2,4,6,5],
    5: [2,3,4,6,6],
    6: [1,2,3,4,5,6],
  };

  const postulacionesInscritas = postulaciones.filter(p => p.status === 'Inscrito');

  return postulacionesInscritas.some(p => empalmes[periodoNuevo]?.includes(p.id_periodo));
};

  const handleInformacion = (id) => {
    axios.get(`http://localhost:5003/proyectoss/${id}`)
      .then(response => {
        setProyectoSeleccionado(response.data);
        console.log("Proyecto seleccionado:", response.data);
      })
      .catch(error => console.error('Error al obtener info del proyecto:', error));
  };

  const postularme = async () => {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:5004/postular', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id_proyecto: proyectoSeleccionado.id_proyecto })
    });

    const result = await response.json();
    if (response.ok) {
      toast.success('Postulación registrada con éxito');
    } else {
      toast.error('Error: ' + result.mensaje);
    }
  } catch (error) {
    console.error('Error al postularme:', error);
    toast.error('Error al postularme');
  }
};

const handleClickPostularme = () => {
  if (tieneEmpalmeInscrito(proyectoSeleccionado.id_periodo)) {
    toast.error('Ya estás inscrito en un proyecto con periodo que se empalma.');
    return;
  }

  setIdProyectoPostulacion(proyectoSeleccionado.id_proyecto);
  setMostrarPostularme(true);
  setProyectoSeleccionado(null);
  setMostrarMasInfo(false);
  setMostrarRequiere(false);
};


  const cerrarInfo = () => {
    setProyectoSeleccionado(null);
  };

  return (
    <div className="main">
      <NavCub />
      <h1 className="titulo">Catálogo de Proyectos</h1>

      {!proyectoSeleccionado && (
        <div >
          <table >
            <thead>
              <tr>
                <th>Nombre</th>
                <th>CRN</th>
                <th>Grupo</th>
                <th>Clave Materia</th>
                <th>Modalidad</th>
                <th>Perido </th>
                <th>Campus </th>
                <th>Objetivo </th>
                <th>Duracion </th>

              </tr>
            </thead>
            <tbody>
              {proyectos.length === 0 ? (
                <tr><td >No hay proyectos disponibles.</td></tr>
              ) : (
                proyectos.map(proyecto => (
                  <tr
  key={proyecto.id_proyecto}
  style={{
    backgroundColor: postulaciones.some(p => p.id_proyecto === proyecto.id_proyecto) ? '#cdeccb' : 'transparent'
  }}
>
                    <td>
  {proyecto.nombre_proyecto}
  {postulaciones.some(p => p.id_proyecto === proyecto.id_proyecto) && (
    <span style={{ marginLeft: '8px', color: 'green', fontWeight: 'bold' }}>
      (Postulado)
    </span>
  )}
</td>

                    <td>{proyecto.crn}</td>
                    <td>{proyecto.grupo}</td>
                    <td>{proyecto.clave_materia}</td>
                    <td>{proyecto.modalidad}</td>
                    <td>{proyecto.horas}</td>
                    <td>{proyecto.campus}</td>
                    <td>{proyecto.objetivo_proyecto}</td>
                    <td>{proyecto.duracion_experiencia}</td>
                    <td>
                      <button 
                        className="boton-info" 
                        onClick={() => handleInformacion(proyecto.id_proyecto)}
                      >
                        Información
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {proyectoSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalles del Proyecto</h2>
            <p><strong>Nombre:</strong> {proyectoSeleccionado.nombre_proyecto}</p>
            <p><strong>Periodo:</strong> {proyectoSeleccionado.id_periodo}</p>
            <p><strong>Modalidad:</strong> {proyectoSeleccionado.modalidad}</p>
            <p><strong>Socio:</strong> {proyectoSeleccionado.nombre_osf}</p>
            <p><strong>Poblacion:</strong> {proyectoSeleccionado.poblacion_osf}</p> 
            <p><strong>Problematica:</strong> {proyectoSeleccionado.problema_social}</p>
            <p><strong>Razon:</strong> {proyectoSeleccionado.razon_osf}</p>
            <button className="cerrar-btn" onClick={requiere}>Que se espera de mi?</button>
            <button className="cerrar-btn" onClick={masinfo}>Saber aun mas..</button>
            <button className="cerrar-btn" onClick={handleClickPostularme}>
  Postularme
</button>


            <button className="cerrar-btn" onClick={cerrarInfo}>Cerrar</button>

            {mostrarRequiere && (
        <div className="info-extra">
          <h3>¿Qué se espera de mí?</h3>
          <p><strong>Se ocupa diagnostico?:</strong>{proyectoSeleccionado.diagnostico_previo || 'No hay información disponible.'}</p>
          <p><strong>Acciones:</strong>{proyectoSeleccionado.acciones_estudiantado || 'No hay información disponible.'}</p>
          <p><strong>Producto entrega:</strong>{proyectoSeleccionado.producto_servicio_entregar || 'No hay información disponible.'}</p>
          <p><strong>Entregable:</strong>{proyectoSeleccionado.entregable_esperado || 'No hay información disponible.'}</p>
          <p><strong>Dias:</strong>{proyectoSeleccionado.dias_actividades || 'No hay información disponible.'}</p>
          <p><strong>Horario:</strong>{proyectoSeleccionado.horario_proyecto || 'No hay información disponible.'}</p>
          <p><strong>Habilidades:</strong>{proyectoSeleccionado.habilidades_alumno || 'No hay información disponible.'}</p>
          <p><strong>Problema:</strong>{proyectoSeleccionado.problema_social || 'No hay información disponible.'}</p>

        </div>
      )}

      {mostrarMasInfo && (
        <div className="info-extra">
          <h3>Más información</h3>
          <p><strong>Num beneficiarios:</strong>{proyectoSeleccionado.num_beneficiarios_osf || 'No hay detalles adicionales.'}</p>
          <p><strong>ODS osf:</strong>{proyectoSeleccionado.ods_osf || 'No hay detalles adicionales.'}</p>
          <p><strong>Telefono:</strong>{proyectoSeleccionado.telefono_osf || 'No hay detalles adicionales.'}</p>
          <p><strong>Datos:</strong>{proyectoSeleccionado.datos_osf || 'No hay detalles adicionales.'}</p>
          <p><strong>Redes sociales:</strong>{proyectoSeleccionado.redes_sociales || 'No hay detalles adicionales.'}</p>
          <p><strong>Vulnerabilidad 1:</strong>{proyectoSeleccionado.vulnerabilidad_atendida_1 || 'No hay detalles adicionales.'}</p>
          <p><strong>Edad pobla 1:</strong>{proyectoSeleccionado.edad_poblacion_1 || 'No hay detalles adicionales.'}</p>
          <p><strong>Vulnerabilidad 1::</strong>{proyectoSeleccionado.vulnerabilidad_atendida_2 || 'No hay detalles adicionales.'}</p>
          <p><strong>Edad pobla 1::</strong>{proyectoSeleccionado.edad_poblacion_2 || 'No hay detalles adicionales.'}</p>
          <p><strong>ODS 1:</strong>{proyectoSeleccionado.ods_proyecto_1 || 'No hay detalles adicionales.'}</p>
          <p><strong>ODS 2:</strong>{proyectoSeleccionado.ods_proyecto_2 || 'No hay detalles adicionales.'}</p>
          <p><strong>Direccion:</strong>{proyectoSeleccionado.direccion_escrita || 'No hay detalles adicionales.'}</p>
        </div>
      )}
          </div>
        </div>
      )}
       {mostrarPostularme && (
  <div className="info-extra formulario-postulacion">
    <h3 className="nontitle">Formulario de Postulación</h3>

    {errores.length > 0 && (
      <div>
        <strong>Errores encontrados:</strong>
        <ul style={{ marginTop: '10px' }}>
          {errores.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ul>
      </div>
    )}

    <div>
      <div>
        <label>Expectativa:</label>
        <textarea 
        className="campo-textarea"
          value={expectativa}
          onChange={e => setExpectativa(e.target.value)}
          required 
        />
      </div>
      <div>
        <label>Razón:</label>
        <textarea 
        className="campo-textarea"
          value={razon}
          onChange={e => setRazon(e.target.value)}
          required 
        />
      </div>
      <div>
        <label>Motivo:</label>
        <textarea 
        className="campo-textarea"
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          required 
        />
      </div>
      <div>
        <label>Pregunta de descarte:</label>
        <textarea 
        className="campo-textarea"
          value={preguntaDescarte}
          onChange={e => setPreguntaDescarte(e.target.value)}
        />
      </div>
      <div>
        <label>Nota:</label>
        <textarea 
        className="campo-textarea"
          value={nota}
          onChange={e => setNota(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
        <button onClick={handleSubmitPostulacion} >Enviar Postulación</button>
        <button onClick={() => setMostrarPostularme(false)}>Cancelar</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default VisualizarProyectos;